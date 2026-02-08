import { useEffect } from 'react'

export default function ScraperPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="bg-samurai-black">
      {/* Fullscreen iframe */}
      <iframe
        src="https://scraper-frontend-3hnj.onrender.com"
        className="w-full h-screen border-none"
        title="SCRP - Smart Content Retrieval & Processing"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}
