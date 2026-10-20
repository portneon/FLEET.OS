import mysql, {
    ExecuteValues,
    Pool,
    PoolConnection,
    QueryResult,
    RowDataPacket,
} from 'mysql2/promise';

export interface SqlExecutor {
    query<T extends QueryResult = RowDataPacket[]>(
        sql: string,
        parameters?: ExecuteValues,
    ): Promise<T>;
}

export class Database implements SqlExecutor {
    private readonly pool: Pool;

    constructor(env: NodeJS.ProcessEnv = process.env) {
        const { DB_HOST, DB_USER, DB_NAME } = env;
        if (!DB_HOST || !DB_USER || !DB_NAME) {
            throw new Error('DB_HOST, DB_USER, and DB_NAME must be configured');
        }

        this.pool = mysql.createPool({
            host: DB_HOST,
            port: Number(env.DB_PORT || 3306),
            user: DB_USER,
            password: env.DB_PASSWORD || '',
            database: DB_NAME,
            dateStrings: true,
            waitForConnections: true,
            connectionLimit: Number(env.DB_POOL_SIZE || 10),
            queueLimit: 0,
            enableKeepAlive: true,
        });
    }

    async query<T extends QueryResult = RowDataPacket[]>(
        sql: string,
        parameters: ExecuteValues = [],
    ): Promise<T> {
        const [result] = await this.pool.execute<T>(sql, parameters);
        return result;
    }

    async transaction<T>(work: (transaction: SqlExecutor) => Promise<T>): Promise<T> {
        const connection: PoolConnection = await this.pool.getConnection();
        let started = false;

        const transaction: SqlExecutor = {
            query: async <TResult extends QueryResult = RowDataPacket[]>(
                sql: string,
                parameters: ExecuteValues = [],
            ): Promise<TResult> => {
                const [result] = await connection.execute<TResult>(sql, parameters);
                return result;
            },
        };

        try {
            await connection.beginTransaction();
            started = true;
            const result = await work(transaction);
            await connection.commit();
            started = false;
            return result;
        } catch (error) {
            if (started) await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}
