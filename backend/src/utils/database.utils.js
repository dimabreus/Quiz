// Обёртка для выполнения запросов к базе данных с обработкой ошибок
export async function executeQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Обёртка для получения одной записи из базы данных
export async function getOne(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Обработчик ошибок базы данных
export function handleDatabaseError(error, res) {
    console.error('Database error:', error);
    return res.status(500).json({
        status: 'error',
        code: 'DATABASE_ERROR',
        message: 'Database operation failed. Please try again later.'
    });
}
