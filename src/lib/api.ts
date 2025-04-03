export interface PetitionData {
  id: string
  slug: string
  businessName: string
  description: string
  signatures: number
  goal: number
}

export interface BusinessAuditData {
  id: string
  slug: string
  name: string
  score: number
  lastAudit: string
  metrics: {
    seo: number
    performance: number
    accessibility: number
  }
}

export interface AuditData {
  score: number
  metrics: {
    performance: number
    accessibility: number
    seo: number
    bestPractices: number
  }
  recommendations: Array<{
    id: number
    category: string
    description: string
  }>
  lastUpdated: string
}

export async function fetchPetitionData(slug: string): Promise<PetitionData> {
  const response = await fetch(`/api/petitions/${slug}`)
  if (!response.ok) {
    throw new Error('Petition not found')
  }
  return response.json()
}

export async function fetchBusinessAudit(slug: string): Promise<BusinessAuditData> {
  const response = await fetch(`/api/businesses/${slug}/audit`)
  if (!response.ok) {
    throw new Error('Business not found')
  }
  return response.json()
}

export async function fetchAuditData(businessSlug: string): Promise<AuditData> {
  const response = await fetch(`/api/audit/${businessSlug}`)
  if (!response.ok) {
    throw new Error('Failed to fetch audit data')
  }
  return response.json()
}

export async function submitAuditData(businessSlug: string, data: AuditData): Promise<AuditData> {
  const response = await fetch(`/api/audit/${businessSlug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error('Failed to submit audit data')
  }
  
  return response.json()
} 