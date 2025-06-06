SELECT *
FROM UserFinanceEvent
WHERE user_id = ?
AND type = ?
ORDER BY time DESC
    LIMIT ?;