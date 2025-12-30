import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        // Read the VSL data from local JSON file
        const dataPath = path.join(process.cwd(), 'data', 'vsl-data.json');

        if (!fs.existsSync(dataPath)) {
            return NextResponse.json(
                { error: 'Data file not found. Please run conversion script.' },
                { status: 404 }
            );
        }

        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(jsonData);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading VSL data:', error);
        return NextResponse.json(
            { error: 'Failed to load VSL data' },
            { status: 500 }
        );
    }
}
