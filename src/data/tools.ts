export interface Tool {
  id: string
  name: string
  description: string
  category: string
  difficulty: string
  icon: string
}

export const tools: Tool[] = [
  {
    id: '1',
    name: 'Meta Tags Analyzer',
    description: 'Analyze and optimize your meta tags for better SEO',
    category: 'SEO',
    difficulty: 'Beginner',
    icon: '/icons/meta-tags.svg',
  },
  {
    id: '2',
    name: 'Image Optimizer',
    description: 'Optimize images for better performance and SEO',
    category: 'Performance',
    difficulty: 'Intermediate',
    icon: '/icons/image-opt.svg',
  },
  {
    id: '3',
    name: 'Schema Generator',
    description: 'Generate structured data for rich search results',
    category: 'SEO',
    difficulty: 'Advanced',
    icon: '/icons/schema.svg',
  },
] 