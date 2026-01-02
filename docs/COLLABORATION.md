# Oracle Collaboration Guide

Welcome to Oracle! This guide helps contributors understand how to participate in the project effectively.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Git

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/oracle.git
cd oracle

# Copy environment file
cp .env.example .env

# Start infrastructure
docker-compose up -d

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

## Contribution Workflow

### 1. Find an Issue

- Check [GitHub Issues](https://github.com/yourusername/oracle/issues) for open tasks
- Look for issues labeled `good first issue` if you're new
- Check `README.md` for P0/P1/P2 priority items

### 2. Create a Branch

```bash
# Feature branch
git checkout -b feat/your-feature-name

# Bug fix branch
git checkout -b fix/bug-description

# Documentation branch
git checkout -b docs/what-you-documented
```

### 3. Make Changes

- Follow code style guidelines in `.claude/claude.md`
- Write tests for new features
- Update documentation if needed
- Keep commits focused and atomic

### 4. Test Your Changes

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test

# Linting
npm run lint  # Frontend
ruff check .  # Backend
```

### 5. Submit a Pull Request

- Write a clear PR description
- Reference related issues
- Ensure CI passes
- Request review from maintainers

## Code Review Guidelines

### For Authors

- Keep PRs focused and reasonably sized
- Respond to feedback promptly
- Be open to suggestions

### For Reviewers

- Be constructive and specific
- Approve when satisfied, don't block on minor issues
- Use suggestions for small fixes

## Communication

### Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, general discussion
- **Discord** (if applicable): Real-time chat

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- No harassment or discrimination

## Project Structure

```
oracle/
├── frontend/          # React application
├── backend/           # Python API server
├── flink-jobs/        # Stream processing jobs
├── docs/              # Documentation
│   ├── CONTEXT.md     # Project context
│   ├── PROGRESS.md    # Development progress
│   ├── COLLABORATION.md  # This file
│   └── COMMERCIAL.md  # Licensing info
├── .claude/           # AI assistant config
├── AGENT.md           # AI instructions
└── README.md          # Main documentation
```

## Component Ownership

| Component | Primary Focus |
|-----------|---------------|
| Authentication | User management, security |
| Strategy Builder | ReactFlow integration, node types |
| Backtest Engine | Simulation, metrics calculation |
| Bot Scheduler | Job scheduling, execution |
| Data Service | Alpaca integration, data storage |
| Frontend | React components, UX |

## Testing Standards

### Backend (Python)

- Use pytest for all tests
- Aim for >80% coverage on critical paths
- Use fixtures for common setup
- Mock external APIs

```python
@pytest.fixture
async def auth_client(client, test_user):
    """Authenticated test client."""
    token = create_access_token(test_user.id)
    client.headers["Authorization"] = f"Bearer {token}"
    return client
```

### Frontend (TypeScript)

- Use Vitest + React Testing Library
- Test component behavior, not implementation
- Mock API calls with MSW

```typescript
test('submits strategy form', async () => {
  render(<StrategyForm />);
  await userEvent.type(screen.getByLabelText('Name'), 'My Strategy');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(mockCreateStrategy).toHaveBeenCalled();
});
```

## Documentation

- Update README.md for architectural changes
- Update PROGRESS.md when completing features
- Add inline comments for complex logic
- Write docstrings for public APIs

## Release Process

1. Features merged to `main` branch
2. Version bump and changelog update
3. Create GitHub release with tag
4. CI/CD deploys to production

## Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes for significant contributions
- README acknowledgments for major features

## Questions?

- Open a GitHub Discussion for general questions
- Tag maintainers in issues for urgent matters
- Check existing documentation first

---

Thank you for contributing to Oracle!
