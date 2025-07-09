// components/admin/CustomerCommunicationPanel.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Send, 
  Paperclip, 
  Clock, 
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Reply,
  Forward,
  Archive,
  Star,
  Tag
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  orderId: string
  type: 'email' | 'sms' | 'internal_note'
  direction: 'inbound' | 'outbound'
  subject?: string
  content: string
  sender: {
    name: string
    email: string
    role: 'customer' | 'admin'
  }
  recipient: {
    name: string
    email: string
  }
  status: 'sent' | 'delivered' | 'read' | 'failed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  tags: string[]
  attachments?: Array<{
    name: string
    url: string
    size: number
  }>
  createdAt: string
  readAt?: string
}

interface CommunicationPanelProps {
  orderId: string
  customerEmail: string
  customerName?: string
}

export default function CustomerCommunicationPanel({ 
  orderId, 
  customerEmail, 
  customerName 
}: CommunicationPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [composing, setComposing] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'email' | 'sms' | 'notes'>('all')
  
  // Compose form state
  const [composeForm, setComposeForm] = useState({
    type: 'email' as 'email' | 'sms' | 'internal_note',
    subject: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    tags: [] as string[],
    template: ''
  })
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    priority: 'all',
    status: 'all',
    dateRange: 'all'
  })

  const [templates] = useState([
    {
      id: 'order_update',
      name: 'Order Update',
      subject: 'Update on your order #{orderNumber}',
      content: `Hi {customerName},

I wanted to give you a quick update on your order #{orderNumber}.

{updateMessage}

If you have any questions, please don't hesitate to reach out.

Best regards,
{agentName}`
    },
    {
      id: 'shipping_delay',
      name: 'Shipping Delay',
      subject: 'Shipping delay for order #{orderNumber}',
      content: `Hi {customerName},

I'm writing to inform you that there will be a slight delay with your order #{orderNumber}.

{delayReason}

We expect to ship your order by {newShipDate}. We apologize for any inconvenience.

Best regards,
{agentName}`
    },
    {
      id: 'follow_up',
      name: 'Follow Up',
      subject: 'Following up on your order #{orderNumber}',
      content: `Hi {customerName},

I hope you're enjoying your recent purchase from order #{orderNumber}!

{followUpMessage}

Thank you for choosing us!

Best regards,
{agentName}`
    }
  ])

  useEffect(() => {
    fetchMessages()
  }, [orderId])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      // Simulated API call
      const mockMessages: Message[] = [
        {
          id: '1',
          orderId,
          type: 'email',
          direction: 'outbound',
          subject: 'Order Confirmation',
          content: 'Thank you for your order! We\'ve received your order and are processing it now.',
          sender: { name: 'System', email: 'noreply@store.com', role: 'admin' },
          recipient: { name: customerName || 'Customer', email: customerEmail },
          status: 'delivered',
          priority: 'normal',
          tags: ['order-confirmation', 'automated'],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          orderId,
          type: 'email',
          direction: 'inbound',
          subject: 'Question about my order',
          content: 'Hi, I was wondering when my order will ship? Thanks!',
          sender: { name: customerName || 'Customer', email: customerEmail, role: 'customer' },
          recipient: { name: 'Support', email: 'support@store.com' },
          status: 'read',
          priority: 'normal',
          tags: ['question', 'shipping'],
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!composeForm.content.trim()) {
      toast.error('Message content is required')
      return
    }

    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        orderId,
        type: composeForm.type,
        direction: 'outbound',
        subject: composeForm.subject,
        content: composeForm.content,
        sender: { name: 'Support Agent', email: 'support@store.com', role: 'admin' },
        recipient: { name: customerName || 'Customer', email: customerEmail },
        status: 'sent',
        priority: composeForm.priority,
        tags: composeForm.tags,
        createdAt: new Date().toISOString()
      }

      setMessages(prev => [newMessage, ...prev])
      setComposeForm({
        type: 'email',
        subject: '',
        content: '',
        priority: 'normal',
        tags: [],
        template: ''
      })
      setComposing(false)
      toast.success('Message sent successfully')
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setComposeForm(prev => ({
        ...prev,
        subject: template.subject.replace('{orderNumber}', orderId.slice(-8)),
        content: template.content
          .replace('{customerName}', customerName || 'Customer')
          .replace('{orderNumber}', orderId.slice(-8))
          .replace('{agentName}', 'Support Team'),
        template: templateId
      }))
    }
  }

  const getMessageIcon = (type: string, direction: string) => {
    if (type === 'email') return <Mail className="w-4 h-4" />
    if (type === 'sms') return <MessageSquare className="w-4 h-4" />
    return <MessageSquare className="w-4 h-4" />
  }

  const getStatusColor = (status: string) => {
    const colors = {
      sent: 'text-blue-600',
      delivered: 'text-green-600',
      read: 'text-green-700',
      failed: 'text-red-600'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-yellow-100 text-yellow-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredMessages = messages.filter(message => {
    if (activeTab !== 'all' && message.type !== activeTab) return false
    if (filters.search && !message.content.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.priority !== 'all' && message.priority !== filters.priority) return false
    if (filters.status !== 'all' && message.status !== filters.status) return false
    return true
  })

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Customer Communication
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {customerEmail} • {messages.length} messages
            </p>
          </div>
          
          <button
            onClick={() => setComposing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" />
            New Message
          </button>
        </div>
      </div>

      <div className="flex h-96">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 py-3">
              {[
                { id: 'all', label: 'All', count: messages.length },
                { id: 'email', label: 'Email', count: messages.filter(m => m.type === 'email').length },
                { id: 'sms', label: 'SMS', count: messages.filter(m => m.type === 'sms').length },
                { id: 'notes', label: 'Notes', count: messages.filter(m => m.type === 'internal_note').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-sm font-medium ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search messages..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Status</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="read">Read</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredMessages.map(message => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {getMessageIcon(message.type, message.direction)}
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className={getStatusColor(message.status)}>
                          {message.status === 'delivered' && <CheckCircle className="w-3 h-3" />}
                          {message.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                        </span>
                        <Clock className="w-3 h-3 ml-1" />
                        <span className="ml-1">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <User className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {message.direction === 'inbound' ? message.sender.name : `To: ${message.recipient.name}`}
                      </span>
                    </div>
                    
                    {message.subject && (
                      <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                        {message.subject}
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {message.content}
                    </p>
                    
                    {message.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {message.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{message.tags.length - 2} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="flex-1 flex flex-col">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getMessageIcon(selectedMessage.type, selectedMessage.direction)}
                    <span className="ml-2 font-medium">
                      {selectedMessage.direction === 'inbound' ? 'From' : 'To'}: {
                        selectedMessage.direction === 'inbound' 
                          ? selectedMessage.sender.name 
                          : selectedMessage.recipient.name
                      }
                    </span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getPriorityColor(selectedMessage.priority)}`}>
                      {selectedMessage.priority}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Reply className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Forward className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {selectedMessage.subject && (
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedMessage.subject}
                  </h3>
                )}
                
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                  {selectedMessage.readAt && (
                    <>
                      <span className="mx-2">•</span>
                      <Eye className="w-4 h-4 mr-1" />
                      Read {new Date(selectedMessage.readAt).toLocaleString()}
                    </>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-900">
                    {selectedMessage.content}
                  </div>
                </div>
                
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedMessage.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                          <Paperclip className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{attachment.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({(attachment.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Reply */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setComposing(true)
                      setComposeForm(prev => ({
                        ...prev,
                        subject: `Re: ${selectedMessage.subject || 'Message'}`,
                        content: `\n\n--- Original Message ---\n${selectedMessage.content}`
                      }))
                    }}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </button>
                  
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    <Forward className="w-4 h-4 mr-1" />
                    Forward
                  </button>
                  
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    <Archive className="w-4 h-4 mr-1" />
                    Archive
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {composing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">New Message</h3>
                <button
                  onClick={() => setComposing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Message Type and Template */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={composeForm.type}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="internal_note">Internal Note</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                    <select
                      value={composeForm.template}
                      onChange={(e) => applyTemplate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No template</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Subject and Priority */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={composeForm.subject}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Message subject..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={composeForm.priority}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={composeForm.content}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message..."
                  />
                </div>
                
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    placeholder="Add tags (comma separated)"
                    onChange={(e) => setComposeForm(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setComposing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 inline mr-1" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}