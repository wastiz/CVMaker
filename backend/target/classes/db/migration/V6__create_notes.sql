CREATE TABLE cv.notes (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES cv.users(id) ON DELETE CASCADE,
    type         VARCHAR(20) NOT NULL,
    title        VARCHAR(255),
    content      TEXT,
    url          VARCHAR(500),
    company_name VARCHAR(255),
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
