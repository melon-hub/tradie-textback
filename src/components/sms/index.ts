// Export all SMS template components for easy importing
export { TemplateLibrary } from './TemplateLibrary';
export { VariableHelper } from './VariableHelper';
export { TemplatePreview } from './TemplatePreview';
export { TemplateCategories } from './TemplateCategories';

// Re-export types from data
export type { TemplateLibraryItem } from '@/data/smsTemplateLibrary';
export { SMS_TEMPLATE_LIBRARY, TRADE_TYPES, TEMPLATE_CATEGORIES } from '@/data/smsTemplateLibrary';