"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { isAuthenticated, getUserEmail, getUserName } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, ArrowLeft, Calendar, Clock, Hospital, Loader2, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { fetchFacilities } from "@/lib/api"

const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const facilityId = params.id as string

  const [mounted, setMounted] = useState(false)
  const [facility, setFacility] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedSpecialist, setSelectedSpecialist] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [nftToken, setNftToken] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    // Load facility data from API/Data
    // Ideally fetch specific facility by ID, but for now filtering from all
    const loadFacility = async () => {
      try {
        const allFacilities = await fetchFacilities();
        const found = allFacilities.find((f: any) => f.id === facilityId);
        if (found) {
          setFacility(found);
        } else {
          // Fallback or error if not found in top 5 list (api limitations currently)
          // For a real app, we need an endpoint for getFacilityById. 
          // But we can just use the one we have and hope it's cached or available or restart search
          router.push("/dashboard")
        }
      } catch (e) {
        console.error("Failed to load facility", e);
      }
    }
    loadFacility();


    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSelectedDate(tomorrow.toISOString().split("T")[0])
  }, [facilityId, router])

  const generateNFTToken = () => {
    // Generate a unique token ID
    return `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedSpecialist) {
      return
    }

    setLoading(true)

    try {
      const token = generateNFTToken()
      setNftToken(token)

      const appointmentData = {
        facilityId: facility.id,
        facilityName: facility.name,
        date: selectedDate,
        time: selectedTime,
        specialist: selectedSpecialist,
        notes,
        userEmail: getUserEmail(),
        userName: getUserName(),
        nftToken: token,
        status: 'confirmed'
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      })

      if (!res.ok) throw new Error("Failed to save appointment")

      setBookingComplete(true)
    } catch (error) {
      console.error("Booking error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || !facility) {
    return null
  }

  if (bookingComplete && nftToken) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Lifeline Connect</span>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-primary">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl">Appointment Confirmed!</CardTitle>
              <CardDescription>Your appointment has been successfully scheduled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Facility</p>
                    <p className="font-medium">{facility.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Specialist</p>
                    <p className="font-medium">{selectedSpecialist}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Date</p>
                    <p className="font-medium">{new Date(selectedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Time</p>
                    <p className="font-medium">{selectedTime}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-2">Token ID</p>
                  <p className="font-mono text-sm break-all mb-4">{nftToken}</p>

                  {/* Real QR Code using api.qrserver.com */}
                  <div className="bg-background border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center">
                    <div className="h-48 w-48 bg-white rounded-lg mb-4 flex items-center justify-center p-2">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${nftToken}`}
                        alt="Appointment QR Code"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      Show this QR code at the facility for verification
                    </p>
                  </div>
                </div>

                <Alert>
                  <AlertDescription className="text-sm leading-relaxed">
                    <strong>Important:</strong> Save this token ID or take a screenshot of the QR code. You will need it
                    to verify your appointment at the healthcare facility.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => router.push("/profile?tab=appointments")} className="flex-1">
                  View All Appointments
                </Button>
                <Button onClick={() => router.push("/dashboard")} variant="outline" className="flex-1 bg-transparent">
                  Back to Dashboard
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        <WhatsAppButton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Lifeline Connect</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <div className="space-y-6">
          {/* Facility Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Hospital className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{facility.name}</CardTitle>
                  <CardDescription>{facility.type}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Book Your Appointment</CardTitle>
              <CardDescription>Secure your appointment instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="specialist">Select Specialist</Label>
                <Select value={selectedSpecialist} onValueChange={setSelectedSpecialist}>
                  <SelectTrigger id="specialist">
                    <SelectValue placeholder="Choose a specialist" />
                  </SelectTrigger>
                  <SelectContent>
                    {facility.specialists.map((specialist: string) => (
                      <SelectItem key={specialist} value={specialist}>
                        {specialist}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Appointment Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger id="time">
                      <Clock className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your symptoms or any specific concerns..."
                  className="min-h-24 resize-none"
                />
              </div>

              <Button
                onClick={handleBookAppointment}
                className="w-full"
                disabled={loading || !selectedDate || !selectedTime || !selectedSpecialist}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Appointment...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium mb-1">Prefer to book via WhatsApp?</p>
                  <p className="text-sm text-muted-foreground">
                    Chat with our bot for text-based booking without filling forms
                  </p>
                </div>
                <WhatsAppButton
                  variant="inline"
                  preFilledMessage={`Hi! I want to book an appointment at ${facility.name}. Can you help me?`}
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <WhatsAppButton
          preFilledMessage={`Hi! I want to book an appointment at ${facility.name}${selectedSpecialist ? ` with ${selectedSpecialist}` : ""}.`}
        />
      </div>
    </div>
  )
}
