'use client'

import Image from 'next/image'
import { PulsingLeaf } from '@/features/ui/PulsingLeaf'

export default function LoadingComponent() {
  return (
    <div className="min-h-screen jungle-gradient flex flex-col items-center justify-center pt-16">
      {/* Main Loading Content */}
      <div className="flex flex-col items-center space-y-8 relative">
        {/* Floating Leaves Background */}
        <div className="absolute inset-0 pointer-events-none">
          <PulsingLeaf 
            size="large"
            color="text-cream/40"
            rotation={15}
            animationDelay="0s"
            className="absolute -top-12 -left-8"
          />
          <PulsingLeaf 
            size="medium"
            color="text-light-green/60"
            rotation={-25}
            animationDelay="0.5s"
            className="absolute -top-6 right-4"
          />
          <PulsingLeaf 
            size="large"
            color="text-gold/50"
            rotation={45}
            animationDelay="1s"
            className="absolute bottom-8 -left-6"
          />
          <PulsingLeaf 
            size="medium"
            color="text-cream/30"
            rotation={-10}
            animationDelay="1.5s"
            className="absolute bottom-2 right-8"
          />
          <PulsingLeaf 
            size="small"
            color="text-gold/70"
            rotation={30}
            animationDelay="2s"
            className="absolute top-4 left-16"
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="relative w-24 h-24 mb-4">
            <Image
              src="/logo_wellness.jpeg"
              alt="Wellness Needles Logo"
              fill
              className="rounded-full object-cover ring-4 ring-cream/30 shadow-lg animate-pulse"
            />
          </div>
          
          {/* Brand Name */}
          <h2 className="text-2xl font-serif font-semibold text-cream text-center">
            Wellness Needles
          </h2>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2 relative z-10">
          <p className="text-lg text-cream/90 animate-pulse">Loading...</p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-cream rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-cream/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-cream/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        {/* Skeleton Content */}
        <div className="w-full max-w-4xl space-y-6 mt-12 relative z-10">
          {/* Hero Section Skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-cream/20 rounded-lg animate-pulse"></div>
            <div className="h-6 bg-cream/15 rounded-lg animate-pulse w-3/4 mx-auto"></div>
            <div className="h-4 bg-cream/10 rounded-lg animate-pulse w-1/2 mx-auto"></div>
          </div>

          {/* Content Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-cream/10 rounded-xl p-6 space-y-4 animate-pulse">
                <div className="w-12 h-12 bg-cream/30 rounded-full"></div>
                <div className="h-6 bg-cream/25 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-cream/20 rounded w-full"></div>
                  <div className="h-4 bg-cream/20 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Content Lines */}
          <div className="space-y-3 mt-8">
            <div className="h-4 bg-cream/15 rounded animate-pulse"></div>
            <div className="h-4 bg-cream/10 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-cream/5 rounded animate-pulse w-4/5"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
