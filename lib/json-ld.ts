export function generateEventJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'BBB Event 2025',
    description: 'Official BBB Event 2025 - An unforgettable experience with exclusive networking opportunities',
    startDate: '2025-03-15T10:00:00+05:30',
    endDate: '2025-03-17T18:00:00+05:30',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Event Venue Name',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Venue Address',
        addressLocality: 'City',
        addressRegion: 'State',
        postalCode: '000000',
        addressCountry: 'IN',
      },
    },
    image: [
      'https://your-domain.com/event-image.jpg',
    ],
    organizer: {
      '@type': 'Organization',
      name: 'BBB Event Organization',
      url: 'https://your-domain.com',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Platinum Ticket',
        price: '5000',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: 'https://your-domain.com/register',
        validFrom: '2024-12-01T00:00:00+05:30',
      },
      {
        '@type': 'Offer',
        name: 'Gold Ticket',
        price: '3500',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: 'https://your-domain.com/register',
        validFrom: '2024-12-01T00:00:00+05:30',
      },
      {
        '@type': 'Offer',
        name: 'Silver Ticket',
        price: '2000',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: 'https://your-domain.com/register',
        validFrom: '2024-12-01T00:00:00+05:30',
      },
    ],
  }
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BBB Event Organization',
    url: 'https://your-domain.com',
    logo: 'https://your-domain.com/logo.png',
    description: 'Official organization hosting BBB Event 2025',
    sameAs: [
      'https://facebook.com/bbbevent',
      'https://twitter.com/bbbevent',
      'https://instagram.com/bbbevent',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-XXXXXXXXXX',
      contactType: 'Customer Support',
      email: 'contact@bbbevent.com',
      availableLanguage: ['English', 'Hindi'],
    },
  }
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BBB Event 2025',
    url: 'https://your-domain.com',
    description: 'Official registration portal for BBB Event 2025',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://your-domain.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }
}
