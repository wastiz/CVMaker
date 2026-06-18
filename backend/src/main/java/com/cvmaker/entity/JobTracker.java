package com.cvmaker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_tracker", schema = "cv")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobTracker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    private int applied = 0;

    @Builder.Default
    private int rejections = 0;

    @Builder.Default
    private int interviews = 0;

    @Builder.Default
    private int offers = 0;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
