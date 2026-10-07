-- Down: remove department content columns
ALTER TABLE departments
    DROP COLUMN IF EXISTS description,
    DROP COLUMN IF EXISTS head_name_ar,
    DROP COLUMN IF EXISTS head_title,
    DROP COLUMN IF EXISTS head_photo,
    DROP COLUMN IF EXISTS image;