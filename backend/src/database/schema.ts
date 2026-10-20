import fs from 'node:fs';
import path from 'node:path';
import { SqlExecutor } from './Database';

function listSqlFiles(directory: string): string[] {
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
        .map((entry) => path.join(directory, entry.name))
        .sort();
}

const sharedSchemas = listSqlFiles(path.resolve(__dirname, 'schemas'));
const modulesDirectory = path.resolve(__dirname, '../modules');
const moduleSchemas = fs.existsSync(modulesDirectory)
    ? fs.readdirSync(modulesDirectory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .sort((left, right) => left.name.localeCompare(right.name))
        .flatMap((entry) => listSqlFiles(path.join(modulesDirectory, entry.name, 'schemas')))
    : [];

export const schemaFiles = [...sharedSchemas, ...moduleSchemas];

export async function applySchema(database: SqlExecutor): Promise<void> {
    for (const filePath of schemaFiles) {
        const statements = fs.readFileSync(filePath, 'utf8')
            .split(';')
            .map((statement) => statement.trim())
            .filter((statement) => statement.length > 0);

        for (const statement of statements) {
            await database.query(statement);
        }
    }
}
