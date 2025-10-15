import { EventEmitter } from "events";
import { PluginStub, StubCapability } from "./stub-generator";
import { SimulationStats } from "./simulation-engine";
import { TestReport, TestResult } from "./testing-framework";

export interface DocumentationConfig {
  outputFormat: "markdown" | "html" | "json" | "pdf";
  includeExamples: boolean;
  includeDiagrams: boolean;
  includeTestResults: boolean;
  includePerformanceMetrics: boolean;
  templatePath?: string;
  outputPath?: string;
}

export interface StubDocumentation {
  id: string;
  stubId: string;
  title: string;
  description: string;
  version: string;
  generatedAt: Date;
  sections: DocumentationSection[];
  metadata: DocumentationMetadata;
}

export interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  type: SectionType;
  order: number;
  subsections?: DocumentationSection[];
}

export interface DocumentationMetadata {
  totalCapabilities: number;
  totalTestCases: number;
  testCoverage: number;
  performanceScore: number;
  reliabilityScore: number;
  lastUpdated: Date;
  generatedBy: string;
  template: string;
}

export interface CapabilityDocumentation {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  examples: Example[];
  errorScenarios: ErrorScenario[];
  performance: PerformanceInfo;
  testing: TestingInfo;
}

export interface Example {
  id: string;
  name: string;
  description: string;
  input: any;
  output: any;
  explanation: string;
  tags: string[];
}

export interface ErrorScenario {
  type: string;
  message: string;
  cause: string;
  resolution: string;
  probability: number;
  recoverable: boolean;
}

export interface PerformanceInfo {
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  resourceUsage: ResourceUsage;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
}

export interface TestingInfo {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testCoverage: number;
  lastTestRun?: Date;
  testResults?: TestResult[];
}

export enum SectionType {
  OVERVIEW = "overview",
  CAPABILITIES = "capabilities",
  EXAMPLES = "examples",
  ERROR_HANDLING = "error_handling",
  PERFORMANCE = "performance",
  TESTING = "testing",
  API_REFERENCE = "api_reference",
  TROUBLESHOOTING = "troubleshooting",
}

export class DocumentationGenerator extends EventEmitter {
  private config: DocumentationConfig;
  private templates: Map<string, string> = new Map();
  private generatedDocs: Map<string, StubDocumentation> = new Map();

  constructor(config?: Partial<DocumentationConfig>) {
    super();
    this.config = {
      outputFormat: "markdown",
      includeExamples: true,
      includeDiagrams: true,
      includeTestResults: true,
      includePerformanceMetrics: true,
      ...config,
    };

    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Initialize documentation templates
    this.templates.set("overview", this.getOverviewTemplate());
    this.templates.set("capabilities", this.getCapabilitiesTemplate());
    this.templates.set("examples", this.getExamplesTemplate());
    this.templates.set("error_handling", this.getErrorHandlingTemplate());
    this.templates.set("performance", this.getPerformanceTemplate());
    this.templates.set("testing", this.getTestingTemplate());
    this.templates.set("api_reference", this.getApiReferenceTemplate());
    this.templates.set("troubleshooting", this.getTroubleshootingTemplate());
  }

  async generateDocumentation(
    stub: PluginStub,
    testReport?: TestReport,
    simulationStats?: SimulationStats,
  ): Promise<StubDocumentation> {
    try {
      const startTime = Date.now();

      // Generate sections
      const sections = await this.generateSections(
        stub,
        testReport,
        simulationStats,
      );

      // Create metadata
      const metadata = this.generateMetadata(stub, testReport, simulationStats);

      // Create documentation
      const documentation: StubDocumentation = {
        id: this.generateDocumentationId(),
        stubId: stub.id,
        title: `${stub.name} Documentation`,
        description: stub.description,
        version: stub.version,
        generatedAt: new Date(),
        sections,
        metadata,
      };

      // Store documentation
      this.generatedDocs.set(stub.id, documentation);

      this.emit("documentationGenerated", { stub, documentation });
      return documentation;
    } catch (error) {
      this.emit("documentationGenerationError", { stub, error });
      throw error;
    }
  }

  async generateSection(
    stub: PluginStub,
    sectionType: SectionType,
    testReport?: TestReport,
    simulationStats?: SimulationStats,
  ): Promise<DocumentationSection> {
    switch (sectionType) {
      case SectionType.OVERVIEW:
        return this.generateOverviewSection(stub);
      case SectionType.CAPABILITIES:
        return this.generateCapabilitiesSection(stub);
      case SectionType.EXAMPLES:
        return this.generateExamplesSection(stub);
      case SectionType.ERROR_HANDLING:
        return this.generateErrorHandlingSection(stub);
      case SectionType.PERFORMANCE:
        return this.generatePerformanceSection(stub, simulationStats);
      case SectionType.TESTING:
        return this.generateTestingSection(stub, testReport);
      case SectionType.API_REFERENCE:
        return this.generateApiReferenceSection(stub);
      case SectionType.TROUBLESHOOTING:
        return this.generateTroubleshootingSection(stub);
      default:
        throw new Error(`Unknown section type: ${sectionType}`);
    }
  }

  async exportDocumentation(
    documentation: StubDocumentation,
    format: "markdown" | "html" | "json" | "pdf" = "markdown",
  ): Promise<string> {
    switch (format) {
      case "markdown":
        return this.exportToMarkdown(documentation);
      case "html":
        return this.exportToHtml(documentation);
      case "json":
        return this.exportToJson(documentation);
      case "pdf":
        return this.exportToPdf(documentation);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async getDocumentation(stubId: string): Promise<StubDocumentation | null> {
    return this.generatedDocs.get(stubId) || null;
  }

  async getAllDocumentation(): Promise<StubDocumentation[]> {
    return Array.from(this.generatedDocs.values());
  }

  async deleteDocumentation(stubId: string): Promise<boolean> {
    const deleted = this.generatedDocs.delete(stubId);
    if (deleted) {
      this.emit("documentationDeleted", { stubId });
    }
    return deleted;
  }

  private async generateSections(
    stub: PluginStub,
    testReport?: TestReport,
    simulationStats?: SimulationStats,
  ): Promise<DocumentationSection[]> {
    const sections: DocumentationSection[] = [];

    // Generate core sections
    sections.push(await this.generateOverviewSection(stub));
    sections.push(await this.generateCapabilitiesSection(stub));

    if (this.config.includeExamples) {
      sections.push(await this.generateExamplesSection(stub));
    }

    sections.push(await this.generateErrorHandlingSection(stub));

    if (this.config.includePerformanceMetrics) {
      sections.push(
        await this.generatePerformanceSection(stub, simulationStats),
      );
    }

    if (this.config.includeTestResults) {
      sections.push(await this.generateTestingSection(stub, testReport));
    }

    sections.push(await this.generateApiReferenceSection(stub));
    sections.push(await this.generateTroubleshootingSection(stub));

    return sections;
  }

  private async generateOverviewSection(
    stub: PluginStub,
  ): Promise<DocumentationSection> {
    const content = this.templates
      .get("overview")!
      .replace("{{STUB_NAME}}", stub.name)
      .replace("{{STUB_DESCRIPTION}}", stub.description)
      .replace("{{STUB_VERSION}}", stub.version)
      .replace(
        "{{CAPABILITIES_COUNT}}",
        Object.keys(stub.capabilities).length.toString(),
      )
      .replace("{{GENERATED_AT}}", stub.generatedAt.toISOString())
      .replace("{{COMPLEXITY}}", stub.metadata.complexity)
      .replace("{{RELIABILITY}}", (stub.metadata.reliability * 100).toFixed(1));

    return {
      id: "overview",
      title: "Overview",
      content,
      type: SectionType.OVERVIEW,
      order: 1,
    };
  }

  private async generateCapabilitiesSection(
    stub: PluginStub,
  ): Promise<DocumentationSection> {
    const subsections: DocumentationSection[] = [];

    for (const [capabilityName, capability] of Object.entries(
      stub.capabilities,
    )) {
      const capabilityDoc = await this.generateCapabilityDocumentation(
        capabilityName,
        capability,
      );
      const content = this.templates
        .get("capabilities")!
        .replace("{{CAPABILITY_NAME}}", capability.name)
        .replace("{{CAPABILITY_DESCRIPTION}}", capability.description)
        .replace(
          "{{INPUT_SCHEMA}}",
          JSON.stringify(capability.inputSchema, null, 2),
        )
        .replace(
          "{{OUTPUT_SCHEMA}}",
          JSON.stringify(capability.outputSchema, null, 2),
        )
        .replace("{{SIMULATION_TYPE}}", capability.simulationType)
        .replace(
          "{{ESTIMATED_TIME}}",
          capability.estimatedExecutionTime.toString(),
        )
        .replace("{{SUCCESS_RATE}}", (capability.successRate * 100).toFixed(1));

      subsections.push({
        id: `capability_${capabilityName}`,
        title: capability.name,
        content,
        type: SectionType.CAPABILITIES,
        order: subsections.length + 1,
      });
    }

    return {
      id: "capabilities",
      title: "Capabilities",
      content: `This stub provides ${
        Object.keys(stub.capabilities).length
      } capabilities:`,
      type: SectionType.CAPABILITIES,
      order: 2,
      subsections,
    };
  }

  private async generateExamplesSection(
    stub: PluginStub,
  ): Promise<DocumentationSection> {
    const examples: Example[] = [];

    for (const [capabilityName, capability] of Object.entries(
      stub.capabilities,
    )) {
      const example = this.generateExample(capabilityName, capability);
      examples.push(example);
    }

    const content = this.templates
      .get("examples")!
      .replace("{{EXAMPLES}}", this.formatExamples(examples));

    return {
      id: "examples",
      title: "Examples",
      content,
      type: SectionType.EXAMPLES,
      order: 3,
    };
  }

  private async generateErrorHandlingSection(
    stub: PluginStub,
  ): Promise<DocumentationSection> {
    const errorScenarios: ErrorScenario[] = [];

    for (const capability of Object.values(stub.capabilities)) {
      for (const errorType of capability.simulationConfig.errorTypes) {
        errorScenarios.push({
          type: errorType.type,
          message: errorType.message,
          cause: this.generateErrorCause(errorType.type),
          resolution: this.generateErrorResolution(errorType.type),
          probability: errorType.probability,
          recoverable: errorType.recoverable,
        });
      }
    }

    const content = this.templates
      .get("error_handling")!
      .replace(
        "{{ERROR_SCENARIOS}}",
        this.formatErrorScenarios(errorScenarios),
      );

    return {
      id: "error_handling",
      title: "Error Handling",
      content,
      type: SectionType.ERROR_HANDLING,
      order: 4,
    };
  }

  private async generatePerformanceSection(
    stub: PluginStub,
    simulationStats?: SimulationStats,
  ): Promise<DocumentationSection> {
    const performanceInfo = this.generatePerformanceInfo(stub, simulationStats);

    const content = this.templates
      .get("performance")!
      .replace(
        "{{AVERAGE_RESPONSE_TIME}}",
        performanceInfo.averageResponseTime.toFixed(2),
      )
      .replace(
        "{{SUCCESS_RATE}}",
        (performanceInfo.successRate * 100).toFixed(1),
      )
      .replace("{{ERROR_RATE}}", (performanceInfo.errorRate * 100).toFixed(1))
      .replace("{{THROUGHPUT}}", performanceInfo.throughput.toFixed(2));

    return {
      id: "performance",
      title: "Performance",
      content,
      type: SectionType.PERFORMANCE,
      order: 5,
    };
  }

  private async generateTestingSection(
    stub: PluginStub,
    testReport?: TestReport,
  ): Promise<DocumentationSection> {
    const testingInfo = this.generateTestingInfo(stub, testReport);

    const content = this.templates
      .get("testing")!
      .replace("{{TOTAL_TESTS}}", testingInfo.totalTests.toString())
      .replace("{{PASSED_TESTS}}", testingInfo.passedTests.toString())
      .replace("{{FAILED_TESTS}}", testingInfo.failedTests.toString())
      .replace("{{TEST_COVERAGE}}", (testingInfo.testCoverage * 100).toFixed(1))
      .replace(
        "{{LAST_TEST_RUN}}",
        testingInfo.lastTestRun?.toISOString() || "Never",
      );

    return {
      id: "testing",
      title: "Testing",
      content,
      type: SectionType.TESTING,
      order: 6,
    };
  }

  private async generateApiReferenceSection(
    stub: PluginStub,
  ): Promise<DocumentationSection> {
    const content = this.templates
      .get("api_reference")!
      .replace("{{STUB_ID}}", stub.id)
      .replace("{{STUB_NAME}}", stub.name)
      .replace(
        "{{CAPABILITIES}}",
        this.formatCapabilitiesForApi(stub.capabilities),
      );

    return {
      id: "api_reference",
      title: "API Reference",
      content,
      type: SectionType.API_REFERENCE,
      order: 7,
    };
  }

  private async generateTroubleshootingSection(
    stub: PluginStub,
  ): Promise<DocumentationSection> {
    const content = this.templates
      .get("troubleshooting")!
      .replace("{{STUB_NAME}}", stub.name)
      .replace("{{COMMON_ISSUES}}", this.generateCommonIssues(stub));

    return {
      id: "troubleshooting",
      title: "Troubleshooting",
      content,
      type: SectionType.TROUBLESHOOTING,
      order: 8,
    };
  }

  private async generateCapabilityDocumentation(
    capabilityName: string,
    capability: StubCapability,
  ): Promise<CapabilityDocumentation> {
    return {
      name: capability.name,
      description: capability.description,
      inputSchema: capability.inputSchema,
      outputSchema: capability.outputSchema,
      examples: [this.generateExample(capabilityName, capability)],
      errorScenarios: capability.simulationConfig.errorTypes.map((et) => ({
        type: et.type,
        message: et.message,
        cause: this.generateErrorCause(et.type),
        resolution: this.generateErrorResolution(et.type),
        probability: et.probability,
        recoverable: et.recoverable,
      })),
      performance: {
        averageResponseTime: capability.estimatedExecutionTime,
        successRate: capability.successRate,
        errorRate: capability.errorRate,
        throughput: 1 / (capability.estimatedExecutionTime / 1000),
        resourceUsage: {
          cpu: 0.1,
          memory: 0.05,
          network: 0.02,
          storage: 0.01,
        },
      },
      testing: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        testCoverage: 0,
      },
    };
  }

  private generateExample(
    capabilityName: string,
    capability: StubCapability,
  ): Example {
    const input = this.generateExampleInput(capability.inputSchema);
    const output = this.generateExampleOutput(capability.outputSchema);

    return {
      id: `example_${capabilityName}`,
      name: `${capabilityName} Example`,
      description: `Basic example of using ${capabilityName}`,
      input,
      output,
      explanation: `This example demonstrates the basic usage of ${capabilityName}.`,
      tags: ["basic", "example"],
    };
  }

  private generateExampleInput(schema: any): any {
    if (!schema || !schema.properties) {
      return { example: "input" };
    }

    const input: any = {};
    for (const [key, prop] of Object.entries(schema.properties)) {
      const property = prop as any;
      input[key] = this.generateExampleValue(property);
    }

    return input;
  }

  private generateExampleOutput(schema: any): any {
    if (!schema || !schema.properties) {
      return { result: "example output" };
    }

    const output: any = {};
    for (const [key, prop] of Object.entries(schema.properties)) {
      const property = prop as any;
      output[key] = this.generateExampleValue(property);
    }

    return output;
  }

  private generateExampleValue(property: any): any {
    switch (property.type) {
      case "string":
        if (property.enum) {
          return property.enum[0];
        }
        return "example string";
      case "number":
        return property.minimum || 42;
      case "boolean":
        return true;
      case "array":
        return ["example", "array", "items"];
      case "object":
        return { example: "object" };
      default:
        return "example value";
    }
  }

  private generateErrorCause(errorType: string): string {
    const causes: Record<string, string> = {
      invalid_input:
        "The provided input does not match the expected schema or format",
      processing_error: "An internal error occurred during processing",
      timeout: "The operation exceeded the maximum allowed time",
      rate_limit: "Too many requests have been made in a short period",
      authentication: "Invalid or missing authentication credentials",
      authorization: "Insufficient permissions to perform the operation",
    };

    return causes[errorType] || "An unexpected error occurred";
  }

  private generateErrorResolution(errorType: string): string {
    const resolutions: Record<string, string> = {
      invalid_input:
        "Check the input format and ensure all required fields are provided",
      processing_error:
        "Retry the operation or contact support if the issue persists",
      timeout:
        "Reduce the input size or complexity, or increase the timeout value",
      rate_limit:
        "Wait before making additional requests or implement rate limiting",
      authentication: "Verify your credentials and ensure they are valid",
      authorization: "Check your permissions or contact an administrator",
    };

    return resolutions[errorType] || "Review the error message and try again";
  }

  private generatePerformanceInfo(
    stub: PluginStub,
    simulationStats?: SimulationStats,
  ): PerformanceInfo {
    const capabilities = Object.values(stub.capabilities);
    const averageResponseTime =
      capabilities.reduce((sum, cap) => sum + cap.estimatedExecutionTime, 0) /
      capabilities.length;
    const successRate =
      capabilities.reduce((sum, cap) => sum + cap.successRate, 0) /
      capabilities.length;
    const errorRate =
      capabilities.reduce((sum, cap) => sum + cap.errorRate, 0) /
      capabilities.length;
    const throughput = 1 / (averageResponseTime / 1000);

    return {
      averageResponseTime,
      successRate,
      errorRate,
      throughput,
      resourceUsage: {
        cpu: 0.1,
        memory: 0.05,
        network: 0.02,
        storage: 0.01,
      },
    };
  }

  private generateTestingInfo(
    stub: PluginStub,
    testReport?: TestReport,
  ): TestingInfo {
    if (testReport) {
      return {
        totalTests: testReport.totalTests,
        passedTests: testReport.passedTests,
        failedTests: testReport.failedTests,
        testCoverage: testReport.summary.coverage.overall,
        lastTestRun: testReport.endTime,
        testResults: testReport.testResults,
      };
    }

    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      testCoverage: 0,
    };
  }

  private generateMetadata(
    stub: PluginStub,
    testReport?: TestReport,
    simulationStats?: SimulationStats,
  ): DocumentationMetadata {
    return {
      totalCapabilities: Object.keys(stub.capabilities).length,
      totalTestCases: testReport?.totalTests || 0,
      testCoverage: testReport?.summary.coverage.overall || 0,
      performanceScore: this.calculatePerformanceScore(stub, simulationStats),
      reliabilityScore: stub.metadata.reliability,
      lastUpdated: new Date(),
      generatedBy: "DocumentationGenerator",
      template: "default",
    };
  }

  private calculatePerformanceScore(
    stub: PluginStub,
    simulationStats?: SimulationStats,
  ): number {
    const capabilities = Object.values(stub.capabilities);
    const averageResponseTime =
      capabilities.reduce((sum, cap) => sum + cap.estimatedExecutionTime, 0) /
      capabilities.length;
    const successRate =
      capabilities.reduce((sum, cap) => sum + cap.successRate, 0) /
      capabilities.length;

    // Simple scoring algorithm
    const responseTimeScore = Math.max(0, 1 - averageResponseTime / 5000); // 5s max
    const successRateScore = successRate;

    return (responseTimeScore + successRateScore) / 2;
  }

  private generateCommonIssues(stub: PluginStub): string {
    const issues = [
      "Simulation not responding - Check if the stub is properly configured",
      "Unexpected errors - Review the error handling section for common scenarios",
      "Slow performance - Consider optimizing input data or increasing timeout values",
      "Authentication failures - Verify credentials and permissions",
    ];

    return issues.map((issue) => `- ${issue}`).join("\n");
  }

  private formatExamples(examples: Example[]): string {
    return examples
      .map(
        (example) => `
### ${example.name}
${example.description}

**Input:**
\`\`\`json
${JSON.stringify(example.input, null, 2)}
\`\`\`

**Output:**
\`\`\`json
${JSON.stringify(example.output, null, 2)}
\`\`\`

${example.explanation}
    `,
      )
      .join("\n");
  }

  private formatErrorScenarios(errorScenarios: ErrorScenario[]): string {
    return errorScenarios
      .map(
        (scenario) => `
### ${scenario.type}
**Message:** ${scenario.message}
**Cause:** ${scenario.cause}
**Resolution:** ${scenario.resolution}
**Probability:** ${(scenario.probability * 100).toFixed(1)}%
**Recoverable:** ${scenario.recoverable ? "Yes" : "No"}
    `,
      )
      .join("\n");
  }

  private formatCapabilitiesForApi(
    capabilities: Record<string, StubCapability>,
  ): string {
    return Object.entries(capabilities)
      .map(
        ([name, capability]) => `
### ${capability.name}
- **Input Schema:** \`${JSON.stringify(capability.inputSchema)}\`
- **Output Schema:** \`${JSON.stringify(capability.outputSchema)}\`
- **Simulation Type:** ${capability.simulationType}
- **Estimated Time:** ${capability.estimatedExecutionTime}ms
    `,
      )
      .join("\n");
  }

  private exportToMarkdown(documentation: StubDocumentation): string {
    let markdown = `# ${documentation.title}\n\n`;
    markdown += `${documentation.description}\n\n`;
    markdown += `**Version:** ${documentation.version}\n`;
    markdown += `**Generated:** ${documentation.generatedAt.toISOString()}\n\n`;

    for (const section of documentation.sections) {
      markdown += `## ${section.title}\n\n`;
      markdown += section.content + "\n\n";

      if (section.subsections) {
        for (const subsection of section.subsections) {
          markdown += `### ${subsection.title}\n\n`;
          markdown += subsection.content + "\n\n";
        }
      }
    }

    return markdown;
  }

  private exportToHtml(documentation: StubDocumentation): string {
    // Simple HTML export - in a real implementation, you'd use a proper HTML generator
    let html = `<!DOCTYPE html>
<html>
<head>
    <title>${documentation.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1, h2, h3 { color: #333; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
        .metadata { background: #e9ecef; padding: 10px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>${documentation.title}</h1>
    <div class="metadata">
        <p><strong>Version:</strong> ${documentation.version}</p>
        <p><strong>Generated:</strong> ${documentation.generatedAt.toISOString()}</p>
    </div>
    <p>${documentation.description}</p>
`;

    for (const section of documentation.sections) {
      html += `    <h2>${section.title}</h2>\n`;
      html += `    <div>${section.content.replace(/\n/g, "<br>")}</div>\n`;

      if (section.subsections) {
        for (const subsection of section.subsections) {
          html += `    <h3>${subsection.title}</h3>\n`;
          html += `    <div>${subsection.content.replace(
            /\n/g,
            "<br>",
          )}</div>\n`;
        }
      }
    }

    html += `</body>
</html>`;

    return html;
  }

  private exportToJson(documentation: StubDocumentation): string {
    return JSON.stringify(documentation, null, 2);
  }

  private exportToPdf(documentation: StubDocumentation): string {
    // PDF export would require a PDF generation library
    // For now, return a placeholder
    return `PDF export not implemented. Use HTML or Markdown export instead.`;
  }

  private generateDocumentationId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Template methods
  private getOverviewTemplate(): string {
    return `# {{STUB_NAME}}

{{STUB_DESCRIPTION}}

## Basic Information
- **Version:** {{STUB_VERSION}}
- **Capabilities:** {{CAPABILITIES_COUNT}}
- **Generated:** {{GENERATED_AT}}
- **Complexity:** {{COMPLEXITY}}
- **Reliability:** {{RELIABILITY}}%

## Quick Start
This stub provides simulated functionality for testing and development purposes.`;
  }

  private getCapabilitiesTemplate(): string {
    return `## {{CAPABILITY_NAME}}

{{CAPABILITY_DESCRIPTION}}

### Input Schema
\`\`\`json
{{INPUT_SCHEMA}}
\`\`\`

### Output Schema
\`\`\`json
{{OUTPUT_SCHEMA}}
\`\`\`

### Configuration
- **Simulation Type:** {{SIMULATION_TYPE}}
- **Estimated Execution Time:** {{ESTIMATED_TIME}}ms
- **Success Rate:** {{SUCCESS_RATE}}%`;
  }

  private getExamplesTemplate(): string {
    return `## Examples

{{EXAMPLES}}`;
  }

  private getErrorHandlingTemplate(): string {
    return `## Error Handling

{{ERROR_SCENARIOS}}`;
  }

  private getPerformanceTemplate(): string {
    return `## Performance

- **Average Response Time:** {{AVERAGE_RESPONSE_TIME}}ms
- **Success Rate:** {{SUCCESS_RATE}}%
- **Error Rate:** {{ERROR_RATE}}%
- **Throughput:** {{THROUGHPUT}} requests/second`;
  }

  private getTestingTemplate(): string {
    return `## Testing

- **Total Tests:** {{TOTAL_TESTS}}
- **Passed Tests:** {{PASSED_TESTS}}
- **Failed Tests:** {{FAILED_TESTS}}
- **Test Coverage:** {{TEST_COVERAGE}}%
- **Last Test Run:** {{LAST_TEST_RUN}}`;
  }

  private getApiReferenceTemplate(): string {
    return `## API Reference

### Stub Information
- **ID:** {{STUB_ID}}
- **Name:** {{STUB_NAME}}

### Capabilities
{{CAPABILITIES}}`;
  }

  private getTroubleshootingTemplate(): string {
    return `## Troubleshooting

### Common Issues
{{COMMON_ISSUES}}

### Getting Help
If you encounter issues not covered in this documentation, please check the error handling section or contact support.`;
  }
}
