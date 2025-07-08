"use client"

import { Play, Clock, Eye } from "lucide-react"

interface VideoPlaceholderProps {
  title?: string
  description?: string
  duration?: string
  viewCount?: number
  size?: "small" | "medium" | "large"
  onClick?: () => void
}

export function VideoPlaceholder({
  title = "Video Edukasi",
  description = "Video akan segera tersedia untuk membantu Anda memahami materi dengan lebih baik.",
  duration,
  viewCount,
  size = "medium",
  onClick,
}: VideoPlaceholderProps) {
  const sizeClasses = {
    small: "aspect-video",
    medium: "aspect-video",
    large: "aspect-video min-h-[300px]",
  }

  const iconSizes = {
    small: "h-8 w-8",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center ${
        onClick ? "cursor-pointer hover:from-gray-200 hover:to-gray-300 transition-colors" : ""
      }`}
      onClick={onClick}
    >
      <div className="text-center p-4">
        <div className="relative mb-4">
          <Play className={`${iconSizes[size]} text-gray-400 mx-auto`} />
          {size === "large" && <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full animate-pulse" />}
        </div>
        <h4 className={`font-medium text-gray-600 mb-2 ${size === "small" ? "text-sm" : "text-lg"}`}>{title}</h4>
        <p
          className={`text-gray-500 ${size === "small" ? "text-xs" : "text-sm"} ${size === "large" ? "max-w-md mx-auto" : ""}`}
        >
          {description}
        </p>
        {(duration || viewCount !== undefined) && (
          <div className="flex items-center justify-center space-x-4 mt-3 text-xs text-gray-400">
            {duration && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {duration}
              </div>
            )}
            {viewCount !== undefined && (
              <div className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {viewCount}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
