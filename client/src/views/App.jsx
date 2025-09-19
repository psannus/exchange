import { useState, useEffect } from 'react'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [baseCurrency, setBaseCurrency] = useState('TON')
  const [vsCurrency, setVsCurrency] = useState('USD')
  const [tokens, setTokens] = useState([])
  const [priceData, setPriceData] = useState(null)
  const [systemStatus, setSystemStatus] = useState(null)
  const [error, setError] = useState(null)

  // TODO: Get available vs currencies from backend as well
  // Jira ticket link? :) What does the team say, no TODO comments or how do you usually approach this?
  const vsCurrencies = ['USD', 'ETH']

  const mockHistory = [
    { date: '2025-09-18', price: 5.12, change: 1.23 },
    { date: '2025-09-17', price: 5.06, change: -0.87 },
    { date: '2025-09-16', price: 5.10, change: 0.45 },
    { date: '2025-09-15', price: 5.08, change: -1.12 },
    { date: '2025-09-14', price: 5.14, change: 2.34 }
  ]

  const fetchData = async (url, setter, errorMsg) => {
    try {
      const resp = await fetch(url)
      if (resp.ok) setter(await resp.json())
    } catch {
      setError(errorMsg)
    }
  }

  useEffect(() => {
    fetchData('/api/tokens', setTokens, 'Failed to fetch tokens')
  }, [])

  useEffect(() => {
    fetchData('/api/status', setSystemStatus, 'Failed to fetch system status')
    const interval = setInterval(() => fetchData('/api/status', setSystemStatus), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchData(`/api/tokens/${baseCurrency}`, setPriceData, 'Failed to fetch price data')
  }, [baseCurrency])

  const getCurrentSelectedPairPrice = () => {
    if (!priceData?.data) {
      return null
    }

    const quoteKey = vsCurrency.toLowerCase()

    return {
      price: priceData.data[quoteKey],
      change: priceData.data[`${quoteKey}_24h_change`],
      volume: priceData.data[`${quoteKey}_24h_vol`],
      timestamp: priceData.timestamp,
      provider: priceData.provider
    }
  }

  const currentPrice = getCurrentSelectedPairPrice()

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div className="row">
        <div className="six columns">
          <h1>Crypto Rates</h1>
          <p>Real-time™ cryptocurrency price tracking</p>
        </div>
        <div className="six columns" style={{ textAlign: 'right', paddingTop: '1.5rem' }}>
          <button
            className="button"
            onClick={() => setCurrentView(currentView === 'dashboard' ? 'config' : 'dashboard')}
          >
            {currentView === 'dashboard' ? 'Configuration' : 'Dashboard'}
          </button>
        </div>
      </div>

      <hr style={{ marginTop: 0 }} />

      {error && (
        <div className="row">
          <div className="twelve columns">
            <div style={{ padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '1rem' }}>
              {error}
            </div>
          </div>
        </div>
      )}

      {currentView === 'dashboard' ? (
        <div>
          {/* Currency Selection */}
          <div className="row">
            <div className="six columns">
              <h3>Select Base Currency</h3>
              <label htmlFor="baseCurrencySelect">Base Currency:</label>
              <select
                className="u-full-width"
                id="baseCurrencySelect"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
              >
                {tokens.length > 0 ? (
                  tokens.map(token => (
                    <option key={token} value={token}>{token}</option>
                  ))
                ) : (
                  <>
                    <option value="TON">TON</option>
                    <option value="USDT">USDT</option>
                  </>
                )}
              </select>
            </div>
            <div className="six columns">
              <h3>Compare Against</h3>
              <label htmlFor="vsCurrencySelect">VS Currency:</label>
              <select
                className="u-full-width"
                id="vsCurrencySelect"
                value={vsCurrency}
                onChange={(e) => setVsCurrency(e.target.value)}
              >
                {vsCurrencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Price */}
          <div className="row" style={{ marginTop: '2rem' }}>
            <div className="twelve columns">
              <h3>{baseCurrency}/{vsCurrency}</h3>
              {currentPrice ? (
                <table className="u-full-width">
                  <thead>
                    <tr>
                      <th>Price</th>
                      <th>24h Change</th>
                      <th>24h Volume</th>
                      <th>Last Updated</th>
                      <th>Provider</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>{currentPrice.price?.toFixed(6) || '-'}</strong></td>
                      <td style={{ color: (currentPrice.change || 0) >= 0 ? '#4CAF50' : '#f44336' }}>
                        {(currentPrice.change || 0) >= 0 ? '+' : ''}{currentPrice.change?.toFixed(2) || '0.00'}%
                      </td>
                      <td>{currentPrice.volume?.toLocaleString() || '-'}</td>
                      <td>{currentPrice.timestamp ? new Date(currentPrice.timestamp).toLocaleString() : '-'}</td>
                      <td>{currentPrice.provider || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p>Loading price data...</p>
              )}
            </div>
          </div>

          {/* Historical Data */}
          <div className="row" style={{ marginTop: '2rem' }}>
            <div className="twelve columns">
              <h3>Historical Data - {baseCurrency}/{vsCurrency}</h3>
              <table className="u-full-width">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {mockHistory.map((item, index) => (
                    <tr key={index}>
                      <td>{item.date}</td>
                      <td>{item.price.toFixed(4)}</td>
                      <td style={{ color: item.change >= 0 ? '#4CAF50' : '#f44336' }}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* System Status */}
          <div className="row">
            <div className="twelve columns">
              <h3>System Status</h3>
              {!systemStatus ? (
                <p>Loading status...</p>
              ) : (
                <table className="u-full-width">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Last Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Redis Cache</td>
                      <td>
                        <span className={systemStatus.redis?.status === 'UP' ? 'status-connected' : 'status-disconnected'}>
                          ● {systemStatus.redis?.status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td>{systemStatus.redis?.lastCheck ? new Date(systemStatus.redis.lastCheck).toLocaleString() : 'Never'}</td>
                    </tr>
                    <tr>
                      <td>Database</td>
                      <td>
                        <span className={systemStatus.database?.status === 'UP' ? 'status-connected' : 'status-disconnected'}>
                          ● {systemStatus.database?.status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td>{systemStatus.database?.lastCheck ? new Date(systemStatus.database.lastCheck).toLocaleString() : 'Never'}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* API Providers */}
          <div className="row">
            <div className="twelve columns">
              <h3>API Providers</h3>
              {systemStatus?.services ? (
                <table className="u-full-width">
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Status</th>
                      <th>Last Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(systemStatus.services).map(([name, service]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>
                          <span className={service.status === 'UP' ? 'status-connected' : 'status-disconnected'}>
                            ● {service.status}
                          </span>
                        </td>
                        <td>{service.lastCheck ? new Date(service.lastCheck).toLocaleString() : 'Never'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No provider data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
