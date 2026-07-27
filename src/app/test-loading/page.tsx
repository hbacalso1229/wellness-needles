import { simulateLoading } from '@/lib/loading-utils'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react'

export default async function TestLoading() {
  // Simulate a 5-second loading delay
  await simulateLoading(5000)

  return (
    <div className="min-h-screen bg-cream pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-accent mr-3" />
            <h1 className="font-serif text-4xl font-bold text-primary">
              Loading Test Complete!
            </h1>
          </div>
          <p className="text-lg text-secondary">
            You should have seen the loading component with the jungle gradient background,
            pulsating leaves, and skeleton content for about 5 seconds.
          </p>
        </div>

        {/* Test Info */}
        <div className="bg-accent/5 rounded-lg p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-primary mb-4">
            Test Information
          </h2>
          <div className="space-y-4 text-secondary">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Loading Duration:</p>
                <p>5 seconds (artificially simulated)</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Loading Features Tested:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Jungle gradient background</li>
                  <li>Wellness Needles logo with pulsing animation</li>
                  <li>Multiple pulsating leaves with different colors and rotations</li>
                  <li>Bouncing dots loading indicator</li>
                  <li>Skeleton content placeholders</li>
                  <li>Cream-colored text on dark gradient</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-primary/5 rounded-lg p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-primary mb-4">
            How to Test Loading on Other Pages
          </h2>
          <div className="space-y-4 text-secondary">
            <p>
              All routes now have loading components! To see them in action:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Navigate to any page using the header navigation</li>
              <li>The loading component will show automatically during route transitions</li>
              <li>On fast connections, the loading may be very brief</li>
              <li>You can throttle your network in browser dev tools to see longer loading times</li>
            </ol>
          </div>
        </div>

        {/* Test Again Button */}
        <div className="text-center space-y-4">
          <Link
            href="/test-loading"
            className="inline-flex items-center justify-center bg-gradient-to-r from-primary to-secondary text-cream px-8 py-3 rounded-full font-medium hover:from-secondary hover:to-primary transition-all duration-300 shadow-sm"
          >
            <Clock className="w-5 h-5 mr-2" />
            Test Loading Again
          </Link>
          
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center text-accent hover:text-primary font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-12 bg-secondary/5 rounded-lg p-8">
          <h3 className="font-serif text-xl font-semibold text-primary mb-4">
            Implementation Details
          </h3>
          <div className="bg-primary/10 rounded p-4 font-mono text-sm text-secondary">
            <p className="mb-2">{`// This page uses:`}</p>
            <p>await simulateLoading(5000)</p>
            <p className="mt-2 text-xs opacity-75">
              {`// All routes have loading.tsx files that automatically show the LoadingComponent`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
