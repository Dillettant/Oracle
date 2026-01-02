# Claude Code Preferences for Oracle

## Project Context

Oracle is a quantitative trading platform. This file defines coding preferences and styles for Claude Code when working on this project.

## Language Preferences

### Primary Languages
- **Backend**: Python 3.11+
- **Frontend**: TypeScript (strict mode)
- **Database**: PostgreSQL with SQL
- **Streaming**: Python (PyFlink) or Scala (Flink)

### Language-Specific Guidelines

#### Python
```python
# Use modern Python syntax
from typing import Optional, List
from pydantic import BaseModel

# Prefer union types over Optional
def get_user(id: int) -> User | None:
    ...

# Use dataclasses or Pydantic for data structures
class UserCreate(BaseModel):
    email: str
    password: str

# Use async/await for I/O
async def fetch_market_data(symbol: str) -> MarketData:
    ...

# Use context managers for resources
async with async_session() as session:
    ...
```

#### TypeScript
```typescript
// Use strict typing, avoid 'any'
interface Strategy {
  id: string;
  name: string;
  nodes: StrategyNode[];
}

// Use functional components
const StrategyCard: React.FC<StrategyCardProps> = ({ strategy }) => {
  ...
};

// Use hooks for state and effects
const [strategies, setStrategies] = useState<Strategy[]>([]);

// Use React Query for server state
const { data, isLoading } = useQuery(['strategies'], fetchStrategies);
```

## Code Style

### Formatting
- Python: Black formatter, 88 char line length
- TypeScript: Prettier, 100 char line length
- Use 2-space indentation for TypeScript/JSON
- Use 4-space indentation for Python

### Naming Conventions
| Type | Python | TypeScript |
|------|--------|------------|
| Variables | snake_case | camelCase |
| Functions | snake_case | camelCase |
| Classes | PascalCase | PascalCase |
| Constants | UPPER_SNAKE | UPPER_SNAKE |
| Files | snake_case.py | kebab-case.tsx |

### Import Order
Python:
1. Standard library
2. Third-party packages
3. Local imports

TypeScript:
1. React/external libraries
2. Components
3. Hooks/utilities
4. Types
5. Styles

## File Organization

### Backend Structure
```
backend/app/
├── api/
│   └── routes/          # One file per resource
├── core/
│   ├── config.py        # Settings with Pydantic
│   └── security.py      # Auth utilities
├── models/              # SQLAlchemy models
├── schemas/             # Pydantic schemas
├── services/            # Business logic
└── main.py
```

### Frontend Structure
```
frontend/src/
├── components/
│   ├── common/          # Reusable UI components
│   └── [feature]/       # Feature-specific components
├── hooks/               # Custom React hooks
├── pages/               # Route pages
├── services/            # API clients
├── store/               # Zustand stores
└── types/               # TypeScript types
```

## Preferred Libraries

### Python
- FastAPI (web framework)
- SQLAlchemy 2.0 (ORM)
- Pydantic v2 (validation)
- Alembic (migrations)
- pytest (testing)
- httpx (HTTP client)
- python-jose (JWT)
- passlib (password hashing)

### TypeScript
- React 18 (UI framework)
- ReactFlow (node editor)
- TailwindCSS (styling)
- Zustand (state management)
- React Query/TanStack Query (data fetching)
- Zod (validation)
- Vitest (testing)
- Axios (HTTP client)

## Error Handling

### Python
```python
# Use custom exceptions
class StrategyNotFoundError(Exception):
    def __init__(self, strategy_id: str):
        self.strategy_id = strategy_id
        super().__init__(f"Strategy {strategy_id} not found")

# Use FastAPI exception handlers
@app.exception_handler(StrategyNotFoundError)
async def strategy_not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"detail": str(exc)})
```

### TypeScript
```typescript
// Use try-catch with typed errors
try {
  await createStrategy(data);
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
  }
}
```

## Testing Patterns

### Python
```python
# Use pytest fixtures
@pytest.fixture
async def test_user(db_session):
    user = User(email="test@example.com")
    db_session.add(user)
    await db_session.commit()
    return user

# Use async tests
@pytest.mark.asyncio
async def test_create_strategy(client, test_user):
    response = await client.post("/strategies", json={...})
    assert response.status_code == 201
```

### TypeScript
```typescript
// Use React Testing Library
import { render, screen } from '@testing-library/react';

test('renders strategy name', () => {
  render(<StrategyCard strategy={mockStrategy} />);
  expect(screen.getByText('My Strategy')).toBeInTheDocument();
});
```

## Documentation

- Add docstrings to all public functions (Python)
- Add JSDoc comments for complex functions (TypeScript)
- Keep README.md updated with architecture changes
- Update PROGRESS.md when completing features

## Git Commit Messages

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructure
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(auth): add Google OAuth login
fix(backtest): correct Sharpe ratio calculation
docs(readme): update architecture diagram
```

## Security Rules

1. Never hardcode secrets - use environment variables
2. Always validate user input with Pydantic/Zod
3. Use parameterized queries (SQLAlchemy handles this)
4. Hash passwords with bcrypt (passlib)
5. Use JWT with short expiration for auth
6. Rate limit sensitive endpoints
7. Sanitize data before displaying (React handles this)
