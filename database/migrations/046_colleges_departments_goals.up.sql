-- Add goals to colleges (الأهداف للكلية)
ALTER TABLE colleges
  ADD COLUMN IF NOT EXISTS goals TEXT[];

-- Add goals to departments (الأهداف للقسم)
ALTER TABLE departments
  ADD COLUMN IF NOT EXISTS goals TEXT[];