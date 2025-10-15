---
title: "Component Patterns"
description: "Code patterns and conventions for building React components in NextChat"
audience: ["ai-agents", "developers"]
difficulty: "intermediate"
estimated-read-time: 10
last-updated: 2025-10-15
version: 1.0.0
---

# Component Patterns

## Standard Component Structure

### Basic Component Template
```tsx
import styles from './MyComponent.module.scss';

interface MyComponentProps {
  title: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  disabled = false,
  onChange,
}) => {
  const [value, setValue] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      <input
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={styles.input}
      />
    </div>
  );
};
```

## Styling Patterns

### SCSS Module Pattern
```scss
// MyComponent.module.scss
.container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background-color: var(--white);
  border-radius: 10px;
  border: var(--border-in-light);
}

.input {
  padding: 8px 12px;
  border-radius: 8px;
  border: var(--border-in-light);
  background-color: var(--white);
  color: var(--black);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

## State Management Pattern

### Using Zustand Store
```tsx
import { create } from 'zustand';

interface MyStore {
  value: string;
  setValue: (value: string) => void;
}

const useMyStore = create<MyStore>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}));

// In component
const value = useMyStore((state) => state.value);
const setValue = useMyStore((state) => state.setValue);
```

## Hook Patterns

### Custom Hook Template
```tsx
function useMyHook(initialValue: string) {
  const [value, setValue] = React.useState(initialValue);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetch = React.useCallback(async (id: string) => {
    setLoading(true);
    try {
      // Fetch logic
      setValue(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return { value, loading, error, fetch };
}
```

## Props Patterns

### Prop Typing Best Practices
```tsx
// ✅ Good: Complete typing
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

// ❌ Avoid: Using 'any'
interface BadProps {
  variant: any;
  onClick: any;
}
```

## Error Handling Pattern

```tsx
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('Failed to fetch:', message);
  setError(message);
}
```

## Memoization Pattern

```tsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{/* Render */}</div>;
});

// Use useCallback for callbacks
const handleClick = React.useCallback(() => {
  // Handle click
}, [dependency1, dependency2]);

// Use useMemo for computed values
const computed = React.useMemo(() => {
  return expensiveComputation();
}, [dependency]);
```

## Event Handling Pattern

```tsx
// ✅ Good: Type-safe event handling
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.currentTarget.value;
  setValue(value);
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  // Handle click
};

// ✅ Good: Callback delegation
const handleSubmit = React.useCallback((value: string) => {
  onSubmit?.(value);
}, [onSubmit]);
```

## Conditional Rendering Pattern

```tsx
// ✅ Good: Clear conditionals
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// ✅ Alternative: Ternary for binary
{isActive ? <ActiveState /> : <InactiveState />}

// ❌ Avoid: Unnecessary ternary
{condition ? true : false}  // Use: {condition}
```

## Animation Pattern

```tsx
// Use CSS transitions from animation.scss
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
}

.animated {
  animation: slide-in 0.3s ease-out;
}
```

## Testing Pattern

```tsx
import { render, screen, fireEvent } from '@testing-library/react';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle changes', () => {
    const onChange = jest.fn();
    render(<MyComponent onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(onChange).toHaveBeenCalledWith('new value');
  });
});
```

## Key Principles

✅ **Do**:
- Use TypeScript for type safety
- Memoize expensive components
- Use CSS modules for styling
- Follow SCSS patterns with variables
- Use Zustand for shared state
- Type all props completely
- Handle errors gracefully
- Test components thoroughly

❌ **Don't**:
- Use `any` type
- Inline styles without reason
- Forget error boundaries
- Skip prop validation
- Over-memoize simple components
- Create deeply nested components
- Use Redux (prefer Zustand)
- Ignore accessibility

---

**See Also**: [API Patterns](./02-api-patterns.md) | [Testing Patterns](./05-testing-patterns.md)

