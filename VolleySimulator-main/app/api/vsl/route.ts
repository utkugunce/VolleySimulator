import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const dataPath = path.join(process.cwd(), 'data', 'vsl-data.json');

        if (!fs.existsSync(dataPath)) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(jsonData);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading VSL data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
