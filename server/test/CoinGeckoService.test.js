import { test, describe } from 'node:test'
import assert from 'node:assert'
import { CoinGeckoService } from '../services/CoinGeckoService.js'

describe('CoinGeckoService', () => {
  test('constructor initializes properties correctly', () => {
    const mockConfig = {
      delay: 30,
      endpoint: 'https://api.coingecko.com/api/v3',
      apiKey: 'test-key',
      config: {
        base_currencies: [{ id: 'toncoin', name: 'TON' }],
        vs_currencies: ['usd', 'eth']
      }
    }
    const mockRedisClient = {}

    const service = new CoinGeckoService(mockConfig, mockRedisClient)

    assert.strictEqual(service.delay, 30)
    assert.strictEqual(service.endpoint, 'https://api.coingecko.com/api/v3')
    assert.strictEqual(service.apiKey, 'test-key')
    assert.deepStrictEqual(service.baseCurrencies, [{ id: 'toncoin', name: 'TON' }])
    assert.deepStrictEqual(service.vsCurrencies, ['usd', 'eth'])
    assert.deepStrictEqual(service.tokens, [])
  })
})
