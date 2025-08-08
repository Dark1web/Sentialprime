'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Users, 
  Zap,
  Heart,
  Flame,
  Car,
  Home,
  Phone
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface TriageDemoProps {
  isActive: boolean
  isPlaying: boolean
}

const emergencyReports = [
  {
    id: 'E001',
    type: 'medical',
    title: 'Cardiac Emergency',
    description: '67-year-old male experiencing chest pain and shortness of breath',
    location: 'Downtown Medical Center, 5th Floor',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    priority: 'critical',
    severity: 95,
    resources: ['Ambulance', 'Cardiac Team', 'ICU Bed'],
    eta: '3 min',
    icon: Heart,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
  {
    id: 'E002',
    type: 'fire',
    title: 'Structure Fire',
    description: 'Apartment building fire, 3rd floor, multiple residents trapped',
    location: 'Maple Street Apartments, Unit 3B',
    coordinates: { lat: 34.0489, lng: -118.2518 },
    priority: 'high',
    severity: 88,
    resources: ['Fire Engine', 'Ladder Truck', 'Rescue Team'],
    eta: '5 min',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  {
    id: 'E003',
    type: 'accident',
    title: 'Multi-Vehicle Collision',
    description: '3-car accident on highway, 2 injuries reported, traffic blocked',
    location: 'I-405 Northbound, Mile Marker 23',
    coordinates: { lat: 34.0736, lng: -118.2400 },
    priority: 'medium',
    severity: 65,
    resources: ['Ambulance', 'Police Unit', 'Tow Truck'],
    eta: '8 min',
    icon: Car,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  },
  {
    id: 'E004',
    type: 'domestic',
    title: 'Domestic Disturbance',
    description: 'Noise complaint escalated, possible domestic violence situation',
    location: 'Oak Avenue Residence, 1247',
    coordinates: { lat: 34.0522, lng: -118.2500 },
    priority: 'low',
    severity: 35,
    resources: ['Police Unit', 'Social Worker'],
    eta: '12 min',
    icon: Home,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  }
]

export function TriageDemo({ isActive, isPlaying }: TriageDemoProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [processingReport, setProcessingReport] = useState<string | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [sortedReports, setSortedReports] = useState(emergencyReports)

  useEffect(() => {
    if (!isPlaying || !isActive) {
      setCurrentStep(0)
      setProcessingReport(null)
      setAnalysisProgress(0)
      setSortedReports(emergencyReports)
      return
    }

    const sequence = async () => {
      // Step 1: Start processing
      setCurrentStep(1)
      
      // Process each report
      for (const report of emergencyReports) {
        setProcessingReport(report.id)
        
        // Simulate AI analysis
        for (let i = 0; i <= 100; i += 25) {
          setAnalysisProgress(i)
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // Step 2: Show prioritized results
      setCurrentStep(2)
      setProcessingReport(null)
      
      // Sort by priority
      const sorted = [...emergencyReports].sort((a, b) => b.severity - a.severity)
      setSortedReports(sorted)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Step 3: Resource allocation
      setCurrentStep(3)
    }

    sequence()
  }, [isPlaying, isActive])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'critical'
      case 'high': return 'warning'
      case 'medium': return 'warning'
      case 'low': return 'operational'
      default: return 'unknown'
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Emergency Triage & Classification</h3>
          <p className="text-muted-foreground">
            AI-powered prioritization and resource allocation for emergency responses
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Live Triage</span>
        </Badge>
      </div>

      {/* Demo Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Emergency Reports */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-medium flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            Incoming Emergency Reports
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedReports.map((report, index) => {
              const isProcessing = processingReport === report.id
              const showResult = currentStep >= 2
              
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: showResult ? index * 0.1 : 0 }}
                  className={`p-4 border rounded-lg transition-all ${
                    isProcessing ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${report.bgColor}`}>
                        <report.icon className={`w-5 h-5 ${report.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{report.id}</span>
                          <Badge variant={getPriorityBadge(report.priority) as any}>
                            {report.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <h5 className="font-semibold">{report.title}</h5>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isProcessing && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center space-x-2"
                        >
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-primary">Processing...</span>
                        </motion.div>
                      )}
                      
                      {showResult && !isProcessing && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-right"
                        >
                          <div className={`text-lg font-bold ${getPriorityColor(report.priority)}`}>
                            {report.severity}%
                          </div>
                          <div className="text-xs text-muted-foreground">Severity</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        {report.location}
                      </span>
                      <span className="flex items-center text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        ETA: {report.eta}
                      </span>
                    </div>
                    
                    {isProcessing && (
                      <div className="w-20">
                        <Progress value={analysisProgress} className="h-1" />
                      </div>
                    )}
                  </div>
                  
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ delay: 0.3 }}
                      className="mt-3 pt-3 border-t border-border/50"
                    >
                      <div className="flex flex-wrap gap-1">
                        {report.resources.map((resource, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            AI Triage Analysis
          </h4>
          
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-muted-foreground"
              >
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Click "Start Interactive Demo" to begin triage</p>
              </motion.div>
            )}
            
            {currentStep >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-medium mb-3">Triage Factors</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Life Threat Level</span>
                      <span className="font-medium">40%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resource Availability</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Time</span>
                      <span className="font-medium">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location Factors</span>
                      <span className="font-medium">15%</span>
                    </div>
                  </div>
                </div>
                
                {currentStep >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border rounded-lg p-4"
                  >
                    <h5 className="font-medium mb-3">Priority Queue</h5>
                    <div className="space-y-2">
                      {sortedReports.slice(0, 3).map((report, index) => (
                        <div key={report.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${
                              index === 0 ? 'bg-red-500' :
                              index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                            }`} />
                            <span>{report.id}</span>
                          </div>
                          <span className="font-medium">{report.severity}%</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {currentStep >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
                  >
                    <h5 className="font-medium text-green-700 dark:text-green-400 mb-2">
                      Resources Allocated
                    </h5>
                    <div className="text-sm text-green-600 dark:text-green-300">
                      <p>✓ Critical case prioritized</p>
                      <p>✓ Optimal resource distribution</p>
                      <p>✓ Response teams dispatched</p>
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
