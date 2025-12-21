-- Add the userId column
ALTER TABLE conversion_history ADD COLUMN userId TEXT;

-- (Optional) Create an index to make lookups by user faster
CREATE INDEX idx_conversion_history_userId ON conversion_history(userId);

-- Note: We aren't making it NOT NULL yet because you might have 
-- existing local data that doesn't have a user attached.