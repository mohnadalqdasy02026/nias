-- rollback faculty import (remove imported rows + branch_id column)
DELETE FROM faculty_members WHERE branch_id IS NOT NULL;

ALTER TABLE faculty_members DROP COLUMN IF EXISTS branch_id;