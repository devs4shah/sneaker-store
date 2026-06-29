package com.prosneaker.sneakerstore.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Aligns legacy Hibernate {@code ddl-auto=update} columns with the current entity model.
 * Safe to run repeatedly (idempotent checks).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSchemaMigration {

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void migrate() {
        migrateOrdersTable();
        migrateOrderItemsTable();
        migrateOrderCouponsTable();
        migrateSneakerImagesTable();
    }

    private void migrateOrdersTable() {
        boolean hasStatus = columnExists("orders", "status");
        boolean hasOrderStatus = columnExists("orders", "order_status");

        if (hasStatus && hasOrderStatus) {
            jdbcTemplate.execute("""
                    UPDATE orders
                    SET order_status = status
                    WHERE order_status IS NULL AND status IS NOT NULL
                    """);
            jdbcTemplate.execute("ALTER TABLE orders DROP COLUMN status");
            log.info("Dropped legacy orders.status column (data merged into order_status)");
        } else if (hasStatus) {
            jdbcTemplate.execute("ALTER TABLE orders RENAME COLUMN status TO order_status");
            log.info("Renamed orders.status to order_status");
        }

        if (!columnExists("orders", "payment_status")) {
            jdbcTemplate.execute(
                    "ALTER TABLE orders ADD COLUMN payment_status VARCHAR(255) NOT NULL DEFAULT 'PENDING'");
            log.info("Added orders.payment_status column");
        }

        if (!columnExists("orders", "order_number")) {
            jdbcTemplate.execute(
                    "ALTER TABLE orders ADD COLUMN order_number VARCHAR(32)");
            log.info("Added orders.order_number column");
        }

        if (!columnExists("orders", "total_quantity")) {
            jdbcTemplate.execute(
                    "ALTER TABLE orders ADD COLUMN total_quantity INTEGER NOT NULL DEFAULT 0");
            log.info("Added orders.total_quantity column");
        }

        if (!columnExists("orders", "razorpay_order_id")) {
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(64)");
            log.info("Added orders.razorpay_order_id column");
        }

        if (!columnExists("orders", "razorpay_payment_id")) {
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN razorpay_payment_id VARCHAR(64)");
            log.info("Added orders.razorpay_payment_id column");
        }

        if (!columnExists("orders", "coupon_code")) {
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50)");
            log.info("Added orders.coupon_code column");
        }

        if (!columnExists("orders", "discount_amount")) {
            jdbcTemplate.execute(
                    "ALTER TABLE orders ADD COLUMN discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0");
            log.info("Added orders.discount_amount column");
        }

        if (!columnExists("orders", "final_amount")) {
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN final_amount NUMERIC(10, 2)");
            jdbcTemplate.execute("""
                    UPDATE orders
                    SET final_amount = total_amount
                    WHERE final_amount IS NULL
                    """);
            jdbcTemplate.execute("ALTER TABLE orders ALTER COLUMN final_amount SET NOT NULL");
            log.info("Added orders.final_amount column");
        }

        // Align old enum value to latest domain model.
        // Existing DB check constraint may still allow CONFIRMED but reject PROCESSING,
        // so temporarily drop/recreate it during migration.
        jdbcTemplate.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check");
        jdbcTemplate.execute("""
                UPDATE orders
                SET order_status = 'PROCESSING'
                WHERE order_status = 'CONFIRMED'
                """);
        jdbcTemplate.execute("""
                ALTER TABLE orders
                ADD CONSTRAINT orders_order_status_check
                CHECK (order_status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'))
                """);
    }

    private void migrateOrderItemsTable() {
        boolean hasUnitPrice = columnExists("order_items", "unit_price");
        boolean hasSneakerPrice = columnExists("order_items", "sneaker_price");

        if (hasUnitPrice && hasSneakerPrice) {
            jdbcTemplate.execute("""
                    UPDATE order_items
                    SET sneaker_price = unit_price
                    WHERE sneaker_price IS NULL AND unit_price IS NOT NULL
                    """);
            jdbcTemplate.execute("ALTER TABLE order_items DROP COLUMN unit_price");
            log.info("Dropped legacy order_items.unit_price column");
        } else if (hasUnitPrice) {
            jdbcTemplate.execute("ALTER TABLE order_items RENAME COLUMN unit_price TO sneaker_price");
            log.info("Renamed order_items.unit_price to sneaker_price");
        }

        dropColumnIfExists("order_items", "brand");
        dropColumnIfExists("order_items", "size_value");

        if (!columnExists("order_items", "image_url")) {
            jdbcTemplate.execute("ALTER TABLE order_items ADD COLUMN image_url VARCHAR(512)");
            log.info("Added order_items.image_url column");
        }
    }

    private void migrateOrderCouponsTable() {
        if (!tableExists("order_coupons")) {
            jdbcTemplate.execute("""
                    CREATE TABLE order_coupons (
                        id UUID PRIMARY KEY,
                        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                        coupon_code VARCHAR(50) NOT NULL,
                        discount_amount NUMERIC(10, 2) NOT NULL,
                        sort_order INTEGER NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                    )
                    """);
            log.info("Created order_coupons table");
        }

        if (columnExists("orders", "coupon_code")) {
            jdbcTemplate.execute("""
                    INSERT INTO order_coupons (id, order_id, coupon_code, discount_amount, sort_order, created_at, updated_at)
                    SELECT gen_random_uuid(), o.id, o.coupon_code, COALESCE(o.discount_amount, 0), 0, NOW(), NOW()
                    FROM orders o
                    WHERE o.coupon_code IS NOT NULL
                      AND NOT EXISTS (
                          SELECT 1 FROM order_coupons oc WHERE oc.order_id = o.id
                      )
                    """);
            log.info("Migrated legacy orders.coupon_code values into order_coupons");
        }
    }

    private void migrateSneakerImagesTable() {
        if (!columnExists("sneaker_images", "display_order")) {
            jdbcTemplate.execute(
                    "ALTER TABLE sneaker_images ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0");
            log.info("Added sneaker_images.display_order column");
        }

        jdbcTemplate.execute("""
                WITH ranked AS (
                    SELECT id,
                           ROW_NUMBER() OVER (PARTITION BY sneaker_id ORDER BY created_at, id) - 1 AS row_num
                    FROM sneaker_images
                )
                UPDATE sneaker_images si
                SET display_order = ranked.row_num
                FROM ranked
                WHERE si.id = ranked.id
                  AND EXISTS (
                      SELECT 1
                      FROM sneaker_images other
                      WHERE other.sneaker_id = si.sneaker_id
                        AND other.id <> si.id
                  )
                  AND si.display_order <> ranked.row_num
                """);
        log.info("Ensured sneaker_images.display_order matches legacy upload order");
    }

    private void dropColumnIfExists(String table, String column) {
        if (columnExists(table, column)) {
            jdbcTemplate.execute("ALTER TABLE " + table + " DROP COLUMN " + column);
            log.info("Dropped legacy {}.{} column", table, column);
        }
    }

    private boolean columnExists(String table, String column) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = ?
                  AND column_name = ?
                """, Integer.class, table, column);
        return count != null && count > 0;
    }

    private boolean tableExists(String table) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = ?
                """, Integer.class, table);
        return count != null && count > 0;
    }
}
