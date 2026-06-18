package com.cvmaker.repository;

import com.cvmaker.entity.CvProfile;
import com.cvmaker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CvRepository extends JpaRepository<CvProfile, Long> {
    List<CvProfile> findByUserAndDeletedFalseOrderByUpdatedAtDesc(User user);
    Optional<CvProfile> findByIdAndUserAndDeletedFalse(Long id, User user);
}
