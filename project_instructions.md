# LuxMe Nails and Spa - Implementation Instructions

## Project Setup

1. Initialize Next.js project:
```bash
npx create-next-app@latest luxme-nails --typescript --tailwind --app --src-dir --import-alias "@/*"
```

2. Required Dependencies:
```json
{
  "dependencies": {
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0",
    "framer-motion": "^10.0.0",
    "react-hook-form": "^7.0.0",
    "react-datepicker": "^4.0.0",
    "react-masonry-css": "^1.0.0",
    "react-photoswipe-gallery": "^2.0.0"
  }
}
```

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── services/
│   ├── gallery/
│   └── contact/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── Hero.tsx
│   │   └── ServiceHighlight.tsx
│   ├── services/
│   │   └── ServiceCard.tsx
│   ├── gallery/
│   │   └── GalleryGrid.tsx
│   └── booking/
│       └── BookingForm.tsx
├── lib/
│   ├── types.ts
│   └── booking.ts
└── styles/
    └── globals.css
```

## Component Implementation Guidelines

### Header Component (src/components/layout/Header.tsx)
```typescript
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const Header = ({ isTransparent = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Implementation details in PRD...
};
```

### Service Card Component (src/components/services/ServiceCard.tsx)
```typescript
import Image from 'next/image';
import { motion } from 'framer-motion';

export const ServiceCard = ({ title, description, image, price, bookingLink }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-lg overflow-hidden shadow-lg"
    >
      {/* Implementation details in PRD... */}
    </motion.div>
  );
};
```

## Styling Guidelines

### Color Palette
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f9fa',
          100: '#e9ecef',
          // ... other shades
          900: '#212529'
        },
        accent: {
          // Define accent colors
        }
      }
    }
  }
}
```

### Typography
- Headings: Playfair Display
- Body: Inter
- Sizes defined in tailwind.config.js

## Integration Instructions

### Dash Booking System
1. Create booking service in `src/lib/booking.ts`
2. Implement form validation
3. Add error handling
4. Include loading states

### Image Optimization
1. Use Next/Image for all images
2. Implement lazy loading
3. Set appropriate sizes
4. Use WebP format with fallbacks

## Content Migration

### Home Page Content
- Preserve all existing copy
- Maintain service descriptions
- Keep current testimonials
- Update images with optimized versions

### Service Information
- Use current service categories
- Maintain pricing structure
- Preserve service descriptions
- Update service images

## SEO Implementation

1. Add metadata in `app/layout.tsx`:
```typescript
export const metadata = {
  title: 'LuxMe Nails and Spa | Professional Nail Care in Ottawa',
  description: 'Ottawa\'s premier nail salon offering manicures, pedicures, and spa services. Book your appointment online today.',
  // ... other metadata
};
```

2. Implement structured data for services and business information

## Testing Requirements

1. Component Testing:
```typescript
// Example test structure
describe('BookingForm', () => {
  it('validates required fields', () => {
    // Test implementation
  });
  
  it('submits form successfully', () => {
    // Test implementation
  });
});
```

2. E2E Testing:
- Test booking flow
- Verify form submissions
- Check responsive behavior

## Performance Optimization

1. Implement route prefetching
2. Add image lazy loading
3. Minimize JavaScript bundles
4. Enable server-side caching

## Security Measures

1. Add reCAPTCHA to forms
2. Implement CSRF protection
3. Sanitize user inputs
4. Set secure headers

## Analytics Setup

1. Add Google Analytics:
```typescript
// src/lib/analytics.ts
export const trackEvent = (eventName: string, properties: object) => {
  // Implementation
};
```

2. Configure goal tracking

## Deployment Guidelines

1. Environment setup
2. Build optimization
3. CDN configuration
4. SSL setup

## Content Preservation Rules

1. DO NOT modify:
- Service descriptions
- Pricing information
- Contact details
- Business hours

2. MUST preserve:
- Brand voice
- Service categories
- Testimonials
- Location information

## Error Handling

1. Implement error boundaries
2. Add form validation messages
3. Handle API errors gracefully
4. Show user-friendly error states

Remember to maintain the existing brand voice and professional tone throughout the implementation. 