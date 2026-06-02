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
}
