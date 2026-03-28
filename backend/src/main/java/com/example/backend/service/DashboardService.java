package com.example.backend.service;

import com.example.backend.repository.MeetingRepository;
import com.example.backend.repository.TaskRepository;
import com.example.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private static final Logger logger = LoggerFactory.getLogger(DashboardService.class);

    private final TaskRepository taskRepository;
    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;

    public DashboardService(TaskRepository taskRepository,
                           MeetingRepository meetingRepository,
                           UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.meetingRepository = meetingRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Long> getDashboardData() {
        logger.debug("Generating dashboard data");

        Map<String, Long> data = new HashMap<>();

        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.findByStatus("Completed").size();
        long pendingTasks = taskRepository.findByStatus("Pending").size();
        long totalMeetings = meetingRepository.count();
        long totalUsers = userRepository.count();

        data.put("totalTasks", totalTasks);
        data.put("completedTasks", completedTasks);
        data.put("pendingTasks", pendingTasks);
        data.put("totalMeetings", totalMeetings);
        data.put("totalUsers", totalUsers);

        logger.info("Dashboard data generated: {} tasks, {} meetings, {} users",
                   totalTasks, totalMeetings, totalUsers);

        return data;
    }

    public Map<String, Object> getDashboardStats() {
        logger.debug("Generating detailed dashboard statistics");

        Map<String, Object> stats = new HashMap<>();

        // Task statistics
        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.findByStatus("Completed").size();
        long pendingTasks = taskRepository.findByStatus("Pending").size();

        // Meeting statistics
        long totalMeetings = meetingRepository.count();

        // User statistics
        long totalUsers = userRepository.count();

        // Calculate percentages
        double completionRate = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0;
        double pendingRate = totalTasks > 0 ? (double) pendingTasks / totalTasks * 100 : 0;

        stats.put("taskStats", Map.of(
            "total", totalTasks,
            "completed", completedTasks,
            "pending", pendingTasks,
            "completionRate", Math.round(completionRate * 100.0) / 100.0,
            "pendingRate", Math.round(pendingRate * 100.0) / 100.0
        ));

        stats.put("meetingStats", Map.of(
            "total", totalMeetings
        ));

        stats.put("userStats", Map.of(
            "total", totalUsers
        ));

        stats.put("systemHealth", Map.of(
            "status", "healthy",
            "database", "connected",
            "timestamp", java.time.LocalDateTime.now()
        ));

        logger.info("Detailed dashboard statistics generated");

        return stats;
    }
}