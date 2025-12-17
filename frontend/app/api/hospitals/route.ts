import { NextResponse } from 'next/server';
import facilitiesData from '@/lib/data/facilities.json';

// Types for the facility data
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
}

interface ProcessedFacility extends Facility {
    distance?: string;
    travelTime?: string;
}

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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const symptom = searchParams.get('symptom');

    let processedFacilities: ProcessedFacility[] = facilitiesData;

    try {
        // If location is provided, calculate distance and sort
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);

            if (isNaN(userLat) || isNaN(userLng)) {
                return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
            }

            processedFacilities = processedFacilities
                .map((facility) => {
                    const dist = calculateDistance(userLat, userLng, facility.lat, facility.lng);
                    // Estimate travel time (avg speed 40 km/h)
                    const timeInMinutes = Math.round((dist / 40) * 60);

                    return {
                        ...facility,
                        distance: `${dist.toFixed(1)} km`,
                        travelTime: `${timeInMinutes} min`,
                        distVal: dist // Temporary for sorting
                    };
                })
                .sort((a, b) => a.distVal - b.distVal)
                .map(({ distVal, ...rest }) => rest) // Remove temporary sorting key
                .slice(0, 5); // Return only top 5 nearest facilities
        }

        // Filter by symptom (simple string match on specialists for now)
        if (symptom) {
            const symptomMap: { [key: string]: string } = {
                "Chest Pain": "Cardiologist",
                "Fever": "General Physician",
                "Fracture": "Orthopedic",
                "Pregnancy": "Gynecologist",
                "Cancer": "Oncologist",
                "Headache": "Neurologist"
            };

            const requiredSpecialist = symptomMap[symptom];
            if (requiredSpecialist) {
                processedFacilities = processedFacilities.filter(f =>
                    f.specialists.includes(requiredSpecialist) || f.specialists.includes("General Physician")
                );
            }
        }

        return NextResponse.json(processedFacilities);

    } catch (error) {
        console.error("Error processing hospital search:", error);
        return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 });
    }
}
