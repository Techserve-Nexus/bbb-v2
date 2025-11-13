"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import bannerConfig from "@/lib/banner-config.json"

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const { banners, settings, breakpoints } = bannerConfig

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

  useEffect(() => {
    if (settings.autoRotate && banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length)
      }, settings.interval)
      return () => clearInterval(interval)
    }
  }, [banners.length, settings.autoRotate, settings.interval])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  const getCurrentBanner = (banner: any) => banner[deviceType]
  const currentBanner = getCurrentBanner(banners[currentSlide])

  return (
    <div className="relative flex items-center justify-center overflow-hidden max-w-screen-2xl mx-auto select-none">
      <img src={currentBanner.src} alt="Hero Banner" />
    </div>
  )
}
