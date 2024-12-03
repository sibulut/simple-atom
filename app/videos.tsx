// app/videos.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentAuthenticatedUser } from '../utils/auth'
import { getUserMetadata, updateUserMetadata, UserMetadata } from '../utils/dynamodb';

const videos = [
  { id: 1, title: 'Video 1', url: 'https://www.youtube.com/watch?v=vhb7B3i4r0k' },
  { id: 2, title: 'Video 2', url: 'https://www.youtube.com/watch?v=vhb7B3i4r0k' },
  { id: 3, title: 'Video 3', url: 'https://www.youtube.com/watch?v=vhb7B3i4r0k' },
]

type User = {
  email: string;
  fullName: string;
}

export default function Videos() {
  const [user, setUser] = useState<User | null>(null)
  const [metadata, setMetadata] = useState<UserMetadata | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentAuthenticatedUser()
        const userMetadata = await getUserMetadata(currentUser.userId, currentUser.email)
        
        // Update user metadata with full name if it's not already set
        if (!userMetadata.userFullName) {
          const updatedMetadata = {
            ...userMetadata,
            userFullName: currentUser.fullName
          }
          await updateUserMetadata(currentUser.userId, currentUser.email, updatedMetadata)
          setMetadata(updatedMetadata)
        } else {
          setMetadata(userMetadata)
        }
        
        setUser({ 
          email: currentUser.email, 
          fullName: userMetadata.userFullName || currentUser.fullName || currentUser.email 
        })
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/sign')
      }
    }
    checkAuth()
  }, [router])

  const handleWatchVideo = async (videoId: number) => {
    if (!user || !metadata) return;
    const updatedMetadata: UserMetadata = {
      ...metadata,
      videosWatched: [...metadata.videosWatched, videoId],
      vwCount: metadata.vwCount + 1,
    }
    await updateUserMetadata(metadata.id, metadata.user_name_str, updatedMetadata)
    setMetadata(updatedMetadata)
  }

  const handleRateVideo = async (videoId: number, rating: number) => {
    if (!user || !metadata) return;
    const updatedMetadata: UserMetadata = {
      ...metadata,
      videoRatings: { ...metadata.videoRatings, [videoId]: rating },
    }
    await updateUserMetadata(metadata.id, metadata.user_name_str, updatedMetadata)
    setMetadata(updatedMetadata)
  }

  if (!user || !metadata) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Welcome, {user.fullName}!
        </h1>
        <p className="mb-4 text-center">Total videos watched: {metadata.vwCount}</p>
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-800">Featured Interactive Stories</h2>
        <div className="text-center mt-4 text-sm text-gray-600">User metadata is stored in Amazon DynamoDB tables in AWS.</div>
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="border p-4 rounded shadow-md">
              <h2 className="text-xl font-bold mb-2">{video.title}</h2>
              <button
                onClick={() => handleWatchVideo(video.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-300 ease-in-out"
              >
                Watch Video
              </button>
              <div className="mt-4">
                <p className="mb-2">Rate this video:</p>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRateVideo(video.id, rating)}
                      className={`px-3 py-1 rounded ${
                        metadata.videoRatings[video.id] === rating
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      } transition duration-300 ease-in-out`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}