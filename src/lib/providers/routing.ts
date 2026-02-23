import { VTUProvider, VTUResponse } from './base-provider'

// Re-export types
export type { VTUProvider, VTUResponse }

// Weighted routing for provider selection
export function selectProviderByWeight<T extends VTUProvider>(
  providers: T[]
): T | null {
  if (providers.length === 0) return null
  
  // Filter only active providers
  const activeProviders = providers.filter(p => p.isActive)
  if (activeProviders.length === 0) return null
  
  // Calculate total weight
  const totalWeight = activeProviders.reduce((sum, p) => sum + p.weight, 0)
  
  // Random selection based on weight
  let random = Math.random() * totalWeight
  for (const provider of activeProviders) {
    random -= provider.weight
    if (random <= 0) {
      return provider
    }
  }
  
  return activeProviders[activeProviders.length - 1]
}

// Fallback routing - try providers in sequence
export async function executeWithFallback<T extends VTUResponse>(
  providers: VTUProvider[],
  executeFn: (provider: VTUProvider) => Promise<T>,
  onFallback?: (provider: VTUProvider, error: Error) => void
): Promise<T> {
  const errors: Error[] = []
  
  for (const provider of providers) {
    if (!provider.isActive) continue
    
    try {
      const result = await executeFn(provider)
      if (result.success) {
        return result
      }
      // If provider returned failure, try next
      errors.push(new Error(result.error || 'Provider returned failure'))
      onFallback?.(provider, errors[errors.length - 1])
    } catch (error) {
      errors.push(error as Error)
      onFallback?.(provider, error as Error)
    }
  }
  
  // All providers failed
  throw new Error(`All providers failed. Last error: ${errors[errors.length - 1]?.message}`)
}

// Get provider by ID
export function getProviderById<T extends VTUProvider>(
  providers: T[],
  id: string
): T | undefined {
  return providers.find(p => p.id === id)
}

// Get providers by category
export function getProvidersByCategory<T extends VTUProvider>(
  providers: T[],
  category: string
): T[] {
  return providers.filter(p => p.category === category && p.isActive)
}

// Sort providers by weight (highest first)
export function sortByWeight<T extends VTUProvider>(providers: T[]): T[] {
  return [...providers].sort((a, b) => b.weight - a.weight)
}

// Calculate provider health score
export function calculateHealthScore(
  successRate: number,
  responseTime: number,
  maxResponseTime: number = 5000
): number {
  const successWeight = 0.7
  const speedWeight = 0.3
  
  const speedScore = Math.max(0, 1 - (responseTime / maxResponseTime))
  
  return (successRate * successWeight) + (speedScore * speedWeight)
}
