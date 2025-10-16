import {
  validatePageConfig,
  safeValidatePageConfig,
  createPageConfig,
  createTab,
  createSection,
  mergePageConfigs,
  createPageFromTabs,
} from "../index";
import { PageConfig } from "../types";

// Mock component for testing
function MockComponent() {
  return null;
}

describe("Page Configuration System", () => {
  describe("validatePageConfig", () => {
    it("should validate a correct page configuration", () => {
      const config: PageConfig = {
        id: "test-page",
        title: "Test Page",
        tabs: [
          {
            id: "tab1",
            label: "Tab 1",
            sections: [
              {
                id: "section1",
                label: "Section 1",
                component: MockComponent,
              },
            ],
          },
        ],
      };

      const result = validatePageConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject config without id", () => {
      const config: any = {
        title: "Test Page",
        tabs: [],
      };

      const result = validatePageConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("id"))).toBe(true);
    });

    it("should reject config without title", () => {
      const config: any = {
        id: "test",
        tabs: [],
      };

      const result = validatePageConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("title"))).toBe(true);
    });

    it("should reject config without tabs", () => {
      const config: any = {
        id: "test",
        title: "Test",
      };

      const result = validatePageConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("at least one tab"))).toBe(
        true,
      );
    });

    it("should detect duplicate tab IDs", () => {
      const config: PageConfig = {
        id: "test",
        title: "Test",
        tabs: [
          {
            id: "duplicate",
            label: "Tab 1",
            sections: [{ id: "s1", label: "S1", component: MockComponent }],
          },
          {
            id: "duplicate",
            label: "Tab 2",
            sections: [{ id: "s2", label: "S2", component: MockComponent }],
          },
        ],
      };

      const result = validatePageConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Duplicate tab ID"))).toBe(
        true,
      );
    });

    it("should detect duplicate section IDs within a tab", () => {
      const config: PageConfig = {
        id: "test",
        title: "Test",
        tabs: [
          {
            id: "tab1",
            label: "Tab 1",
            sections: [
              { id: "duplicate", label: "S1", component: MockComponent },
              { id: "duplicate", label: "S2", component: MockComponent },
            ],
          },
        ],
      };

      const result = validatePageConfig(config);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes("Duplicate section ID")),
      ).toBe(true);
    });

    it("should validate layout field", () => {
      const config: any = {
        id: "test",
        title: "Test",
        layout: "invalid",
        tabs: [
          {
            id: "tab1",
            label: "Tab 1",
            sections: [{ id: "s1", label: "S1", component: MockComponent }],
          },
        ],
      };

      const result = validatePageConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Invalid layout"))).toBe(
        true,
      );
    });
  });

  describe("safeValidatePageConfig", () => {
    it("should return safe validation result on error", () => {
      const result = safeValidatePageConfig(null);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle non-object input gracefully", () => {
      const result = safeValidatePageConfig("not an object");
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("must be an object");
    });
  });

  describe("Factory Functions", () => {
    describe("createSection", () => {
      it("should create a section with required fields", () => {
        const section = createSection("id", "Label", MockComponent);
        expect(section.id).toBe("id");
        expect(section.label).toBe("Label");
        expect(section.component).toBe(MockComponent);
      });

      it("should include optional fields when provided", () => {
        const section = createSection("id", "Label", MockComponent, {
          badge: 5,
          disabled: true,
        });
        expect(section.badge).toBe(5);
        expect(section.disabled).toBe(true);
      });
    });

    describe("createTab", () => {
      it("should create a tab with sections", () => {
        const section = createSection("s1", "Section", MockComponent);
        const tab = createTab("tab1", "Tab 1", [section]);
        expect(tab.id).toBe("tab1");
        expect(tab.label).toBe("Tab 1");
        expect(tab.sections).toHaveLength(1);
      });
    });

    describe("createPageConfig", () => {
      it("should create a complete page configuration", () => {
        const section = createSection("s1", "Section", MockComponent);
        const tab = createTab("tab1", "Tab 1", [section]);
        const config = createPageConfig("page", "Page Title", [tab]);

        expect(config.id).toBe("page");
        expect(config.title).toBe("Page Title");
        expect(config.tabs).toHaveLength(1);
        expect(config.layout).toBe("multi");
      });

      it("should include optional config options", () => {
        const config = createPageConfig("page", "Title", [], {
          subtitle: "Subtitle",
          layout: "single",
        });
        expect(config.subtitle).toBe("Subtitle");
        expect(config.layout).toBe("single");
      });
    });

    describe("mergePageConfigs", () => {
      it("should merge tabs from multiple configs", () => {
        const config1 = createPageConfig("page", "Title", [
          createTab("tab1", "Tab 1", [
            createSection("s1", "S1", MockComponent),
          ]),
        ]);

        const config2: PageConfig = {
          id: "other",
          title: "Other",
          tabs: [
            {
              id: "tab2",
              label: "Tab 2",
              sections: [{ id: "s2", label: "S2", component: MockComponent }],
            },
          ],
        };

        const merged = mergePageConfigs(config1, config2);
        expect(merged.tabs).toHaveLength(2);
        expect(merged.tabs.map((t) => t.id)).toContain("tab1");
        expect(merged.tabs.map((t) => t.id)).toContain("tab2");
      });

      it("should merge sections into existing tabs", () => {
        const section1 = createSection("s1", "S1", MockComponent);
        const tab1 = createTab("tab1", "Tab 1", [section1]);
        const config1 = createPageConfig("page", "Title", [tab1]);

        const config2: PageConfig = {
          id: "other",
          title: "Other",
          tabs: [
            {
              id: "tab1",
              label: "Tab 1",
              sections: [{ id: "s2", label: "S2", component: MockComponent }],
            },
          ],
        };

        const merged = mergePageConfigs(config1, config2);
        expect(merged.tabs[0].sections).toHaveLength(2);
      });
    });

    describe("createPageFromTabs", () => {
      it("should create page config from simplified tab definitions", () => {
        const config = createPageFromTabs("page", "Title", [
          { id: "tab1", label: "Tab 1", component: MockComponent },
          { id: "tab2", label: "Tab 2", component: MockComponent },
        ]);

        expect(config.id).toBe("page");
        expect(config.tabs).toHaveLength(2);
        expect(config.tabs[0].sections).toHaveLength(1);
      });

      it("should pass component props through", () => {
        const config = createPageFromTabs("page", "Title", [
          {
            id: "tab1",
            label: "Tab 1",
            component: MockComponent,
            componentProps: { key: "value" },
          },
        ]);

        expect(config.tabs[0].sections[0].props).toEqual({ key: "value" });
      });
    });
  });

  describe("Integration Tests", () => {
    it("should create and validate settings page config", () => {
      const config = createPageConfig("settings", "Settings", [
        createTab("general", "General", [
          createSection("general-section", "General", MockComponent),
        ]),
        createTab("chat", "Chat", [
          createSection("chat-section", "Chat", MockComponent),
        ]),
      ]);

      const result = validatePageConfig(config);
      expect(result.valid).toBe(true);
    });

    it("should handle complex multi-section tabs", () => {
      const config = createPageConfig("advanced", "Advanced Settings", [
        createTab("config", "Configuration", [
          createSection("basic", "Basic", MockComponent),
          createSection("advanced", "Advanced", MockComponent),
          createSection("expert", "Expert", MockComponent),
        ]),
      ]);

      const result = validatePageConfig(config);
      expect(result.valid).toBe(true);
      expect(config.tabs[0].sections).toHaveLength(3);
    });
  });
});
