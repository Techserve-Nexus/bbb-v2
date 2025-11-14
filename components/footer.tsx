"use client"

import Link from "next/link"
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import footerConfig from "@/lib/footer-config.json"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { brand, quickLinks, contact, social, bottomLinks, copyrightText, legal = [] } = footerConfig

  const socialIcons: Record<string, any> = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
  }

  return (
    <footer className="bg-foreground text-background py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">{brand.icon}</span>
              </div>
              <span className="font-bold text-lg">{brand.name}</span>
            </div>
            <Link href="/" className="block mb-2">
              <p className="text-orange-600 font-semibold text-base hover:text-orange-700 transition-colors cursor-pointer">
                Shree Parashurama
              </p>
            </Link>
            <p className="text-background/70 text-sm">{brand.tagline}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-background/70 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              {legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-background/70 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail size={16} className="text-primary shrink-0 mt-0.5" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-background/70 hover:text-primary transition-colors break-all"
                >
                  {contact.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={16} className="text-primary shrink-0 mt-0.5" />
                <div className="text-background/70">
                  <a href={`tel:${contact.phone}`} className="hover:text-primary transition-colors block">
                    {contact.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <span className="text-background/70">{contact.address}</span>
              </li>
            </ul>
          </div>

          {/* Event Coordinators */}
          <div>
            {contact.coordinators && contact.coordinators.length > 0 && (
              <ul className="space-y-3 text-sm mt-8">
                {contact.coordinators.map((coordinator: any) => (
                  <li key={coordinator.phone} className="text-background/70">
                    <div className="font-semibold text-background/90 text-base">{coordinator.name}</div>
                    <a 
                      href={`tel:+91${coordinator.phone}`} 
                      className="hover:text-primary transition-colors text-xs"
                    >
                      {coordinator.phone}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 pt-6 text-center text-sm text-background/60">
          <p>{copyrightText}</p>
          <div className="flex justify-center gap-2 mt-2 text-xs">
            <span>Powered by</span>
            <a href="https://www.profithax.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              ProfitHax
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
