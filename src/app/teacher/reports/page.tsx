'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Download, 
  FileText, 
  BarChart3, 
  Users, 
  Calendar,
  ArrowLeft,
  Filter,
  RefreshCw
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import { getTeacherClassrooms, getTeacherAssignments } from '@/lib/supabase'
import type { Classroom, ProfileAssignment } from '@/lib/supabase'
import AuthRequired from '@/components/teacher/AuthRequired'
import { getDemoReportsData } from '@/lib/demo-data'

export default function TeacherReportsPage() {
  const { teacher } = useTeacherAuth()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [assignments, setAssignments] = useState<ProfileAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all')

  useEffect(() => {
    if (teacher) {
      loadData()
    }
  }, [teacher])

  const loadData = async () => {
    if (!teacher) return

    try {
      const [classroomsData, assignmentsData] = await Promise.all([
        getTeacherClassrooms(teacher.id),
        getTeacherAssignments(teacher.id)
      ])
      
      // If no data found and this is a demo teacher, use fallback demo data
      if ((!classroomsData || classroomsData.length === 0) && 
          (teacher.email === 'demo@school.edu' || teacher.isOfflineDemo)) {
        const demoData = getDemoReportsData(teacher.id)
        setClassrooms(demoData.classrooms as any)
        setAssignments(demoData.assignments as any)
      } else {
        setClassrooms(classroomsData || [])
        setAssignments(assignmentsData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      
      // If error and demo teacher, fall back to demo data
      if (teacher.email === 'demo@school.edu' || teacher.isOfflineDemo) {
        const demoData = getDemoReportsData(teacher.id)
        setClassrooms(demoData.classrooms as any)
        setAssignments(demoData.assignments as any)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const filteredAssignments = selectedClassroom === 'all' 
      ? assignments 
      : assignments.filter(a => a.classroom_id === selectedClassroom)

    const csvContent = [
      ['Student Name', 'Parent Email', 'Classroom', 'Status', 'Assigned Date', 'Completed Date'].join(','),
      ...filteredAssignments.map(assignment => [
        assignment.child_name,
        assignment.parent_email,
        classrooms.find(c => c.id === assignment.classroom_id)?.name || 'Unknown',
        assignment.status,
        new Date(assignment.assigned_at).toLocaleDateString(),
        assignment.completed_at ? new Date(assignment.completed_at).toLocaleDateString() : 'Not completed'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `learning-profiles-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    window.print()
  }

  if (loading) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-begin-cream flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
            <p className="text-begin-blue">Loading reports...</p>
          </div>
        </div>
      </AuthRequired>
    )
  }

  const filteredAssignments = selectedClassroom === 'all' 
    ? assignments 
    : assignments.filter(a => a.classroom_id === selectedClassroom)

  const completedCount = filteredAssignments.filter(a => a.status === 'completed').length
  const pendingCount = filteredAssignments.length - completedCount
  const completionRate = filteredAssignments.length > 0 
    ? Math.round((completedCount / filteredAssignments.length) * 100) 
    : 0

  return (
    <AuthRequired>
      <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-begin-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/teacher/dashboard"
                className="p-2 text-begin-blue/70 hover:text-begin-teal transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-begin-teal" />
                <div>
                  <h1 className="text-2xl font-bold text-begin-blue">Reports & Analytics</h1>
                  <p className="text-sm text-begin-blue/70">Export and analyze learning profile data</p>
                </div>
              </div>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 text-begin-blue hover:text-begin-teal transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="card-begin mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-begin-blue" />
              <select
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
                className="border border-begin-gray rounded-card px-3 py-2 text-begin-blue bg-white focus:outline-none focus:ring-2 focus:ring-begin-teal focus:border-begin-teal"
              >
                <option value="all">All Classrooms</option>
                {classrooms.map(classroom => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} ({classroom.grade_level})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                className="btn-begin-secondary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="btn-begin-primary flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Print Report
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-begin bg-gradient-to-br from-begin-blue to-begin-blue/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Assignments</p>
                <p className="text-2xl font-bold">{filteredAssignments.length}</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="card-begin bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
              <FileText className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="card-begin bg-gradient-to-br from-begin-cyan to-begin-cyan/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Calendar className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="card-begin bg-gradient-to-br from-begin-teal to-begin-teal/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card-begin">
          <h2 className="text-heading-lg font-bold text-begin-blue mb-6">Assignment Details</h2>
          
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-begin-gray mx-auto mb-4" />
              <h3 className="text-heading font-semibold text-begin-blue mb-2">No data to display</h3>
              <p className="text-begin-blue/70">
                {selectedClassroom === 'all' 
                  ? 'No assignments have been sent yet' 
                  : 'No assignments for this classroom'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-begin-cream/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-begin-blue">Student</th>
                    <th className="text-left py-3 px-4 font-semibold text-begin-blue">Parent Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-begin-blue">Classroom</th>
                    <th className="text-left py-3 px-4 font-semibold text-begin-blue">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-begin-blue">Assigned</th>
                    <th className="text-left py-3 px-4 font-semibold text-begin-blue">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment, index) => (
                    <tr key={assignment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-begin-cream/20'}>
                      <td className="py-3 px-4 font-medium text-begin-blue">{assignment.child_name}</td>
                      <td className="py-3 px-4 text-begin-blue/70">{assignment.parent_email}</td>
                      <td className="py-3 px-4 text-begin-blue/70">
                        {classrooms.find(c => c.id === assignment.classroom_id)?.name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assignment.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-begin-cyan/20 text-begin-cyan'
                        }`}>
                          {assignment.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-begin-blue/70">
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-begin-blue/70">
                        {assignment.completed_at 
                          ? new Date(assignment.completed_at).toLocaleDateString() 
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </AuthRequired>
  )
}