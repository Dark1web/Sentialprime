'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Satellite, 
  Eye, 
  MapPin, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface SatelliteDemoProps {
  isActive: boolean
  isPlaying: boolean
}

const satelliteData = {
  location: 'Northern California Wildfire Zone',
  coordinates: { lat: 38.7783, lng: -122.4477 },
  captureTime: '2024-01-15 14:30 UTC',
  satellite: 'Sentinel-2A',
  resolution: '10m/pixel',
  cloudCover: '5%',
  analysisResults: {
    firePerimeter: '2,847 hectares',
    damageAssessment: 'Severe',
    structuresAffected: 156,
    evacuationZones: 3,
    riskLevel: 'Critical',
    changeDetection: '+340% fire spread in 24h'
  }
}

const analysisSteps = [
  { name: 'Image Preprocessing', duration: 1000, progress: 0 },
  { name: 'Change Detection', duration: 1500, progress: 0 },
  { name: 'Fire Perimeter Analysis', duration: 2000, progress: 0 },
  { name: 'Damage Assessment', duration: 1200, progress: 0 },
  { name: 'Risk Evaluation', duration: 800, progress: 0 },
]

export function SatelliteDemo({ isActive, isPlaying }: SatelliteDemoProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    if (!isPlaying || !isActive) {
      setCurrentStep(0)
      setAnalysisStep(0)
      setStepProgress(0)
      setCompletedSteps([])
      return
    }

    const sequence = async () => {
      setCurrentStep(1)
      
      // Process each analysis step
      for (let i = 0; i < analysisSteps.length; i++) {
        setAnalysisStep(i)
        setStepProgress(0)
        
        // Animate progress for current step
        const step = analysisSteps[i]
        const progressInterval = setInterval(() => {
          setStepProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval)
              return 100
            }
            return prev + (100 / (step.duration / 50))
          })
        }, 50)
        
        await new Promise(resolve => setTimeout(resolve, step.duration))
        setCompletedSteps(prev => [...prev, i])
      }
      
      // Show final results
      setCurrentStep(2)
    }

    sequence()
  }, [isPlaying, isActive])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Satellite Imagery Analysis</h3>
          <p className="text-muted-foreground">
            Real-time satellite data processing for disaster monitoring and damage assessment
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-2">
          <Satellite className="w-4 h-4" />
          <span>Live Analysis</span>
        </Badge>
      </div>

      {/* Demo Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Satellite Image Viewer */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Satellite Imagery
          </h4>
          
          <div className="relative bg-gradient-to-br from-green-900 via-yellow-800 to-red-900 rounded-lg overflow-hidden aspect-square">
            {/* Simulated satellite image background */}
            <div className="absolute inset-0 opacity-60">
              <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-red-500 rounded-full blur-sm opacity-80" />
              <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-orange-500 rounded-full blur-sm opacity-70" />
              <div className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-red-600 rounded-full blur-md opacity-90" />
              <div className="absolute bottom-1/4 right-1/3 w-8 h-8 bg-yellow-500 rounded-full blur-sm opacity-60" />
            </div>
            
            {/* Overlay information */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Satellite className="w-4 h-4" />
                <span className="font-medium">{satelliteData.satellite}</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {satelliteData.coordinates.lat}°N, {satelliteData.coordinates.lng}°W
                </div>
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {satelliteData.captureTime}
                </div>
              </div>
            </div>
            
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
              <div className="text-xs text-gray-300 mb-1">Resolution</div>
              <div className="font-medium">{satelliteData.resolution}</div>
              <div className="text-xs text-gray-300 mb-1 mt-2">Cloud Cover</div>
              <div className="font-medium">{satelliteData.cloudCover}</div>
            </div>
            
            {/* Analysis overlay */}
            <AnimatePresence>
              {currentStep >= 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 border-dashed"
                >
                  <div className="absolute bottom-4 left-4 bg-blue-500/90 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span>Analyzing...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {currentStep >= 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0"
                >
                  {/* Fire perimeter overlay */}
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-red-500 rounded-full animate-pulse" />
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/20 rounded-full" />
                  
                  {/* Damage markers */}
                  <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  <div className="absolute bottom-1/2 left-1/2 w-3 h-3 bg-orange-500 rounded-full animate-ping" />
                  
                  <div className="absolute bottom-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Critical Risk Detected</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {satelliteData.location}
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            AI Analysis Pipeline
          </h4>
          
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-muted-foreground"
              >
                <Satellite className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Click "Start Interactive Demo" to begin analysis</p>
              </motion.div>
            )}
            
            {currentStep >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-medium mb-4">Processing Steps</h5>
                  <div className="space-y-3">
                    {analysisSteps.map((step, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {completedSteps.includes(index) ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : analysisStep === index ? (
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-full" />
                            )}
                            <span className={`text-sm ${
                              completedSteps.includes(index) ? 'text-green-600 dark:text-green-400' :
                              analysisStep === index ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                              {step.name}
                            </span>
                          </div>
                          {analysisStep === index && (
                            <span className="text-xs text-primary">{Math.round(stepProgress)}%</span>
                          )}
                        </div>
                        {analysisStep === index && (
                          <Progress value={stepProgress} className="h-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {currentStep >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border rounded-lg p-4"
                  >
                    <h5 className="font-medium mb-4">Analysis Results</h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fire Perimeter:</span>
                        <span className="font-medium">{satelliteData.analysisResults.firePerimeter}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Damage Level:</span>
                        <Badge variant="critical">{satelliteData.analysisResults.damageAssessment}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Structures Affected:</span>
                        <span className="font-medium text-red-500">{satelliteData.analysisResults.structuresAffected}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Evacuation Zones:</span>
                        <span className="font-medium">{satelliteData.analysisResults.evacuationZones}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change Detection:</span>
                        <span className="font-medium text-red-500 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {satelliteData.analysisResults.changeDetection}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Risk Level: {satelliteData.analysisResults.riskLevel}</span>
                      </div>
                      <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                        Immediate evacuation recommended for affected zones
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
