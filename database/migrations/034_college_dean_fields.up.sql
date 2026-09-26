-- Up: enrich colleges with full dean fields (parallel to institute_branches)
ALTER TABLE colleges
    ADD COLUMN IF NOT EXISTS dean_name_ar    VARCHAR(255),
    ADD COLUMN IF NOT EXISTS dean_name_en    VARCHAR(255),
    ADD COLUMN IF NOT EXISTS dean_message_ar TEXT,
    ADD COLUMN IF NOT EXISTS dean_message_en TEXT;