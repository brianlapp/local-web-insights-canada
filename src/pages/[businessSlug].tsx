
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchBusinessAudit } from '@/lib/api'
import { useEffect } from 'react'
import { AuditScore } from '@/components/audit/AuditScore'
import { Gauge, Zap, BarChart2, Search, Award } from 'lucide-react'
import ScoreCard from '@/components/ui/ScoreCard'
import { Button } from '@/components/ui/button'

export function BusinessAuditPage() {
  const { businessSlug } = useParams<{ businessSlug: string }>()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['business-audit', businessSlug],
    queryFn: () => fetchBusinessAudit(businessSlug!),
    enabled: !!businessSlug,
  })

  useEffect(() => {
    if (data?.name) {
      document.title = `${data.name} Website Audit - Local Website Insights`
    }
  }, [data])

  // For debugging
  useEffect(() => {
    if (data) {
      console.log('Business audit data loaded:', data);
    }
    if (error) {
      console.error('Error loading business audit:', error);
    }
  }, [data, error]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8" data-testid="loading-skeleton">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Business Not Found</h1>
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the business audit you're looking for.
        </p>
        <Button onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  const formattedDate = (() => {
    try {
      return new Date(data.lastAudit).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Date unavailable'
    }
  })()

  // Default metrics if they're missing
  const metrics = {
    seo: data.metrics?.seo ?? 0,
    performance: data.metrics?.performance ?? 0,
    accessibility: data.metrics?.accessibility ?? 0,
    bestPractices: data.metrics?.bestPractices ?? 0,
  }

  console.log('Rendering business audit with metrics:', metrics);

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{data.name}</h1>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          Refresh Data
        </Button>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white shadow-lg rounded-lg p-6 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Overall Score</h2>
          <AuditScore score={data.score} />
          <p className="text-sm text-gray-600 mt-4">
            Last audited: {formattedDate}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Detailed Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreCard 
              label="Performance" 
              score={metrics.performance} 
              icon={<Zap className="w-5 h-5" />} 
              description="How fast your site loads and responds" 
            />
            
            <ScoreCard 
              label="Accessibility" 
              score={metrics.accessibility} 
              icon={<Award className="w-5 h-5" />}
              description="How accessible your site is to all users" 
            />
            
            <ScoreCard 
              label="Best Practices" 
              score={metrics.bestPractices} 
              icon={<BarChart2 className="w-5 h-5" />}
              description="How well your site follows web standards" 
            />
            
            <ScoreCard 
              label="SEO" 
              score={metrics.seo} 
              icon={<Search className="w-5 h-5" />}
              description="How well search engines can find your site" 
            />
          </div>
        </div>
      </div>
    </div>
  )
} 
