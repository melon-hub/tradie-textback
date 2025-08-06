import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Bug, Zap, Database, Globe, Timer } from "lucide-react";
import { captureError, captureMessage } from "@/lib/sentry";
import { supabase } from "@/integrations/supabase/client";

const SentryTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Test 1: Basic JavaScript Error
  const testJavaScriptError = () => {
    addResult("Throwing JavaScript error...");
    throw new Error("Test JavaScript Error - This is a test error from Sentry test page!");
  };

  // Test 2: Async Error
  const testAsyncError = async () => {
    addResult("Throwing async error...");
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error("Test Async Error - Async operations can fail too!");
  };

  // Test 3: Manual Error Capture
  const testManualCapture = () => {
    try {
      addResult("Manually capturing error...");
      const error = new Error("Test Manual Capture - Using captureError function");
      captureError(error, { 
        testType: "manual",
        user: "test-user",
        action: "testing-sentry"
      });
      addResult("✅ Manual error captured and sent to Sentry");
    } catch (err) {
      addResult("❌ Failed to capture manual error");
    }
  };

  // Test 4: Info Message
  const testInfoMessage = () => {
    addResult("Sending info message...");
    captureMessage("Test Info Message - This is an informational message", "info");
    addResult("✅ Info message sent to Sentry");
  };

  // Test 5: Warning Message
  const testWarningMessage = () => {
    addResult("Sending warning message...");
    captureMessage("Test Warning - Something might be wrong but not critical", "warning");
    addResult("✅ Warning message sent to Sentry");
  };

  // Test 6: Network Error
  const testNetworkError = async () => {
    addResult("Testing network error...");
    try {
      const response = await fetch("https://this-domain-definitely-does-not-exist-12345.com/api/test");
      if (!response.ok) throw new Error("Network request failed");
    } catch (error) {
      captureError(error as Error, { type: "network", endpoint: "fake-api" });
      addResult("✅ Network error captured");
    }
  };

  // Test 7: Database Error (RLS violation)
  const testDatabaseError = async () => {
    addResult("Testing database error...");
    try {
      // Try to insert without proper auth - should fail
      const { error } = await supabase
        .from('jobs')
        .insert({ 
          name: 'Test Job',
          status: 'invalid_status' // This should trigger a constraint error
        });
      
      if (error) {
        captureError(new Error(error.message), { 
          type: "database",
          code: error.code,
          details: error.details 
        });
        addResult("✅ Database error captured: " + error.message);
      }
    } catch (error) {
      captureError(error as Error, { type: "database-unexpected" });
      addResult("✅ Database error captured");
    }
  };

  // Test 8: React Component Error
  const TestErrorComponent = () => {
    const [shouldError, setShouldError] = useState(false);
    
    if (shouldError) {
      throw new Error("Test React Component Error - Component crashed!");
    }
    
    return (
      <Button 
        variant="destructive" 
        onClick={() => setShouldError(true)}
      >
        <Bug className="w-4 h-4 mr-2" />
        Crash React Component
      </Button>
    );
  };

  // Test 9: Performance Issue
  const testPerformanceIssue = () => {
    addResult("Simulating performance issue...");
    const startTime = performance.now();
    
    // Simulate heavy computation
    let result = 0;
    for (let i = 0; i < 10000000; i++) {
      result += Math.sqrt(i);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 100) {
      captureMessage(`Performance Issue: Heavy computation took ${duration.toFixed(2)}ms`, "warning");
      addResult(`✅ Performance issue captured (${duration.toFixed(2)}ms)`);
    }
  };

  // Test 10: Unhandled Promise Rejection
  const testUnhandledPromise = () => {
    addResult("Creating unhandled promise rejection...");
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Test Unhandled Promise Rejection - This promise was not caught!"));
      }, 100);
    });
    addResult("⏳ Unhandled promise will reject in 100ms");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-6 h-6 text-red-500" />
              Sentry Error Monitoring Test Page
            </CardTitle>
            <CardDescription>
              Test different types of errors to verify Sentry integration is working.
              Check your Sentry dashboard after running these tests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">How to verify tests:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Run tests below</li>
                    <li>Go to your Sentry dashboard at sentry.io</li>
                    <li>Check the Issues page for new errors</li>
                    <li>Each test should appear as a separate issue</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => {throw new Error("This is your first error!");}}
                variant="destructive"
                className="justify-start"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Break the World (Sentry Demo)
              </Button>

              <Button 
                onClick={testManualCapture}
                variant="outline"
                className="justify-start"
              >
                <Bug className="w-4 h-4 mr-2" />
                Test Manual Error Capture
              </Button>

              <Button 
                onClick={testInfoMessage}
                variant="outline"
                className="justify-start"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Send Info Message
              </Button>

              <Button 
                onClick={testWarningMessage}
                variant="outline"
                className="justify-start"
              >
                <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                Send Warning Message
              </Button>

              <Button 
                onClick={testNetworkError}
                variant="outline"
                className="justify-start"
              >
                <Globe className="w-4 h-4 mr-2" />
                Test Network Error
              </Button>

              <Button 
                onClick={testDatabaseError}
                variant="outline"
                className="justify-start"
              >
                <Database className="w-4 h-4 mr-2" />
                Test Database Error
              </Button>

              <Button 
                onClick={testPerformanceIssue}
                variant="outline"
                className="justify-start"
              >
                <Timer className="w-4 h-4 mr-2" />
                Test Performance Issue
              </Button>

              <Button 
                onClick={testAsyncError}
                variant="destructive"
                className="justify-start"
              >
                <Zap className="w-4 h-4 mr-2" />
                Throw Async Error
              </Button>

              <Button 
                onClick={testUnhandledPromise}
                variant="destructive"
                className="justify-start"
              >
                <Bug className="w-4 h-4 mr-2" />
                Unhandled Promise
              </Button>

              <TestErrorComponent />

              <Button 
                onClick={testJavaScriptError}
                variant="destructive"
                className="justify-start"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Throw JS Error (Will Crash)
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Test Results:</h3>
                <div className="bg-gray-100 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono py-1">
                      {result}
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => setTestResults([])}
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                >
                  Clear Results
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected Sentry Dashboard Results</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>After running these tests, you should see in Sentry:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Issues tab:</strong> New errors grouped by type</li>
              <li><strong>Error details:</strong> Stack traces, browser info, custom context</li>
              <li><strong>User context:</strong> If logged in, your user ID attached</li>
              <li><strong>Breadcrumbs:</strong> User actions before each error</li>
              <li><strong>Session replay:</strong> For errors, a replay of user actions (if enabled)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SentryTest;