ALTER TABLE cv.cv_skills ADD COLUMN show_type BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE cv.cv_skills ADD CONSTRAINT cv_skills_type_check CHECK (
    type IN (
        'SOFT', 'MAIN', 'HARD', 'OTHER',
        'LANGUAGES', 'FRAMEWORKS', 'FRONTEND', 'BACKEND',
        'DATABASES', 'DEVOPS', 'CLOUD', 'TOOLS',
        'TESTING', 'ARCHITECTURE', 'METHODOLOGY'
    )
);
