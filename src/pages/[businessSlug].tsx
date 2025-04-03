import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchBusinessAudit } from '@/lib/api'
import { useEffect } from 'react'
import { AuditScore } from '@/components/audit/AuditScore'

export function BusinessAuditPage() {
  const { businessSlug } = useParams<{ businessSlug: string }>()
  const { data, isLoading, error } = useQuery({
    queryKey: ['business-audit', businessSlug],
    queryFn: () => fetchBusinessAudit(businessSlug!),
    enabled: !!businessSlug,
  })

  useEffect(() => {
    if (data) {
      document.title = `${data.name} Website Audit - Local Website Insights`
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Business Not Found</h1>
        <p className="text-gray-600">
          Sorry, we couldn't find the business audit you're looking for.
        </p>
      </div>
    )
  }

  if (!data) return null

  const formattedDate = new Date(data.lastAudit).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">{data.name}</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Overall Score</h2>
          <AuditScore score={data.score} />
          <p className="text-sm text-gray-600 mt-4">
            Last audited: {formattedDate}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Detailed Metrics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">SEO</span>
                <span className="text-sm font-medium">{data.metrics.seo}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${data.metrics.seo}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Performance</span>
                <span className="text-sm font-medium">{data.metrics.performance}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${data.metrics.performance}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Accessibility</span>
                <span className="text-sm font-medium">{data.metrics.accessibility}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${data.metrics.accessibility}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 