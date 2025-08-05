'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  ArrowLeft, 
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Mail,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  AlertCircle
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import AuthRequired from '@/components/teacher/AuthRequired'

export default function TeacherSettingsPage() {
  const { teacher } = useTeacherAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'account'>('profile')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    name: '',
    email: '',
    school: '',
    grade_level: '',
    bio: ''
  })
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailAssignmentComplete: true,
    emailWeeklyReport: true,
    emailNewFeatures: false,
    emailMarketing: false,
    pushNotifications: true,
    smsReminders: false
  })
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'school',
    dataSharing: false,
    analyticsTracking: true,
    studentDataRetention: '2years'
  })

  useEffect(() => {
    if (teacher) {
      setProfileSettings({
        name: teacher.name || '',
        email: teacher.email || '',
        school: teacher.school || '',
        grade_level: teacher.grade_level || '',
        bio: teacher.bio || ''
      })
    }
  }, [teacher])

  const handleSaveSettings = async () => {
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSaved(true)
    setLoading(false)
    
    setTimeout(() => setSaved(false), 3000)
  }

  const handleExportData = () => {
    const data = {
      profile: profileSettings,
      notifications: notificationSettings,
      privacy: privacySettings,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `teacher-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'account', label: 'Account', icon: Settings }
  ]

  return (
    <AuthRequired>
      <div className="min-h-screen bg-begin-cream">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-begin-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/teacher/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-begin-blue">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Dashboard</span>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-8 w-8 text-begin-blue" />
                <span className="text-xl font-bold text-begin-blue">Teacher Settings</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="card-begin p-6">
                <h3 className="text-lg font-bold text-begin-blue mb-4">Settings</h3>
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-begin-teal text-white'
                            : 'text-begin-blue/70 hover:bg-begin-teal/10 hover:text-begin-teal'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>

                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t border-begin-gray">
                  <h4 className="text-sm font-semibold text-begin-blue mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={handleExportData}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-begin-blue/70 hover:text-begin-teal hover:bg-begin-teal/10 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Export Data
                    </button>
                    <Link
                      href="/teacher/help"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-begin-blue/70 hover:text-begin-teal hover:bg-begin-teal/10 rounded-lg transition-colors"
                    >
                      <BookOpen className="h-4 w-4" />
                      Help Center
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="card-begin p-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-bold text-begin-blue mb-6">Profile Information</h2>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-begin-blue mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={profileSettings.name}
                            onChange={(e) => setProfileSettings(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                            placeholder="Enter your full name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-begin-blue mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={profileSettings.email}
                            onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-begin-blue mb-2">
                            School
                          </label>
                          <input
                            type="text"
                            value={profileSettings.school}
                            onChange={(e) => setProfileSettings(prev => ({ ...prev, school: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                            placeholder="Enter your school name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-begin-blue mb-2">
                            Grade Level
                          </label>
                          <select
                            value={profileSettings.grade_level}
                            onChange={(e) => setProfileSettings(prev => ({ ...prev, grade_level: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                          >
                            <option value="">Select grade level</option>
                            <option value="PreK">PreK</option>
                            <option value="K">Kindergarten</option>
                            <option value="1st">1st Grade</option>
                            <option value="2nd">2nd Grade</option>
                            <option value="3rd">3rd Grade</option>
                            <option value="4th">4th Grade</option>
                            <option value="5th">5th Grade</option>
                            <option value="6th">6th Grade</option>
                            <option value="Middle School">Middle School</option>
                            <option value="High School">High School</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-begin-blue mb-2">
                          Teacher Bio
                        </label>
                        <textarea
                          value={profileSettings.bio}
                          onChange={(e) => setProfileSettings(prev => ({ ...prev, bio: e.target.value }))}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                          placeholder="Tell us about yourself and your teaching philosophy..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-2xl font-bold text-begin-blue mb-6">Notification Preferences</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-begin-blue mb-4">Email Notifications</h3>
                        <div className="space-y-4">
                          {[
                            { key: 'emailAssignmentComplete', label: 'Assessment completed by student', desc: 'Get notified when a student completes their learning profile assessment' },
                            { key: 'emailWeeklyReport', label: 'Weekly progress reports', desc: 'Receive weekly summaries of your classroom analytics' },
                            { key: 'emailNewFeatures', label: 'New feature announcements', desc: 'Be the first to know about new tools and features' },
                            { key: 'emailMarketing', label: 'Tips and educational content', desc: 'Receive teaching tips and educational resources' }
                          ].map((item) => (
                            <div key={item.key} className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                id={item.key}
                                checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                                onChange={(e) => setNotificationSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                className="mt-1 h-4 w-4 text-begin-teal focus:ring-begin-teal border-gray-300 rounded"
                              />
                              <div>
                                <label htmlFor={item.key} className="text-sm font-medium text-begin-blue">
                                  {item.label}
                                </label>
                                <p className="text-xs text-begin-blue/70">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-begin-blue mb-4">Other Notifications</h3>
                        <div className="space-y-4">
                          {[
                            { key: 'pushNotifications', label: 'Browser push notifications', desc: 'Receive instant notifications in your browser' },
                            { key: 'smsReminders', label: 'SMS reminders', desc: 'Get text message reminders for important events' }
                          ].map((item) => (
                            <div key={item.key} className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                id={item.key}
                                checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                                onChange={(e) => setNotificationSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                className="mt-1 h-4 w-4 text-begin-teal focus:ring-begin-teal border-gray-300 rounded"
                              />
                              <div>
                                <label htmlFor={item.key} className="text-sm font-medium text-begin-blue">
                                  {item.label}
                                </label>
                                <p className="text-xs text-begin-blue/70">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div>
                    <h2 className="text-2xl font-bold text-begin-blue mb-6">Privacy & Data</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-begin-blue mb-2">
                          Profile Visibility
                        </label>
                        <select
                          value={privacySettings.profileVisibility}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                        >
                          <option value="private">Private - Only visible to me</option>
                          <option value="school">School - Visible to my school administrators</option>
                          <option value="district">District - Visible to district administrators</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="dataSharing"
                            checked={privacySettings.dataSharing}
                            onChange={(e) => setPrivacySettings(prev => ({ ...prev, dataSharing: e.target.checked }))}
                            className="mt-1 h-4 w-4 text-begin-teal focus:ring-begin-teal border-gray-300 rounded"
                          />
                          <div>
                            <label htmlFor="dataSharing" className="text-sm font-medium text-begin-blue">
                              Share anonymized data for research
                            </label>
                            <p className="text-xs text-begin-blue/70">Help improve educational outcomes by sharing anonymized classroom data</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="analyticsTracking"
                            checked={privacySettings.analyticsTracking}
                            onChange={(e) => setPrivacySettings(prev => ({ ...prev, analyticsTracking: e.target.checked }))}
                            className="mt-1 h-4 w-4 text-begin-teal focus:ring-begin-teal border-gray-300 rounded"
                          />
                          <div>
                            <label htmlFor="analyticsTracking" className="text-sm font-medium text-begin-blue">
                              Analytics tracking
                            </label>
                            <p className="text-xs text-begin-blue/70">Allow us to track usage analytics to improve the platform</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-begin-blue mb-2">
                          Student Data Retention
                        </label>
                        <select
                          value={privacySettings.studentDataRetention}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, studentDataRetention: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                        >
                          <option value="1year">1 Year</option>
                          <option value="2years">2 Years</option>
                          <option value="3years">3 Years</option>
                          <option value="indefinite">Keep indefinitely</option>
                        </select>
                        <p className="text-xs text-begin-blue/70 mt-1">How long to keep student profile data after they leave your classroom</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div>
                    <h2 className="text-2xl font-bold text-begin-blue mb-6">Account Management</h2>
                    
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-semibold text-begin-blue mb-4">Change Password</h3>
                        <div className="space-y-4 max-w-md">
                          <div>
                            <label className="block text-sm font-medium text-begin-blue mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-begin-blue mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                              placeholder="Enter new password"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-begin-blue mb-2">
                              Confirm New Password  
                            </label>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                              placeholder="Confirm new password"
                            />
                          </div>
                          <button className="btn-begin-secondary">
                            Update Password
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-lg font-semibold text-begin-blue mb-4">Data Export</h3>
                        <p className="text-sm text-begin-blue/70 mb-4">
                          Download all your account data, including student profiles, classroom data, and settings.
                        </p>
                        <button
                          onClick={handleExportData}
                          className="btn-begin-secondary flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Export All Data
                        </button>
                      </div>

                      <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-red-800">Delete Account</h4>
                              <p className="text-sm text-red-700 mt-1">
                                Permanently delete your account and all associated data. This action cannot be undone.
                              </p>
                              <button className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete Account
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="btn-begin-primary flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : saved ? (
                      <>
                        <Save className="h-4 w-4" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthRequired>
  )
}