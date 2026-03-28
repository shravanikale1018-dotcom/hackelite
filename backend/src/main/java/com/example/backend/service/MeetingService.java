package com.example.backend.service;

import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Meeting;
import com.example.backend.repository.MeetingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MeetingService {

    private static final Logger logger = LoggerFactory.getLogger(MeetingService.class);

    private final MeetingRepository meetingRepository;

    public MeetingService(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    public Meeting createMeeting(Meeting meeting) {
        logger.info("Creating new meeting with title: {}", meeting.getTitle());

        // Check if meeting with same ID already exists
        if (meetingRepository.existsById(meeting.getId())) {
            throw new IllegalArgumentException("Meeting with ID " + meeting.getId() + " already exists");
        }

        Meeting savedMeeting = meetingRepository.save(meeting);
        logger.info("Meeting created successfully with ID: {}", savedMeeting.getId());
        return savedMeeting;
    }

    @Transactional(readOnly = true)
    public List<Meeting> getAllMeetings() {
        logger.debug("Fetching all meetings");
        List<Meeting> meetings = meetingRepository.findAll();
        logger.info("Found {} meetings", meetings.size());
        return meetings;
    }

    @Transactional(readOnly = true)
    public Meeting getMeetingById(String id) {
        logger.debug("Fetching meeting with ID: {}", id);
        return meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting", id));
    }

    @Transactional(readOnly = true)
    public List<Meeting> getMeetingsByCreatedBy(String createdBy) {
        logger.debug("Fetching meetings created by: {}", createdBy);
        List<Meeting> meetings = meetingRepository.findByCreatedBy(createdBy);
        logger.info("Found {} meetings created by {}", meetings.size(), createdBy);
        return meetings;
    }

    public Meeting updateMeeting(Meeting meeting) {
        logger.info("Updating meeting with ID: {}", meeting.getId());

        if (!meetingRepository.existsById(meeting.getId())) {
            throw new ResourceNotFoundException("Meeting", meeting.getId());
        }

        Meeting updatedMeeting = meetingRepository.save(meeting);
        logger.info("Meeting updated successfully with ID: {}", updatedMeeting.getId());
        return updatedMeeting;
    }

    public void deleteMeeting(String id) {
        logger.info("Deleting meeting with ID: {}", id);

        if (!meetingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Meeting", id);
        }

        meetingRepository.deleteById(id);
        logger.info("Meeting deleted successfully with ID: {}", id);
    }

    @Transactional(readOnly = true)
    public boolean existsById(String id) {
        return meetingRepository.existsById(id);
    }
}