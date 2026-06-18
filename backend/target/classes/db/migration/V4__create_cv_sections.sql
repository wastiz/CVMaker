CREATE TABLE cv.cv_skills (
    id         BIGSERIAL PRIMARY KEY,
    cv_id      BIGINT NOT NULL REFERENCES cv.cv_profiles(id) ON DELETE CASCADE,
    type       VARCHAR(20) NOT NULL,
    name       VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE cv.cv_languages (
    id         BIGSERIAL PRIMARY KEY,
    cv_id      BIGINT NOT NULL REFERENCES cv.cv_profiles(id) ON DELETE CASCADE,
    language   VARCHAR(100) NOT NULL,
    level      VARCHAR(50),
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE cv.cv_experience (
    id          BIGSERIAL PRIMARY KEY,
    cv_id       BIGINT NOT NULL REFERENCES cv.cv_profiles(id) ON DELETE CASCADE,
    company     VARCHAR(255) NOT NULL,
    position    VARCHAR(255) NOT NULL,
    location    VARCHAR(255),
    start_date  VARCHAR(50) NOT NULL,
    end_date    VARCHAR(50),
    is_current  BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    stack       JSONB,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE cv.cv_projects (
    id            BIGSERIAL PRIMARY KEY,
    cv_id         BIGINT NOT NULL REFERENCES cv.cv_profiles(id) ON DELETE CASCADE,
    name          VARCHAR(255) NOT NULL,
    url           VARCHAR(500),
    description   TEXT,
    bullet_points JSONB,
    stack         JSONB,
    sort_order    INT NOT NULL DEFAULT 0
);

CREATE TABLE cv.cv_education (
    id             BIGSERIAL PRIMARY KEY,
    cv_id          BIGINT NOT NULL REFERENCES cv.cv_profiles(id) ON DELETE CASCADE,
    institution    VARCHAR(255) NOT NULL,
    degree         VARCHAR(255),
    field_of_study VARCHAR(255),
    start_date     VARCHAR(50) NOT NULL,
    end_date       VARCHAR(50),
    is_current     BOOLEAN NOT NULL DEFAULT FALSE,
    description    TEXT,
    sort_order     INT NOT NULL DEFAULT 0
);

CREATE TABLE cv.cv_certificates (
    id         BIGSERIAL PRIMARY KEY,
    cv_id      BIGINT NOT NULL REFERENCES cv.cv_profiles(id) ON DELETE CASCADE,
    name       VARCHAR(255) NOT NULL,
    issuer     VARCHAR(255),
    issue_date VARCHAR(50),
    url        VARCHAR(500),
    sort_order INT NOT NULL DEFAULT 0
);
