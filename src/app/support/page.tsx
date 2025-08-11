'use client'
import Link from 'next/link'
import { BookOpen, Mail, MessageSquare, Phone, ArrowLeft } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-begin-blue" />
              <span className="text-2xl font-bold text-begin-blue">Begin Learning Profile</span>
            </Link>
            <Link 
              href="/"
              className="text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-begin p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="bg-begin-teal/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-10 w-10 text-begin-teal" />
            </div>
            <h1 className="text-hero font-bold text-begin-blue mb-4">
              Support Center
            </h1>
            <p className="text-body-lg text-begin-blue/80 max-w-2xl mx-auto">
              Need help with Begin Learning Profile? We're here to support you and your students' learning journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Teachers */}
            <div className="bg-begin-blue/5 border border-begin-blue/20 rounded-card p-6">
              <h3 className="text-heading-lg font-bold text-begin-blue mb-4">For Teachers</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-begin-blue mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-begin-blue">Email Support</p>
                    <p className="text-sm text-begin-blue/70">teachers@speakaboos.com</p>
                    <p className="text-xs text-begin-blue/60 mt-1">Response within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-begin-blue mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-begin-blue">Phone Support</p>
                    <p className="text-sm text-begin-blue/70">1-800-SPEAK-ED</p>
                    <p className="text-xs text-begin-blue/60 mt-1">Mon-Fri, 8am-6pm EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Parents */}
            <div className="bg-begin-teal/5 border border-begin-teal/20 rounded-card p-6">
              <h3 className="text-heading-lg font-bold text-begin-blue mb-4">For Parents</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-begin-teal mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-begin-blue">Email Support</p>
                    <p className="text-sm text-begin-blue/70">parents@speakaboos.com</p>
                    <p className="text-xs text-begin-blue/60 mt-1">Response within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-begin-teal mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-begin-blue">Live Chat</p>
                    <p className="text-sm text-begin-blue/70">Available on parent portal</p>
                    <p className="text-xs text-begin-blue/60 mt-1">Mon-Fri, 9am-5pm EST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Common Issues */}
          <div className="mt-8 bg-begin-gray/10 rounded-card p-6">
            <h3 className="text-heading-lg font-bold text-begin-blue mb-4">Common Questions</h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-begin-blue">How do I reset my password?</p>
                <p className="text-sm text-begin-blue/70">Use the "Forgot Password" link on the login page, or contact support for assistance.</p>
              </div>
              
              <div>
                <p className="font-semibold text-begin-blue">How do parents complete assessments?</p>
                <p className="text-sm text-begin-blue/70">Teachers send assessment links via email. Parents click the link and complete the profile online.</p>
              </div>
              
              <div>
                <p className="font-semibold text-begin-blue">Is my data secure?</p>
                <p className="text-sm text-begin-blue/70">Yes, all data is FERPA compliant and encrypted. We never share student information with third parties.</p>
              </div>
            </div>
          </div>

          {/* Back Links */}
          <div className="mt-8 flex justify-center space-x-4">
            <Link 
              href="/teacher/login"
              className="btn-begin-secondary"
            >
              Teacher Login
            </Link>
            <Link 
              href="/teacher/register"
              className="btn-begin-primary"
            >
              Teacher Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}