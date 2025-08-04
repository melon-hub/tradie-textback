import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  Clock, 
  CheckCircle, 
  Bell, 
  MapPin, 
  MessageSquare, 
  DollarSign, 
  FileText,
  Users,
  Zap,
  Settings
} from 'lucide-react';

interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  templates: string[];
  automationLevel: 'automatic' | 'manual' | 'both';
  usage: 'high' | 'medium' | 'low';
}

interface TemplateCategoriesProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  templateCounts?: { [key: string]: number };
  className?: string;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    id: 'missed_call',
    name: 'Missed Calls',
    description: 'Automatic responses when you miss customer calls',
    icon: <Phone className="h-4 w-4" />,
    color: 'bg-red-50 border-red-200 text-red-700',
    templates: ['missed_call_basic', 'missed_call_urgent', 'missed_call_trade_specific'],
    automationLevel: 'automatic',
    usage: 'high'
  },
  {
    id: 'after_hours',
    name: 'After Hours',
    description: 'Messages sent outside your business hours',
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    templates: ['after_hours_basic', 'after_hours_weekend', 'after_hours_holiday'],
    automationLevel: 'automatic',
    usage: 'high'
  },
  {
    id: 'job_confirmation',
    name: 'Job Confirmations',
    description: 'Confirm scheduled appointments with customers',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-green-50 border-green-200 text-green-700',
    templates: ['job_confirmation_basic', 'job_confirmation_detailed', 'job_confirmation_trade'],
    automationLevel: 'both',
    usage: 'high'
  },
  {
    id: 'job_reminder',
    name: 'Job Reminders',
    description: 'Remind customers about upcoming appointments',
    icon: <Bell className="h-4 w-4" />,
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    templates: ['job_reminder_24h', 'job_reminder_2h', 'job_reminder_custom'],
    automationLevel: 'automatic',
    usage: 'medium'
  },
  {
    id: 'job_arrival',
    name: 'Arrival Notices',
    description: 'Let customers know when you\'re on your way',
    icon: <MapPin className="h-4 w-4" />,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    templates: ['job_arrival_basic', 'job_arrival_eta', 'job_arrival_late'],
    automationLevel: 'manual',
    usage: 'high'
  },
  {
    id: 'job_completion',
    name: 'Job Complete',
    description: 'Send completion notices and follow-ups',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    templates: ['job_completion_basic', 'job_completion_warranty', 'job_completion_review'],
    automationLevel: 'both',
    usage: 'high'
  },
  {
    id: 'follow_up',
    name: 'Follow Ups',
    description: 'Post-job follow ups and satisfaction checks',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    templates: ['follow_up_satisfaction', 'follow_up_review', 'follow_up_maintenance'],
    automationLevel: 'manual',
    usage: 'medium'
  },
  {
    id: 'quote',
    name: 'Quotes',
    description: 'Quote delivery and follow-up messages',
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    templates: ['quote_delivery', 'quote_follow_up', 'quote_reminder'],
    automationLevel: 'manual',
    usage: 'medium'
  },
  {
    id: 'payment',
    name: 'Payments',
    description: 'Payment reminders and confirmations',
    icon: <DollarSign className="h-4 w-4" />,
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    templates: ['payment_reminder', 'payment_overdue', 'payment_received'],
    automationLevel: 'both',
    usage: 'medium'
  }
];

const AUTOMATION_LABELS = {
  automatic: { label: 'Auto', color: 'bg-green-100 text-green-800' },
  manual: { label: 'Manual', color: 'bg-blue-100 text-blue-800' },
  both: { label: 'Auto + Manual', color: 'bg-purple-100 text-purple-800' }
};

const USAGE_LABELS = {
  high: { label: 'High Usage', color: 'bg-red-100 text-red-800' },
  medium: { label: 'Medium Usage', color: 'bg-yellow-100 text-yellow-800' },
  low: { label: 'Low Usage', color: 'bg-gray-100 text-gray-800' }
};

export function TemplateCategories({ 
  activeCategory, 
  onCategoryChange, 
  templateCounts = {},
  className 
}: TemplateCategoriesProps) {

  const handleCategoryClick = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  const getTemplateCount = (categoryId: string): number => {
    return templateCounts[categoryId] || 0;
  };

  const automationCategories = CATEGORY_CONFIGS.filter(c => c.automationLevel === 'automatic');
  const manualCategories = CATEGORY_CONFIGS.filter(c => c.automationLevel === 'manual');
  const bothCategories = CATEGORY_CONFIGS.filter(c => c.automationLevel === 'both');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Template Categories</span>
          </CardTitle>
          <CardDescription>
            Organize your SMS templates by purpose and automation level
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Categories</TabsTrigger>
          <TabsTrigger value="automatic" className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>Automatic</span>
          </TabsTrigger>
          <TabsTrigger value="manual">Manual Send</TabsTrigger>
          <TabsTrigger value="both">Both</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORY_CONFIGS.map((category) => (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeCategory === category.id ? 'ring-2 ring-primary shadow-md' : ''
                } ${category.color}`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {category.icon}
                      <CardTitle className="text-sm">{category.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {getTemplateCount(category.id)}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge 
                      className={`text-xs ${AUTOMATION_LABELS[category.automationLevel].color}`}
                      variant="secondary"
                    >
                      {AUTOMATION_LABELS[category.automationLevel].label}
                    </Badge>
                    <Badge 
                      className={`text-xs ${USAGE_LABELS[category.usage].color}`}
                      variant="secondary"
                    >
                      {USAGE_LABELS[category.usage].label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automatic" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="h-4 w-4" />
              <span>These templates are sent automatically based on events</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {automationCategories.map((category) => (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    activeCategory === category.id ? 'ring-2 ring-primary shadow-md' : ''
                  } ${category.color}`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <CardTitle className="text-sm">{category.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {getTemplateCount(category.id)}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>These templates are sent manually when you choose</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {manualCategories.map((category) => (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    activeCategory === category.id ? 'ring-2 ring-primary shadow-md' : ''
                  } ${category.color}`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <CardTitle className="text-sm">{category.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {getTemplateCount(category.id)}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="both" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Settings className="h-4 w-4" />
              <span>These templates can be sent automatically or manually</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bothCategories.map((category) => (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    activeCategory === category.id ? 'ring-2 ring-primary shadow-md' : ''
                  } ${category.color}`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <CardTitle className="text-sm">{category.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {getTemplateCount(category.id)}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {automationCategories.length}
              </div>
              <div className="text-xs text-gray-600">Automatic</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {manualCategories.length}
              </div>
              <div className="text-xs text-gray-600">Manual</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {bothCategories.length}
              </div>
              <div className="text-xs text-gray-600">Flexible</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}