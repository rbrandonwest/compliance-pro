-- Create a functional index for high-performance case-insensitive searching
CREATE INDEX IF NOT EXISTS "BusinessDocument_companyName_lower_idx" ON "BusinessDocument" (lower("companyName") text_pattern_ops);
