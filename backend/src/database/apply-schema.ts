import { Database } from './Database';
import { applySchema } from './schema';

async function main(): Promise<void> {
    const database = new Database();
    try {
        await applySchema(database);
        console.log('Database schema applied.');
    } finally {
        await database.close();
    }
}

void main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error(`Could not apply database schema: ${message}`);
    process.exitCode = 1;
});
