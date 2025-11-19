"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import bannerConfig from "@/lib/banner-config.json"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/", label: "Home", id: "home" },
    { href: "/about", label: "About Us", id: "about" },
    { href: "/sponsors", label: "Sponsors", id: "sponsors" },
    { href: "/shreemembers", label: "Shree Parashurama Members", id: "shreemembers" },
  ]

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background shadow-md border-b border-border" : "bg-background"
        }`}
    >
      <div className="mx-auto px-4 md:px-6 py-2">
        <div className="flex justify-between items-center">
          {/* Logo with Text */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            {/* Logo Image */}
            <div
              className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full bg-cover bg-center transition-transform group-hover:scale-105"
              style={{ backgroundImage: `url('${bannerConfig.logo.src}')` }}
            />
            
            {/* Text beside Logo - Now visible on all devices */}
            <div className="block">
              <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors leading-tight">
                Shree Parashurama
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`relative text-sm font-medium transition-colors ${pathname === link.href ? "text-primary" : "text-foreground hover:text-primary"
                  }`}
              >
                {link.label}
                {pathname === link.href && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-linear-to-r from-primary to-secondary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Button - Desktop */}
          <div className="hidden md:block">
            <Link href="/register">
              <Button className="bg-primary hover:bg-secondary text-primary-foreground">Register Now</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => {
                  setIsOpen(false)
                }}
                className={`block px-4 py-2 rounded-lg transition-colors ${pathname === link.href ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/register" className="block mt-4">
              <Button className="w-full bg-primary hover:bg-secondary text-primary-foreground">Register Now</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
