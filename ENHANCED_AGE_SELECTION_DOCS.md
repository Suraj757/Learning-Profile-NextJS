# Enhanced Age Selection System Documentation

## Overview

The Enhanced Age Selection System enables precise age input and extends quiz support to children 6+ years while maintaining CLP 2.0 compliance. This system replaces broad age groups with exact age input (month/year precision) and uses sophisticated routing algorithms to deliver age-appropriate questions.

## Key Features

### 1. Precise Age Selection
- **Input Methods**: Age in years/months OR birth date
- **Precision**: Month-level accuracy for optimal question targeting
- **Validation**: Built-in age validation with helpful warnings
- **Flexibility**: Toggle between precise and legacy age group selection

### 2. Age-to-Question Routing Algorithm
- **Smart Routing**: Automatically selects appropriate question set based on exact age
- **Question Types**:
  - **Pure**: Standard questions for core age ranges
  - **Hybrid**: Bridge questions for transitional ages (4-year-olds)
  - **Extended**: Enhanced questions for 6+ year olds

### 3. Extended Age Support
- **Age Range**: Now supports 3.0 - 8+ years (previously 3-5+)
- **Question Adaptation**: Automatically adapts question complexity
- **CLP 2.0 Compliance**: Maintains 24 questions + 4 preferences structure

## Age Routing Strategy

### Age Boundaries
```
3.0-3.4 years  → '3-4' group, Pure questions (26 total)
3.5-4.4 years  → '4-5' group, Hybrid questions (26 total) 
4.5-5.4 years  → '4-5' group, Pure questions (26 total)
5.5-5.9 years  → '5+' group, Pure questions (28 total)
6.0+ years     → '5+' group, Extended questions (28 total)
```

### Question Set Details

#### 3-Year-Old Questions (Pure)
- **Complexity**: Simple home-based scenarios
- **Examples**: "While you're making dinner...", "When they notice another child..."
- **Focus**: Basic social interaction, simple communication
- **Format**: Multiple choice with 4 clear options

#### 4-Year-Old Bridge Questions (Hybrid)
- **Strategy**: Enhanced 3-year questions with increased complexity
- **Examples**: Enhanced scenarios with more context
- **Focus**: Transitional skills, emerging independence
- **Format**: Multiple choice, slightly more nuanced

#### 5-Year-Old Questions (Pure)
- **Complexity**: School readiness scenarios
- **Examples**: "During a play-date...", "You ask, 'What happened at school today?'"
- **Focus**: Kindergarten skills, social problem-solving
- **Format**: Multiple choice with sophisticated options

#### 6+ Year Extended Questions (Extended)
- **Complexity**: School-focused, academic contexts
- **Examples**: "During class presentations...", "When doing homework..."
- **Focus**: Academic skills, peer relationships, independent learning
- **Format**: Likert scale (5-point) for nuanced responses

## Implementation Files

### Core Components

#### 1. `PreciseAgeSelector.tsx`
Interactive age selection component with:
- Years/months dropdowns
- Birth date input option
- Real-time age group preview
- Validation and warnings
- Developmental information

#### 2. `age-routing.ts`
Core routing algorithm containing:
- `getQuestionsForPreciseAge()` - Main routing function
- `createBridgeQuestions()` - 4-year-old question generation
- `createExtendedQuestions()` - 6+ year adaptations
- Age validation and recommendations

#### 3. `extended-questions.ts`
Question sets for older children:
- `EXTENDED_QUESTIONS_6_PLUS` - 6-7 year questions
- `EXTENDED_QUESTIONS_7_PLUS` - 7-8+ year questions
- School-age interest options
- Academic engagement styles

#### 4. `user-journey-examples.ts`
Comprehensive examples showing:
- Different age scenarios
- Parent experience descriptions
- Teacher integration possibilities
- Edge case handling

### Database Updates

#### New Fields Added
```sql
-- Profiles table
precise_age_years INTEGER
precise_age_months INTEGER
birth_date DATE
age_input_method VARCHAR(20)
question_set_type VARCHAR(20)
total_age_months INTEGER (computed)
```

#### Key Functions
- `get_age_group_from_precise_age()` - Auto-determine age group
- `get_question_set_type()` - Determine question set type
- Triggers for automatic age group population

### API Enhancements

#### Updated Profile Creation
```typescript
// New fields in POST /api/profiles
{
  child_name: string,
  grade: string,
  age_group: AgeGroup,
  responses: Record<number, number>,
  // NEW FIELDS
  precise_age_years?: number,
  precise_age_months?: number,
  birth_date?: string,
  age_input_method?: 'age_group' | 'precise_age' | 'birth_date',
  question_set_type?: 'pure' | 'hybrid' | 'extended'
}
```

## User Experience Flows

### Flow 1: Parent with 3.2-year-old Emma
1. **Age Selection**: Selects "3 years, 2 months"
2. **System Response**: Routes to '3-4' group, pure questions
3. **Questions**: 26 simple, home-based scenarios
4. **Result**: Profile focuses on basic social and communication skills

### Flow 2: Parent with 4.8-year-old Jayden  
1. **Age Selection**: Uses birth date input for precision
2. **System Response**: Routes to '4-5' group, pure questions (close to 5)
3. **Questions**: 26 kindergarten-readiness scenarios
4. **Result**: Profile shows school readiness and social development

### Flow 3: Parent with 6.5-year-old Alex
1. **Age Selection**: Selects "6 years, 5 months"  
2. **System Response**: Routes to '5+' group, extended questions
3. **Questions**: 28 school-focused, academic scenarios
4. **Result**: Profile captures academic confidence and learning preferences

### Flow 4: Teacher-Referred Assessment
1. **Context**: Teacher sends assessment link with token
2. **Age Input**: Parent uses exact birth date for precision
3. **Shared Results**: Teacher receives profile with classroom applications
4. **Integration**: Results inform instruction and grouping strategies

## Technical Specifications

### Age Validation Rules
```typescript
interface AgeValidation {
  isValid: boolean
  warnings: string[]  // Age < 3 or > 8
  errors: string[]    // Invalid month/year values
}
```

### Question Set Selection Logic
```typescript
function getQuestionSetType(totalMonths: number): QuestionSetType {
  if (totalMonths < 42) return 'pure'     // 3-year questions
  if (totalMonths < 54) return 'hybrid'   // 4-year bridge  
  if (totalMonths < 72) return 'pure'     // 5-year questions
  return 'extended'                       // 6+ year questions
}
```

### CLP 2.0 Compliance Verification
- **3-4 age group**: 21 core questions + 5 preference questions = 26 total ✅
- **4-5 age group**: 21 core questions + 5 preference questions = 26 total ✅  
- **5+ age group**: 24 core questions + 4 preference questions = 28 total ✅

## Migration Strategy

### Phase 1: Deploy Enhanced System
- Add new components and routing logic
- Update database schema with new fields
- Maintain backward compatibility with existing age groups

### Phase 2: Gradual Adoption
- Show toggle between precise and legacy age selection
- Collect usage analytics on preferred input methods
- Monitor question routing accuracy

### Phase 3: Full Migration
- Default to precise age selection
- Keep legacy option for edge cases
- Update all flows to use precise age data

## Testing Strategy

### Unit Tests
- Age routing algorithm accuracy
- Question set selection logic
- Validation rule enforcement
- Edge case handling

### Integration Tests  
- Complete user flows for each age range
- Database operations with new fields
- API endpoint functionality
- Teacher referral flows

### User Testing
- Parent experience with new age selector
- Question relevance across age ranges
- Profile accuracy for different ages
- Teacher usability for shared results

## Performance Considerations

### Database Optimization
- Indexed precise age fields for fast queries
- Computed columns for total months
- Efficient age range filtering
- Minimal migration impact

### Frontend Performance
- Lazy loading of age-specific components
- Optimized question routing calculations
- Cached validation results
- Responsive UI interactions

## Monitoring and Analytics

### Key Metrics
- Age input method preferences (precise vs legacy)
- Question set distribution across ages
- Profile completion rates by age
- Teacher engagement with precise age data

### Success Indicators
- Improved question relevance scores
- Higher profile accuracy ratings
- Increased teacher adoption
- Better parent satisfaction

## Future Enhancements

### Potential Additions
- Developmental milestone tracking
- Growth progression analysis
- Multi-language age descriptions
- Advanced special needs support
- Sibling comparison features

### Scalability Considerations
- Support for additional age ranges
- Flexible question adaptation algorithms
- Custom question sets for special populations
- Integration with educational platforms

---

This enhanced age selection system provides the foundation for more accurate, relevant assessments while maintaining the proven CLP 2.0 framework. The precise age input enables better question targeting, leading to more actionable insights for parents and teachers.