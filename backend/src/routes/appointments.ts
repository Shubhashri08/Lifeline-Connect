import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Create Appointment
router.post('/', authenticateToken, async (req: any, res: Response) => {
    const { facilityId, facilityName, date, time, specialist, notes } = req.body;
    const userId = req.user.userId;

    try {
        const appointment = await prisma.appointment.create({
            data: {
                userId,
                facilityId,
                facilityName,
                date,
                time,
                specialist,
                notes,
                status: 'confirmed'
            }
        });
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

// Get My Appointments
router.get('/my', authenticateToken, async (req: any, res: Response) => {
    const userId = req.user.userId;
    try {
        const appointments = await prisma.appointment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

export default router;
