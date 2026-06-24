package com.cvmaker.exception;

public class CvNotFoundException extends RuntimeException {
    public CvNotFoundException(Long id) {
        super("CV with id " + id + " not found");
    }
}
