# Oracle Development Progress

This document tracks development progress, milestones, and decisions made during the project.

## Current Status

**Phase**: 1 - Foundation (MVP)
**Status**: MVP Components in Progress

## Milestone Tracker

### Phase 1 - Foundation (MVP)

| Component | Status | Progress | Notes |
|-----------|--------|----------|-------|
| Project Structure | Done | 100% | README, docs, config files |
| Database Schema | In Progress | 50% | Users + trading tables migration added |
| Auth System | In Progress | 85% | Register/login/refresh + profile UI |
| Strategy Builder | In Progress | 85% | Interactive canvas + library + backtest trigger |
| Backtest Engine | In Progress | 70% | CRUD + async stubbed run |
| Bot Scheduler | In Progress | 60% | CRUD + start/stop endpoints |
| Frontend Shell | In Progress | 85% | Core pages + settings/profile/bots/backtests added |

### Phase 2 - Core Features

| Component | Status | Progress | Notes |
|-----------|--------|----------|-------|
| Google OAuth | Not Started | 0% | |
| Portfolio View | Not Started | 0% | |
| Advanced Metrics | Not Started | 0% | |
| Real-time Charts | Not Started | 0% | |

### Phase 3 - Scale

| Component | Status | Progress | Notes |
|-----------|--------|----------|-------|
| Flink Integration | Not Started | 0% | |
| Multi-asset | Not Started | 0% | |
| Performance Opt | Not Started | 0% | |

### Phase 4 - Extensions

| Component | Status | Progress | Notes |
|-----------|--------|----------|-------|
| LLM Agent | Not Started | 0% | |
| MCP Server | Not Started | 0% | |
| Plugin System | Not Started | 0% | |

## Completed Work

### 2025-01-01 - Project Initialization

- [x] Created project vision and architecture
- [x] Defined component work items with P0/P1/P2 priorities
- [x] Set up documentation structure
- [x] Created AGENT.md for AI assistants
- [x] Created .claude/claude.md for code style preferences
- [x] Created docs folder with context and collaboration guides
- [x] Set up environment configuration (.env.example)
- [x] Created Docker Compose for local infrastructure
- [x] Chose AGPL-3.0 + Commercial dual licensing

## In Progress

- User profile page wired to /users/me
- Strategy builder library + backtest trigger
- Settings center with Alpaca OAuth + market data check
- Backtests launcher + results UI
- Bot scheduler UI with start/stop controls

## Upcoming Work

1. Implement remaining MVP business logic (strategy execution, scheduling runtime, backtest processing)
2. Add tests for auth + CRUD endpoints
3. Wire frontend forms to backend API
4. Build portfolio, bot manager, backtest results UI
5. Add rate limiting + WebSocket streaming

## Technical Decisions Log

### 2025-01-01

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend Language | Python | Ecosystem for trading/ML, FastAPI for async |
| Frontend Framework | React + TypeScript | Strong ecosystem, ReactFlow integration |
| Database | PostgreSQL + TimescaleDB | ACID compliance, time-series support |
| Strategy Builder | ReactFlow → Custom Executor | Visual editing, flexible backend processing |
| Auth | JWT + Google OAuth | Standard approach, social login option |
| Deployment | Vercel (FE) + Railway (BE) | Easy deployment, good free tiers |
| License | AGPL-3.0 + Commercial | Open source friendly, commercial option |

## Blockers & Issues

*No current blockers*

## Notes & Ideas

### Future Enhancements
- Mobile app (React Native)
- Strategy marketplace
- Social features (follow traders)
- Paper trading competitions
- ML model integration for signals

### Technical Explorations Needed
- Flink vs Kafka Streams for feature computation
- TimescaleDB vs QuestDB for time-series
- WebSocket scaling strategies
- Backtest engine optimization

---

*Last updated: 2025-01-04*
