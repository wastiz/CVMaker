package com.cvmaker.service;

import com.cvmaker.dto.response.JobTrackerResponse;
import com.cvmaker.entity.JobTracker;
import com.cvmaker.entity.TrackerAction;
import com.cvmaker.entity.TrackerField;
import com.cvmaker.exception.JobTrackerNotFoundException;
import com.cvmaker.repository.JobTrackerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class JobTrackerService {

    private final JobTrackerRepository trackerRepository;

    @Transactional(readOnly = true)
    public JobTrackerResponse getByUserId(Long userId) {
        return toResponse(findByUserId(userId));
    }

    @Transactional
    public JobTrackerResponse increment(Long userId, TrackerField field) {
        JobTracker tracker = findByUserId(userId);
        applyDelta(tracker, field, 1);
        trackerRepository.save(tracker);
        return toResponse(tracker);
    }

    @Transactional
    public JobTrackerResponse decrement(Long userId, TrackerField field) {
        JobTracker tracker = findByUserId(userId);
        applyDelta(tracker, field, -1);
        trackerRepository.save(tracker);
        return toResponse(tracker);
    }

    private void applyDelta(JobTracker tracker, TrackerField field, int delta) {
        switch (field) {
            case APPLIED     -> tracker.setApplied(Math.max(0, tracker.getApplied() + delta));
            case REJECTIONS  -> tracker.setRejections(Math.max(0, tracker.getRejections() + delta));
            case INTERVIEWS  -> tracker.setInterviews(Math.max(0, tracker.getInterviews() + delta));
            case OFFERS      -> tracker.setOffers(Math.max(0, tracker.getOffers() + delta));
        }
    }

    private JobTracker findByUserId(Long userId) {
        return trackerRepository.findByUserId(userId)
                .orElseThrow(() -> new JobTrackerNotFoundException(userId));
    }

    private JobTrackerResponse toResponse(JobTracker t) {
        return new JobTrackerResponse(t.getApplied(), t.getRejections(),
                t.getInterviews(), t.getOffers(), t.getUpdatedAt());
    }
}
