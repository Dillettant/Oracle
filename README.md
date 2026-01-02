# Oracle - Quantitative Trading Platform

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Open Source](https://img.shields.io/badge/Open%20Source-Community-green.svg)](./docs/COLLABORATION.md)

## Vision

Oracle is an open-source quantitative trading platform designed to democratize algorithmic trading for individual investors and teams. Our mission is to provide a powerful, extensible, and user-friendly platform for:

- **Stocks** - Equities trading with real-time market data
- **Bonds** - Fixed income instruments (future roadmap)
- **Crypto** - Cryptocurrency trading (future roadmap)

The platform enables users to build custom trading strategies visually, backtest them against historical data, and deploy automated trading bots - all through an intuitive interface inspired by Robinhood's clean design.

### Core Principles

1. **Accessibility** - Make quantitative trading accessible to everyone, not just institutions
2. **Transparency** - Open-source core with community-driven development
3. **Extensibility** - Plugin architecture for custom indicators, strategies, and integrations
4. **Reliability** - Production-grade infrastructure with real-time processing
5. **Consistency** - Same feature definitions for backtesting and live trading

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ORACLE SYSTEM                                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                           FRONTEND (React + ReactFlow)                          │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐ │    │
│  │  │Dashboard │ │Portfolio │ │Strategy  │ │Backtest  │ │ Bot       │ │Settings  │ │    │
│  │  │          │ │ View     │ │ Builder  │ │ Results  │ │ Manager   │ │          │ │    │
│  │  │ • P&L    │ │ • Assets │ │ReactFlow │ │ • Charts │ │ • Create  │ │ • API    │ │    │
│  │  │ • Charts │ │ • Orders │ │ • Nodes  │ │ • Metrics│ │ • Schedule│ │ • Theme  │ │    │
│  │  │ • News   │ │ • History│ │ • Canvas │ │ • Compare│ │ • Monitor │ │ • Alerts │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └───────────┘ └──────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                          │                                              │
│                                          ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                              API GATEWAY (FastAPI)                              │    │
│  │      Auth (JWT + OAuth) │ Rate Limit │ Routing │ WebSocket │ API Versioning     │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                          │                                              │
│         ┌────────────────────────────────┼────────────────────────────────┐             │
│         ▼                                ▼                                ▼             │
│  ┌─────────────────┐           ┌─────────────────────┐          ┌─────────────────┐     │
│  │  STRATEGY       │           │   FEATURE           │          │   EXECUTION     │     │
│  │  SERVICE        │           │   SERVICE           │          │   SERVICE       │     │
│  │  (Python)       │           │   (Python + Flink)  │          │   (Python)      │     │
│  │                 │           │                     │          │                 │     │
│  │  ┌───────────┐  │           │  ┌───────────────┐  │          │  ┌───────────┐  │     │
│  │  │ LiteFlow  │  │           │  │ Feature Store │  │          │  │ Order     │  │     │
│  │  │ Engine    │  │◄─────────►│  │               │  │◄────────►│  │ Manager   │  │     │
│  │  │           │  │           │  │ • Definition  │  │          │  │           │  │     │
│  │  │ • Rules   │  │           │  │ • Registry    │  │          │  │ • Submit  │  │     │
│  │  │ • Flows   │  │           │  │ • Versioning  │  │          │  │ • Cancel  │  │     │
│  │  │ • Chains  │  │           │  │               │  │          │  │ • Track   │  │     │
│  │  └───────────┘  │           │  └───────────────┘  │          │  └───────────┘  │     │
│  │                 │           │          │          │          │        │        │     │
│  │  ┌───────────┐  │           │          ▼          │          │        ▼        │     │
│  │  │ Strategy  │  │           │  ┌───────────────┐  │          │  ┌───────────┐  │     │
│  │  │ DSL       │  │           │  │ Flink Feature │  │          │  │ Risk      │  │     │
│  │  │ Parser    │  │           │  │ Processor     │  │          │  │ Manager   │  │     │
│  │  └───────────┘  │           │  │               │  │          │  │           │  │     │
│  └─────────────────┘           │  │ • Streaming   │  │          │  │ • Limits  │  │     │
│                                │  │ • Windowing   │  │          │  │ • Checks  │  │     │
│                                │  │ • Aggregation │  │          │  └───────────┘  │     │
│                                │  └───────────────┘  │          └─────────────────┘     │
│                                └─────────────────────┘                   │              │
│                                          │                               │              │
│         ┌────────────────────────────────┼───────────────────────────────┘              │
│         ▼                                ▼                                              │
│  ┌─────────────────┐           ┌─────────────────────┐          ┌─────────────────┐     │
│  │  BACKTEST       │           │   DATA              │          │   SCHEDULER     │     │
│  │  SERVICE        │           │   SERVICE           │          │   SERVICE       │     │
│  │                 │           │                     │          │                 │     │
│  │  • Historical   │           │  ┌───────────────┐  │          │  • Cron Jobs    │     │
│  │    Simulation   │◄─────────►│  │ Alpaca API    │  │◄────────►│  • Bot Mgmt     │     │
│  │  • OOT Testing  │           │  │ Connector     │  │          │  • Monitoring   │     │
│  │  • Performance  │           │  │               │  │          │                 │     │
│  │    Metrics      │           │  │ • Market Data │  │          │  ┌───────────┐  │     │
│  │  • A/B Compare  │           │  │ • Account     │  │          │  │ Bot       │  │     │
│  │                 │           │  │ • Trading     │  │          │  │ Runtime   │  │     │
│  └─────────────────┘           │  └───────────────┘  │          │  │           │  │     │
│                                │          │          │          │  │ • Start   │  │     │
│                                │          ▼          │          │  │ • Stop    │  │     │
│                                │  ┌───────────────┐  │          │  │ • Status  │  │     │
│                                │  │ Kafka/Pulsar  │  │          │  └───────────┘  │     │
│                                │  │ Message Bus   │  │          └─────────────────┘     │
│                                │  └───────────────┘  │                                  │
│                                └─────────────────────┘                                  │
│                                          │                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                              EXTENSION LAYER                                    │    │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐               │    │
│  │  │   LLM Agent      │  │   MCP Server     │  │   Skills Engine  │               │    │
│  │  │                  │  │                  │  │                  │               │    │
│  │  │ • Strategy Gen   │  │ • Tool Registry  │  │ • Plugin System  │               │    │
│  │  │ • Analysis       │  │ • Context Mgmt   │  │ • Custom Nodes   │               │    │
│  │  │ • Recommendations│  │ • Extensions     │  │ • Indicators     │               │    │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                              DATA STORAGE LAYER                                 │    │
│  │  ┌────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │                         PostgreSQL (Primary Database)                      │ │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │    │
│  │  │  │ Users &      │  │ Strategies   │  │ Orders &     │  │ Market Data  │    │ │    │
│  │  │  │ Auth         │  │ & Configs    │  │ Positions    │  │ (TimescaleDB)│    │ │    │
│  │  │  │              │  │              │  │              │  │              │    │ │    │
│  │  │  │ • users      │  │ • strategies │  │ • orders     │  │ • ohlcv      │    │ │    │
│  │  │  │ • sessions   │  │ • features   │  │ • positions  │  │ • ticks      │    │ │    │
│  │  │  │ • oauth      │  │ • bots       │  │ • trades     │  │ • features   │    │ │    │
│  │  │  │ • profiles   │  │ • backtests  │  │ • pnl        │  │ • signals    │    │ │    │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │ │    │
│  │  └────────────────────────────────────────────────────────────────────────────┘ │    │
│  │                                                                                 │    │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────┐                                    │    │
│  │  │ Redis    │  │ MinIO    │  │ ClickHouse  │                                    │    │
│  │  │ (Cache)  │  │ (Objects)│  │ (Analytics) │                                    │    │
│  │  └──────────┘  └──────────┘  └─────────────┘                                    │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Key Features

### User Management & Authentication
- Self-registration with username/password
- Google OAuth integration
- JWT-based session management
- User profiles and preferences

### Strategy Building
- Visual drag-and-drop strategy builder (ReactFlow)
- Pre-built technical indicators (RSI, MACD, Bollinger, etc.)
- Custom indicator support
- Strategy versioning and sharing

### Backtesting & Analysis
- Historical simulation engine
- Out-of-time (OOT) testing
- Performance metrics (Sharpe, Sortino, Max Drawdown, etc.)
- A/B strategy comparison

### Live Trading
- Bot scheduling and management
- Real-time order execution via Alpaca
- Risk management controls
- Position monitoring

### Data & Features
- Real-time market data streaming
- Consistent feature computation (online = offline)
- Feature store with versioning
- Apache Flink for stream processing

---

## Component Work Items

### 1. Authentication & User Management

| Priority | Item | Description |
|----------|------|-------------|
| **P0** | User Registration | Email/password signup with validation |
| **P0** | User Login | JWT-based authentication |
| **P0** | Password Hashing | Secure password storage (bcrypt) |
| **P0** | PostgreSQL User Schema | Users, sessions, profiles tables |
| **P1** | Google OAuth | OAuth 2.0 integration for Google login |
| **P1** | Password Reset | Email-based password recovery |
| **P1** | Email Verification | Verify email on registration |
| **P2** | Two-Factor Auth | TOTP-based 2FA |
| **P2** | API Keys | Personal API key management |
| **P2** | SSO Integration | Enterprise SSO support |

### 2. Frontend (React + ReactFlow)

| Priority | Item | Description |
|----------|------|-------------|
| **P0** | Project Setup | Vite + React + TypeScript + TailwindCSS |
| **P0** | Robinhood Theme | Clean, minimal UI design system |
| **P0** | Auth Pages | Login, Register, Forgot Password |
| **P0** | Dashboard Shell | Main layout with navigation |
| **P0** | Strategy Builder Canvas | ReactFlow integration |
| **P0** | Basic Node Types | Data, Indicator, Condition, Action nodes |
| **P1** | Portfolio View | Holdings, P&L, performance charts |
| **P1** | Backtest Results | Charts, metrics, trade history |
| **P1** | Bot Manager | Create, schedule, monitor bots |
| **P1** | Real-time Charts | TradingView or Lightweight Charts |
| **P1** | Settings Page | User preferences, API keys |
| **P2** | Dark Mode | Theme toggle support |
| **P2** | Mobile Responsive | Mobile-friendly layouts |
| **P2** | PWA Support | Progressive Web App features |

### 3. Backend API (Python + FastAPI)

| Priority | Item | Description |
|----------|------|-------------|
| **P0** | Project Setup | FastAPI + SQLAlchemy + Alembic |
| **P0** | Auth Endpoints | Register, login, refresh, logout |
| **P0** | User CRUD | User profile management |
| **P0** | Strategy CRUD | Create, read, update, delete strategies |
| **P0** | Bot CRUD | Bot configuration management |
| **P0** | WebSocket Server | Real-time data streaming |
| **P1** | Google OAuth | OAuth callback handlers |
| **P1** | Backtest Endpoints | Trigger and retrieve backtests |
| **P1** | Order Endpoints | Submit, cancel, list orders |
| **P1** | Position Endpoints | Current positions, history |
| **P1** | Rate Limiting | Request throttling |
| **P2** | API Versioning | /v1/, /v2/ support |
| **P2** | GraphQL | Optional GraphQL endpoint |
| **P2** | Webhook System | External integrations |

### 4. Database (PostgreSQL)

| Priority | Item | Description |
|----------|------|-------------|
| **P0** | Schema Design | Core tables and relationships |
| **P0** | Users Table | id, email, password_hash, created_at |
| **P0** | Strategies Table | id, user_id, name, config_json, version |
| **P0** | Bots Table | id, strategy_id, schedule, status |
| **P0** | Orders Table | id, bot_id, symbol, side, quantity, status |
| **P0** | Alembic Migrations | Database versioning |
| **P1** | Positions Table | id, user_id, symbol, quantity, avg_price |
| **P1** | Trades Table | Executed trade history |
| **P1** | Backtests Table | Backtest runs and results |
| **P1** | TimescaleDB Extension | Time-series hypertables for OHLCV |
| **P2** | Features Table | Computed feature storage |
| **P2** | Audit Logs | User action logging |
| **P2** | Read Replicas | Scaling for analytics |

### 5. Strategy Engine (Python + LiteFlow-style)

| Priority | Item | Description |
|----------|------|-------------|
| **P0** | ReactFlow Parser | Convert ReactFlow JSON to executable |
| **P0** | Node Executor | Base node execution framework |
| **P0** | Data Nodes | Price, Volume, OHLCV data access |
| **P0** | Indicator Nodes | RSI, MACD, SMA, EMA, Bollinger |
| **P0** | Condition Nodes | Compare, threshold, crossover |
| **P0** | Action Nodes | Buy, Sell, Hold signals |
| **P1** | Flow Control | Branch, loop, parallel execution |
| **P1** | Custom Node API | Plugin interface for custom nodes |
| **P1** | Strategy Validation | Validate strategy before execution |
| **P2** | Strategy Optimizer | Parameter optimization |
| **P2** | ML Integration | Integrate ML model nodes |

### 6. Backtest Engine

| Priority | Item | Description |
|----------|------|-------------|
| **P0** | Historical Data Loader | Load OHLCV from database |
| **P0** | Event-Driven Simulator | Tick-by-tick simulation |
| **P0** | Order Simulator | Simulated order execution |
| **P0** | Basic Metrics | Returns, Sharpe ratio |
| **P1** | Transaction Costs | Slippage, commissions |
| **P1** | Advanced Metrics | Sortino, Max DD, Calmar |
| **P1** | Trade Analysis | Win rate, avg profit/loss |
| **P1** | OOT Testing | Walk-forward validation |
| **P2** | Monte Carlo | Randomized backtests |
| **P2** | A/B Comparison | Side-by-side strategy comparison |

### 7. Bot Scheduler

| Priority | Item | Description |
|----------|------|-------------|
| **P0** | Cron Scheduler | APScheduler or Celery Beat |
| **P0** | Bot Runtime | Execute strategy on schedule |
| **P0** | Bot Status | Running, stopped, error states |
| **P0** | Basic Logging | Execution logs |
| **P1** | Graceful Shutdown | Clean bot termination |
| **P1** | Error Recovery | Retry logic, alerts |
| **P1** | Resource Limits | CPU/memory constraints |
| **P2** | Distributed Bots | Multi-node execution |
| **P2** | Bot Versioning | A/B bot deployments |

### 8. Data Service & Alpaca Integration

| Priority | Item | Description |
|----------|------|-------------|
| **P0** | Alpaca REST Client | Market data, account info |
| **P0** | Alpaca WebSocket | Real-time quotes, trades |
| **P0** | OHLCV Storage | Store historical bars |
| **P0** | Symbol Universe | Supported symbols list |
| **P1** | Order Execution | Submit orders via Alpaca |
| **P1** | Position Sync | Sync positions from broker |
| **P1** | Account Balance | Real-time balance updates |
| **P2** | Multiple Brokers | Abstract broker interface |
| **P2** | Paper Trading | Alpaca paper trading mode |

### 9. Feature Service (Flink)

| Priority | Item | Description |
|----------|------|-------------|
| **P1** | Feature DSL | YAML/JSON feature definitions |
| **P1** | Flink Job Setup | Basic Flink cluster |
| **P1** | Technical Indicators | RSI, MACD via Flink |
| **P1** | Feature Sink | Write to Redis/PostgreSQL |
| **P2** | Feature Registry | Central feature catalog |
| **P2** | Feature Versioning | Track feature changes |
| **P2** | Batch Processor | Offline feature computation |

### 10. Extension Layer

| Priority | Item | Description |
|----------|------|-------------|
| **P2** | LLM Agent | Claude/OpenAI strategy assistant |
| **P2** | MCP Server | Model Context Protocol support |
| **P2** | Skills System | Plugin architecture |
| **P2** | Custom Indicators | User-defined indicators |
| **P2** | Webhook Triggers | External signal integration |

### 11. Infrastructure & DevOps

| Priority | Item | Description |
|----------|------|-------------|
| **P0** | Docker Compose | Local development setup |
| **P0** | PostgreSQL Container | Database container |
| **P0** | Redis Container | Cache container |
| **P0** | Environment Config | .env file management |
| **P1** | Vercel Deployment | Frontend deployment |
| **P1** | Backend Deployment | API deployment (Railway/Fly.io) |
| **P1** | CI/CD Pipeline | GitHub Actions |
| **P1** | Database Migrations | Automated migrations |
| **P2** | Kubernetes | Production orchestration |
| **P2** | Monitoring | Prometheus + Grafana |
| **P2** | Log Aggregation | ELK or Loki stack |

---

## MVP Scope

The Minimum Viable Product includes all **P0** items, enabling:

1. **User Registration & Login** - Create account, authenticate
2. **Strategy Builder** - Visual drag-and-drop strategy creation
3. **Backtesting** - Run simulations on historical data
4. **Bot Scheduling** - Schedule strategies to run automatically
5. **Results Dashboard** - View P&L, trades, and performance

### MVP User Flow

```
Register → Login → Create Strategy (ReactFlow) → Backtest → Review Results → Schedule Bot → Monitor
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | React 18, TypeScript | Vite build tool |
| | ReactFlow | Strategy builder canvas |
| | TailwindCSS | Utility-first styling |
| | Zustand | State management |
| | React Query | Data fetching |
| **Backend** | Python 3.11+ | Primary language |
| | FastAPI | REST + WebSocket API |
| | SQLAlchemy | ORM |
| | Alembic | Migrations |
| | Pydantic | Validation |
| **Database** | PostgreSQL 15 | Primary database |
| | TimescaleDB | Time-series extension |
| | Redis | Caching, sessions |
| **Streaming** | Apache Flink | Feature computation |
| | Kafka | Message queue (optional) |
| **Workflow** | LiteFlow (Python port) | Strategy execution |
| **Deployment** | Vercel | Frontend hosting |
| | Docker | Containerization |
| | GitHub Actions | CI/CD |
| **External** | Alpaca API | Market data & trading |
| | Google OAuth | Social login |

---

## Project Structure

```
oracle/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API clients
│   │   ├── store/            # State management
│   │   └── styles/           # Theme & styles
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Python API
│   ├── app/
│   │   ├── api/              # Route handlers
│   │   ├── core/             # Config, security
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── main.py           # FastAPI app
│   ├── alembic/              # Migrations
│   ├── tests/
│   ├── requirements.txt
│   └── pyproject.toml
│
├── flink-jobs/               # Flink streaming jobs
│   ├── feature_processor/
│   └── signal_generator/
│
├── docs/                     # Documentation
│   ├── CONTEXT.md            # Project context
│   ├── PROGRESS.md           # Development progress
│   ├── COLLABORATION.md      # Contribution guide
│   ├── COMMERCIAL.md         # Licensing & plans
│   └── ALPACA_INTEGRATION.md # Alpaca API guide
│
├── .claude/                  # Claude Code config
│   └── claude.md             # Code style preferences
│
├── docker-compose.yml        # Local infrastructure
├── .env.example              # Environment template
├── .gitignore
├── AGENT.md                  # AI agent instructions
├── LICENSE                   # AGPL-3.0
└── README.md                 # This file
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Alpaca API account (free)

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/oracle.git
cd oracle

# Start infrastructure
docker-compose up -d

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Setup frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

See `.env.example` for all required variables.

---

## Contributing

We welcome contributions! See [docs/COLLABORATION.md](./docs/COLLABORATION.md) for guidelines.

## License

This project is dual-licensed:

- **Open Source**: [AGPL-3.0](./LICENSE) - Free for personal and open-source use
- **Commercial**: Contact us for commercial licensing options

See [docs/COMMERCIAL.md](./docs/COMMERCIAL.md) for details.

---

## Roadmap

### Phase 1 - Foundation (MVP)
- [x] Project structure and documentation
- [ ] Authentication system
- [ ] Basic strategy builder
- [ ] Backtest engine
- [ ] Bot scheduler

### Phase 2 - Core Features
- [ ] Advanced indicators
- [ ] Real-time dashboard
- [ ] Portfolio analytics
- [ ] Risk management

### Phase 3 - Scale
- [ ] Flink feature processing
- [ ] Multi-asset support
- [ ] Performance optimization
- [ ] Mobile support

### Phase 4 - Extensions
- [ ] LLM integration
- [ ] MCP support
- [ ] Marketplace
- [ ] Enterprise features
