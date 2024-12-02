'use client'

import { useParams } from 'next/navigation'
import Sign from '../sign'
import Videos from '../videos'

export default function DynamicPage() {
  const params = useParams()
  const slug = params.slug as string[]

  if (slug[0] === 'sign') {
    return <Sign />
  } else if (slug[0] === 'videos') {
    return <Videos />
  } else {
    return <div>404 - Page not found</div>
  }
}