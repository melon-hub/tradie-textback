// =============================================================================
// TWILIO INTEGRATION TEST COMPONENT
// =============================================================================
// Testing component for validating Twilio integration functionality
// Helps verify credential validation, phone number search, and error handling
// =============================================================================

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Phone, 
  Key, 
  Search,
  Send,
  AlertTriangle,
  Info
} from 'lucide-react';

import TwilioErrorDisplay from './TwilioErrorDisplay';
import { 
  validateTwilioCredentials,
  searchPhoneNumbers,
  testTwilioConnection
} from '@/services/twilio';
import type {
  TwilioCredentials,
  TwilioError,
  TwilioValidationResponse,
  AvailablePhoneNumber
} from '@/types/twilio';

// =============================================================================
// TEST SCENARIOS
// =============================================================================

interface TestScenario {
  id: string;
  name: string;
  description: string;
  category: 'credentials' | 'search' | 'connection';
  testFunction: () => Promise<TestResult>;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  error?: TwilioError;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TwilioIntegrationTest() {
  const [credentials, setCredentials] = useState<TwilioCredentials>({
    accountSid: '',
    authToken: ''
  });
  
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [runningTests, setRunningTests] = useState<Record<string, boolean>>({});
  const [validationResult, setValidationResult] = useState<TwilioValidationResponse | null>(null);
  const [availableNumbers, setAvailableNumbers] = useState<AvailablePhoneNumber[]>([]);
  const [currentError, setCurrentError] = useState<TwilioError | null>(null);

  // =============================================================================
  // TEST SCENARIOS
  // =============================================================================

  const testScenarios: TestScenario[] = [
    {
      id: 'valid_credentials',
      name: 'Valid Credentials Test',
      description: 'Test with properly formatted Twilio credentials',
      category: 'credentials',
      testFunction: async () => {
        if (!credentials.accountSid || !credentials.authToken) {
          return {
            success: false,
            message: 'Please enter credentials first'
          };
        }

        try {
          const result = await validateTwilioCredentials(credentials);
          setValidationResult(result);
          
          if (result.valid) {
            return {
              success: true,
              message: `Credentials valid for account: ${result.accountName}`,
              details: result
            };
          } else {
            return {
              success: false,
              message: 'Invalid credentials',
              error: result.error
            };
          }
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Validation failed',
            error: error
          };
        }
      }
    },
    
    {
      id: 'invalid_credentials',
      name: 'Invalid Credentials Test',
      description: 'Test error handling with invalid credentials',
      category: 'credentials',
      testFunction: async () => {
        const invalidCreds: TwilioCredentials = {
          accountSid: 'AC123invalid',
          authToken: 'invalid_token'
        };

        try {
          const result = await validateTwilioCredentials(invalidCreds);
          
          if (!result.valid && result.error) {
            return {
              success: true,
              message: 'Error handling working correctly',
              details: result.error
            };
          } else {
            return {
              success: false,
              message: 'Should have failed with invalid credentials'
            };
          }
        } catch (error: any) {
          return {
            success: true,
            message: 'Error caught as expected',
            details: error
          };
        }
      }
    },
    
    {
      id: 'phone_search',
      name: 'Phone Number Search',
      description: 'Search for available phone numbers',
      category: 'search',
      testFunction: async () => {
        if (!validationResult?.valid) {
          return {
            success: false,
            message: 'Valid credentials required first'
          };
        }

        try {
          const numbers = await searchPhoneNumbers(credentials, {
            areaCode: '02',
            smsEnabled: true,
            limit: 5
          });
          
          setAvailableNumbers(numbers);
          
          return {
            success: true,
            message: `Found ${numbers.length} available numbers`,
            details: numbers
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Search failed',
            error: error
          };
        }
      }
    },

    {
      id: 'empty_search',
      name: 'Empty Search Results',
      description: 'Test handling when no numbers are found',
      category: 'search',
      testFunction: async () => {
        if (!validationResult?.valid) {
          return {
            success: false,
            message: 'Valid credentials required first'
          };
        }

        try {
          const numbers = await searchPhoneNumbers(credentials, {
            areaCode: '99', // Non-existent area code
            smsEnabled: true,
            limit: 5
          });
          
          if (numbers.length === 0) {
            return {
              success: true,
              message: 'Empty results handled correctly'
            };
          } else {
            return {
              success: false,
              message: 'Should have returned no results'
            };
          }
        } catch (error: any) {
          return {
            success: true,
            message: 'Error handling for no results working',
            error: error
          };
        }
      }
    }
  ];

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const runTest = async (scenario: TestScenario) => {
    setRunningTests(prev => ({ ...prev, [scenario.id]: true }));
    setCurrentError(null);
    
    try {
      const result = await scenario.testFunction();
      setTestResults(prev => ({ ...prev, [scenario.id]: result }));
      
      if (result.error) {
        setCurrentError(result.error);
      }
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        [scenario.id]: {
          success: false,
          message: error.message || 'Test failed',
          error: error
        }
      }));
    } finally {
      setRunningTests(prev => ({ ...prev, [scenario.id]: false }));
    }
  };

  const runAllTests = async () => {
    for (const scenario of testScenarios) {
      await runTest(scenario);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const clearResults = () => {
    setTestResults({});
    setValidationResult(null);
    setAvailableNumbers([]);
    setCurrentError(null);
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const getTestStatusIcon = (testId: string) => {
    if (runningTests[testId]) {
      return <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />;
    }
    
    const result = testResults[testId];
    if (!result) {
      return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
    
    return result.success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getTestStatusBadge = (testId: string) => {
    if (runningTests[testId]) {
      return <Badge variant="secondary">Running...</Badge>;
    }
    
    const result = testResults[testId];
    if (!result) {
      return <Badge variant="outline">Not Run</Badge>;
    }
    
    return result.success ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Passed</Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Twilio Integration Test Suite
          </CardTitle>
          <CardDescription>
            Test and validate your Twilio integration functionality
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Credentials Input */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Test Credentials
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test_account_sid">Account SID</Label>
                <Input
                  id="test_account_sid"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={credentials.accountSid}
                  onChange={(e) => setCredentials(prev => ({ 
                    ...prev, 
                    accountSid: e.target.value 
                  }))}
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="test_auth_token">Auth Token</Label>
                <Input
                  id="test_auth_token"
                  type="password"
                  placeholder="Your auth token"
                  value={credentials.authToken}
                  onChange={(e) => setCredentials(prev => ({ 
                    ...prev, 
                    authToken: e.target.value 
                  }))}
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Test Controls */}
          <div className="flex items-center gap-2">
            <Button onClick={runAllTests} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Run All Tests
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <h3 className="font-medium">Test Results</h3>
            
            {testScenarios.map((scenario) => (
              <Card key={scenario.id} className="border-l-4 border-l-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTestStatusIcon(scenario.id)}
                      <div>
                        <h4 className="font-medium">{scenario.name}</h4>
                        <p className="text-sm text-gray-600">{scenario.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getTestStatusBadge(scenario.id)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runTest(scenario)}
                        disabled={runningTests[scenario.id]}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </Button>
                    </div>
                  </div>
                  
                  {testResults[scenario.id] && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium">
                        {testResults[scenario.id].message}
                      </p>
                      {testResults[scenario.id].details && (
                        <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(testResults[scenario.id].details, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Error Display */}
      {currentError && (
        <TwilioErrorDisplay
          error={currentError}
          context="credential_validation"
          onDismiss={() => setCurrentError(null)}
        />
      )}

      {/* Results Summary */}
      {availableNumbers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Found Phone Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {availableNumbers.slice(0, 5).map((number) => (
                <div 
                  key={number.phoneNumber}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <span className="font-mono font-medium">
                    {number.phoneNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{number.region}</Badge>
                    <Badge variant="secondary">${number.monthlyPrice}/mo</Badge>
                  </div>
                </div>
              ))}
              {availableNumbers.length > 5 && (
                <p className="text-sm text-gray-600 text-center">
                  ...and {availableNumbers.length - 5} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Testing Instructions:</strong>
          <div className="mt-2 space-y-1 text-sm">
            <div>1. Enter your Twilio credentials above</div>
            <div>2. Run individual tests or all tests at once</div>
            <div>3. Check results to verify integration is working</div>
            <div>4. Error scenarios will test the error handling system</div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}