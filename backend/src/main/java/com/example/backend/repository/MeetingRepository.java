package com.example.backend.repository;

import com.example.backend.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, String> {

    List<Meeting> findByCreatedBy(String createdBy);

    List<Meeting> findByTitleContainingIgnoreCase(String title);

    List<Meeting> findByDate(String date);

    @Query("SELECT m FROM Meeting m WHERE m.date >= :startDate AND m.date <= :endDate")
    List<Meeting> findByDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);

    @Query("SELECT m FROM Meeting m ORDER BY m.createdAt DESC")
    List<Meeting> findAllOrderByCreatedAtDesc();

    @Query("SELECT COUNT(m) FROM Meeting m WHERE m.createdBy = :createdBy")
    long countByCreatedBy(@Param("createdBy") String createdBy);

    boolean existsByTitleAndDate(String title, String date);
}