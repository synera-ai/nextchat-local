/**
 * Deployment System Types
 * Comprehensive type definitions for the NextChat deployment system
 */

import { EventEmitter } from 'events';

// ============================================================================
// Core Deployment Types
// ============================================================================

export interface DeploymentSystem {
  // Deployment pipelines
  ci: CIPipeline;
  cd: CDPipeline;
  production: ProductionDeployment;
  
  // Deployment environments
  environments: Environment[];
  configuration: ConfigurationManagement;
  secrets: SecretManagement;
  
  // Deployment monitoring
  monitoring: DeploymentMonitoring;
  observability: ObservabilitySystem;
  alerting: AlertingSystem;
  
  // Deployment security
  security: DeploymentSecurity;
  hardening: SecurityHardening;
  compliance: ComplianceSystem;
}

// ============================================================================
// CI/CD Pipeline Types
// ============================================================================

export interface CIPipeline {
  // Build stages
  build: BuildStage;
  test: TestStage;
  security: SecurityStage;
  quality: QualityStage;
  
  // Build automation
  automation: BuildAutomation;
  triggers: BuildTriggers;
  scheduling: BuildScheduling;
  
  // Build monitoring
  monitoring: BuildMonitoring;
  reporting: BuildReporting;
  notifications: BuildNotifications;
}

export interface CDPipeline {
  // Deployment stages
  staging: StagingStage;
  production: ProductionStage;
  rollback: RollbackStage;
  
  // Deployment automation
  automation: DeploymentAutomation;
  strategies: DeploymentStrategy[];
  validation: DeploymentValidation;
  
  // Deployment monitoring
  monitoring: DeploymentMonitoring;
  healthChecks: HealthCheckSystem;
  notifications: DeploymentNotifications;
}

export interface BuildStage {
  id: string;
  name: string;
  status: BuildStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: BuildStep[];
  artifacts: BuildArtifact[];
  logs: BuildLog[];
  metrics: BuildMetrics;
}

export interface BuildStep {
  id: string;
  name: string;
  status: StepStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  logs: string[];
  metrics: StepMetrics;
}

export interface BuildArtifact {
  id: string;
  name: string;
  type: ArtifactType;
  path: string;
  size: number;
  checksum: string;
  createdAt: Date;
}

export interface BuildLog {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface BuildMetrics {
  buildTime: number;
  testTime: number;
  bundleSize: number;
  testCoverage: number;
  performanceScore: number;
  securityScore: number;
  qualityScore: number;
}

export interface StepMetrics {
  duration: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkUsage: number;
}

// ============================================================================
// Production Deployment Types
// ============================================================================

export interface ProductionDeployment {
  // Deployment strategies
  strategies: DeploymentStrategy[];
  rollback: RollbackStrategy;
  blueGreen: BlueGreenDeployment;
  canary: CanaryDeployment;
  
  // Environment management
  environments: Environment[];
  configuration: EnvironmentConfiguration;
  secrets: EnvironmentSecrets;
  
  // Service orchestration
  orchestration: ServiceOrchestration;
  scaling: AutoScaling;
  loadBalancing: LoadBalancing;
}

export interface DeploymentStrategy {
  id: string;
  name: string;
  type: DeploymentStrategyType;
  configuration: StrategyConfiguration;
  healthChecks: HealthCheck[];
  rollbackPolicy: RollbackPolicy;
}

export interface BlueGreenDeployment {
  activeEnvironment: string;
  inactiveEnvironment: string;
  switchoverTime: Date;
  validationPeriod: number;
  rollbackThreshold: number;
}

export interface CanaryDeployment {
  canaryPercentage: number;
  canaryDuration: number;
  successThreshold: number;
  failureThreshold: number;
  metrics: CanaryMetrics[];
}

export interface RollbackStrategy {
  automatic: boolean;
  triggers: RollbackTrigger[];
  validation: RollbackValidation;
  notification: RollbackNotification;
}

export interface Environment {
  id: string;
  name: string;
  type: EnvironmentType;
  status: EnvironmentStatus;
  configuration: EnvironmentConfig;
  resources: EnvironmentResources;
  services: Service[];
  health: EnvironmentHealth;
}

export interface EnvironmentConfig {
  variables: Record<string, string>;
  secrets: Record<string, string>;
  features: Record<string, boolean>;
  limits: ResourceLimits;
  scaling: ScalingConfig;
}

export interface EnvironmentResources {
  cpu: ResourceSpec;
  memory: ResourceSpec;
  storage: ResourceSpec;
  network: NetworkSpec;
}

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  status: ServiceStatus;
  configuration: ServiceConfig;
  health: ServiceHealth;
  metrics: ServiceMetrics;
}

// ============================================================================
// Monitoring and Observability Types
// ============================================================================

export interface ObservabilitySystem {
  // Application monitoring
  application: ApplicationMonitoring;
  performance: PerformanceMonitoring;
  errors: ErrorMonitoring;
  
  // Infrastructure monitoring
  infrastructure: InfrastructureMonitoring;
  resources: ResourceMonitoring;
  network: NetworkMonitoring;
  
  // Log aggregation
  logs: LogAggregation;
  metrics: MetricsCollection;
  traces: DistributedTracing;
  
  // Alerting
  alerting: AlertingSystem;
  notifications: NotificationSystem;
  escalation: EscalationSystem;
}

export interface ApplicationMonitoring {
  requests: RequestMonitoring;
  responses: ResponseMonitoring;
  errors: ErrorTracking;
  performance: PerformanceTracking;
  userExperience: UserExperienceMonitoring;
  enabled: boolean;
}

export interface InfrastructureMonitoring {
  servers: ServerMonitoring;
  containers: ContainerMonitoring;
  databases: DatabaseMonitoring;
  networks: NetworkMonitoring;
  storage: StorageMonitoring;
  enabled: boolean;
}

export interface MetricsCollection {
  system: SystemMetrics;
  application: ApplicationMetrics;
  business: BusinessMetrics;
  custom: CustomMetrics;
}

export interface AlertingSystem {
  rules: AlertRule[];
  channels: AlertChannel[];
  policies: AlertPolicy[];
  escalation: EscalationPolicy;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  threshold: number;
  duration: number;
  actions: AlertAction[];
}

export interface AlertChannel {
  id: string;
  name: string;
  type: ChannelType;
  configuration: ChannelConfig;
  enabled: boolean;
}

// ============================================================================
// Security and Compliance Types
// ============================================================================

export interface DeploymentSecurity {
  authentication: AuthenticationSystem;
  authorization: AuthorizationSystem;
  encryption: EncryptionSystem;
  secrets: SecretManagement;
  compliance: ComplianceSystem;
  audit: AuditSystem;
}

export interface SecurityHardening {
  system: SystemHardening;
  application: ApplicationHardening;
  network: NetworkHardening;
  data: DataHardening;
  access: AccessHardening;
}

export interface ComplianceSystem {
  standards: ComplianceStandard[];
  policies: CompliancePolicy[];
  controls: ComplianceControl[];
  assessments: ComplianceAssessment[];
  reporting: ComplianceReporting;
  enabled: boolean;
}

// ============================================================================
// Configuration Management Types
// ============================================================================

export interface ConfigurationManagement {
  environments: EnvironmentConfiguration[];
  templates: ConfigurationTemplate[];
  validation: ConfigurationValidation;
  deployment: ConfigurationDeployment;
  rollback: ConfigurationRollback;
}

export interface SecretManagement {
  storage: SecretStorage;
  encryption: SecretEncryption;
  rotation: SecretRotation;
  access: SecretAccess;
  audit: SecretAudit;
}

// ============================================================================
// Enums and Union Types
// ============================================================================

export type BuildStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';
export type ArtifactType = 'docker' | 'npm' | 'binary' | 'config' | 'documentation';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type DeploymentStrategyType = 'blue-green' | 'canary' | 'rolling' | 'recreate';
export type EnvironmentType = 'development' | 'staging' | 'production' | 'testing';
export type EnvironmentStatus = 'active' | 'inactive' | 'maintenance' | 'error';
export type ServiceType = 'web' | 'api' | 'database' | 'cache' | 'queue' | 'worker';
export type ServiceStatus = 'healthy' | 'unhealthy' | 'degraded' | 'unknown';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ChannelType = 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';

export type ComplianceStandardType = 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';

// ============================================================================
// Missing Types
// ============================================================================

export interface DeploymentMonitoring {
  enabled: boolean;
  metrics: any;
  alerts: AlertRule[];
  reporting: any;
}

export interface TestStage {
  id: string;
  name: string;
  status: BuildStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: BuildStep[];
  artifacts: BuildArtifact[];
  logs: BuildLog[];
  metrics: BuildMetrics;
}

export interface SecurityStage {
  id: string;
  name: string;
  status: BuildStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: BuildStep[];
  artifacts: BuildArtifact[];
  logs: BuildLog[];
  metrics: BuildMetrics;
}

export interface QualityStage {
  id: string;
  name: string;
  status: BuildStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: BuildStep[];
  artifacts: BuildArtifact[];
  logs: BuildLog[];
  metrics: BuildMetrics;
}

export interface EnvironmentHealth {
  status: ServiceStatus;
  checks: any[];
  lastCheck: Date;
  uptime: number;
  responseTime: number;
}

export interface PerformanceMonitoring {
  enabled: boolean;
  metrics: any;
  alerts: AlertRule[];
  reporting: any;
}

export interface ErrorMonitoring {
  enabled: boolean;
  metrics: any;
  alerts: AlertRule[];
  reporting: any;
}

export interface ResourceMonitoring {
  enabled: boolean;
  metrics: any;
  alerts: AlertRule[];
  reporting: any;
}

export interface NetworkMonitoring {
  enabled: boolean;
  metrics: any;
  alerts: AlertRule[];
  reporting: any;
}

export type DeploymentStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

// ============================================================================
// Event Types
// ============================================================================

export interface DeploymentEvent {
  id: string;
  type: DeploymentEventType;
  timestamp: Date;
  source: string;
  data: any;
  metadata: Record<string, any>;
}

export type DeploymentEventType = 
  | 'build.started'
  | 'build.completed'
  | 'build.failed'
  | 'deployment.started'
  | 'deployment.completed'
  | 'deployment.failed'
  | 'rollback.started'
  | 'rollback.completed'
  | 'alert.triggered'
  | 'alert.resolved'
  | 'health.check'
  | 'performance.degraded'
  | 'security.incident'
  | 'started'
  | 'completed'
  | 'failed'
  | 'cancelled';

// ============================================================================
// Manager Interfaces
// ============================================================================

export interface BuildAutomation {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  on(event: string, listener: (...args: any[]) => void): void;
  triggerBuild(config: BuildConfig): Promise<BuildStage>;
  getBuildStatus(buildId: string): Promise<BuildStage>;
  cancelBuild(buildId: string): Promise<void>;
  getBuildHistory(limit?: number): Promise<BuildStage[]>;
}

export interface DeploymentAutomation {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  on(event: string, listener: (...args: any[]) => void): void;
  deploy(config: DeploymentConfig): Promise<DeploymentResult>;
  rollback(deploymentId: string): Promise<RollbackResult>;
  getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>;
  validateDeployment(config: DeploymentConfig): Promise<ValidationResult>;
}

export interface MonitoringSystem {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  on(event: string, listener: (...args: any[]) => void): void;
  collectMetrics(): Promise<MetricsData>;
  checkHealth(): Promise<HealthStatus>;
  triggerAlert(alert: AlertData): Promise<void>;
  getDashboardData(): Promise<DashboardData>;
}

export interface SecuritySystem {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  on(event: string, listener: (...args: any[]) => void): void;
  scanSecurity(): Promise<SecurityScanResult>;
  validateCompliance(): Promise<ComplianceResult>;
  auditAccess(): Promise<AuditResult>;
  rotateSecrets(): Promise<SecretRotationResult>;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface BuildConfig {
  source: string;
  target: string;
  environment: string;
  variables: Record<string, string>;
  secrets: Record<string, string>;
  features: Record<string, boolean>;
}

export interface DeploymentConfig {
  environment: string;
  strategy: DeploymentStrategyType;
  services: ServiceConfig[];
  configuration: EnvironmentConfig;
  secrets: EnvironmentSecrets;
  healthChecks: HealthCheck[];
  rollbackPolicy: RollbackPolicy;
}

export interface ServiceConfig {
  name: string;
  image: string;
  replicas: number;
  resources: ResourceSpec;
  environment: Record<string, string>;
  healthCheck: HealthCheck;
  scaling: ScalingConfig;
}

export interface HealthCheck {
  type: 'http' | 'tcp' | 'command';
  path?: string;
  port?: number;
  command?: string;
  interval: number;
  timeout: number;
  retries: number;
  startPeriod: number;
}

export interface ResourceSpec {
  requests: {
    cpu: string;
    memory: string;
  };
  limits: {
    cpu: string;
    memory: string;
  };
}

export interface ResourceLimits {
  cpu: string;
  memory: string;
  storage?: string;
  requests?: {
    cpu: string;
    memory: string;
  };
  limits?: {
    cpu: string;
    memory: string;
  };
}

export interface ScalingConfig {
  minReplicas: number;
  maxReplicas: number;
  targetCPU: number;
  targetMemory: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
}

export interface NetworkSpec {
  bandwidth: string;
  latency: number;
  security: NetworkSecurity;
}

export interface NetworkSecurity {
  firewall: FirewallConfig;
  ssl: SSLConfig;
  vpn: VPNConfig;
}

export interface FirewallConfig {
  rules: FirewallRule[];
  defaultAction: 'allow' | 'deny';
}

export interface FirewallRule {
  id: string;
  action: 'allow' | 'deny';
  protocol: 'tcp' | 'udp' | 'icmp';
  port?: number;
  source: string;
  destination: string;
}

export interface SSLConfig {
  enabled: boolean;
  certificate: string;
  privateKey: string;
  ciphers: string[];
  protocols: string[];
}

export interface VPNConfig {
  enabled: boolean;
  type: 'openvpn' | 'wireguard' | 'ipsec';
  configuration: Record<string, any>;
}

// ============================================================================
// Result Types
// ============================================================================

export interface DeploymentResult {
  id: string;
  status: DeploymentStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  services: ServiceDeploymentResult[];
  logs: DeploymentLog[];
  metrics: DeploymentMetrics;
}

export interface ServiceDeploymentResult {
  serviceId: string;
  status: ServiceStatus;
  replicas: ReplicaStatus[];
  health: ServiceHealth;
  metrics: ServiceMetrics;
}

export interface ReplicaStatus {
  id: string;
  status: 'running' | 'pending' | 'failed' | 'terminated';
  startTime: Date;
  health: 'healthy' | 'unhealthy' | 'unknown';
  metrics: ReplicaMetrics;
}

export interface ReplicaMetrics {
  cpu: number;
  memory: number;
  network: NetworkMetrics;
  disk: DiskMetrics;
}

export interface NetworkMetrics {
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  errors: number;
}

export interface DiskMetrics {
  readBytes: number;
  writeBytes: number;
  readOps: number;
  writeOps: number;
  usage: number;
}

export interface RollbackResult {
  id: string;
  status: 'success' | 'failed' | 'partial';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  services: ServiceRollbackResult[];
  logs: RollbackLog[];
}

export interface ServiceRollbackResult {
  serviceId: string;
  status: ServiceStatus;
  previousVersion: string;
  currentVersion: string;
  rollbackTime: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: ValidationRecommendation[];
}

export interface ValidationError {
  code: string;
  message: string;
  field: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  code: string;
  message: string;
  field: string;
  impact: 'low' | 'medium' | 'high';
}

export interface ValidationRecommendation {
  code: string;
  message: string;
  field: string;
  priority: 'low' | 'medium' | 'high';
  action: string;
}

export interface SecurityScanResult {
  id: string;
  status: 'completed' | 'failed' | 'in_progress';
  vulnerabilities: Vulnerability[];
  compliance: ComplianceCheck[];
  recommendations: SecurityRecommendation[];
  scanTime: Date;
}

export interface Vulnerability {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  cve?: string;
  cvss?: number;
  affected: string[];
  fixed?: string;
  references: string[];
}

export interface ComplianceCheck {
  standard: ComplianceStandardType;
  control: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  evidence: string[];
  recommendations: string[];
}

export interface SecurityRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface ComplianceResult {
  id: string;
  standard: ComplianceStandardType;
  status: 'compliant' | 'non_compliant' | 'partial';
  score: number;
  checks: ComplianceCheck[];
  gaps: ComplianceGap[];
  recommendations: ComplianceRecommendation[];
  assessmentDate: Date;
}

export interface ComplianceGap {
  id: string;
  control: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  remediation: string;
  timeline: string;
}

export interface ComplianceRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
  benefit: string;
  cost: 'low' | 'medium' | 'high';
}

export interface AuditResult {
  id: string;
  type: 'access' | 'configuration' | 'security' | 'compliance';
  status: 'completed' | 'failed' | 'in_progress';
  findings: AuditFinding[];
  recommendations: AuditRecommendation[];
  auditDate: Date;
}

export interface AuditFinding {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  evidence: string[];
  impact: string;
  remediation: string;
}

export interface AuditRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
  benefit: string;
  effort: 'low' | 'medium' | 'high';
}

export interface SecretRotationResult {
  id: string;
  status: 'success' | 'failed' | 'partial';
  secrets: SecretRotationStatus[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface SecretRotationStatus {
  secretId: string;
  status: 'rotated' | 'failed' | 'skipped';
  oldVersion: string;
  newVersion: string;
  rotationTime: Date;
  error?: string;
}

// ============================================================================
// Data Types
// ============================================================================

export interface MetricsData {
  timestamp: Date;
  system: SystemMetrics;
  application: ApplicationMetrics;
  business: BusinessMetrics;
  custom: CustomMetrics;
}

export interface SystemMetrics {
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
  processes: ProcessMetrics[];
}

export interface CPUMetrics {
  usage: number;
  cores: number;
  load: number[];
  temperature?: number;
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  cached: number;
  buffers: number;
  swap: SwapMetrics;
}

export interface SwapMetrics {
  total: number;
  used: number;
  free: number;
}

export interface ProcessMetrics {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: string;
  startTime: Date;
}

export interface ApplicationMetrics {
  requests: RequestMetrics;
  responses: ResponseMetrics;
  errors: ErrorMetrics;
  performance: PerformanceMetrics;
  users: UserMetrics;
}

export interface RequestMetrics {
  total: number;
  rate: number;
  latency: LatencyMetrics;
  methods: MethodMetrics;
  endpoints: EndpointMetrics[];
}

export interface ResponseMetrics {
  total: number;
  success: number;
  errors: number;
  statusCodes: StatusCodeMetrics[];
  sizes: SizeMetrics;
}

export interface ErrorMetrics {
  total: number;
  rate: number;
  types: ErrorTypeMetrics[];
  trends: ErrorTrendMetrics[];
}

export interface PerformanceMetrics {
  responseTime: LatencyMetrics;
  throughput: ThroughputMetrics;
  resourceUsage: ResourceUsageMetrics;
  bottlenecks: BottleneckMetrics[];
}

export interface UserMetrics {
  active: number;
  total: number;
  new: number;
  returning: number;
  sessions: SessionMetrics;
}

export interface BusinessMetrics {
  revenue: RevenueMetrics;
  conversions: ConversionMetrics;
  engagement: EngagementMetrics;
  satisfaction: SatisfactionMetrics;
}

export interface RevenueMetrics {
  total: number;
  rate: number;
  trends: RevenueTrendMetrics[];
  sources: RevenueSourceMetrics[];
}

export interface ConversionMetrics {
  rate: number;
  funnel: ConversionFunnelMetrics[];
  trends: ConversionTrendMetrics[];
}

export interface EngagementMetrics {
  duration: number;
  frequency: number;
  depth: number;
  trends: EngagementTrendMetrics[];
}

export interface SatisfactionMetrics {
  score: number;
  trends: SatisfactionTrendMetrics[];
  feedback: FeedbackMetrics;
}

export interface CustomMetrics {
  [key: string]: any;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealthStatus[];
  checks: HealthCheckResult[];
  timestamp: Date;
}

export interface ServiceHealthStatus {
  serviceId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckResult[];
  lastCheck: Date;
}

export interface HealthCheckResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration: number;
  timestamp: Date;
}

export interface AlertData {
  id: string;
  ruleId: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface DashboardData {
  overview: OverviewData;
  metrics: MetricsData;
  alerts: AlertData[];
  health: HealthStatus;
  trends: TrendData[];
}

export interface OverviewData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  activeUsers: number;
}

export interface TrendData {
  metric: string;
  period: string;
  values: TrendValue[];
  change: number;
  direction: 'up' | 'down' | 'stable';
}

export interface TrendValue {
  timestamp: Date;
  value: number;
}

// ============================================================================
// Additional Metric Types
// ============================================================================

export interface LatencyMetrics {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  max: number;
  min: number;
  avg: number;
}

export interface MethodMetrics {
  GET: number;
  POST: number;
  PUT: number;
  DELETE: number;
  PATCH: number;
  HEAD: number;
  OPTIONS: number;
}

export interface EndpointMetrics {
  path: string;
  method: string;
  requests: number;
  latency: LatencyMetrics;
  errors: number;
  successRate: number;
}

export interface StatusCodeMetrics {
  code: number;
  count: number;
  percentage: number;
}

export interface SizeMetrics {
  min: number;
  max: number;
  avg: number;
  total: number;
}

export interface ErrorTypeMetrics {
  type: string;
  count: number;
  percentage: number;
  trends: ErrorTrendMetrics[];
}

export interface ErrorTrendMetrics {
  timestamp: Date;
  count: number;
  rate: number;
}

export interface ThroughputMetrics {
  requests: number;
  bytes: number;
  rate: number;
  trends: ThroughputTrendMetrics[];
}

export interface ThroughputTrendMetrics {
  timestamp: Date;
  requests: number;
  bytes: number;
}

export interface ResourceUsageMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface BottleneckMetrics {
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'database';
  severity: AlertSeverity;
  impact: number;
  description: string;
  recommendations: string[];
}

export interface SessionMetrics {
  total: number;
  active: number;
  average: number;
  trends: SessionTrendMetrics[];
}

export interface SessionTrendMetrics {
  timestamp: Date;
  total: number;
  active: number;
  average: number;
}

export interface RevenueTrendMetrics {
  timestamp: Date;
  amount: number;
  transactions: number;
  average: number;
}

export interface RevenueSourceMetrics {
  source: string;
  amount: number;
  percentage: number;
  trends: RevenueTrendMetrics[];
}

export interface ConversionFunnelMetrics {
  stage: string;
  users: number;
  conversion: number;
  dropoff: number;
}

export interface ConversionTrendMetrics {
  timestamp: Date;
  rate: number;
  conversions: number;
  visitors: number;
}

export interface EngagementTrendMetrics {
  timestamp: Date;
  duration: number;
  frequency: number;
  depth: number;
}

export interface SatisfactionTrendMetrics {
  timestamp: Date;
  score: number;
  responses: number;
  trends: SatisfactionTrendMetrics[];
}

export interface FeedbackMetrics {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  trends: FeedbackTrendMetrics[];
}

export interface FeedbackTrendMetrics {
  timestamp: Date;
  total: number;
  positive: number;
  negative: number;
  neutral: number;
}

// ============================================================================
// Deployment Log Types
// ============================================================================

export interface DeploymentLog {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source: string;
  deploymentId: string;
  serviceId?: string;
  metadata?: Record<string, any>;
}

export interface RollbackLog {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source: string;
  rollbackId: string;
  serviceId?: string;
  metadata?: Record<string, any>;
}

export interface DeploymentMetrics {
  deploymentTime: number;
  serviceCount: number;
  replicaCount: number;
  resourceUsage: ResourceUsageMetrics;
  performance: PerformanceMetrics;
  errors: ErrorMetrics;
}

export interface ServiceHealth {
  status: ServiceStatus;
  checks: HealthCheckResult[];
  lastCheck: Date;
  uptime: number;
  responseTime: number;
}

export interface ServiceMetrics {
  requests: RequestMetrics;
  responses: ResponseMetrics;
  errors: ErrorMetrics;
  performance: PerformanceMetrics;
  resources: ResourceUsageMetrics;
}

export interface CanaryMetrics {
  metric: string;
  baseline: number;
  canary: number;
  difference: number;
  significance: number;
  status: 'pass' | 'fail' | 'warning';
}

export interface RollbackTrigger {
  type: 'error_rate' | 'response_time' | 'custom_metric';
  threshold: number;
  duration: number;
  action: 'automatic' | 'manual';
}

export interface RollbackValidation {
  checks: HealthCheck[];
  timeout: number;
  retries: number;
}

export interface RollbackNotification {
  channels: AlertChannel[];
  template: string;
  escalation: EscalationPolicy;
}

export interface RollbackPolicy {
  automatic: boolean;
  triggers: RollbackTrigger[];
  validation: RollbackValidation;
  notification: RollbackNotification;
}

export interface StrategyConfiguration {
  parameters: Record<string, any>;
  constraints: Record<string, any>;
  optimization: Record<string, any>;
}

export interface EnvironmentConfiguration {
  environmentId: string;
  variables: Record<string, string>;
  secrets: Record<string, string>;
  features: Record<string, boolean>;
  limits: ResourceLimits;
  scaling: ScalingConfig;
}

export interface EnvironmentSecrets {
  environmentId: string;
  secrets: Record<string, SecretValue>;
  encryption: SecretEncryption;
  access: SecretAccess;
}

export interface SecretValue {
  value: string;
  encrypted: boolean;
  version: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface SecretEncryption {
  algorithm: string;
  key: string;
  iv?: string;
  enabled: boolean;
}

export interface SecretAccess {
  users: string[];
  services: string[];
  permissions: string[];
  expiresAt?: Date;
}

export interface ServiceOrchestration {
  services: Service[];
  dependencies: ServiceDependency[];
  loadBalancing: LoadBalancing;
  scaling: AutoScaling;
  healthChecks: HealthCheck[];
}

export interface ServiceDependency {
  serviceId: string;
  dependsOn: string[];
  type: 'hard' | 'soft';
  timeout: number;
}

export interface AutoScaling {
  enabled: boolean;
  minReplicas: number;
  maxReplicas: number;
  targetCPU: number;
  targetMemory: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
}

export interface LoadBalancing {
  algorithm: 'round_robin' | 'least_connections' | 'ip_hash' | 'weighted';
  healthChecks: HealthCheck[];
  stickySessions: boolean;
  timeout: number;
}

export interface ConfigurationTemplate {
  id: string;
  name: string;
  type: 'environment' | 'service' | 'deployment';
  template: Record<string, any>;
  variables: string[];
  validation: ConfigurationValidation;
}

export interface ConfigurationValidation {
  schema: Record<string, any>;
  rules: ValidationRule[];
  tests: ValidationTest[];
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  value: any;
  message: string;
}

export interface ValidationTest {
  name: string;
  description: string;
  test: (config: any) => boolean;
  message: string;
}

export interface ConfigurationDeployment {
  strategy: 'immediate' | 'gradual' | 'canary';
  validation: ConfigurationValidation;
  rollback: ConfigurationRollback;
  notification: ConfigurationNotification;
}

export interface ConfigurationRollback {
  automatic: boolean;
  triggers: RollbackTrigger[];
  validation: RollbackValidation;
  notification: RollbackNotification;
}

export interface ConfigurationNotification {
  channels: AlertChannel[];
  template: string;
  escalation: EscalationPolicy;
}

export interface SecretStorage {
  type: 'vault' | 'kubernetes' | 'aws_secrets' | 'azure_keyvault';
  configuration: Record<string, any>;
  encryption: SecretEncryption;
  backup: SecretBackup;
  enabled: boolean;
}

export interface SecretBackup {
  enabled: boolean;
  frequency: string;
  retention: number;
  location: string;
  encryption: SecretEncryption;
}

export interface SecretRotation {
  enabled: boolean;
  frequency: string;
  secrets: SecretRotationConfig[];
  notification: SecretRotationNotification;
}

export interface SecretRotationConfig {
  secretId: string;
  frequency: string;
  algorithm: string;
  length: number;
  notification: SecretRotationNotification;
}

export interface SecretRotationNotification {
  channels: AlertChannel[];
  template: string;
  escalation: EscalationPolicy;
}

export interface SecretAudit {
  enabled: boolean;
  frequency: string;
  retention: number;
  reporting: SecretAuditReporting;
}

export interface SecretAuditReporting {
  channels: AlertChannel[];
  template: string;
  escalation: EscalationPolicy;
}

export interface BuildTriggers {
  git: GitTrigger;
  schedule: ScheduleTrigger;
  manual: ManualTrigger;
  webhook: WebhookTrigger;
}

export interface GitTrigger {
  enabled: boolean;
  branches: string[];
  events: GitEvent[];
  conditions: GitCondition[];
}

export interface GitEvent {
  type: 'push' | 'pull_request' | 'tag';
  branch: string;
  path?: string;
}

export interface GitCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface ScheduleTrigger {
  enabled: boolean;
  schedule: string;
  timezone: string;
  conditions: ScheduleCondition[];
}

export interface ScheduleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface ManualTrigger {
  enabled: boolean;
  users: string[];
  conditions: ManualCondition[];
}

export interface ManualCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface WebhookTrigger {
  enabled: boolean;
  url: string;
  secret: string;
  events: WebhookEvent[];
  conditions: WebhookCondition[];
}

export interface WebhookEvent {
  type: string;
  source: string;
  payload: Record<string, any>;
}

export interface WebhookCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface BuildScheduling {
  enabled: boolean;
  schedule: string;
  timezone: string;
  conditions: ScheduleCondition[];
  resources: ResourceLimits;
}

export interface BuildMonitoring {
  enabled: boolean;
  metrics: BuildMetrics;
  alerts: AlertRule[];
  reporting: BuildReporting;
}

export interface BuildReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
  escalation: EscalationPolicy;
}

export interface BuildNotifications {
  enabled: boolean;
  channels: AlertChannel[];
  events: BuildEvent[];
  template: string;
  escalation: EscalationPolicy;
}

export interface BuildEvent {
  type: 'started' | 'completed' | 'failed' | 'cancelled';
  severity: AlertSeverity;
  notification: BuildNotification;
}

export interface BuildNotification {
  channels: AlertChannel[];
  template: string;
  escalation: EscalationPolicy;
}

export interface StagingStage {
  id: string;
  name: string;
  status: BuildStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: BuildStep[];
  artifacts: BuildArtifact[];
  logs: BuildLog[];
  metrics: BuildMetrics;
}

export interface ProductionStage {
  id: string;
  name: string;
  status: BuildStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: BuildStep[];
  artifacts: BuildArtifact[];
  logs: BuildLog[];
  metrics: BuildMetrics;
}

export interface RollbackStage {
  id: string;
  name: string;
  status: BuildStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: BuildStep[];
  artifacts: BuildArtifact[];
  logs: BuildLog[];
  metrics: BuildMetrics;
}

export interface DeploymentValidation {
  enabled: boolean;
  checks: ValidationCheck[];
  timeout: number;
  retries: number;
}

export interface ValidationCheck {
  type: 'health' | 'performance' | 'security' | 'compliance';
  configuration: Record<string, any>;
  timeout: number;
  retries: number;
}

export interface DeploymentNotifications {
  enabled: boolean;
  channels: AlertChannel[];
  events: DeploymentEvent[];
  template: string;
  escalation: EscalationPolicy;
}

export interface DeploymentEvent {
  type: DeploymentEventType;
  severity: AlertSeverity;
  notification: DeploymentNotification;
}

export interface DeploymentNotification {
  channels: AlertChannel[];
  template: string;
  escalation: EscalationPolicy;
}

export interface HealthCheckSystem {
  enabled: boolean;
  checks: HealthCheck[];
  interval: number;
  timeout: number;
  retries: number;
}

export interface AlertPolicy {
  id: string;
  name: string;
  rules: AlertRule[];
  channels: AlertChannel[];
  escalation: EscalationPolicy;
  enabled: boolean;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  levels: EscalationLevel[];
  timeout: number;
  enabled: boolean;
}

export interface EscalationLevel {
  level: number;
  timeout: number;
  channels: AlertChannel[];
  conditions: EscalationCondition[];
}

export interface EscalationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface ChannelConfig {
  [key: string]: any;
}

export interface AlertAction {
  type: 'notification' | 'webhook' | 'script';
  configuration: Record<string, any>;
  timeout: number;
  retries: number;
}

export interface AlertCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than';
  value: any;
  duration: number;
}

export interface NotificationSystem {
  enabled: boolean;
  channels: AlertChannel[];
  templates: NotificationTemplate[];
  escalation: EscalationPolicy;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  template: string;
  variables: string[];
}

export interface EscalationSystem {
  enabled: boolean;
  policies: EscalationPolicy[];
  rules: EscalationRule[];
  monitoring: EscalationMonitoring;
}

export interface EscalationRule {
  id: string;
  name: string;
  conditions: EscalationCondition[];
  actions: EscalationAction[];
  timeout: number;
}

export interface EscalationAction {
  type: 'notification' | 'webhook' | 'script';
  configuration: Record<string, any>;
  timeout: number;
  retries: number;
}

export interface EscalationMonitoring {
  enabled: boolean;
  metrics: EscalationMetrics;
  alerts: AlertRule[];
  reporting: EscalationReporting;
}

export interface EscalationMetrics {
  total: number;
  successful: number;
  failed: number;
  timeout: number;
  average: number;
}

export interface EscalationReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface AuthenticationSystem {
  enabled: boolean;
  providers: AuthProvider[];
  policies: AuthPolicy[];
  monitoring: AuthMonitoring;
}

export interface AuthProvider {
  id: string;
  name: string;
  type: 'oauth' | 'saml' | 'ldap' | 'local';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface AuthPolicy {
  id: string;
  name: string;
  rules: AuthRule[];
  conditions: AuthCondition[];
  enabled: boolean;
}

export interface AuthRule {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
  action: 'allow' | 'deny';
}

export interface AuthCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface AuthMonitoring {
  enabled: boolean;
  metrics: AuthMetrics;
  alerts: AlertRule[];
  reporting: AuthReporting;
}

export interface AuthMetrics {
  total: number;
  successful: number;
  failed: number;
  blocked: number;
  average: number;
}

export interface AuthReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface AuthorizationSystem {
  enabled: boolean;
  policies: AuthorizationPolicy[];
  roles: Role[];
  permissions: Permission[];
  monitoring: AuthorizationMonitoring;
}

export interface AuthorizationPolicy {
  id: string;
  name: string;
  rules: AuthorizationRule[];
  conditions: AuthorizationCondition[];
  enabled: boolean;
}

export interface AuthorizationRule {
  subject: string;
  action: string;
  resource: string;
  effect: 'allow' | 'deny';
}

export interface AuthorizationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  conditions: RoleCondition[];
  enabled: boolean;
}

export interface RoleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  actions: string[];
  conditions: PermissionCondition[];
  enabled: boolean;
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface AuthorizationMonitoring {
  enabled: boolean;
  metrics: AuthorizationMetrics;
  alerts: AlertRule[];
  reporting: AuthorizationReporting;
}

export interface AuthorizationMetrics {
  total: number;
  allowed: number;
  denied: number;
  average: number;
}

export interface AuthorizationReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface EncryptionSystem {
  enabled: boolean;
  algorithms: EncryptionAlgorithm[];
  keys: EncryptionKey[];
  policies: EncryptionPolicy[];
  monitoring: EncryptionMonitoring;
}

export interface EncryptionAlgorithm {
  id: string;
  name: string;
  type: 'symmetric' | 'asymmetric' | 'hash';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface EncryptionKey {
  id: string;
  name: string;
  algorithm: string;
  key: string;
  version: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface EncryptionPolicy {
  id: string;
  name: string;
  rules: EncryptionRule[];
  conditions: EncryptionCondition[];
  enabled: boolean;
}

export interface EncryptionRule {
  field: string;
  algorithm: string;
  key: string;
  required: boolean;
}

export interface EncryptionCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface EncryptionMonitoring {
  enabled: boolean;
  metrics: EncryptionMetrics;
  alerts: AlertRule[];
  reporting: EncryptionReporting;
}

export interface EncryptionMetrics {
  total: number;
  successful: number;
  failed: number;
  average: number;
}

export interface EncryptionReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface AuditSystem {
  enabled: boolean;
  events: AuditEvent[];
  policies: AuditPolicy[];
  monitoring: AuditMonitoring;
}

export interface AuditEvent {
  id: string;
  type: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  result: 'success' | 'failure';
  metadata: Record<string, any>;
}

export interface AuditPolicy {
  id: string;
  name: string;
  rules: AuditRule[];
  conditions: AuditCondition[];
  enabled: boolean;
}

export interface AuditRule {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
  action: 'log' | 'alert' | 'block';
}

export interface AuditCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface AuditMonitoring {
  enabled: boolean;
  metrics: AuditMetrics;
  alerts: AlertRule[];
  reporting: AuditReporting;
}

export interface AuditMetrics {
  total: number;
  successful: number;
  failed: number;
  blocked: number;
  average: number;
}

export interface AuditReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface SystemHardening {
  enabled: boolean;
  policies: HardeningPolicy[];
  checks: HardeningCheck[];
  monitoring: HardeningMonitoring;
}

export interface HardeningPolicy {
  id: string;
  name: string;
  rules: HardeningRule[];
  conditions: HardeningCondition[];
  enabled: boolean;
}

export interface HardeningRule {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
  action: 'enforce' | 'warn' | 'log';
}

export interface HardeningCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface HardeningCheck {
  id: string;
  name: string;
  type: 'security' | 'configuration' | 'compliance';
  check: (system: any) => boolean;
  remediation: string;
}

export interface HardeningMonitoring {
  enabled: boolean;
  metrics: HardeningMetrics;
  alerts: AlertRule[];
  reporting: HardeningReporting;
}

export interface HardeningMetrics {
  total: number;
  passed: number;
  failed: number;
  average: number;
}

export interface HardeningReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface ApplicationHardening {
  enabled: boolean;
  policies: ApplicationHardeningPolicy[];
  checks: ApplicationHardeningCheck[];
  monitoring: ApplicationHardeningMonitoring;
}

export interface ApplicationHardeningPolicy {
  id: string;
  name: string;
  rules: ApplicationHardeningRule[];
  conditions: ApplicationHardeningCondition[];
  enabled: boolean;
}

export interface ApplicationHardeningRule {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
  action: 'enforce' | 'warn' | 'log';
}

export interface ApplicationHardeningCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface ApplicationHardeningCheck {
  id: string;
  name: string;
  type: 'security' | 'configuration' | 'compliance';
  check: (application: any) => boolean;
  remediation: string;
}

export interface ApplicationHardeningMonitoring {
  enabled: boolean;
  metrics: ApplicationHardeningMetrics;
  alerts: AlertRule[];
  reporting: ApplicationHardeningReporting;
}

export interface ApplicationHardeningMetrics {
  total: number;
  passed: number;
  failed: number;
  average: number;
}

export interface ApplicationHardeningReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface NetworkHardening {
  enabled: boolean;
  policies: NetworkHardeningPolicy[];
  checks: NetworkHardeningCheck[];
  monitoring: NetworkHardeningMonitoring;
}

export interface NetworkHardeningPolicy {
  id: string;
  name: string;
  rules: NetworkHardeningRule[];
  conditions: NetworkHardeningCondition[];
  enabled: boolean;
}

export interface NetworkHardeningRule {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
  action: 'enforce' | 'warn' | 'log';
}

export interface NetworkHardeningCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface NetworkHardeningCheck {
  id: string;
  name: string;
  type: 'security' | 'configuration' | 'compliance';
  check: (network: any) => boolean;
  remediation: string;
}

export interface NetworkHardeningMonitoring {
  enabled: boolean;
  metrics: NetworkHardeningMetrics;
  alerts: AlertRule[];
  reporting: NetworkHardeningReporting;
}

export interface NetworkHardeningMetrics {
  total: number;
  passed: number;
  failed: number;
  average: number;
}

export interface NetworkHardeningReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface DataHardening {
  enabled: boolean;
  policies: DataHardeningPolicy[];
  checks: DataHardeningCheck[];
  monitoring: DataHardeningMonitoring;
}

export interface DataHardeningPolicy {
  id: string;
  name: string;
  rules: DataHardeningRule[];
  conditions: DataHardeningCondition[];
  enabled: boolean;
}

export interface DataHardeningRule {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
  action: 'enforce' | 'warn' | 'log';
}

export interface DataHardeningCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface DataHardeningCheck {
  id: string;
  name: string;
  type: 'security' | 'configuration' | 'compliance';
  check: (data: any) => boolean;
  remediation: string;
}

export interface DataHardeningMonitoring {
  enabled: boolean;
  metrics: DataHardeningMetrics;
  alerts: AlertRule[];
  reporting: DataHardeningReporting;
}

export interface DataHardeningMetrics {
  total: number;
  passed: number;
  failed: number;
  average: number;
}

export interface DataHardeningReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface AccessHardening {
  enabled: boolean;
  policies: AccessHardeningPolicy[];
  checks: AccessHardeningCheck[];
  monitoring: AccessHardeningMonitoring;
}

export interface AccessHardeningPolicy {
  id: string;
  name: string;
  rules: AccessHardeningRule[];
  conditions: AccessHardeningCondition[];
  enabled: boolean;
}

export interface AccessHardeningRule {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
  action: 'enforce' | 'warn' | 'log';
}

export interface AccessHardeningCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface AccessHardeningCheck {
  id: string;
  name: string;
  type: 'security' | 'configuration' | 'compliance';
  check: (access: any) => boolean;
  remediation: string;
}

export interface AccessHardeningMonitoring {
  enabled: boolean;
  metrics: AccessHardeningMetrics;
  alerts: AlertRule[];
  reporting: AccessHardeningReporting;
}

export interface AccessHardeningMetrics {
  total: number;
  passed: number;
  failed: number;
  average: number;
}

export interface AccessHardeningReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface ComplianceStandard {
  id: string;
  name: string;
  version: string;
  description: string;
  controls: ComplianceControl[];
  requirements: ComplianceRequirement[];
  enabled: boolean;
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  checks: ComplianceCheck[];
  remediation: string;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  controls: string[];
  checks: ComplianceCheck[];
  remediation: string;
}

export interface CompliancePolicy {
  id: string;
  name: string;
  standard: string;
  rules: ComplianceRule[];
  conditions: ComplianceCondition[];
  enabled: boolean;
}

export interface ComplianceRule {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
  action: 'enforce' | 'warn' | 'log';
}

export interface ComplianceCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface ComplianceAssessment {
  id: string;
  standard: string;
  status: 'in_progress' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  results: ComplianceResult[];
  recommendations: ComplianceRecommendation[];
}

export interface ComplianceReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
  escalation: EscalationPolicy;
}

export interface RequestMonitoring {
  enabled: boolean;
  metrics: RequestMetrics;
  alerts: AlertRule[];
  reporting: RequestReporting;
}

export interface RequestReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface ResponseMonitoring {
  enabled: boolean;
  metrics: ResponseMetrics;
  alerts: AlertRule[];
  reporting: ResponseReporting;
}

export interface ResponseReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface ErrorTracking {
  enabled: boolean;
  metrics: ErrorMetrics;
  alerts: AlertRule[];
  reporting: ErrorReporting;
}

export interface ErrorReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface PerformanceTracking {
  enabled: boolean;
  metrics: PerformanceMetrics;
  alerts: AlertRule[];
  reporting: PerformanceReporting;
}

export interface PerformanceReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface UserExperienceMonitoring {
  enabled: boolean;
  metrics: UserMetrics;
  alerts: AlertRule[];
  reporting: UserExperienceReporting;
}

export interface UserExperienceReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface ServerMonitoring {
  enabled: boolean;
  metrics: ServerMetrics;
  alerts: AlertRule[];
  reporting: ServerReporting;
}

export interface ServerMetrics {
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
  processes: ProcessMetrics[];
}

export interface ServerReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface ContainerMonitoring {
  enabled: boolean;
  metrics: ContainerMetrics;
  alerts: AlertRule[];
  reporting: ContainerReporting;
}

export interface ContainerMetrics {
  containers: ContainerMetric[];
  images: ImageMetric[];
  volumes: VolumeMetric[];
  networks: NetworkMetric[];
}

export interface ContainerMetric {
  id: string;
  name: string;
  status: string;
  cpu: number;
  memory: number;
  network: NetworkMetrics;
  disk: DiskMetrics;
}

export interface ImageMetric {
  id: string;
  name: string;
  size: number;
  layers: number;
  vulnerabilities: number;
}

export interface VolumeMetric {
  id: string;
  name: string;
  size: number;
  usage: number;
  mount: string;
}

export interface NetworkMetric {
  id: string;
  name: string;
  type: string;
  containers: string[];
  traffic: NetworkMetrics;
}

export interface ContainerReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface DatabaseMonitoring {
  enabled: boolean;
  metrics: DatabaseMetrics;
  alerts: AlertRule[];
  reporting: DatabaseReporting;
}

export interface DatabaseMetrics {
  connections: ConnectionMetrics;
  queries: QueryMetrics;
  performance: PerformanceMetrics;
  storage: StorageMetrics;
}

export interface ConnectionMetrics {
  total: number;
  active: number;
  idle: number;
  max: number;
  average: number;
}

export interface QueryMetrics {
  total: number;
  slow: number;
  errors: number;
  average: number;
  trends: QueryTrendMetrics[];
}

export interface QueryTrendMetrics {
  timestamp: Date;
  total: number;
  slow: number;
  errors: number;
  average: number;
}

export interface StorageMetrics {
  total: number;
  used: number;
  free: number;
  growth: number;
  trends: StorageTrendMetrics[];
}

export interface StorageTrendMetrics {
  timestamp: Date;
  total: number;
  used: number;
  free: number;
  growth: number;
}

export interface DatabaseReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface StorageMonitoring {
  enabled: boolean;
  metrics: StorageMetrics;
  alerts: AlertRule[];
  reporting: StorageReporting;
}

export interface StorageReporting {
  enabled: boolean;
  frequency: string;
  channels: AlertChannel[];
  template: string;
}

export interface LogAggregation {
  enabled: boolean;
  sources: LogSource[];
  processing: LogProcessing;
  storage: LogStorage;
  search: LogSearch;
}

export interface LogSource {
  id: string;
  name: string;
  type: 'file' | 'syslog' | 'journald' | 'api';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface LogProcessing {
  enabled: boolean;
  parsers: LogParser[];
  filters: LogFilter[];
  transformers: LogTransformer[];
}

export interface LogParser {
  id: string;
  name: string;
  type: 'json' | 'regex' | 'grok' | 'custom';
  pattern: string;
  fields: string[];
}

export interface LogFilter {
  id: string;
  name: string;
  condition: LogFilterCondition;
  action: 'include' | 'exclude';
}

export interface LogFilterCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface LogTransformer {
  id: string;
  name: string;
  type: 'field' | 'value' | 'custom';
  configuration: Record<string, any>;
}

export interface LogStorage {
  enabled: boolean;
  type: 'elasticsearch' | 'loki' | 's3' | 'local';
  configuration: Record<string, any>;
  retention: LogRetention;
}

export interface LogRetention {
  enabled: boolean;
  period: string;
  size: number;
  policy: 'delete' | 'archive' | 'compress';
}

export interface LogSearch {
  enabled: boolean;
  engine: 'elasticsearch' | 'loki' | 'custom';
  configuration: Record<string, any>;
  indexing: LogIndexing;
}

export interface LogIndexing {
  enabled: boolean;
  frequency: string;
  fields: string[];
  analyzers: LogAnalyzer[];
}

export interface LogAnalyzer {
  id: string;
  name: string;
  type: 'text' | 'keyword' | 'date' | 'number';
  configuration: Record<string, any>;
}

export interface DistributedTracing {
  enabled: boolean;
  backend: 'jaeger' | 'zipkin' | 'datadog' | 'custom';
  configuration: Record<string, any>;
  sampling: TraceSampling;
  processing: TraceProcessing;
}

export interface TraceSampling {
  enabled: boolean;
  rate: number;
  strategy: 'probabilistic' | 'rate_limiting' | 'adaptive';
  configuration: Record<string, any>;
}

export interface TraceProcessing {
  enabled: boolean;
  filters: TraceFilter[];
  transformers: TraceTransformer[];
  aggregators: TraceAggregator[];
}

export interface TraceFilter {
  id: string;
  name: string;
  condition: TraceFilterCondition;
  action: 'include' | 'exclude';
}

export interface TraceFilterCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex';
  value: string;
}

export interface TraceTransformer {
  id: string;
  name: string;
  type: 'field' | 'value' | 'custom';
  configuration: Record<string, any>;
}

export interface TraceAggregator {
  id: string;
  name: string;
  type: 'count' | 'sum' | 'average' | 'custom';
  configuration: Record<string, any>;
}
