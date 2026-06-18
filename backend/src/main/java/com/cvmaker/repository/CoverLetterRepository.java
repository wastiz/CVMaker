package com.cvmaker.repository;

import com.cvmaker.entity.CoverLetter;
import com.cvmaker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CoverLetterRepository extends JpaRepository<CoverLetter, Long> {
    List<CoverLetter> findByUserOrderByUpdatedAtDesc(User user);
    Optional<CoverLetter> findByIdAndUser(Long id, User user);
}
