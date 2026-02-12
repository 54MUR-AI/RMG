import { useState, useRef, useEffect } from 'react'
import { X, Send, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ModalPortal from './ModalPortal'

interface QuickDMModalProps {
  isOpen: boolean
  onClose: () => void
  senderId: string
  recipientId: string
  recipientName: string
  recipientAvatarUrl?: string | null
  recipientAvatarColor?: string | null
}

export default function QuickDMModal({
  isOpen,
  onClose,
  senderId,
  recipientId,
  recipientName,
  recipientAvatarUrl,
  recipientAvatarColor
}: QuickDMModalProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      setMessage('')
      setSent(false)
      setError('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!message.trim() || isSending) return

    setIsSending(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('wspr_direct_messages')
        .insert({
          sender_id: senderId,
          recipient_id: recipientId,
          content: message.trim(),
          is_encrypted: false
        })

      if (insertError) {
        console.error('Error sending DM:', insertError)
        setError('Failed to send message. Please try again.')
        setIsSending(false)
        return
      }

      setSent(true)
      setIsSending(false)

      // Auto-close after a brief success state
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Send DM error:', err)
      setError('Failed to send message. Please try again.')
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  const avatarColor = recipientAvatarColor || '#E63946'

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10001] p-4">
        <div className="bg-samurai-grey-darker rounded-xl w-full max-w-lg border-2 border-samurai-red shadow-2xl shadow-samurai-red/20">
          {/* Header */}
          <div className="p-4 border-b border-samurai-grey-dark flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-samurai-red" />
              <span className="text-white font-semibold">Quick Message</span>
            </div>
            <button
              onClick={onClose}
              className="text-samurai-steel hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Recipient */}
          <div className="px-4 pt-4 flex items-center gap-3">
            <span className="text-samurai-steel text-sm">To:</span>
            {recipientAvatarUrl ? (
              <img
                src={recipientAvatarUrl}
                alt={recipientName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: avatarColor }}
              >
                {recipientName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-white font-semibold">{recipientName}</span>
          </div>

          {/* Message Input */}
          <div className="p-4">
            {sent ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <p className="text-green-400 font-semibold">Message sent!</p>
                <p className="text-samurai-steel text-sm mt-1">
                  {recipientName} will see it in WSPR
                </p>
              </div>
            ) : (
              <>
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Write a message to ${recipientName}...`}
                  rows={4}
                  className="w-full bg-samurai-black border border-samurai-grey-dark rounded-lg text-white placeholder-samurai-steel p-3 resize-none focus:outline-none focus:border-samurai-red transition-colors"
                />
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-samurai-steel">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                    className="flex items-center gap-2 px-5 py-2 bg-samurai-red hover:bg-samurai-red-dark disabled:bg-samurai-grey-dark disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                  >
                    <Send size={16} />
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
