export class CoinGeckoService {
  constructor(config, redisClient) {
    this.config = config
    this.delay = config.delay
    this.endpoint = config.endpoint
    this.apiKey = config.apiKey
    this.redisClient = redisClient
    this.baseCurrencies = config.config?.base_currencies
    this.vsCurrencies = config.config?.vs_currencies
    this.tokens = []
  }

  async getAvailableTokens() {
    if (this.tokens.length === 0) {
      // TODO: Expecting the redis cache to always be empty (in development)
      // otherwise for prod we could try fetching from cache first. Jira link?
      await this.fetchAllPrices()
    }

    return this.tokens
  }

  async fetchAllPrices() {
    try {
      const tokenIds = this.baseCurrencies.map(currency => currency.id).join(',')
      const vsCurrencies = this.vsCurrencies.join(',')

      const url = `${this.endpoint}/simple/price?ids=${tokenIds}&vs_currencies=${vsCurrencies}&include_24hr_change=true&include_24hr_vol=true`

      const response = await fetch(url)

      if (!response.ok) {
        await this.setServiceStatus('DOWN')
        throw new Error(`API error with HTTP status code ${response.status}`)
      }

      const data = await response.json()
      await this.cachePrices(data)

      return data

    } catch (error) {
      await this.setServiceStatus('UNK')
      console.error('CoinGecko price fetch error:', error.message)
      throw error
    }
  }

  async cachePrices(data) {
    const timestamp = new Date().toISOString()

    for (const { id, name } of this.baseCurrencies) {
      const tokenData = data[id]
      if (tokenData) {
        const cacheKey = `price:${name}`
        const priceData = {
          data: tokenData,
          name,
          timestamp,
          provider: 'coingecko'
        }

        await this.redisClient.set(cacheKey, JSON.stringify(priceData))
        if (!this.tokens.includes(name)) {
          this.tokens.push(name)
        }
      }
    }

    await this.setServiceStatus('UP')
  }

  async getServiceStatus() {
    const cached = await this.redisClient.get('status:coingecko')
    return cached ? JSON.parse(cached) : { status: 'UNK', lastCheck: null }
  }

  async setServiceStatus(status) {
    const timestamp = new Date().toISOString()
    await this.redisClient.set('status:coingecko', JSON.stringify({ status, lastCheck: timestamp }))
  }
}
