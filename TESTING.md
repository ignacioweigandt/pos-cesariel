# Testing Guide - POS Cesariel

This document describes the comprehensive testing setup and practices for the POS Cesariel application, covering both backend and frontend testing strategies.

## Overview

The POS Cesariel application uses a multi-layered testing approach:

- **Backend**: pytest with FastAPI TestClient
- **Frontend**: Jest + React Testing Library
- **End-to-End**: Cypress
- **Integration**: Docker-based testing
- **Performance**: Lighthouse CI
- **Load**: Artillery

## Backend Testing (FastAPI + pytest)

### Test Structure

```
backend/
├── pytest.ini              # pytest configuration
├── tests/
│   ├── conftest.py          # Test fixtures and setup
│   ├── unit/                # Unit tests
│   │   └── test_auth.py     
│   ├── integration/         # Integration tests
│   │   ├── test_auth_endpoints.py
│   │   ├── test_products_api.py
│   │   ├── test_sales_api.py
│   │   ├── test_inventory_enhancements.py  # New inventory features
│   │   └── test_websockets.py
│   └── fixtures/            # Test data fixtures
```

### Running Backend Tests

```bash
# From project root
make shell-backend

# Inside backend container
pytest                       # Run all tests
pytest -v                   # Verbose output
pytest -x                   # Stop on first failure
pytest --tb=short          # Short traceback format

# Run specific test categories
pytest -m unit              # Unit tests only
pytest -m integration       # Integration tests only
pytest -m auth              # Authentication tests
pytest -m websocket         # WebSocket tests

# Run specific test files
pytest tests/integration/test_inventory_enhancements.py

# Run with coverage
pytest --cov=.              # With coverage report
pytest --cov=. --cov-report=html:htmlcov  # HTML coverage report
```

### Test Configuration

Key configuration in `pytest.ini`:
- Coverage threshold: 80%
- Test markers for categorization
- Auto-detection of async tests
- HTML coverage reports

### Backend Test Features

#### Authentication Tests
- JWT token generation and validation
- Role-based access control (ADMIN, MANAGER, SELLER)
- Session management

#### Product API Tests
- CRUD operations for products
- Search and filtering
- Barcode scanning
- Stock management
- Category management

#### Inventory Enhancement Tests (New)
- CSV/Excel bulk import functionality
- Multi-branch stock management
- Size-based inventory (clothing/footwear)
- Import logging and error handling

#### Sales API Tests
- POS transaction processing
- Payment method validation
- Sales reporting
- Inventory updates on sales

#### WebSocket Tests
- Real-time notifications
- Inventory change broadcasts
- Multi-branch communication

### Key Test Fixtures

```python
# Available fixtures in conftest.py
@pytest.fixture
def client(db_session):
    """FastAPI test client with database override"""

@pytest.fixture
def test_admin_user(db_session, test_branch):
    """Test admin user with full permissions"""

@pytest.fixture
def auth_headers_admin(client, test_admin_user):
    """Authentication headers for admin user"""

@pytest.fixture
def test_product_with_sizes(db_session, test_clothing_category):
    """Product with size management enabled"""

@pytest.fixture
def mock_websocket_manager(mocker):
    """Mock WebSocket manager for testing"""
```

### Example Backend Test

```python
@pytest.mark.integration
def test_import_products_csv_success(client, auth_headers_admin, mock_websocket_manager):
    """Test successful CSV import of products."""
    csv_content = """codigo_barra,modelo,efectivo
1234567890001,Producto Test 1,25.99
1234567890002,Producto Test 2,35.50"""
    
    files = {'file': ('test.csv', csv_content.encode('utf-8'), 'text/csv')}
    
    response = client.post("/products/import", headers=auth_headers_admin, files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_rows"] == 2
    assert data["successful_rows"] == 2
    assert data["failed_rows"] == 0
```

## Frontend Testing (Next.js + Jest)

### Test Structure

```
frontend/pos-cesariel/
├── jest.config.js           # Jest configuration
├── jest.setup.js            # Global test setup
├── __tests__/
│   ├── components/          # Component tests
│   │   ├── NotificationCenter.test.tsx
│   │   ├── ImportModal.test.tsx
│   │   ├── SizeStockModal.test.tsx
│   │   └── ...
│   ├── lib/                 # Library tests
│   │   ├── auth.test.ts
│   │   ├── api.test.ts
│   │   └── ...
│   └── utils/               # Utility tests
├── cypress/                 # E2E tests
│   ├── e2e/
│   ├── support/
│   └── fixtures/
```

### Running Frontend Tests

```bash
# From frontend directory
npm test                     # Run all tests
npm run test:watch           # Watch mode
npm run test:coverage        # With coverage

# E2E tests
npm run cypress:open         # Interactive mode
npm run test:e2e            # Headless mode

# Performance tests
npm run test:lighthouse      # Performance audit

# Load tests
npm run test:load           # Artillery load testing
```

### Frontend Test Features

#### Component Testing
- React component rendering
- User interaction simulation
- Props and state validation
- Accessibility testing

#### New Inventory Components
- **ImportModal**: File upload, validation, API integration
- **SizeStockModal**: Size management, stock calculations, form validation

#### Integration Testing
- API client functionality
- Authentication flow
- WebSocket connections
- State management (Zustand)

### Example Frontend Test

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImportModal from '@/components/ImportModal'

describe('ImportModal', () => {
  it('handles successful import', async () => {
    const user = userEvent.setup()
    const onImportSuccess = jest.fn()
    
    render(<ImportModal isOpen={true} onImportSuccess={onImportSuccess} />)
    
    const file = new File(['codigo_barra,modelo,efectivo\n123,Test,10.99'], 'test.csv')
    const input = screen.getByDisplayValue('').closest('input')!
    await user.upload(input, file)
    
    const uploadButton = screen.getByRole('button', { name: /importar/i })
    await user.click(uploadButton)
    
    await waitFor(() => {
      expect(screen.getByText('Importación exitosa')).toBeInTheDocument()
    })
    
    expect(onImportSuccess).toHaveBeenCalledTimes(1)
  })
})
```

## Integration Testing Strategy

### Docker-based Testing

The application uses Docker Compose for consistent testing environments:

```bash
# Start complete testing environment
make dev                     # Start all services
make shell-backend          # Access backend for testing
make shell-frontend         # Access frontend for testing

# Database testing
make shell-db               # Direct database access
```

### Test Data Setup

```bash
# Initialize test data (run once)
make shell-backend
python init_data.py

# Test users available:
# - admin / admin123 (full access)
# - manager / manager123 (branch management)
# - seller / seller123 (POS operations)
```

### Cross-service Testing

Integration tests verify:
- API endpoints with database persistence
- WebSocket real-time communication
- File upload and processing
- Multi-branch data synchronization
- Authentication across services

## Continuous Integration

### Test Automation Pipeline

```yaml
# Example GitHub Actions workflow
name: Test Suite
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Start services
        run: docker-compose up -d
      - name: Run backend tests
        run: |
          docker-compose exec backend pytest --cov=. --cov-fail-under=80
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci --legacy-peer-deps
      - name: Run unit tests
        run: npm run test:coverage
      - name: Run E2E tests
        run: npm run test:e2e
```

### Quality Gates

- **Backend**: 80% code coverage minimum
- **Frontend**: 70% code coverage minimum
- **E2E**: Critical user journeys must pass
- **Performance**: Lighthouse scores above thresholds
- **Load**: Response times under 2 seconds

## Test Data Management

### Backend Test Data

```python
# Key test entities created by fixtures
- Branches: "Test Branch", "Secondary Branch"
- Users: Admin, Manager, Seller with different permissions
- Categories: "Indumentaria", "Calzado", "Electrónicos"
- Products: Regular and size-enabled products
- Import logs and stock data
```

### Frontend Test Data

```json
// cypress/fixtures/users.json
{
  "admin": {"username": "admin", "password": "admin123"},
  "manager": {"username": "manager", "password": "manager123"},
  "seller": {"username": "seller", "password": "seller123"}
}
```

## Performance Testing

### Lighthouse Configuration

Key metrics tracked:
- Performance: 80+ required
- Accessibility: 90+ required
- Best Practices: 90+ required
- SEO: 80+ required

### Load Testing Scenarios

Artillery simulates:
- **40%** - Dashboard browsing and reporting
- **30%** - POS transactions and sales
- **20%** - Inventory management operations
- **10%** - Administrative tasks

Load test phases:
1. **Warm-up**: 10 users/second for 1 minute
2. **Load test**: 25 users/second for 5 minutes
3. **Peak load**: 50 users/second for 1 minute

## Best Practices

### Backend Testing
- Use dependency injection for database sessions
- Mock external services (WebSocket, file uploads)
- Test both success and error scenarios
- Verify database state changes
- Test authorization and authentication

### Frontend Testing
- Test user interactions, not implementation details
- Mock API calls consistently
- Use semantic queries (getByRole, getByText)
- Test accessibility requirements
- Verify loading and error states

### Integration Testing
- Test complete user workflows
- Verify data persistence across services
- Test real-time features end-to-end
- Validate error handling across boundaries
- Test with realistic data volumes

## Debugging Tests

### Backend Debug
```bash
# Run tests with debugger
pytest --pdb                 # Drop into debugger on failure
pytest -s                   # Show print statements
pytest -vvv                 # Maximum verbosity

# Debug specific test
pytest tests/integration/test_inventory_enhancements.py::TestInventoryEnhancements::test_import_products_csv_success -vvv
```

### Frontend Debug
```bash
# Debug Jest tests
npm test -- --no-coverage   # Run without coverage for debugging
npm test -- --verbose       # Verbose output

# Debug Cypress tests
npm run cypress:open         # Interactive debugging
```

## Coverage Reports

### Viewing Coverage

```bash
# Backend coverage
pytest --cov=. --cov-report=html:htmlcov
open htmlcov/index.html

# Frontend coverage
npm run test:coverage
open coverage/lcov-report/index.html
```

### Coverage Goals

- **Critical paths**: 95%+ coverage
- **Business logic**: 90%+ coverage
- **UI components**: 80%+ coverage
- **Overall project**: 80%+ coverage

## Troubleshooting

### Common Issues

**Backend tests fail with database connection errors**
- Ensure PostgreSQL container is running
- Check database initialization with `python init_data.py`
- Verify test database isolation

**Frontend tests fail with module resolution errors**
- Check `tsconfig.json` paths configuration
- Verify `jest.config.js` moduleNameMapping
- Ensure all dependencies are installed

**E2E tests timeout or fail**
- Verify backend is running and accessible
- Check test data exists in database
- Increase timeout values in Cypress configuration

**WebSocket tests fail**
- Ensure WebSocket mocking is properly configured
- Check async/await patterns in tests
- Verify WebSocket manager initialization

### Performance Issues

**Slow test execution**
- Use test database with minimal data
- Mock expensive operations
- Run tests in parallel where possible
- Use test-specific configurations

**Memory leaks in tests**
- Properly clean up test resources
- Reset mocks between tests
- Clear state in teardown methods

## Future Enhancements

### Planned Improvements
- [ ] Visual regression testing with Percy/Chromatic
- [ ] API contract testing with Pact
- [ ] Mobile device testing
- [ ] Security testing automation
- [ ] Cross-browser testing matrix
- [ ] Performance regression detection
- [ ] Database migration testing
- [ ] Backup/restore testing

### Test Coverage Expansion
- [ ] Increase backend coverage to 90%
- [ ] Add component visual tests
- [ ] Expand E2E test scenarios
- [ ] Add stress testing scenarios
- [ ] Implement mutation testing

This testing strategy ensures comprehensive coverage of the POS Cesariel application, from individual units to complete user workflows, while maintaining high quality and performance standards.