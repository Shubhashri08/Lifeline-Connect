"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getUserEmail, getUserName, logout } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Activity, ArrowLeft, Calendar, Clock, QrCode, Edit2, Save, X, MessageCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WhatsAppButton } from "@/components/whatsapp-button"

interface Appointment {
  id: string
  facilityName: string
  date: string
  time: string
  specialist: string
  nftToken: string
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [editMode, setEditMode] = useState(false)
  const [language, setLanguage] = useState("english")

  // Edit form state
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editLocation, setEditLocation] = useState("")

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    const name = getUserName() || "User"
    const email = getUserEmail() || ""
    setUserName(name)
    setUserEmail(email)
    setEditName(name)

    // Load appointments from localStorage
    const storedAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
    // Filter appointments for current user
    const userAppointments = storedAppointments.filter((apt: Appointment) => apt.userEmail === email)
    setAppointments(userAppointments)

    // Load preferences
    setLanguage(localStorage.getItem("preferred_language") || "english")
    setEditPhone(localStorage.getItem("user_phone") || "")
    setEditLocation(localStorage.getItem("user_location") || "")
  }, [router])

  const handleSaveProfile = () => {
    localStorage.setItem("user_name", editName)
    localStorage.setItem("user_phone", editPhone)
    localStorage.setItem("user_location", editLocation)
    setUserName(editName)
    setEditMode(false)
  }

  const handleCancelEdit = () => {
    setEditName(userName)
    setEditMode(false)
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem("preferred_language", lang)
  }

  const handleLogout = () => {
    logout()
  }

  const getAppointmentStatus = (date: string, time: string) => {
    const appointmentDate = new Date(`${date} ${time}`)
    const now = new Date()
    if (appointmentDate > now) {
      return { status: "upcoming", color: "bg-secondary text-secondary-foreground" }
    } else {
      return { status: "completed", color: "bg-muted text-muted-foreground" }
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Lifeline Connect</span>
          </div>
          <div className="flex items-center gap-2">
            <WhatsAppButton variant="inline" className="hidden sm:flex" />
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and view your appointments</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 gap-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your account details and contact information</CardDescription>
                  </div>
                  {!editMode ? (
                    <Button onClick={() => setEditMode(true)} variant="outline" size="sm" className="bg-transparent">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm" className="bg-transparent">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {editMode ? (
                    <Input
                      id="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md">{userName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm p-2 bg-muted rounded-md text-muted-foreground">{userEmail}</p>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {editMode ? (
                    <Input
                      id="phone"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md">{editPhone || "Not provided"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  {editMode ? (
                    <Input
                      id="location"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="Your city or district"
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md">{editLocation || "Not provided"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleLogout} variant="destructive">
                  Logout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            {appointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Appointments Yet</h3>
                  <p className="text-muted-foreground mb-4">You haven't booked any appointments</p>
                  <Button onClick={() => router.push("/dashboard")}>Find Healthcare Facilities</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Alert>
                  <AlertDescription>
                    You have <strong>{appointments.length}</strong> appointment{appointments.length !== 1 ? "s" : ""}{" "}
                    booked
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  {appointments.map((appointment) => {
                    const { status, color } = getAppointmentStatus(appointment.date, appointment.time)
                    return (
                      <Card key={appointment.id}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="text-lg font-semibold mb-1">{appointment.facilityName}</h3>
                                  <p className="text-sm text-muted-foreground">{appointment.specialist}</p>
                                </div>
                                <Badge className={color}>{status}</Badge>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-4 w-4 shrink-0" />
                                  <span>{new Date(appointment.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="h-4 w-4 shrink-0" />
                                  <span>{appointment.time}</span>
                                </div>
                              </div>

                              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <QrCode className="h-4 w-4 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">NFT Token ID</p>
                                </div>
                                <p className="font-mono text-xs break-all">{appointment.nftToken}</p>
                              </div>
                            </div>

                            <div className="flex md:flex-col gap-2">
                              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                                View QR Code
                              </Button>
                              <Button size="sm" variant="ghost" className="flex-1">
                                Get Directions
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Language Preference</CardTitle>
                <CardDescription>Choose your preferred language for the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Alert>
                  <AlertDescription className="text-sm">
                    Language changes will be applied across the platform in the next update.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive appointment reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive appointment reminders via SMS</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Enable
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">WhatsApp Notifications</p>
                    <p className="text-sm text-muted-foreground">Get updates through WhatsApp</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#25D366]/5 border-[#25D366]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  WhatsApp Healthcare Bot
                </CardTitle>
                <CardDescription>Quick access to healthcare without the app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use our WhatsApp bot to find doctors, check availability, and book appointments through a simple
                  text-based interface. Perfect for feature phones and low-bandwidth connections.
                </p>
                <WhatsAppButton
                  variant="inline"
                  preFilledMessage="Hi! I need help with my healthcare needs."
                  className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Lifeline Connect</CardTitle>
                <CardDescription>Platform information and resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">1.0.0 (Demo)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">WhatsApp Bot</span>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    Learn More
                  </Button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Privacy Policy</span>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View
                  </Button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Terms of Service</span>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <WhatsAppButton />
    </div>
  )
}
