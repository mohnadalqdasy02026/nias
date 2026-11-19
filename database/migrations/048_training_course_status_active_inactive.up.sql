-- Simplify training course status to active/inactive.
ALTER TABLE training_courses ALTER COLUMN status DROP DEFAULT;
ALTER TABLE training_courses ALTER COLUMN status TYPE VARCHAR(20) USING (
  CASE
    WHEN status::text = 'open' THEN 'active'
    ELSE 'inactive'
  END
);
ALTER TABLE training_courses ALTER COLUMN status SET DEFAULT 'inactive';
DROP TYPE IF EXISTS training_course_status;
ALTER TABLE training_courses
  ADD CONSTRAINT training_courses_status_check CHECK (status IN ('active', 'inactive'));
