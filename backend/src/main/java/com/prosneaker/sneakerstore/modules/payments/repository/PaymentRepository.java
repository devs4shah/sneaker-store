package com.prosneaker.sneakerstore.modules.payments.repository;

import com.prosneaker.sneakerstore.modules.payments.entity.Payment;
import com.prosneaker.sneakerstore.modules.payments.entity.PaymentRecordStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findTopByOrderIdAndPaymentStatusOrderByCreatedAtDesc(UUID orderId, PaymentRecordStatus paymentStatus);

    boolean existsByOrderIdAndPaymentStatus(UUID orderId, PaymentRecordStatus paymentStatus);
}
