CREATE TABLE IF NOT EXISTS UserFinanceEvent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    time INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_finance_event_user_id ON UserFinanceEvent(user_id, type);

------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS Config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT
);

INSERT OR IGNORE INTO Config (key, value, description) VALUES
   ('alertable_single_withdrawal_amount', '100.00', 'Single withdrawal amount that triggers an alert'),
   ('alertable_consecutive_withdrawals', '3', 'Number of consecutive withdrawals that trigger an alert'),
   ('alertable_consecutive_increasing_deposits', '3', 'Number of consecutive increasing deposits that trigger an alert'),
   ('alertable_cumulative_short_term_deposit_amount', '200', 'Total of cumulative deposits within 30 seconds that trigger an alert');