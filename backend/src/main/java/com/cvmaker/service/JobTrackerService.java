package com.cvmaker.service;

import com.cvmaker.dto.request.TrackerPatchRequest;
import com.cvmaker.dto.response.TrackerResponse;
import com.cvmaker.entity.JobTracker;
import com.cvmaker.entity.User;
import com.cvmaker.repository.JobTrackerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class JobTrackerService {

    private final JobTrackerRepository trackerRepository;

    public TrackerResponse getTracker(User user) {
        JobTracker tracker = findTracker(user);
        return toResponse(tracker);
    }

    @Transactional
    public TrackerResponse patch(User user, TrackerPatchRequest req) {
        JobTracker tracker = findTracker(user);

        switch (req.field()) {
            case "applied"     -> tracker.setApplied(Math.max(0, tracker.getApplied() + req.delta()));
            case "rejections"  -> tracker.setRejections(Math.max(0, tracker.getRejections() + req.delta()));
            case "interviews"  -> tracker.setInterviews(Math.max(0, tracker.getInterviews() + req.delta()));
            case "offers"      -> tracker.setOffers(Math.max(0, tracker.getOffers() + req.delta()));
            default            -> throw new IllegalArgumentException("Unknown field: " + req.field());
        }

        trackerRepository.save(tracker);
        return toResponse(tracker);
    }

    private JobTracker findTracker(User user) {
        return trackerRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("Tracker not found for user " + user.getId()));
    }

    private TrackerResponse toResponse(JobTracker t) {
        return new TrackerResponse(t.getId(), t.getApplied(), t.getRejections(),
                t.getInterviews(), t.getOffers(), t.getUpdatedAt());
    }
}
