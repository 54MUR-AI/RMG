import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface ReadmePopupProps {
  readmeUrl: string
  onClose: () => void
}

export default function ReadmePopup({ readmeUrl, onClose }: ReadmePopupProps) {
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
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${
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
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 text-white hover:text-samurai-red transition-colors rounded-lg hover:bg-samurai-red/10 bg-samurai-grey-darker/80 backdrop-blur-sm"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-samurai-red border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="prose prose-invert prose-red max-w-none [&_*]:!text-white [&_h1]:!text-samurai-red [&_h2]:!text-white [&_h3]:!text-white [&_code]:!text-samurai-red [&_a]:!text-samurai-red [&_strong]:!text-white [&_em]:!text-white/90 [&_th]:!text-white [&_td]:!text-white">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-4xl font-black text-samurai-red mb-4 uppercase" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />,
                  h4: ({node, ...props}) => <h4 className="text-xl font-bold text-white mt-4 mb-2" {...props} />,
                  h5: ({node, ...props}) => <h5 className="text-lg font-bold text-white mt-3 mb-2" {...props} />,
                  h6: ({node, ...props}) => <h6 className="text-base font-bold text-white mt-2 mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="text-white mb-4 leading-relaxed text-base" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside text-white mb-4 space-y-2 ml-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside text-white mb-4 space-y-2 ml-4" {...props} />,
                  li: ({node, ...props}) => <li className="text-white" {...props} />,
                  strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                  em: ({node, ...props}) => <em className="text-white/90 italic" {...props} />,
                  code: ({node, inline, ...props}: any) => 
                    inline ? 
                      <code className="bg-black/60 px-2 py-1 rounded text-samurai-red font-mono text-sm border border-samurai-red/30" {...props} /> :
                      <code className="block bg-black/60 p-4 rounded-lg text-white font-mono text-sm overflow-x-auto mb-4 border border-samurai-red/30" {...props} />,
                  pre: ({node, ...props}) => <pre className="bg-black/60 p-4 rounded-lg overflow-x-auto mb-4 border border-samurai-red/30 text-white" {...props} />,
                  a: ({node, ...props}) => <a className="text-samurai-red hover:text-white underline font-semibold" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-samurai-red pl-4 italic text-white/90 my-4" {...props} />,
                  table: ({node, ...props}) => <table className="min-w-full border-collapse border border-samurai-red/30 my-4 text-white" {...props} />,
                  thead: ({node, ...props}) => <thead className="bg-samurai-red/20 text-white" {...props} />,
                  tbody: ({node, ...props}) => <tbody className="text-white" {...props} />,
                  tr: ({node, ...props}) => <tr className="border-b border-samurai-red/30 text-white" {...props} />,
                  th: ({node, ...props}) => <th className="border border-samurai-red/30 px-4 py-2 text-left font-bold text-white" {...props} />,
                  td: ({node, ...props}) => <td className="border border-samurai-red/30 px-4 py-2 text-white" {...props} />,
                  hr: ({node, ...props}) => <hr className="border-samurai-red/50 my-6" {...props} />,
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
