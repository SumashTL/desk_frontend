export type ConversationStatus = 'Open' | 'Pending' | 'Resolved'
export type Priority = 'Low' | 'Normal' | 'High'
export interface Agent { id: number; name: string; initials: string; color: string; status: 'Online' | 'Busy' | 'Offline'; role: 'Admin' | 'Manager' | 'Agent' }
export interface Contact { id: number; name: string; phone: string; email: string; company: string; avatar: string; color: string; tags: string[]; optedIn: boolean; firstContact: string; lastInteraction: string; notes: string }
export interface ChatMessage { id: number; text: string; direction: 'in' | 'out' | 'note'; time: string; status?: 'Sent' | 'Delivered' | 'Read' | 'Failed'; kind?: 'text' | 'image' | 'video' | 'audio' | 'document'; fileName?: string; author?: string }
export interface Conversation { id: number; contactId: number; name: string; phone: string; avatar: string; color: string; preview: string; time: string; unread: number; assigned: number | null; status: ConversationStatus; priority: Priority; tags: string[]; waiting: string; windowHours: number; messages: ChatMessage[]; viewers: string[] }
