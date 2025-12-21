CREATE TABLE IF NOT EXISTS conversion_history (
  id TEXT PRIMARY KEY,
  gherkin TEXT NOT NULL,
  playwright TEXT NOT NULL,
  baseUrl TEXT,
  model TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);