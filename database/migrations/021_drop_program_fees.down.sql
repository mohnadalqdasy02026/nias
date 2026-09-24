-- restore total fees column
ALTER TABLE academic_programs ADD COLUMN total_fees NUMERIC(12, 2) CHECK (total_fees >= 0);