ALTER TABLE cv.cv_experience ADD COLUMN bullet_points JSONB;

CREATE TABLE cv.cv_strengths (
    id         BIGSERIAL PRIMARY KEY,
    cv_id      BIGINT NOT NULL REFERENCES cv.cv_profiles(id) ON DELETE CASCADE,
    name       VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);
