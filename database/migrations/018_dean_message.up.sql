-- dean message for branch deans (dean speech / كلمة العميد)
ALTER TABLE institute_branches
  ADD COLUMN dean_message_ar text,
  ADD COLUMN dean_message_en text;