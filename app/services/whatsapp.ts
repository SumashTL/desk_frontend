import type { Agent, Contact, Conversation, ConversationStatus, Priority, ChatMessage } from '~/types/whatsapp'
import { agents, contacts, conversations } from '~/data/mock'

/**
 * Frontend service contract. Replace the mock implementation with Django REST
 * Framework requests later; keep page components calling this interface.
 */
export interface WhatsAppService {
  getConversations(): Promise<Conversation[]>
  getContacts(): Promise<Contact[]>
  getAgents(): Promise<Agent[]>
  sendMessage(conversationId: number, message: ChatMessage): Promise<Conversation>
  assignConversation(conversationId: number, agentId: number | null): Promise<Conversation>
  updateConversation(conversationId: number, changes: Partial<Pick<Conversation, 'status' | 'priority'>>): Promise<Conversation>
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export const mockWhatsAppService: WhatsAppService = {
  async getConversations() { return clone(conversations) },
  async getContacts() { return clone(contacts) },
  async getAgents() { return clone(agents) },
  async sendMessage(conversationId, message) {
    const conversation = conversations.find(item => item.id === conversationId)
    if (!conversation) throw new Error('Conversation not found')
    conversation.messages.push(message)
    conversation.preview = message.text
    conversation.time = 'now'
    return clone(conversation)
  },
  async assignConversation(conversationId, agentId) {
    const conversation = conversations.find(item => item.id === conversationId)
    if (!conversation) throw new Error('Conversation not found')
    conversation.assigned = agentId
    return clone(conversation)
  },
  async updateConversation(conversationId, changes) {
    const conversation = conversations.find(item => item.id === conversationId)
    if (!conversation) throw new Error('Conversation not found')
    if (changes.status) conversation.status = changes.status as ConversationStatus
    if (changes.priority) conversation.priority = changes.priority as Priority
    return clone(conversation)
  },
}
