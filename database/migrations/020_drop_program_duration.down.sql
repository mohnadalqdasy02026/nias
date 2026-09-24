-- restore hours/months duration fields
ALTER TABLE academic_programs ADD COLUMN duration_months INTEGER NOT NULL DEFAULT 0;
ALTER TABLE academic_programs ADD COLUMN credit_hours INTEGER;