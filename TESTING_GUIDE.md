# Comprehensive Test Environment Guide

This guide explains how to use the comprehensive test scenario system for the education app. The system creates realistic test environments with multiple teachers, students, parents, and complete data flows.

## Overview

The test system provides:
- **9 realistic teacher scenarios** across different experience levels
- **Complete classroom setups** with appropriate student counts
- **Realistic student profiles** with diverse backgrounds
- **Parent invitation flow testing** with various response patterns
- **Complete assessment data** with realistic results
- **Navigation flow validation** to ensure all features work
- **Data cleanup utilities** for resetting test environments

## Quick Start

### 1. Access the Test Dashboard
Navigate to `/test-scenarios` in your browser to access the comprehensive test management dashboard.

### 2. Create Complete Test Environment
Click "Create Complete Test Environment" to set up:
- 9 teachers with different scenarios
- Multiple classrooms per teacher
- Students with realistic profiles
- Completed and pending assessments
- Parent accounts and invitation flows

### 3. Test Individual Components
Use the dashboard tabs to test specific areas:
- **Teachers**: View and test individual teacher accounts
- **Parent Flow**: Simulate parent invitation and completion patterns
- **Navigation**: Verify all app features work correctly

## Teacher Test Scenarios

### New Teachers (2 teachers)
- **Sarah Martinez** - First-year teacher needing full onboarding
- **James Thompson** - Second-year teacher with basic setup needs

**Characteristics:**
- Minimal demo data
- Password setup required
- Need comprehensive onboarding
- Small class sizes (15-18 students)

### Experienced Teachers (2 teachers)
- **Lisa Chen** - 12-year veteran with established systems
- **Michael Rodriguez** - 8-year department head with rich historical data

**Characteristics:**
- Full demo data with historical assessments
- Multiple classrooms and advanced features
- High parent engagement rates
- Established classroom management systems

### Mixed Data Teachers (2 teachers)
- **Jennifer White** - Transitioning teacher with partial digital adoption
- **David Johnson** - Veteran moving from paper to digital assessments

**Characteristics:**
- Partial completion rates
- Mix of completed and pending assessments
- Some parent resistance to digital tools
- Gradual technology adoption patterns

### Specialist Teachers (2 teachers)
- **Maria Garcia** - ESL specialist working across grades K-5
- **Robert Davis** - Special education teacher with IEP focus

**Characteristics:**
- Cross-grade student populations
- Specialized assessment needs
- Unique classroom configurations
- Focus on accommodation strategies

### Substitute Teachers (1 teacher)
- **Amanda Wilson** - Long-term substitute needing quick access

**Characteristics:**
- Limited setup time
- Need for immediate student insights
- Temporary access patterns
- Quick reference needs

## Parent Test Scenarios

### Compliant Parent (Sarah Johnson)
- Responds immediately to invitations
- Completes assessments fully
- Highly engaged with school communication

### Busy Parent (Michael Rodriguez)
- Needs multiple reminders
- Starts and stops assessments
- Prefers mobile-friendly options
- Works irregular hours

### Non-English Speaking (Maria Garcia)
- Spanish-speaking family
- Needs translated materials
- Prefers phone communication
- Cultural sensitivity concerns

### Tech-Challenged (Dorothy Wilson)
- Older caregiver with limited tech skills
- Needs phone support
- Simple interface requirements
- Struggles with digital navigation

### Skeptical Parent (Jennifer Chen)
- Privacy and data concerns
- Questions assessment validity
- Needs reassurance about data use
- May refuse participation

## Using the API

### Create Test Scenarios
```javascript
// Create complete environment
POST /api/test-scenarios
{
  "action": "create_comprehensive"
}

// Create specific teacher type
POST /api/test-scenarios
{
  "action": "create_specific",
  "scenario": "new" // or "experienced", "mixed_data", etc.
}
```

### Test Navigation Flow
```javascript
POST /api/test-scenarios
{
  "action": "test_navigation",
  "teacherEmail": "sarah.martinez@riverside.edu"
}
```

### Test Parent Flow
```javascript
// Simulate parent invitation responses
POST /api/test-scenarios
{
  "action": "test_parent_flow"
}

// Create parent accounts for testing
POST /api/test-scenarios
{
  "action": "create_parent_accounts"
}
```

### Clean Up Test Data
```javascript
POST /api/test-scenarios
{
  "action": "cleanup"
}
```

## Testing Workflows

### 1. Complete System Test
1. Run `create_comprehensive` to set up full environment
2. Test navigation for each teacher type
3. Run parent flow simulation
4. Verify all features work with realistic data
5. Clean up when done

### 2. New Teacher Onboarding Test
1. Create only `new` teacher scenarios
2. Test onboarding flow completion
3. Verify password setup and initial classroom creation
4. Check Day 1 Kit functionality

### 3. Parent Engagement Analysis
1. Run `test_parent_flow` to simulate responses
2. Analyze completion rates by parent type
3. Identify common barriers
4. Test multilingual support

### 4. Feature-Specific Testing
1. Create relevant teacher scenarios for your feature
2. Test with both completed and pending assessments
3. Verify edge cases (no data, partial data, etc.)
4. Test across different user types

## Data Structure

### Teachers
Each test teacher includes:
- Realistic name and email
- School and grade level assignment
- Experience level and specializations
- Scenario-appropriate demo data levels
- Authentic classroom configurations

### Students
Students have:
- Diverse, realistic names and demographics
- Appropriate parent contact information
- Grade-level appropriate profiles
- Varied learning styles and needs
- Cultural and linguistic diversity

### Assessments
Assessment data includes:
- Realistic response patterns
- Age-appropriate scoring
- Varied completion states
- Cultural sensitivity considerations
- Learning style indicators

### Parent Responses
Parent simulations model:
- Realistic response timing
- Technology comfort levels
- Language preferences
- Privacy concerns
- Completion barriers

## Best Practices

### For Development Testing
1. Use `new` teacher scenarios for onboarding features
2. Use `experienced` teachers for advanced functionality
3. Test with `mixed_data` scenarios for real-world conditions
4. Always clean up test data when done

### For Demo Preparation
1. Create `experienced` teachers with full data
2. Ensure all assessments are completed
3. Use diverse student populations
4. Set up realistic parent scenarios

### For Performance Testing
1. Create multiple teacher scenarios simultaneously
2. Test with large student populations (specialist teachers)
3. Simulate concurrent parent responses
4. Monitor database performance with realistic data volumes

### For User Training
1. Start with `new` teacher scenarios
2. Walk through complete workflows
3. Show both success and challenge scenarios
4. Demonstrate parent communication features

## Troubleshooting

### Common Issues

**"Supabase not configured"**
- Check environment variables
- Verify database connection
- Ensure proper table structure

**"Teacher already exists"**
- System will use existing teacher
- Clean up before creating fresh data
- Check for email conflicts

**"Navigation test fails"**
- Verify all required data exists
- Check for broken links or API calls
- Ensure proper authentication

**"Parent flow simulation errors"**
- Check scenario configurations
- Verify all required fields
- Review parent account creation

### Data Cleanup
Always run the cleanup function after testing:
- Removes all test teachers and their data
- Cleans up classrooms and assignments
- Preserves real user data
- Resets system to clean state

## Advanced Usage

### Custom Scenarios
You can extend the system by:
1. Adding new teacher scenarios to `TEST_TEACHERS`
2. Creating custom student pools for specific grades
3. Adding new parent response patterns
4. Customizing assessment result generators

### Integration Testing
Use the test system for:
1. End-to-end workflow validation
2. Performance benchmarking
3. User acceptance testing
4. Training environment setup

### Monitoring and Analytics
The system provides:
1. Completion rate analysis
2. Common barrier identification
3. Response pattern insights
4. Performance metrics

## Support

For questions or issues:
1. Check the API documentation at `/api/test-scenarios`
2. Review error logs in the browser console
3. Use the health check function to diagnose issues
4. Reset with cleanup if data becomes corrupted

The test system is designed to provide realistic, comprehensive testing environments that closely mirror real-world usage patterns while being easy to set up, use, and clean up.