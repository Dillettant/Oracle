"""Service for backtest CRUD operations."""

from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.backtest import Backtest
from app.schemas.backtest import BacktestCreate, BacktestUpdate


class BacktestService:
    """Service for managing backtests."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_user(self, user_id: str) -> list[Backtest]:
        """List backtests for a user."""
        result = await self.db.execute(
            select(Backtest).where(Backtest.user_id == user_id).order_by(Backtest.created_at)
        )
        return list(result.scalars().all())

    async def get_by_id(self, backtest_id: str, user_id: str) -> Backtest | None:
        """Get a backtest by id scoped to a user."""
        result = await self.db.execute(
            select(Backtest).where(
                Backtest.id == backtest_id,
                Backtest.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, user_id: str, payload: BacktestCreate) -> Backtest:
        """Create a new backtest."""
        backtest = Backtest(
            user_id=user_id,
            strategy_id=payload.strategy_id,
            start_date=payload.start_date,
            end_date=payload.end_date,
            initial_capital=payload.initial_capital,
        )
        self.db.add(backtest)
        await self.db.flush()
        await self.db.refresh(backtest)
        return backtest

    async def update(self, backtest: Backtest, payload: BacktestUpdate) -> Backtest:
        """Update a backtest."""
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(backtest, key, value)
        await self.db.flush()
        await self.db.refresh(backtest)
        return backtest

    async def delete(self, backtest: Backtest) -> None:
        """Delete a backtest."""
        await self.db.delete(backtest)
        await self.db.flush()

    def _build_stub_results(self, initial_capital: float) -> dict[str, object]:
        total_return = round(initial_capital * 0.0825, 2)
        equity_end = round(initial_capital + total_return, 2)
        return {
            "summary": {
                "initial_capital": initial_capital,
                "ending_capital": equity_end,
                "total_return": total_return,
                "total_return_pct": round((total_return / initial_capital) * 100, 2),
                "sharpe": 1.31,
                "max_drawdown_pct": -6.4,
                "trades": 24,
                "win_rate_pct": 58.3,
            },
            "timeline": [
                {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "equity": equity_end,
                }
            ],
        }

    async def mark_running(self, backtest: Backtest) -> Backtest:
        """Mark a backtest as running."""
        backtest.status = "running"
        await self.db.flush()
        await self.db.refresh(backtest)
        return backtest

    async def complete(self, backtest: Backtest) -> Backtest:
        """Complete a backtest with stubbed results."""
        initial_capital = float(backtest.initial_capital)
        backtest.status = "completed"
        backtest.results_json = self._build_stub_results(initial_capital)
        await self.db.flush()
        await self.db.refresh(backtest)
        return backtest
