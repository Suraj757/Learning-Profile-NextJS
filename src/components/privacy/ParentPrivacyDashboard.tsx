'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Eye, 
  Download, 
  Trash2, 
  Settings,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell
} from 'lucide-react'

/**
 * Parent Privacy Dashboard
 * Comprehensive privacy controls for parents managing their child's educational data
 * COPPA/FERPA compliant interface with transparent data practices
 */

interface ChildPrivacyData {
  student_id: string
  first_name: string
  age: number
  grade: string
  
  // Consent Status
  consents: {
    educational_records: { granted: boolean; date: string }
    learning_analytics: { granted: boolean; date: string }
    progress_sharing: { granted: boolean; date: string }
    research_participation: { granted: boolean; date: string }
  }
  
  // Data Summary
  data_collected: {
    academic_records: number
    behavioral_observations: number
    assessment_results: number
    learning_activities: number
  }
  
  // Recent Activity
  recent_access: {
    teacher_views: number
    admin_access: number
    system_updates: number
    last_activity: string
  }
  
  // Privacy Health Score
  privacy_score: number
  compliance_status: 'compliant' | 'needs_attention' | 'violation'
}

interface ParentPrivacyDashboardProps {
  parentId: string
  children: ChildPrivacyData[]
}

export default function ParentPrivacyDashboard({ 
  parentId, 
  children: initialChildren 
}: ParentPrivacyDashboardProps) {
  const [children, setChildren] = useState<ChildPrivacyData[]>(initialChildren)
  const [selectedChild, setSelectedChild] = useState<string>(initialChildren[0]?.student_id || '')
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'activity' | 'requests'>('overview')
  const [showNotifications, setShowNotifications] = useState(false)

  const currentChild = children.find(child => child.student_id === selectedChild)

  const handleConsentChange = async (consentType: string, granted: boolean) => {
    if (!currentChild) return

    // Update UI immediately
    const updatedChildren = children.map(child => 
      child.student_id === selectedChild
        ? {
            ...child,
            consents: {
              ...child.consents,
              [consentType]: {
                granted,
                date: new Date().toISOString()
              }
            }
          }
        : child
    )
    setChildren(updatedChildren)

    // API call to update consent
    try {
      await fetch(`/api/privacy/consent`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedChild,
          consent_type: consentType,
          granted,
          parent_id: parentId
        })
      })
    } catch (error) {
      console.error('Failed to update consent:', error)
      // Revert UI changes on error
      setChildren(children)
    }
  }

  const handleDataExport = async () => {
    if (!currentChild) return

    try {
      const response = await fetch(`/api/privacy/export/${selectedChild}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentChild.first_name}_learning_data.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const getPrivacyScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'needs_attention':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'violation':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Shield className="w-5 h-5 text-gray-400" />
    }
  }

  if (!currentChild) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No children found. Please contact your school administrator.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Privacy Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your child's educational data privacy and permissions
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
          </div>

          {/* Child Selection */}
          {children.length > 1 && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {children.map(child => (
                <Button
                  key={child.student_id}
                  variant={selectedChild === child.student_id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedChild(child.student_id)}
                >
                  {child.first_name} (Grade {child.grade})
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Privacy Health Score */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentChild.first_name}'s Privacy Health
                  </h3>
                  <p className="text-sm text-gray-600">
                    Overall privacy and compliance status
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getPrivacyScoreColor(currentChild.privacy_score)}`}>
                  {currentChild.privacy_score}%
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {getComplianceIcon(currentChild.compliance_status)}
                  <span className="text-sm text-gray-600 capitalize">
                    {currentChild.compliance_status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'permissions', label: 'Permissions', icon: Settings },
              { id: 'activity', label: 'Recent Activity', icon: Clock },
              { id: 'requests', label: 'Data Requests', icon: Download }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Data Collection Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Data Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Academic Records</span>
                    <Badge variant="secondary">{currentChild.data_collected.academic_records}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Assessment Results</span>
                    <Badge variant="secondary">{currentChild.data_collected.assessment_results}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Learning Activities</span>
                    <Badge variant="secondary">{currentChild.data_collected.learning_activities}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Behavioral Notes</span>
                    <Badge variant="secondary">{currentChild.data_collected.behavioral_observations}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Recent Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Teacher Views</span>
                    <Badge variant="outline">{currentChild.recent_access.teacher_views}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Admin Access</span>
                    <Badge variant="outline">{currentChild.recent_access.admin_access}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">System Updates</span>
                    <Badge variant="outline">{currentChild.recent_access.system_updates}</Badge>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-gray-500">Last Activity</p>
                    <p className="text-sm font-medium">
                      {new Date(currentChild.recent_access.last_activity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleDataExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('permissions')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Update Permissions
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Request Data Deletion
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'permissions' && (
          <Card>
            <CardHeader>
              <CardTitle>Data Sharing Permissions</CardTitle>
              <p className="text-sm text-gray-600">
                Control how {currentChild.first_name}'s educational data is collected and shared.
                Changes take effect immediately.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(currentChild.consents).map(([consentType, consent]) => (
                  <div key={consentType} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {consentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {getConsentDescription(consentType)}
                      </p>
                      {consent.granted && (
                        <p className="text-xs text-gray-500 mt-2">
                          Granted on {new Date(consent.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      <Button
                        variant={consent.granted ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleConsentChange(consentType, !consent.granted)}
                      >
                        {consent.granted ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Data Activity</CardTitle>
              <p className="text-sm text-gray-600">
                Track who has accessed {currentChild.first_name}'s educational records.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Activity log functionality coming soon.</p>
                <p className="text-sm mt-2">
                  You'll be able to see detailed access logs here once our systems are fully deployed.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'requests' && (
          <Card>
            <CardHeader>
              <CardTitle>Data Requests</CardTitle>
              <p className="text-sm text-gray-600">
                Export or delete {currentChild.first_name}'s educational data.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Download a complete copy of all educational data we have collected about {currentChild.first_name}.
                  </p>
                  <Button onClick={handleDataExport} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Start Export
                  </Button>
                </div>
                
                <div className="p-6 border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Delete Data</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Request deletion of {currentChild.first_name}'s data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Request Deletion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Helper function for consent descriptions
function getConsentDescription(consentType: string): string {
  const descriptions = {
    educational_records: 'Allow teachers and school staff to access learning profiles and academic progress.',
    learning_analytics: 'Enable analysis of learning patterns to provide personalized educational recommendations.',
    progress_sharing: 'Share progress updates and insights with authorized educational partners.',
    research_participation: 'Include anonymized data in educational research studies to improve learning outcomes.'
  }
  
  return descriptions[consentType as keyof typeof descriptions] || 'Manage data sharing for this category.'
}