"use client";

import { Link, useLocation } from "react-router-dom";
import { Path } from "../../constant";

interface DocsNavigationProps {
  className?: string;
}

export function DocsNavigation({ className }: DocsNavigationProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const navigationItems = [
    {
      title: "Documentation",
      href: Path.Docs,
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
    <nav className={`docs-navigation ${className || ""}`} style={{
      padding: '1rem',
      background: 'var(--white)',
      border: 'var(--border-in-light)',
      borderRadius: '8px',
      marginBottom: '1rem'
    }}>
      <div className="nav-header" style={{
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: 'var(--border-in-light)'
      }}>
        <h2 style={{
          margin: '0 0 0.5rem 0',
          color: 'var(--black)',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>NextChat</h2>
        <p style={{
          margin: '0',
          color: 'var(--black)',
          opacity: '0.7',
          fontSize: '0.9rem'
        }}>Documentation & Tools</p>
      </div>

      <div className="nav-items" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--white)' : 'var(--black)'
              }}
            >
              <div className="nav-item-icon" style={{
                fontSize: '1.25rem',
                flexShrink: '0',
                marginTop: '0.125rem'
              }}>{item.icon}</div>
              <div className="nav-item-content" style={{
                flex: '1'
              }}>
                <h3 style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: isActive ? 'var(--white)' : 'var(--black)'
                }}>{item.title}</h3>
                <p style={{
                  margin: '0',
                  fontSize: '0.8rem',
                  color: isActive ? 'var(--white)' : 'var(--black)',
                  opacity: isActive ? '1' : '0.7',
                  lineHeight: '1.4'
                }}>{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
