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
    return NextResponse.json(db.customers);
}

export async function POST(request: Request) {
    const body = await request.json();
    const db = getDb();

    const newCustomer = {
        id: Date.now(),
        ...body,
        orders: 0,
        spent: "$0"
    };

    db.customers.push(newCustomer);
    saveDb(db);

    return NextResponse.json(newCustomer);
}
