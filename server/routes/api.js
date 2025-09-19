import { Router } from 'express'

export function createApiRoutes(serviceManager) {
  const router = Router()

  const asyncHandler = (fn) => (req, res) => fn(req, res).catch(error => res.status(500).json({ error: error.message }))

  router.get('/status', asyncHandler(async (req, res) => {
    const status = await serviceManager.getSystemStatus()
    res.json(status)
  }))

  router.get('/tokens', asyncHandler(async (req, res) => {
    const tokens = await serviceManager.getAvailableTokens()
    res.json(tokens)
  }))

  router.get('/tokens/:tokenId', asyncHandler(async (req, res) => {
    const { tokenId } = req.params
    const tokens = await serviceManager.getAvailableTokens()

    if (!tokens.includes(tokenId)) {
      return res.status(404).json({ error: `Token ${tokenId} not found` })
    }

    const priceInfoRaw = await serviceManager.redisClient.get(`price:${tokenId}`)
    const priceInfo = JSON.parse(priceInfoRaw)
    res.json(priceInfo)
  }))

  router.get('/config', asyncHandler(async (req, res) => {
    const configs = await serviceManager.prisma.apiConfig.findMany({
      select: {
        id: true,
        name: true,
        endpoint: true,
        active: true,
        delay: true,
        config: true,
        last_update: true,
        created_at: true,
        updated_at: true
      }
    })
    res.json({ configs })
  }))

  return router
}
