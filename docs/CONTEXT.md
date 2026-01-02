# Oracle Project Context

This document maintains detailed context about the Oracle project. It is updated regularly during development and serves as a reference for both human developers and AI agents.

## Project Summary

**Oracle** is an open-source quantitative trading platform that enables users to:
1. Build trading strategies visually using a node-based editor
2. Backtest strategies against historical market data
3. Schedule automated trading bots
4. Monitor portfolio performance in real-time

## Target Users

- **Individual Investors**: Retail traders wanting algorithmic trading capabilities
- **Quant Enthusiasts**: Users learning quantitative finance
- **Small Teams**: Trading groups needing a shared platform
- **Developers**: Building custom trading integrations

## Core User Stories

### MVP User Stories (P0)

1. **As a user**, I can register with email/password and log in securely
2. **As a user**, I can create a trading strategy using a visual drag-and-drop interface
3. **As a user**, I can backtest my strategy against historical data
4. **As a user**, I can view backtest results including P&L and key metrics
5. **As a user**, I can schedule a bot to run my strategy automatically
6. **As a user**, I can monitor my running bots and their status

### Post-MVP User Stories (P1)

1. **As a user**, I can log in with my Google account
2. **As a user**, I can view my portfolio holdings and real-time P&L
3. **As a user**, I can see advanced analytics (Sharpe, Sortino, drawdown)
4. **As a user**, I can receive alerts when my bots execute trades

### Future User Stories (P2)

1. **As a user**, I can create custom indicators using code
2. **As a user**, I can share strategies with other users
3. **As a user**, I can use AI to help generate strategies
4. **As a user**, I can trade multiple asset classes (crypto, bonds)

## Technical Context

### Strategy Builder Architecture

The strategy builder uses ReactFlow on the frontend to create a visual node graph. This is serialized to JSON and sent to the backend, where a Python-based executor (inspired by LiteFlow) processes it.

**Node Types:**
- **Data Nodes**: Price, Volume, OHLCV feeds
- **Indicator Nodes**: RSI, MACD, SMA, EMA, Bollinger Bands
- **Condition Nodes**: Compare, Threshold, CrossOver
- **Action Nodes**: Buy, Sell, Hold
- **Flow Nodes**: Branch, Loop, Parallel

**Execution Flow:**
```
ReactFlow JSON → Parser → DAG → Executor → Signals → Order Manager
```

### Feature Consistency

A key architectural goal is ensuring feature values are identical between:
- **Backtesting** (offline, batch processing)
- **Live Trading** (online, streaming)

This is achieved through:
1. Unified Feature Definition DSL (YAML/JSON)
2. Shared computation logic (Python functions)
3. Flink for streaming with same window semantics
4. Feature store for caching and retrieval

### Database Schema Overview

```
users
├── id (PK)
├── email (unique)
├── password_hash
├── created_at
└── updated_at

strategies
├── id (PK)
├── user_id (FK → users)
├── name
├── config_json
├── version
├── created_at
└── updated_at

bots
├── id (PK)
├── strategy_id (FK → strategies)
├── schedule (cron expression)
├── status (running/stopped/error)
├── last_run_at
└── created_at

orders
├── id (PK)
├── bot_id (FK → bots)
├── symbol
├── side (buy/sell)
├── quantity
├── price
├── status
├── alpaca_order_id
└── created_at

backtests
├── id (PK)
├── strategy_id (FK → strategies)
├── start_date
├── end_date
├── initial_capital
├── results_json
├── status
└── created_at
```

### API Structure

```
/api/v1/
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /refresh
│   └── POST /logout
├── /users
│   ├── GET /me
│   └── PUT /me
├── /strategies
│   ├── GET /
│   ├── POST /
│   ├── GET /{id}
│   ├── PUT /{id}
│   └── DELETE /{id}
├── /bots
│   ├── GET /
│   ├── POST /
│   ├── GET /{id}
│   ├── PUT /{id}
│   ├── DELETE /{id}
│   ├── POST /{id}/start
│   └── POST /{id}/stop
├── /backtests
│   ├── GET /
│   ├── POST /
│   ├── GET /{id}
│   └── POST /{id}/run (async)
├── /orders
│   └── GET /
└── /market
    ├── GET /symbols
    └── WS /stream
```

## External Dependencies

### Alpaca API
- **Purpose**: Market data and order execution
- **Paper Trading**: Available for testing
- **Rate Limits**: 200 requests/minute (data), 200/minute (trading)
- **WebSocket**: Real-time quotes and trades

### Google OAuth
- **Purpose**: Social login option
- **Scopes**: email, profile
- **Callback**: `/api/v1/auth/google/callback`

## Development Context

### Current Phase
Phase 1 - Foundation (MVP)

### Active Development Areas
- Strategy builder UX and saved strategy library
- Backtest launch flow and stubbed results
- Bot scheduler start/stop controls
- Settings center with Alpaca OAuth

### Known Technical Debt
- None yet (new project)

### Performance Considerations
- Redis caching for hot data (feature values, session tokens)
- TimescaleDB hypertables for time-series data
- Connection pooling for database
- WebSocket for real-time updates

## Conversation Summaries

This section stores summarized context from development conversations. Updated via `/compact` command.

### Session History

*No sessions recorded yet.*

---

*Last updated: 2025-01-04*
