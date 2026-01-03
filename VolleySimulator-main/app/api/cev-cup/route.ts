import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        // Read the CEV Cup data from local JSON file
        const dataPath = path.join(process.cwd(), 'data', 'cev-cup-data.json');

        if (!fs.existsSync(dataPath)) {
            return NextResponse.json(
                { error: 'Data file not found.' },
                { status: 404 }
            );
        }

        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(jsonData);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading CEV Cup data:', error);
        return NextResponse.json(
            { error: 'Failed to load CEV Cup data' },
            { status: 500 }
        );
    }
}
