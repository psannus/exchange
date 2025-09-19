import { createClient } from 'redis'
import { PrismaClient } from '@prisma/client'
import { CoinGeckoService } from './CoinGeckoService.js'

export class ServiceManager {
  constructor() {
    this.prisma = new PrismaClient()
    this.redisClient = null
    this.services = new Map()
  }

  async initialize() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL
    })

    await this.redisClient.connect()
    await this.loadServices()
  }

  async loadServices() {
    const configs = await this.prisma.apiConfig.findMany({
      where: { active: true }
    })

    for (const config of configs) {
      try {
        const service = this.createService(config)
        if (service) {
          this.services.set(config.name, service)
          this.startCronjob(config)
        }
      } catch (error) {
        console.error(`Failed to initialize ${config.name}:`, error.message)
      }
    }
  }

  startCronjob(config) {
    const service = this.services.get(config.name)
    if (service && service.fetchAllPrices) {
      // TODO: Using setInterval is probably not the proper way to implement cronjobs in Node
      // For production, consider using a proper cron library (for ex. node-cron) or
      // external scheduler. In Java, we'd use Shedlock with db-based cronjob config. Jira link?
      setInterval(async () => {
        try {
          await service.fetchAllPrices()
        } catch (error) {
          console.error(`Error fetching prices from ${config.name}:`, error.message)
        }
      }, config.delay * 1000)
    }
  }

  createService(config) {
    switch (config.name?.toLowerCase()) {
      case 'coingecko':
        return new CoinGeckoService(config, this.redisClient)
      default:
        console.warn(`Unknown service: ${config.name}`)
        return null
    }
  }

  async getSystemStatus() {
    const status = {
      redis: await this.checkRedis(),
      database: await this.checkDatabase(),
      services: {}
    }

    for (const [name, service] of this.services) {
      if (service.getServiceStatus) {
        const resp = await service.getServiceStatus()
        status.services[name] = resp
      }
    }

    return status
  }

  async checkRedis() {
    const timestamp = new Date().toISOString()

    try {
      await this.redisClient.ping()
      return { status: 'UP', lastCheck: timestamp }
    } catch (error) {
      return { status: 'DOWN', lastCheck: timestamp, error: error.message }
    }
  }

  async checkDatabase() {
    const timestamp = new Date().toISOString()

    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { status: 'UP', lastCheck: timestamp }
    } catch (error) {
      return { status: 'DOWN', lastCheck: timestamp, error: error.message }
    }
  }

  async getAvailableTokens() {
    const allPrices = []

    for (const service of this.services.values()) {
      if (service.getAvailableTokens) {
        allPrices.push(...await service.getAvailableTokens())
      }
    }

    return allPrices
  }
}
