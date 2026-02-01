import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

interface Database {
    inventory: unknown[];
    bookings: unknown[];
    customers: unknown[];
}

export function readDb(): Database {
    if (!fs.existsSync(dbPath)) {
        return { inventory: [], bookings: [], customers: [] };
    }
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(fileContent);
}

export function writeDb(data: Database) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
