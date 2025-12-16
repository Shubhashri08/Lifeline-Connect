#!/bin/bash

# Base URL
URL="http://localhost:8000/api"

echo "1. Testing Get All Facilities (Nashik)..."
curl -s "$URL/facilities?lat=19.9975&lng=73.7898" | grep "District Civil Hospital" && echo "✅ Nashik Search OK (Nearest)" || echo "❌ Nashik Search Failed"

echo -e "\n1b. Testing Get All Facilities (Mumbai)..."
curl -s "$URL/facilities?lat=19.0760&lng=72.8777" | grep "KEM Hospital" && echo "✅ Mumbai Search OK (Nearest)" || echo "❌ Mumbai Search Failed"


echo -e "\n2. Testing Signup..."
EMAIL="test${RANDOM}@example.com"
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"email\": \"$EMAIL\", \"password\": \"password123\", \"name\": \"Test User\"}" "$URL/auth/signup")
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ Signup OK"
else
    echo "❌ Signup Failed: $RESPONSE"
    exit 1
fi

echo -e "\n3. Testing Get My Appointments (Empty)..."
curl -s -H "Authorization: Bearer $TOKEN" "$URL/appointments/my" | grep "\[\]" && echo "✅ Empty Appointments OK" || echo "❌ Empty Appointments Failed"

echo -e "\n4. Testing Create Appointment..."
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{
        "facilityId": "1",
        "facilityName": "District Hospital Nashik",
        "date": "2025-01-01",
        "time": "10:00 AM",
        "specialist": "Cardiologist",
        "notes": "Testing notes"
    }' \
    "$URL/appointments" | grep "confirmed" && echo "✅ Create Appointment OK" || echo "❌ Create Appointment Failed"

echo -e "\n5. Testing Get My Appointments (Populated)..."
curl -s -H "Authorization: Bearer $TOKEN" "$URL/appointments/my" | grep "District Hospital Nashik" && echo "✅ Appointments List OK" || echo "❌ Appointments List Failed"

echo -e "\nAll Tests Completed."
