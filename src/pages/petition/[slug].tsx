import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPetitionData } from '@/lib/api'
import { useEffect } from 'react'

export function PetitionPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, error } = useQuery({
    queryKey: ['petition', slug],
    queryFn: () => fetchPetitionData(slug!),
    enabled: !!slug,
  })

  useEffect(() => {
    if (data) {
      document.title = `Support ${data.businessName} - Local Website Insights`
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Petition Not Found</h1>
        <p className="text-gray-600">
          Sorry, we couldn't find the petition you're looking for.
        </p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">{data.businessName}</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <p className="text-gray-700 mb-6">{data.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-primary">{data.signatures}</div>
            <div className="text-sm text-gray-600">Signatures</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-700">{data.goal}</div>
            <div className="text-sm text-gray-600">Goal</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full"
            style={{ width: `${(data.signatures / data.goal) * 100}%` }}
          ></div>
        </div>

        <button className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors">
          Sign Petition
        </button>
      </div>
    </div>
  )
} 