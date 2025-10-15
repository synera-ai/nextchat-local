# AI Coder Security Best Practices

## 🎯 Overview

This guide provides comprehensive security best practices specifically designed for AI coders working with document-driven architecture and project management systems. These practices ensure secure development, deployment, and maintenance of AI-powered applications.

## 🔒 Security Architecture

### 1. Secure Project Management System

```typescript
/**
 * @security-architecture secure-project-management
 * @title Secure Project Management System
 * @description Security-first implementation of project management with comprehensive protection
 * @version 1.0.0
 * @stage implementation
 */
export class SecureProjectManagement {
  private readonly authService: AuthenticationService;
  private readonly authorizationService: AuthorizationService;
  private readonly auditLogger: AuditLogger;
  private readonly encryptionService: EncryptionService;
  private readonly validationService: ValidationService;

  constructor(
    authService: AuthenticationService,
    authorizationService: AuthorizationService,
    auditLogger: AuditLogger,
    encryptionService: EncryptionService,
    validationService: ValidationService
  ) {
    this.authService = authService;
    this.authorizationService = authorizationService;
    this.auditLogger = auditLogger;
    this.encryptionService = encryptionService;
    this.validationService = validationService;
  }

  /**
   * Creates a project with comprehensive security checks
   */
  async createProject(
    spec: ProjectSpec,
    user: AuthenticatedUser
  ): Promise<SecureProject> {
    // 1. Authenticate user
    await this.authenticateUser(user);
    
    // 2. Validate input with security checks
    await this.validateProjectSpec(spec);
    
    // 3. Check authorization
    await this.checkCreatePermission(user);
    
    // 4. Sanitize and encrypt sensitive data
    const sanitizedSpec = await this.sanitizeProjectSpec(spec);
    const encryptedSpec = await this.encryptSensitiveData(sanitizedSpec);
    
    // 5. Create project with security context
    const project = await this.createSecureProject(encryptedSpec, user);
    
    // 6. Log security event
    await this.auditLogger.logSecurityEvent({
      type: 'project_created',
      userId: user.id,
      projectId: project.id,
      timestamp: new Date(),
      securityLevel: 'high',
      details: {
        title: project.title,
        priority: project.priority,
        encrypted: true
      }
    });
    
    return project;
  }

  /**
   * Updates project with security validation
   */
  async updateProject(
    projectId: ProjectId,
    updates: ProjectUpdates,
    user: AuthenticatedUser
  ): Promise<SecureProject> {
    // 1. Authenticate user
    await this.authenticateUser(user);
    
    // 2. Check project access with security context
    await this.checkProjectAccess(projectId, user);
    
    // 3. Validate updates with security checks
    await this.validateProjectUpdates(updates);
    
    // 4. Check update permissions
    await this.checkUpdatePermission(projectId, user);
    
    // 5. Sanitize and encrypt updates
    const sanitizedUpdates = await this.sanitizeProjectUpdates(updates);
    const encryptedUpdates = await this.encryptSensitiveData(sanitizedUpdates);
    
    // 6. Update project securely
    const updatedProject = await this.updateSecureProject(projectId, encryptedUpdates);
    
    // 7. Log security event
    await this.auditLogger.logSecurityEvent({
      type: 'project_updated',
      userId: user.id,
      projectId,
      timestamp: new Date(),
      securityLevel: 'medium',
      details: {
        updates: Object.keys(updates),
        encrypted: true
      }
    });
    
    return updatedProject;
  }

  private async authenticateUser(user: AuthenticatedUser): Promise<void> {
    // Multi-factor authentication check
    if (!user.isAuthenticated) {
      throw new AuthenticationError('User not authenticated');
    }
    
    // Token validation with security checks
    const tokenValidation = await this.authService.validateToken(user.token, {
      checkExpiration: true,
      checkRevocation: true,
      checkSuspiciousActivity: true
    });
    
    if (!tokenValidation.isValid) {
      throw new AuthenticationError(`Token validation failed: ${tokenValidation.reason}`);
    }
    
    // Rate limiting check
    const rateLimitCheck = await this.authService.checkRateLimit(user.id);
    if (!rateLimitCheck.allowed) {
      throw new RateLimitError(`Rate limit exceeded: ${rateLimitCheck.reason}`);
    }
  }

  private async validateProjectSpec(spec: ProjectSpec): Promise<void> {
    // Input validation with security checks
    const validation = await this.validationService.validateProjectSpec(spec, {
      checkInjection: true,
      checkXSS: true,
      checkPathTraversal: true,
      checkSensitiveData: true
    });
    
    if (!validation.isValid) {
      throw new ValidationError(`Security validation failed: ${validation.errors.join(', ')}`);
    }
  }

  private async sanitizeProjectSpec(spec: ProjectSpec): Promise<ProjectSpec> {
    return {
      ...spec,
      title: await this.sanitizeText(spec.title),
      description: await this.sanitizeText(spec.description),
      tags: spec.tags.map(tag => this.sanitizeTag(tag)),
      metadata: await this.sanitizeMetadata(spec.metadata)
    };
  }

  private async encryptSensitiveData(data: any): Promise<any> {
    // Encrypt sensitive fields
    if (data.metadata?.sensitive) {
      data.metadata.sensitive = await this.encryptionService.encrypt(
        data.metadata.sensitive,
        'project-metadata'
      );
    }
    
    return data;
  }
}

export interface AuthenticatedUser {
  readonly id: string;
  readonly token: string;
  readonly isAuthenticated: boolean;
  readonly roles: string[];
  readonly permissions: string[];
  readonly securityLevel: SecurityLevel;
}

export interface SecureProject extends Project {
  readonly encrypted: boolean;
  readonly securityLevel: SecurityLevel;
  readonly accessControl: AccessControl;
  readonly auditTrail: AuditTrail[];
}
```

### 2. Input Validation and Sanitization

```typescript
/**
 * @security-validation input-validation
 * @title Secure Input Validation
 * @description Comprehensive input validation and sanitization for security
 * @version 1.0.0
 * @stage implementation
 */
export class SecureInputValidator {
  private readonly sanitizer: InputSanitizer;
  private readonly validator: SchemaValidator;
  private readonly securityChecker: SecurityChecker;

  constructor(
    sanitizer: InputSanitizer,
    validator: SchemaValidator,
    securityChecker: SecurityChecker
  ) {
    this.sanitizer = sanitizer;
    this.validator = validator;
    this.securityChecker = securityChecker;
  }

  /**
   * Validates project specification with security checks
   */
  async validateProjectSpec(
    spec: ProjectSpec,
    options: ValidationOptions
  ): Promise<SecurityValidationResult> {
    const errors: SecurityError[] = [];
    const warnings: SecurityWarning[] = [];

    // 1. Schema validation
    const schemaValidation = await this.validator.validate(spec);
    if (!schemaValidation.isValid) {
      errors.push(...schemaValidation.errors.map(e => ({
        type: 'schema_error',
        field: e.field,
        message: e.message,
        severity: 'high'
      })));
    }

    // 2. Security validation
    const securityValidation = await this.securityChecker.checkSecurity(spec, options);
    errors.push(...securityValidation.errors);
    warnings.push(...securityValidation.warnings);

    // 3. Injection attack detection
    const injectionCheck = await this.checkInjectionAttacks(spec);
    errors.push(...injectionCheck);

    // 4. XSS attack detection
    const xssCheck = await this.checkXSSAttacks(spec);
    errors.push(...xssCheck);

    // 5. Path traversal detection
    const pathTraversalCheck = await this.checkPathTraversal(spec);
    errors.push(...pathTraversalCheck);

    // 6. Sensitive data detection
    const sensitiveDataCheck = await this.checkSensitiveData(spec);
    warnings.push(...sensitiveDataCheck);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedSpec: await this.sanitizeProjectSpec(spec)
    };
  }

  /**
   * Sanitizes project specification
   */
  async sanitizeProjectSpec(spec: ProjectSpec): Promise<ProjectSpec> {
    return {
      id: await this.sanitizeProjectId(spec.id),
      title: await this.sanitizeTitle(spec.title),
      description: await this.sanitizeDescription(spec.description),
      priority: spec.priority, // Enum values are safe
      tags: await this.sanitizeTags(spec.tags),
      metadata: await this.sanitizeMetadata(spec.metadata)
    };
  }

  private async sanitizeProjectId(id: string): Promise<string> {
    // Remove dangerous characters and normalize
    return id
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  private async sanitizeTitle(title: string): Promise<string> {
    // Remove HTML tags and dangerous characters
    return this.sanitizer.sanitizeHtml(title)
      .replace(/[<>\"'&]/g, '')
      .trim()
      .substring(0, 200);
  }

  private async sanitizeDescription(description: string): Promise<string> {
    // Sanitize HTML and limit length
    return this.sanitizer.sanitizeHtml(description)
      .trim()
      .substring(0, 2000);
  }

  private async sanitizeTags(tags: string[]): Promise<string[]> {
    return tags
      .map(tag => this.sanitizeTag(tag))
      .filter(tag => tag.length > 0)
      .slice(0, 10); // Limit number of tags
  }

  private sanitizeTag(tag: string): string {
    return tag
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 20);
  }

  private async sanitizeMetadata(metadata: ProjectMetadata): Promise<ProjectMetadata> {
    const sanitized: ProjectMetadata = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      // Sanitize key
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '');
      
      // Sanitize value based on type
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = await this.sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = await this.sanitizeMetadata(value as ProjectMetadata);
      } else {
        sanitized[sanitizedKey] = value;
      }
    }
    
    return sanitized;
  }

  private async checkInjectionAttacks(spec: ProjectSpec): Promise<SecurityError[]> {
    const errors: SecurityError[] = [];
    const injectionPatterns = [
      /script\s*:/i,
      /javascript\s*:/i,
      /vbscript\s*:/i,
      /onload\s*=/i,
      /onerror\s*=/i,
      /onclick\s*=/i,
      /<script/i,
      /<\/script>/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ];

    const checkText = (text: string, field: string) => {
      injectionPatterns.forEach(pattern => {
        if (pattern.test(text)) {
          errors.push({
            type: 'injection_attack',
            field,
            message: `Potential injection attack detected in ${field}`,
            severity: 'high'
          });
        }
      });
    };

    checkText(spec.title, 'title');
    checkText(spec.description, 'description');
    spec.tags.forEach((tag, index) => checkText(tag, `tags[${index}]`));

    return errors;
  }

  private async checkXSSAttacks(spec: ProjectSpec): Promise<SecurityError[]> {
    const errors: SecurityError[] = [];
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<meta[^>]*>.*?<\/meta>/gi,
      /<style[^>]*>.*?<\/style>/gi
    ];

    const checkText = (text: string, field: string) => {
      xssPatterns.forEach(pattern => {
        if (pattern.test(text)) {
          errors.push({
            type: 'xss_attack',
            field,
            message: `Potential XSS attack detected in ${field}`,
            severity: 'high'
          });
        }
      });
    };

    checkText(spec.title, 'title');
    checkText(spec.description, 'description');

    return errors;
  }

  private async checkPathTraversal(spec: ProjectSpec): Promise<SecurityError[]> {
    const errors: SecurityError[] = [];
    const pathTraversalPatterns = [
      /\.\.\//g,
      /\.\.\\/g,
      /\.\.%2f/gi,
      /\.\.%5c/gi,
      /\.\.%252f/gi,
      /\.\.%255c/gi
    ];

    const checkText = (text: string, field: string) => {
      pathTraversalPatterns.forEach(pattern => {
        if (pattern.test(text)) {
          errors.push({
            type: 'path_traversal',
            field,
            message: `Potential path traversal attack detected in ${field}`,
            severity: 'high'
          });
        }
      });
    };

    checkText(spec.title, 'title');
    checkText(spec.description, 'description');
    spec.tags.forEach((tag, index) => checkText(tag, `tags[${index}]`));

    return errors;
  }

  private async checkSensitiveData(spec: ProjectSpec): Promise<SecurityWarning[]> {
    const warnings: SecurityWarning[] = [];
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /credential/i,
      /api[_-]?key/i,
      /private[_-]?key/i,
      /access[_-]?token/i,
      /bearer[_-]?token/i
    ];

    const checkText = (text: string, field: string) => {
      sensitivePatterns.forEach(pattern => {
        if (pattern.test(text)) {
          warnings.push({
            type: 'sensitive_data',
            field,
            message: `Potential sensitive data detected in ${field}`,
            severity: 'medium'
          });
        }
      });
    };

    checkText(spec.title, 'title');
    checkText(spec.description, 'description');
    spec.tags.forEach((tag, index) => checkText(tag, `tags[${index}]`));

    return warnings;
  }
}

export interface SecurityValidationResult {
  readonly isValid: boolean;
  readonly errors: SecurityError[];
  readonly warnings: SecurityWarning[];
  readonly sanitizedSpec: ProjectSpec;
}

export interface SecurityError {
  readonly type: string;
  readonly field: string;
  readonly message: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityWarning {
  readonly type: string;
  readonly field: string;
  readonly message: string;
  readonly severity: 'low' | 'medium' | 'high';
}
```

## 🔐 Authentication and Authorization

### 3. Multi-Factor Authentication System

```typescript
/**
 * @security-auth multi-factor-auth
 * @title Multi-Factor Authentication System
 * @description Comprehensive authentication system with multiple security layers
 * @version 1.0.0
 * @stage implementation
 */
export class MultiFactorAuthentication {
  private readonly userService: UserService;
  private readonly tokenService: TokenService;
  private readonly otpService: OTPService;
  private readonly biometricService: BiometricService;
  private readonly auditLogger: AuditLogger;

  constructor(
    userService: UserService,
    tokenService: TokenService,
    otpService: OTPService,
    biometricService: BiometricService,
    auditLogger: AuditLogger
  ) {
    this.userService = userService;
    this.tokenService = tokenService;
    this.otpService = otpService;
    this.biometricService = biometricService;
    this.auditLogger = auditLogger;
  }

  /**
   * Authenticates user with multiple factors
   */
  async authenticate(
    credentials: LoginCredentials,
    factors: AuthenticationFactor[]
  ): Promise<AuthenticationResult> {
    const sessionId = this.generateSessionId();
    
    try {
      // 1. Primary authentication (username/password)
      const primaryAuth = await this.authenticatePrimary(credentials);
      if (!primaryAuth.success) {
        await this.logFailedAuthentication(credentials.username, 'primary_auth_failed');
        throw new AuthenticationError('Primary authentication failed');
      }

      // 2. Multi-factor authentication
      const mfaResult = await this.authenticateMultiFactor(primaryAuth.user, factors);
      if (!mfaResult.success) {
        await this.logFailedAuthentication(credentials.username, 'mfa_failed');
        throw new AuthenticationError('Multi-factor authentication failed');
      }

      // 3. Generate secure session token
      const sessionToken = await this.tokenService.generateSessionToken({
        userId: primaryAuth.user.id,
        sessionId,
        factors: mfaResult.verifiedFactors,
        securityLevel: this.calculateSecurityLevel(mfaResult.verifiedFactors)
      });

      // 4. Log successful authentication
      await this.logSuccessfulAuthentication(primaryAuth.user.id, sessionId, mfaResult.verifiedFactors);

      return {
        success: true,
        user: primaryAuth.user,
        sessionToken,
        sessionId,
        securityLevel: this.calculateSecurityLevel(mfaResult.verifiedFactors),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

    } catch (error) {
      await this.logFailedAuthentication(credentials.username, 'authentication_error');
      throw error;
    }
  }

  /**
   * Verifies authentication token with security checks
   */
  async verifyToken(
    token: string,
    context: SecurityContext
  ): Promise<TokenVerificationResult> {
    try {
      // 1. Validate token format
      const tokenValidation = await this.tokenService.validateToken(token);
      if (!tokenValidation.isValid) {
        throw new TokenValidationError(`Invalid token: ${tokenValidation.reason}`);
      }

      // 2. Check token expiration
      if (tokenValidation.expiresAt < new Date()) {
        throw new TokenExpiredError('Token has expired');
      }

      // 3. Check token revocation
      const revocationCheck = await this.tokenService.checkRevocation(token);
      if (revocationCheck.isRevoked) {
        throw new TokenRevokedError('Token has been revoked');
      }

      // 4. Check suspicious activity
      const suspiciousActivityCheck = await this.checkSuspiciousActivity(
        tokenValidation.userId,
        context
      );
      if (suspiciousActivityCheck.isSuspicious) {
        await this.revokeToken(token, 'suspicious_activity');
        throw new SuspiciousActivityError('Suspicious activity detected');
      }

      // 5. Update last access time
      await this.tokenService.updateLastAccess(token, new Date());

      return {
        isValid: true,
        userId: tokenValidation.userId,
        sessionId: tokenValidation.sessionId,
        securityLevel: tokenValidation.securityLevel,
        factors: tokenValidation.factors,
        lastAccess: new Date()
      };

    } catch (error) {
      return {
        isValid: false,
        error: error.message,
        reason: error.constructor.name
      };
    }
  }

  private async authenticatePrimary(credentials: LoginCredentials): Promise<PrimaryAuthResult> {
    // 1. Find user by username
    const user = await this.userService.findByUsername(credentials.username);
    if (!user) {
      return { success: false, reason: 'user_not_found' };
    }

    // 2. Check account status
    if (user.status !== 'active') {
      return { success: false, reason: 'account_inactive' };
    }

    // 3. Verify password
    const passwordValid = await this.userService.verifyPassword(
      user.id,
      credentials.password
    );
    if (!passwordValid) {
      return { success: false, reason: 'invalid_password' };
    }

    // 4. Check password expiration
    if (user.passwordExpiresAt && user.passwordExpiresAt < new Date()) {
      return { success: false, reason: 'password_expired' };
    }

    return { success: true, user };
  }

  private async authenticateMultiFactor(
    user: User,
    factors: AuthenticationFactor[]
  ): Promise<MFAResult> {
    const verifiedFactors: AuthenticationFactor[] = [];
    const requiredFactors = await this.getRequiredFactors(user);

    for (const factor of factors) {
      const verification = await this.verifyFactor(user, factor);
      if (verification.success) {
        verifiedFactors.push(factor);
      }
    }

    // Check if all required factors are verified
    const hasAllRequiredFactors = requiredFactors.every(required =>
      verifiedFactors.some(verified => verified.type === required.type)
    );

    return {
      success: hasAllRequiredFactors,
      verifiedFactors,
      requiredFactors,
      missingFactors: requiredFactors.filter(required =>
        !verifiedFactors.some(verified => verified.type === required.type)
      )
    };
  }

  private async verifyFactor(
    user: User,
    factor: AuthenticationFactor
  ): Promise<FactorVerificationResult> {
    switch (factor.type) {
      case 'totp':
        return await this.verifyTOTP(user, factor);
      case 'sms':
        return await this.verifySMS(user, factor);
      case 'email':
        return await this.verifyEmail(user, factor);
      case 'biometric':
        return await this.verifyBiometric(user, factor);
      case 'hardware_token':
        return await this.verifyHardwareToken(user, factor);
      default:
        return { success: false, reason: 'unsupported_factor_type' };
    }
  }

  private async verifyTOTP(
    user: User,
    factor: AuthenticationFactor
  ): Promise<FactorVerificationResult> {
    const totpSecret = await this.userService.getTOTPSecret(user.id);
    if (!totpSecret) {
      return { success: false, reason: 'totp_not_configured' };
    }

    const isValid = await this.otpService.verifyTOTP(
      factor.value,
      totpSecret,
      { window: 2 } // Allow 2 time windows
    );

    return { success: isValid, reason: isValid ? 'verified' : 'invalid_code' };
  }

  private async verifyBiometric(
    user: User,
    factor: AuthenticationFactor
  ): Promise<FactorVerificationResult> {
    const biometricData = await this.userService.getBiometricData(user.id);
    if (!biometricData) {
      return { success: false, reason: 'biometric_not_configured' };
    }

    const isValid = await this.biometricService.verify(
      factor.value,
      biometricData,
      { threshold: 0.95 } // 95% confidence threshold
    );

    return { success: isValid, reason: isValid ? 'verified' : 'biometric_mismatch' };
  }

  private calculateSecurityLevel(factors: AuthenticationFactor[]): SecurityLevel {
    const factorTypes = factors.map(f => f.type);
    
    if (factorTypes.includes('biometric') && factorTypes.includes('hardware_token')) {
      return 'critical';
    } else if (factorTypes.includes('biometric') || factorTypes.includes('hardware_token')) {
      return 'high';
    } else if (factorTypes.includes('totp')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private async checkSuspiciousActivity(
    userId: string,
    context: SecurityContext
  ): Promise<SuspiciousActivityResult> {
    // Check for unusual login patterns
    const recentLogins = await this.userService.getRecentLogins(userId, 24); // Last 24 hours
    const unusualLocation = await this.checkUnusualLocation(context.ipAddress, userId);
    const unusualTime = await this.checkUnusualTime(context.timestamp, userId);
    const rapidRequests = await this.checkRapidRequests(userId, context.timestamp);

    return {
      isSuspicious: unusualLocation || unusualTime || rapidRequests,
      reasons: [
        unusualLocation && 'unusual_location',
        unusualTime && 'unusual_time',
        rapidRequests && 'rapid_requests'
      ].filter(Boolean)
    };
  }

  private async logSuccessfulAuthentication(
    userId: string,
    sessionId: string,
    factors: AuthenticationFactor[]
  ): Promise<void> {
    await this.auditLogger.logSecurityEvent({
      type: 'authentication_success',
      userId,
      sessionId,
      timestamp: new Date(),
      securityLevel: 'high',
      details: {
        factors: factors.map(f => f.type),
        factorCount: factors.length
      }
    });
  }

  private async logFailedAuthentication(
    username: string,
    reason: string
  ): Promise<void> {
    await this.auditLogger.logSecurityEvent({
      type: 'authentication_failure',
      username,
      timestamp: new Date(),
      securityLevel: 'medium',
      details: { reason }
    });
  }
}

export interface AuthenticationFactor {
  readonly type: 'totp' | 'sms' | 'email' | 'biometric' | 'hardware_token';
  readonly value: string;
  readonly metadata?: Record<string, unknown>;
}

export interface SecurityContext {
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly timestamp: Date;
  readonly location?: GeoLocation;
}

export interface AuthenticationResult {
  readonly success: boolean;
  readonly user?: User;
  readonly sessionToken?: string;
  readonly sessionId?: string;
  readonly securityLevel?: SecurityLevel;
  readonly expiresAt?: Date;
  readonly error?: string;
}
```

## 🛡️ Data Protection and Encryption

### 4. Comprehensive Data Encryption

```typescript
/**
 * @security-encryption data-encryption
 * @title Data Encryption System
 * @description Comprehensive data encryption for sensitive information
 * @version 1.0.0
 * @stage implementation
 */
export class DataEncryptionService {
  private readonly keyManager: KeyManager;
  private readonly encryptionEngine: EncryptionEngine;
  private readonly auditLogger: AuditLogger;

  constructor(
    keyManager: KeyManager,
    encryptionEngine: EncryptionEngine,
    auditLogger: AuditLogger
  ) {
    this.keyManager = keyManager;
    this.encryptionEngine = encryptionEngine;
    this.auditLogger = auditLogger;
  }

  /**
   * Encrypts sensitive project data
   */
  async encryptProjectData(
    data: ProjectData,
    encryptionLevel: EncryptionLevel
  ): Promise<EncryptedProjectData> {
    const encryptionKey = await this.keyManager.getEncryptionKey(encryptionLevel);
    
    const encryptedData: EncryptedProjectData = {
      id: data.id,
      title: await this.encryptField(data.title, encryptionKey),
      description: await this.encryptField(data.description, encryptionKey),
      metadata: await this.encryptMetadata(data.metadata, encryptionKey),
      encryptionLevel,
      encryptedAt: new Date(),
      keyId: encryptionKey.id
    };

    // Log encryption event
    await this.auditLogger.logSecurityEvent({
      type: 'data_encrypted',
      dataId: data.id,
      timestamp: new Date(),
      securityLevel: 'high',
      details: {
        encryptionLevel,
        keyId: encryptionKey.id,
        fieldsEncrypted: ['title', 'description', 'metadata']
      }
    });

    return encryptedData;
  }

  /**
   * Decrypts project data with access control
   */
  async decryptProjectData(
    encryptedData: EncryptedProjectData,
    user: AuthenticatedUser
  ): Promise<ProjectData> {
    // Check decryption permissions
    await this.checkDecryptionPermission(encryptedData, user);

    // Get decryption key
    const decryptionKey = await this.keyManager.getDecryptionKey(
      encryptedData.keyId,
      user
    );

    // Decrypt data
    const decryptedData: ProjectData = {
      id: encryptedData.id,
      title: await this.decryptField(encryptedData.title, decryptionKey),
      description: await this.decryptField(encryptedData.description, decryptionKey),
      metadata: await this.decryptMetadata(encryptedData.metadata, decryptionKey)
    };

    // Log decryption event
    await this.auditLogger.logSecurityEvent({
      type: 'data_decrypted',
      dataId: encryptedData.id,
      userId: user.id,
      timestamp: new Date(),
      securityLevel: 'high',
      details: {
        encryptionLevel: encryptedData.encryptionLevel,
        keyId: encryptedData.keyId
      }
    });

    return decryptedData;
  }

  /**
   * Encrypts sensitive fields in project updates
   */
  async encryptProjectUpdates(
    updates: ProjectUpdates,
    encryptionLevel: EncryptionLevel
  ): Promise<EncryptedProjectUpdates> {
    const encryptionKey = await this.keyManager.getEncryptionKey(encryptionLevel);
    
    const encryptedUpdates: EncryptedProjectUpdates = {};

    if (updates.title) {
      encryptedUpdates.title = await this.encryptField(updates.title, encryptionKey);
    }

    if (updates.description) {
      encryptedUpdates.description = await this.encryptField(updates.description, encryptionKey);
    }

    if (updates.metadata) {
      encryptedUpdates.metadata = await this.encryptMetadata(updates.metadata, encryptionKey);
    }

    return {
      ...encryptedUpdates,
      encryptionLevel,
      encryptedAt: new Date(),
      keyId: encryptionKey.id
    };
  }

  private async encryptField(
    value: string,
    key: EncryptionKey
  ): Promise<EncryptedField> {
    const encrypted = await this.encryptionEngine.encrypt(value, key);
    
    return {
      value: encrypted.ciphertext,
      algorithm: encrypted.algorithm,
      iv: encrypted.iv,
      tag: encrypted.tag,
      keyId: key.id
    };
  }

  private async decryptField(
    encryptedField: EncryptedField,
    key: EncryptionKey
  ): Promise<string> {
    const decrypted = await this.encryptionEngine.decrypt(
      {
        ciphertext: encryptedField.value,
        algorithm: encryptedField.algorithm,
        iv: encryptedField.iv,
        tag: encryptedField.tag
      },
      key
    );

    return decrypted;
  }

  private async encryptMetadata(
    metadata: ProjectMetadata,
    key: EncryptionKey
  ): Promise<EncryptedMetadata> {
    const serialized = JSON.stringify(metadata);
    const encrypted = await this.encryptionEngine.encrypt(serialized, key);
    
    return {
      value: encrypted.ciphertext,
      algorithm: encrypted.algorithm,
      iv: encrypted.iv,
      tag: encrypted.tag,
      keyId: key.id
    };
  }

  private async decryptMetadata(
    encryptedMetadata: EncryptedMetadata,
    key: EncryptionKey
  ): Promise<ProjectMetadata> {
    const decrypted = await this.encryptionEngine.decrypt(
      {
        ciphertext: encryptedMetadata.value,
        algorithm: encryptedMetadata.algorithm,
        iv: encryptedMetadata.iv,
        tag: encryptedMetadata.tag
      },
      key
    );

    return JSON.parse(decrypted);
  }

  private async checkDecryptionPermission(
    encryptedData: EncryptedProjectData,
    user: AuthenticatedUser
  ): Promise<void> {
    // Check if user has permission to decrypt this data
    const hasPermission = await this.keyManager.checkDecryptionPermission(
      encryptedData.keyId,
      user
    );

    if (!hasPermission) {
      throw new AuthorizationError('Insufficient permissions to decrypt data');
    }
  }
}

export interface EncryptedProjectData {
  readonly id: ProjectId;
  readonly title: EncryptedField;
  readonly description: EncryptedField;
  readonly metadata: EncryptedMetadata;
  readonly encryptionLevel: EncryptionLevel;
  readonly encryptedAt: Date;
  readonly keyId: string;
}

export interface EncryptedField {
  readonly value: string;
  readonly algorithm: string;
  readonly iv: string;
  readonly tag: string;
  readonly keyId: string;
}

export interface EncryptedMetadata {
  readonly value: string;
  readonly algorithm: string;
  readonly iv: string;
  readonly tag: string;
  readonly keyId: string;
}

export type EncryptionLevel = 'low' | 'medium' | 'high' | 'critical';
```

## 📊 Security Monitoring and Auditing

### 5. Comprehensive Security Monitoring

```typescript
/**
 * @security-monitoring security-monitoring
 * @title Security Monitoring System
 * @description Comprehensive security monitoring and threat detection
 * @version 1.0.0
 * @stage implementation
 */
export class SecurityMonitoringSystem {
  private readonly eventCollector: SecurityEventCollector;
  private readonly threatDetector: ThreatDetector;
  private readonly alertManager: AlertManager;
  private readonly auditLogger: AuditLogger;

  constructor(
    eventCollector: SecurityEventCollector,
    threatDetector: ThreatDetector,
    alertManager: AlertManager,
    auditLogger: AuditLogger
  ) {
    this.eventCollector = eventCollector;
    this.threatDetector = threatDetector;
    this.alertManager = alertManager;
    this.auditLogger = auditLogger;
  }

  /**
   * Monitors security events in real-time
   */
  async monitorSecurityEvents(): Promise<void> {
    // Start event collection
    await this.eventCollector.startCollection();

    // Process events in real-time
    this.eventCollector.onEvent(async (event: SecurityEvent) => {
      try {
        // Analyze event for threats
        const threatAnalysis = await this.threatDetector.analyzeEvent(event);
        
        // Log security event
        await this.auditLogger.logSecurityEvent(event);
        
        // Check for threats
        if (threatAnalysis.threatLevel > 0) {
          await this.handleThreat(event, threatAnalysis);
        }
        
        // Update security metrics
        await this.updateSecurityMetrics(event, threatAnalysis);
        
      } catch (error) {
        console.error('Error processing security event:', error);
      }
    });
  }

  /**
   * Handles detected security threats
   */
  private async handleThreat(
    event: SecurityEvent,
    analysis: ThreatAnalysis
  ): Promise<void> {
    // Generate alert
    const alert = await this.alertManager.generateAlert({
      event,
      analysis,
      severity: this.calculateSeverity(analysis.threatLevel),
      timestamp: new Date()
    });

    // Send alert to security team
    await this.alertManager.sendAlert(alert);

    // Take automated response actions
    await this.takeAutomatedResponse(event, analysis);

    // Log threat response
    await this.auditLogger.logSecurityEvent({
      type: 'threat_detected',
      eventId: event.id,
      timestamp: new Date(),
      securityLevel: 'critical',
      details: {
        threatLevel: analysis.threatLevel,
        threatType: analysis.threatType,
        responseActions: analysis.recommendedActions
      }
    });
  }

  /**
   * Takes automated response actions
   */
  private async takeAutomatedResponse(
    event: SecurityEvent,
    analysis: ThreatAnalysis
  ): Promise<void> {
    const actions = analysis.recommendedActions;

    for (const action of actions) {
      switch (action.type) {
        case 'block_ip':
          await this.blockIPAddress(action.target);
          break;
        case 'suspend_user':
          await this.suspendUser(action.target);
          break;
        case 'revoke_token':
          await this.revokeToken(action.target);
          break;
        case 'rate_limit':
          await this.applyRateLimit(action.target, action.parameters);
          break;
        case 'notify_admin':
          await this.notifyAdministrator(event, analysis);
          break;
      }
    }
  }

  /**
   * Generates security reports
   */
  async generateSecurityReport(
    timeRange: TimeRange
  ): Promise<SecurityReport> {
    const events = await this.auditLogger.getSecurityEvents(timeRange);
    const threats = await this.threatDetector.getThreats(timeRange);
    const alerts = await this.alertManager.getAlerts(timeRange);

    return {
      timeRange,
      totalEvents: events.length,
      threatEvents: threats.length,
      alertsGenerated: alerts.length,
      threatTypes: this.analyzeThreatTypes(threats),
      attackVectors: this.analyzeAttackVectors(threats),
      responseEffectiveness: this.analyzeResponseEffectiveness(alerts),
      recommendations: await this.generateSecurityRecommendations(events, threats, alerts)
    };
  }

  private calculateSeverity(threatLevel: number): AlertSeverity {
    if (threatLevel >= 0.9) return 'critical';
    if (threatLevel >= 0.7) return 'high';
    if (threatLevel >= 0.5) return 'medium';
    return 'low';
  }

  private analyzeThreatTypes(threats: ThreatAnalysis[]): ThreatTypeAnalysis[] {
    const threatTypes = new Map<string, number>();
    
    threats.forEach(threat => {
      const type = threat.threatType;
      threatTypes.set(type, (threatTypes.get(type) || 0) + 1);
    });

    return Array.from(threatTypes.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: count / threats.length
      }))
      .sort((a, b) => b.count - a.count);
  }

  private analyzeAttackVectors(threats: ThreatAnalysis[]): AttackVectorAnalysis[] {
    const vectors = new Map<string, number>();
    
    threats.forEach(threat => {
      const vector = threat.attackVector;
      vectors.set(vector, (vectors.get(vector) || 0) + 1);
    });

    return Array.from(vectors.entries())
      .map(([vector, count]) => ({
        vector,
        count,
        percentage: count / threats.length
      }))
      .sort((a, b) => b.count - a.count);
  }

  private analyzeResponseEffectiveness(alerts: SecurityAlert[]): ResponseEffectiveness {
    const totalAlerts = alerts.length;
    const respondedAlerts = alerts.filter(alert => alert.responseTime !== null);
    const averageResponseTime = respondedAlerts.reduce(
      (sum, alert) => sum + alert.responseTime!,
      0
    ) / respondedAlerts.length;

    return {
      responseRate: respondedAlerts.length / totalAlerts,
      averageResponseTime,
      effectiveness: this.calculateEffectiveness(alerts)
    };
  }

  private calculateEffectiveness(alerts: SecurityAlert[]): number {
    // Calculate effectiveness based on response time and resolution
    const effectiveAlerts = alerts.filter(alert => 
      alert.responseTime !== null && 
      alert.responseTime < 300000 && // 5 minutes
      alert.resolved
    );

    return effectiveAlerts.length / alerts.length;
  }
}

export interface SecurityEvent {
  readonly id: string;
  readonly type: string;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly details: Record<string, unknown>;
}

export interface ThreatAnalysis {
  readonly threatLevel: number; // 0-1
  readonly threatType: string;
  readonly attackVector: string;
  readonly confidence: number;
  readonly recommendedActions: ThreatResponseAction[];
}

export interface SecurityReport {
  readonly timeRange: TimeRange;
  readonly totalEvents: number;
  readonly threatEvents: number;
  readonly alertsGenerated: number;
  readonly threatTypes: ThreatTypeAnalysis[];
  readonly attackVectors: AttackVectorAnalysis[];
  readonly responseEffectiveness: ResponseEffectiveness;
  readonly recommendations: string[];
}
```

## 📚 Related Documentation

- [Security Testing](./testing/README.md)
- [Vulnerability Management](./vulnerability/README.md)
- [Compliance Guidelines](./compliance/README.md)
- [Auditing Procedures](./auditing/README.md)
- [Security Monitoring](./monitoring/README.md)

## 🔗 External Resources

- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [ISO 27001 Security Standards](https://www.iso.org/isoiec-27001-information-security.html)
- [CIS Controls](https://www.cisecurity.org/controls/)

---

*This documentation is part of the NextChat AI Coder Documentation system and follows document-driven architecture principles.*
