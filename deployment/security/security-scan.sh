#!/bin/bash

# NextChat Security Scan Script
# Comprehensive security scanning for NextChat deployment

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Default values
ENVIRONMENT=""
NAMESPACE=""
SCAN_TYPE="all"
VERBOSE=false
OUTPUT_DIR="/tmp/security-scan"

# ============================================================================
# Functions
# ============================================================================

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Perform comprehensive security scan for NextChat deployment

OPTIONS:
    -e, --environment ENV    Target environment (development, staging, production)
    -n, --namespace NS       Kubernetes namespace
    -t, --type TYPE          Scan type (all, vuln, config, network, secrets)
    -o, --output DIR         Output directory for scan results
    -v, --verbose           Enable verbose output
    -h, --help              Show this help message

EXAMPLES:
    $0 -e production -t all
    $0 -e staging -n nextchat-staging -t vuln
    $0 -e development -v -o ./scan-results

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
    
    # Check if trivy is installed
    if ! command -v trivy &> /dev/null; then
        log_error "trivy is not installed or not in PATH"
        exit 1
    fi
    
    # Check if kube-score is installed
    if ! command -v kube-score &> /dev/null; then
        log_error "kube-score is not installed or not in PATH"
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
    log_info "Scan type: $SCAN_TYPE"
    log_info "Output directory: $OUTPUT_DIR"
}

create_output_directory() {
    log_info "Creating output directory: $OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"
}

scan_vulnerabilities() {
    log_info "Scanning for vulnerabilities..."
    
    # Scan container images
    log_info "Scanning container images..."
    trivy image --format json --output "$OUTPUT_DIR/vulnerabilities.json" "nextchat:latest"
    
    # Scan Kubernetes cluster
    log_info "Scanning Kubernetes cluster..."
    trivy k8s cluster --format json --output "$OUTPUT_DIR/cluster-vulnerabilities.json"
    
    log_info "Vulnerability scan completed"
}

scan_configuration() {
    log_info "Scanning configuration security..."
    
    # Scan Kubernetes manifests
    log_info "Scanning Kubernetes manifests..."
    kube-score score deployment/k8s/$ENVIRONMENT/ --output-format json > "$OUTPUT_DIR/config-security.json"
    
    # Scan RBAC policies
    log_info "Scanning RBAC policies..."
    kubectl get roles,rolebindings,clusterroles,clusterrolebindings -n "$NAMESPACE" -o yaml > "$OUTPUT_DIR/rbac-policies.yaml"
    
    # Scan security policies
    log_info "Scanning security policies..."
    kubectl get psp,networkpolicies -n "$NAMESPACE" -o yaml > "$OUTPUT_DIR/security-policies.yaml"
    
    log_info "Configuration scan completed"
}

scan_network() {
    log_info "Scanning network security..."
    
    # Scan network policies
    log_info "Scanning network policies..."
    kubectl get networkpolicies -n "$NAMESPACE" -o yaml > "$OUTPUT_DIR/network-policies.yaml"
    
    # Scan services and ingress
    log_info "Scanning services and ingress..."
    kubectl get services,ingress -n "$NAMESPACE" -o yaml > "$OUTPUT_DIR/network-services.yaml"
    
    # Scan pod network configuration
    log_info "Scanning pod network configuration..."
    kubectl get pods -n "$NAMESPACE" -o yaml > "$OUTPUT_DIR/pod-network.yaml"
    
    log_info "Network scan completed"
}

scan_secrets() {
    log_info "Scanning secrets..."
    
    # Scan Kubernetes secrets
    log_info "Scanning Kubernetes secrets..."
    kubectl get secrets -n "$NAMESPACE" -o yaml > "$OUTPUT_DIR/secrets.yaml"
    
    # Scan for hardcoded secrets in code
    log_info "Scanning for hardcoded secrets in code..."
    cd "$PROJECT_ROOT"
    grep -r -i "password\|secret\|key\|token" --include="*.js" --include="*.ts" --include="*.json" . > "$OUTPUT_DIR/hardcoded-secrets.txt" || true
    
    log_info "Secrets scan completed"
}

generate_report() {
    log_info "Generating security scan report..."
    
    cat << EOF > "$OUTPUT_DIR/security-report.md"
# NextChat Security Scan Report

**Environment:** $ENVIRONMENT  
**Namespace:** $NAMESPACE  
**Scan Type:** $SCAN_TYPE  
**Timestamp:** $(date)  
**Scan Duration:** $(date)

## Summary

This report contains the results of a comprehensive security scan of the NextChat deployment.

## Scan Results

### Vulnerabilities
- Container image vulnerabilities: See vulnerabilities.json
- Cluster vulnerabilities: See cluster-vulnerabilities.json

### Configuration Security
- Kubernetes manifest security: See config-security.json
- RBAC policies: See rbac-policies.yaml
- Security policies: See security-policies.yaml

### Network Security
- Network policies: See network-policies.yaml
- Services and ingress: See network-services.yaml
- Pod network configuration: See pod-network.yaml

### Secrets
- Kubernetes secrets: See secrets.yaml
- Hardcoded secrets: See hardcoded-secrets.txt

## Recommendations

1. Review all identified vulnerabilities and apply patches
2. Ensure all secrets are properly managed
3. Verify network policies are correctly configured
4. Review RBAC policies for least privilege access
5. Implement security monitoring and alerting

## Next Steps

1. Address critical and high severity vulnerabilities
2. Review and update security policies
3. Implement automated security scanning in CI/CD
4. Set up security monitoring and alerting
5. Conduct regular security assessments

EOF
    
    log_info "Security scan report generated: $OUTPUT_DIR/security-report.md"
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
            -t|--type)
                SCAN_TYPE="$2"
                shift 2
                ;;
            -o|--output)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
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
    
    # Run security scan steps
    check_prerequisites
    validate_environment
    create_output_directory
    
    case "$SCAN_TYPE" in
        all)
            scan_vulnerabilities
            scan_configuration
            scan_network
            scan_secrets
            ;;
        vuln)
            scan_vulnerabilities
            ;;
        config)
            scan_configuration
            ;;
        network)
            scan_network
            ;;
        secrets)
            scan_secrets
            ;;
        *)
            log_error "Invalid scan type: $SCAN_TYPE"
            exit 1
            ;;
    esac
    
    generate_report
    
    log_info "Security scan completed successfully!"
    log_info "Results available in: $OUTPUT_DIR"
}

# Run main function
main "$@"
