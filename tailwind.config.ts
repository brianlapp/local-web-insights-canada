
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'dm-sans': ['"DM Sans"', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Civic theme colors
				civic: {
					blue: {
						DEFAULT: '#0E3B62',
						50: '#E6EEF5',
						100: '#C1D4E7',
						200: '#7CA4CD',
						300: '#4A7AB6',
						400: '#2B5A9E',
						500: '#0E3B62',
						600: '#0B3358',
						700: '#08294E',
						800: '#051F44',
						900: '#02163A',
					},
					gray: {
						DEFAULT: '#6B7280',
						50: '#F9FAFB',
						100: '#F5F7FA',
						200: '#E5E7EB',
						300: '#D1D5DB',
						400: '#9CA3AF',
						500: '#6B7280',
						600: '#4B5563',
						700: '#374151',
						800: '#1F2937',
						900: '#111827',
					},
					red: {
						DEFAULT: '#E53E3E',
						50: '#FDEBEB',
						100: '#FAD7D7',
						200: '#F5B0B0',
						300: '#F08888',
						400: '#EB6161',
						500: '#E53E3E',
						600: '#D01818',
						700: '#A21313',
						800: '#740E0E',
						900: '#460909',
					},
					green: {
						DEFAULT: '#10B981',
						50: '#E6F7F1',
						100: '#CCEFE3',
						200: '#99DFC8',
						300: '#66D0AC',
						400: '#33C091',
						500: '#10B981',
						600: '#0E9F70',
						700: '#0C855F',
						800: '#096C4F',
						900: '#06523C',
					},
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
