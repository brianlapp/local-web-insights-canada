├── .DS_Store
├── .gitattributes
├── PRD.md
├── README-internal.md
├── content
    ├── grid-gallery-html.md
    ├── home.md
    ├── index-html.md
    ├── javascript--scrollto--about--.md
    ├── javascript--scrollto--contact--.md
    ├── javascript--scrollto--gallery--.md
    ├── javascript--scrollto--home--.md
    └── overview-html.md
├── page_mapping.md
├── project_instructions.md
├── project_structure.json
├── project_summary.md
└── public
    ├── .DS_Store
    ├── data
        ├── addresses.txt
        ├── all_content_summary.json
        ├── all_links.txt
        ├── contact_info.json
        ├── emails.txt
        ├── home.html
        ├── home_blocks.txt
        ├── home_content.json
        ├── home_headings.txt
        ├── home_images.txt
        ├── home_links.txt
        ├── home_lists.txt
        ├── home_paragraphs.txt
        ├── internal_links.txt
        ├── nav_links.txt
        ├── navigation.json
        ├── pages.json
        ├── phones.txt
        ├── site_info.json
        └── social_media.txt
    └── images
        ├── 1.jpg
        ├── 2.jpg
        ├── 3.jpg
        ├── 4.jpg
        └── logo.jpg


/.DS_Store:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/brianlapp/luxmenailsandspa-com/main/.DS_Store


--------------------------------------------------------------------------------
/.gitattributes:
--------------------------------------------------------------------------------
1 | # Auto detect text files and perform LF normalization
2 | * text=auto
3 | 


--------------------------------------------------------------------------------
/PRD.md:
--------------------------------------------------------------------------------
  1 | # LuxMe Nails and Spa Website Rebuild PRD
  2 | 
  3 | ## Overview
  4 | LuxMe Nails and Spa is a professional nail salon and spa service provider in Ottawa. The website serves as their primary digital presence, showcasing their services, facilitating online bookings, and highlighting their expertise in nail care and spa treatments.
  5 | 
  6 | ## Business Goals
  7 | 1. Drive service bookings through an intuitive online booking system
  8 | 2. Showcase the range of nail and spa services offered
  9 | 3. Highlight the salon's expertise and professionalism
 10 | 4. Build trust through portfolio/gallery displays
 11 | 5. Provide easy access to contact information and location details
 12 | 
 13 | ## Technical Requirements
 14 | 
 15 | ### Stack Specifications
 16 | - Framework: Next.js 14+
 17 | - UI Library: React 18+
 18 | - Styling: Tailwind CSS 3+
 19 | - Booking Integration: Dash Booking System
 20 | - Image Optimization: Next/Image
 21 | - Animations: Framer Motion
 22 | - Form Handling: React Hook Form
 23 | 
 24 | ### Core Components
 25 | 
 26 | #### Header Component
 27 | ```typescript
 28 | interface HeaderProps {
 29 |   isTransparent?: boolean;
 30 |   currentPath: string;
 31 | }
 32 | ```
 33 | - Responsive navigation with mobile hamburger menu
 34 | - Logo placement with home link
 35 | - Contact button/phone number display
 36 | - Smooth scroll navigation for single-page sections
 37 | 
 38 | #### Hero Section Component
 39 | ```typescript
 40 | interface HeroProps {
 41 |   title: string;
 42 |   subtitle: string;
 43 |   ctaText: string;
 44 |   ctaLink: string;
 45 |   backgroundImage: string;
 46 | }
 47 | ```
 48 | - Full-width design with overlay
 49 | - Prominent call-to-action button
 50 | - Mobile-responsive text sizing
 51 | - Optional video background support
 52 | 
 53 | #### Service Card Component
 54 | ```typescript
 55 | interface ServiceCardProps {
 56 |   title: string;
 57 |   description: string;
 58 |   image: string;
 59 |   price?: string;
 60 |   bookingLink: string;
 61 | }
 62 | ```
 63 | - Consistent sizing and spacing
 64 | - Hover effects for interactivity
 65 | - Price display option
 66 | - Direct booking link integration
 67 | 
 68 | #### Gallery Grid Component
 69 | ```typescript
 70 | interface GalleryGridProps {
 71 |   images: {
 72 |     src: string;
 73 |     alt: string;
 74 |     category?: string;
 75 |   }[];
 76 |   filterable?: boolean;
 77 | }
 78 | ```
 79 | - Masonry grid layout
 80 | - Lazy loading for images
 81 | - Optional category filtering
 82 | - Lightbox integration for full-size viewing
 83 | 
 84 | #### Booking Form Component
 85 | ```typescript
 86 | interface BookingFormProps {
 87 |   services: Service[];
 88 |   onSubmit: (data: BookingData) => Promise<void>;
 89 |   initialDate?: Date;
 90 | }
 91 | ```
 92 | - Integration with Dash Booking
 93 | - Service selection
 94 | - Date/time picker
 95 | - Contact information collection
 96 | 
 97 | ### Responsive Design Specifications
 98 | 
 99 | #### Breakpoints
100 | - Mobile: 320px - 639px
101 | - Tablet: 640px - 1023px
102 | - Desktop: 1024px+
103 | 
104 | #### Mobile Optimizations
105 | - Collapsible navigation menu
106 | - Stacked service cards
107 | - Simplified gallery view
108 | - Touch-friendly booking interface
109 | 
110 | ### Performance Requirements
111 | - Lighthouse score targets:
112 |   - Performance: 90+
113 |   - Accessibility: 95+
114 |   - Best Practices: 95+
115 |   - SEO: 95+
116 | - First Contentful Paint < 1.5s
117 | - Time to Interactive < 3.5s
118 | 
119 | ### Integration Points
120 | 
121 | #### Dash Booking System
122 | - Endpoint: TBD (to be provided by client)
123 | - Required data:
124 |   - Service selection
125 |   - Date/time
126 |   - Customer information
127 |   - Special requests
128 | 
129 | #### Contact Form
130 | - Email service integration
131 | - Form validation
132 | - SPAM protection
133 | - Success/error handling
134 | 
135 | ### Content Structure
136 | 
137 | #### Home Page
138 | - Hero section with booking CTA
139 | - Featured services overview
140 | - About section highlight
141 | - Gallery preview
142 | - Testimonials section
143 | - Contact information
144 | 
145 | #### Services Section
146 | - Categorized service listings
147 | - Pricing information
148 | - Service descriptions
149 | - Booking integration
150 | 
151 | #### Gallery Section
152 | - Portfolio of work
153 | - Category filtering
154 | - Before/after showcases
155 | - Image optimization
156 | 
157 | #### Contact Section
158 | - Business hours
159 | - Phone number
160 | - Location information
161 | - Contact form
162 | 
163 | ### Security Requirements
164 | - SSL certification
165 | - Form data encryption
166 | - reCAPTCHA integration
167 | - Secure booking handling
168 | 
169 | ### Analytics Integration
170 | - Google Analytics 4
171 | - Goal tracking for:
172 |   - Booking completions
173 |   - Contact form submissions
174 |   - Service page views
175 |   - Gallery interactions
176 | 
177 | ## Implementation Guidelines
178 | 
179 | ### Phase 1: Core Development
180 | 1. Setup Next.js project with TypeScript
181 | 2. Implement core components
182 | 3. Develop responsive layouts
183 | 4. Integrate Dash Booking system
184 | 
185 | ### Phase 2: Content & Design
186 | 1. Optimize images and assets
187 | 2. Implement animations
188 | 3. Fine-tune responsive behavior
189 | 4. Add SEO optimization
190 | 
191 | ### Phase 3: Testing & Launch
192 | 1. Cross-browser testing
193 | 2. Performance optimization
194 | 3. Security audit
195 | 4. Analytics setup
196 | 
197 | ## Success Metrics
198 | 1. Increased online bookings
199 | 2. Improved user engagement
200 | 3. Higher conversion rates
201 | 4. Better mobile usage statistics 


--------------------------------------------------------------------------------
/README-internal.md:
--------------------------------------------------------------------------------
 1 | #  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7 Website Rebuild Project
 2 | 
 3 | ## Project Overview
 4 | - **Source URL:** https://luxmenailsandspa.com
 5 | - **Generated on:** 2025-04-25
 6 | - **Pages Scraped:** 0
 7 | 
 8 | ## Structure
 9 | - **/content/** - Markdown files for each page
10 | - **/public/data/** - Extracted JSON data 
11 | - **/public/images/** - Downloaded images
12 | - **PRD.md** - Product Requirements Document
13 | - **project_instructions.md** - Implementation instructions for Lovable.dev
14 | 
15 | ## Next Steps
16 | 1. Review the generated PRD and content files
17 | 2. Submit to Lovable.dev
18 | 3. When repository is ready, use SyncToRepo.mcp to push content
19 | 
20 | ## Notes
21 | This project was automatically generated using the Lovable Site Builder.
22 | 


--------------------------------------------------------------------------------
/content/grid-gallery-html.md:
--------------------------------------------------------------------------------
 1 | ---
 2 | title: "View our gallery"
 3 | slug: "/grid-gallery-html"
 4 | layout: default
 5 | pageType: gallery
 6 | ---
 7 | <!-- editable-start -->
 8 | <!-- section: hero -->
 9 | <!-- component: Hero props={title: "View our gallery", backgroundImage: "/images/grid-gallery-html-hero.jpg", showCta: true, align: "center"} -->
10 | # View our gallery
11 | 
12 | <!-- section: content -->
13 | <!-- component: TextBlock props={columns: 1} -->
14 | Content for the View our gallery page.
15 | 
16 | <!-- section: contact-cta -->
17 | <!-- component: ContactCta props={buttonText: "Contact Us Today", buttonUrl: "/contact", backgroundColor: "primary"} -->
18 | ## Contact Us
19 | 
20 | Ready to learn more? [Contact us today](/contact) to get started.
21 | <!-- editable-end -->
22 | 


--------------------------------------------------------------------------------
/content/home.md:
--------------------------------------------------------------------------------
  1 | ---
  2 | title: " LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7"
  3 | slug: "/home"
  4 | layout: default
  5 | pageType: home
  6 | ---
  7 | <!-- editable-start -->
  8 | <!-- section: hero -->
  9 | <!-- component: Hero props={title: " LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7", backgroundImage: "/images/home-hero.jpg", showCta: true, align: "center"} -->
 10 | #  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7
 11 | 
 12 | <!-- section: intro -->
 13 | <!-- component: TextBlock props={columns: 1, maxWidth: "800px", align: "center"} -->
 14 | Loading...
 15 | 
 16 | 
 17 | <!-- section: -luxme-nails-and-spa- -->
 18 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 19 | ##  LuxMe Nails and Spa 
 20 | 
 21 | <!-- section: special-promotion -->
 22 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 23 | ## Special Promotion
 24 | 
 25 | <!-- section: -why-clients-choose-us- -->
 26 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 27 | ##  Why Clients Choose Us 
 28 | 
 29 | <!-- section: our-services -->
 30 | <!-- component: ServiceGrid props={services: "data.services", columns: {mobile: 1, tablet: 2, desktop: 3}, showImages: true, showPrices: true} -->
 31 | ## Our Services
 32 | 
 33 | <!-- section: -manicure- -->
 34 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 35 | ##  Manicure 
 36 | 
 37 | <!-- section: -make-up- -->
 38 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 39 | ##  Make Up 
 40 | 
 41 | <!-- section: -pedicure- -->
 42 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 43 | ##  Pedicure 
 44 | 
 45 | <!-- section: -artificial-nails- -->
 46 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 47 | ##  Artificial Nails 
 48 | 
 49 | <!-- section: -permanent-make-up- -->
 50 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 51 | ##  Permanent Make-up 
 52 | 
 53 | <!-- section: -waxing- -->
 54 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 55 | ##  Waxing 
 56 | 
 57 | <!-- section: -nail-art- -->
 58 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 59 | ##  Nail Art 
 60 | 
 61 | <!-- section: -kid-service- -->
 62 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 63 | ##  Kid service 
 64 | 
 65 | <!-- section: -additional- -->
 66 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 67 | ##  Additional 
 68 | 
 69 | <!-- section: our-services -->
 70 | <!-- component: ServiceGrid props={services: "data.services", columns: {mobile: 1, tablet: 2, desktop: 3}, showImages: true, showPrices: true} -->
 71 | ## Our Services
 72 | 
 73 | <!-- section: -manicure- -->
 74 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 75 | ##  Manicure 
 76 | 
 77 | <!-- section: -pedicure- -->
 78 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 79 | ##  Pedicure 
 80 | 
 81 | <!-- section: -art- -->
 82 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 83 | ##  Art 
 84 | 
 85 | <!-- section: our-staff -->
 86 | <!-- component: TeamGrid props={staff: "data.staff", columns: {mobile: 1, tablet: 2, desktop: 4}, showSocial: true} -->
 87 | ## Our Staff
 88 | 
 89 | <!-- section: beautiful-hands-give-confidence- -->
 90 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 91 | ## Beautiful hands give confidence!
 92 | 
 93 | <!-- section: mary-lucas -->
 94 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 95 | ## Mary Lucas
 96 | 
 97 | <!-- section: janette-wade -->
 98 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
 99 | ## Janette Wade
100 | 
101 | <!-- section: ann-smith -->
102 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
103 | ## Ann Smith
104 | 
105 | <!-- section: testimonials -->
106 | <!-- component: TestimonialCarousel props={testimonials: "data.testimonials", autoplay: true, interval: 5000, showQuotes: true} -->
107 | ## Testimonials
108 | 
109 | <!-- section: portfolio -->
110 | <!-- component: ImageGallery props={images: "data.galleryImages", columns: {mobile: 1, tablet: 2, desktop: 3}, lightbox: true} -->
111 | ## Portfolio
112 | 
113 | <!-- section: book-your-appointment-online -->
114 | <!-- component: BookingForm props={services: "data.services", responsive: {mobile: "stack", tablet: "grid-2", desktop: "grid-3"}, showCalendar: true} -->
115 | ## Book Your Appointment Online
116 | 
117 | <!-- section: hour -->
118 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
119 | ## Hour
120 | 
121 | <!-- section: address -->
122 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
123 | ## Address
124 | 
125 | <!-- section: phone -->
126 | <!-- component: Section props={backgroundColor: "light", paddingY: "large", fullWidth: true} -->
127 | ## Phone
128 | 
129 |  Let our skilled makeup artists create a flawless look tailored just for you
130 |  We ensure every pressure point is targeted for maximum relief and relaxation
131 |  Nail art is such a creative and fun way to express yourself!
132 |  Our manicure treatments stimulate nail growth and soften dry, dull skin. 
133 |  Let our nail artists create a stunning and sustainable nail design for you. 
134 |  happy clients 
135 |  team members 
136 | Founder, Senior Nail Technician
137 | Manicurist
138 | Pedicurist
139 |  We offers following services: 
140 |  We will be glad to see you anytime at our salon. 
141 | 
142 | <!-- section: gallery -->
143 | <!-- component: ImageGallery props={images: "data.homeImages", columns: {mobile: 1, tablet: 2, desktop: 3}, lightbox: true, gap: "medium"} -->
144 | ## Gallery
145 | 
146 | ![Image for  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7](/images/1.jpg)
147 | 
148 | ![Image for  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7](/images/2.jpg)
149 | 
150 | ![Image for  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7](/images/logo.jpg)
151 | 
152 | ![Image for  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7](/images/1.jpg)
153 | 
154 | ![Image for  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7](/images/service-1.jpg)
155 | 
156 | ![Image for  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7](/images/service-2.jpg)
157 | 
158 | ![Image for  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7](/images/service-3.jpg)
159 | 
160 | ![Image for  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7](/images/team-1-370x370.jpg)
161 | 
162 | ![Image for  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7](/images/team-2-370x370.jpg)
163 | 
164 | ![Image for  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7](/images/team-3-370x370.jpg)
165 | 
166 | ![Image for  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7](/images/3.jpg)
167 | 
168 | ![Image for  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7](/images/4.jpg)
169 | 
170 | 
171 | <!-- section: contact-cta -->
172 | <!-- component: ContactCta props={buttonText: "Contact Us Today", buttonUrl: "/contact", backgroundColor: "primary"} -->
173 | ## Contact Us
174 | 
175 | Ready to learn more? [Contact us today](/contact) to get started.
176 | <!-- editable-end -->
177 | 


--------------------------------------------------------------------------------
/content/index-html.md:
--------------------------------------------------------------------------------
 1 | ---
 2 | title: "Home"
 3 | slug: "/index-html"
 4 | layout: default
 5 | pageType: standard
 6 | ---
 7 | <!-- editable-start -->
 8 | <!-- section: hero -->
 9 | <!-- component: Hero props={title: "Home", backgroundImage: "/images/index-html-hero.jpg", showCta: true, align: "center"} -->
10 | # Home
11 | 
12 | <!-- section: content -->
13 | <!-- component: TextBlock props={columns: 1} -->
14 | Content for the Home page.
15 | 
16 | <!-- section: contact-cta -->
17 | <!-- component: ContactCta props={buttonText: "Contact Us Today", buttonUrl: "/contact", backgroundColor: "primary"} -->
18 | ## Contact Us
19 | 
20 | Ready to learn more? [Contact us today](/contact) to get started.
21 | <!-- editable-end -->
22 | 


--------------------------------------------------------------------------------
/content/javascript--scrollto--about--.md:
--------------------------------------------------------------------------------
 1 | ---
 2 | title: "About"
 3 | slug: "/javascript--scrollto--about--"
 4 | layout: default
 5 | pageType: about
 6 | ---
 7 | <!-- editable-start -->
 8 | <!-- section: hero -->
 9 | <!-- component: Hero props={title: "About", backgroundImage: "/images/javascript--scrollto--about---hero.jpg", showCta: true, align: "center"} -->
10 | # About
11 | 
12 | <!-- section: content -->
13 | <!-- component: TextBlock props={columns: 1} -->
14 | Content for the About page.
15 | 
16 | <!-- section: contact-cta -->
17 | <!-- component: ContactCta props={buttonText: "Contact Us Today", buttonUrl: "/contact", backgroundColor: "primary"} -->
18 | ## Contact Us
19 | 
20 | Ready to learn more? [Contact us today](/contact) to get started.
21 | <!-- editable-end -->
22 | 


--------------------------------------------------------------------------------
/content/javascript--scrollto--contact--.md:
--------------------------------------------------------------------------------
 1 | ---
 2 | title: "Contacts"
 3 | slug: "/javascript--scrollto--contact--"
 4 | layout: default
 5 | pageType: contact
 6 | ---
 7 | <!-- editable-start -->
 8 | <!-- section: hero -->
 9 | <!-- component: Hero props={title: "Contacts", backgroundImage: "/images/javascript--scrollto--contact---hero.jpg", showCta: true, align: "center"} -->
10 | # Contacts
11 | 
12 | <!-- section: content -->
13 | <!-- component: TextBlock props={columns: 1} -->
14 | Content for the Contacts page.
15 | <!-- editable-end -->
16 | 


--------------------------------------------------------------------------------
/content/javascript--scrollto--gallery--.md:
--------------------------------------------------------------------------------
 1 | ---
 2 | title: "Gallery"
 3 | slug: "/javascript--scrollto--gallery--"
 4 | layout: default
 5 | pageType: gallery
 6 | ---
 7 | <!-- editable-start -->
 8 | <!-- section: hero -->
 9 | <!-- component: Hero props={title: "Gallery", backgroundImage: "/images/javascript--scrollto--gallery---hero.jpg", showCta: true, align: "center"} -->
10 | # Gallery
11 | 
12 | <!-- section: content -->
13 | <!-- component: TextBlock props={columns: 1} -->
14 | Content for the Gallery page.
15 | 
16 | <!-- section: contact-cta -->
17 | <!-- component: ContactCta props={buttonText: "Contact Us Today", buttonUrl: "/contact", backgroundColor: "primary"} -->
18 | ## Contact Us
19 | 
20 | Ready to learn more? [Contact us today](/contact) to get started.
21 | <!-- editable-end -->
22 | 


--------------------------------------------------------------------------------
/content/javascript--scrollto--home--.md:
--------------------------------------------------------------------------------
 1 | ---
 2 | title: "Home"
 3 | slug: "/javascript--scrollto--home--"
 4 | layout: default
 5 | pageType: standard
 6 | ---
 7 | <!-- editable-start -->
 8 | <!-- section: hero -->
 9 | <!-- component: Hero props={title: "Home", backgroundImage: "/images/javascript--scrollto--home---hero.jpg", showCta: true, align: "center"} -->
10 | # Home
11 | 
12 | <!-- section: content -->
13 | <!-- component: TextBlock props={columns: 1} -->
14 | Content for the Home page.
15 | 
16 | <!-- section: contact-cta -->
17 | <!-- component: ContactCta props={buttonText: "Contact Us Today", buttonUrl: "/contact", backgroundColor: "primary"} -->
18 | ## Contact Us
19 | 
20 | Ready to learn more? [Contact us today](/contact) to get started.
21 | <!-- editable-end -->
22 | 


--------------------------------------------------------------------------------
/content/overview-html.md:
--------------------------------------------------------------------------------
 1 | ---
 2 | title: "Book Now"
 3 | slug: "/overview-html"
 4 | layout: default
 5 | pageType: standard
 6 | ---
 7 | <!-- editable-start -->
 8 | <!-- section: hero -->
 9 | <!-- component: Hero props={title: "Book Now", backgroundImage: "/images/overview-html-hero.jpg", showCta: true, align: "center"} -->
10 | # Book Now
11 | 
12 | <!-- section: content -->
13 | <!-- component: TextBlock props={columns: 1} -->
14 | Content for the Book Now page.
15 | 
16 | <!-- section: contact-cta -->
17 | <!-- component: ContactCta props={buttonText: "Contact Us Today", buttonUrl: "/contact", backgroundColor: "primary"} -->
18 | ## Contact Us
19 | 
20 | Ready to learn more? [Contact us today](/contact) to get started.
21 | <!-- editable-end -->
22 | 


--------------------------------------------------------------------------------
/page_mapping.md:
--------------------------------------------------------------------------------
 1 | # Page Content Mapping
 2 | 
 3 | | Markdown File | Page Route | Title |
 4 | |---------------|------------|-------|
 5 | | grid-gallery-html.md | /grid-gallery-html | View our gallery |
 6 | | home.md | /home |  LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7 |
 7 | | index-html.md | /index-html | Home |
 8 | | javascript--scrollto--about--.md | /javascript--scrollto--about-- | About |
 9 | | javascript--scrollto--contact--.md | /javascript--scrollto--contact-- | Contacts |
10 | | javascript--scrollto--gallery--.md | /javascript--scrollto--gallery-- | Gallery |
11 | | javascript--scrollto--home--.md | /javascript--scrollto--home-- | Home |
12 | | overview-html.md | /overview-html | Book Now |
13 | 


--------------------------------------------------------------------------------
/project_instructions.md:
--------------------------------------------------------------------------------
  1 | # LuxMe Nails and Spa - Implementation Instructions
  2 | 
  3 | ## Project Setup
  4 | 
  5 | 1. Initialize Next.js project:
  6 | ```bash
  7 | npx create-next-app@latest luxme-nails --typescript --tailwind --app --src-dir --import-alias "@/*"
  8 | ```
  9 | 
 10 | 2. Required Dependencies:
 11 | ```json
 12 | {
 13 |   "dependencies": {
 14 |     "@headlessui/react": "^1.7.0",
 15 |     "@heroicons/react": "^2.0.0",
 16 |     "framer-motion": "^10.0.0",
 17 |     "react-hook-form": "^7.0.0",
 18 |     "react-datepicker": "^4.0.0",
 19 |     "react-masonry-css": "^1.0.0",
 20 |     "react-photoswipe-gallery": "^2.0.0"
 21 |   }
 22 | }
 23 | ```
 24 | 
 25 | ## Directory Structure
 26 | 
 27 | ```
 28 | src/
 29 | ├── app/
 30 | │   ├── layout.tsx
 31 | │   ├── page.tsx
 32 | │   ├── services/
 33 | │   ├── gallery/
 34 | │   └── contact/
 35 | ├── components/
 36 | │   ├── layout/
 37 | │   │   ├── Header.tsx
 38 | │   │   └── Footer.tsx
 39 | │   ├── home/
 40 | │   │   ├── Hero.tsx
 41 | │   │   └── ServiceHighlight.tsx
 42 | │   ├── services/
 43 | │   │   └── ServiceCard.tsx
 44 | │   ├── gallery/
 45 | │   │   └── GalleryGrid.tsx
 46 | │   └── booking/
 47 | │       └── BookingForm.tsx
 48 | ├── lib/
 49 | │   ├── types.ts
 50 | │   └── booking.ts
 51 | └── styles/
 52 |     └── globals.css
 53 | ```
 54 | 
 55 | ## Component Implementation Guidelines
 56 | 
 57 | ### Header Component (src/components/layout/Header.tsx)
 58 | ```typescript
 59 | import { useState, useEffect } from 'react';
 60 | import Link from 'next/link';
 61 | import { motion } from 'framer-motion';
 62 | 
 63 | export const Header = ({ isTransparent = false }) => {
 64 |   const [isOpen, setIsOpen] = useState(false);
 65 |   const [scrolled, setScrolled] = useState(false);
 66 |   
 67 |   // Implementation details in PRD...
 68 | };
 69 | ```
 70 | 
 71 | ### Service Card Component (src/components/services/ServiceCard.tsx)
 72 | ```typescript
 73 | import Image from 'next/image';
 74 | import { motion } from 'framer-motion';
 75 | 
 76 | export const ServiceCard = ({ title, description, image, price, bookingLink }) => {
 77 |   return (
 78 |     <motion.div
 79 |       whileHover={{ scale: 1.02 }}
 80 |       className="rounded-lg overflow-hidden shadow-lg"
 81 |     >
 82 |       {/* Implementation details in PRD... */}
 83 |     </motion.div>
 84 |   );
 85 | };
 86 | ```
 87 | 
 88 | ## Styling Guidelines
 89 | 
 90 | ### Color Palette
 91 | ```typescript
 92 | // tailwind.config.js
 93 | module.exports = {
 94 |   theme: {
 95 |     extend: {
 96 |       colors: {
 97 |         primary: {
 98 |           50: '#f8f9fa',
 99 |           100: '#e9ecef',
100 |           // ... other shades
101 |           900: '#212529'
102 |         },
103 |         accent: {
104 |           // Define accent colors
105 |         }
106 |       }
107 |     }
108 |   }
109 | }
110 | ```
111 | 
112 | ### Typography
113 | - Headings: Playfair Display
114 | - Body: Inter
115 | - Sizes defined in tailwind.config.js
116 | 
117 | ## Integration Instructions
118 | 
119 | ### Dash Booking System
120 | 1. Create booking service in `src/lib/booking.ts`
121 | 2. Implement form validation
122 | 3. Add error handling
123 | 4. Include loading states
124 | 
125 | ### Image Optimization
126 | 1. Use Next/Image for all images
127 | 2. Implement lazy loading
128 | 3. Set appropriate sizes
129 | 4. Use WebP format with fallbacks
130 | 
131 | ## Content Migration
132 | 
133 | ### Home Page Content
134 | - Preserve all existing copy
135 | - Maintain service descriptions
136 | - Keep current testimonials
137 | - Update images with optimized versions
138 | 
139 | ### Service Information
140 | - Use current service categories
141 | - Maintain pricing structure
142 | - Preserve service descriptions
143 | - Update service images
144 | 
145 | ## SEO Implementation
146 | 
147 | 1. Add metadata in `app/layout.tsx`:
148 | ```typescript
149 | export const metadata = {
150 |   title: 'LuxMe Nails and Spa | Professional Nail Care in Ottawa',
151 |   description: 'Ottawa\'s premier nail salon offering manicures, pedicures, and spa services. Book your appointment online today.',
152 |   // ... other metadata
153 | };
154 | ```
155 | 
156 | 2. Implement structured data for services and business information
157 | 
158 | ## Testing Requirements
159 | 
160 | 1. Component Testing:
161 | ```typescript
162 | // Example test structure
163 | describe('BookingForm', () => {
164 |   it('validates required fields', () => {
165 |     // Test implementation
166 |   });
167 |   
168 |   it('submits form successfully', () => {
169 |     // Test implementation
170 |   });
171 | });
172 | ```
173 | 
174 | 2. E2E Testing:
175 | - Test booking flow
176 | - Verify form submissions
177 | - Check responsive behavior
178 | 
179 | ## Performance Optimization
180 | 
181 | 1. Implement route prefetching
182 | 2. Add image lazy loading
183 | 3. Minimize JavaScript bundles
184 | 4. Enable server-side caching
185 | 
186 | ## Security Measures
187 | 
188 | 1. Add reCAPTCHA to forms
189 | 2. Implement CSRF protection
190 | 3. Sanitize user inputs
191 | 4. Set secure headers
192 | 
193 | ## Analytics Setup
194 | 
195 | 1. Add Google Analytics:
196 | ```typescript
197 | // src/lib/analytics.ts
198 | export const trackEvent = (eventName: string, properties: object) => {
199 |   // Implementation
200 | };
201 | ```
202 | 
203 | 2. Configure goal tracking
204 | 
205 | ## Deployment Guidelines
206 | 
207 | 1. Environment setup
208 | 2. Build optimization
209 | 3. CDN configuration
210 | 4. SSL setup
211 | 
212 | ## Content Preservation Rules
213 | 
214 | 1. DO NOT modify:
215 | - Service descriptions
216 | - Pricing information
217 | - Contact details
218 | - Business hours
219 | 
220 | 2. MUST preserve:
221 | - Brand voice
222 | - Service categories
223 | - Testimonials
224 | - Location information
225 | 
226 | ## Error Handling
227 | 
228 | 1. Implement error boundaries
229 | 2. Add form validation messages
230 | 3. Handle API errors gracefully
231 | 4. Show user-friendly error states
232 | 
233 | Remember to maintain the existing brand voice and professional tone throughout the implementation. 


--------------------------------------------------------------------------------
/project_structure.json:
--------------------------------------------------------------------------------
 1 | {
 2 |   "name": "Book Now",
 3 |   "version": "1.0.0",
 4 |   "description": "Website for Book Now",
 5 |   "projectType": "website",
 6 |   "framework": "nextjs",
 7 |   "styling": "tailwind",
 8 |   "backend": "supabase",
 9 |   "siteUrl": "https://luxmenailsandspa.com",
10 |   "lastScraped": "2025-04-25",
11 |   "contentStructure": {
12 |     "pagesDirectory": "/content",
13 |     "dataDirectory": "/public/data",
14 |     "imagesDirectory": "/public/images",
15 |     "componentsDirectory": "/public/components"
16 |   }
17 | }
18 | 


--------------------------------------------------------------------------------
/project_summary.md:
--------------------------------------------------------------------------------
  1 | # LuxMe Nails and Spa - Project Summary
  2 | 
  3 | ## Key Findings from Site Analysis
  4 | 
  5 | 1. **Core Business Focus**
  6 |    - Professional nail salon and spa services
  7 |    - Located in Ottawa
  8 |    - Emphasis on quality and customer experience
  9 |    - Online booking integration through Dash Booking
 10 | 
 11 | 2. **Current Site Structure**
 12 |    - Single page design with smooth scroll sections
 13 |    - Key sections: Home, About, Services, Gallery, Contact
 14 |    - Integrated booking system
 15 |    - Mobile-responsive layout
 16 | 
 17 | 3. **Content Assets**
 18 |    - Professional service descriptions
 19 |    - High-quality images (some need optimization)
 20 |    - Clear service categorization
 21 |    - Contact information and business hours
 22 | 
 23 | ## Website Structure and Content Insights
 24 | 
 25 | ### Navigation Structure
 26 | - Primary navigation with smooth scroll
 27 | - Mobile-friendly hamburger menu
 28 | - Quick access to booking and contact
 29 | 
 30 | ### Content Organization
 31 | | Section | Purpose | Key Elements |
 32 | |---------|----------|-------------|
 33 | | Home | First impression & CTAs | Hero banner, service highlights |
 34 | | About | Build trust | Team info, expertise highlights |
 35 | | Services | Service offerings | Categories, pricing, descriptions |
 36 | | Gallery | Portfolio showcase | Work samples, categorized display |
 37 | | Contact | Business information | Hours, location, contact form |
 38 | 
 39 | ### Content File Mapping
 40 | | Website Route | Content File Path | Description |
 41 | |---------------|-------------------|-------------|
 42 | | `/` | `/content/home.md` | Main landing page content |
 43 | | `/services` | `/content/services.md` | Service listings and details |
 44 | | `/gallery` | `/content/gallery.md` | Portfolio and image gallery |
 45 | | `/contact` | `/content/contact.md` | Contact information and form |
 46 | 
 47 | ## Current Site Analysis
 48 | 
 49 | ### Strengths
 50 | 1. Clear service presentation
 51 | 2. Professional imagery
 52 | 3. Integrated booking system
 53 | 4. Mobile-responsive design
 54 | 5. Strong call-to-actions
 55 | 
 56 | ### Areas for Improvement
 57 | 1. Image optimization needed
 58 | 2. Loading performance
 59 | 3. SEO optimization
 60 | 4. Enhanced gallery functionality
 61 | 5. More interactive elements
 62 | 
 63 | ## Top 3 Improvement Opportunities
 64 | 
 65 | 1. **Performance Optimization**
 66 |    - Implement Next.js Image optimization
 67 |    - Add lazy loading
 68 |    - Optimize JavaScript bundles
 69 |    - Implement caching strategies
 70 | 
 71 | 2. **User Experience Enhancement**
 72 |    - Add interactive service cards
 73 |    - Implement smooth animations
 74 |    - Improve mobile navigation
 75 |    - Enhanced gallery features
 76 | 
 77 | 3. **Conversion Optimization**
 78 |    - Streamline booking process
 79 |    - Add service filtering
 80 |    - Implement better CTAs
 81 |    - Add testimonial section
 82 | 
 83 | ## Implementation Guidelines
 84 | 
 85 | ### Content Integration
 86 | 1. Preserve all existing service descriptions
 87 | 2. Maintain current pricing structure
 88 | 3. Keep testimonials and reviews
 89 | 4. Update image assets with optimization
 90 | 
 91 | ### Data Integration
 92 | 1. Set up Dash Booking API connection
 93 | 2. Implement contact form handling
 94 | 3. Configure analytics tracking
 95 | 4. Set up SEO metadata
 96 | 
 97 | ### Image Integration
 98 | 1. Convert all images to Next.js Image components
 99 | 2. Implement WebP format with fallbacks
100 | 3. Add lazy loading
101 | 4. Set up CDN integration
102 | 
103 | ### Component Development
104 | 1. Build reusable UI components
105 | 2. Implement responsive designs
106 | 3. Add animation effects
107 | 4. Ensure accessibility compliance
108 | 
109 | ## Next Steps
110 | 
111 | ### Phase 1: Setup & Structure (Week 1)
112 | - [ ] Initialize Next.js project
113 | - [ ] Set up development environment
114 | - [ ] Create component structure
115 | - [ ] Implement basic routing
116 | 
117 | ### Phase 2: Core Development (Weeks 2-3)
118 | - [ ] Develop main components
119 | - [ ] Implement booking system
120 | - [ ] Create responsive layouts
121 | - [ ] Add animations and interactions
122 | 
123 | ### Phase 3: Content & Optimization (Week 4)
124 | - [ ] Migrate existing content
125 | - [ ] Optimize images and assets
126 | - [ ] Implement SEO improvements
127 | - [ ] Add analytics tracking
128 | 
129 | ### Phase 4: Testing & Launch (Week 5)
130 | - [ ] Conduct thorough testing
131 | - [ ] Perform security audit
132 | - [ ] Optimize performance
133 | - [ ] Prepare for deployment
134 | 
135 | ## Technical Specifications
136 | 
137 | ### Development Stack
138 | - Next.js 14+
139 | - React 18+
140 | - TypeScript 5+
141 | - Tailwind CSS 3+
142 | - Framer Motion
143 | - React Hook Form
144 | 
145 | ### Performance Targets
146 | - Lighthouse Performance: 90+
147 | - First Contentful Paint: < 1.5s
148 | - Time to Interactive: < 3.5s
149 | - Core Web Vitals compliance
150 | 
151 | ### Browser Support
152 | - Chrome (latest 2 versions)
153 | - Firefox (latest 2 versions)
154 | - Safari (latest 2 versions)
155 | - Edge (latest 2 versions)
156 | - Mobile browsers (iOS 14+, Android 8+)
157 | 
158 | ## Success Metrics
159 | 
160 | ### Key Performance Indicators
161 | 1. Online booking conversion rate
162 | 2. Page load times
163 | 3. Mobile usage metrics
164 | 4. User engagement metrics
165 | 
166 | ### Monitoring Tools
167 | 1. Google Analytics 4
168 | 2. Core Web Vitals
169 | 3. Custom event tracking
170 | 4. Conversion tracking
171 | 
172 | Remember to maintain regular communication and updates throughout the development process. 


--------------------------------------------------------------------------------
/public/.DS_Store:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/brianlapp/luxmenailsandspa-com/main/public/.DS_Store


--------------------------------------------------------------------------------
/public/data/addresses.txt:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/brianlapp/luxmenailsandspa-com/main/public/data/addresses.txt


--------------------------------------------------------------------------------
/public/data/all_content_summary.json:
--------------------------------------------------------------------------------
 1 | {
 2 |   "pages": [
 3 |     {
 4 |       "slug": "home",
 5 |       "title": " LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7",
 6 |       "description": "",
 7 |       "content_file": "home_content.json",
 8 |       "stats": {
 9 |         "headings": 28,
10 |         "paragraphs": 88,
11 |         "images": 12
12 |       }
13 |     }
14 |   ],
15 |   "site_info": {
16 |     "title": " LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7",
17 |     "description": "",
18 |     "page_count": 1
19 |   }
20 | }
21 | 


--------------------------------------------------------------------------------
/public/data/all_links.txt:
--------------------------------------------------------------------------------
 1 | blog-classic.html
 2 | contacts.html
 3 | grid-gallery.html
 4 | index.html
 5 | our-team.html
 6 | overview.html
 7 | services.html
 8 | team-member-profile.html
 9 | tel:+16137798540
10 | 


--------------------------------------------------------------------------------
/public/data/contact_info.json:
--------------------------------------------------------------------------------
 1 | {
 2 |   "emails": [
 3 | 
 4 |   ],
 5 |   "phones": [
 6 |     "+16137798540",
 7 |     "6137798540"
 8 |   ],
 9 |   "addresses": [
10 | 
11 |   ],
12 |   "social_media": [
13 | 
14 |   ]
15 | }
16 | 


--------------------------------------------------------------------------------
/public/data/emails.txt:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/brianlapp/luxmenailsandspa-com/main/public/data/emails.txt


--------------------------------------------------------------------------------
/public/data/home.html:
--------------------------------------------------------------------------------
  1 | <!DOCTYPE html>
  2 | <html class="wide wow-animation" lang="en">
  3 | 
  4 | <head>
  5 |     <!-- Google SEO -->
  6 |     <title> LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7</title>
  7 |     <meta name="keywords" content="Nail salon in Ottawa,  LuxMe Nails and Spa on 2430 Bank St #9, ON K1V 0T7" />
  8 |     <meta name="author" content="LuxMe Nails and Spa - 2430 Bank St #9 - Nail salon in Ottawa, ON K1V 0T7" />
  9 |     <meta name="description"
 10 |         content="LuxMe Nails and Spa located conveniently in Ottawa, ON K1V 0T7, LuxMe Nails and Spa is one of the best salons in this area" />
 11 |     <!-- Geo location -->
 12 |     <meta name="geo.region" content="CA-ON" />
 13 |     <meta name="geo.placename" content="Ottawa" />
 14 |     <meta name="geo.position" content="45.3533796;-75.6489439" />
 15 |     <meta name="ICBM" content="45.3533796,-75.6489439" />
 16 |     <link rel="canonical" href="https://luxmenailsandspa.com/" />
 17 |     <meta name="Description"
 18 |         content="LuxMe Nails and Spa is a full-service nail salon located at 2430 Bank St #9 in Ottawa. The salon offers a wide range of services including eyelash extensions, waxing, manicure, pedicure, and more. With a team of highly skilled technicians, LuxMe Nails and Spa provides exceptional services that leave clients feeling pampered and refreshed" />
 19 |     <!-- OG -->
 20 |     <meta property="og:title" content="LuxMe Nails and Spa - 2430 Bank St #9 - Nail salon in Ottawa, ON K1V 0T7" />
 21 |     <meta property="og:description"
 22 |         content="LuxMe Nails and Spa is a full-service nail salon located at 2430 Bank St #9, Ottawa, ON K1V 0T7. The salon offers a wide range of services including eyelash extensions, waxing, manicure, pedicure, and more. With a team of highly skilled technicians, LuxMe Nails and Spa provides exceptional services that leave clients feeling pampered and refreshed" />
 23 |     <meta property="og:image" content="https://luxmenailsandspa.com/photos/home/3.jpg" />
 24 |     <meta property="og:url" content="https://luxmenailsandspa.com" />
 25 |     <meta property="og:type" content="website" />
 26 |     <meta property="og:site_name" content="LuxMe Nails and Spa - 2430 Bank St #9 - Nail salon in Ottawa, ON K1V 0T7" />
 27 |     <!-- Dublin Core -->
 28 |     <link rel="schema.DC" href="http://purl.org/dc/elements/1.1/" />
 29 |     <meta name="DC.title" content="LuxMe Nails and Spa - 2430 Bank St #9 - Nail salon in Ottawa, ON K1V 0T7" />
 30 |     <meta name="DC.identifier" content="https://luxmenailsandspa.com/" />
 31 |     <meta name="DC.description"
 32 |         content="LuxMe Nails and Spa is a full-service nail salon located at 2430 Bank St #9 in Ottawa, ON K1V 0T7. The salon offers a wide range of services including eyelash extensions, waxing, manicure, pedicure, and more. With a team of highly skilled technicians, LuxMe Nails and Spa provides exceptional services that leave clients feeling pampered and refreshed" />
 33 |     <meta name="DC.subject" content="LuxMe Nails and Spa - 2430 Bank St #9 - Nail salon in Ottawa, ON K1V 0T7" />
 34 |     <meta itemprop="priceRange" name="priceRange" content="" />
 35 |     <meta name="format-detection" content="telephone=no" />
 36 |     <meta name="viewport"
 37 |         content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
 38 |     <meta http-equiv="X-UA-Compatible" content="IE=edge" />
 39 |     <meta charset="utf-8" />
 40 |     <!-- <link rel="icon" href="images/favicon.ico" type="image/x-icon"> -->
 41 |     <!-- Stylesheets-->
 42 |     <!-- <link rel="stylesheet" type="text/css"
 43 |         href="//fonts.googleapis.com/css?family=Lato:300i,400,400i,700%7CMontserrat:400,500,600,700%7CPlayfair+Display:400,700,700i%7COswald:400,700,700i" /> -->
 44 |     <link rel="stylesheet" href="css/bootstrap.css" />
 45 |     <link rel="stylesheet" href="css/fonts.css" />
 46 |     <link rel="stylesheet" href="css/style.css" />
 47 | </head>
 48 | 
 49 | <body>
 50 |     <div class="preloader">
 51 |         <div class="preloader-body">
 52 |             <div class="cssload-container">
 53 |                 <div class="cssload-speeding-wheel"></div>
 54 |             </div>
 55 |             <p>Loading...</p>
 56 |         </div>
 57 |     </div>
 58 |     <div class="page">
 59 |         <!-- Page Header-->
 60 |         <header class="section page-header">
 61 |             <!-- RD Navbar-->
 62 |             <div class="rd-navbar-wrap">
 63 |                 <nav class="rd-navbar rd-navbar-classic rd-navbar-classic-minimal" data-layout="rd-navbar-fixed"
 64 |                     data-sm-layout="rd-navbar-fixed" data-md-layout="rd-navbar-fixed"
 65 |                     data-md-device-layout="rd-navbar-fixed" data-lg-layout="rd-navbar-static"
 66 |                     data-lg-device-layout="rd-navbar-static" data-xl-layout="rd-navbar-static"
 67 |                     data-xl-device-layout="rd-navbar-static" data-lg-stick-up-offset="46px"
 68 |                     data-xl-stick-up-offset="46px" data-xxl-stick-up-offset="46px" data-lg-stick-up="true"
 69 |                     data-xl-stick-up="true" data-xxl-stick-up="true">
 70 |                     <div class="rd-navbar-aside-outer rd-navbar-collapse novi-bg novi-bg-img">
 71 |                         <div class="rd-navbar-aside">
 72 |                             <div class="header-info">
 73 |                                 <ul class="list-inline list-inline-md">
 74 |                                     <li>
 75 |                                         <div class="unit unit-spacing-xs align-items-center">
 76 |                                             <div class="unit-left fw-bold"> Call: </div>
 77 |                                             <div class="unit-body">
 78 |                                                 <a href="#" class="phone">(613) 779-8540</a>
 79 |                                             </div>
 80 |                                         </div>
 81 |                                     </li>
 82 |                                 </ul>
 83 |                             </div>
 84 |                             <div class="social-block">
 85 |                                 <ul class="list-inline social-media-list">
 86 |                                 </ul>
 87 |                             </div>
 88 |                         </div>
 89 |                     </div>
 90 |                     <div class="rd-navbar-main-outer">
 91 |                         <div class="rd-navbar-main">
 92 |                             <!-- RD Navbar Panel-->
 93 |                             <div class="rd-navbar-panel">
 94 |                                 <!-- RD Navbar Toggle-->
 95 |                                 <button class="rd-navbar-toggle" data-rd-navbar-toggle=".rd-navbar-nav-wrap">
 96 |                                     <span></span>
 97 |                                 </button>
 98 |                                 <!-- RD Navbar Brand-->
 99 |                                 <div class="rd-navbar-brand">
100 |                                     <a href="index.html">
101 |                                         <h1 class="brand"> LuxMe Nails and Spa </h1>
102 |                                         <!-- <img src="images/logo-dark-3-158x58.png"
103 |                       alt="" width="158" height="58" /> -->
104 |                                     </a>
105 |                                 </div>
106 |                             </div>
107 |                             <div class="rd-navbar-main-element">
108 |                                 <div class="rd-navbar-nav-wrap">
109 |                                     <!-- RD Navbar Nav-->
110 |                                     <ul class="rd-navbar-nav">
111 |                                         <li class="rd-nav-item active">
112 |                                             <a class="rd-nav-link" href="javascript: scrollto('home')">Home</a>
113 |                                         </li>
114 |                                         <li class="rd-nav-item">
115 |                                             <a class="rd-nav-link" href="javascript: scrollto('about')">About</a>
116 |                                         </li>
117 |                                         <li class="rd-nav-item">
118 |                                             <a class="rd-nav-link booking-link" href="#">Services</a>
119 |                                         </li>
120 |                                         <li class="rd-nav-item">
121 |                                             <a class="rd-nav-link" href="javascript: scrollto('gallery')">Gallery</a>
122 |                                         </li>
123 |                                         <li class="rd-nav-item">
124 |                                             <a class="rd-nav-link" href="javascript: scrollto('contact')">Contacts</a>
125 |                                         </li>
126 |                                     </ul>
127 |                                 </div>
128 |                             </div>
129 |                         </div>
130 |                     </div>
131 |                 </nav>
132 |             </div>
133 |         </header>
134 |         <!-- Swiper-->
135 |         <section class="section swiper-container swiper-slider swiper-slider-2 slider-scale-effect"
136 |             data-swiper='{"autoplay":{"delay":5500},"effect":"fade","simulateTouch":false,"loop":false}'>
137 |             <div class="swiper-wrapper">
138 |                 <div class="swiper-slide">
139 |                     <div class="slide-bg" style="
140 |                                 background-image: url('photos/home/slide-1.jpg');
141 |                             "></div>
142 |                     <div class="swiper-slide-caption section-md">
143 |                         <div class="container">
144 |                             <div class="row">
145 |                                 <div class="col-sm-10 col-lg-7 col-xl-6 swiper-caption-inner">
146 |                                     <h1 data-caption-animate="fadeInUp"
147 |                                         style="padding:10px; border-radius: 10px; background-color:rgb(0,0,0,0.2);"
148 |                                         data-caption-delay="100" class="text-white">
149 |                                         <span class="text-primary ">Volcano Spa Pedicure Box</span> Creating Beauty
150 |                                     </h1>
151 |                                     <div class="divider-lg" data-caption-animate="fadeInLeft" data-caption-delay="550">
152 |                                     </div>
153 |                                     <p class="lead text-white"
154 |                                         style="padding:10px; border-radius: 10px; background-color:rgb(0,0,0,0.2);"
155 |                                         data-caption-animate="fadeInUp" data-caption-delay="250"> Unleash the power of
156 |                                         nature's finest ingredients with our Volcano Spa Pedicure Box and treat yourself
157 |                                         to an unforgettable spa experience without ever leaving your home. </p>
158 |                                     <a class="button button-default-outline booking-link text-white z-2"
159 |                                         href="www.dashbooking.com" data-caption-animate="fadeInUp"
160 |                                         data-caption-delay="450">Book Now</a>
161 |                                 </div>
162 |                             </div>
163 |                         </div>
164 |                     </div>
165 |                 </div>
166 |                 <div class="swiper-slide">
167 |                     <div class="slide-bg" style="
168 |                                 background-image: url('photos/home/slide-2.jpg');
169 |                             "></div>
170 |                     <div class="swiper-slide-caption section-md">
171 |                         <div class="container">
172 |                             <div class="row">
173 |                                 <div class="col-sm-10 col-lg-7 col-xl-6 swiper-caption-inner">
174 |                                     <h1 data-caption-animate="fadeInUp" class="text-white"
175 |                                         style="padding:10px; border-radius: 10px; background-color:rgb(0,0,0,0.2);"
176 |                                         data-caption-delay="100"> Be <span class="text-primary">Different</span>
177 |                                         with<br />Our Nail Design </h1>
178 |                                     <div class="divider-lg" data-caption-animate="fadeInLeft" data-caption-delay="550">
179 |                                     </div>
180 |                                     <p class="lead text-white" data-caption-animate="fadeInUp"
181 |                                         style="padding:10px; border-radius: 10px; background-color:rgb(0,0,0,0.2);"
182 |                                         data-caption-delay="250"> Our qualified team provides a full range of nail
183 |                                         design services to satisfy even the most demanding clients. With our help, you
184 |                                         can easily acquire a new look for your nails to stand out from the crowd. </p>
185 |                                     <a class="button button-default-outline booking-link text-white z-2" href="#"
186 |                                         data-caption-animate="fadeInUp" data-caption-delay="450">Book Now</a>
187 |                                 </div>
188 |                             </div>
189 |                         </div>
190 |                     </div>
191 |                 </div>
192 |                 <div class="swiper-slide">
193 |                     <div class="slide-bg" style="
194 |                                 background-image: url('photos/home/slide-3.jpg');
195 |                             "></div>
196 |                     <div class="swiper-slide-caption section-md">
197 |                         <div class="container">
198 |                             <div class="row">
199 |                                 <div class="col-sm-10 col-lg-7 col-xl-6 swiper-caption-inner">
200 |                                     <h1 class="heading-decorate text-white"
201 |                                         style="padding:10px; border-radius: 10px; background-color:rgb(0,0,0,0.2);"
202 |                                         data-caption-animate="fadeInUp" data-caption-delay="100"> Expert <span
203 |                                             class="text-primary">Nail Service</span><br />At a greate price </h1>
204 |                                     <div class="divider-lg" data-caption-animate="fadeInLeft" data-caption-delay="550">
205 |                                     </div>
206 |                                     <p class="lead text-white"
207 |                                         style="padding:10px; border-radius: 10px; background-color:rgb(0,0,0,0.2);"
208 |                                         data-caption-animate="fadeInUp" data-caption-delay="250"> Take advantage of our
209 |                                         full range of nail services, delivered at a great price with sensational
210 |                                         customer service from the professional technicians at LuxMe Nails and Spa in
211 |                                         Ottawa, and leave feeling refreshed, uplifted and rejuvenated. </p>
212 |                                     <a class="button button-default-outline booking-link text-white z-2" href="#"
213 |                                         data-caption-animate="fadeInUp" data-caption-delay="450">Book Now</a>
214 |                                 </div>
215 |                             </div>
216 |                         </div>
217 |                     </div>
218 |                 </div>
219 |             </div>
220 |             <!-- Swiper Pagination -->
221 |             <div class="swiper-pagination"></div>
222 |             <div class="swiper-button-prev"></div>
223 |             <div class="swiper-button-next"></div>
224 |         </section>
225 |         <section class="section section-lg  text-center promotions">
226 |             <div class="container">
227 |                 <h2 class="title-color animated-up styling-header">Special Promotion</h2>
228 |                 <div class="divider-lg"></div>
229 |                 <swiper-container class="promotionSwiper" pagination="false" effect="slide" grab-cursor="true"
230 |                     centered-slides="true" slides-per-view="1" speed="3000" loop="true" autoplay="true"
231 |                     pause-on-mouse-enter="true">
232 |                 </swiper-container>
233 |                 <a href="#" class="promotion-text-color booking-link"><small class=" mt-3">Terms and Conditions
234 |                         Applied</small></a>
235 |             </div>
236 |         </section>
237 | 
238 |         <section class="section section-lg bg-gray-100" id="about">
239 |             <div class="container">
240 |                 <div class="row row-50 align-items-lg-center justify-content-xl-between">
241 |                     <!-- <div class="col-lg-6">
242 |                         <div class="box-images box-images-modern">
243 |                             <div class="box-images-item" data-parallax-scroll='{"y": -10,   "smoothness": 30 }'>
244 |                                 <img src="photos/home/1.jpg" alt="" width="310" height="370" />
245 |                             </div>
246 |                             <div class="box-images-item box-images-without-border"
247 |                                 data-parallax-scroll='{"y": 40,  "smoothness": 30 }'>
248 |                                 <img src="photos/home/2.jpg" alt="" width="328" height="389" />
249 |                             </div>
250 |                         </div>
251 |                     </div> -->
252 |                     <div class="col-lg-6 col-xl-5">
253 |                         <h2 class="heading-decorate"> Why Clients <br /><span class="divider"></span>Choose Us </h2>
254 |                         <p class="big"> We understand the importance of convenience in today's fast-paced world. With
255 |                             our easy-to-use online booking system, scheduling your appointment at LuxMe Nails and Spa is
256 |                             quick and hassle-free. Simply select your desired services and preferred time slot, and let
257 |                             us take care of the rest.</p>
258 |                         <p class="big"> At LuxMe Nails and Spa, we believe that beauty is in the details, which is why
259 |                             our team of skilled technicians is dedicated to delivering exquisite manicures, pedicures,
260 |                             and spa treatments tailored to your unique style and preferences. Whether you're looking for
261 |                             a classic French manicure, a bold and trendy nail art design, or a rejuvenating spa
262 |                             experience, we have the expertise and creativity to bring your vision to life.</p>
263 |                         <p class="big"> Convenience is key, and that's why we offer online booking through Dash Booking,
264 |                             allowing you to schedule your appointments with ease and flexibility. Say goodbye to waiting
265 |                             on hold or trying to coordinate your busy schedule – simply book your appointment online and
266 |                             let us take care of the rest. </p>
267 |                         <div id="logo" class="text-center">
268 |                         </div>
269 |                         <div class="text-center mt-3">
270 |                             <a class="button button-default-outline booking-link" href="overview.html">Book Now</a>
271 |                         </div>
272 |                         <!-- <img id="logo" src="photos/home/logo.jpg" class="img-fluid " style="border-radius: 10px;" /> -->
273 |                     </div>
274 |                     <div class="col-lg-6">
275 |                         <video width="100%" autoplay muted loop style="border-radius: 10px;">
276 |                             <source src="photos/home/video.mp4" type="video/mp4">
277 |                         </video>
278 |                         <!-- <div class="box-images box-images-variant-3"> -->
279 |                         <!-- <div class="box-images-item" data-parallax-scroll='{"y": -20,   "smoothness": 30 }'>
280 |                                 <img src="photos/home/1.jpg" alt="" width="470" height="282" />
281 |                             </div> -->
282 |                         <!-- </div> -->
283 |                     </div>
284 |                 </div>
285 |             </div>
286 |         </section>
287 |         <section class="section section-lg bg-default text-center">
288 |             <div class="container">
289 |                 <h2>Our Services</h2>
290 |                 <div class="divider-lg"></div>
291 |                 <p> We provide a wide range of services for your nails, and eyelash <br class="d-none d-sm-inline" /> to
292 |                     look clean, attractive, and original. </p>
293 |             </div>
294 |             <div class="container">
295 |                 <div class="row g-0">
296 |                     <div class="col-lg-4">
297 |                         <div class="box-service-modern">
298 |                             <div class="box-icon-classic box-icon-classic-vertical">
299 |                                 <div class="icon-classic-aside">
300 |                                     <div style="min-height:160px">
301 |                                         <img src="photos/services/nail-service.jpeg" class="rounded"
302 |                                             style="border-radius: 30px !important;box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);"
303 |                                             alt="" height="150" width="150" />
304 |                                     </div>
305 |                                     <h4 class="icon-classic-title"> Manicure </h4>
306 |                                 </div>
307 |                                 <div class="icon-classic-body">
308 |                                     <p> Manicures are a great way to pamper yourself and keep your nails looking neat
309 |                                         and stylish.</p>
310 |                                 </div>
311 |                             </div>
312 |                             <!-- <div class="box-icon-classic box-icon-classic-vertical">
313 |                                 <div class="icon-classic-aside">
314 |                                     <div style="min-height:160px">
315 |                                         <img src="photos/services/make-up.png" class="rounded"
316 |                                             style="border-radius: 30px !important;box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);"
317 |                                             alt="" height="150" width="150" />
318 |                                     </div>
319 |                                     <h4 class="icon-classic-title"> Make Up </h4>
320 |                                 </div>
321 |                                 <div class="icon-classic-body">
322 |                                     <p> Let our skilled makeup artists create a flawless look tailored just for you</p>
323 |                                 </div>
324 |                             </div> -->
325 |                             <div class="box-icon-classic box-icon-classic-vertical">
326 |                                 <div class="icon-classic-aside">
327 |                                     <div style="min-height:160px">
328 |                                         <img src="photos/services/foot-massage.png" class="rounded"
329 |                                             style="border-radius: 30px !important;box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);"
330 |                                             alt="" height="150" width="150" />
331 |                                     </div>
332 |                                     <h4 class="icon-classic-title"> Pedicure </h4>
333 |                                 </div>
334 |                                 <div class="icon-classic-body">
335 |                                     <p> We ensure every pressure point is targeted for maximum relief and relaxation</p>
336 |                                 </div>
337 |                             </div>
338 |                         </div>
339 |                     </div>
340 |                     <div class="col-lg-4">
341 |                         <div class="box-service-modern">
342 |                             <div class="box-icon-classic box-icon-classic-vertical">
343 |                                 <div class="icon-classic-aside">
344 |                                     <div style="min-height:160px">
345 |                                         <img src="photos/services/artificial-nail.jpg" class="rounded"
346 |                                             style="border-radius: 30px !important;box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);"
347 |                                             alt="" height="150" width="150" />
348 |                                     </div>
349 |                                     <h4 class="icon-classic-title"> Artificial Nails </h4>
350 |                                 </div>
351 |                                 <div class="icon-classic-body">
352 |                                     <p> Our experienced staffs are masters of their craft, delivering impeccable results
353 |                                         every time.</p>
354 |                                 </div>
355 |                             </div>
356 |                             <!-- <div class="box-icon-classic box-icon-classic-vertical">
357 |                                 <div class="icon-classic-aside">
358 |                                     <div style="min-height:160px">
359 |                                         <img src="photos/services/permanent-makeup.jpeg" class="rounded"
360 |                                             style="border-radius: 30px !important;box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);"
361 |                                             alt="" height="150" width="150" />
362 |                                     </div>
363 |                                     <h4 class="icon-classic-title"> Permanent Make-up </h4>
364 |                                 </div>
365 |                                 <div class="icon-classic-body">
366 |                                     <p>We use only top-quality pigments and tools to create long-lasting, vibrant
367 |                                         results that you'll love for years to come</p>
368 |                                 </div>
369 |                             </div> -->
370 |                             <div class="box-icon-classic box-icon-classic-vertical">
371 |                                 <div class="icon-classic-aside">
372 |                                     <div style="min-height:160px">
373 |                                         <img src="photos/services/waxing.png" class="rounded"
374 |                                             style="border-radius: 30px !important;box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);"
375 |                                             alt="" height="150" width="150" />
376 |                                     </div>
377 |                                     <h4 class="icon-classic-title"> Waxing </h4>
378 |                                 </div>
379 |                                 <div class="icon-classic-body">
380 |                                     <p> Waxing is a convenient and effective hair removal option for those looking for
381 |                                         longer-lasting results and smoother skin.</p>
382 |                                 </div>
383 |                             </div>
384 |                         </div>
385 |                     </div>
386 |                     <div class="col-lg-4">
387 |                         <div class="box-service-modern">
388 |                             <div class="box-icon-classic box-icon-classic-vertical">
389 |                                 <div class="icon-classic-aside">
390 |                                     <div style="min-height:160px">
391 |                                         <img src="photos/services/Nail Art.png" class="rounded"
392 |                                             style="border-radius: 30px !important;box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);"
393 |                                             alt="" height="150" width="150" />
394 |                                     </div>
395 |                                     <h4 class="icon-classic-title"> Nail Art </h4>
396 |                                 </div>
397 |                                 <div class="icon-classic-body">
398 |                                     <p> Nail art is such a creative and fun way to express yourself!</p>
399 |                                 </div>
400 |                             </div>
401 |                             <div class="box-icon-classic box-icon-classic-vertical">
402 |                                 <div class="icon-classic-aside">
403 |                                     <div style="min-height:160px">
404 |                                         <img src="photos/services/kid-nail.png" class="rounded"
405 |                                             style="border-radius: 30px !important;box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);"
406 |                                             alt="" height="150" width="150" />
407 |                                     </div>
408 |                                     <h4 class="icon-classic-title"> Kid service </h4>
409 |                                 </div>
410 |                                 <div class="icon-classic-body">
411 |                                     <p> We specialize in making nail pampering an enchanting and memorable experience
412 |                                         for your children</p>
413 |                                 </div>
414 |                             </div>
415 |                             <!-- <div class="box-icon-classic box-icon-classic-vertical">
416 |                                 <div class="icon-classic-aside">
417 |                                     <div style="min-height:160px">
418 |                                         <img src="photos/services/additional-service.png" class="rounded"
419 |                                             style="border-radius: 30px !important;box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);"
420 |                                             alt="" height="150" width="150" />
421 |                                     </div>
422 |                                     <h4 class="icon-classic-title"> Additional </h4>
423 |                                 </div>
424 |                                 <div class="icon-classic-body">
425 |                                     <p>Unwind with our body massage services, and don't forget to explore our selection
426 |                                         of available products for purchase.</p>
427 |                                 </div>
428 |                             </div> -->
429 |                         </div>
430 |                     </div>
431 |                 </div>
432 |             </div>
433 |         </section>
434 |         <!-- <section class="section section-lg bg-default text-center">
435 |             <div class="container">
436 |                 <h2>Our Services</h2>
437 |                 <div class="divider-lg"></div>
438 |                 <p> We provide a wide range of services for your nails <br class="d-none d-sm-inline" /> to look clean,
439 |                     attractive, and original. </p>
440 |             </div>
441 |             <div class="container">
442 |                 <div class="row g-0">
443 |                     <div class="col-lg-4">
444 |                         <div class="box-service-modern">
445 |                             <div class="box-icon-classic box-icon-classic-vertical">
446 |                                 <div class="icon-classic-aside">
447 |                                     <div class="icon-classic">
448 |                                         <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
449 |                                             width="59.019px" height="76.726px" viewbox="0 0 59.019 76.726"
450 |                                             enable-background="new 0 0 59.019 76.726" xml:space="preserve">
451 |                                             <g>
452 |                                                 <path
453 |                                                     d="M55.564,35.454h-6.282V18.202c0-0.867-0.426-1.632-1.074-2.085l2.984-14.142    c0.092-0.439-0.099-0.89-0.475-1.119C50.574,0.769,49.228,0,46.489,0c-2.712,0-4.163,0.748-4.319,0.833    c-0.402,0.219-0.612,0.689-0.513,1.146l3.059,14.178c-0.616,0.457-1.018,1.203-1.018,2.044v17.252H37.14    c-1.343,0-2.437,1.128-2.435,2.575l1.998,36.182c0,1.388,1.092,2.516,2.436,2.516h14.282c1.343,0,2.436-1.128,2.434-2.453    L58,37.969C58,36.582,56.908,35.454,55.564,35.454z M45.712,35.454V18.202c0-0.24,0.189-0.435,0.421-0.435    c0.126,0,0.246-0.024,0.357-0.068c0.111,0.044,0.231,0.068,0.357,0.068c0.231,0,0.419,0.195,0.419,0.435v17.252H45.712z    M43.815,2.419c0.565-0.161,1.462-0.338,2.673-0.338c1.181,0,2.026,0.168,2.551,0.321l-2.585,12.252L43.815,2.419z M53.843,74.21    c0,0.24-0.189,0.435-0.421,0.435H39.14c-0.232,0-0.421-0.195-0.423-0.494l-1.998-36.182c0-0.239,0.189-0.434,0.422-0.434h7.564    h3.57h7.29c0.232,0,0.421,0.195,0.423,0.371L53.843,74.21z">
454 |                                                 </path>
455 |                                                 <path
456 |                                                     d="M13.197,42.12c3.976,0,6.296-0.651,7.755-2.176c1.488-1.554,1.924-3.843,2.029-7.176    c0.373,1.422,0.592,2.753,0.592,3.674l0.806,39.541C24.391,76.549,24.84,77,25.386,77c0.008,0,0.015,0,0.022,0    c0.556-0.012,0.998-0.488,0.986-1.063l-0.806-39.519c0-2.171-0.993-6.297-2.604-9.313c-0.016-1.465-0.029-3.059-0.015-4.809    c0.056-6.887-0.707-15.959-4.654-20.07C16.897,0.75,15.175,0,13.197,0C6.895,0,3.425,7.915,3.425,22.288    c0,1.778-0.025,3.4-0.049,4.884c-1.59,3.006-2.57,7.102-2.57,9.225L0,75.937c-0.012,0.575,0.43,1.05,0.986,1.063    c0.007,0,0.014,0,0.022,0c0.546,0,0.995-0.451,1.007-1.019l0.806-39.563c0-0.867,0.203-2.123,0.548-3.478    c0.113,3.217,0.567,5.451,2.02,6.976C6.859,41.461,9.194,42.12,13.197,42.12z M5.388,27.378c0.025-1.54,0.052-3.232,0.052-5.09    c0-6.076,0.756-20.207,7.757-20.207c1.44,0,2.647,0.527,3.687,1.611c2.699,2.81,4.144,9.411,4.07,18.587    c-0.017,2.002,0.003,3.813,0.021,5.446c0.062,5.695,0.099,9.132-1.455,10.756c-1.032,1.078-2.982,1.558-6.323,1.558    c-3.365,0-5.331-0.488-6.372-1.581C5.238,36.792,5.295,33.249,5.388,27.378z">
457 |                                                 </path>
458 |                                                 <path
459 |                                                     d="M14.104,23.904c0.268,0,0.534-0.11,0.733-0.327l4.03-4.411c0.382-0.418,0.364-1.076-0.042-1.471    c-0.404-0.393-1.042-0.375-1.424,0.043l-4.03,4.411c-0.382,0.418-0.364,1.076,0.042,1.471    C13.607,23.81,13.856,23.904,14.104,23.904z">
460 |                                                 </path>
461 |                                                 <path
462 |                                                     d="M17.779,22.276l-4.03,4.411c-0.382,0.418-0.364,1.076,0.042,1.471c0.194,0.189,0.443,0.284,0.691,0.284    c0.268,0,0.534-0.11,0.733-0.327l4.03-4.411c0.382-0.418,0.364-1.076-0.042-1.471C18.798,21.839,18.161,21.858,17.779,22.276z">
463 |                                                 </path>
464 |                                             </g>
465 |                                         </svg>
466 |                                     </div>
467 |                                     <h4 class="icon-classic-title"> Manicure </h4>
468 |                                 </div>
469 |                                 <div class="icon-classic-body">
470 |                                     <p> Our manicure treatments stimulate nail growth and soften dry, dull skin. </p>
471 |                                 </div>
472 |                             </div>
473 |                             <div class="box-service-modern-img">
474 |                                 <img src="photos/home/service-1.jpg" alt="" width="390" height="312" />
475 |                             </div>
476 |                         </div>
477 |                     </div>
478 |                     <div class="col-lg-4">
479 |                         <div class="box-service-modern box-service-modern-reverse">
480 |                             <div class="box-icon-classic box-icon-classic-vertical">
481 |                                 <div class="icon-classic-aside">
482 |                                     <div class="icon-classic">
483 |                                         <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
484 |                                             width="56.222px" height="90.23px" viewbox="0 0 56.222 90.23"
485 |                                             enable-background="new 0 0 56.222 90.23" xml:space="preserve">
486 |                                             <g>
487 |                                                 <path
488 |                                                     d="M1.792,50.845c-1.088,3.859-2.214,7.85-1.635,12.067c0.391,2.852,1.636,5.29,3.506,6.866    c1.712,1.443,3.592,2.191,5.483,2.191c0.274,0,0.549-0.016,0.823-0.047c4.973-0.573,8.72-6.093,9.339-10.878    c0.348-2.678,0.187-5.401,0.031-8.036c-0.201-3.41-0.391-6.631,0.436-9.72c0.929-3.482,2.682-6.488,4.537-9.671    c1.752-3.003,3.562-6.108,4.62-9.65c0.801-2.681,1.129-5.849,0.933-9.006c0.092-0.299,0.065-0.609-0.066-0.888    c-0.433-4.58-2.003-9.037-4.938-11.837c-1.657-1.58-3.704-2.389-5.64-2.214c-1.808,0.165-3.371,1.121-4.791,2.131    C9.299,5.802,2.843,11.621,1.22,18.631c-0.5,2.161-0.435,4.283-0.123,6.368c0.001,0.013,0.004,0.024,0.005,0.037    c0.271,1.79,0.717,3.554,1.164,5.289c0.162,0.626,0.322,1.248,0.472,1.864c1.14,4.703,1.18,9.898,0.114,14.63    C2.553,48.15,2.166,49.521,1.792,50.845z M15.879,4.191c1.134-0.806,2.352-1.567,3.567-1.678c0.1-0.009,0.2-0.014,0.302-0.014    c1.127,0,2.346,0.553,3.387,1.546c2.014,1.921,3.264,4.865,3.862,8.063C21.527,9.165,15.131,8.404,9.151,9.944    C11.285,7.69,13.707,5.735,15.879,4.191z M3.388,22.84c-0.067-1.227-0.01-2.445,0.267-3.645c0.452-1.949,1.347-3.813,2.509-5.557    c6.871-3.12,14.901-2.503,21.211,1.6c0.16,2.824-0.134,5.658-0.838,8.015c-0.131,0.438-0.276,0.868-0.43,1.293    C19.423,19.888,10.684,19.241,3.388,22.84z M5.167,31.602c-0.152-0.629-0.315-1.263-0.48-1.901    c-0.357-1.388-0.716-2.795-0.972-4.202c6.788-3.733,15.169-3.172,21.396,1.426c-0.863,1.837-1.892,3.605-2.959,5.436    c-1.856,3.185-3.777,6.479-4.794,10.285c-0.929,3.478-0.718,7.054-0.514,10.512c0.155,2.635,0.302,5.123-0.015,7.568    c-0.502,3.868-3.493,8.293-7.146,8.714c-0.001,0-0.001,0-0.001,0c-1.487,0.176-2.969-0.357-4.407-1.572    c-1.398-1.176-2.334-3.057-2.642-5.294c-0.508-3.701,0.499-7.271,1.564-11.049c0.383-1.356,0.778-2.759,1.093-4.155    C6.44,42.27,6.396,36.67,5.167,31.602z">
489 |                                                 </path>
490 |                                                 <path
491 |                                                     d="M22.421,88.811c1.294,0.939,2.857,1.419,4.594,1.419c0.63,0,1.282-0.063,1.952-0.189    c2.402-0.455,4.684-1.967,6.427-4.259c2.576-3.39,3.556-7.419,4.505-11.316c0.323-1.337,0.66-2.719,1.053-4.024    c1.398-4.647,3.986-9.152,7.288-12.685c0.433-0.465,0.879-0.929,1.328-1.396c1.243-1.291,2.497-2.608,3.611-4.033    c0.007-0.01,0.015-0.019,0.021-0.027c1.296-1.664,2.396-3.48,3.021-5.609c2.031-6.9-0.734-15.142-3.411-20.841    c-0.741-1.577-1.633-3.179-3.127-4.21c-1.592-1.097-3.78-1.402-5.999-0.842c-3.934,0.997-7.491,4.108-10.118,7.885    c-0.248,0.179-0.424,0.434-0.491,0.738c-1.723,2.653-2.992,5.575-3.612,8.304c-0.819,3.605-0.768,7.2-0.718,10.677    c0.053,3.683,0.103,7.162-0.798,10.651c-0.799,3.096-2.547,5.809-4.398,8.681c-1.429,2.218-2.907,4.511-3.92,7.014    C17.818,79.219,18.37,85.868,22.421,88.811z M44.299,23.222c1.522-0.389,2.966-0.213,3.965,0.477    c1.006,0.693,1.692,1.955,2.283,3.214c1.134,2.413,2.283,5.304,3.035,8.315c-4.453-4.28-10.397-6.759-16.607-6.882    C39.068,25.856,41.602,23.905,44.299,23.222z M31.901,38.279c0.546-2.398,1.681-5.012,3.208-7.393    c7.516-0.471,14.811,2.935,19.26,9.029c0.156,2.09,0.021,4.151-0.545,6.07c-0.347,1.181-0.895,2.271-1.557,3.307    c-4.585-6.719-12.516-10.45-20.626-9.675C31.715,39.171,31.8,38.726,31.901,38.279z M21.945,75.685    c0.926-2.283,2.275-4.379,3.705-6.598c1.877-2.912,3.817-5.924,4.717-9.409c0.985-3.814,0.931-7.626,0.878-11.313    c-0.03-2.118-0.058-4.165,0.094-6.189c7.684-0.941,15.259,2.685,19.337,9.271c-0.914,1.1-1.916,2.147-2.909,3.18    c-0.458,0.477-0.913,0.949-1.354,1.422c-3.559,3.809-6.348,8.664-7.855,13.672c-0.412,1.37-0.756,2.786-1.089,4.154    c-0.928,3.815-1.804,7.42-4.064,10.394c-1.367,1.799-3.107,2.976-4.901,3.314c-1.849,0.352-3.402,0.082-4.612-0.796    C20.913,84.625,20.483,79.301,21.945,75.685z">
492 |                                                 </path>
493 |                                             </g>
494 |                                         </svg>
495 |                                     </div>
496 |                                     <h4 class="icon-classic-title"> Pedicure </h4>
497 |                                 </div>
498 |                                 <div class="icon-classic-body">
499 |                                     <p> Pedicure services provide full restoration of your nails with extra polishing
500 |                                         and skin refoliation. </p>
501 |                                 </div>
502 |                             </div>
503 |                             <div class="box-service-modern-img">
504 |                                 <img src="photos/home/service-2.jpg" alt="" width="390" height="312" />
505 |                             </div>
506 |                         </div>
507 |                     </div>
508 |                     <div class="col-lg-4">
509 |                         <div class="box-service-modern">
510 |                             <div class="box-icon-classic box-icon-classic-vertical">
511 |                                 <div class="icon-classic-aside">
512 |                                     <div class="icon-classic">
513 |                                         <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
514 |                                             width="68px" height="79px" viewbox="0 0 68 79"
515 |                                             enable-background="new 0 0 68 79" xml:space="preserve">
516 |                                             <g>
517 |                                                 <path
518 |                                                     d="M7.05,78.563h20.743c3.887,0,7.05-3.165,7.05-7.054V44.496c0-3.89-3.162-7.055-7.05-7.055h-2.677v-0.617    c0.235-0.122,0.443-0.294,0.611-0.51c0.304-0.391,0.438-0.878,0.377-1.369c-0.061-0.493-0.31-0.934-0.701-1.239    c-0.091-0.071-0.187-0.133-0.287-0.185v-0.187c0.622-0.364,1.002-1.075,0.909-1.836c-0.075-0.596-0.425-1.092-0.909-1.375v-0.328    c0.622-0.364,1.002-1.075,0.909-1.836c-0.085-0.681-0.531-1.23-1.125-1.481c-0.399-0.916-1.311-1.55-2.367-1.55H12.309    c-1.425,0-2.584,1.16-2.584,2.585v0.748c-0.621,0.364-1.001,1.074-0.908,1.833c0.061,0.493,0.31,0.934,0.701,1.239    c0.066,0.052,0.135,0.099,0.207,0.14v0.325c-0.621,0.364-1.001,1.075-0.908,1.834c0.061,0.493,0.31,0.933,0.701,1.239    c0.066,0.052,0.136,0.099,0.207,0.14v0.28c-0.169,0.111-0.321,0.25-0.449,0.415c-0.305,0.392-0.439,0.88-0.377,1.372    c0.016,0.125,0.044,0.246,0.083,0.362H7.05c-3.887,0-7.05,3.165-7.05,7.055v27.012C0,75.398,3.163,78.563,7.05,78.563z    M22.925,29.637v1.341c0,0.228,0.074,0.447,0.203,0.63l-11.286,1.395c0.046-0.121,0.074-0.252,0.074-0.388v-1.618L22.925,29.637z    M11.84,37.21c-0.053-0.137-0.133-0.264-0.238-0.371c0.195-0.199,0.314-0.471,0.314-0.769v-0.866l11.009-1.361v0.591    c0,0.289,0.114,0.565,0.315,0.769c-0.165,0.168-0.271,0.391-0.301,0.635L11.84,37.21z M12.309,27.12h10.223    c0.186,0,0.335,0.133,0.375,0.309l-10.991,1.359v-1.275C11.916,27.297,12.093,27.12,12.309,27.12z M2.191,44.496    c0-2.681,2.18-4.863,4.859-4.863h3.771c0.204,0,0.393-0.06,0.557-0.157l11.548-1.428v0.489c0,0.605,0.49,1.096,1.095,1.096h3.772    c2.679,0,4.859,2.182,4.859,4.863v27.012c0,2.681-2.18,4.862-4.859,4.862H7.05c-2.679,0-4.859-2.181-4.859-4.862V44.496z">
519 |                                                 </path>
520 |                                                 <path
521 |                                                     d="M45.358,76.438C45.376,77.854,46.533,79,47.952,79h15.177c1.418,0,2.575-1.145,2.594-2.559l2.275-37.28    C67.999,39.139,68,39.117,68,39.095c0-1.432-1.164-2.596-2.595-2.596h-6.668V18.745c0-0.893-0.453-1.682-1.14-2.15l3.169-14.554    c0.099-0.455-0.105-0.923-0.507-1.159C60.105,0.792,58.674,0,55.762,0c-2.884,0-4.427,0.771-4.593,0.858    c-0.43,0.227-0.654,0.713-0.549,1.188l3.25,14.591c-0.654,0.472-1.081,1.241-1.081,2.108v17.754h-6.961    c-1.431,0-2.596,1.165-2.596,2.596c0,0.02,0.001,0.041,0.002,0.061L45.358,76.438z M54.942,36.498V18.745    c0-0.243,0.198-0.441,0.441-0.441c0.134,0,0.262-0.024,0.38-0.069c0.118,0.045,0.246,0.069,0.38,0.069    c0.243,0,0.44,0.198,0.44,0.441v17.754H54.942z M52.928,2.502c0.601-0.165,1.551-0.346,2.834-0.346c1.25,0,2.145,0.172,2.702,0.329    l-2.739,12.578L52.928,2.502z M45.828,38.654h8.038h3.794h7.745c0.235,0,0.428,0.185,0.44,0.418l-2.274,37.266    c-0.001,0.022-0.002,0.044-0.002,0.066c0,0.243-0.198,0.441-0.441,0.441H47.952c-0.243,0-0.441-0.198-0.441-0.441    c0-0.02-0.001-0.041-0.002-0.061l-2.123-37.269C45.397,38.84,45.591,38.654,45.828,38.654z">
522 |                                                 </path>
523 |                                             </g>
524 |                                         </svg>
525 |                                     </div>
526 |                                     <h4 class="icon-classic-title"> Art </h4>
527 |                                 </div>
528 |                                 <div class="icon-classic-body">
529 |                                     <p> Let our nail artists create a stunning and sustainable nail design for you. </p>
530 |                                 </div>
531 |                             </div>
532 |                             <div class="box-service-modern-img">
533 |                                 <img src="photos/home/service-3.jpg" alt="" width="390" height="312" />
534 |                             </div>
535 |                         </div>
536 |                     </div>
537 |                 </div>
538 |             </div>
539 |         </section> -->
540 |         <!-- <section class="section parallax-container" data-parallax-img="images/parallax-2-1920x380.jpg">
541 |             <div class="parallax-content section-sm text-center">
542 |                 <div class="container">
543 |                     <div class="row row-30 counter-list-border">
544 |                         <div class="col-6 col-md-6">
545 |                            
546 |                             <article class="box-counter">
547 |                                 <div class="box-counter-main">
548 |                                     <div class="counter heading-1"> 32540 </div>
549 |                                 </div>
550 |                                 <p class="box-counter-title"> happy clients </p>
551 |                             </article>
552 |                         </div>
553 |                         <div class="col-6 col-md-6">
554 |                          
555 |                             <article class="box-counter">
556 |                                 <div class="box-counter-main">
557 |                                     <div class="counter heading-1">8</div>
558 |                                 </div>
559 |                                 <p class="box-counter-title"> team members </p>
560 |                             </article>
561 |                         </div>
562 |                     </div>
563 |                 </div>
564 |             </div>
565 |         </section> -->
566 |         <!-- <section class="section section-lg bg-default">
567 |       <div class="container">
568 |         <div class="row row-50">
569 |           <div class="col-sm-6 col-lg-3 text-center text-lg-start">
570 |             <h2>Our Staff</h2>
571 |             <div class="divider-lg"></div>
572 |             <p>Over the years, we have gathered a trusted, talented, and experienced team of nail technicians and
573 |               artists.</p>
574 |             <div class="quote-with-image">
575 |               <div class="quote-caption">
576 |                 <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="88.34px" height="65.34px"
577 |                   viewBox="0 0 88.34 65.34" enable-background="new 0 0 88.34 65.34" overflow="scroll"
578 |                   xml:space="preserve" preserveAspectRatio="none">
579 |                   <path
580 |                     d="M49.394,65.34v-4.131c12.318-7.088,19.924-16.074,22.811-26.965c-3.125,2.032-5.968,3.051-8.526,3.051																						c-4.265,0-7.864-1.721-10.803-5.168c-2.937-3.444-4.407-7.654-4.407-12.64c0-5.511,1.932-10.142,5.791-13.878																						C58.123,1.873,62.873,0,68.51,0c5.639,0,10.354,2.379,14.143,7.137c3.793,4.757,5.688,10.678,5.688,17.758																						c0,9.977-3.814,18.912-11.443,26.818C69.268,59.613,60.101,64.156,49.394,65.34z M0.923,65.34v-4.131																						c12.321-7.088,19.926-16.074,22.813-26.965c-3.126,2.032-5.993,3.051-8.598,3.051c-4.219,0-7.794-1.721-10.734-5.168																						C1.467,28.683,0,24.473,0,19.487C0,13.976,1.919,9.346,5.757,5.609C9.595,1.873,14.334,0,19.971,0																						c5.685,0,10.41,2.379,14.178,7.137c3.767,4.757,5.652,10.678,5.652,17.758c0,9.977-3.805,18.912-11.409,26.818																						C20.787,59.613,11.632,64.156,0.923,65.34z">
581 |                   </path>
582 |                 </svg>
583 |                 <h3 class="quote-text">Beautiful hands give confidence!</h3>
584 |               </div>
585 |             </div>
586 |           </div>
587 |           <div class="col-sm-6 col-lg-9">
588 |             <p class="text-center text-lg-end"><a class="button-link button-link-icon" href="our-team.html">View All
589 |                 Team <span class="icon fa-arrow-right icon-primary"></span></a></p>
590 |       
591 |             <div class="owl-carousel carousel-inset" data-items="1" data-lg-items="3" data-dots="true" data-nav="false"
592 |               data-stage-padding="15" data-loop="false" data-margin="30" data-mouse-drag="false">
593 |               <div class="team-minimal team-minimal-type-2">
594 |                 <figure><img src="images/team-1-370x370.jpg" alt="" width="370" height="370"></figure>
595 |                 <div class="team-minimal-caption">
596 |                   <h4 class="team-title"><a href="team-member-profile.html">Mary Lucas</a></h4>
597 |                   <p>Founder, Senior Nail Technician</p>
598 |                 </div>
599 |               </div>
600 |               <div class="team-minimal team-minimal-type-2">
601 |                 <figure><img src="images/team-2-370x370.jpg" alt="" width="370" height="370"></figure>
602 |                 <div class="team-minimal-caption">
603 |                   <h4 class="team-title"><a href="team-member-profile.html">Janette Wade</a></h4>
604 |                   <p>Manicurist</p>
605 |                 </div>
606 |               </div>
607 |               <div class="team-minimal team-minimal-type-2">
608 |                 <figure><img src="images/team-3-370x370.jpg" alt="" width="370" height="370"></figure>
609 |                 <div class="team-minimal-caption">
610 |                   <h4 class="team-title"><a href="team-member-profile.html">Ann Smith</a></h4>
611 |                   <p>Pedicurist</p>
612 |                 </div>
613 |               </div>
614 |             </div>
615 |           </div>
616 |         </div>
617 |       </div>
618 |     </section> -->
619 |         <section class="section section-lg bg-gray-100">
620 |             <div class="container">
621 |                 <div class="row row-50 justify-content-center">
622 |                     <div class="col-md-6">
623 |                         <div class="box-video" data-lightgallery="group">
624 |                             <img src="photos/home/3.jpg" alt="" width="541" height="369" />
625 |                         </div>
626 |                     </div>
627 |                     <div class="col-md-6">
628 |                         <h2 class="heading-decorate">
629 |                             <span class="divider"></span>Our Technology
630 |                         </h2>
631 |                         <p class="big "> Step into our salon and be greeted by a team of skilled nail technicians
632 |                             dedicated to delivering flawless results. Whether you're seeking a classic manicure or
633 |                             intricate nail art designs, we tailor each service to your unique preferences, ensuring your
634 |                             nails reflect your personal style.</p>
635 |                         <p class="big "> Escape the stresses of daily life and unwind in our luxurious salon setting.
636 |                             From plush seating to soothing décor, every detail at LuxMe Nails and Spa is designed to
637 |                             enhance your relaxation experience, allowing you to indulge in a moment of tranquility and
638 |                             self-care.</p>
639 |                         <p class="big "> Elevate your nail care routine with the finest quality products available. We
640 |                             exclusively use premium polishes, treatments, and tools to ensure optimal results and
641 |                             long-lasting beauty for your nails, leaving them looking and feeling their best. </p>
642 |                         <!-- <p class="big "> At LuxMe Nails and Spa, whether you're seeking a fresh and fabulous manicure, a
643 |                             luxurious pedicure, or eye-catching acrylic nails, our skilled and experienced technicians
644 |                             are here to fulfill your desires. In addition to our exceptional nail services, we offer a
645 |                             comprehensive menu of beauty treatments to enhance your natural beauty </p>
646 |                         <p class="big "> We offers following services: </p>
647 |                         <ul class="list-marked">
648 |                             <li class="big ">Manicure/Pedicure </li>
649 |                             <li class="big ">Waxing </li>
650 |                             <li class="big ">Tinting</li>
651 |                             <li class="big ">And More</li>
652 |                         </ul> -->
653 |                     </div>
654 |                 </div>
655 |             </div>
656 |         </section>
657 |         <section class="section parallax-container" data-parallax-img="images/parallax-03-1920x1340.jpg">
658 |             <div class="parallax-content section-lg text-center">
659 |                 <div class="container">
660 |                     <h2>Testimonials</h2>
661 |                     <div class="divider-lg"></div>
662 |                     <!-- Owl Carousel-->
663 |                     <div class="owl-carousel" id="testimonials" data-items="1" data-lg-items="3" data-dots="true"
664 |                         data-nav="false" data-stage-padding="15" data-loop="true" data-margin="30" autoplay="true"
665 |                         delay="3000" data-mouse-drag="false"></div>
666 |                 </div>
667 |             </div>
668 |         </section>
669 |         <section class="section section-lg bg-default text-center" id="gallery">
670 |             <div class="container">
671 |                 <h2>Portfolio</h2>
672 |                 <div class="divider-lg"></div>
673 |                 <p class="block-lg"> Check out the full portfolio of our works including manicure, pedicure, nail
674 |                     designs, custom artworks, and more. Everything you see here was performed by our skilled manicurists
675 |                     and pedicurists. </p>
676 |                 <div class="row row-30">
677 |                     <!-- Isotope Filters-->
678 |                     <!-- <div class="col-lg-12">
679 |             <div class="isotope-filters isotope-filters-horizontal">
680 |               <button class="isotope-filters-toggle button button-sm button-primary"
681 |                 data-custom-toggle="#isotope-filters" data-custom-toggle-disable-on-blur="true">Filter<span
682 |                   class="caret"></span></button>
683 |               <ul class="isotope-filters-list" id="isotope-filters">
684 |                 <li><a class="active" data-isotope-filter="*" data-isotope-group="gallery" href="#">All</a></li>
685 |                 <li><a data-isotope-filter="manicure" data-isotope-group="gallery" href="#">manicure</a></li>
686 |                 <li><a data-isotope-filter="pedicure" data-isotope-group="gallery" href="#">pedicure </a></li>
687 |                 <li><a data-isotope-filter="nailsDesign" data-isotope-group="gallery" href="#">nail Design</a></li>
688 |               </ul>
689 |             </div>
690 |           </div> -->
691 |                     <!-- Isotope Content-->
692 |                     <div class="col-lg-12">
693 |                         <div class="isotope row" id="home-gallery" data-isotope-layout="masonry"
694 |                             data-isotope-group="gallery" data-lightgallery="group"
695 |                             data-column-class=".col-sm-6.col-lg-4">
696 |                             <!-- <div class="col-sm-6 col-lg-4 isotope-item" data-filter="pedicure"><a class="gallery-item"
697 |                   data-lightgallery="item" href="photos/gallery/1.jpg"><img src="photos/gallery/1.jpg" alt=""
698 |                     width="570" height="570" /><span class="gallery-item-title"></span><span
699 |                     class="gallery-item-button"></span></a>
700 |               </div>
701 |               <div class="col-sm-6 col-lg-4 isotope-item" data-filter="pedicure"><a class="gallery-item"
702 |                   data-lightgallery="item" href="photos/gallery/1.jpg"><img src="photos/gallery/1.jpg" alt=""
703 |                     width="570" height="570" /><span class="gallery-item-title"></span><span
704 |                     class="gallery-item-button"></span></a>
705 |               </div>
706 |               <div class="col-sm-6 col-lg-4 isotope-item" data-filter="pedicure"><a class="gallery-item"
707 |                   data-lightgallery="item" href="photos/gallery/1.jpg"><img src="photos/gallery/1.jpg" alt=""
708 |                     width="570" height="570" /><span class="gallery-item-title"></span><span
709 |                     class="gallery-item-button"></span></a>
710 |               </div>
711 |               <div class="col-sm-6 col-lg-4 isotope-item" data-filter="pedicure"><a class="gallery-item"
712 |                   data-lightgallery="item" href="photos/gallery/1.jpg"><img src="photos/gallery/1.jpg" alt=""
713 |                     width="570" height="570" /><span class="gallery-item-title"></span><span
714 |                     class="gallery-item-button"></span></a>
715 |               </div>
716 |               <div class="col-sm-6 col-lg-4 isotope-item" data-filter="pedicure"><a class="gallery-item"
717 |                   data-lightgallery="item" href="photos/gallery/1.jpg"><img src="photos/gallery/1.jpg" alt=""
718 |                     width="570" height="570" /><span class="gallery-item-title"></span><span
719 |                     class="gallery-item-button"></span></a>
720 |               </div>
721 |               <div class="col-sm-6 col-lg-4 isotope-item" data-filter="pedicure"><a class="gallery-item"
722 |                   data-lightgallery="item" href="photos/gallery/1.jpg"><img src="photos/gallery/1.jpg" alt=""
723 |                     width="570" height="570" /><span class="gallery-item-title"></span><span
724 |                     class="gallery-item-button"></span></a>
725 |               </div> -->
726 |                         </div>
727 |                     </div>
728 |                 </div>
729 |                 <!-- <a class="button button-default-outline" href="grid-gallery.html">View our gallery</a> -->
730 |             </div>
731 |         </section>
732 |         <!-- <section class="section-transform-bottom">
733 |       <div class="container section-md bg-primary context-dark">
734 |         <div class="row justify-content-center row-50">
735 |           <div class="col-sm-10 text-center">
736 |             <h2>Book Your Appointment Online</h2>
737 |             <div class="divider-lg"></div>
738 |           </div>
739 |           <div class="col-sm-10 col-lg-6">
740 |            
741 |             <form class="rd-form rd-mailform rd-form-inline" data-form-output="form-output-global"
742 |               data-form-type="subscribe" method="post" action="bat/rd-mailform.php">
743 |               <div class="form-wrap">
744 |                 <input class="form-input" id="subscribe-form-0-email" type="email" name="email"
745 |                   data-constraints="@Email @Required" />
746 |                 <label class="form-label" for="subscribe-form-0-email">Your E-mail</label>
747 |               </div>
748 |               <div class="form-button">
749 |                 <button class="button button-primary" type="submit">Subscribe</button>
750 |               </div>
751 |             </form>
752 |           </div>
753 |         </div>
754 |       </div>
755 |     </section> -->
756 |         <!-- Google map-->
757 |         <section class="section section-xl bg-default novi-bg novi-bg-img" id="contact">
758 |             <div class="container">
759 |                 <div class="row row-novi g-0 pricing-box-modern justify-content-lg-end">
760 |                     <div class="col-sm-6 col-lg-4">
761 |                         <div class="pricing-box-inner box-left">
762 |                             <h2>Hour</h2>
763 |                             <ul class="list-md pricing-box-inner-list" id="business-hour"></ul>
764 |                         </div>
765 |                     </div>
766 |                     <div class="d-none d-lg-block col-lg-4 position-relative img-wrap">
767 |                         <img src="photos/home/4.jpg" alt="" width="498" height="688" />
768 |                     </div>
769 |                     <div class="col-sm-6 col-lg-4">
770 |                         <div class="pricing-box-inner bg-primary context-dark box-right novi-bg">
771 |                             <ul class="list-md pricing-box-inner-list ">
772 |                                 <li>
773 |                                     <h4>Address</h4>
774 |                                     <a href="#" class="address text-white"></a>
775 |                                 </li>
776 |                                 <li>
777 |                                     <h4>Phone</h4>
778 |                                     <a href="#" class="phone text-white"></a>
779 |                                 </li>
780 |                                 <li class="social-media-list">
781 |                                 </li>
782 |                             </ul>
783 |                             <p> We will be glad to see you anytime at our salon. </p>
784 |                             <a class="button button-default-outline booking-link booking-button" href="#">Book Now <span
785 |                                     class="icon fa-arrow-right icon-primary"></span></a>
786 |                         </div>
787 |                     </div>
788 |                 </div>
789 |             </div>
790 |         </section>
791 |         <section class="section">
792 |             <iframe src="" height="450" style="border: 0; width: 100%" allowfullscreen="" loading="lazy" id="google-map"
793 |                 referrerpolicy="no-referrer-when-downgrade"></iframe>
794 |         </section>
795 |         <div id="messageModalContainer"></div>
796 |         <footer class="section bg-default novi-bg novi-bg-img section-xs-type-1 footer-minimal">
797 |             <!-- <div class="container">
798 |         <div class="row row-30 row-novi align-items-lg-center justify-content-lg-between">
799 |           <div class="col-lg-2">
800 |             <div class="footer-brand"><a href="index.html"><img src="images/logo-dark-142x58.png" alt="" width="142"
801 |                   height="58" /></a></div>
802 |           </div>
803 |           <div class="col-lg-10">
804 |             <div class="footer-nav">
805 |               <ul class="rd-navbar-nav">
806 |                 <li class="rd-nav-item active"><a class="rd-nav-link" href="index.html">Home</a></li>
807 |                 <li class="rd-nav-item"><a class="rd-nav-link" href="overview.html">About</a></li>
808 |                 <li class="rd-nav-item"><a class="rd-nav-link" href="services.html">Services</a></li>
809 |                 <li class="rd-nav-item"><a class="rd-nav-link" href="grid-gallery.html">Gallery</a></li>
810 |                 <li class="rd-nav-item"><a class="rd-nav-link" href="blog-classic.html">Blog</a></li>
811 |                 <li class="rd-nav-item"><a class="rd-nav-link" href="#">Pages</a></li>
812 |                 <li class="rd-nav-item"><a class="rd-nav-link" href="contacts.html">Contacts</a></li>
813 |               </ul>
814 |             </div>
815 |           </div>
816 |         </div>
817 |       </div> -->
818 |         </footer>
819 |         <section class="section bg-gray-100 novi-bg novi-bg-img section-xs text-center">
820 |             <div class="container">
821 |                 <p class="rights">
822 |                     <span>&copy;&nbsp; </span><span class="copyright-year"></span><span>&nbsp;</span><span>All Rights
823 |                         Reserved</span><span>&nbsp;</span>
824 |                 </p>
825 |                 <p class="rights "> Designed by</span><span>&nbsp;</span><a href="https://www.dashbooking.com"
826 |                         target="_blank" class="text-primary">Dash Booking</a>
827 |                 </p>
828 |             </div>
829 |         </section>
830 |     </div>
831 |     <!-- Floating Button -->
832 |     <div class="row floating-button">
833 |         <div class="col-6 col-md-12 mb-3 w-sm-100 text-center">
834 |             <a href="tel:+16137798540" class="button button-primary  pl-3 pr-3  btn-call-us">
835 |                 <span class="icon novi-icon mdi mdi-phone"></span> Call Us</a>
836 |         </div>
837 |         <div class="col-6 col-md-12 mb-3 text-center"> <a href="#"
838 |                 class="button button-primary  pl-3 pr-3 btn-book-now  booking-link "><span
839 |                     class="icon novi-icon mdi mdi-calendar"></span> Book Now</a></div>
840 |     </div>
841 |     <!-- Global Mailform Output-->
842 |     <div class="snackbars" id="form-output-global"></div>
843 |     <!-- Javascript-->
844 |     <!-- Js File -->
845 |     <script src="main.js"></script>
846 |     <script src="js/moment.js"></script>
847 |     <script src="js/core.min.js"></script>
848 |     <script src="js/script.js"></script>
849 |        <script src="js/swiper.min.js"></script>
850 |     <script>
851 |         function scrollto(id) {
852 |             var element = document.getElementById(id);
853 | 
854 |             if (id == "home") {
855 |                 document.body.scrollTop = 0; // For Safari
856 |                 document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
857 |             } else {
858 |                 //console.log(element);
859 |                 element.scrollIntoView({
860 |                     behavior: "smooth",
861 |                     block: "start",
862 |                     inline: "nearest"
863 |                 });
864 |             }
865 |             const loader = document.querySelector('.preloader');
866 |             const body = document.querySelector('.page');
867 |             const mobileNav = document.querySelector('.toggle-original-elements')
868 | 
869 |             // Add the class "loaded"
870 |             if (loader) {
871 |                 loader.classList.add('loaded');
872 |             }
873 |             if (body) {
874 |                 body.classList.remove("fadeOut")
875 |             }
876 |             if (mobileNav) {
877 |                 mobileNav.classList.remove('active')
878 |             }
879 | 
880 | 
881 |         }
882 |     </script>
883 |     <!-- coded by barber-->
884 | </body>
885 | 
886 | </html>


--------------------------------------------------------------------------------
/public/data/home_blocks.txt:
--------------------------------------------------------------------------------
1 | <div id="messageModalContainer"></div>
2 | 


--------------------------------------------------------------------------------
/public/data/home_content.json:
--------------------------------------------------------------------------------
 1 | {
 2 |   "title": " LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7",
 3 |   "meta_description": "",
 4 |   "meta_keywords": "Nail salon in Ottawa, LuxMe Nails and Spa on 2430 Bank St #9, ON K1V 0T7",
 5 |   "slug": "home",
 6 |   "headings": [
 7 |     {"level": "1", "text": " LuxMe Nails and Spa "},
 8 |     {"level": "2", "text": "Special Promotion"},
 9 |     {"level": "2", "text": " Why Clients Choose Us "},
10 |     {"level": "2", "text": "Our Services"},
11 |     {"level": "4", "text": " Manicure "},
12 |     {"level": "4", "text": " Make Up "},
13 |     {"level": "4", "text": " Pedicure "},
14 |     {"level": "4", "text": " Artificial Nails "},
15 |     {"level": "4", "text": " Permanent Make-up "},
16 |     {"level": "4", "text": " Waxing "},
17 |     {"level": "4", "text": " Nail Art "},
18 |     {"level": "4", "text": " Kid service "},
19 |     {"level": "4", "text": " Additional "},
20 |     {"level": "2", "text": "Our Services"},
21 |     {"level": "4", "text": " Manicure "},
22 |     {"level": "4", "text": " Pedicure "},
23 |     {"level": "4", "text": " Art "},
24 |     {"level": "2", "text": "Our Staff"},
25 |     {"level": "3", "text": "Beautiful hands give confidence!"},
26 |     {"level": "4", "text": "Mary Lucas"},
27 |     {"level": "4", "text": "Janette Wade"},
28 |     {"level": "4", "text": "Ann Smith"},
29 |     {"level": "2", "text": "Testimonials"},
30 |     {"level": "2", "text": "Portfolio"},
31 |     {"level": "2", "text": "Book Your Appointment Online"},
32 |     {"level": "2", "text": "Hour"},
33 |     {"level": "4", "text": "Address"},
34 |     {"level": "4", "text": "Phone"}
35 |   ],
36 |   "paragraphs": [
37 |     "Loading...",
38 |     " Let our skilled makeup artists create a flawless look tailored just for you",
39 |     " We ensure every pressure point is targeted for maximum relief and relaxation",
40 |     " Nail art is such a creative and fun way to express yourself!",
41 |     " Our manicure treatments stimulate nail growth and soften dry, dull skin. ",
42 |     " Let our nail artists create a stunning and sustainable nail design for you. ",
43 |     " happy clients ",
44 |     " team members ",
45 |     "Founder, Senior Nail Technician",
46 |     "Manicurist",
47 |     "Pedicurist",
48 |     " We offers following services: ",
49 |     " We will be glad to see you anytime at our salon. "
50 |   ],
51 |   "links": [
52 | 
53 |   ],
54 |   "images": [
55 |     {"src": "photos/home/1.jpg", "filename": "1.jpg", "alt": ""},
56 |     {"src": "photos/home/2.jpg", "filename": "2.jpg", "alt": ""},
57 |     {"src": "photos/home/logo.jpg", "filename": "logo.jpg", "alt": ""},
58 |     {"src": "photos/home/1.jpg", "filename": "1.jpg", "alt": ""},
59 |     {"src": "photos/home/service-1.jpg", "filename": "service-1.jpg", "alt": ""},
60 |     {"src": "photos/home/service-2.jpg", "filename": "service-2.jpg", "alt": ""},
61 |     {"src": "photos/home/service-3.jpg", "filename": "service-3.jpg", "alt": ""},
62 |     {"src": "images/team-1-370x370.jpg", "filename": "team-1-370x370.jpg", "alt": ""},
63 |     {"src": "images/team-2-370x370.jpg", "filename": "team-2-370x370.jpg", "alt": ""},
64 |     {"src": "images/team-3-370x370.jpg", "filename": "team-3-370x370.jpg", "alt": ""},
65 |     {"src": "photos/home/3.jpg", "filename": "3.jpg", "alt": ""},
66 |     {"src": "photos/home/4.jpg", "filename": "4.jpg", "alt": ""}
67 |   ]
68 | }
69 | 


--------------------------------------------------------------------------------
/public/data/home_headings.txt:
--------------------------------------------------------------------------------
 1 | 1| LuxMe Nails and Spa 
 2 | 2|Special Promotion
 3 | 2| Why Clients Choose Us 
 4 | 2|Our Services
 5 | 4| Manicure 
 6 | 4| Make Up 
 7 | 4| Pedicure 
 8 | 4| Artificial Nails 
 9 | 4| Permanent Make-up 
10 | 4| Waxing 
11 | 4| Nail Art 
12 | 4| Kid service 
13 | 4| Additional 
14 | 2|Our Services
15 | 4| Manicure 
16 | 4| Pedicure 
17 | 4| Art 
18 | 2|Our Staff
19 | 3|Beautiful hands give confidence!
20 | 4|Mary Lucas
21 | 4|Janette Wade
22 | 4|Ann Smith
23 | 2|Testimonials
24 | 2|Portfolio
25 | 2|Book Your Appointment Online
26 | 2|Hour
27 | 4|Address
28 | 4|Phone
29 | 


--------------------------------------------------------------------------------
/public/data/home_images.txt:
--------------------------------------------------------------------------------
 1 | photos/home/1.jpg|
 2 | photos/home/2.jpg|
 3 | photos/home/logo.jpg|
 4 | photos/home/1.jpg|
 5 | photos/home/service-1.jpg|
 6 | photos/home/service-2.jpg|
 7 | photos/home/service-3.jpg|
 8 | images/team-1-370x370.jpg|
 9 | images/team-2-370x370.jpg|
10 | images/team-3-370x370.jpg|
11 | photos/home/3.jpg|
12 | photos/home/4.jpg|
13 | 


--------------------------------------------------------------------------------
/public/data/home_links.txt:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/brianlapp/luxmenailsandspa-com/main/public/data/home_links.txt


--------------------------------------------------------------------------------
/public/data/home_lists.txt:
--------------------------------------------------------------------------------
1 | 
2 | 


--------------------------------------------------------------------------------
/public/data/home_paragraphs.txt:
--------------------------------------------------------------------------------
 1 | Loading...
 2 |  Let our skilled makeup artists create a flawless look tailored just for you
 3 |  We ensure every pressure point is targeted for maximum relief and relaxation
 4 |  Nail art is such a creative and fun way to express yourself!
 5 |  Our manicure treatments stimulate nail growth and soften dry, dull skin. 
 6 |  Let our nail artists create a stunning and sustainable nail design for you. 
 7 |  happy clients 
 8 |  team members 
 9 | Founder, Senior Nail Technician
10 | Manicurist
11 | Pedicurist
12 |  We offers following services: 
13 |  We will be glad to see you anytime at our salon. 
14 | 


--------------------------------------------------------------------------------
/public/data/internal_links.txt:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/brianlapp/luxmenailsandspa-com/main/public/data/internal_links.txt


--------------------------------------------------------------------------------
/public/data/nav_links.txt:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/brianlapp/luxmenailsandspa-com/main/public/data/nav_links.txt


--------------------------------------------------------------------------------
/public/data/navigation.json:
--------------------------------------------------------------------------------
 1 | {"navigation": [
 2 |   {"url": "https://luxmenailsandspa.com/javascript: scrollto('home')", "label": "Home"},
 3 |   {"url": "https://luxmenailsandspa.com/javascript: scrollto('about')", "label": "About"},
 4 |   {"url": "https://luxmenailsandspa.com/javascript: scrollto('gallery')", "label": "Gallery"},
 5 |   {"url": "https://luxmenailsandspa.com/javascript: scrollto('contact')", "label": "Contacts"},
 6 |   {"url": "https://luxmenailsandspa.com/overview.html", "label": "Book Now"},
 7 |   {"url": "https://luxmenailsandspa.com/team-member-profile.html", "label": "Mary Lucas"},
 8 |   {"url": "https://luxmenailsandspa.com/team-member-profile.html", "label": "Janette Wade"},
 9 |   {"url": "https://luxmenailsandspa.com/team-member-profile.html", "label": "Ann Smith"},
10 |   {"url": "https://luxmenailsandspa.com/grid-gallery.html", "label": "View our gallery"},
11 |   {"url": "https://luxmenailsandspa.com/index.html", "label": "Home"}
12 | ]}
13 | 


--------------------------------------------------------------------------------
/public/data/pages.json:
--------------------------------------------------------------------------------
 1 | {"pages": [
 2 |   {"url": "https://luxmenailsandspa.com/javascript: scrollto('home')", "slug": "javascript--scrollto--home--", "title": "Home"},
 3 |   {"url": "https://luxmenailsandspa.com/javascript: scrollto('about')", "slug": "javascript--scrollto--about--", "title": "About"},
 4 |   {"url": "https://luxmenailsandspa.com/javascript: scrollto('gallery')", "slug": "javascript--scrollto--gallery--", "title": "Gallery"},
 5 |   {"url": "https://luxmenailsandspa.com/javascript: scrollto('contact')", "slug": "javascript--scrollto--contact--", "title": "Contacts"},
 6 |   {"url": "https://luxmenailsandspa.com/overview.html", "slug": "overview-html", "title": "Book Now"},
 7 |   {"url": "https://luxmenailsandspa.com/team-member-profile.html", "slug": "team-member-profile-html", "title": "Mary Lucas
 8 | Janette Wade
 9 | Ann Smith"},
10 |   {"url": "https://luxmenailsandspa.com/team-member-profile.html", "slug": "team-member-profile-html", "title": "Mary Lucas
11 | Janette Wade
12 | Ann Smith"},
13 |   {"url": "https://luxmenailsandspa.com/team-member-profile.html", "slug": "team-member-profile-html", "title": "Mary Lucas
14 | Janette Wade
15 | Ann Smith"},
16 |   {"url": "https://luxmenailsandspa.com/grid-gallery.html", "slug": "grid-gallery-html", "title": "View our gallery"},
17 |   {"url": "https://luxmenailsandspa.com/index.html", "slug": "index-html", "title": "Home"},
18 |   {"url": "https://luxmenailsandspa.com", "slug": "home", "title": " LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7"}
19 | ]}
20 | 


--------------------------------------------------------------------------------
/public/data/phones.txt:
--------------------------------------------------------------------------------
1 | +16137798540
2 | 6137798540
3 | 


--------------------------------------------------------------------------------
/public/data/site_info.json:
--------------------------------------------------------------------------------
 1 | {
 2 |   "title": " LuxMe Nails and Spa - 2430 Bank St #9, Ottawa, ON K1V 0T7",
 3 |   "description": "",
 4 |   "keywords": "Nail salon in Ottawa, LuxMe Nails and Spa on 2430 Bank St #9, ON K1V 0T7",
 5 |   "url": "https://luxmenailsandspa.com",
 6 |   "domain": "luxmenailsandspa.com",
 7 |   "primary_color": "#0057B8",
 8 |   "secondary_color": "#FF9500",
 9 |   "scrape_date": "2025-04-25",
10 |   "pages_found": 0
11 | }
12 | 


--------------------------------------------------------------------------------
/public/data/social_media.txt:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/brianlapp/luxmenailsandspa-com/main/public/data/social_media.txt


--------------------------------------------------------------------------------
/public/images/1.jpg:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/brianlapp/luxmenailsandspa-com/main/public/images/1.jpg


--------------------------------------------------------------------------------
/public/images/2.jpg:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/brianlapp/luxmenailsandspa-com/main/public/images/2.jpg


--------------------------------------------------------------------------------
/public/images/3.jpg:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/brianlapp/luxmenailsandspa-com/main/public/images/3.jpg


--------------------------------------------------------------------------------
/public/images/4.jpg:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/brianlapp/luxmenailsandspa-com/main/public/images/4.jpg


--------------------------------------------------------------------------------
/public/images/logo.jpg:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/brianlapp/luxmenailsandspa-com/main/public/images/logo.jpg


--------------------------------------------------------------------------------
