-- Down: roll back college dean enrichment
ALTER TABLE colleges
    DROP COLUMN IF EXISTS dean_name_ar,
    DROP COLUMN IF EXISTS dean_name_en,
    DROP COLUMN IF EXISTS dean_message_ar,
    DROP COLUMN IF EXISTS dean_message_en;