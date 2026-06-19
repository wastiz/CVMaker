package com.cvmaker.repository;

import com.cvmaker.entity.CvProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CvRepository extends JpaRepository<CvProfile, Long> {

    List<CvProfile> findAllByUserIdAndDeletedFalseOrderByUpdatedAtDesc(Long userId);

    Optional<CvProfile> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);

    Optional<CvProfile> findByIdAndUserId(Long id, Long userId);
}
