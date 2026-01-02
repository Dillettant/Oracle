# Oracle - AI Agent Instructions

This document provides instructions for AI agents (Claude, GPT, etc.) working on the Oracle codebase.

## Project Overview

Oracle is a quantitative trading platform with:
- **Frontend**: React + TypeScript + ReactFlow
- **Backend**: Python + FastAPI
- **Database**: PostgreSQL (with TimescaleDB extension)
- **Streaming**: Apache Flink
- **Deployment**: Vercel (frontend), Docker (backend)

## Key Directories

```
oracle/
├── frontend/          # React application
├── backend/           # Python FastAPI server
├── flink-jobs/        # Apache Flink streaming jobs
├── docs/              # Documentation and context
└── .claude/           # Claude Code preferences
```

## Code Style Guidelines

### Python (Backend)

- Use Python 3.11+
- Follow PEP 8 style guide
- Use type hints for all function signatures
- Use `async/await` for I/O operations
- Prefer Pydantic models for data validation
- Use SQLAlchemy 2.0 style (async sessions)

```python
# Good
async def get_user(user_id: int) -> User | None:
    async with async_session() as session:
        return await session.get(User, user_id)

# Bad
def get_user(user_id):
    return session.query(User).get(user_id)
```

### TypeScript (Frontend)

- Use TypeScript strict mode
- Use functional components with hooks
- Use Zustand for state management
- Use React Query for server state
- Use TailwindCSS for styling

```typescript
// Good
interface UserProps {
  userId: string;
  onUpdate: (user: User) => void;
}

const UserCard: React.FC<UserProps> = ({ userId, onUpdate }) => {
  // ...
};

// Bad
function UserCard(props: any) {
  // ...
}
```

### SQL/Database

- Use Alembic for all migrations
- Never modify production data directly
- Use meaningful table and column names
- Always add indexes for foreign keys

## Important Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview, architecture, work items |
| `docs/CONTEXT.md` | Detailed project context |
| `docs/PROGRESS.md` | Development progress tracking |
| `.env.example` | Required environment variables |
| `docker-compose.yml` | Local development infrastructure |

## Common Tasks

### Adding a New API Endpoint

1. Create Pydantic schema in `backend/app/schemas/`
2. Add SQLAlchemy model if needed in `backend/app/models/`
3. Implement service logic in `backend/app/services/`
4. Add route in `backend/app/api/routes/`
5. Write tests in `backend/tests/`

### Adding a New React Component

1. Create component in appropriate `frontend/src/components/` subdirectory
2. Add types/interfaces at top of file
3. Export from index file
4. Add to page if needed

### Adding a Database Migration

```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Architecture Decisions

### Why FastAPI over Flask/Django?
- Native async support
- Automatic OpenAPI documentation
- Pydantic integration for validation
- Better performance for real-time features

### Why ReactFlow for Strategy Builder?
- Purpose-built for node-based editors
- Excellent customization options
- Active community and maintenance
- Good TypeScript support

### Why PostgreSQL with TimescaleDB?
- Robust ACID compliance for trading data
- TimescaleDB for efficient time-series storage
- Mature ecosystem and tooling
- Excellent Python/JS driver support

## Testing Guidelines

- Write tests for all new features
- Maintain >80% code coverage for critical paths
- Use pytest for Python tests
- Use Vitest for React tests
- Mock external APIs (Alpaca, Google OAuth)

## Security Considerations

- Never commit secrets or API keys
- Use environment variables for all credentials
- Sanitize all user inputs
- Use parameterized queries (SQLAlchemy handles this)
- Validate JWT tokens on every request
- Rate limit API endpoints

## When Making Changes

1. Check `README.md` for component priorities (P0/P1/P2)
2. Update `docs/PROGRESS.md` after completing features
3. Run tests before committing
4. Follow the existing code patterns
5. Update documentation if adding new features

## Getting Help

- Check `docs/CONTEXT.md` for detailed context
- Review `docs/COLLABORATION.md` for contribution guidelines
- Check existing code for patterns and examples
