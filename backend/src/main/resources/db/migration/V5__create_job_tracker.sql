CREATE TABLE cv.job_tracker (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL UNIQUE REFERENCES cv.users(id) ON DELETE CASCADE,
    applied    INT NOT NULL DEFAULT 0,
    rejections INT NOT NULL DEFAULT 0,
    interviews INT NOT NULL DEFAULT 0,
    offers     INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
