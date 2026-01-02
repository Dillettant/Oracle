# Alpaca API Integration Guide

This document provides implementation details for integrating Alpaca APIs into Oracle for market data and trading functionality.

## Overview

[Alpaca](https://alpaca.markets) provides API-first solutions for trading stocks and crypto. Oracle uses Alpaca for:

- **Market Data**: Real-time and historical price data
- **Trading**: Order execution and position management
- **Account**: Balance and portfolio information

## API Products Used

| API | Purpose | Base URL |
|-----|---------|----------|
| Trading API | Order execution, positions, account | `https://api.alpaca.markets` (live) / `https://paper-api.alpaca.markets` (paper) |
| Market Data API | OHLCV bars, quotes, trades | `https://data.alpaca.markets` |
| Streaming | Real-time WebSocket data | `wss://stream.data.alpaca.markets` |

## Authentication

Alpaca uses API key + secret key authentication.

### Getting API Keys

1. Create account at [Alpaca](https://app.alpaca.markets/)
2. Navigate to API Keys section
3. Generate new key pair
4. Store securely in `.env` file

### Environment Variables

```bash
# Paper trading (recommended for development)
ALPACA_API_KEY=your_paper_api_key
ALPACA_SECRET_KEY=your_paper_secret_key
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# Live trading (production only)
# ALPACA_API_KEY=your_live_api_key
# ALPACA_SECRET_KEY=your_live_secret_key
# ALPACA_BASE_URL=https://api.alpaca.markets

# Market Data
ALPACA_DATA_URL=https://data.alpaca.markets
```

## Python SDK (alpaca-py)

Oracle uses the official Alpaca Python SDK.

### Installation

```bash
pip install alpaca-py
```

### Client Initialization

```python
from alpaca.trading.client import TradingClient
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.live import StockDataStream

# Trading client
trading_client = TradingClient(
    api_key=settings.ALPACA_API_KEY,
    secret_key=settings.ALPACA_SECRET_KEY,
    paper=settings.ALPACA_PAPER_TRADING  # True for paper trading
)

# Historical data client
data_client = StockHistoricalDataClient(
    api_key=settings.ALPACA_API_KEY,
    secret_key=settings.ALPACA_SECRET_KEY
)

# Real-time streaming client
stream_client = StockDataStream(
    api_key=settings.ALPACA_API_KEY,
    secret_key=settings.ALPACA_SECRET_KEY
)
```

## Market Data

### Historical Bars (OHLCV)

```python
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame
from datetime import datetime, timedelta

# Request daily bars for the last 30 days
request = StockBarsRequest(
    symbol_or_symbols=["AAPL", "GOOGL", "MSFT"],
    timeframe=TimeFrame.Day,
    start=datetime.now() - timedelta(days=30),
    end=datetime.now()
)

bars = data_client.get_stock_bars(request)

# Convert to pandas DataFrame
df = bars.df
print(df.head())
```

### Available Timeframes

| Timeframe | Description |
|-----------|-------------|
| `TimeFrame.Minute` | 1-minute bars |
| `TimeFrame.Hour` | 1-hour bars |
| `TimeFrame.Day` | Daily bars |
| `TimeFrame.Week` | Weekly bars |
| `TimeFrame.Month` | Monthly bars |

Custom timeframes can be created:
```python
from alpaca.data.timeframe import TimeFrame, TimeFrameUnit

# 5-minute bars
timeframe_5min = TimeFrame(5, TimeFrameUnit.Minute)

# 4-hour bars
timeframe_4h = TimeFrame(4, TimeFrameUnit.Hour)
```

### Real-time Streaming

```python
from alpaca.data.live import StockDataStream

stream = StockDataStream(api_key, secret_key)

async def handle_bar(bar):
    """Process incoming bar data."""
    print(f"{bar.symbol}: O={bar.open} H={bar.high} L={bar.low} C={bar.close} V={bar.volume}")

async def handle_quote(quote):
    """Process incoming quote data."""
    print(f"{quote.symbol}: Bid={quote.bid_price} Ask={quote.ask_price}")

async def handle_trade(trade):
    """Process incoming trade data."""
    print(f"{trade.symbol}: Price={trade.price} Size={trade.size}")

# Subscribe to data
stream.subscribe_bars(handle_bar, "AAPL", "GOOGL")
stream.subscribe_quotes(handle_quote, "AAPL")
stream.subscribe_trades(handle_trade, "AAPL")

# Run the stream
stream.run()
```

## Trading

### Account Information

```python
# Get account details
account = trading_client.get_account()

print(f"Cash: ${account.cash}")
print(f"Buying Power: ${account.buying_power}")
print(f"Portfolio Value: ${account.portfolio_value}")
print(f"Pattern Day Trader: {account.pattern_day_trader}")
```

### Placing Orders

```python
from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce

# Market order
market_order = MarketOrderRequest(
    symbol="AAPL",
    qty=10,
    side=OrderSide.BUY,
    time_in_force=TimeInForce.DAY
)
order = trading_client.submit_order(market_order)

# Limit order
limit_order = LimitOrderRequest(
    symbol="AAPL",
    qty=10,
    side=OrderSide.BUY,
    time_in_force=TimeInForce.GTC,
    limit_price=150.00
)
order = trading_client.submit_order(limit_order)

# Fractional shares (market order only)
fractional_order = MarketOrderRequest(
    symbol="AAPL",
    notional=100.00,  # Buy $100 worth
    side=OrderSide.BUY,
    time_in_force=TimeInForce.DAY
)
order = trading_client.submit_order(fractional_order)
```

### Order Types

| Order Type | Description |
|------------|-------------|
| `market` | Execute at current market price |
| `limit` | Execute at specified price or better |
| `stop` | Trigger market order when price reaches stop |
| `stop_limit` | Trigger limit order when price reaches stop |
| `trailing_stop` | Stop price trails market by amount/percent |

### Time in Force Options

| TIF | Description |
|-----|-------------|
| `DAY` | Valid for trading day |
| `GTC` | Good 'til canceled |
| `IOC` | Immediate or cancel |
| `FOK` | Fill or kill |
| `OPG` | Market on open |
| `CLS` | Market on close |

### Managing Orders

```python
# Get all open orders
open_orders = trading_client.get_orders()

# Get specific order
order = trading_client.get_order_by_id(order_id)

# Cancel order
trading_client.cancel_order_by_id(order_id)

# Cancel all open orders
trading_client.cancel_orders()
```

### Positions

```python
# Get all positions
positions = trading_client.get_all_positions()

for position in positions:
    print(f"{position.symbol}: {position.qty} shares @ ${position.avg_entry_price}")
    print(f"  Current: ${position.current_price}")
    print(f"  P&L: ${position.unrealized_pl} ({position.unrealized_plpc}%)")

# Get specific position
position = trading_client.get_open_position("AAPL")

# Close position
trading_client.close_position("AAPL")

# Close all positions
trading_client.close_all_positions()
```

## Rate Limits

| Plan | API Calls | Streaming Symbols |
|------|-----------|-------------------|
| Basic (Free) | 200/min | 30 symbols |
| Algo Trader Plus ($99/mo) | 10,000/min | Unlimited |

### Handling Rate Limits

```python
import time
from alpaca.common.exceptions import APIError

def safe_api_call(func, *args, max_retries=3, **kwargs):
    """Wrapper for API calls with rate limit handling."""
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except APIError as e:
            if e.status_code == 429:  # Rate limited
                wait_time = 2 ** attempt  # Exponential backoff
                time.sleep(wait_time)
            else:
                raise
    raise Exception("Max retries exceeded")
```

## Paper Trading

Paper trading provides a risk-free environment for testing strategies.

### Configuration

```python
# Use paper trading endpoint
trading_client = TradingClient(
    api_key=settings.ALPACA_API_KEY,
    secret_key=settings.ALPACA_SECRET_KEY,
    paper=True  # Enable paper trading
)
```

### Paper vs Live Comparison

| Feature | Paper | Live |
|---------|-------|------|
| Real money | No | Yes |
| Market data | Real-time | Real-time |
| Order execution | Simulated | Real |
| Account balance | $100,000 default | Your funds |
| Use case | Testing, development | Production |

## Data Persistence in Oracle

### Storing OHLCV Data

Oracle stores market data in TimescaleDB for efficient time-series queries.

```sql
-- OHLCV hypertable schema
CREATE TABLE market.ohlcv (
    time        TIMESTAMPTZ NOT NULL,
    symbol      TEXT NOT NULL,
    open        DECIMAL(12, 4),
    high        DECIMAL(12, 4),
    low         DECIMAL(12, 4),
    close       DECIMAL(12, 4),
    volume      BIGINT,
    vwap        DECIMAL(12, 4),
    trade_count INTEGER
);

-- Convert to hypertable
SELECT create_hypertable('market.ohlcv', 'time');

-- Add index for symbol queries
CREATE INDEX idx_ohlcv_symbol ON market.ohlcv (symbol, time DESC);
```

### Data Sync Service

```python
from datetime import datetime, timedelta
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame

class MarketDataSync:
    """Service to sync Alpaca data to local database."""

    def __init__(self, data_client, db_session):
        self.client = data_client
        self.db = db_session

    async def sync_daily_bars(self, symbols: list[str], days: int = 30):
        """Sync daily bars for given symbols."""
        request = StockBarsRequest(
            symbol_or_symbols=symbols,
            timeframe=TimeFrame.Day,
            start=datetime.now() - timedelta(days=days),
            end=datetime.now()
        )

        bars = self.client.get_stock_bars(request)

        for symbol, symbol_bars in bars.items():
            for bar in symbol_bars:
                await self.db.execute(
                    """
                    INSERT INTO market.ohlcv
                    (time, symbol, open, high, low, close, volume, vwap, trade_count)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (time, symbol) DO UPDATE SET
                        open = EXCLUDED.open,
                        high = EXCLUDED.high,
                        low = EXCLUDED.low,
                        close = EXCLUDED.close,
                        volume = EXCLUDED.volume
                    """,
                    bar.timestamp, symbol, bar.open, bar.high,
                    bar.low, bar.close, bar.volume, bar.vwap, bar.trade_count
                )
```

## WebSocket Integration for Real-time Features

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Alpaca    │     │   Oracle    │     │   Frontend  │
│  WebSocket  │────►│   Backend   │────►│  WebSocket  │
│   Stream    │     │  (FastAPI)  │     │   Client    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Backend WebSocket Handler

```python
from fastapi import WebSocket
from alpaca.data.live import StockDataStream

class MarketDataWebSocket:
    """Bridge between Alpaca stream and frontend clients."""

    def __init__(self):
        self.clients: list[WebSocket] = []
        self.stream = StockDataStream(api_key, secret_key)
        self.subscribed_symbols: set[str] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.clients.append(websocket)

    async def broadcast(self, data: dict):
        for client in self.clients:
            await client.send_json(data)

    async def handle_bar(self, bar):
        await self.broadcast({
            "type": "bar",
            "symbol": bar.symbol,
            "open": float(bar.open),
            "high": float(bar.high),
            "low": float(bar.low),
            "close": float(bar.close),
            "volume": int(bar.volume),
            "timestamp": bar.timestamp.isoformat()
        })

    def subscribe(self, symbols: list[str]):
        new_symbols = set(symbols) - self.subscribed_symbols
        if new_symbols:
            self.stream.subscribe_bars(self.handle_bar, *new_symbols)
            self.subscribed_symbols.update(new_symbols)
```

## Error Handling

```python
from alpaca.common.exceptions import APIError

try:
    order = trading_client.submit_order(order_request)
except APIError as e:
    if e.status_code == 403:
        # Insufficient buying power or other restriction
        logger.error(f"Order rejected: {e.message}")
    elif e.status_code == 422:
        # Invalid order parameters
        logger.error(f"Invalid order: {e.message}")
    elif e.status_code == 429:
        # Rate limited
        logger.warning("Rate limited, backing off...")
    else:
        logger.error(f"API error: {e}")
```

## Best Practices

1. **Use Paper Trading for Development**: Always use paper trading keys during development
2. **Handle Rate Limits**: Implement exponential backoff for rate limit errors
3. **Cache Market Data**: Store frequently accessed data in Redis to reduce API calls
4. **Use WebSocket for Real-time**: Prefer WebSocket over polling for live data
5. **Validate Orders**: Check buying power and position limits before submitting orders
6. **Log Everything**: Log all API calls and responses for debugging
7. **Handle Market Hours**: Check if market is open before placing orders

## References

- [Alpaca Documentation](https://docs.alpaca.markets/)
- [Alpaca Python SDK (alpaca-py)](https://github.com/alpacahq/alpaca-py)
- [Trading API Reference](https://docs.alpaca.markets/reference/getaccount)
- [Market Data API Reference](https://docs.alpaca.markets/reference/stockbars)
