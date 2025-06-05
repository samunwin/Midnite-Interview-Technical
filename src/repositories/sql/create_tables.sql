CREATE TABLE IF NOT EXISTS UserFinanceEvent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    time INTEGER NOT NULL
);

-- Optional: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_finance_event_user_id ON UserFinanceEvent(user_id);
CREATE INDEX IF NOT EXISTS idx_user_finance_event_type ON UserFinanceEvent(type);
CREATE INDEX IF NOT EXISTS idx_user_finance_event_time ON UserFinanceEvent(time);