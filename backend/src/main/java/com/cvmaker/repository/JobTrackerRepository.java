package com.cvmaker.repository;

import com.cvmaker.entity.JobTracker;
import com.cvmaker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JobTrackerRepository extends JpaRepository<JobTracker, Long> {
    Optional<JobTracker> findByUser(User user);
}
