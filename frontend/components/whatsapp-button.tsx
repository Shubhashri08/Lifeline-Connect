"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// WhatsApp bot configuration
const WHATSAPP_NUMBER = "919876543210" // Replace with actual WhatsApp Business API number
const DEFAULT_MESSAGE = "Hi! I need help finding a doctor for my symptoms."

interface WhatsAppButtonProps {
  preFilledMessage?: string
  className?: string
  variant?: "floating" | "inline"
}

export function WhatsAppButton({
  preFilledMessage = DEFAULT_MESSAGE,
  className = "",
  variant = "floating",
}: WhatsAppButtonProps) {
  const [showInfo, setShowInfo] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleWhatsAppClick = () => {
    if (!mounted) return

    const encodedMessage = encodeURIComponent(preFilledMessage)
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`

    // Device detection: mobile opens app, desktop opens web
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (isMobile) {
      // Open WhatsApp app directly on mobile
      window.location.href = whatsappUrl
    } else {
      // Open WhatsApp Web on desktop
      window.open(whatsappUrl, "_blank")
    }
  }

  if (!mounted) return null

  if (variant === "inline") {
    return (
      <>
        <Button onClick={handleWhatsAppClick} variant="outline" className={className}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat on WhatsApp
        </Button>

        <Dialog open={showInfo} onOpenChange={setShowInfo}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>WhatsApp Healthcare Bot</DialogTitle>
              <DialogDescription className="space-y-3 pt-2">
                <p className="leading-relaxed">
                  For quick queries without the app, chat with our bot on WhatsApp to find doctors, book appointments,
                  and get routes via SMS-like interface.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-foreground">What you can do:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Find nearest doctors by symptom</li>
                    <li>Check real-time bed availability</li>
                    <li>Book appointments and get NFT tokens</li>
                    <li>Get directions via text</li>
                    <li>No smartphone app required</li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Perfect for feature phones and low-tech users who prefer text-based interactions.
                </p>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Info tooltip */}
        <button
          onClick={() => setShowInfo(true)}
          className="bg-secondary/90 hover:bg-secondary text-secondary-foreground rounded-full p-2 shadow-lg transition-all hover:scale-110"
          aria-label="WhatsApp bot information"
        >
          <Info className="h-4 w-4" />
        </button>

        {/* Main WhatsApp button */}
        <button
          onClick={handleWhatsAppClick}
          className={`bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 ${className}`}
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>

      {/* Information Modal */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
              WhatsApp Healthcare Bot
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p className="leading-relaxed">
                For quick queries without the app, chat with our bot on WhatsApp to find doctors, book appointments, and
                get routes via SMS-like interface.
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-foreground">What you can do:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Find nearest doctors by symptom</li>
                  <li>Check real-time bed availability</li>
                  <li>Book appointments and get NFT tokens</li>
                  <li>Get directions via text</li>
                  <li>No smartphone app required</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Perfect for feature phones and low-tech users who prefer text-based interactions.
              </p>
              <div className="pt-2">
                <Button onClick={handleWhatsAppClick} className="w-full bg-[#25D366] hover:bg-[#20BA5A]">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start WhatsApp Chat
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
