package com.cvmaker.repository;

import com.cvmaker.entity.CoverLetter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CoverLetterRepository extends JpaRepository<CoverLetter, Long> {
    List<CoverLetter> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<CoverLetter> findByIdAndUserId(Long id, Long userId);
}
