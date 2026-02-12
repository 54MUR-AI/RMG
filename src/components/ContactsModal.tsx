import { useState, useEffect } from 'react'
import { X, Search, UserPlus, Check, Clock, Ban, Trash2, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  getContacts,
  getPendingRequests,
  searchUsers,
  sendContactRequest,
  acceptContactRequest,
  declineContactRequest,
  removeContact
} from '../lib/contacts'
import type { Contact, PendingRequest, SearchResult } from '../lib/contacts'

interface ContactsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactsModal({ isOpen, onClose }: ContactsModalProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'contacts' | 'search' | 'pending'>('contacts')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      loadContacts()
      loadPendingRequests()
    }
  }, [isOpen, user])

  const loadContacts = async () => {
    if (!user) return
    setIsLoading(true)
    const data = await getContacts(user.id)
    setContacts(data)
    setIsLoading(false)
  }

  const loadPendingRequests = async () => {
    if (!user) return
    const data = await getPendingRequests(user.id)
    setPendingRequests(data)
  }

  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const results = await searchUsers(searchQuery, user.id)
    setSearchResults(results)
    setIsSearching(false)
  }

  const handleSendRequest = async (contactId: string) => {
    if (!user) return
    const success = await sendContactRequest(user.id, contactId)
    if (success) {
      handleSearch() // Refresh search results
    }
  }

  const handleAcceptRequest = async (requestId: string, senderId: string) => {
    if (!user) return
    const success = await acceptContactRequest(requestId, user.id, senderId)
    if (success) {
      loadPendingRequests()
      loadContacts()
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    const success = await declineContactRequest(requestId)
    if (success) {
      loadPendingRequests()
    }
  }

  const handleRemoveContact = async (contactId: string) => {
    if (!user) return
    if (!confirm('Remove this contact? You can always add them again later.')) {
      return
    }
    const success = await removeContact(user.id, contactId)
    if (success) {
      loadContacts()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-samurai-black-lighter rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col border-2 border-samurai-red shadow-2xl shadow-samurai-red/20">
        {/* Header */}
        <div className="p-6 border-b border-samurai-grey-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-samurai-red" />
              <h2 className="text-2xl font-bold text-white">Contacts</h2>
            </div>
            <button
              onClick={onClose}
              className="text-samurai-steel hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'contacts'
                  ? 'bg-samurai-red text-white'
                  : 'bg-samurai-black text-samurai-steel hover:text-white'
              }`}
            >
              My Contacts ({contacts.length})
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'search'
                  ? 'bg-samurai-red text-white'
                  : 'bg-samurai-black text-samurai-steel hover:text-white'
              }`}
            >
              Find Contacts
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors relative ${
                activeTab === 'pending'
                  ? 'bg-samurai-red text-white'
                  : 'bg-samurai-black text-samurai-steel hover:text-white'
              }`}
            >
              Pending Requests
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-black text-xs rounded-full flex items-center justify-center font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* My Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-samurai-red border-t-transparent"></div>
                <p className="text-samurai-steel mt-4">Loading contacts...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-samurai-steel mx-auto mb-4 opacity-50" />
                <p className="text-samurai-steel mb-4">No contacts yet</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-6 py-3 bg-samurai-red hover:bg-samurai-red-dark text-white rounded-lg font-semibold transition-colors"
                >
                  Find Contacts
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.contact_id}
                    className="flex items-center justify-between p-4 bg-samurai-black rounded-lg border border-samurai-grey-dark hover:border-samurai-steel transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {contact.contact_avatar_url ? (
                        <img
                          src={contact.contact_avatar_url}
                          alt={contact.contact_display_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: contact.contact_avatar_color || '#E63946' }}
                        >
                          {contact.contact_display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold text-lg">{contact.contact_display_name}</p>
                        <p className="text-sm text-samurai-steel">{contact.contact_email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveContact(contact.contact_id)}
                      className="flex items-center gap-2 px-4 py-2 text-samurai-steel hover:text-samurai-red hover:bg-samurai-red/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <>
            <div className="p-6 border-b border-samurai-grey-dark">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-samurai-steel" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by email or name..."
                    className="w-full pl-10 pr-4 py-3 bg-samurai-black border border-samurai-grey-dark rounded-lg text-white placeholder-samurai-steel focus:outline-none focus:border-samurai-red transition-colors"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-6 py-3 bg-samurai-red hover:bg-samurai-red-dark text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Search
                </button>
              </div>
              <p className="text-sm text-samurai-steel mt-2">
                Search all RMG users to add as contacts
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isSearching ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-samurai-red border-t-transparent"></div>
                  <p className="text-samurai-steel mt-4">Searching...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-samurai-steel mx-auto mb-4 opacity-50" />
                  <p className="text-samurai-steel">
                    {searchQuery ? 'No users found' : 'Enter a name or email to search'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.user_id}
                      className="flex items-center justify-between p-4 bg-samurai-black rounded-lg border border-samurai-grey-dark hover:border-samurai-steel transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {result.avatar_url ? (
                          <img
                            src={result.avatar_url}
                            alt={result.display_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: result.avatar_color || '#E63946' }}
                          >
                            {result.display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-semibold">{result.display_name}</p>
                          <p className="text-sm text-samurai-steel">{result.email}</p>
                        </div>
                      </div>

                      {result.contact_status === 'accepted' ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <Check size={18} />
                          <span className="text-sm font-semibold">Connected</span>
                        </div>
                      ) : result.contact_status === 'pending' ? (
                        <div className="flex items-center gap-2 text-yellow-500">
                          <Clock size={18} />
                          <span className="text-sm font-semibold">Pending</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(result.user_id)}
                          className="flex items-center gap-2 px-4 py-2 bg-samurai-red hover:bg-samurai-red-dark text-white rounded-lg font-semibold transition-colors"
                        >
                          <UserPlus size={18} />
                          Add Contact
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Pending Requests Tab */}
        {activeTab === 'pending' && (
          <div className="flex-1 overflow-y-auto p-6">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-samurai-steel mx-auto mb-4 opacity-50" />
                <p className="text-samurai-steel">No pending contact requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((request) => (
                  <div
                    key={request.request_id}
                    className="flex items-center justify-between p-4 bg-samurai-black rounded-lg border border-yellow-500/30 hover:border-yellow-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {request.sender_avatar_url ? (
                        <img
                          src={request.sender_avatar_url}
                          alt={request.sender_display_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: request.sender_avatar_color || '#E63946' }}
                        >
                          {request.sender_display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold">{request.sender_display_name}</p>
                        <p className="text-sm text-samurai-steel">Wants to connect</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.request_id, request.sender_id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        <Check size={18} />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.request_id)}
                        className="flex items-center gap-2 px-4 py-2 bg-samurai-grey-dark hover:bg-samurai-steel text-white rounded-lg font-semibold transition-colors"
                      >
                        <Ban size={18} />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
