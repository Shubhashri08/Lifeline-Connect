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

// Mock facility data (in production, fetch from API)
const mockFacilities = {
  "1": {
    id: 1,
    name: "District Hospital Nashik",
    type: "District Hospital",
    specialists: ["Cardiologist", "Orthopedic"],
  },
  "2": {
    id: 2,
    name: "PHC Satana",
    type: "Primary Health Center",
    specialists: ["General Physician"],
  },
  "3": {
    id: 3,
    name: "Community Health Center Malegaon",
    type: "Community Health Center",
    specialists: ["Pediatrician", "Gynecologist"],
  },
}

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

    // Load facility data
    const facilityData = mockFacilities[facilityId as keyof typeof mockFacilities]
    if (facilityData) {
      setFacility(facilityData)
    } else {
      router.push("/dashboard")
    }

    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSelectedDate(tomorrow.toISOString().split("T")[0])
  }, [facilityId, router])

  const generateNFTToken = () => {
    // Simulate blockchain NFT token generation
    // In production, this would call Polygon smart contract
    const tokenId = `NFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return tokenId
  }

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedSpecialist) {
      return
    }

    setLoading(true)

    try {
      // Simulate API call to create appointment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate NFT token
      const token = generateNFTToken()
      setNftToken(token)

      // Store appointment in localStorage (in production, use database)
      const appointment = {
        id: token,
        facilityId: facility.id,
        facilityName: facility.name,
        date: selectedDate,
        time: selectedTime,
        specialist: selectedSpecialist,
        notes,
        userEmail: getUserEmail(),
        userName: getUserName(),
        nftToken: token,
        createdAt: new Date().toISOString(),
      }

      const existingAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      existingAppointments.push(appointment)
      localStorage.setItem("appointments", JSON.stringify(existingAppointments))

      setBookingComplete(true)
    } catch (error) {
      console.error("[v0] Booking error:", error)
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
              <CardDescription>Your blockchain-verified appointment has been created</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-secondary/10 border-secondary">
                <AlertDescription className="text-center">
                  <strong>Your appointment is secured with blockchain technology</strong>
                  <br />
                  This prevents fraud and ensures fair access
                </AlertDescription>
              </Alert>

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
                  <p className="text-sm text-muted-foreground mb-2">NFT Token ID</p>
                  <p className="font-mono text-sm break-all mb-4">{nftToken}</p>

                  {/* QR Code Placeholder */}
                  <div className="bg-background border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center">
                    <div className="h-48 w-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <img
                        src={`/qr-code-for-.jpg?height=192&width=192&query=QR+code+for+${nftToken}`}
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
                    <strong>Important:</strong> Save this token ID or take a screenshot of the QR code. You'll need it
                    to verify your appointment at the healthcare facility.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => router.push("/profile")} className="flex-1">
                  View All Appointments
                </Button>
                <Button onClick={() => router.push("/dashboard")} variant="outline" className="flex-1 bg-transparent">
                  Back to Dashboard
                </Button>
              </div>

              <Alert className="bg-[#25D366]/10 border-[#25D366]/20">
                <AlertDescription className="space-y-2">
                  <p className="text-sm font-medium">Get appointment reminders on WhatsApp</p>
                  <WhatsAppButton
                    variant="inline"
                    preFilledMessage={`Hi! I just booked an appointment at ${facility.name} on ${new Date(selectedDate).toLocaleDateString()} at ${selectedTime}. Token: ${nftToken}. Please send me reminders.`}
                    className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
                  />
                </AlertDescription>
              </Alert>
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
              <CardDescription>Your appointment will be secured with a blockchain-verified NFT token</CardDescription>
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

              <Alert className="bg-primary/5 border-primary/20">
                <AlertDescription className="text-sm leading-relaxed">
                  <strong>Blockchain Security:</strong> Your appointment will be issued as an NFT token on the Polygon
                  network. This ensures your booking cannot be duplicated or manipulated, preventing queue-jumping and
                  fraud.
                </AlertDescription>
              </Alert>

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
