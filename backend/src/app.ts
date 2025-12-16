import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import fs from 'fs';
import path from 'path';
import facilitiesRoutes from './routes/facilities';
import authRoutes from './routes/auth';
import appointmentRoutes from './routes/appointments';

const app = express();

app.use(cors());
app.use(json());

// Routes
app.use('/api/facilities', facilitiesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

export default app;
