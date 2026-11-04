import { onMounted, watch } from 'vue'

export interface QuickReplyRecord { id: number; shortcut: string; label: string; category: string; text: string; active: boolean; usage: number }
export interface TemplateRecord { id: number; name: string; category: 'Marketing' | 'Utility' | 'Authentication'; language: string; status: 'Approved' | 'Pending' | 'Rejected'; body: string; variables: string[]; button: string }

export function useQuickReplyData() {
  const data = useState<QuickReplyRecord[]>('sumashdesk-quick-replies', () => [
    { id: 1, shortcut: '/hello', label: 'Welcome message', category: 'Greeting', text: 'Hello! Thank you for contacting us. How may we help you?', active: true, usage: 124 },
    { id: 2, shortcut: '/delivery', label: 'Delivery information', category: 'Delivery', text: 'Our team will confirm the delivery details shortly.', active: true, usage: 86 },
    { id: 3, shortcut: '/payment', label: 'Payment methods', category: 'Payment', text: 'We accept cash, bank transfer and supported mobile payments.', active: true, usage: 72 },
    { id: 4, shortcut: '/thanks', label: 'Thank you', category: 'General', text: 'Thank you for choosing us!', active: true, usage: 58 },
    { id: 5, shortcut: '/return', label: 'Return policy', category: 'Support', text: 'Please share your details so our team can assist with the return policy.', active: false, usage: 0 },
  ])
  if (import.meta.client) { onMounted(() => { const saved=localStorage.getItem('sumashdesk-quick-replies'); if(saved){try{data.value=JSON.parse(saved) as QuickReplyRecord[]}catch{localStorage.removeItem('sumashdesk-quick-replies')}} }); watch(data,value=>localStorage.setItem('sumashdesk-quick-replies',JSON.stringify(value)),{deep:true}) }
  return data
}

export function useTemplateData() {
  const data = useState<TemplateRecord[]>('sumashdesk-templates', () => [
    { id: 1, name: 'order_update', category: 'Utility', language: 'English', status: 'Approved', body: 'Hello {{1}}, your request {{2}} has been updated.', variables: ['Customer name', 'Reference'], button: 'View details' },
    { id: 2, name: 'welcome_customer', category: 'Marketing', language: 'English', status: 'Approved', body: 'Welcome {{1}}! Thank you for connecting with us.', variables: ['Customer name'], button: 'Explore' },
    { id: 3, name: 'payment_reminder', category: 'Utility', language: 'Bengali', status: 'Pending', body: 'প্রিয় {{1}}, আপনার পেমেন্টের বিষয়ে যোগাযোগ করছি।', variables: ['Customer name'], button: 'Contact us' },
    { id: 4, name: 'login_code', category: 'Authentication', language: 'English', status: 'Approved', body: 'Your verification code is {{1}}.', variables: ['Code'], button: 'Copy code' },
    { id: 5, name: 'old_promotion', category: 'Marketing', language: 'English', status: 'Rejected', body: 'Special offer for {{1}}.', variables: ['Customer name'], button: 'Shop now' },
  ])
  if (import.meta.client) { onMounted(() => { const saved=localStorage.getItem('sumashdesk-templates'); if(saved){try{data.value=JSON.parse(saved) as TemplateRecord[]}catch{localStorage.removeItem('sumashdesk-templates')}} }); watch(data,value=>localStorage.setItem('sumashdesk-templates',JSON.stringify(value)),{deep:true}) }
  return data
}
