ALTER TABLE cv.cover_letters
    ADD COLUMN font_size   INTEGER      NOT NULL DEFAULT 14,
    ADD COLUMN font_family VARCHAR(100) NOT NULL DEFAULT 'Inter';
