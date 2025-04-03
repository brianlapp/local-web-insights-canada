import { useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Helmet } from 'react-helmet'

export default function NotFound() {
  const navigate = useNavigate()
  const location = useLocation()
  const homeLink = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    // Set focus on the home link for accessibility
    homeLink.current?.focus()

    // Update document title
    document.title = 'Page Not Found - Local Website Insights'
  }, [])

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <>
      <Helmet>
        <title>Page Not Found - Local Website Insights</title>
        <link 
          rel="canonical" 
          href="https://localwebsiteinsights.ca/404" 
        />
        <meta 
          name="description" 
          content="The page you're looking for cannot be found. Please check the URL or navigate back to our homepage." 
        />
      </Helmet>

      <div 
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
        role="alert"
        aria-live="polite"
      >
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        
        <p className="text-gray-600 mb-8 max-w-md">
          Sorry, the page you're looking for doesn't exist. Please check the URL
          or use one of the options below to get back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to={`/${location.search}`}
            ref={homeLink}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>

          <Button
            onClick={handleGoBack}
            variant="outline"
            className="inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Button>
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Popular Pages</h2>
          <nav className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/audit"
              className="text-primary hover:underline"
            >
              Website Audit
            </Link>
            <Link
              to="/tools"
              className="text-primary hover:underline"
            >
              SEO Tools
            </Link>
            <Link
              to="/signup"
              className="text-primary hover:underline"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </div>
    </>
  )
}
