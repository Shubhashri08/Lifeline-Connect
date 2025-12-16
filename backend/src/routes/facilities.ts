import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const dataPath = path.join(__dirname, '../data/facilities.json');

interface Facility {
    id: string;
    name: string;
    type: string;
    bedsAvailable: number;
    totalBeds: number;
    specialists: string[];
    labWaitTime: string;
    lat: number;
    lng: number;
    availability: string;
    distance?: string; // Calculated
    travelTime?: string; // Calculated
}

const getFacilities = (): Facility[] => {
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
};

// Haversine Formula to calculate distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

router.get('/', (req: Request, res: Response) => {
    try {
        const facilities = getFacilities();
        const { lat, lng, symptom } = req.query;

        let processedFacilities = facilities;

        // If location is provided, calculate distance and sort
        if (lat && lng) {
            const userLat = parseFloat(lat as string);
            const userLng = parseFloat(lng as string);

            processedFacilities = facilities.map(facility => {
                const dist = calculateDistance(userLat, userLng, facility.lat, facility.lng);
                // Estimate travel time (avg speed 40 km/h)
                const timeInMinutes = Math.round((dist / 40) * 60);

                return {
                    ...facility,
                    distance: `${dist.toFixed(1)} km`,
                    travelTime: `${timeInMinutes} min`
                };
            }).sort((a, b) => {
                const distA = parseFloat(a.distance!.split(' ')[0]);
                const distB = parseFloat(b.distance!.split(' ')[0]);
                return distA - distB;
            }).slice(0, 5); // Return only top 5 nearest facilities
        }

        // Filter by symptom (simple string match on specialists for now)
        if (symptom) {
            // Basic mapping of symptoms to specialists
            const symptomMap: { [key: string]: string } = {
                "Chest Pain": "Cardiologist",
                "Fever": "General Physician",
                "Fracture": "Orthopedic",
                "Pregnancy": "Gynecologist",
                "Cancer": "Oncologist",
                "Headache": "Neurologist"
            };

            const requiredSpecialist = symptomMap[symptom as string];
            if (requiredSpecialist) {
                processedFacilities = processedFacilities.filter(f =>
                    f.specialists.includes(requiredSpecialist) || f.specialists.includes("General Physician")
                );
            }
        }

        res.json(processedFacilities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch facilities' });
    }
});

router.get('/:id', (req: Request, res: Response) => {
    try {
        const facilities = getFacilities();
        const facility = facilities.find((f) => f.id === req.params.id);
        if (facility) {
            res.json(facility);
        } else {
            res.status(404).json({ error: 'Facility not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch facility' });
    }
});

export default router;
