CREATE SCHEMA IF NOT EXISTS cv;
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE cv.users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
