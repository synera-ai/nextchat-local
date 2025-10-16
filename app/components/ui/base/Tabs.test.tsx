import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabDefinition } from "./Tabs";

describe("Tabs Component", () => {
  const mockTabs: TabDefinition[] = [
    {
      id: "tab1",
      label: "Tab 1",
      content: <div>Content 1</div>,
    },
    {
      id: "tab2",
      label: "Tab 2",
      content: <div>Content 2</div>,
    },
    {
      id: "tab3",
      label: "Tab 3",
      content: <div>Content 3</div>,
      badge: "5",
    },
  ];

  describe("Rendering", () => {
    it("renders all tabs", () => {
      render(<Tabs tabs={mockTabs} />);
      expect(screen.getByText("Tab 1")).toBeInTheDocument();
      expect(screen.getByText("Tab 2")).toBeInTheDocument();
      expect(screen.getByText("Tab 3")).toBeInTheDocument();
    });

    it("renders first tab content by default", () => {
      render(<Tabs tabs={mockTabs} />);
      expect(screen.getByText("Content 1")).toBeInTheDocument();
    });

    it("renders specified default tab", () => {
      render(<Tabs tabs={mockTabs} defaultTab="tab2" />);
      expect(screen.getByText("Content 2")).toBeInTheDocument();
    });

    it("renders badge when provided", () => {
      render(<Tabs tabs={mockTabs} />);
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("renders icons when provided", () => {
      const tabsWithIcon: TabDefinition[] = [
        {
          id: "tab1",
          label: "Tab 1",
          content: <div>Content 1</div>,
          icon: <span data-testid="tab-icon">🎯</span>,
        },
      ];
      render(<Tabs tabs={tabsWithIcon} />);
      expect(screen.getByTestId("tab-icon")).toBeInTheDocument();
    });
  });

  describe("Mouse Interaction", () => {
    it("switches tabs on click", () => {
      render(<Tabs tabs={mockTabs} />);
      const tab2Button = screen.getByRole("tab", { name: /Tab 2/i });
      fireEvent.click(tab2Button);
      expect(screen.getByText("Content 2")).toBeInTheDocument();
    });

    it("calls onChange callback when tab changes", () => {
      const onChange = jest.fn();
      render(<Tabs tabs={mockTabs} onChange={onChange} />);
      const tab2Button = screen.getByRole("tab", { name: /Tab 2/i });
      fireEvent.click(tab2Button);
      expect(onChange).toHaveBeenCalledWith("tab2");
    });

    it("does not switch to disabled tab", () => {
      const disabledTabs = [
        mockTabs[0],
        { ...mockTabs[1], disabled: true },
        mockTabs[2],
      ];
      const onChange = jest.fn();
      render(<Tabs tabs={disabledTabs} onChange={onChange} />);
      const disabledTab = screen.getByRole("tab", { name: /Tab 2/i });
      fireEvent.click(disabledTab);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Navigation", () => {
    it("navigates to next tab with ArrowRight", () => {
      render(<Tabs tabs={mockTabs} />);
      const tab1Button = screen.getByRole("tab", { name: /Tab 1/i });
      fireEvent.keyDown(tab1Button, { key: "ArrowRight" });
      expect(screen.getByText("Content 2")).toBeInTheDocument();
    });

    it("navigates to previous tab with ArrowLeft", () => {
      render(<Tabs tabs={mockTabs} defaultTab="tab2" />);
      const tab2Button = screen.getByRole("tab", { name: /Tab 2/i });
      fireEvent.keyDown(tab2Button, { key: "ArrowLeft" });
      expect(screen.getByText("Content 1")).toBeInTheDocument();
    });

    it("navigates to next tab with ArrowDown", () => {
      render(<Tabs tabs={mockTabs} />);
      const tab1Button = screen.getByRole("tab", { name: /Tab 1/i });
      fireEvent.keyDown(tab1Button, { key: "ArrowDown" });
      expect(screen.getByText("Content 2")).toBeInTheDocument();
    });

    it("navigates to previous tab with ArrowUp", () => {
      render(<Tabs tabs={mockTabs} defaultTab="tab2" />);
      const tab2Button = screen.getByRole("tab", { name: /Tab 2/i });
      fireEvent.keyDown(tab2Button, { key: "ArrowUp" });
      expect(screen.getByText("Content 1")).toBeInTheDocument();
    });

    it("jumps to first tab with Home key", () => {
      render(<Tabs tabs={mockTabs} defaultTab="tab3" />);
      const tab3Button = screen.getByRole("tab", { name: /Tab 3/i });
      fireEvent.keyDown(tab3Button, { key: "Home" });
      expect(screen.getByText("Content 1")).toBeInTheDocument();
    });

    it("jumps to last tab with End key", () => {
      render(<Tabs tabs={mockTabs} />);
      const tab1Button = screen.getByRole("tab", { name: /Tab 1/i });
      fireEvent.keyDown(tab1Button, { key: "End" });
      expect(screen.getByText("Content 3")).toBeInTheDocument();
    });

    it("wraps around on ArrowRight at last tab", () => {
      render(<Tabs tabs={mockTabs} defaultTab="tab3" />);
      const tab3Button = screen.getByRole("tab", { name: /Tab 3/i });
      fireEvent.keyDown(tab3Button, { key: "ArrowRight" });
      expect(screen.getByText("Content 1")).toBeInTheDocument();
    });

    it("wraps around on ArrowLeft at first tab", () => {
      render(<Tabs tabs={mockTabs} />);
      const tab1Button = screen.getByRole("tab", { name: /Tab 1/i });
      fireEvent.keyDown(tab1Button, { key: "ArrowLeft" });
      expect(screen.getByText("Content 3")).toBeInTheDocument();
    });
  });

  describe("Accessibility (ARIA)", () => {
    it("has tablist role", () => {
      render(<Tabs tabs={mockTabs} />);
      const tablist = screen.getByRole("tablist");
      expect(tablist).toBeInTheDocument();
    });

    it("has aria-label on tablist", () => {
      render(<Tabs tabs={mockTabs} ariaLabel="Settings Tabs" />);
      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("aria-label", "Settings Tabs");
    });

    it("sets aria-selected on active tab", () => {
      render(<Tabs tabs={mockTabs} />);
      const tab1 = screen.getByRole("tab", { name: /Tab 1/i });
      const tab2 = screen.getByRole("tab", { name: /Tab 2/i });
      expect(tab1).toHaveAttribute("aria-selected", "true");
      expect(tab2).toHaveAttribute("aria-selected", "false");
    });

    it("updates aria-selected on tab change", () => {
      render(<Tabs tabs={mockTabs} />);
      const tab2 = screen.getByRole("tab", { name: /Tab 2/i });
      fireEvent.click(tab2);
      expect(tab2).toHaveAttribute("aria-selected", "true");
    });

    it("links tabs to panels with aria-controls", () => {
      render(<Tabs tabs={mockTabs} />);
      const tab1 = screen.getByRole("tab", { name: /Tab 1/i });
      expect(tab1).toHaveAttribute("aria-controls", "panel-tab1");
    });

    it("has tabpanel role on content", () => {
      render(<Tabs tabs={mockTabs} />);
      const tabpanel = screen.getByRole("tabpanel");
      expect(tabpanel).toBeInTheDocument();
    });

    it("has aria-labelledby linking panel to tab", () => {
      render(<Tabs tabs={mockTabs} />);
      const tabpanel = screen.getByRole("tabpanel");
      expect(tabpanel).toHaveAttribute("aria-labelledby", "tab-tab1");
    });
  });

  describe("Disabled State", () => {
    it("disables tab when disabled prop is true", () => {
      const disabledTabs = [
        { ...mockTabs[0], disabled: true },
        mockTabs[1],
        mockTabs[2],
      ];
      render(<Tabs tabs={disabledTabs} />);
      const tab1 = screen.getByRole("tab", { name: /Tab 1/i });
      expect(tab1).toBeDisabled();
    });

    it("prevents click on disabled tab", () => {
      const disabledTabs = [
        { ...mockTabs[0], disabled: true },
        mockTabs[1],
        mockTabs[2],
      ];
      render(<Tabs tabs={disabledTabs} />);
      const tab1 = screen.getByRole("tab", { name: /Tab 1/i });
      fireEvent.click(tab1);
      expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
    });

    it("disables all tabs when disabled prop is true", () => {
      const onChange = jest.fn();
      render(<Tabs tabs={mockTabs} disabled onChange={onChange} />);
      const tab2 = screen.getByRole("tab", { name: /Tab 2/i });
      fireEvent.click(tab2);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("Variants", () => {
    it("applies underline variant class", () => {
      const { container } = render(
        <Tabs tabs={mockTabs} variant="underline" />,
      );
      const tabsContainer = container.firstChild;
      expect(tabsContainer).toHaveClass("variant-underline");
    });

    it("applies pill variant class", () => {
      const { container } = render(<Tabs tabs={mockTabs} variant="pill" />);
      const tabsContainer = container.firstChild;
      expect(tabsContainer).toHaveClass("variant-pill");
    });

    it("applies vertical variant class", () => {
      const { container } = render(<Tabs tabs={mockTabs} variant="vertical" />);
      const tabsContainer = container.firstChild;
      expect(tabsContainer).toHaveClass("variant-vertical");
    });
  });

  describe("Sizes", () => {
    it("applies small size class", () => {
      const { container } = render(<Tabs tabs={mockTabs} size="sm" />);
      const tabsContainer = container.firstChild;
      expect(tabsContainer).toHaveClass("size-sm");
    });

    it("applies medium size class", () => {
      const { container } = render(<Tabs tabs={mockTabs} size="md" />);
      const tabsContainer = container.firstChild;
      expect(tabsContainer).toHaveClass("size-md");
    });

    it("applies large size class", () => {
      const { container } = render(<Tabs tabs={mockTabs} size="lg" />);
      const tabsContainer = container.firstChild;
      expect(tabsContainer).toHaveClass("size-lg");
    });
  });

  describe("Custom ClassName", () => {
    it("applies custom className", () => {
      const { container } = render(
        <Tabs tabs={mockTabs} className="custom-class" />,
      );
      const tabsContainer = container.firstChild;
      expect(tabsContainer).toHaveClass("custom-class");
    });
  });

  describe("Focus Management", () => {
    it("sets active tab with tabIndex 0", () => {
      render(<Tabs tabs={mockTabs} />);
      const tab1 = screen.getByRole("tab", { name: /Tab 1/i });
      expect(tab1).toHaveAttribute("tabindex", "0");
    });

    it("sets inactive tabs with tabIndex -1", () => {
      render(<Tabs tabs={mockTabs} />);
      const tab2 = screen.getByRole("tab", { name: /Tab 2/i });
      const tab3 = screen.getByRole("tab", { name: /Tab 3/i });
      expect(tab2).toHaveAttribute("tabindex", "-1");
      expect(tab3).toHaveAttribute("tabindex", "-1");
    });

    it("updates tabIndex when active tab changes", () => {
      render(<Tabs tabs={mockTabs} />);
      const tab1 = screen.getByRole("tab", { name: /Tab 1/i });
      const tab2 = screen.getByRole("tab", { name: /Tab 2/i });
      fireEvent.click(tab2);
      expect(tab1).toHaveAttribute("tabindex", "-1");
      expect(tab2).toHaveAttribute("tabindex", "0");
    });
  });

  describe("Content Visibility", () => {
    it("hides inactive tab panels", () => {
      render(<Tabs tabs={mockTabs} />);
      const tabpanels = screen.getAllByRole("tabpanel", { hidden: true });
      expect(tabpanels.length).toBeGreaterThan(0);
    });

    it("shows only active tab panel", () => {
      render(<Tabs tabs={mockTabs} />);
      const visiblePanels = screen.queryAllByText(/Content/);
      expect(visiblePanels).toHaveLength(1);
    });
  });
});
