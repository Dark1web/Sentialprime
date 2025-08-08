#!/bin/bash

# SentinelX Next.js Backend Deployment Script
# This script handles the deployment of the SentinelX backend to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="sentinelx-backend"
BUILD_DIR="dist"
BACKUP_DIR="backups"
LOG_FILE="deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Check if required environment variables are set
check_env_vars() {
    log "Checking environment variables..."
    
    required_vars=(
        "SUPABASE_URL"
        "SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_KEY"
        "JWT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    success "All required environment variables are set"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci --production
    elif [ -f "yarn.lock" ]; then
        yarn install --production --frozen-lockfile
    else
        npm install --production
    fi
    
    success "Dependencies installed successfully"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Install dev dependencies for testing
    if [ -f "package-lock.json" ]; then
        npm ci
    elif [ -f "yarn.lock" ]; then
        yarn install --frozen-lockfile
    else
        npm install
    fi
    
    # Run tests
    npm run test -- --coverage --watchAll=false
    
    if [ $? -eq 0 ]; then
        success "All tests passed"
    else
        error "Tests failed. Deployment aborted."
    fi
}

# Build the application
build_app() {
    log "Building the application..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Build the Next.js application
    npm run build
    
    if [ $? -eq 0 ]; then
        success "Application built successfully"
    else
        error "Build failed. Deployment aborted."
    fi
}

# Create backup
create_backup() {
    if [ -d "$BUILD_DIR" ]; then
        log "Creating backup of previous deployment..."
        
        mkdir -p $BACKUP_DIR
        timestamp=$(date +"%Y%m%d_%H%M%S")
        backup_name="${PROJECT_NAME}_backup_${timestamp}"
        
        cp -r $BUILD_DIR "$BACKUP_DIR/$backup_name"
        
        success "Backup created: $BACKUP_DIR/$backup_name"
        
        # Keep only last 5 backups
        cd $BACKUP_DIR
        ls -t | tail -n +6 | xargs -r rm -rf
        cd ..
    fi
}

# Deploy application
deploy_app() {
    log "Deploying application..."
    
    # Copy built files to deployment directory
    if [ -d ".next" ]; then
        mkdir -p $BUILD_DIR
        cp -r .next $BUILD_DIR/
        cp -r public $BUILD_DIR/ 2>/dev/null || true
        cp package.json $BUILD_DIR/
        cp next.config.js $BUILD_DIR/ 2>/dev/null || true
        
        success "Application deployed to $BUILD_DIR"
    else
        error "Build directory .next not found"
    fi
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Start the application in background for testing
    cd $BUILD_DIR
    npm start &
    APP_PID=$!
    
    # Wait for app to start
    sleep 10
    
    # Check health endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9000/api/health || echo "000")
    
    if [ "$response" = "200" ]; then
        success "Health check passed"
        kill $APP_PID 2>/dev/null || true
    else
        error "Health check failed. HTTP status: $response"
        kill $APP_PID 2>/dev/null || true
    fi
    
    cd ..
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove node_modules from build directory to save space
    rm -rf $BUILD_DIR/node_modules 2>/dev/null || true
    
    # Clean up old log files (keep last 10)
    ls -t *.log 2>/dev/null | tail -n +11 | xargs -r rm -f
    
    success "Cleanup completed"
}

# Main deployment process
main() {
    log "Starting deployment of $PROJECT_NAME..."
    
    # Parse command line arguments
    SKIP_TESTS=false
    SKIP_BACKUP=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --skip-tests    Skip running tests"
                echo "  --skip-backup   Skip creating backup"
                echo "  -h, --help      Show this help message"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
    
    # Check prerequisites
    check_env_vars
    
    # Create backup if not skipped
    if [ "$SKIP_BACKUP" = false ]; then
        create_backup
    else
        warning "Skipping backup creation"
    fi
    
    # Install dependencies
    install_dependencies
    
    # Run tests if not skipped
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    else
        warning "Skipping tests"
    fi
    
    # Build application
    build_app
    
    # Deploy application
    deploy_app
    
    # Health check
    health_check
    
    # Cleanup
    cleanup
    
    success "Deployment completed successfully!"
    log "Application is ready to start with: cd $BUILD_DIR && npm start"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"
