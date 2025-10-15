# NextChat Deployment System

Comprehensive deployment system for NextChat application with CI/CD, monitoring, and security.

## Overview

This deployment system provides a complete solution for deploying, monitoring, and maintaining the NextChat application across multiple environments. It includes:

- **CI/CD Pipeline**: Automated testing, building, and deployment
- **Kubernetes Deployment**: Production-ready container orchestration
- **Monitoring & Observability**: Comprehensive metrics, logging, and alerting
- **Security**: Security policies, scanning, and compliance
- **Automation**: Deployment scripts and health checks

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│  nextchat-dev   │    │ nextchat-staging│    │    nextchat     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Monitoring    │
                    │                 │
                    │ Prometheus      │
                    │ Grafana         │
                    │ Alertmanager    │
                    └─────────────────┘
```

## Quick Start

### Prerequisites

- Kubernetes cluster (v1.20+)
- kubectl configured
- Docker
- Node.js 18+
- npm

### Deploy to Development

```bash
# Deploy to development environment
./deployment/scripts/deploy.sh -e development -v

# Check deployment status
./deployment/scripts/health-check.sh -e development

# View logs
kubectl logs -f deployment/nextchat -n nextchat-dev
```

### Deploy to Production

```bash
# Deploy to production environment
./deployment/scripts/deploy.sh -e production -t v1.0.0

# Run health checks
./deployment/scripts/health-check.sh -e production

# Monitor deployment
kubectl get pods -n nextchat -w
```

## Directory Structure

```
deployment/
├── ci/                          # CI pipeline managers
├── cd/                          # CD pipeline managers
├── core/                        # Core deployment system
├── production/                  # Production deployment
├── configuration/               # Configuration management
├── secrets/                     # Secret management
├── monitoring/                  # Monitoring system
├── observability/               # Observability system
├── alerting/                    # Alerting system
├── security/                    # Security system
├── hardening/                   # Security hardening
├── compliance/                  # Compliance system
├── k8s/                         # Kubernetes manifests
│   ├── base/                    # Base configurations
│   ├── development/             # Development overrides
│   ├── staging/                 # Staging overrides
│   └── production/              # Production overrides
├── pipelines/                   # CI/CD pipelines
├── scripts/                     # Deployment scripts
├── monitoring/                  # Monitoring configs
├── observability/               # Observability configs
└── security/                    # Security configs
```

## Environments

### Development
- **Namespace**: `nextchat-dev`
- **Replicas**: 1
- **Resources**: Minimal
- **Features**: Debug mode enabled

### Staging
- **Namespace**: `nextchat-staging`
- **Replicas**: 2
- **Resources**: Medium
- **Features**: Production-like testing

### Production
- **Namespace**: `nextchat`
- **Replicas**: 5+
- **Resources**: High
- **Features**: Full production configuration

## CI/CD Pipeline

### Continuous Integration
- Code quality checks (ESLint, TypeScript)
- Security scanning (npm audit, Snyk)
- Unit and integration tests
- Docker image building
- Artifact publishing

### Continuous Deployment
- Environment detection
- Deployment validation
- Blue-green deployment (production)
- Health checks
- Rollback capabilities

## Monitoring

### Metrics
- Application metrics (Prometheus)
- Infrastructure metrics (Node Exporter)
- Custom business metrics
- Performance metrics

### Dashboards
- **Overview**: Application status and key metrics
- **Performance**: Response times and throughput
- **Infrastructure**: Node and pod metrics

### Alerting
- Critical alerts (PagerDuty, Slack)
- Warning alerts (Slack, Email)
- Info alerts (Email)

## Security

### Security Policies
- Pod Security Policies
- Network Policies
- RBAC configurations
- Security scanning

### Compliance
- Security standards compliance
- Regular security assessments
- Vulnerability scanning
- Secret management

## Scripts

### Deployment Script
```bash
./deployment/scripts/deploy.sh -e production -t v1.0.0
```

### Health Check Script
```bash
./deployment/scripts/health-check.sh -e production
```

### Rollback Script
```bash
./deployment/scripts/rollback.sh -e production
```

### Security Scan Script
```bash
./deployment/security/security-scan.sh -e production -t all
```

## Configuration

### Environment Variables
- `NODE_ENV`: Environment (development, staging, production)
- `DATABASE_URL`: Database connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret
- `ENCRYPTION_KEY`: Data encryption key

### Secrets
- Database credentials
- API keys
- Certificates
- Encryption keys

## Troubleshooting

### Common Issues

1. **Deployment fails**
   ```bash
   kubectl describe deployment nextchat -n nextchat
   kubectl logs deployment/nextchat -n nextchat
   ```

2. **Health checks fail**
   ```bash
   kubectl get pods -n nextchat
   kubectl port-forward service/nextchat-service 8080:80 -n nextchat
   curl http://localhost:8080/health
   ```

3. **High resource usage**
   ```bash
   kubectl top pods -n nextchat
   kubectl describe hpa nextchat-hpa -n nextchat
   ```

### Logs
```bash
# Application logs
kubectl logs -f deployment/nextchat -n nextchat

# System logs
kubectl logs -f daemonset/fluentd -n kube-system
```

## Maintenance

### Updates
1. Update image tag in deployment
2. Run deployment script
3. Monitor health checks
4. Verify functionality

### Scaling
```bash
# Scale deployment
kubectl scale deployment nextchat --replicas=10 -n nextchat

# Update HPA
kubectl patch hpa nextchat-hpa -n nextchat -p '{"spec":{"maxReplicas":20}}'
```

### Backup
```bash
# Backup configuration
kubectl get all -n nextchat -o yaml > backup.yaml

# Backup secrets
kubectl get secrets -n nextchat -o yaml > secrets-backup.yaml
```

## Support

For issues and questions:
- Check logs and metrics
- Review alerting rules
- Consult troubleshooting guide
- Contact platform team

## License

This deployment system is part of the NextChat project and follows the same license terms.
