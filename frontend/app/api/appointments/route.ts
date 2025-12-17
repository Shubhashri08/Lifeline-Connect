import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const appointmentsFile = path.join(process.cwd(), 'lib/data/appointments.json');

// Ensure directory exists
if (!fs.existsSync(path.dirname(appointmentsFile))) {
    fs.mkdirSync(path.dirname(appointmentsFile), { recursive: true });
}

// Initial empty array if file doesn't exist
if (!fs.existsSync(appointmentsFile)) {
    fs.writeFileSync(appointmentsFile, '[]');
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validation could go here

        const fileData = fs.readFileSync(appointmentsFile, 'utf-8');
        const appointments = JSON.parse(fileData);

        const newAppointment = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            ...body
        };

        appointments.push(newAppointment);

        fs.writeFileSync(appointmentsFile, JSON.stringify(appointments, null, 2));

        return NextResponse.json({ success: true, appointment: newAppointment });
    } catch (error) {
        console.error("Failed to book appointment:", error);
        return NextResponse.json({ error: 'Failed to book appointment' }, { status: 500 });
    }
}

export async function GET() {
    try {
        if (!fs.existsSync(appointmentsFile)) {
            return NextResponse.json([]);
        }
        const fileData = fs.readFileSync(appointmentsFile, 'utf-8');
        const appointments = JSON.parse(fileData);
        return NextResponse.json(appointments);
    } catch (error) {
        console.error("Failed to fetch appointments:", error);
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }
}
