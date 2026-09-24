ALTER TABLE users DROP COLUMN IF EXISTS branch_id;
ALTER TABLE training_courses DROP COLUMN IF EXISTS branch_id;
ALTER TABLE news DROP COLUMN IF EXISTS branch_id;
ALTER TABLE institute_branches DROP COLUMN IF EXISTS dean_name_en;
ALTER TABLE institute_branches DROP COLUMN IF EXISTS dean_name_ar;