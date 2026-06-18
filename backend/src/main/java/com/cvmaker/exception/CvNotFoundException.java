package com.cvmaker.exception;

public class CvNotFoundException extends RuntimeException {
    public CvNotFoundException(Long id) {
        super("CV not found: " + id);
    }
}
