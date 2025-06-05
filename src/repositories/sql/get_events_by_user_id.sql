SELECT *
FROM UserFinanceEvent
WHERE user_id = ?
ORDER BY time DESC
LIMIT ?;