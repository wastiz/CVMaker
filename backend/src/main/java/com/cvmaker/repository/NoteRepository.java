package com.cvmaker.repository;

import com.cvmaker.entity.Note;
import com.cvmaker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserOrderByCreatedAtDesc(User user);
    Optional<Note> findByIdAndUser(Long id, User user);
}
