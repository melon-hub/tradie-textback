export interface TemplateLibraryItem {
  id: string;
  name: string;
  content: string;
  category: 'missed_call' | 'after_hours' | 'job_confirmation' | 'job_reminder' | 'job_arrival' | 'job_completion' | 'follow_up' | 'quote' | 'payment';
  tradeTypes: string[];
  description: string;
  tags: string[];
  variables: string[];
}

export const SMS_TEMPLATE_LIBRARY: TemplateLibraryItem[] = [
  // Missed Call Templates
  {
    id: 'missed_call_basic',
    name: 'Basic Missed Call',
    content: 'Hi {customer_name}, thanks for calling {business_name}! I missed your call but will get back to you within 2 hours. For urgent matters, please text back with details. - {tradie_name}',
    category: 'missed_call',
    tradeTypes: ['all'],
    description: 'Simple, professional missed call response',
    tags: ['professional', 'quick response', 'urgent'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}']
  },
  {
    id: 'missed_call_plumber',
    name: 'Plumber Missed Call',
    content: 'Hi {customer_name}, this is {tradie_name} from {business_name}. Sorry I missed your call! If it\'s a plumbing emergency, text "URGENT" and I\'ll call back ASAP. Otherwise, I\'ll respond within 2 hours.',
    category: 'missed_call',
    tradeTypes: ['plumber'],
    description: 'Plumber-specific with emergency handling',
    tags: ['emergency', 'plumbing', 'urgent'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}']
  },
  {
    id: 'missed_call_electrician',
    name: 'Electrician Missed Call',
    content: 'Hi {customer_name}, {tradie_name} from {business_name} here. Missed your call - if it\'s an electrical emergency (no power, sparking, burning smell), text "EMERGENCY" now. For other work, I\'ll call back within 2 hours.',
    category: 'missed_call',
    tradeTypes: ['electrician'],
    description: 'Electrician-specific with safety emphasis',
    tags: ['emergency', 'electrical', 'safety'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}']
  },
  {
    id: 'missed_call_hvac',
    name: 'HVAC Missed Call',
    content: 'Hi {customer_name}, this is {tradie_name} from {business_name}. Sorry I missed your call! If your heating/cooling system is completely down, text "URGENT" and I\'ll prioritize your call back.',
    category: 'missed_call',
    tradeTypes: ['hvac', 'air conditioning'],
    description: 'HVAC-specific with priority handling',
    tags: ['hvac', 'heating', 'cooling', 'urgent'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}']
  },

  // After Hours Templates
  {
    id: 'after_hours_basic',
    name: 'Basic After Hours',
    content: 'Hi {customer_name}, thanks for contacting {business_name}! We\'re currently closed but will respond first thing in the morning. For emergencies, please call {emergency_number}. - {tradie_name}',
    category: 'after_hours',
    tradeTypes: ['all'],
    description: 'Standard after hours response',
    tags: ['after hours', 'emergency contact'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}', '{emergency_number}']
  },
  {
    id: 'after_hours_weekend',
    name: 'Weekend After Hours',
    content: 'Hi {customer_name}! Thanks for reaching out to {business_name}. It\'s currently the weekend, but I\'ll get back to you first thing Monday morning. For true emergencies, call {emergency_number}. - {tradie_name}',
    category: 'after_hours',
    tradeTypes: ['all'],
    description: 'Weekend-specific messaging',
    tags: ['weekend', 'monday callback', 'emergency'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}', '{emergency_number}']
  },

  // Job Confirmation Templates
  {
    id: 'job_confirmation_basic',
    name: 'Basic Job Confirmation',
    content: 'Hi {customer_name}, this is {tradie_name} from {business_name}. Confirming our appointment for {job_date} at {job_time}. Address: {job_address}. I\'ll text when I\'m on my way. Thanks!',
    category: 'job_confirmation',
    tradeTypes: ['all'],
    description: 'Standard appointment confirmation',
    tags: ['confirmation', 'appointment', 'address'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}', '{job_date}', '{job_time}', '{job_address}']
  },
  {
    id: 'job_confirmation_plumber',
    name: 'Plumber Job Confirmation',
    content: 'Hi {customer_name}, {tradie_name} here confirming your plumbing job on {job_date} at {job_time}. Address: {job_address}. Please ensure I have access to the water main if needed. See you then!',
    category: 'job_confirmation',
    tradeTypes: ['plumber'],
    description: 'Plumber-specific with water main access note',
    tags: ['plumbing', 'water main', 'access'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}', '{job_date}', '{job_time}', '{job_address}']
  },
  {
    id: 'job_confirmation_electrician',
    name: 'Electrician Job Confirmation',
    content: 'Hi {customer_name}, this is {tradie_name} confirming your electrical work on {job_date} at {job_time}. Address: {job_address}. Please ensure I have access to your electrical panel. Thanks!',
    category: 'job_confirmation',
    tradeTypes: ['electrician'],
    description: 'Electrician-specific with panel access note',
    tags: ['electrical', 'panel access', 'safety'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}', '{job_date}', '{job_time}', '{job_address}']
  },

  // Job Arrival Templates
  {
    id: 'job_arrival_basic',
    name: 'Basic Arrival Notice',
    content: 'Hi {customer_name}, I\'m on my way to your {job_address} for the {job_type} job. ETA: {eta} minutes. - {tradie_name}',
    category: 'job_arrival',
    tradeTypes: ['all'],
    description: 'Standard arrival notification',
    tags: ['arrival', 'eta', 'on way'],
    variables: ['{customer_name}', '{tradie_name}', '{job_type}', '{job_address}', '{eta}']
  },
  {
    id: 'job_arrival_running_late',
    name: 'Running Late Notice',
    content: 'Hi {customer_name}, this is {tradie_name}. I\'m running about {delay_minutes} minutes behind schedule for your {job_type} appointment. Sorry for the delay! New ETA: {eta} minutes.',
    category: 'job_arrival',
    tradeTypes: ['all'],
    description: 'For when you\'re running behind schedule',
    tags: ['delay', 'late', 'apology', 'new eta'],
    variables: ['{customer_name}', '{tradie_name}', '{job_type}', '{delay_minutes}', '{eta}']
  },

  // Job Completion Templates
  {
    id: 'job_completion_basic',
    name: 'Basic Job Complete',
    content: 'Hi {customer_name}, job completed! Thanks for choosing {business_name}. If you have any questions or need anything else, please don\'t hesitate to contact us. - {tradie_name}',
    category: 'job_completion',
    tradeTypes: ['all'],
    description: 'Standard job completion message',
    tags: ['completion', 'thanks', 'follow up'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}']
  },
  {
    id: 'job_completion_warranty',
    name: 'Job Complete with Warranty',
    content: 'Hi {customer_name}, your {job_type} work is complete! All work comes with our {warranty_period} warranty. Thanks for choosing {business_name}. Any questions, just call! - {tradie_name}',
    category: 'job_completion',
    tradeTypes: ['all'],
    description: 'Completion message highlighting warranty',
    tags: ['completion', 'warranty', 'guarantee'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}', '{job_type}', '{warranty_period}']
  },
  {
    id: 'job_completion_maintenance',
    name: 'Job Complete with Maintenance Tips',
    content: 'Hi {customer_name}, your {job_type} work is done! I\'ve left some maintenance tips by your {location}. Thanks for choosing {business_name}. Call if you need anything! - {tradie_name}',
    category: 'job_completion',
    tradeTypes: ['all'],
    description: 'Completion with maintenance information',
    tags: ['completion', 'maintenance', 'tips'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}', '{job_type}', '{location}']
  },

  // Follow Up Templates
  {
    id: 'follow_up_satisfaction',
    name: 'Satisfaction Follow Up',
    content: 'Hi {customer_name}, just checking in after your {job_type} work. How\'s everything working? If you need anything or have questions, I\'m just a text away! - {tradie_name} from {business_name}',
    category: 'follow_up',
    tradeTypes: ['all'],
    description: 'Post-job satisfaction check',
    tags: ['follow up', 'satisfaction', 'check in'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}', '{job_type}']
  },
  {
    id: 'follow_up_review_request',
    name: 'Review Request',
    content: 'Hi {customer_name}, hope you\'re happy with your {job_type} work! If you have a moment, a Google review would really help our small business. Thanks again! - {tradie_name} from {business_name}',
    category: 'follow_up',
    tradeTypes: ['all'],
    description: 'Polite review request',
    tags: ['review', 'google', 'small business'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}', '{job_type}']
  },

  // Quote Templates
  {
    id: 'quote_ready',
    name: 'Quote Ready',
    content: 'Hi {customer_name}, your quote for {job_type} is ready! Total: ${quote_amount}. This quote is valid for {quote_validity} days. Reply "YES" to book or call to discuss. - {tradie_name}',
    category: 'quote',
    tradeTypes: ['all'],
    description: 'Quote delivery with clear pricing',
    tags: ['quote', 'pricing', 'booking'],
    variables: ['{customer_name}', '{tradie_name}', '{job_type}', '{quote_amount}', '{quote_validity}']
  },
  {
    id: 'quote_follow_up',
    name: 'Quote Follow Up',
    content: 'Hi {customer_name}, following up on your {job_type} quote from {quote_date}. Still interested? Happy to answer any questions or adjust if needed. - {tradie_name} from {business_name}',
    category: 'quote',
    tradeTypes: ['all'],
    description: 'Gentle quote follow up',
    tags: ['quote', 'follow up', 'flexible'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}', '{job_type}', '{quote_date}']
  },

  // Payment Templates
  {
    id: 'payment_reminder',
    name: 'Payment Reminder',
    content: 'Hi {customer_name}, friendly reminder that payment for your {job_type} work (${amount}) was due on {due_date}. You can pay via {payment_methods}. Thanks! - {business_name}',
    category: 'payment',
    tradeTypes: ['all'],
    description: 'Polite payment reminder',
    tags: ['payment', 'reminder', 'due date'],
    variables: ['{customer_name}', '{business_name}', '{job_type}', '{amount}', '{due_date}', '{payment_methods}']
  },
  {
    id: 'payment_received',
    name: 'Payment Received',
    content: 'Hi {customer_name}, payment received for your {job_type} work - thank you! Receipt has been emailed. Pleasure doing business with you! - {tradie_name} from {business_name}',
    category: 'payment',
    tradeTypes: ['all'],
    description: 'Payment confirmation',
    tags: ['payment', 'received', 'receipt', 'thanks'],
    variables: ['{customer_name}', '{business_name}', '{tradie_name}', '{job_type}']
  }
];

export const TRADE_TYPES = [
  'all',
  'plumber',
  'electrician', 
  'hvac',
  'air conditioning',
  'carpenter',
  'painter',
  'roofer',
  'landscaper',
  'handyman',
  'builder',
  'tiler',
  'plasterer',
  'cleaner'
];

export const TEMPLATE_CATEGORIES = [
  { id: 'missed_call', name: 'Missed Call', description: 'Automatic responses to missed calls' },
  { id: 'after_hours', name: 'After Hours', description: 'Messages sent outside business hours' },
  { id: 'job_confirmation', name: 'Job Confirmation', description: 'Appointment confirmations' },
  { id: 'job_reminder', name: 'Job Reminder', description: 'Appointment reminders' },
  { id: 'job_arrival', name: 'Arrival Notice', description: 'On my way notifications' },
  { id: 'job_completion', name: 'Job Complete', description: 'Work completion messages' },
  { id: 'follow_up', name: 'Follow Up', description: 'Post-job follow ups' },
  { id: 'quote', name: 'Quotes', description: 'Quote delivery and follow up' },
  { id: 'payment', name: 'Payment', description: 'Payment reminders and confirmations' }
];