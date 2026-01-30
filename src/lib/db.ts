import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export function readDb() {
    if (!fs.existsSync(dbPath)) {
        return { inventory: [], bookings: [], customers: [] };
    }
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(fileContent);
}

export function writeDb(data: any) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
