#!/bin/bash

# NextChat Rollback Script
# Automated rollback script for NextChat application

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
REVISION=""
DRY_RUN=false
VERBOSE=false
FORCE_ROLLBACK=false

# ============================================================================
# Functions
# ============================================================================

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Rollback NextChat application deployment

OPTIONS:
    -e, --environment ENV    Target environment (development, staging, production)
    -n, --namespace NS       Kubernetes namespace
    -r, --revision REV       Specific revision to rollback to (optional)
    -d, --dry-run           Show what would be rolled back without actually rolling back
    -v, --verbose           Enable verbose output
    --force                 Force rollback even if checks fail
    -h, --help              Show this help message

EXAMPLES:
    $0 -e production
    $0 -e staging -n nextchat-staging -r 2
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
}

check_deployment_status() {
    log_info "Checking current deployment status..."
    
    # Check if deployment exists
    if ! kubectl get deployment nextchat -n "$NAMESPACE" &> /dev/null; then
        log_error "Deployment 'nextchat' not found in namespace '$NAMESPACE'"
        exit 1
    fi
    
    # Get current deployment status
    log_info "Current deployment status:"
    kubectl get deployment nextchat -n "$NAMESPACE" -o wide
    
    # Get deployment history
    log_info "Deployment history:"
    kubectl rollout history deployment/nextchat -n "$NAMESPACE"
    
    # Get current pods
    log_info "Current pods:"
    kubectl get pods -n "$NAMESPACE" -l app=nextchat
}

get_rollback_revision() {
    log_info "Determining rollback revision..."
    
    if [[ -n "$REVISION" ]]; then
        log_info "Using specified revision: $REVISION"
        return 0
    fi
    
    # Get the previous revision
    PREVIOUS_REVISION=$(kubectl rollout history deployment/nextchat -n "$NAMESPACE" --revision=0 2>/dev/null | head -n 1 | awk '{print $1}' || echo "")
    
    if [[ -z "$PREVIOUS_REVISION" ]]; then
        log_error "No previous revision found"
        exit 1
    fi
    
    REVISION="$PREVIOUS_REVISION"
    log_info "Using previous revision: $REVISION"
}

perform_rollback() {
    log_info "Performing rollback..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Dry run - would rollback to revision: $REVISION"
        return 0
    fi
    
    # Perform rollback
    log_info "Rolling back to revision: $REVISION"
    kubectl rollout undo deployment/nextchat -n "$NAMESPACE" --to-revision="$REVISION"
    
    # Wait for rollback to complete
    log_info "Waiting for rollback to complete..."
    kubectl rollout status deployment/nextchat -n "$NAMESPACE" --timeout=600s
    
    # Verify rollback
    log_info "Verifying rollback..."
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
    
    log_info "Rollback completed successfully"
}

run_post_rollback_tests() {
    log_info "Running post-rollback tests..."
    
    # Run smoke tests
    log_info "Running smoke tests..."
    cd "$PROJECT_ROOT"
    npm run test:smoke -- --base-url="http://localhost:8080" || {
        log_error "Smoke tests failed"
        exit 1
    }
    
    log_info "Post-rollback tests passed"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove temporary files
    rm -f /tmp/nextchat-rollback-*.yaml
    
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
            -r|--revision)
                REVISION="$2"
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
            --force)
                FORCE_ROLLBACK=true
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
    
    # Run rollback steps
    check_prerequisites
    validate_environment
    check_deployment_status
    get_rollback_revision
    perform_rollback
    run_post_rollback_tests
    
    log_info "Rollback completed successfully!"
}

# Run main function
main "$@"
