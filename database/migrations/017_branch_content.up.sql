-- branches carry a dean; news/courses/users belong to a branch
ALTER TABLE institute_branches
  ADD COLUMN dean_name_ar varchar(190),
  ADD COLUMN dean_name_en varchar(190);

ALTER TABLE news
  ADD COLUMN branch_id bigint REFERENCES institute_branches(id) ON DELETE SET NULL;

ALTER TABLE training_courses
  ADD COLUMN branch_id bigint REFERENCES institute_branches(id) ON DELETE SET NULL;

ALTER TABLE users
  ADD COLUMN branch_id bigint REFERENCES institute_branches(id) ON DELETE SET NULL;

-- existing content was published by the headquarters
UPDATE news SET branch_id = (SELECT id FROM institute_branches WHERE is_headquarters = true LIMIT 1)
 WHERE branch_id IS NULL;
UPDATE training_courses SET branch_id = (SELECT id FROM institute_branches WHERE is_headquarters = true LIMIT 1)
 WHERE branch_id IS NULL;
UPDATE users SET branch_id = (SELECT id FROM institute_branches WHERE is_headquarters = true LIMIT 1)
 WHERE branch_id IS NULL;