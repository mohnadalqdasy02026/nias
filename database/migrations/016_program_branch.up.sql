-- programs belong to an institute branch
ALTER TABLE academic_programs
  ADD COLUMN branch_id bigint REFERENCES institute_branches(id) ON DELETE SET NULL;

-- backfill branch from each program's college (colleges belong to a branch)
UPDATE academic_programs p
   SET branch_id = c.branch_id
  FROM colleges c
 WHERE p.college_id IS NOT NULL
   AND c.id = p.college_id
   AND c.branch_id IS NOT NULL
   AND p.deleted_at IS NULL;