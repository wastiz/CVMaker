package com.cvmaker.exception;

public class CoverLetterNotFoundException extends RuntimeException {
    public CoverLetterNotFoundException(Long id) {
        super("Cover letter with id " + id + " not found");
    }
}
