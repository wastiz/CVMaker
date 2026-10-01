-- Custom skill types: `type` is no longer a closed enum. It holds either a
-- built-in key (e.g. 'LANGUAGES') or a user-defined label (e.g. 'Game Engines').
ALTER TABLE cv.cv_skills DROP CONSTRAINT IF EXISTS cv_skills_type_check;

ALTER TABLE cv.cv_skills ALTER COLUMN type TYPE VARCHAR(50);
