'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Brain,
  Clock,
  TrendingUp,
  Users,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface MisinformationDemoProps {
  isActive: boolean
  isPlaying: boolean
}

const samplePosts = [
  {
    id: 1,
    content: "BREAKING: Massive earthquake hits downtown LA, buildings collapsing everywhere! Share to warn others! #earthquake #LA",
    author: "@newsalert_fake",
    timestamp: "2 min ago",
    credibilityScore: 15,
    status: 'misinformation',
    sources: 0,
    engagement: 1247,
    analysis: {
      sentiment: 'fear-mongering',
      factCheck: 'No seismic activity detected in LA area',
      sourceVerification: 'Unverified account with history of false claims',
      imageAnalysis: 'Stock photo from 2019 Turkey earthquake'
    }
  },
  {
    id: 2,
    content: "Emergency services confirm minor tremor in LA area, no damage reported. Stay calm and follow official channels for updates.",
    author: "@LAFireDept",
    timestamp: "5 min ago",
    credibilityScore: 95,
    status: 'verified',
    sources: 3,
    engagement: 892,
    analysis: {
      sentiment: 'informative',
      factCheck: 'Confirmed by USGS seismic data',
      sourceVerification: 'Official emergency services account',
      imageAnalysis: 'No images attached'
    }
  },
  {
    id: 3,
    content: "Felt a small shake in downtown LA. Anyone else? Checking news for updates. Hope everyone is safe.",
    author: "@resident_jane",
    timestamp: "3 min ago",
    credibilityScore: 72,
    status: 'likely_true',
    sources: 1,
    engagement: 156,
    analysis: {
      sentiment: 'concerned but rational',
      factCheck: 'Consistent with verified reports',
      sourceVerification: 'Regular user with normal posting pattern',
      imageAnalysis: 'No images attached'
    }
  }
]

export function MisinformationDemo({ isActive, isPlaying }: MisinformationDemoProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [analyzingPost, setAnalyzingPost] = useState<number | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  useEffect(() => {
    if (!isPlaying || !isActive) {
      setCurrentStep(0)
      setAnalyzingPost(null)
      setAnalysisProgress(0)
      return
    }

    const sequence = async () => {
      // Step 1: Start analysis
      setCurrentStep(1)
      setAnalyzingPost(1)
      
      // Simulate AI analysis progress
      for (let i = 0; i <= 100; i += 10) {
        setAnalysisProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Step 2: Show results
      setCurrentStep(2)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Step 3: Analyze second post
      setAnalyzingPost(2)
      setAnalysisProgress(0)
      
      for (let i = 0; i <= 100; i += 20) {
        setAnalysisProgress(i)
        await new Promise(resolve => setTimeout(resolve, 150))
      }
      
      // Step 4: Final results
      setCurrentStep(3)
      setAnalyzingPost(null)
    }

    sequence()
  }, [isPlaying, isActive])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'misinformation': return 'text-red-500'
      case 'verified': return 'text-green-500'
      case 'likely_true': return 'text-yellow-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'misinformation': return XCircle
      case 'verified': return CheckCircle
      case 'likely_true': return AlertTriangle
      default: return Shield
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">AI-Powered Misinformation Detection</h3>
          <p className="text-muted-foreground">
            Real-time analysis of social media posts during crisis events
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-2">
          <Brain className="w-4 h-4" />
          <span>AI Analysis</span>
        </Badge>
      </div>

      {/* Demo Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Social Media Feed */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Social Media Feed
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {samplePosts.map((post, index) => {
              const StatusIcon = getStatusIcon(post.status)
              const isAnalyzing = analyzingPost === post.id
              const showResult = currentStep >= 2 || (currentStep >= 1 && post.id !== 1)
              
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`p-4 border rounded-lg transition-all ${
                    isAnalyzing ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{post.author}</span>
                      <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                    </div>
                    
                    <AnimatePresence>
                      {isAnalyzing && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center space-x-2"
                        >
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-primary">Analyzing...</span>
                        </motion.div>
                      )}
                      
                      {showResult && !isAnalyzing && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center space-x-2"
                        >
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(post.status)}`} />
                          <span className={`text-xs font-medium ${getStatusColor(post.status)}`}>
                            {post.credibilityScore}% credible
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <p className="text-sm mb-3">{post.content}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {post.engagement}
                      </span>
                      <span className="flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {post.sources} sources
                      </span>
                    </div>
                    
                    {isAnalyzing && (
                      <div className="w-24">
                        <Progress value={analysisProgress} className="h-1" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            AI Analysis Results
          </h4>
          
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-muted-foreground"
              >
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Click "Start Interactive Demo" to begin analysis</p>
              </motion.div>
            )}
            
            {currentStep >= 1 && analyzingPost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-muted/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium">Analyzing Post #{analyzingPost}</h5>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary">Processing...</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Content Analysis</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <Progress value={analysisProgress} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Sentiment:</span>
                      <span className="ml-2 font-medium">Analyzing...</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sources:</span>
                      <span className="ml-2 font-medium">Verifying...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {currentStep >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {samplePosts.slice(0, currentStep >= 3 ? 3 : 1).map((post) => {
                  const StatusIcon = getStatusIcon(post.status)
                  
                  return (
                    <div key={post.id} className="bg-card border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium">Post Analysis #{post.id}</h5>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(post.status)}`} />
                          <Badge variant={post.status === 'misinformation' ? 'critical' : 
                                        post.status === 'verified' ? 'operational' : 'warning'}>
                            {post.credibilityScore}% Credible
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Sentiment:</span>
                          <span className="ml-2">{post.analysis.sentiment}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fact Check:</span>
                          <span className="ml-2">{post.analysis.factCheck}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Source:</span>
                          <span className="ml-2">{post.analysis.sourceVerification}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
