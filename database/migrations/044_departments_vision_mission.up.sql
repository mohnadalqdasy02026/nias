-- Add vision and mission to departments (for college sections)
ALTER TABLE departments
  ADD COLUMN IF NOT EXISTS vision TEXT,
  ADD COLUMN IF NOT EXISTS mission TEXT;