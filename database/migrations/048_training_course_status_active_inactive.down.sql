-- Restore legacy training course statuses (best-effort).
ALTER TABLE training_courses DROP CONSTRAINT IF EXISTS training_courses_status_check;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'training_course_status') THEN
    CREATE TYPE training_course_status AS ENUM ('draft', 'open', 'closed', 'completed');
  END IF;
END $$;
ALTER TABLE training_courses ALTER COLUMN status DROP DEFAULT;
ALTER TABLE training_courses
  ALTER COLUMN status TYPE training_course_status USING (
    CASE
      WHEN status = 'active' THEN 'open'::training_course_status
      ELSE 'closed'::training_course_status
    END
  );
ALTER TABLE training_courses ALTER COLUMN status SET DEFAULT 'draft';
