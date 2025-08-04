#!/bin/bash

# SentinelX Test Suite Runner
# This script runs comprehensive tests for the SentinelX project

echo "🛡️  SentinelX Test Suite"
echo "=========================="

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

# Check if services are running
check_services() {
    print_status "Checking if SentinelX services are running..."
    
    # Check backend
    if curl -s http://localhost:8000/health > /dev/null; then
        print_success "Backend is running on port 8000"
        BACKEND_RUNNING=true
    else
        print_warning "Backend is not running on port 8000"
        BACKEND_RUNNING=false
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend is running on port 3000"
        FRONTEND_RUNNING=true
    else
        print_warning "Frontend is not running on port 3000"
        FRONTEND_RUNNING=false
    fi
}

# Start services if not running
start_services() {
    if [ "$BACKEND_RUNNING" = false ]; then
        print_status "Starting backend service..."
        cd backend
        source venv/bin/activate 2>/dev/null || true
        python main.py &
        BACKEND_PID=$!
        cd ..
        sleep 5
    fi
    
    if [ "$FRONTEND_RUNNING" = false ]; then
        print_status "Starting frontend service..."
        cd frontend
        npm start &
        FRONTEND_PID=$!
        cd ..
        sleep 10
    fi
}

# Cleanup function
cleanup() {
    print_status "Cleaning up test processes..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Run backend tests
run_backend_tests() {
    print_status "Running backend API tests..."
    cd backend
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install test dependencies if needed
    pip install pytest-cov pytest-html > /dev/null 2>&1
    
    # Run tests
    if python -m pytest tests/ -v --cov=. --cov-report=html --cov-report=term; then
        print_success "Backend tests passed!"
        BACKEND_TESTS_PASSED=true
    else
        print_error "Backend tests failed!"
        BACKEND_TESTS_PASSED=false
    fi
    
    cd ..
}

# Run frontend unit tests
run_frontend_unit_tests() {
    print_status "Running frontend unit tests..."
    cd frontend
    
    # Run Jest tests
    if CI=true npm test -- --coverage --watchAll=false; then
        print_success "Frontend unit tests passed!"
        FRONTEND_UNIT_TESTS_PASSED=true
    else
        print_error "Frontend unit tests failed!"
        FRONTEND_UNIT_TESTS_PASSED=false
    fi
    
    cd ..
}

# Run E2E tests
run_e2e_tests() {
    print_status "Running end-to-end tests..."
    cd frontend
    
    # Install Playwright browsers if needed
    npx playwright install > /dev/null 2>&1
    
    # Run Playwright tests
    if npx playwright test; then
        print_success "End-to-end tests passed!"
        E2E_TESTS_PASSED=true
    else
        print_error "End-to-end tests failed!"
        E2E_TESTS_PASSED=false
    fi
    
    cd ..
}

# Run security checks
run_security_checks() {
    print_status "Running security checks..."
    
    # Frontend security audit
    cd frontend
    if npm audit --audit-level moderate; then
        print_success "Frontend security audit passed!"
        FRONTEND_SECURITY_PASSED=true
    else
        print_warning "Frontend has security vulnerabilities"
        FRONTEND_SECURITY_PASSED=false
    fi
    cd ..
    
    # Backend security checks (basic)
    cd backend
    if pip check > /dev/null 2>&1; then
        print_success "Backend dependency check passed!"
        BACKEND_SECURITY_PASSED=true
    else
        print_warning "Backend has dependency issues"
        BACKEND_SECURITY_PASSED=false
    fi
    cd ..
}

# Performance tests
run_performance_tests() {
    print_status "Running basic performance tests..."
    
    # Test API response times
    if command -v curl > /dev/null; then
        HEALTH_TIME=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:8000/health)
        if (( $(echo "$HEALTH_TIME < 1.0" | bc -l) )); then
            print_success "Health endpoint responds in ${HEALTH_TIME}s"
            PERFORMANCE_PASSED=true
        else
            print_warning "Health endpoint slow: ${HEALTH_TIME}s"
            PERFORMANCE_PASSED=false
        fi
    else
        print_warning "curl not available, skipping performance tests"
        PERFORMANCE_PASSED=true
    fi
}

# Generate test report
generate_report() {
    print_status "Generating test report..."
    
    REPORT_FILE="test_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > $REPORT_FILE << EOF
SentinelX Test Report
=====================
Generated: $(date)

Test Results:
-------------
Backend API Tests:        $([ "$BACKEND_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED")
Frontend Unit Tests:      $([ "$FRONTEND_UNIT_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED")
End-to-End Tests:         $([ "$E2E_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED")
Frontend Security:        $([ "$FRONTEND_SECURITY_PASSED" = true ] && echo "✅ PASSED" || echo "⚠️  WARNINGS")
Backend Security:         $([ "$BACKEND_SECURITY_PASSED" = true ] && echo "✅ PASSED" || echo "⚠️  WARNINGS")
Performance Tests:        $([ "$PERFORMANCE_PASSED" = true ] && echo "✅ PASSED" || echo "⚠️  SLOW")

Coverage Reports:
-----------------
- Backend: backend/htmlcov/index.html
- Frontend: frontend/coverage/lcov-report/index.html

E2E Test Reports:
-----------------
- Playwright: frontend/playwright-report/index.html

EOF

    print_success "Test report saved to: $REPORT_FILE"
}

# Main execution
main() {
    echo "Starting comprehensive SentinelX testing..."
    echo
    
    # Check current state
    check_services
    
    # Start services if needed
    if [ "$BACKEND_RUNNING" = false ] || [ "$FRONTEND_RUNNING" = false ]; then
        start_services
        sleep 5
        check_services
    fi
    
    # Run test suites
    run_backend_tests
    echo
    
    run_frontend_unit_tests
    echo
    
    run_e2e_tests
    echo
    
    run_security_checks
    echo
    
    run_performance_tests
    echo
    
    # Generate report
    generate_report
    echo
    
    # Final summary
    echo "🏁 Test Suite Complete!"
    echo "======================="
    
    TOTAL_PASSED=0
    TOTAL_TESTS=6
    
    [ "$BACKEND_TESTS_PASSED" = true ] && ((TOTAL_PASSED++))
    [ "$FRONTEND_UNIT_TESTS_PASSED" = true ] && ((TOTAL_PASSED++))
    [ "$E2E_TESTS_PASSED" = true ] && ((TOTAL_PASSED++))
    [ "$FRONTEND_SECURITY_PASSED" = true ] && ((TOTAL_PASSED++))
    [ "$BACKEND_SECURITY_PASSED" = true ] && ((TOTAL_PASSED++))
    [ "$PERFORMANCE_PASSED" = true ] && ((TOTAL_PASSED++))
    
    echo "📊 Results: $TOTAL_PASSED/$TOTAL_TESTS test suites passed"
    
    if [ $TOTAL_PASSED -eq $TOTAL_TESTS ]; then
        print_success "🎉 All tests passed! SentinelX is ready for deployment."
        exit 0
    else
        print_warning "⚠️  Some tests failed or have warnings. Check the report for details."
        exit 1
    fi
}

# Run main function
main "$@"