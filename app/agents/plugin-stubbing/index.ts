import { StubGenerator } from "./stub-generator";
import { SimulationEngine } from "./simulation-engine";
import { TestingFramework } from "./testing-framework";
import { DocumentationGenerator } from "./documentation";

export interface PluginStubbingConfig {
  generator?: {
    templatesPath?: string;
    validationEnabled?: boolean;
    autoGenerate?: boolean;
  };
  simulation?: {
    cacheEnabled?: boolean;
    cacheTTL?: number;
    maxConcurrentSimulations?: number;
    defaultTimeout?: number;
  };
  testing?: {
    autoGenerateTests?: boolean;
    testTimeout?: number;
    retryAttempts?: number;
    parallelExecution?: boolean;
  };
  documentation?: {
    outputFormat?: "markdown" | "html" | "json" | "pdf";
    includeExamples?: boolean;
    includeDiagrams?: boolean;
    includeTestResults?: boolean;
    includePerformanceMetrics?: boolean;
    templatePath?: string;
    outputPath?: string;
  };
}

export class PluginStubbingSystem {
  public generator: StubGenerator;
  public simulation: SimulationEngine;
  public testing: TestingFramework;
  public documentation: DocumentationGenerator;

  constructor(config?: PluginStubbingConfig) {
    // Initialize components
    this.generator = new StubGenerator();
    this.simulation = new SimulationEngine();
    this.testing = new TestingFramework(this.simulation);
    this.documentation = new DocumentationGenerator(config?.documentation);

    this.setupEventForwarding();
  }

  private setupEventForwarding(): void {
    // Forward events from components to the main system
    this.generator.on("*", (event, ...args) => {
      this.emit(`generator:${event}`, ...args);
    });

    this.simulation.on("*", (event, ...args) => {
      this.emit(`simulation:${event}`, ...args);
    });

    this.testing.on("*", (event, ...args) => {
      this.emit(`testing:${event}`, ...args);
    });

    this.documentation.on("*", (event, ...args) => {
      this.emit(`documentation:${event}`, ...args);
    });
  }

  async initialize(): Promise<void> {
    try {
      console.log("Plugin Stubbing System initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Plugin Stubbing System:", error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      // Clear caches
      await this.simulation.clearCache();
      await this.simulation.clearStats();

      console.log("Plugin Stubbing System shutdown successfully");
    } catch (error) {
      console.error("Failed to shutdown Plugin Stubbing System:", error);
      throw error;
    }
  }

  // Convenience methods
  async generateStub(pluginInfo: any, options?: any): Promise<any> {
    return this.generator.generateStub(pluginInfo, options);
  }

  async simulateStub(
    stub: any,
    capability: string,
    input: any,
    options?: any,
  ): Promise<any> {
    return this.simulation.simulate(stub, capability, input, options);
  }

  async testStub(stub: any, testSuite?: any): Promise<any> {
    if (!testSuite) {
      // Generate test suite automatically
      const testCases = await this.testing.generateTestCases(stub);
      testSuite = await this.testing.createTestSuite({
        name: `${stub.name} Test Suite`,
        description: `Automated test suite for ${stub.name}`,
        testCases,
        tags: ["auto-generated"],
        timeout: 30000,
      });
    }

    return this.testing.runTestSuite(testSuite.id);
  }

  async documentStub(
    stub: any,
    testReport?: any,
    simulationStats?: any,
  ): Promise<any> {
    return this.documentation.generateDocumentation(
      stub,
      testReport,
      simulationStats,
    );
  }

  async fullStubWorkflow(
    pluginInfo: any,
    options?: any,
  ): Promise<StubWorkflowResult> {
    try {
      // Generate stub
      const stub = await this.generateStub(pluginInfo, options);

      // Test stub
      const testReport = await this.testStub(stub);

      // Get simulation stats
      const simulationStats = await this.simulation.getSimulationStats(stub.id);

      // Document stub
      const documentation = await this.documentStub(
        stub,
        testReport,
        simulationStats,
      );

      return {
        stub,
        testReport,
        simulationStats,
        documentation,
        success: true,
      };
    } catch (error) {
      return {
        stub: null,
        testReport: null,
        simulationStats: null,
        documentation: null,
        success: false,
        error: error.message,
      };
    }
  }
}

// Export individual components
export {
  StubGenerator,
  SimulationEngine,
  TestingFramework,
  DocumentationGenerator,
};

// Export types
export type {
  PluginStub,
  StubCapabilities,
  StubCapability,
  StubMetadata,
  SimulationConfig,
  SimulationType,
  StubGenerationOptions,
  StubValidationResult,
  ValidationError,
  ValidationWarning,
  PluginInfo,
  StubTemplate,
  StubCustomization,
  ValidationRule,
  ValidationResult,
} from "./stub-generator";

export type {
  SimulationResult,
  SimulationMetadata,
  SimulationContext,
  SimulationOptions,
  SimulationStats,
  AsyncSimulationResult,
  BatchSimulationRequest,
} from "./simulation-engine";

export type {
  TestCase,
  TestAssertion,
  TestSuite,
  TestResult,
  AssertionResult,
  TestMetadata,
  TestReport,
  TestSummary,
  TestCoverage,
  TestStatus,
  AssertionType,
  TestRunOptions,
} from "./testing-framework";

export type {
  DocumentationConfig,
  StubDocumentation,
  DocumentationSection,
  DocumentationMetadata,
  CapabilityDocumentation,
  Example,
  ErrorScenario,
  PerformanceInfo,
  ResourceUsage,
  TestingInfo,
  SectionType,
} from "./documentation";

// Supporting interfaces
export interface StubWorkflowResult {
  stub: any | null;
  testReport: any | null;
  simulationStats: any | null;
  documentation: any | null;
  success: boolean;
  error?: string;
}

// Create and export a default instance
export const pluginStubbingSystem = new PluginStubbingSystem();
