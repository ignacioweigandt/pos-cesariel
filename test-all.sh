#!/bin/bash

# Complete test suite runner for POS Cesariel
# This script runs all tests across all components of the system

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if services are running
check_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    print_status "Checking if $service_name is running..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is running"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "$service_name is not responding after $max_attempts attempts"
            return 1
        fi
        
        print_status "Attempt $attempt/$max_attempts: Waiting for $service_name..."
        sleep 2
        ((attempt++))
    done
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists python3; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is required but not installed"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is required but not installed"
    exit 1
fi

if ! command_exists docker; then
    print_warning "Docker is not installed - some tests may be skipped"
fi

print_success "Prerequisites check completed"

# Start Docker services if docker-compose is available
if command_exists docker-compose && [ -f "docker-compose.yml" ]; then
    print_status "Starting Docker services..."
    docker-compose up -d db
    sleep 10
    print_success "Docker services started"
fi

# Initialize variables
BACKEND_TESTS_PASSED=false
POS_FRONTEND_TESTS_PASSED=false
ECOMMERCE_FRONTEND_TESTS_PASSED=false
INTEGRATION_TESTS_PASSED=false
E2E_TESTS_PASSED=false

# 1. Backend Tests
print_status "============================================"
print_status "RUNNING BACKEND TESTS"
print_status "============================================"

cd backend

# Install backend dependencies
if [ -f "requirements.txt" ]; then
    print_status "Installing backend dependencies..."
    pip install -r requirements.txt
    print_success "Backend dependencies installed"
else
    print_error "requirements.txt not found"
    exit 1
fi

# Setup test database
print_status "Setting up test database..."
python -c "from database import init_db; init_db()" || {
    print_error "Failed to initialize test database"
    exit 1
}
print_success "Test database initialized"

# Run backend tests
print_status "Running backend unit tests..."
if python test_runner.py unit --verbose; then
    print_success "Backend unit tests passed"
else
    print_error "Backend unit tests failed"
fi

print_status "Running backend integration tests..."
if python test_runner.py integration --verbose; then
    print_success "Backend integration tests passed"
    BACKEND_TESTS_PASSED=true
else
    print_error "Backend integration tests failed"
fi

print_status "Running backend tests with coverage..."
if python test_runner.py coverage; then
    print_success "Backend coverage tests passed"
else
    print_error "Backend coverage tests failed"
fi

cd ..

# 2. POS Frontend Tests
print_status "============================================"
print_status "RUNNING POS FRONTEND TESTS"
print_status "============================================"

cd frontend/pos-cesariel

# Install POS frontend dependencies
if [ -f "package.json" ]; then
    print_status "Installing POS frontend dependencies..."
    npm ci
    print_success "POS frontend dependencies installed"
else
    print_error "package.json not found in POS frontend"
    exit 1
fi

# Run POS frontend tests
print_status "Running POS frontend unit tests..."
if npm run test:coverage; then
    print_success "POS frontend tests passed"
    POS_FRONTEND_TESTS_PASSED=true
else
    print_error "POS frontend tests failed"
fi

print_status "Running POS frontend linting..."
if npm run lint; then
    print_success "POS frontend linting passed"
else
    print_warning "POS frontend linting issues found"
fi

print_status "Building POS frontend..."
if npm run build; then
    print_success "POS frontend build successful"
else
    print_error "POS frontend build failed"
fi

cd ../..

# 3. E-commerce Frontend Tests
print_status "============================================"
print_status "RUNNING E-COMMERCE FRONTEND TESTS"
print_status "============================================"

cd ecommerce

# Install E-commerce frontend dependencies
if [ -f "package.json" ]; then
    print_status "Installing E-commerce frontend dependencies..."
    npm ci --legacy-peer-deps
    print_success "E-commerce frontend dependencies installed"
else
    print_error "package.json not found in E-commerce frontend"
    exit 1
fi

# Run E-commerce frontend tests
print_status "Running E-commerce frontend unit tests..."
if npm run test:coverage; then
    print_success "E-commerce frontend tests passed"
    ECOMMERCE_FRONTEND_TESTS_PASSED=true
else
    print_error "E-commerce frontend tests failed"
fi

print_status "Running E-commerce frontend linting..."
if npm run lint; then
    print_success "E-commerce frontend linting passed"
else
    print_warning "E-commerce frontend linting issues found"
fi

print_status "Building E-commerce frontend..."
if npm run build; then
    print_success "E-commerce frontend build successful"
else
    print_error "E-commerce frontend build failed"
fi

cd ..

# 4. Integration Tests (if all unit tests passed)
if [ "$BACKEND_TESTS_PASSED" = true ] && [ "$POS_FRONTEND_TESTS_PASSED" = true ] && [ "$ECOMMERCE_FRONTEND_TESTS_PASSED" = true ]; then
    print_status "============================================"
    print_status "RUNNING INTEGRATION TESTS"
    print_status "============================================"
    
    # Start backend server
    print_status "Starting backend server for integration tests..."
    cd backend
    python -c "from init_data import main; main()" # Initialize test data
    python main.py &
    BACKEND_PID=$!
    sleep 15
    
    if check_service "http://localhost:8000/health" "Backend API"; then
        # Run integration tests
        print_status "Running integration tests..."
        if python test_runner.py integration --verbose; then
            print_success "Integration tests passed"
            INTEGRATION_TESTS_PASSED=true
        else
            print_error "Integration tests failed"
        fi
    else
        print_error "Backend server failed to start"
    fi
    
    # Stop backend server
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    cd ..
else
    print_warning "Skipping integration tests due to unit test failures"
fi

# 5. E2E Tests (if integration tests passed)
if [ "$INTEGRATION_TESTS_PASSED" = true ]; then
    print_status "============================================"
    print_status "RUNNING E2E TESTS"
    print_status "============================================"
    
    # Start all services
    print_status "Starting all services for E2E tests..."
    
    # Start backend
    cd backend
    python main.py &
    BACKEND_PID=$!
    sleep 10
    cd ..
    
    # Start POS frontend
    cd frontend/pos-cesariel
    npm start &
    POS_PID=$!
    sleep 10
    cd ../..
    
    # Start E-commerce frontend
    cd ecommerce
    npm start &
    ECOMMERCE_PID=$!
    sleep 10
    cd ..
    
    # Check all services
    if check_service "http://localhost:8000/health" "Backend API" && \
       check_service "http://localhost:3000" "POS Frontend" && \
       check_service "http://localhost:3001" "E-commerce Frontend"; then
        
        print_status "All services are running, starting E2E tests..."
        
        # Run POS E2E tests
        print_status "Running POS E2E tests..."
        cd frontend/pos-cesariel
        if npm run test:e2e; then
            print_success "POS E2E tests passed"
        else
            print_error "POS E2E tests failed"
        fi
        cd ../..
        
        # Run E-commerce E2E tests
        print_status "Running E-commerce E2E tests..."
        cd ecommerce
        if npm run test:e2e; then
            print_success "E-commerce E2E tests passed"
            E2E_TESTS_PASSED=true
        else
            print_error "E-commerce E2E tests failed"
        fi
        cd ..
        
    else
        print_error "Failed to start all services for E2E tests"
    fi
    
    # Stop all services
    print_status "Stopping services..."
    [ ! -z "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null || true
    [ ! -z "$POS_PID" ] && kill $POS_PID 2>/dev/null || true
    [ ! -z "$ECOMMERCE_PID" ] && kill $ECOMMERCE_PID 2>/dev/null || true
    
    # Wait a bit for processes to stop
    sleep 5
    
else
    print_warning "Skipping E2E tests due to integration test failures"
fi

# Performance Tests (optional, run on success)
if [ "$E2E_TESTS_PASSED" = true ]; then
    print_status "============================================"
    print_status "RUNNING PERFORMANCE TESTS (OPTIONAL)"
    print_status "============================================"
    
    cd frontend/pos-cesariel
    
    # Run Lighthouse tests if available
    if npm run test:lighthouse 2>/dev/null; then
        print_success "Lighthouse performance tests passed"
    else
        print_warning "Lighthouse tests not available or failed"
    fi
    
    # Run load tests if available
    if npm run test:load 2>/dev/null; then
        print_success "Load tests passed"
    else
        print_warning "Load tests not available or failed"
    fi
    
    cd ../..
fi

# Stop Docker services
if command_exists docker-compose && [ -f "docker-compose.yml" ]; then
    print_status "Stopping Docker services..."
    docker-compose down
fi

# Test Summary
print_status "============================================"
print_status "TEST SUMMARY"
print_status "============================================"

echo -e "Backend Tests:              $([ "$BACKEND_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
echo -e "POS Frontend Tests:         $([ "$POS_FRONTEND_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
echo -e "E-commerce Frontend Tests:  $([ "$ECOMMERCE_FRONTEND_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
echo -e "Integration Tests:          $([ "$INTEGRATION_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED/SKIPPED${NC}")"
echo -e "E2E Tests:                  $([ "$E2E_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED/SKIPPED${NC}")"

# Final result
if [ "$BACKEND_TESTS_PASSED" = true ] && [ "$POS_FRONTEND_TESTS_PASSED" = true ] && [ "$ECOMMERCE_FRONTEND_TESTS_PASSED" = true ]; then
    if [ "$INTEGRATION_TESTS_PASSED" = true ] && [ "$E2E_TESTS_PASSED" = true ]; then
        print_success "🎉 ALL TESTS PASSED! System is ready for deployment."
        exit 0
    else
        print_warning "⚠️  Core tests passed but some integration/E2E tests failed."
        exit 1
    fi
else
    print_error "❌ Some core tests failed. Please fix the issues before proceeding."
    exit 1
fi