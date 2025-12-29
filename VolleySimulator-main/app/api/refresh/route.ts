import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST() {
    try {
        // Run the data update script
        const scriptPath = path.join(process.cwd(), 'scripts', 'update-data.js');

        console.log('[REFRESH] Running update script:', scriptPath);

        const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
            timeout: 60000, // 60 second timeout
            cwd: process.cwd()
        });

        if (stderr && !stderr.includes('DevTools')) {
            console.warn('[REFRESH] Script stderr:', stderr);
        }

        console.log('[REFRESH] Script completed successfully');

        return NextResponse.json({
            success: true,
            message: 'Veri güncellendi!',
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[REFRESH] Error:', error.message);

        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// GET endpoint for polling status
export async function GET() {
    return NextResponse.json({
        status: 'ready',
        message: 'POST to this endpoint to refresh data'
    });
}
