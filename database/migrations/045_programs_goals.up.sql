-- Add goals (الأهداف) as bullet points array to academic_programs
ALTER TABLE academic_programs
  ADD COLUMN IF NOT EXISTS goals TEXT[];