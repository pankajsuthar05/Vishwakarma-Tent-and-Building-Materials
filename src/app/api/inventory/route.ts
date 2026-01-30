import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

function getDb() {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
}

function saveDb(data: any) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export async function GET() {
    const db = getDb();
    return NextResponse.json(db.inventory);
}

export async function POST(request: Request) {
    const body = await request.json();
    const db = getDb();

    const newItem = {
        id: Date.now(),
        ...body,
        status: body.quantity > 0 ? 'Available' : 'Out of Stock'
    };

    db.inventory.push(newItem);
    saveDb(db);

    return NextResponse.json(newItem);
}
