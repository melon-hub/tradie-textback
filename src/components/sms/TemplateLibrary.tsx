import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Library, 
  Star, 
  Copy, 
  Eye, 
  Filter,
  Lightbulb,
  CheckCircle,
  Phone,
  Clock,
  MapPin,
  DollarSign,
  MessageSquare,
  FileText,
  Bell,
  Users,
  Wrench,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SMS_TEMPLATE_LIBRARY, TRADE_TYPES, TEMPLATE_CATEGORIES, TemplateLibraryItem } from '@/data/smsTemplateLibrary';
import { TemplatePreview } from './TemplatePreview';

interface TemplateLibraryProps {
  onTemplateSelect: (template: TemplateLibraryItem) => void;
  className?: string;
  selectedTradeType?: string;
  selectedCategory?: string;
}

const CATEGORY_ICONS: { [key: string]: React.ReactNode } = {
  missed_call: <Phone className="h-4 w-4" />,
  after_hours: <Clock className="h-4 w-4" />,
  job_confirmation: <CheckCircle className="h-4 w-4" />,
  job_reminder: <Bell className="h-4 w-4" />,
  job_arrival: <MapPin className="h-4 w-4" />,
  job_completion: <CheckCircle className="h-4 w-4" />,
  follow_up: <MessageSquare className="h-4 w-4" />,
  quote: <FileText className="h-4 w-4" />,
  payment: <DollarSign className="h-4 w-4" />
};

const POPULAR_TEMPLATES = [
  'missed_call_basic',
  'job_confirmation_basic',
  'job_arrival_basic',
  'job_completion_basic',
  'after_hours_basic'
];

export function TemplateLibrary({ 
  onTemplateSelect, 
  className, 
  selectedTradeType, 
  selectedCategory 
}: TemplateLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState(selectedCategory || 'all');
  const [filterTradeType, setFilterTradeType] = useState(selectedTradeType || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const filteredTemplates = SMS_TEMPLATE_LIBRARY.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    
    const matchesTradeType = filterTradeType === 'all' || 
      template.tradeTypes.includes('all') || 
      template.tradeTypes.includes(filterTradeType);

    return matchesSearch && matchesCategory && matchesTradeType;
  });

  const popularTemplates = filteredTemplates.filter(template => 
    POPULAR_TEMPLATES.includes(template.id)
  );

  const handleTemplateSelect = (template: TemplateLibraryItem) => {
    onTemplateSelect(template);
    toast({
      title: 'Template Selected',
      description: `"${template.name}" has been applied to your editor`,
    });
  };

  const copyTemplate = (template: TemplateLibraryItem) => {
    navigator.clipboard.writeText(template.content);
    toast({
      title: 'Template Copied',
      description: `"${template.name}" copied to clipboard`,
    });
  };

  const getTradeSpecificTemplates = () => {
    if (filterTradeType === 'all') return [];
    return filteredTemplates.filter(template => 
      template.tradeTypes.includes(filterTradeType) && 
      !template.tradeTypes.includes('all')
    );
  };

  const getCategoryName = (categoryId: string) => {
    return TEMPLATE_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
  };

  const formatTradeType = (tradeType: string) => {
    return tradeType.charAt(0).toUpperCase() + tradeType.slice(1);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Library className="h-4 w-4 mr-2" />
          Template Library
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Library className="h-5 w-5" />
            <span>Professional SMS Template Library</span>
          </DialogTitle>
          <DialogDescription>
            Choose from professional templates designed specifically for trade businesses
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates by name, description, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </div>

            {showFilters && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {TEMPLATE_CATEGORIES.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Trade Type</Label>
                      <Select value={filterTradeType} onValueChange={setFilterTradeType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Trades</SelectItem>
                          {TRADE_TYPES.filter(t => t !== 'all').map(tradeType => (
                            <SelectItem key={tradeType} value={tradeType}>
                              {formatTradeType(tradeType)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Filters */}
            {(filterCategory !== 'all' || filterTradeType !== 'all' || searchTerm) && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filterCategory !== 'all' && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>{getCategoryName(filterCategory)}</span>
                    <button onClick={() => setFilterCategory('all')} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                      ×
                    </button>
                  </Badge>
                )}
                {filterTradeType !== 'all' && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>{formatTradeType(filterTradeType)}</span>
                    <button onClick={() => setFilterTradeType('all')} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                      ×
                    </button>
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>"{searchTerm}"</span>
                    <button onClick={() => setSearchTerm('')} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>Popular</span>
              </TabsTrigger>
              <TabsTrigger value="trade-specific">Trade Specific</TabsTrigger>
              <TabsTrigger value="by-category">By Category</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredTemplates.length} templates found
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => handleTemplateSelect(template)}
                    onCopy={() => copyTemplate(template)}
                  />
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <Library className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No templates found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or filters</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="popular" className="space-y-4">
              <Alert>
                <Star className="h-4 w-4" />
                <AlertDescription>
                  These are the most commonly used templates across all trade businesses
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => handleTemplateSelect(template)}
                    onCopy={() => copyTemplate(template)}
                    isPopular
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trade-specific" className="space-y-4">
              {filterTradeType === 'all' ? (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Select a specific trade type in the filters above to see trade-specific templates
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-5 w-5" />
                    <h3 className="text-lg font-medium">
                      Templates for {formatTradeType(filterTradeType)}s
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getTradeSpecificTemplates().map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={() => handleTemplateSelect(template)}
                        onCopy={() => copyTemplate(template)}
                        isTradeSpecific
                      />
                    ))}
                  </div>

                  {getTradeSpecificTemplates().length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        No specific templates for {formatTradeType(filterTradeType)}s yet.
                        <br />
                        Check out the general templates that work for all trades!
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="by-category" className="space-y-6">
              {TEMPLATE_CATEGORIES.map((category) => {
                const categoryTemplates = filteredTemplates.filter(t => t.category === category.id);
                
                if (categoryTemplates.length === 0) return null;

                return (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      {CATEGORY_ICONS[category.id]}
                      <h3 className="text-lg font-medium">{category.name}</h3>
                      <Badge variant="outline">{categoryTemplates.length}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onSelect={() => handleTemplateSelect(template)}
                          onCopy={() => copyTemplate(template)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Template Tips
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click "Use Template" to load it into your editor for customization</li>
                <li>• Use the preview feature to see how templates look on mobile devices</li>
                <li>• Trade-specific templates include industry-relevant language and requirements</li>
                <li>• All templates can be modified to match your business style and needs</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TemplateCardProps {
  template: TemplateLibraryItem;
  onSelect: () => void;
  onCopy: () => void;
  isPopular?: boolean;
  isTradeSpecific?: boolean;
}

function TemplateCard({ template, onSelect, onCopy, isPopular, isTradeSpecific }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              {CATEGORY_ICONS[template.category]}
              <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
              {isPopular && (
                <Badge variant="secondary" className="flex items-center space-x-1 text-xs">
                  <Star className="h-3 w-3" />
                  <span>Popular</span>
                </Badge>
              )}
              {isTradeSpecific && (
                <Badge variant="secondary" className="flex items-center space-x-1 text-xs">
                  <Zap className="h-3 w-3" />
                  <span>Trade</span>
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">{template.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700 line-clamp-3">
          {template.content}
        </div>
        
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {template.tradeTypes.includes('all') ? 'All trades' : template.tradeTypes.join(', ')}
          </div>
          <div className="flex items-center space-x-2">
            <TemplatePreview
              content={template.content}
              templateName={template.name}
              availableVariables={template.variables}
            />
            <Button variant="ghost" size="sm" onClick={onCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={onSelect}>
              Use Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}