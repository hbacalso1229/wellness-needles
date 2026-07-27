import React from 'react'

/**
 * Utility function to simulate loading delay for testing loading components
 * This can be used in page components during development to test loading states
 */
export async function simulateLoading(ms: number = 2000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * HOC to wrap page components with loading simulation in development
 * Usage: export default withLoadingSimulation(YourPageComponent, 3000)
 */
export function withLoadingSimulation<T extends object>(
  Component: React.ComponentType<T>,
  delayMs: number = 2000
) {
  return function LoadingSimulatedComponent(props: T) {
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, delayMs)

      return () => clearTimeout(timer)
    }, [])

    if (isLoading && process.env.NODE_ENV === 'development') {
      // Return null to let Next.js loading.tsx handle the loading state
      return null
    }

    return React.createElement(Component, props)
  }
}
