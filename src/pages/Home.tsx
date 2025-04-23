import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>Local Website Insights - Website Audit and SEO Tools</title>
        <meta 
          name="description" 
          content="Improve your local business website's performance with our comprehensive website audit and SEO tools." 
        />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">
          Welcome to Local Website Insights
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            Discover how to improve your local business website's performance
            and reach more customers online.
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature cards */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Website Audit</h2>
              <p className="text-gray-600 mb-4">
                Get a comprehensive analysis of your website's performance,
                SEO, and accessibility.
              </p>
              <Link
                to="/audit"
                className="text-primary hover:underline font-medium"
              >
                Start your audit →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">SEO Tools</h2>
              <p className="text-gray-600 mb-4">
                Access powerful tools to improve your search engine rankings
                and visibility.
              </p>
              <Link
                to="/tools"
                className="text-primary hover:underline font-medium"
              >
                Explore tools →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Success Stories</h2>
              <p className="text-gray-600 mb-4">
                See how other local businesses have improved their online
                presence.
              </p>
              <Link
                to="/case-studies"
                className="text-primary hover:underline font-medium"
              >
                View stories →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 