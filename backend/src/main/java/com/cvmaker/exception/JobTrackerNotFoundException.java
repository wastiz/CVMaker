package com.cvmaker.exception;

public class JobTrackerNotFoundException extends RuntimeException {
    public JobTrackerNotFoundException(Long userId) {
        super("Job tracker not found for user " + userId);
    }
}
