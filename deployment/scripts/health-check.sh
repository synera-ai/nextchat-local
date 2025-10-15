#!/bin/bash

# NextChat Health Check Script
# Comprehensive health check script for NextChat application

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Default values
ENVIRONMENT=""
NAMESPACE=""
BASE_URL=""
TIMEOUT=30
VERBOSE=false
CHECK_DATABASE=true
CHECK_REDIS=true
CHECK_EXTERNAL_SERVICES=true

# ============================================================================
# Functions
# ============================================================================

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Perform comprehensive health check for NextChat application

OPTIONS:
    -e, --environment ENV    Target environment (development, staging, production)
    -n, --namespace NS       Kubernetes namespace
    -u, --url URL           Base URL for health check
    -t, --timeout SECONDS   Timeout for health checks (default: 30)
    -v, --verbose           Enable verbose output
    --skip-database         Skip database health check
    --skip-redis            Skip Redis health check
    --skip-external         Skip external services health check
    -h, --help              Show this help message

EXAMPLES:
    $0 -e production
    $0 -e staging -n nextchat-staging -u https://staging.nextchat.com
    $0 -e development -v -t 60

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
    
    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        log_error "curl is not installed or not in PATH"
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
    
    # Set default base URL if not provided
    if [[ -z "$BASE_URL" ]]; then
        case "$ENVIRONMENT" in
            development)
                BASE_URL="http://localhost:3000"
                ;;
            staging)
                BASE_URL="https://staging.nextchat.com"
                ;;
            production)
                BASE_URL="https://nextchat.com"
                ;;
        esac
    fi
    
    log_info "Base URL: $BASE_URL"
    log_info "Timeout: $TIMEOUT seconds"
}

check_kubernetes_resources() {
    log_info "Checking Kubernetes resources..."
    
    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_error "Namespace '$NAMESPACE' not found"
        return 1
    fi
    
    # Check deployment status
    log_info "Checking deployment status..."
    if ! kubectl get deployment nextchat -n "$NAMESPACE" &> /dev/null; then
        log_error "Deployment 'nextchat' not found in namespace '$NAMESPACE'"
        return 1
    fi
    
    # Check if deployment is ready
    READY_REPLICAS=$(kubectl get deployment nextchat -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}')
    DESIRED_REPLICAS=$(kubectl get deployment nextchat -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
    
    if [[ "$READY_REPLICAS" != "$DESIRED_REPLICAS" ]]; then
        log_error "Deployment not ready: $READY_REPLICAS/$DESIRED_REPLICAS replicas ready"
        return 1
    fi
    
    log_info "Deployment is ready: $READY_REPLICAS/$DESIRED_REPLICAS replicas"
    
    # Check pod status
    log_info "Checking pod status..."
    kubectl get pods -n "$NAMESPACE" -l app=nextchat
    
    # Check service status
    log_info "Checking service status..."
    kubectl get service nextchat-service -n "$NAMESPACE"
    
    # Check ingress status
    log_info "Checking ingress status..."
    kubectl get ingress nextchat-ingress -n "$NAMESPACE" 2>/dev/null || log_warn "Ingress not found"
    
    log_info "Kubernetes resources check passed"
}

check_application_health() {
    log_info "Checking application health..."
    
    # Check health endpoint
    log_info "Checking health endpoint..."
    if ! curl -f -s --max-time "$TIMEOUT" "$BASE_URL/health" > /dev/null; then
        log_error "Health endpoint check failed"
        return 1
    fi
    
    # Check ready endpoint
    log_info "Checking ready endpoint..."
    if ! curl -f -s --max-time "$TIMEOUT" "$BASE_URL/ready" > /dev/null; then
        log_error "Ready endpoint check failed"
        return 1
    fi
    
    # Check metrics endpoint
    log_info "Checking metrics endpoint..."
    if ! curl -f -s --max-time "$TIMEOUT" "$BASE_URL/metrics" > /dev/null; then
        log_error "Metrics endpoint check failed"
        return 1
    fi
    
    log_info "Application health check passed"
}

check_database() {
    if [[ "$CHECK_DATABASE" == "false" ]]; then
        log_info "Skipping database health check"
        return 0
    fi
    
    log_info "Checking database connectivity..."
    
    # Check database endpoint
    if ! curl -f -s --max-time "$TIMEOUT" "$BASE_URL/health/database" > /dev/null; then
        log_error "Database health check failed"
        return 1
    fi
    
    log_info "Database health check passed"
}

check_redis() {
    if [[ "$CHECK_REDIS" == "false" ]]; then
        log_info "Skipping Redis health check"
        return 0
    fi
    
    log_info "Checking Redis connectivity..."
    
    # Check Redis endpoint
    if ! curl -f -s --max-time "$TIMEOUT" "$BASE_URL/health/redis" > /dev/null; then
        log_error "Redis health check failed"
        return 1
    fi
    
    log_info "Redis health check passed"
}

check_external_services() {
    if [[ "$CHECK_EXTERNAL_SERVICES" == "false" ]]; then
        log_info "Skipping external services health check"
        return 0
    fi
    
    log_info "Checking external services..."
    
    # Check external services endpoint
    if ! curl -f -s --max-time "$TIMEOUT" "$BASE_URL/health/external" > /dev/null; then
        log_error "External services health check failed"
        return 1
    fi
    
    log_info "External services health check passed"
}

check_performance() {
    log_info "Checking application performance..."
    
    # Check response time
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' --max-time "$TIMEOUT" "$BASE_URL/health")
    
    if (( $(echo "$RESPONSE_TIME > 5.0" | bc -l) )); then
        log_warn "Response time is slow: ${RESPONSE_TIME}s"
    else
        log_info "Response time is acceptable: ${RESPONSE_TIME}s"
    fi
    
    # Check memory usage
    log_info "Checking memory usage..."
    kubectl top pods -n "$NAMESPACE" -l app=nextchat 2>/dev/null || log_warn "Cannot get pod metrics"
    
    # Check CPU usage
    log_info "Checking CPU usage..."
    kubectl top pods -n "$NAMESPACE" -l app=nextchat 2>/dev/null || log_warn "Cannot get pod metrics"
    
    log_info "Performance check completed"
}

check_security() {
    log_info "Checking security..."
    
    # Check if HTTPS is enabled
    if [[ "$BASE_URL" == https://* ]]; then
        log_info "HTTPS is enabled"
        
        # Check SSL certificate
        log_info "Checking SSL certificate..."
        if ! curl -f -s --max-time "$TIMEOUT" "$BASE_URL" > /dev/null; then
            log_error "SSL certificate check failed"
            return 1
        fi
    else
        log_warn "HTTPS is not enabled"
    fi
    
    # Check security headers
    log_info "Checking security headers..."
    SECURITY_HEADERS=$(curl -I -s --max-time "$TIMEOUT" "$BASE_URL" | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection\|strict-transport-security")
    
    if [[ -z "$SECURITY_HEADERS" ]]; then
        log_warn "Security headers not found"
    else
        log_info "Security headers found"
    fi
    
    log_info "Security check completed"
}

generate_report() {
    log_info "Generating health check report..."
    
    cat << EOF
========================================
NextChat Health Check Report
========================================
Environment: $ENVIRONMENT
Namespace: $NAMESPACE
Base URL: $BASE_URL
Timestamp: $(date)
========================================

Kubernetes Resources:
$(kubectl get pods -n "$NAMESPACE" -l app=nextchat)

Service Status:
$(kubectl get service nextchat-service -n "$NAMESPACE")

Deployment Status:
$(kubectl get deployment nextchat -n "$NAMESPACE")

========================================
EOF
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
            -u|--url)
                BASE_URL="$2"
                shift 2
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            --skip-database)
                CHECK_DATABASE=false
                shift
                ;;
            --skip-redis)
                CHECK_REDIS=false
                shift
                ;;
            --skip-external)
                CHECK_EXTERNAL_SERVICES=false
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
    
    # Run health check steps
    check_prerequisites
    validate_environment
    check_kubernetes_resources
    check_application_health
    check_database
    check_redis
    check_external_services
    check_performance
    check_security
    generate_report
    
    log_info "Health check completed successfully!"
}

# Run main function
main "$@"
