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

  // Detect device type based on window width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < breakpoints.mobile) {
        setDeviceType('mobile')
      } else if (width < breakpoints.tablet) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoints.mobile, breakpoints.tablet])

  // Auto-rotate slides
  useEffect(() => {
    if (settings.autoRotate && banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length)
      }, settings.interval)
      return () => clearInterval(interval)
    }
  }, [banners.length, settings.autoRotate, settings.interval])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const getCurrentBanner = (banner: any) => {
    return banner[deviceType]
  }

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Banner Slides */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => {
          const currentBannerData = getCurrentBanner(banner)
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-${settings.transitionDuration} ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Desktop Image */}
              <Image
                src={currentBannerData.src}
                alt={currentBannerData.alt}
                fill
                className="object-cover object-center"
                priority={banner.priority}
                quality={100}
                sizes="100vw"
              />
            </div>
          )
        })}

        {/* Overlay gradient for better contrast */}
        <div className="absolute inset-0 bg-linear-to-t from-background/30 to-transparent z-20 pointer-events-none" />
      </div>

      {/* Navigation Controls */}
      {settings.showArrows && banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-background/80 hover:bg-background text-foreground transition-all shadow-lg hover:scale-110 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-background/80 hover:bg-background text-foreground transition-all shadow-lg hover:scale-110 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {settings.showIndicators && banners.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-30">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all rounded-full backdrop-blur-sm ${
                index === currentSlide
                  ? "bg-primary w-12 h-3 shadow-lg"
                  : "bg-background/60 hover:bg-background/80 w-3 h-3"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* CTA Button */}
      <div className="absolute bottom-24 md:bottom-32 left-0 right-0 flex justify-center z-30">
        <Link href="/register">
          <Button 
            size="lg" 
            className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 shadow-2xl hover:scale-105 transition-transform backdrop-blur-sm"
          >
            Register Now
          </Button>
        </Link>
      </div>
    </section>
  )
}
