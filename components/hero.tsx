"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import bannerConfig from "@/lib/banner-config.json"

interface BannerData {
  id: string
  desktop: { src: string; alt: string }
  tablet: { src: string; alt: string }
  mobile: { src: string; alt: string }
  priority: boolean
}

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [banners, setBanners] = useState<BannerData[]>([])
  const [loading, setLoading] = useState(true)
  const [useFallback, setUseFallback] = useState(false)
  
  // Fallback settings from config
  const { settings, breakpoints } = bannerConfig
  const fallbackBanners = bannerConfig.banners

  // Fetch banners from database
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/banners")
        const data = await response.json()
        
        if (data.success && data.banners.length > 0) {
          setBanners(data.banners)
          setUseFallback(false)
        } else {
          // Use fallback banners if API fails or returns empty
          console.warn("Using fallback banners from config")
          setUseFallback(true)
        }
      } catch (error) {
        console.error("Error fetching banners:", error)
        console.warn("Using fallback banners from config")
        setUseFallback(true)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  // Device detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < breakpoints.mobile) setDeviceType("mobile")
      else if (width < breakpoints.tablet) setDeviceType("tablet")
      else setDeviceType("desktop")
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [breakpoints.mobile, breakpoints.tablet])

  // Auto-rotate slides
  useEffect(() => {
    const activeBanners = useFallback ? fallbackBanners : banners
    if (settings.autoRotate && activeBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
      }, settings.interval)
      return () => clearInterval(interval)
    }
  }, [banners.length, fallbackBanners.length, settings.autoRotate, settings.interval, useFallback])

  const nextSlide = () => {
    const activeBanners = useFallback ? fallbackBanners : banners
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
  }
  
  const prevSlide = () => {
    const activeBanners = useFallback ? fallbackBanners : banners
    setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
  }
  
  const getCurrentBanner = (banner: any) => banner[deviceType]
  
  // Show loading state
  if (loading) {
    return (
      <div className="relative flex items-center justify-center overflow-hidden max-w-screen-2xl mx-auto select-none min-h-[50vh] bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const activeBanners = useFallback ? fallbackBanners : banners
  const currentBanner = getCurrentBanner(activeBanners[currentSlide])

  return (
    <div className="w-full">
      {/* Banner Image Container */}
      <div className="relative flex items-center justify-center overflow-hidden max-w-screen-2xl mx-auto select-none">
        {/* Banner Image */}
        <img src={currentBanner.src} alt={currentBanner.alt || "Hero Banner"} />

        {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      </div>

      {/* CTA Button Below Image */}
      <div className="flex items-center justify-center py-8 bg-background">
        <Link href="/register">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-8 py-6 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl"
          >
            Register Now
          </Button>
        </Link>
      </div>
    </div>
  )
}
