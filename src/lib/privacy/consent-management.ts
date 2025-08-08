/**
 * Educational Consent Management System
 * Handles complex consent scenarios for COPPA, FERPA, and state privacy laws
 * Age-appropriate consent flows with automated compliance checking
 */

import { EducationalDataGovernance } from './educational-privacy-framework'

// ============================================================================
// CONSENT WORKFLOW ENGINE
// ============================================================================

export interface ConsentScenario {
  student_age: number
  consent_context: 'initial_enrollment' | 'new_feature' | 'data_sharing' | 'research_participation'
  data_sensitivity: 'low' | 'medium' | 'high' | 'restricted'
  third_party_involved: boolean
  cross_border_transfer: boolean
  research_component: boolean
}

export interface ConsentRequirement {
  requires_parental_consent: boolean
  requires_student_assent: boolean
  requires_enhanced_disclosure: boolean
  requires_ongoing_consent: boolean
  consent_expiration_days?: number
  withdrawal_grace_period_days: number
  special_protections: string[]
}

export class ConsentWorkflowEngine {
  
  /**
   * Determines consent requirements based on student age and data context
   */
  static determineConsentRequirements(scenario: ConsentScenario): ConsentRequirement {
    const {
      student_age,
      consent_context,
      data_sensitivity,
      third_party_involved,
      cross_border_transfer,
      research_component
    } = scenario

    // Base requirements by age
    let requirements: ConsentRequirement = {
      requires_parental_consent: student_age < 13,
      requires_student_assent: student_age >= 7 && student_age < 18,
      requires_enhanced_disclosure: student_age < 16,
      requires_ongoing_consent: false,
      withdrawal_grace_period_days: 30,
      special_protections: []
    }

    // Age-specific adjustments
    if (student_age < 13) {
      // COPPA requirements
      requirements.requires_parental_consent = true
      requirements.requires_enhanced_disclosure = true
      requirements.withdrawal_grace_period_days = 14 // Faster response for younger children
      requirements.special_protections.push('coppa_protection')
      
      if (data_sensitivity === 'high' || data_sensitivity === 'restricted') {
        requirements.requires_ongoing_consent = true
        requirements.consent_expiration_days = 365 // Annual renewal
      }
    }

    if (student_age >= 13 && student_age < 16) {
      // Enhanced protection for 13-16 age group
      requirements.requires_parental_consent = consent_context !== 'initial_enrollment'
      requirements.special_protections.push('enhanced_minor_protection')
    }

    if (student_age >= 16 && student_age < 18) {
      // Student can provide some consent, but parental notification required
      requirements.requires_parental_consent = data_sensitivity === 'restricted' || third_party_involved
      requirements.special_protections.push('parental_notification')
    }

    // Context-specific adjustments
    if (consent_context === 'research_participation' || research_component) {
      requirements.requires_enhanced_disclosure = true
      requirements.requires_ongoing_consent = true
      requirements.consent_expiration_days = 180 // Shorter renewal for research
      requirements.special_protections.push('research_safeguards')
    }

    if (third_party_involved) {
      requirements.requires_enhanced_disclosure = true
      requirements.special_protections.push('third_party_disclosure')
      
      if (student_age < 16) {
        requirements.requires_parental_consent = true
      }
    }

    if (cross_border_transfer) {
      requirements.requires_enhanced_disclosure = true
      requirements.requires_parental_consent = student_age < 16
      requirements.special_protections.push('international_transfer')
    }

    // High sensitivity data always requires enhanced protections
    if (data_sensitivity === 'restricted') {
      requirements.requires_parental_consent = true
      requirements.requires_enhanced_disclosure = true
      requirements.requires_ongoing_consent = true
      requirements.consent_expiration_days = Math.min(
        requirements.consent_expiration_days || 365, 
        180
      )
    }

    return requirements
  }

  /**
   * Generates age-appropriate consent forms
   */
  static generateConsentForm(
    scenario: ConsentScenario,
    requirements: ConsentRequirement
  ): {
    parent_form?: ConsentFormContent
    student_form?: ConsentFormContent
    simplified_notice: string
  } {
    const forms: any = {}

    if (requirements.requires_parental_consent) {
      forms.parent_form = this.createParentConsentForm(scenario, requirements)
    }

    if (requirements.requires_student_assent) {
      forms.student_form = this.createStudentAssentForm(scenario, requirements)
    }

    forms.simplified_notice = this.createSimplifiedNotice(scenario)

    return forms
  }

  private static createParentConsentForm(
    scenario: ConsentScenario,
    requirements: ConsentRequirement
  ): ConsentFormContent {
    const isCOPPAAge = scenario.student_age < 13
    
    return {
      title: isCOPPAAge 
        ? "Parental Consent for Child's Educational Data"
        : "Parental Permission for Student Data Use",
      
      introduction: isCOPPAAge
        ? `As the parent/guardian of a child under 13, federal law (COPPA) requires your permission before we can collect or use your child's personal information for educational purposes.`
        : `Your permission is requested for the collection and use of your child's educational information as described below.`,

      data_collection_section: {
        title: "What Information We Collect",
        items: this.getDataCollectionItems(scenario),
        child_friendly_explanation: isCOPPAAge ? this.getChildFriendlyExplanation() : undefined
      },

      usage_section: {
        title: "How We Use This Information",
        purposes: this.getUsagePurposes(scenario),
        educational_benefit: "This information helps teachers understand how your child learns best and provide personalized educational support."
      },

      sharing_section: {
        title: "Who We Share Information With",
        recipients: this.getSharingRecipients(scenario),
        no_marketing_disclosure: isCOPPAAge ? "We do not share your child's information for marketing purposes." : undefined
      },

      rights_section: {
        title: "Your Rights and Choices",
        rights: this.getParentalRights(scenario, requirements),
        withdrawal_process: "You can withdraw consent at any time by contacting us. Withdrawal will not affect information already collected with your permission."
      },

      security_section: {
        title: "How We Protect Your Child's Information",
        measures: [
          "Encryption of sensitive data",
          "Limited access to authorized educational personnel only",
          "Regular security audits and monitoring",
          "Compliance with educational privacy laws"
        ]
      },

      consent_options: this.getConsentOptions(scenario, requirements),

      legal_basis: requirements.special_protections.includes('coppa_protection')
        ? "This consent is required by the Children's Online Privacy Protection Act (COPPA) for children under 13."
        : "This consent enables us to provide educational services in compliance with student privacy laws."
    }
  }

  private static createStudentAssentForm(
    scenario: ConsentScenario,
    requirements: ConsentRequirement
  ): ConsentFormContent {
    const age = scenario.student_age
    const readingLevel = age < 10 ? 'elementary' : age < 14 ? 'middle' : 'high'

    return {
      title: "Your Learning Information",
      
      introduction: readingLevel === 'elementary'
        ? "Hi! We want to help you learn better. To do this, we need to keep track of some information about how you learn."
        : readingLevel === 'middle'
        ? "We're asking for your agreement to collect information about your learning to help your teachers support you better."
        : "We're requesting your assent to collect and use information about your educational progress and learning preferences.",

      data_collection_section: {
        title: readingLevel === 'elementary' ? "What We Keep Track Of" : "Information We Collect",
        items: this.getStudentFriendlyDataItems(readingLevel),
        reassurance: readingLevel === 'elementary' ? "Don't worry - we only share this with people who help you learn, like your teacher." : undefined
      },

      benefits_section: {
        title: readingLevel === 'elementary' ? "How This Helps You" : "Benefits to You",
        benefits: [
          readingLevel === 'elementary' ? "Your teacher can give you work that's just right for you" : "Personalized learning recommendations",
          readingLevel === 'elementary' ? "You can learn in the way that works best for you" : "Better understanding of your learning style",
          readingLevel === 'elementary' ? "Your parents can see how well you're doing" : "Progress tracking and family communication"
        ]
      },

      rights_section: {
        title: readingLevel === 'elementary' ? "What You Can Do" : "Your Rights",
        rights: [
          readingLevel === 'elementary' ? "You can ask questions about your information anytime" : "Ask questions about your data",
          readingLevel === 'elementary' ? "You can ask us to show you what we know about you" : "Request to see your information",
          readingLevel === 'elementary' ? "You can change your mind later if you want to" : "Change your mind about sharing data"
        ]
      },

      assent_question: readingLevel === 'elementary'
        ? "Is it okay with you if we keep track of your learning information to help you do your best in school?"
        : age < 14
        ? "Do you agree to let us collect information about your learning to help support your education?"
        : "Do you consent to the collection and use of your educational data as described above?"
    }
  }

  private static createSimplifiedNotice(scenario: ConsentScenario): string {
    const age = scenario.student_age
    
    if (age < 13) {
      return `We collect information about your child's learning to help teachers provide better education. We protect this information carefully and only share it with school staff who need it to help your child learn. You can review, correct, or delete this information at any time.`
    }
    
    return `We collect educational information to support student learning and comply with educational privacy laws. Data is shared only with authorized school personnel and approved educational partners. Parents and eligible students have rights to access, correct, and control their educational records.`
  }

  // Helper methods for form content generation
  private static getDataCollectionItems(scenario: ConsentScenario): string[] {
    const baseItems = [
      "Learning preferences and style assessments",
      "Academic performance and progress data",
      "Engagement metrics and participation records"
    ]

    if (scenario.data_sensitivity === 'high' || scenario.data_sensitivity === 'restricted') {
      baseItems.push(
        "Detailed behavioral observations",
        "Specialized learning support records"
      )
    }

    if (scenario.research_component) {
      baseItems.push("Anonymous research participation data")
    }

    return baseItems
  }

  private static getUsagePurposes(scenario: ConsentScenario): string[] {
    return [
      "Personalize educational content and recommendations",
      "Support teacher instruction and classroom management",
      "Track academic progress and identify learning needs",
      "Communicate with parents about student development",
      ...(scenario.research_component ? ["Contribute to educational research (anonymized)"] : [])
    ]
  }

  private static getSharingRecipients(scenario: ConsentScenario): string[] {
    const recipients = [
      "Classroom teachers and educational staff",
      "School administrators and counselors",
      "Authorized district personnel"
    ]

    if (scenario.third_party_involved) {
      recipients.push("Approved educational technology partners")
    }

    if (scenario.research_component) {
      recipients.push("Educational researchers (anonymized data only)")
    }

    return recipients
  }

  private static getParentalRights(
    scenario: ConsentScenario,
    requirements: ConsentRequirement
  ): string[] {
    const rights = [
      "Review all information collected about your child",
      "Request corrections to inaccurate information",
      "Request deletion of your child's information",
      "Withdraw consent for future data collection"
    ]

    if (requirements.special_protections.includes('coppa_protection')) {
      rights.unshift("Receive detailed disclosure of data practices before any collection begins")
    }

    if (scenario.third_party_involved) {
      rights.push("Control sharing with third-party educational partners")
    }

    return rights
  }

  private static getConsentOptions(
    scenario: ConsentScenario,
    requirements: ConsentRequirement
  ): ConsentOption[] {
    const options: ConsentOption[] = [
      {
        id: 'full_consent',
        label: 'I consent to all data collection and use as described',
        description: 'Enable all educational features and personalization'
      }
    ]

    if (!requirements.requires_ongoing_consent) {
      options.push({
        id: 'limited_consent',
        label: 'I consent to basic educational data collection only',
        description: 'Enable core educational features with minimal data collection'
      })
    }

    options.push({
      id: 'no_consent',
      label: 'I do not consent to data collection',
      description: 'Student can still use basic educational services without personalization'
    })

    return options
  }

  private static getStudentFriendlyDataItems(readingLevel: string): string[] {
    if (readingLevel === 'elementary') {
      return [
        "How you like to learn (with pictures, by moving, by listening)",
        "What you're good at and what you're working on",
        "How you participate in class activities"
      ]
    }

    if (readingLevel === 'middle') {
      return [
        "Your learning style and preferences",
        "Academic performance and progress",
        "Classroom participation and engagement"
      ]
    }

    return [
      "Learning preferences and educational assessments",
      "Academic progress and achievement data",
      "Engagement patterns and participation metrics"
    ]
  }

  private static getChildFriendlyExplanation(): string {
    return "In simple terms: We want to learn about how your child learns best so we can help them succeed in school. We'll keep this information safe and only share it with people who help with your child's education."
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface ConsentFormContent {
  title: string
  introduction: string
  data_collection_section: {
    title: string
    items: string[]
    child_friendly_explanation?: string
    reassurance?: string
  }
  usage_section?: {
    title: string
    purposes: string[]
    educational_benefit: string
  }
  benefits_section?: {
    title: string
    benefits: string[]
  }
  sharing_section?: {
    title: string
    recipients: string[]
    no_marketing_disclosure?: string
  }
  rights_section: {
    title: string
    rights: string[]
    withdrawal_process?: string
  }
  security_section?: {
    title: string
    measures: string[]
  }
  consent_options?: ConsentOption[]
  assent_question?: string
  legal_basis?: string
}

interface ConsentOption {
  id: string
  label: string
  description: string
}

// ============================================================================
// CONSENT VALIDATION & TRACKING
// ============================================================================

export class ConsentValidator {
  
  /**
   * Validates that all required consents are in place for a data operation
   */
  static async validateDataAccess(
    student_id: string,
    data_categories: string[],
    operation_type: 'read' | 'write' | 'share' | 'delete',
    context: any
  ): Promise<{
    valid: boolean
    missing_consents: string[]
    expired_consents: string[]
    recommendations: string[]
  }> {
    const validation = {
      valid: false,
      missing_consents: [] as string[],
      expired_consents: [] as string[],
      recommendations: [] as string[]
    }

    // Implementation would check database for current consent status
    // This is a simplified example

    const currentConsents = await this.getCurrentConsents(student_id)
    const requiredConsents = await this.getRequiredConsents(student_id, data_categories, operation_type)

    for (const required of requiredConsents) {
      const current = currentConsents.find(c => c.type === required.type)
      
      if (!current) {
        validation.missing_consents.push(required.type)
      } else if (this.isConsentExpired(current, required)) {
        validation.expired_consents.push(required.type)
      }
    }

    validation.valid = validation.missing_consents.length === 0 && validation.expired_consents.length === 0

    if (!validation.valid) {
      validation.recommendations = this.generateRecommendations(validation)
    }

    return validation
  }

  private static async getCurrentConsents(student_id: string) {
    // Implementation would query database
    return []
  }

  private static async getRequiredConsents(
    student_id: string,
    data_categories: string[],
    operation_type: string
  ) {
    // Implementation would determine required consents based on context
    return []
  }

  private static isConsentExpired(current: any, required: any): boolean {
    if (!required.expiration_days) return false
    
    const expirationDate = new Date(current.granted_at)
    expirationDate.setDate(expirationDate.getDate() + required.expiration_days)
    
    return new Date() > expirationDate
  }

  private static generateRecommendations(validation: any): string[] {
    const recommendations = []

    if (validation.missing_consents.length > 0) {
      recommendations.push("Obtain required parental consent before proceeding")
    }

    if (validation.expired_consents.length > 0) {
      recommendations.push("Renew expired consents with parents")
    }

    return recommendations
  }
}

export default {
  ConsentWorkflowEngine,
  ConsentValidator
}