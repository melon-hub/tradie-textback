// =============================================================================
// TWILIO ERROR DISPLAY COMPONENT
// =============================================================================
// User-friendly error display with recovery suggestions and help links
// =============================================================================

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  AlertTriangle, 
  XCircle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  RefreshCw,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

import { TwilioErrorHandler } from '@/services/twilioErrorHandler';
import type { TwilioError, ErrorContext } from '@/services/twilioErrorHandler';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface TwilioErrorDisplayProps {
  error: TwilioError;
  context: ErrorContext;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TwilioErrorDisplay({
  error,
  context,
  onRetry,
  onDismiss,
  showDetails = true,
  className = ''
}: TwilioErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const friendlyError = TwilioErrorHandler.getUserFriendlyError(error, context);
  const recoveryActions = TwilioErrorHandler.getRecoveryActions(error, context);
  const isRecoverable = TwilioErrorHandler.isRecoverableError(error, context);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const getIcon = () => {
    switch (friendlyError.severity) {
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    return friendlyError.severity === 'error' ? 'destructive' : 'default';
  };

  const getSeverityColor = () => {
    switch (friendlyError.severity) {
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getContextLabel = () => {
    switch (context) {
      case 'credential_validation':
        return 'Credential Validation';
      case 'phone_number_search':
        return 'Phone Number Search';
      case 'phone_number_purchase':
        return 'Phone Number Purchase';
      case 'message_sending':
        return 'Message Sending';
      case 'webhook_configuration':
        return 'Webhook Configuration';
      case 'settings_save':
        return 'Settings Save';
      case 'connection_test':
        return 'Connection Test';
      default:
        return 'Twilio Operation';
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={`space-y-4 ${className}`}>
      <Alert variant={getVariant()}>
        {getIcon()}
        <AlertDescription>
          <div className="space-y-3">
            {/* Main Error Message */}
            <div>
              <h4 className="font-semibold">{friendlyError.title}</h4>
              <p className="mt-1">{friendlyError.message}</p>
            </div>

            {/* Primary Suggestion */}
            <div className="bg-gray-50 p-3 rounded-md border">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">What to try:</p>
                  <p className="text-sm text-gray-700">{friendlyError.suggestion}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {isRecoverable && onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Try Again
                </Button>
              )}
              
              {friendlyError.helpUrl && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="h-8"
                >
                  <a 
                    href={friendlyError.helpUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <HelpCircle className="h-3 w-3 mr-2" />
                    Get Help
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
              
              {onDismiss && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onDismiss}
                  className="h-8"
                >
                  Dismiss
                </Button>
              )}

              {/* Severity Badge */}
              <Badge 
                variant="outline" 
                className={`ml-auto ${getSeverityColor()} capitalize`}
              >
                {friendlyError.severity}
              </Badge>
            </div>

            {/* Additional Recovery Actions */}
            {recoveryActions.length > 1 && (
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-between h-8 text-xs"
                  >
                    More suggestions
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {recoveryActions.slice(1).map((action, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-gray-50 rounded border-l-2 border-blue-200"
                    >
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Technical Details (if enabled) */}
            {showDetails && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-between h-8 text-xs text-gray-500"
                  >
                    Technical details
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs">
                    <div className="space-y-1">
                      <div>
                        <span className="text-gray-400">Context:</span> {getContextLabel()}
                      </div>
                      <div>
                        <span className="text-gray-400">Error Code:</span> {error.code}
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span> {error.status}
                      </div>
                      {error.details && (
                        <div>
                          <span className="text-gray-400">Details:</span> {error.details}
                        </div>
                      )}
                      {error.moreInfo && (
                        <div>
                          <span className="text-gray-400">More Info:</span> {error.moreInfo}
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// =============================================================================
// SIMPLE ERROR DISPLAY
// =============================================================================

interface SimpleTwilioErrorProps {
  error: TwilioError;
  context: ErrorContext;
  onRetry?: () => void;
}

export function SimpleTwilioError({ 
  error, 
  context, 
  onRetry 
}: SimpleTwilioErrorProps) {
  const friendlyError = TwilioErrorHandler.getUserFriendlyError(error, context);
  const isRecoverable = TwilioErrorHandler.isRecoverableError(error, context);

  return (
    <Alert variant={friendlyError.severity === 'error' ? 'destructive' : 'default'}>
      {friendlyError.severity === 'error' ? (
        <XCircle className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <strong>{friendlyError.title}:</strong> {friendlyError.message}
          </div>
          {isRecoverable && onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================
// Components are exported via their function declarations above