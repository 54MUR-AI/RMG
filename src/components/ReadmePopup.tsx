import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface ReadmePopupProps {
  title: string
  readmeUrl: string
  onClose: () => void
}

export default function ReadmePopup({ title, readmeUrl, onClose }: ReadmePopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 100)
    
    // Fetch README content
    fetch(readmeUrl)
      .then(res => res.text())
      .then(text => {
        setContent(text)
        setLoading(false)
      })
      .catch(() => {
        setContent('# Error\n\nFailed to load README content.')
        setLoading(false)
      })
  }, [readmeUrl])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(10, 10, 10, 0.9)' }}
      onClick={handleClose}
    >
      <div 
        className={`relative max-w-4xl w-full h-[95vh] bg-samurai-grey-darker border-2 border-samurai-red rounded-2xl shadow-2xl shadow-samurai-red/50 transform transition-all duration-300 overflow-hidden flex flex-col ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-samurai-grey-darker border-b-2 border-samurai-red p-4 sm:p-6 flex items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-samurai-red uppercase neon-text truncate">{title} README</h2>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-2 text-white hover:text-samurai-red transition-colors rounded-lg hover:bg-samurai-red/10"
            aria-label="Close"
          >
            <X size={24} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-samurai-red border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="prose prose-invert prose-red max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-4xl font-black text-samurai-red mb-4 uppercase" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />,
                  p: ({node, ...props}) => <p className="text-white mb-4 leading-relaxed text-base" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside text-white mb-4 space-y-2 ml-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside text-white mb-4 space-y-2 ml-4" {...props} />,
                  li: ({node, ...props}) => <li className="text-white" {...props} />,
                  code: ({node, inline, ...props}: any) => 
                    inline ? 
                      <code className="bg-black/60 px-2 py-1 rounded text-samurai-red font-mono text-sm border border-samurai-red/30" {...props} /> :
                      <code className="block bg-black/60 p-4 rounded-lg text-white font-mono text-sm overflow-x-auto mb-4 border border-samurai-red/30" {...props} />,
                  pre: ({node, ...props}) => <pre className="bg-black/60 p-4 rounded-lg overflow-x-auto mb-4 border border-samurai-red/30" {...props} />,
                  a: ({node, ...props}) => <a className="text-samurai-red hover:text-white underline font-semibold" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-samurai-red pl-4 italic text-white/90 my-4" {...props} />,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
