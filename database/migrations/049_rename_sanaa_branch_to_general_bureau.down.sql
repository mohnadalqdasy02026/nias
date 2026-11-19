-- Revert الديوان العام naming back to صنعاء for slug 'sanaa'.
UPDATE institute_branches
SET
  name_ar = 'صنعاء',
  name_en = 'Sana''a',
  address = 'أمانة العاصمة صنعاء - شارع العدل'
WHERE slug = 'sanaa';

UPDATE training_courses
SET location = replace(location, 'الديوان العام — المعهد الوطني', 'صنعاء — المعهد الوطني')
WHERE location LIKE '%الديوان العام — المعهد الوطني%';

UPDATE training_courses
SET location = 'صنعاء'
WHERE location = 'الديوان العام';

UPDATE conferences
SET location = replace(location, 'الديوان العام', 'صنعاء')
WHERE location LIKE '%الديوان العام%';
