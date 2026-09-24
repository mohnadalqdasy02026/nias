-- drop hours/months duration fields from academic programs (not applicable)
ALTER TABLE academic_programs DROP COLUMN IF EXISTS duration_months;
ALTER TABLE academic_programs DROP COLUMN IF EXISTS credit_hours;