# Crypto Rates

Minimal crypto rates service built with React + Vite frontend and Node.js + Express backend. 
Simple SPA with HTML template in JSX using minimal javascript.

Note: Only implements live price fetching (history is mocked with static data in FE). 
Config and service statuses (my bonus) are also fetched from the backend.

## Tech Stack

### Frontend
- **React** - 1 of 3 main frameworks, all perform similarly
- **Vite** - one of the more popular React build tools, it's fast, alternative could be Parcel
- [**Skeleton CSS**](http://getskeleton.com/) - for a simple baseline, quick prototyping and speed

### Backend
- **Express** - minimal setup framework
- **Prisma** ORM - one of the more popular database ORMs

### Infra
- **Docker** (spin up Postgres and Redis) - just the bare minimum for local dev
- **PostgreSQL** (hold api configs, price history in the future) - NoSQL could be considered, but relational is OK here
- **Redis** (cache api provider status and token prices) - caching could be done in-memory for simplicity, 
but prod would need Redis **to share cache between instances** anyway

## Requirements

- backend
  - [X] REST API
  - [x] Provide current crypto prices using CoinGecko
  - [x] Implement at least one unit test
  - [x] Implemented Redis for caching to minimize calls to provider
- frontend
  - [x] Fetch data from backend (implied requirement)
  - [x] Display current selected crypto prices
  - [x] Implemented at least one unit test
- infra
  - [x] Docker for easy setup and README instructions
  - [x] Sensible clean project structure
- general
  - [x] README with setup instructions, future recommendations (architecture notes, TODO, security considerations)
  - [x] Keep the project simple and clean, leaving out any unnecessary complexity
  - [x] Thoughtful architectural decisions, code modularity, clean external data handling
- scalability
  - [ ] Supporting more trading pairs and tokens - need to figure out the data model(s) first
  - [ ] Displaying historical crypto prices - decide whether to store in own DB or fetch from provider, FE is mocked
  - [x] Adding more API providers - create abstract BaseService (read below), but can already add new providers anyway
- bonus
  - [x] Display service status (up/down) for each api provider and also database/redis
  - [x] Crypto price history mock design (otherwise the page is too empty)
  - [x] Error for environment variables not set (helps with project setup)
  - [x] Manage both services from project root

## Quick Start

### Environment Variables
Create a `.env` file in the server directory:
```env
DATABASE_URL=postgres://postgres:password@localhost:5432/exchange_db
REDIS_URL=redis://localhost:6379
PORT=3001
NODE_ENV=development
```

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the database services:**
```bash
npm run db:up
```

3. **Start the development servers:**
```bash
npm run dev
```

4. **Run unit tests:**
```bash
npm test
```

# Suggestions for future enhancements

## Design decisions

### USDT/TON
Note: There's no TON/USDT trading pair in CoinGecko API, only TON/USD.
We could fetch TON/USD and derive USDT/TON as 1/(TON/USD), but I did not implement this.
This is why we didn't fully implement (vs) currency fetching yet, because these tiny quirks define UI and BE structure

### Redis Cache Structure
Currently using cache keys in format: `price:token` (for ex. `price:TON`)
Recommended structure: `provider:price:token` (for ex. `coingecko:price:USDT`)
This would allow for multiple providers and easier provider-specific cache management.

### BaseService

For better scalability, implement abstract BaseService interface that the different providers would implement.
This would simplify adding new providers and provide cleaner code.

## TODO

1. SPA vs MPA - what's the future use case of the app?
   1. Either way we need to consider modularity and code splitting, making reusable components
2. Tech stack review with the team
3. Graceful shutdown of the server
4. Logging framework - currently just console.log
5. i18n - extra consideration needed early for Arabic languages (RTL)
6. Authentication/authorization - different users, login
7. React persistent state management - currently just local state
8. Bundling/minification for production
9. Concurrency handling - for several instances of the backend running at once
10. Testing strategy - code coverage or cover critical flows; integration tests, e2e tests
11. CI/CD pipeline
12. Kubernetes/PM2 deployment
13. Consider deployment configuration for different regions (EU, USA, AU) and environments (staging, prod)
14. Deploy to prod?

## Security considerations

1. Remove(d) Express 'X-Powered-By' header
2. Input sanitization
3. HTTPS only for production, TLS enforcement
4. Storing secrets and env variables properly
5. CORS configuration
6. Use sensible defaults for security headers (Helmet.js)
7. Rate limiting, bot protection (block proxies, VPNs, hosting provider IPs)
8. Data protection and privacy (GDPR) - if we start storing PII
9. Blocklist certain countries if needed
10. Block malicious requests (SQLi, XSS, etc.) - OWASP Top 10
