-- Up: enrich departments with complete public data (description, department head)
ALTER TABLE departments
    ADD COLUMN IF NOT EXISTS description  TEXT,
    ADD COLUMN IF NOT EXISTS head_name_ar VARCHAR(255),
    ADD COLUMN IF NOT EXISTS head_title   VARCHAR(190),
    ADD COLUMN IF NOT EXISTS head_photo   VARCHAR(500),
    ADD COLUMN IF NOT EXISTS image        VARCHAR(500);