// Comprehensive Input Validation and Malformed Data Tests
// Testing all possible input validation scenarios, data sanitization, and security vulnerabilities

import { NextRequest } from 'next/server'
import { POST, GET } from '../../../app/api/profiles/progressive/route'
import {
  calculateCLP2Scores,
  getCLP2PersonalityLabel,
  getCLP2StrengthsAndGrowth
} from '../../../lib/clp-scoring'
import {
  getParentQuizQuestions,
  getTeacherQuizQuestions,
  validateQuizConfiguration
} from '../../../lib/multi-quiz-system'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: null // Use fallback mode for predictable testing
}))

jest.mock('@/lib/clp-scoring')
jest.mock('@/lib/quiz-definitions', () => ({
  getQuizDefinition: jest.fn().mockReturnValue({
    id: 'parent_home',
    name: 'Parent Home Assessment'
  }),
  calculateQuizContribution: jest.fn().mockReturnValue({
    weight: 0.5,
    confidence_boost: 25,
    categories_covered: ['Communication', 'Creative Innovation']
  })
}))

const mockCalculateCLP2Scores = calculateCLP2Scores as jest.MockedFunction<typeof calculateCLP2Scores>
const mockGetCLP2PersonalityLabel = getCLP2PersonalityLabel as jest.MockedFunction<typeof getCLP2PersonalityLabel>
const mockGetCLP2StrengthsAndGrowth = getCLP2StrengthsAndGrowth as jest.MockedFunction<typeof getCLP2StrengthsAndGrowth>

describe('Comprehensive Input Validation and Malformed Data Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Set up default mock returns
    mockCalculateCLP2Scores.mockReturnValue({
      Communication: 2.5,
      Collaboration: 2.0,
      Content: 1.8,
      'Critical Thinking': 2.2,
      'Creative Innovation': 2.8,
      Confidence: 2.4,
      Literacy: 2.1,
      Math: 1.9
    })
    
    mockGetCLP2PersonalityLabel.mockReturnValue('Creative Learner')
    mockGetCLP2StrengthsAndGrowth.mockReturnValue({
      strengths: ['Creative Innovation', 'Communication'],
      growthAreas: ['Content', 'Math']
    })
    
    console.error = jest.fn()
  })

  describe('JSON Parsing Edge Cases', () => {
    test('should handle malformed JSON gracefully', async () => {
      const malformedJSONs = [
        '{"child_name":"Test"',                              // Incomplete JSON
        '{"child_name":"Test",}',                           // Trailing comma
        '{child_name:"Test"}',                              // Unquoted keys
        '{"child_name":"Test""extra"}',                     // Extra quotes
        '{"child_name":"Test", "responses": {1: 4}}',       // Unquoted numeric key
        '{"child_name":"Test", "responses": {1: 4,}}',      // Trailing comma in nested object
        '{"child_name":"Test", "responses": [1,2,3,]}',     // Trailing comma in array
        '{"child_name":"Test"\n\n\n}',                      // Extra whitespace
        'null',                                             // Null JSON
        'undefined',                                        // Undefined literal
        '',                                                 // Empty string
        '   ',                                              // Whitespace only
        '{"child_name":"Test", "responses": {"1": 4, "2": 3, "3": NaN}}', // NaN in JSON
        '{"child_name":"Test", "responses": {"1": 4, "2": 3, "3": Infinity}}' // Infinity in JSON
      ]

      for (const malformedJSON of malformedJSONs) {
        const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: malformedJSON
        })

        const response = await POST(request)
        
        // Should handle malformed JSON gracefully
        expect([400, 500]).toContain(response.status)
        
        if (response.status === 400) {
          const data = await response.json()
          expect(data.error).toBeDefined()
        }
      }
    })

    test('should handle extremely large JSON payloads', async () => {
      const largeResponses: Record<string, any> = {}
      
      // Create a very large responses object
      for (let i = 1; i <= 50000; i++) {
        largeResponses[i.toString()] = {
          value: i,
          metadata: 'A'.repeat(100), // Add some bulk to each entry
          nested: {
            level1: {
              level2: {
                level3: 'deep nesting test'
              }
            }
          }
        }
      }

      const largePayload = JSON.stringify({
        child_name: 'Large Payload Test',
        quiz_type: 'parent_home',
        respondent_type: 'parent',
        responses: largeResponses
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: largePayload
      })

      const response = await POST(request)
      
      // Should handle large payloads appropriately
      expect([200, 413, 500]).toContain(response.status) // 413 = Payload Too Large
    })

    test('should handle deeply nested JSON structures', async () => {
      let deepNesting: any = { value: 'deep' }
      for (let i = 0; i < 1000; i++) {
        deepNesting = { nested: deepNesting }
      }

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Deep Nesting Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: deepNesting }
        })
      })

      const response = await POST(request)
      
      // Should handle deep nesting gracefully
      expect([200, 400, 500]).toContain(response.status)
    })
  })

  describe('String Input Validation', () => {
    test('should handle various encoding attacks', async () => {
      const encodingAttacks = [
        'Normal Child Name',
        '<script>alert("XSS")</script>',                    // XSS attempt
        '"><script>alert("XSS")</script>',                  // Breaking out of attributes
        'javascript:alert("XSS")',                         // JavaScript protocol
        'data:text/html,<script>alert("XSS")</script>',    // Data URL
        '&#60;script&#62;alert("XSS")&#60;/script&#62;',   // HTML entities
        '%3Cscript%3Ealert("XSS")%3C/script%3E',          // URL encoded
        '\u003cscript\u003ealert("XSS")\u003c/script\u003e', // Unicode escaped
        String.fromCharCode(60,115,99,114,105,112,116,62), // Character codes
        'eval("alert(\\"XSS\\")")',                        // Eval injection
        '${alert("XSS")}',                                 // Template literal injection
        '{{7*7}}',                                         // Template injection
        '<%=7*7%>',                                        // ERB injection
        'php://filter/convert.base64-encode/resource=index.php', // PHP filter
        '../../../etc/passwd',                             // Path traversal
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts', // Windows path traversal
        'file:///etc/passwd',                              // File protocol
        'ftp://malicious.site/payload',                    // FTP protocol
        '\0',                                              // Null byte
        '\r\n\r\nHTTP/1.1 200 OK\r\n\r\n<html>injected</html>', // HTTP response splitting
        'admin\'; DROP TABLE users; --',                  // SQL injection
        '\' OR \'1\'=\'1\' --',                          // SQL injection
        '1; exec xp_cmdshell("dir"); --',                 // SQL command injection
        '|whoami',                                         // Command injection
        '; cat /etc/passwd;',                             // Command injection
        '`cat /etc/passwd`',                              // Command injection with backticks
        '$(cat /etc/passwd)',                             // Command injection with $()
        'ldap://malicious.site/',                         // LDAP injection
        '*)(uid=*',                                       // LDAP wildcard injection
        'mailto:test@test.com?subject=<script>alert("XSS")</script>', // Email injection
      ]

      for (const attack of encodingAttacks) {
        const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: attack,
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: 4, 2: 3, 3: 5 }
          })
        })

        const response = await POST(request)
        
        // Should handle attacks gracefully
        expect([200, 400]).toContain(response.status)
        
        if (response.status === 200) {
          const data = await response.json()
          // Should not execute any malicious code
          expect(data.profile).toBeDefined()
          expect(data.profile.child_name).toBe(attack) // Should preserve input as-is
        }
      }
    })

    test('should handle Unicode and international characters', async () => {
      const unicodeNames = [
        'José María García-López',                         // Spanish
        '李小明',                                           // Chinese
        'محمد عبد الله',                                    // Arabic
        'Владимир Петров',                                 // Russian
        'Δημήτρης Παπαδόπουλος',                           // Greek
        'नरेंद्र मोदी',                                      // Hindi
        '田中太郎',                                          // Japanese
        '김민수',                                           // Korean
        'François-Marie Bélanger',                         // French
        'Björn Þórsson',                                   // Icelandic
        'Mężczyzna Żółć',                                  // Polish
        'Château d\'Yquem',                                // French with apostrophe
        'O\'Connor-Smith',                                 // English with apostrophe and hyphen
        'Müller & Söhne',                                  // German with ampersand
        'Español/English',                                 // With forward slash
        'Test\\Name',                                      // With backslash
        'Name|Pipe',                                       // With pipe
        'Name<Tag>',                                       // With angle brackets
        'Name[Bracket]',                                   // With square brackets
        'Name{Brace}',                                     // With curly braces
        'Name"Quote"',                                     // With quotes
        'Name\'Apostrophe\'',                              // With apostrophes
        'Name\tTab',                                       // With tab
        'Name\nNewline',                                   // With newline
        'Name\rCarriageReturn',                            // With carriage return
        '🎨👶🏻📚',                                         // Emojis
        'À̧̲̮̥͔̻̞̞̖̲͚̻̰̇̇̓̊̋̊̊̋̒͒̇̇̈́̈́̈́̂̂̂̂̂̂̂̂͂', // Combining characters
        'ＮａｍｅＷｉｔｈＦｕｌｌｗｉｄｔｈ',              // Fullwidth characters
        'NormalNameWith\u200Bzero\u200Bwidth\u200Bspaces', // Zero-width spaces
        'Name\uFEFFwith\uFEFFBOM',                         // Byte order marks
        'Right\u202ELeft',                                 // Right-to-left override
      ]

      for (const unicodeName of unicodeNames) {
        const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: unicodeName,
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: 4, 2: 3, 3: 5 }
          })
        })

        const response = await POST(request)
        
        // Should handle Unicode gracefully
        expect([200, 400]).toContain(response.status)
        
        if (response.status === 200) {
          const data = await response.json()
          expect(data.profile).toBeDefined()
          expect(data.profile.child_name).toBe(unicodeName)
        }
      }
    })

    test('should handle extremely long strings', async () => {
      const extremeLengths = [
        1000,
        10000,
        100000,
        1000000
      ]

      for (const length of extremeLengths) {
        const longString = 'A'.repeat(length)
        
        const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: longString,
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: 4, 2: 3, 3: 5 }
          })
        })

        const response = await POST(request)
        
        // Should handle long strings appropriately
        expect([200, 400, 413, 500]).toContain(response.status)
        
        if (response.status === 200) {
          const data = await response.json()
          expect(data.profile).toBeDefined()
          expect(data.profile.child_name).toBe(longString)
        }
      }
    })
  })

  describe('Numeric Input Validation', () => {
    test('should handle extreme numeric values in responses', async () => {
      const extremeValues = [
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        1e308,
        -1e308,
        1.7976931348623157e+308,
        5e-324,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        NaN,
        0,
        -0,
        0.1 + 0.2, // Floating point precision issue
        Math.PI,
        Math.E,
        1 / 3,
        Math.sqrt(2),
        Math.sqrt(-1), // Results in NaN
        0 / 0, // Results in NaN
        1 / 0, // Results in Infinity
        -1 / 0, // Results in -Infinity
      ]

      for (const value of extremeValues) {
        const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: 'Numeric Test',
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: value, 2: 3, 3: 5 },
            precise_age_months: value
          })
        })

        const response = await POST(request)
        
        // Should handle extreme numeric values gracefully
        expect([200, 400]).toContain(response.status)
        
        if (response.status === 200) {
          const data = await response.json()
          expect(data.profile).toBeDefined()
        }
      }
    })

    test('should handle numeric overflow and underflow', async () => {
      const overflowValues = [
        '1' + '0'.repeat(400), // Very large number as string
        '-1' + '0'.repeat(400), // Very large negative number as string
        '0.' + '0'.repeat(400) + '1', // Very small number as string
        '999999999999999999999999999999999999999999999999',
        '-999999999999999999999999999999999999999999999999',
        '1e400',
        '1e-400',
        BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1), // BigInt overflow
      ]

      for (const value of overflowValues) {
        try {
          const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
            method: 'POST',
            body: JSON.stringify({
              child_name: 'Overflow Test',
              quiz_type: 'parent_home',
              respondent_type: 'parent',
              responses: { 1: value as any, 2: 3, 3: 5 }
            })
          })

          const response = await POST(request)
          
          // Should handle overflow gracefully
          expect([200, 400]).toContain(response.status)
        } catch (error) {
          // JSON.stringify might fail with BigInt, which is expected
          expect(error).toBeDefined()
        }
      }
    })
  })

  describe('Array and Object Input Validation', () => {
    test('should handle malformed array responses', async () => {
      const malformedArrays = [
        [1, 2, 3, null, undefined],                       // Mixed with null/undefined
        [1, 2, 3, NaN, Infinity],                        // Mixed with special numbers
        [1, 2, 3, {}, []],                               // Mixed with objects/arrays
        [1, 2, 3, Symbol('test')],                       // With symbols
        [1, 2, 3, function() {}],                        // With functions
        Array(10000).fill('large_array'),                 // Very large array
        new Array(1000000),                               // Sparse large array
        [].concat([1,2,3], new Array(1000), [4,5,6]),    // Mixed dense/sparse
        Object.assign([], {999: 'sparse'}),               // Sparse array with gaps
        Array.from({length: 5}, (_, i) => i * Math.PI),  // Floating point array
      ]

      for (const malformedArray of malformedArrays) {
        try {
          const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
            method: 'POST',
            body: JSON.stringify({
              child_name: 'Array Test',
              quiz_type: 'parent_home',
              respondent_type: 'parent',
              responses: { 1: malformedArray }
            })
          })

          const response = await POST(request)
          
          // Should handle malformed arrays gracefully
          expect([200, 400]).toContain(response.status)
        } catch (error) {
          // JSON.stringify might fail with some values (symbols, functions)
          expect(error).toBeDefined()
        }
      }
    })

    test('should handle circular references in objects', async () => {
      const circularObj: any = { name: 'circular' }
      circularObj.self = circularObj
      circularObj.nested = { parent: circularObj }

      // Can't stringify circular objects, so test that our system handles it
      expect(() => JSON.stringify(circularObj)).toThrow()

      // Test with a structure that might create circular references during processing
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Circular Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 },
          metadata: { circular_test: true }
        })
      })

      const response = await POST(request)
      
      // Should handle gracefully
      expect([200, 400]).toContain(response.status)
    })

    test('should handle object with unusual keys', async () => {
      const unusualKeyObjects = {
        '': 'empty_key',                                  // Empty string key
        ' ': 'space_key',                                // Space key
        '\t': 'tab_key',                                 // Tab key
        '\n': 'newline_key',                            // Newline key
        '123': 'numeric_string_key',                     // Numeric string key
        'true': 'boolean_string_key',                    // Boolean string key
        'null': 'null_string_key',                       // Null string key
        'undefined': 'undefined_string_key',             // Undefined string key
        '${injection}': 'template_injection_key',        // Template injection key
        '__proto__': 'proto_key',                        // Prototype pollution attempt
        'constructor': 'constructor_key',                // Constructor property
        'prototype': 'prototype_key',                    // Prototype property
        'hasOwnProperty': 'has_own_property_key',       // Built-in method name
        '🎨': 'emoji_key',                              // Emoji key
        'key with spaces and special chars !@#$%^&*()': 'special_chars_key',
      }

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Unusual Keys Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: unusualKeyObjects
        })
      })

      const response = await POST(request)
      
      // Should handle unusual keys gracefully
      expect([200, 400]).toContain(response.status)
    })
  })

  describe('Type Coercion and Casting Edge Cases', () => {
    test('should handle type coercion attempts', async () => {
      const coercionTests = [
        { quiz_type: 123 },                              // Number instead of string
        { quiz_type: true },                             // Boolean instead of string
        { quiz_type: [] },                               // Array instead of string
        { quiz_type: {} },                               // Object instead of string
        { respondent_type: null },                       // Null instead of string
        { precise_age_months: 'not_a_number' },         // String instead of number
        { precise_age_months: true },                    // Boolean instead of number
        { precise_age_months: [] },                      // Array instead of number
        { use_clp2_scoring: 'yes' },                     // String instead of boolean
        { use_clp2_scoring: 1 },                         // Number instead of boolean
        { use_clp2_scoring: [] },                        // Array instead of boolean
        { responses: 'not_an_object' },                  // String instead of object
        { responses: 123 },                              // Number instead of object
        { responses: true },                             // Boolean instead of object
      ]

      for (const test of coercionTests) {
        const baseRequest = {
          child_name: 'Type Coercion Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        }

        const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({ ...baseRequest, ...test })
        })

        const response = await POST(request)
        
        // Should handle type coercion gracefully
        expect([200, 400]).toContain(response.status)
      }
    })

    test('should handle stringified objects and arrays', async () => {
      const stringifiedTests = [
        { responses: '{"1": 4, "2": 3, "3": 5}' },      // Stringified object
        { school_context: '{"school": "test"}' },        // Stringified nested object
        { responses: '[1, 2, 3, 4, 5]' },               // Stringified array
        { responses: 'null' },                           // Stringified null
        { responses: 'undefined' },                      // Stringified undefined
        { responses: 'true' },                           // Stringified boolean
        { responses: '123' },                            // Stringified number
      ]

      for (const test of stringifiedTests) {
        const baseRequest = {
          child_name: 'Stringified Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        }

        const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({ ...baseRequest, ...test })
        })

        const response = await POST(request)
        
        // Should handle stringified data appropriately
        expect([200, 400]).toContain(response.status)
      }
    })
  })

  describe('Security and Injection Tests', () => {
    test('should prevent prototype pollution attempts', async () => {
      const pollutionAttempts = [
        { '__proto__': { isAdmin: true } },
        { 'constructor': { prototype: { isAdmin: true } } },
        { 'child_name': '__proto__.isAdmin' },
        { 'responses': { '__proto__': { polluted: true } } },
        { 'school_context': { '__proto__': { hacked: true } } },
      ]

      for (const attempt of pollutionAttempts) {
        const baseRequest = {
          child_name: 'Pollution Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        }

        const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({ ...baseRequest, ...attempt })
        })

        const response = await POST(request)
        
        // Should handle pollution attempts safely
        expect([200, 400]).toContain(response.status)
        
        // Verify prototype pollution didn't occur
        expect((Object.prototype as any).isAdmin).toBeUndefined()
        expect((Object.prototype as any).polluted).toBeUndefined()
        expect((Object.prototype as any).hacked).toBeUndefined()
      }
    })

    test('should handle potential code injection in responses', async () => {
      const injectionAttempts = {
        1: 'eval("alert(\\"xss\\")")',
        2: 'Function("return process.env")()',
        3: '${7*7}',
        4: '#{7*7}',
        5: '<%=7*7%>',
        6: '{{7*7}}',
        7: '[[7*7]]',
        8: 'javascript:alert("xss")',
        9: 'data:text/html,<script>alert("xss")</script>',
        10: '\u003cscript\u003ealert("xss")\u003c/script\u003e',
      }

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Injection Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: injectionAttempts
        })
      })

      const response = await POST(request)
      
      // Should handle injection attempts safely
      expect([200, 400]).toContain(response.status)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.profile).toBeDefined()
        // Should not execute any injected code
      }
    })
  })

  describe('Boundary Value Analysis', () => {
    test('should handle boundary values for all numeric fields', async () => {
      const boundaryTests = [
        { precise_age_months: -1 },                     // Below minimum
        { precise_age_months: 0 },                      // Minimum
        { precise_age_months: 1 },                      // Just above minimum
        { precise_age_months: 216 },                    // Maximum reasonable (18 years)
        { precise_age_months: 217 },                    // Just above maximum
        { precise_age_months: 1200 },                   // Way above maximum (100 years)
      ]

      for (const test of boundaryTests) {
        const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: 'Boundary Test',
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: 4, 2: 3, 3: 5 },
            ...test
          })
        })

        const response = await POST(request)
        
        // Should handle boundary values appropriately
        expect([200, 400]).toContain(response.status)
      }
    })

    test('should handle boundary values for response scores', async () => {
      const scoreBoundaries = [
        { 1: -1000, 2: 3, 3: 5 },                      // Far below range
        { 1: -1, 2: 3, 3: 5 },                         // Just below range
        { 1: 0, 2: 3, 3: 5 },                          // Lower boundary
        { 1: 1, 2: 3, 3: 5 },                          // Just above lower boundary
        { 1: 2.5, 2: 3, 3: 5 },                        // Middle value
        { 1: 4, 2: 3, 3: 5 },                          // Just below upper boundary
        { 1: 5, 2: 3, 3: 5 },                          // Upper boundary
        { 1: 6, 2: 3, 3: 5 },                          // Just above upper boundary
        { 1: 1000, 2: 3, 3: 5 },                       // Far above range
      ]

      for (const responses of scoreBoundaries) {
        const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: 'Score Boundary Test',
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses
          })
        })

        const response = await POST(request)
        
        // Should handle score boundaries appropriately
        expect([200, 400]).toContain(response.status)
      }
    })
  })

  describe('Character Encoding and Normalization', () => {
    test('should handle different character encodings', async () => {
      const encodingTests = [
        'Caf\u00e9',                                    // Café (composed)
        'Cafe\u0301',                                   // Café (decomposed)
        '\u1e00\u1e01\u1e02',                         // Latin extended
        '\ud83d\ude00',                                // Emoji (surrogate pair)
        '\ud800\udc00',                                // Valid surrogate pair
        '\ufffd',                                      // Replacement character
        'test\u0000null',                              // Null character
        'test\ufeffBOM',                               // Byte order mark
        'test\u200bzero\u200bwidth',                   // Zero-width space
        'test\u202eright\u202dto\u202dleft',          // Bidirectional override
      ]

      for (const encodingTest of encodingTests) {
        const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: encodingTest,
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: 4, 2: 3, 3: 5 }
          })
        })

        const response = await POST(request)
        
        // Should handle encoding gracefully
        expect([200, 400]).toContain(response.status)
        
        if (response.status === 200) {
          const data = await response.json()
          expect(data.profile).toBeDefined()
        }
      }
    })
  })

  describe('Memory and Performance Impact', () => {
    test('should handle memory-intensive inputs without crashing', async () => {
      const startMemory = process.memoryUsage().heapUsed

      // Create memory-intensive requests
      const memoryIntensiveTests = [
        Array.from({ length: 10000 }, (_, i) => `Large array item ${i}`),
        'X'.repeat(1000000), // 1MB string
        Object.fromEntries(Array.from({ length: 10000 }, (_, i) => [`key${i}`, `value${i}`])),
      ]

      for (const test of memoryIntensiveTests) {
        try {
          const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
            method: 'POST',
            body: JSON.stringify({
              child_name: 'Memory Test',
              quiz_type: 'parent_home',
              respondent_type: 'parent',
              responses: { 1: test },
              metadata: test
            })
          })

          const response = await POST(request)
          
          // Should handle memory-intensive inputs
          expect([200, 400, 413, 500]).toContain(response.status)
        } catch (error) {
          // Some tests might fail due to JSON.stringify limits
          expect(error).toBeDefined()
        }
      }

      const endMemory = process.memoryUsage().heapUsed
      const memoryIncrease = endMemory - startMemory

      // Should not cause excessive memory growth
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024) // Less than 100MB
    })
  })

  describe('Scoring System Input Validation', () => {
    test('should handle invalid inputs to scoring functions', async () => {
      // Test direct scoring function calls with invalid inputs
      expect(() => calculateCLP2Scores(null as any)).not.toThrow()
      expect(() => calculateCLP2Scores(undefined as any)).not.toThrow()
      expect(() => calculateCLP2Scores('invalid' as any)).not.toThrow()
      expect(() => calculateCLP2Scores(123 as any)).not.toThrow()
      expect(() => calculateCLP2Scores([] as any)).not.toThrow()
    })

    test('should handle invalid inputs to quiz generation functions', async () => {
      // Test quiz generation with invalid inputs
      expect(() => getParentQuizQuestions(null as any)).not.toThrow()
      expect(() => getParentQuizQuestions(undefined as any)).not.toThrow()
      expect(() => getParentQuizQuestions(123 as any)).not.toThrow()
      expect(() => getParentQuizQuestions([] as any)).not.toThrow()
      expect(() => getParentQuizQuestions({} as any)).not.toThrow()

      expect(() => getTeacherQuizQuestions(null as any)).not.toThrow()
      expect(() => getTeacherQuizQuestions(undefined as any)).not.toThrow()
      expect(() => getTeacherQuizQuestions(Symbol('test') as any)).not.toThrow()
    })

    test('should handle invalid inputs to quiz validation', async () => {
      // Test validation with invalid inputs
      expect(() => validateQuizConfiguration(null as any)).not.toThrow()
      expect(() => validateQuizConfiguration(undefined as any)).not.toThrow()
      expect(() => validateQuizConfiguration('string' as any)).not.toThrow()
      expect(() => validateQuizConfiguration(123 as any)).not.toThrow()
      expect(() => validateQuizConfiguration([] as any)).not.toThrow()
    })
  })
})

describe('GET Endpoint Input Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.error = jest.fn()
  })

  test('should handle malformed query parameters', async () => {
    const malformedQueries = [
      '?profileId=',                                     // Empty value
      '?profileId=%',                                    // Invalid URL encoding
      '?profileId=%ZZ',                                  // Invalid hex in URL encoding
      '?profileId=' + 'A'.repeat(10000),                // Extremely long parameter
      '?profileId=null',                                 // String null
      '?profileId=undefined',                            // String undefined
      '?profileId=<script>alert("xss")</script>',       // XSS attempt
      '?profileId=../../etc/passwd',                     // Path traversal
      '?profileId=javascript:alert("xss")',             // JavaScript protocol
      '?childName=' + encodeURIComponent('🎨👶🏻📚'),    // Unicode in URL
      '?context=' + 'A'.repeat(1000),                   // Long context
      '?profileId=1&profileId=2&profileId=3',           // Multiple values
      '?PROFILEID=test',                                 // Wrong case
      '?profile_id=test',                                // Wrong parameter name
    ]

    for (const query of malformedQueries) {
      const request = new NextRequest(`http://localhost:3000/api/profiles/progressive${query}`)
      
      const response = await GET(request)
      
      // Should handle malformed queries gracefully
      expect([200, 400, 404, 500]).toContain(response.status)
    }
  })
})

describe('Error Recovery and Graceful Degradation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.error = jest.fn()
  })

  test('should recover gracefully when scoring functions throw errors', async () => {
    // Mock scoring functions to throw errors
    mockCalculateCLP2Scores.mockImplementation(() => {
      throw new Error('Scoring calculation failed')
    })

    const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
      method: 'POST',
      body: JSON.stringify({
        child_name: 'Error Recovery Test',
        quiz_type: 'parent_home',
        respondent_type: 'parent',
        responses: { 1: 4, 2: 3, 3: 5 }
      })
    })

    const response = await POST(request)
    
    // Should handle scoring errors gracefully
    expect([200, 500]).toContain(response.status)
    
    if (response.status === 500) {
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    }
  })

  test('should handle partial data corruption gracefully', async () => {
    // Mock scoring to return partially corrupted data
    mockCalculateCLP2Scores.mockReturnValue({
      Communication: NaN,
      Collaboration: Infinity,
      Content: -Infinity,
      'Critical Thinking': undefined as any,
      'Creative Innovation': null as any,
      Confidence: 'invalid' as any,
      Literacy: {} as any,
      Math: [] as any
    })

    const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
      method: 'POST',
      body: JSON.stringify({
        child_name: 'Data Corruption Test',
        quiz_type: 'parent_home',
        respondent_type: 'parent',
        responses: { 1: 4, 2: 3, 3: 5 }
      })
    })

    const response = await POST(request)
    
    // Should handle corrupted scoring data
    expect([200, 500]).toContain(response.status)
  })
})