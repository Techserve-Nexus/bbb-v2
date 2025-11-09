"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import bannerConfig from "@/lib/banner-config.json"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeLink, setActiveLink] = useState("home")
  const [isScrolled, setIsScrolled] = useState(false)

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
    { href: "/gallery", label: "Gallery", id: "gallery" },
  ]

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background shadow-md border-b border-border" : "bg-background"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={bannerConfig.logo.src}
              alt={bannerConfig.logo.alt}
              width={bannerConfig.logo.width}
              height={bannerConfig.logo.height}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => setActiveLink(link.id)}
                className={`relative text-sm font-medium transition-colors ${
                  activeLink === link.id ? "text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                {link.label}
                {activeLink === link.id && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Button - Desktop */}
          <div className="hidden md:block">
            <Link href="/register">
              <Button className="bg-primary hover:bg-secondary text-primary-foreground">Get Started</Button>
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
                  setActiveLink(link.id)
                  setIsOpen(false)
                }}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  activeLink === link.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/register" className="block mt-4">
              <Button className="w-full bg-primary hover:bg-secondary text-primary-foreground">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
