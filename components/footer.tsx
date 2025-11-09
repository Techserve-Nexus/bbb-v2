"use client"

import Link from "next/link"
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-foreground text-background py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">♔</span>
              </div>
              <span className="font-bold text-lg">Chess Event 2025</span>
            </div>
            <p className="text-background/70 text-sm">Where strategic minds meet and excellence is celebrated.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-background/70 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-background/70 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/sponsors" className="text-background/70 hover:text-primary transition-colors">
                  Sponsors
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-background/70 hover:text-primary transition-colors">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <a
                  href="mailto:info@chessevent.com"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  info@chessevent.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary flex-shrink-0" />
                <a href="tel:+919876543210" className="text-background/70 hover:text-primary transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-primary flex-shrink-0" />
                <span className="text-background/70">New Delhi, India</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Facebook size={18} className="text-primary hover:text-primary-foreground" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Twitter size={18} className="text-primary hover:text-primary-foreground" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Instagram size={18} className="text-primary hover:text-primary-foreground" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Linkedin size={18} className="text-primary hover:text-primary-foreground" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 pt-8 text-center text-sm text-background/60">
          <p>&copy; {currentYear} Chess Event. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
