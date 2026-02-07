import { useEffect } from 'react'

export default function DiscordPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-samurai-black">
      {/* Discord Widget Embed */}
      <div className="w-full h-[calc(100vh-64px)]">
        <iframe
          src="https://discord.com/widget?id=YOUR_SERVER_ID&theme=dark"
          width="100%"
          height="100%"
          allowTransparency={true}
          frameBorder="0"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          title="Discord Server Widget"
          className="border-none"
        />
      </div>
    </div>
  )
}
