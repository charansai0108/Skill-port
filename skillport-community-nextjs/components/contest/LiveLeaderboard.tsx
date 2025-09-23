'use client'

import { useState, useEffect } from 'react'
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react'
import { useContestSocket } from '@/lib/hooks/useSocket'

interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  score: number
  problemsSolved: number
}

interface LiveLeaderboardProps {
  contestId: string
  token: string | null
  currentUserId?: string
}

export function LiveLeaderboard({ contestId, token, currentUserId }: LiveLeaderboardProps) {
  const { leaderboard, connected } = useContestSocket(contestId, token)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    if (leaderboard.length > 0) {
      setLastUpdate(new Date())
    }
  }, [leaderboard])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">
          {rank}
        </span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Live Leaderboard</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{connected ? 'Live' : 'Offline'}</span>
              <span>•</span>
              <span>{leaderboard.length} participants</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">Last updated</div>
          <div className="text-sm font-medium text-gray-900">
            {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No participants yet</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                entry.userId === currentUserId 
                  ? 'ring-2 ring-blue-500 shadow-md' 
                  : 'hover:shadow-md'
              } ${getRankColor(entry.rank)}`}
            >
              {/* Rank */}
              <div className="flex-shrink-0">
                {getRankIcon(entry.rank)}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {entry.userName}
                  </h3>
                  {entry.userId === currentUserId && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {entry.score} points
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {entry.problemsSolved} solved
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {entry.score}
                </div>
                <div className="text-sm text-gray-500">points</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Live Updates Indicator */}
      {connected && leaderboard.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live updates enabled</span>
          </div>
        </div>
      )}
    </div>
  )
}
