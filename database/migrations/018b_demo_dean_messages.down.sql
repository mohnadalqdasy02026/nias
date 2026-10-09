-- Revert the demo dean messages: restore the default/empty values for the
-- branches that 018b_demo_dean_messages.up.sql populated with placeholder text.
UPDATE institute_branches
   SET dean_name_ar = NULL,
       dean_message_ar = NULL
 WHERE slug IN ('sanaa', 'aden', 'ibb', 'taib/hodeidah', 'mukalla');