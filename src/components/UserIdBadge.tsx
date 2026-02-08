import { useEffect, useState } from 'react'
import { getUserIdNumber } from '../lib/userTracking'

interface UserIdBadgeProps {
  userId: string
}

export default function UserIdBadge({ userId }: UserIdBadgeProps) {
  const [userIdNumber, setUserIdNumber] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserId() {
      const idNumber = await getUserIdNumber(userId)
      setUserIdNumber(idNumber)
      setLoading(false)
    }
    fetchUserId()
  }, [userId])

  if (loading || userIdNumber === null) return null

  return (
    <span className="px-2 py-0.5 bg-samurai-red/20 border border-samurai-red/50 rounded text-xs text-samurai-red font-mono">
      #{userIdNumber.toString().padStart(4, '0')}
    </span>
  )
}
