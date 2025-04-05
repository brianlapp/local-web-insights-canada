import { useState, useRef } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { tools, Tool } from '@/data/tools'
import { toast } from '@/components/ui/use-toast'
import { AlertCircle, RefreshCw } from 'lucide-react'

export function ToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const categories = Array.from(new Set(tools.map(tool => tool.category))) as string[]

  const filteredTools = tools.filter(tool => {
    const matchesCategory = !selectedCategory || tool.category === selectedCategory
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool)
    setAnalysisError(null)
    setUrl('')
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/icons/fallback.svg'
    e.currentTarget.alt = 'Fallback icon'
    toast({
      title: 'Warning',
      description: 'Failed to load tool icon',
      variant: 'destructive',
    })
  }

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const analyzeUrl = async (retryCount = 0) => {
    if (!validateUrl(url)) {
      setAnalysisError('Please enter a valid URL')
      urlInputRef.current?.focus()
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)

    try {
      const response = await fetch(`/api/analyze?url=${encodeURIComponent(url)}`)
      
      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: 'Rate Limited',
            description: 'Too many requests. Please try again in a few minutes.',
            variant: 'destructive',
          })
          return
        }
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      // Handle successful analysis...
      
    } catch (error) {
      const errorMessage = 'A network error occurred. Please try again.'
      setAnalysisError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRetry = () => {
    analyzeUrl()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">SEO Tools Directory</h1>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search tools..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tools"
          />
        </div>
        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const categoryTools = filteredTools.filter(tool => tool.category === category)
          if (categoryTools.length === 0) return null

          return (
            <div key={category} className="space-y-4">
              <h2 className="text-2xl font-semibold">{category}</h2>
              {categoryTools.map(tool => (
                <article
                  key={tool.id}
                  className="bg-white rounded-lg shadow-md p-6"
                  aria-label={tool.name}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={tool.icon}
                      alt={`${tool.name} icon`}
                      className="w-12 h-12"
                      onError={handleImageError}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
                      <p className="text-gray-600 mb-4">{tool.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{tool.difficulty}</span>
                        <Button
                          onClick={() => handleToolClick(tool)}
                          aria-label={`Use ${tool.name}`}
                        >
                          Use Tool
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        })}
      </div>

      {/* Tool Dialog */}
      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTool?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                ref={urlInputRef}
                type="url"
                placeholder="Enter URL to analyze"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                aria-label="URL"
                aria-invalid={!!analysisError}
              />
              {analysisError && (
                <div 
                  className="text-red-500 text-sm mt-1 flex items-center gap-1"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertCircle className="w-4 h-4" />
                  {analysisError}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => analyzeUrl()}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
              {analysisError && (
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  disabled={isAnalyzing}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
            {!analysisError && url && (
              <div role="region" aria-label="Analysis results">
                {/* Results would be displayed here */}
                <p>Analysis results for {url} would appear here</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ToolsPage;
