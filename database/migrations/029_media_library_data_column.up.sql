-- persist uploaded file bytes in the database so uploads survive redeploys (Render disk is ephemeral)
ALTER TABLE media_library ADD COLUMN data bytea;