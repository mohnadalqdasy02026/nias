-- Add goals to program_courses
ALTER TABLE program_courses
  ADD COLUMN IF NOT EXISTS goals TEXT[];