package com.example.backend.controller;

import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Meeting;
import com.example.backend.service.MeetingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/meetings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8084"})
public class MeetingController {

    private static final Logger logger = LoggerFactory.getLogger(MeetingController.class);

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping
    public ResponseEntity<Meeting> createMeeting(@Valid @RequestBody Meeting meeting) {
        logger.info("Received request to create meeting: {}", meeting.getTitle());
        Meeting createdMeeting = meetingService.createMeeting(meeting);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMeeting);
    }

    @GetMapping
    public ResponseEntity<List<Meeting>> getAllMeetings() {
        logger.debug("Received request to get all meetings");
        List<Meeting> meetings = meetingService.getAllMeetings();
        return ResponseEntity.ok(meetings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Meeting> getMeetingById(@PathVariable String id) {
        logger.debug("Received request to get meeting with ID: {}", id);
        Meeting meeting = meetingService.getMeetingById(id);
        return ResponseEntity.ok(meeting);
    }

    @GetMapping("/created-by/{createdBy}")
    public ResponseEntity<List<Meeting>> getMeetingsByCreatedBy(@PathVariable String createdBy) {
        logger.debug("Received request to get meetings created by: {}", createdBy);
        List<Meeting> meetings = meetingService.getMeetingsByCreatedBy(createdBy);
        return ResponseEntity.ok(meetings);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Meeting> updateMeeting(@PathVariable String id, @Valid @RequestBody Meeting meeting) {
        logger.info("Received request to update meeting with ID: {}", id);
        meeting.setId(id);
        Meeting updatedMeeting = meetingService.updateMeeting(meeting);
        return ResponseEntity.ok(updatedMeeting);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteMeeting(@PathVariable String id) {
        logger.info("Received request to delete meeting with ID: {}", id);
        meetingService.deleteMeeting(id);
        Map<String, String> response = Map.of("message", "Meeting deleted successfully", "id", id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/exists")
    public ResponseEntity<Map<String, Boolean>> checkMeetingExists(@PathVariable String id) {
        logger.debug("Checking if meeting exists with ID: {}", id);
        boolean exists = meetingService.existsById(id);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}