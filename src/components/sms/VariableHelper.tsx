import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, User, Building, Calendar, MapPin, Clock, Phone, DollarSign, Wrench, Copy, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VariableHelperProps {
  onVariableSelect: (variable: string) => void;
  availableVariables?: string[];
  className?: string;
}

interface VariableGroup {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  variables: {
    name: string;
    description: string;
    example: string;
  }[];
}

const VARIABLE_GROUPS: VariableGroup[] = [
  {
    id: 'customer',
    name: 'Customer Info',
    icon: <User className="h-4 w-4" />,
    description: 'Customer details and contact information',
    variables: [
      {
        name: '{customer_name}',
        description: 'Customer\'s full name',
        example: 'John Smith'
      },
      {
        name: '{customer_first_name}',
        description: 'Customer\'s first name only',
        example: 'John'
      },
      {
        name: '{customer_phone}',
        description: 'Customer\'s phone number',
        example: '0400 123 456'
      }
    ]
  },
  {
    id: 'business',
    name: 'Your Business',
    icon: <Building className="h-4 w-4" />,
    description: 'Your business information and contact details',
    variables: [
      {
        name: '{business_name}',
        description: 'Your business name',
        example: 'Smith Plumbing'
      },
      {
        name: '{tradie_name}',
        description: 'Your name',
        example: 'Mike Smith'
      },
      {
        name: '{phone_number}',
        description: 'Your business phone',
        example: '0400 987 654'
      },
      {
        name: '{emergency_number}',
        description: 'Emergency contact number',
        example: '0400 999 888'
      }
    ]
  },
  {
    id: 'job',
    name: 'Job Details',
    icon: <Wrench className="h-4 w-4" />,
    description: 'Information about the specific job or service',
    variables: [
      {
        name: '{job_type}',
        description: 'Type of work being done',
        example: 'Blocked drain repair'
      },
      {
        name: '{job_description}',
        description: 'Detailed job description',
        example: 'Kitchen sink blocked drain'
      },
      {
        name: '{job_status}',
        description: 'Current status of the job',
        example: 'In Progress'
      }
    ]
  },
  {
    id: 'scheduling',
    name: 'Date & Time',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Scheduling and timing information',
    variables: [
      {
        name: '{job_date}',
        description: 'Scheduled job date',
        example: 'Monday 15th Jan'
      },
      {
        name: '{job_time}',
        description: 'Scheduled job time',
        example: '9:00 AM'
      },
      {
        name: '{eta}',
        description: 'Estimated time of arrival (minutes)',
        example: '15'
      },
      {
        name: '{delay_minutes}',
        description: 'How many minutes running late',
        example: '20'
      }
    ]
  },
  {
    id: 'location',
    name: 'Location',
    icon: <MapPin className="h-4 w-4" />,
    description: 'Address and location information',
    variables: [
      {
        name: '{job_address}',
        description: 'Full job site address',
        example: '123 Main St, Sydney NSW'
      },
      {
        name: '{suburb}',
        description: 'Suburb only',
        example: 'Bondi'
      },
      {
        name: '{location}',
        description: 'Specific location at property',
        example: 'kitchen bench'
      }
    ]
  },
  {
    id: 'payment',
    name: 'Payment & Quotes',
    icon: <DollarSign className="h-4 w-4" />,
    description: 'Financial information and quotes',
    variables: [
      {
        name: '{quote_amount}',
        description: 'Quote total amount',
        example: '450'
      },
      {
        name: '{amount}',
        description: 'Payment amount',
        example: '350'
      },
      {
        name: '{due_date}',
        description: 'Payment due date',
        example: '15th January'
      },
      {
        name: '{quote_date}',
        description: 'Date quote was provided',
        example: '10th January'
      },
      {
        name: '{quote_validity}',
        description: 'How long quote is valid',
        example: '30'
      },
      {
        name: '{payment_methods}',
        description: 'Available payment options',
        example: 'cash, card, or bank transfer'
      }
    ]
  },
  {
    id: 'warranty',
    name: 'Warranty & Service',
    icon: <Clock className="h-4 w-4" />,
    description: 'Warranty and service information',
    variables: [
      {
        name: '{warranty_period}',
        description: 'Warranty duration',
        example: '12 month'
      },
      {
        name: '{service_date}',
        description: 'Date service was completed',
        example: '15th January'
      },
      {
        name: '{next_service}',
        description: 'Next scheduled service date',
        example: '15th July'
      }
    ]
  }
];

export function VariableHelper({ onVariableSelect, availableVariables, className }: VariableHelperProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('customer');
  const { toast } = useToast();

  const filteredGroups = VARIABLE_GROUPS.map(group => ({
    ...group,
    variables: group.variables.filter(variable =>
      variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.variables.length > 0);

  const handleVariableClick = (variableName: string) => {
    onVariableSelect(variableName);
    toast({
      title: 'Variable Added',
      description: `${variableName} has been added to your template`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${text} copied to clipboard`,
    });
  };

  const isVariableAvailable = (variableName: string) => {
    return !availableVariables || availableVariables.includes(variableName);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Info className="h-4 w-4 mr-2" />
          Variable Helper
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>SMS Template Variables</DialogTitle>
          <DialogDescription>
            Click any variable to add it to your template. Variables are automatically replaced with real data when messages are sent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search variables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Variable Groups */}
          <Tabs value={selectedGroup} onValueChange={setSelectedGroup}>
            <TabsList className="grid w-full grid-cols-7">
              {VARIABLE_GROUPS.map((group) => (
                <TabsTrigger 
                  key={group.id} 
                  value={group.id}
                  className="flex items-center space-x-1 text-xs"
                >
                  {group.icon}
                  <span className="hidden sm:inline">{group.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {VARIABLE_GROUPS.map((group) => (
              <TabsContent key={group.id} value={group.id} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      {group.icon}
                      <span>{group.name}</span>
                    </CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {group.variables
                        .filter(variable =>
                          !searchTerm || 
                          variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          variable.description.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((variable) => (
                        <div
                          key={variable.name}
                          className={`p-3 border rounded-lg transition-colors ${
                            isVariableAvailable(variable.name)
                              ? 'hover:bg-gray-50 cursor-pointer border-gray-200'
                              : 'bg-gray-50 border-gray-100 opacity-60'
                          }`}
                          onClick={() => isVariableAvailable(variable.name) && handleVariableClick(variable.name)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={isVariableAvailable(variable.name) ? "default" : "secondary"}
                                  className="font-mono text-xs"
                                >
                                  {variable.name}
                                </Badge>
                                {!isVariableAvailable(variable.name) && (
                                  <Badge variant="outline" className="text-xs">
                                    Not available for this template
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{variable.description}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Example: <span className="font-medium">{variable.example}</span>
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(variable.name);
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Quick Access - Most Common Variables */}
          {!searchTerm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Access - Most Common</CardTitle>
                <CardDescription className="text-xs">
                  The most frequently used variables across all templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    '{customer_name}',
                    '{business_name}',
                    '{tradie_name}', 
                    '{job_type}',
                    '{job_date}',
                    '{job_time}',
                    '{job_address}'
                  ].map((variable) => (
                    <Badge
                      key={variable}
                      variant={isVariableAvailable(variable) ? "default" : "secondary"}
                      className={`cursor-pointer font-mono text-xs ${
                        isVariableAvailable(variable) ? 'hover:bg-primary/80' : 'opacity-60'
                      }`}
                      onClick={() => isVariableAvailable(variable) && handleVariableClick(variable)}
                    >
                      {variable}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {searchTerm && filteredGroups.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No variables found matching "{searchTerm}"</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Variables are case-sensitive and must include the curly braces</li>
            <li>• Test your templates with the preview to see how variables look</li>
            <li>• Keep messages under 160 characters when possible to avoid multiple SMS charges</li>
            <li>• Use customer names to make messages more personal and professional</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}