ALTER TABLE cv.cv_profiles
    ADD COLUMN font_family VARCHAR(50) NOT NULL DEFAULT 'inter',
    ADD COLUMN font_size_pt INT NOT NULL DEFAULT 10;
