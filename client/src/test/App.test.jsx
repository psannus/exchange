import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../views/App.jsx'

global.fetch = vi.fn()

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the crypto rates application', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ['TON', 'BTC']
    })
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        redis: { status: 'UP' },
        database: { status: 'UP' },
        services: {}
      })
    })

    render(<App />)
    
    expect(screen.getByText('Crypto Rates')).toBeInTheDocument()
    expect(screen.getByText('Real-time™ cryptocurrency price tracking')).toBeInTheDocument()
    expect(screen.getByText('Configuration')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/tokens')
      expect(fetch).toHaveBeenCalledWith('/api/status')
    })
  })

  it('handles API errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'))

    render(<App />)
    
    expect(screen.getByText('Crypto Rates')).toBeInTheDocument()
  })
})
