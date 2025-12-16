export const API_BASE_URL = "http://localhost:8000/api";

export async function fetchFacilities(lat?: number, lng?: number, symptom?: string) {
    const params = new URLSearchParams();
    if (lat) params.append("lat", lat.toString());
    if (lng) params.append("lng", lng.toString());
    if (symptom) params.append("symptom", symptom);

    const res = await fetch(`${API_BASE_URL}/facilities?${params.toString()}`);
    if (!res.ok) {
        throw new Error("Failed to fetch facilities");
    }
    return res.json();
}
