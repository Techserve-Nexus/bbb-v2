"use client"

import Link from "next/link"
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import footerConfig from "@/lib/footer-config.json"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { brand, quickLinks, contact, social, bottomLinks, copyrightText } = footerConfig

  const socialIcons: Record<string, any> = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
  }

  return (
    <footer className="bg-foreground text-background py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">{brand.icon}</span>
              </div>
              <span className="font-bold text-lg">{brand.name}</span>
            </div>
            <p className="text-background/70 text-sm">{brand.tagline}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-center">Quick Links</h3>
            <ul className="space-y-2 text-sm text-center">
              {quickLinks.map((link) => (
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
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary shrink-0" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  {contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary shrink-0" />
                <a href={`tel:${contact.phone}`} className="text-background/70 hover:text-primary transition-colors">
                  {contact.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-primary shrink-0" />
                <span className="text-background/70">{contact.address}</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          {/* <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-3">
              {social.map((platform) => {
                const IconComponent = socialIcons[platform.icon]
                return (
                  <a
                    key={platform.name}
                    href={platform.url}
                    aria-label={platform.name}
                    className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary flex items-center justify-center transition-colors"
                  >
                    <IconComponent size={18} className="text-primary hover:text-primary-foreground" />
                  </a>
                )
              })}
            </div>
          </div> */}
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 pt-8 text-center text-sm text-background/60">
          {/* <p>&copy; {currentYear} {copyrightText}</p> */}
          <p> {copyrightText}</p>
          <div className="flex justify-center gap-4 mt-2">
            {/* {bottomLinks.map((link, index) => (
              <Link key={`${link.label}-${index}`} href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))} */}
            ProfitHax
          </div>
        </div>
      </div>
    </footer>
  )
}
