"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Path } from "../../constant";

interface DocsNavigationProps {
  className?: string;
}

export function DocsNavigation({ className }: DocsNavigationProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      title: "Documentation",
      href: "/docs",
      icon: "📚",
      description: "Comprehensive documentation system",
    },
    {
      title: "Projects",
      href: Path.Projects,
      icon: "📋",
      description: "Project management system",
    },
    {
      title: "MCP Market",
      href: Path.McpMarket,
      icon: "🔌",
      description: "Plugin marketplace",
    },
    {
      title: "Settings",
      href: Path.Settings,
      icon: "⚙️",
      description: "Application settings",
    },
  ];

  return (
    <nav className={`docs-navigation ${className || ""}`}>
      <div className="nav-header">
        <h2>NextChat</h2>
        <p>Documentation & Tools</p>
      </div>

      <div className="nav-items">
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <div className="nav-item-icon">{item.icon}</div>
              <div className="nav-item-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
