"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Bed, Navigation, Stethoscope, Activity } from "lucide-react"

interface Facility {
  id: number
  name: string
  type: string
  distance: string
  travelTime: string
  bedsAvailable: number
  totalBeds: number
  specialists: string[]
  labWaitTime: string
  availability: "available" | "limited" | "full"
}

interface FacilityCardProps {
  facility: Facility
  onBook: () => void
}

export function FacilityCard({ facility, onBook }: FacilityCardProps) {
  const getAvailabilityColor = () => {
    switch (facility.availability) {
      case "available":
        return "bg-secondary text-secondary-foreground"
      case "limited":
        return "bg-chart-4 text-primary-foreground"
      case "full":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getAvailabilityText = () => {
    switch (facility.availability) {
      case "available":
        return "Available"
      case "limited":
        return "Limited Availability"
      case "full":
        return "Full"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="hover:border-primary transition-colors">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xl font-semibold mb-1">{facility.name}</h3>
                <p className="text-sm text-muted-foreground">{facility.type}</p>
              </div>
              <Badge className={getAvailabilityColor()}>{getAvailabilityText()}</Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{facility.distance} away</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{facility.travelTime} travel time</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Bed className="h-4 w-4 shrink-0" />
                <span>
                  {facility.bedsAvailable}/{facility.totalBeds} beds available
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-4 w-4 shrink-0" />
                <span>Lab wait: {facility.labWaitTime}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {facility.specialists.map((specialist) => (
                  <Badge key={specialist} variant="secondary" className="text-xs">
                    {specialist}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={onBook} className="flex-1" disabled={facility.availability === "full"}>
          Book Appointment
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          <Navigation className="h-4 w-4 mr-2" />
          Get Directions
        </Button>
      </CardFooter>
    </Card>
  )
}
