package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.service.DashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8084"})
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Long>>> getDashboard() {
        logger.debug("Fetching dashboard data");
        Map<String, Long> dashboardData = dashboardService.getDashboardData();
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved successfully", dashboardData));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        logger.debug("Fetching detailed dashboard statistics");
        Map<String, Object> stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved successfully", stats));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        logger.debug("Health check requested");
        return ResponseEntity.ok(ApiResponse.success("Service is healthy", "OK"));
    }
}