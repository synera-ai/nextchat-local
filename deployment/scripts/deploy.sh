#!/bin/bash

# NextChat Deployment Script
# Automated deployment script for NextChat application

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"

# Default values
ENVIRONMENT=""
NAMESPACE=""
IMAGE_TAG=""
DEPLOYMENT_STRATEGY="rolling"
DRY_RUN=false
VERBOSE=false
SKIP_TESTS=false
FORCE_DEPLOY=false

# ============================================================================
# Functions
# ============================================================================

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy NextChat application to Kubernetes

OPTIONS:
    -e, --environment ENV    Target environment (development, staging, production)
    -n, --namespace NS       Kubernetes namespace
    -t, --tag TAG           Docker image tag
    -s, --strategy STRATEGY Deployment strategy (rolling, blue-green, canary)
    -d, --dry-run           Show what would be deployed without actually deploying
    -v, --verbose           Enable verbose output
    --skip-tests            Skip pre-deployment tests
    --force                 Force deployment even if checks fail
    -h, --help              Show this help message

EXAMPLES:
    $0 -e production -t v1.0.0
    $0 -e staging -n nextchat-staging -t latest
    $0 -e development -d -v

EOF
}

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >&2
}

log_info() {
    log "INFO: $1"
}

log_warn() {
    log "WARN: $1"
}

log_error() {
    log "ERROR: $1"
}

log_debug() {
    if [[ "$VERBOSE" == "true" ]]; then
        log "DEBUG: $1"
    fi
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if kustomize is installed
    if ! command -v kustomize &> /dev/null; then
        log_error "kustomize is not installed or not in PATH"
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we can connect to Kubernetes cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

validate_environment() {
    log_info "Validating environment configuration..."
    
    case "$ENVIRONMENT" in
        development|staging|production)
            log_info "Environment: $ENVIRONMENT"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            log_error "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
    
    # Set default namespace if not provided
    if [[ -z "$NAMESPACE" ]]; then
        case "$ENVIRONMENT" in
            development)
                NAMESPACE="nextchat-dev"
                ;;
            staging)
                NAMESPACE="nextchat-staging"
                ;;
            production)
                NAMESPACE="nextchat"
                ;;
        esac
    fi
    
    log_info "Namespace: $NAMESPACE"
    
    # Set default image tag if not provided
    if [[ -z "$IMAGE_TAG" ]]; then
        IMAGE_TAG="latest"
    fi
    
    log_info "Image tag: $IMAGE_TAG"
    log_info "Deployment strategy: $DEPLOYMENT_STRATEGY"
}

check_namespace() {
    log_info "Checking namespace: $NAMESPACE"
    
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_info "Creating namespace: $NAMESPACE"
        kubectl create namespace "$NAMESPACE"
    else
        log_info "Namespace exists: $NAMESPACE"
    fi
}

run_pre_deployment_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        log_info "Skipping pre-deployment tests"
        return 0
    fi
    
    log_info "Running pre-deployment tests..."
    
    # Run unit tests
    log_info "Running unit tests..."
    cd "$PROJECT_ROOT"
    npm run test:unit || {
        log_error "Unit tests failed"
        exit 1
    }
    
    # Run integration tests
    log_info "Running integration tests..."
    npm run test:integration || {
        log_error "Integration tests failed"
        exit 1
    }
    
    # Run security scan
    log_info "Running security scan..."
    npm audit --audit-level=moderate || {
        log_error "Security scan failed"
        exit 1
    }
    
    log_info "Pre-deployment tests passed"
}

build_application() {
    log_info "Building application..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci
    
    # Build application
    log_info "Building application..."
    npm run build
    
    # Build Docker image
    log_info "Building Docker image..."
    docker build -t "nextchat:$IMAGE_TAG" .
    
    log_info "Application build completed"
}

deploy_to_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    cd "$DEPLOYMENT_DIR/k8s/$ENVIRONMENT"
    
    # Generate manifests
    log_info "Generating Kubernetes manifests..."
    kustomize build . > /tmp/nextchat-manifests.yaml
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Dry run - showing manifests:"
        cat /tmp/nextchat-manifests.yaml
        return 0
    fi
    
    # Apply manifests
    log_info "Applying Kubernetes manifests..."
    kubectl apply -f /tmp/nextchat-manifests.yaml -n "$NAMESPACE"
    
    # Wait for deployment to be ready
    log_info "Waiting for deployment to be ready..."
    kubectl rollout status deployment/nextchat -n "$NAMESPACE" --timeout=600s
    
    # Verify deployment
    log_info "Verifying deployment..."
    kubectl get pods -n "$NAMESPACE" -l app=nextchat
    
    # Run health check
    log_info "Running health check..."
    kubectl port-forward service/nextchat-service 8080:80 -n "$NAMESPACE" &
    PORT_FORWARD_PID=$!
    
    sleep 10
    
    if curl -f http://localhost:8080/health; then
        log_info "Health check passed"
    else
        log_error "Health check failed"
        kill $PORT_FORWARD_PID 2>/dev/null || true
        exit 1
    fi
    
    kill $PORT_FORWARD_PID 2>/dev/null || true
    
    log_info "Deployment completed successfully"
}

run_post_deployment_tests() {
    log_info "Running post-deployment tests..."
    
    # Run smoke tests
    log_info "Running smoke tests..."
    cd "$PROJECT_ROOT"
    npm run test:smoke -- --base-url="http://localhost:8080" || {
        log_error "Smoke tests failed"
        exit 1
    }
    
    log_info "Post-deployment tests passed"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove temporary files
    rm -f /tmp/nextchat-manifests.yaml
    
    log_info "Cleanup completed"
}

# ============================================================================
# Main
# ============================================================================

main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -n|--namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            -t|--tag)
                IMAGE_TAG="$2"
                shift 2
                ;;
            -s|--strategy)
                DEPLOYMENT_STRATEGY="$2"
                shift 2
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --force)
                FORCE_DEPLOY=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Validate required parameters
    if [[ -z "$ENVIRONMENT" ]]; then
        log_error "Environment is required"
        usage
        exit 1
    fi
    
    # Set up error handling
    trap cleanup EXIT
    
    # Run deployment steps
    check_prerequisites
    validate_environment
    check_namespace
    run_pre_deployment_tests
    build_application
    deploy_to_kubernetes
    run_post_deployment_tests
    
    log_info "Deployment completed successfully!"
}

# Run main function
main "$@"
