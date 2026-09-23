# Accessibility Implementation Guide

## WCAG 2.1 Compliance Target: Level AA

## Current Status

### ✅ Basic Implementations
- Semantic HTML structure
- Bootstrap 5 accessibility features
- Form labels and input associations
- Error message announcements

### 🎯 Target Compliance
- WCAG 2.1 Level AA
- Section 508 compliance
- ADA compliance
- Keyboard navigation support
- Screen reader compatibility

## Task 25: Accessibility Implementation

### 1. Keyboard Navigation

#### Focus Management

```typescript
// client/src/utils/focus.ts
export class FocusManager {
  /**
   * Trap focus within a modal
   */
  static trapFocus(element: HTMLElement) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  /**
   * Return focus to trigger element
   */
  static returnFocus(triggerElement: HTMLElement) {
    triggerElement.focus();
  }

  /**
   * Skip to main content
   */
  static skipToMain() {
    const main = document.querySelector('main');
    if (main) {
      main.focus();
      main.scrollIntoView();
    }
  }
}
```

#### Keyboard Shortcuts

```typescript
// Implement global keyboard shortcuts
const keyboardShortcuts = {
  'Ctrl+S': 'Save document',
  'Ctrl+E': 'Export document',
  'Ctrl+/': 'Show keyboard shortcuts',
  'Escape': 'Close modal/dialog',
  'Alt+1': 'Focus editor',
  'Alt+2': 'Focus toolbar',
  'Alt+3': 'Focus sidebar',
};

// Add keyboard shortcut handler
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`;
    
    switch (key) {
      case 'Ctrl+s':
        e.preventDefault();
        handleSave();
        break;
      case 'Escape':
        closeModal();
        break;
      // ... other shortcuts
    }
  };
  
  document.addEventListener('keydown', handleKeyPress);
  return () => document.removeEventListener('keydown', handleKeyPress);
}, []);
```

### 2. ARIA Attributes

#### Landmark Roles

```tsx
// Add proper ARIA landmarks
<div className="app">
  {/* Skip to main content link */}
  <a href="#main" className="skip-link">
    Skip to main content
  </a>

  <header role="banner">
    <nav role="navigation" aria-label="Main navigation">
      {/* Navigation items */}
    </nav>
  </header>

  <main id="main" role="main" tabIndex={-1}>
    {/* Main content */}
  </main>

  <aside role="complementary" aria-label="Sidebar">
    {/* Sidebar content */}
  </aside>

  <footer role="contentinfo">
    {/* Footer content */}
  </footer>
</div>
```

#### ARIA Live Regions

```tsx
// Announce status updates to screen readers
function StatusAnnouncer() {
  const [message, setMessage] = useState('');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Usage
announceStatus('Document saved successfully');
announceStatus('Processing text...');
announceStatus('3 grammar errors found');
```

#### Form Accessibility

```tsx
// Accessible form with proper labeling
<form onSubmit={handleSubmit}>
  <div className="form-group">
    <label htmlFor="document-title" className="form-label">
      Document Title
      <span className="required" aria-label="required">*</span>
    </label>
    <input
      type="text"
      id="document-title"
      name="title"
      className="form-control"
      aria-required="true"
      aria-invalid={errors.title ? 'true' : 'false'}
      aria-describedby={errors.title ? 'title-error' : undefined}
      value={title}
      onChange={handleChange}
    />
    {errors.title && (
      <div id="title-error" className="error-message" role="alert">
        {errors.title}
      </div>
    )}
  </div>

  <button
    type="submit"
    className="btn btn-primary"
    aria-label="Save document"
    disabled={isSubmitting}
  >
    {isSubmitting ? (
      <>
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        <span className="ms-2">Saving...</span>
      </>
    ) : (
      'Save'
    )}
  </button>
</form>
```

### 3. Color Contrast

#### WCAG AA Requirements
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

#### Check Contrast Ratios

```css
/* Ensure sufficient contrast */
:root {
  /* Text colors */
  --text-primary: #212529;        /* Contrast: 16.1:1 on white ✅ */
  --text-secondary: #6c757d;      /* Contrast: 4.5:1 on white ✅ */
  --text-light: #adb5bd;          /* Use only for large text */
  
  /* Background colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-dark: #212529;
  
  /* Interactive elements */
  --link-color: #0d6efd;          /* Contrast: 4.5:1 on white ✅ */
  --link-hover: #0a58ca;          /* Contrast: 7:1 on white ✅ */
  --error-color: #dc3545;         /* Contrast: 4.5:1 on white ✅ */
  --success-color: #198754;       /* Contrast: 4.5:1 on white ✅ */
}

/* Focus indicators */
*:focus {
  outline: 3px solid var(--link-color);
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 3px solid var(--link-color);
  outline-offset: 2px;
}
```

### 4. Screen Reader Support

#### Semantic HTML

```tsx
// Use semantic elements
<article>
  <header>
    <h1>Document Title</h1>
    <p className="meta">
      <time dateTime="2024-01-15T10:30:00">January 15, 2024</time>
    </p>
  </header>
  
  <section>
    <h2>Content Section</h2>
    <p>Paragraph content...</p>
  </section>
  
  <footer>
    <p>Document footer information</p>
  </footer>
</article>
```

#### Screen Reader Only Text

```css
/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:active,
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

```tsx
// Usage
<button aria-label="Delete document">
  <TrashIcon aria-hidden="true" />
  <span className="sr-only">Delete</span>
</button>
```

### 5. Modal Accessibility

```tsx
function AccessibleModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocus.current = document.activeElement as HTMLElement;
      
      // Focus modal
      modalRef.current?.focus();
      
      // Trap focus
      FocusManager.trapFocus(modalRef.current!);
    } else {
      // Return focus
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### 6. Loading States

```tsx
// Accessible loading indicator
function LoadingSpinner({ size = 'medium' }) {
  return (
    <div
      className={`spinner spinner-${size}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Usage in components
function DocumentList() {
  const { documents, isLoading } = useDocuments();

  if (isLoading) {
    return (
      <div aria-live="polite" aria-busy="true">
        <LoadingSpinner />
        <p className="sr-only">Loading documents...</p>
      </div>
    );
  }

  return (
    <div aria-live="polite" aria-busy="false">
      <h2>Your Documents ({documents.length})</h2>
      {/* Document list */}
    </div>
  );
}
```

### 7. Error Handling

```tsx
// Accessible error messages
function ErrorBoundary({ error, onRetry }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="error-container"
    >
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button
        onClick={onRetry}
        className="btn btn-primary"
        aria-label="Retry operation"
      >
        Try Again
      </button>
    </div>
  );
}

// Form validation errors
function FormError({ fieldName, error }) {
  return (
    <div
      id={`${fieldName}-error`}
      className="error-message"
      role="alert"
      aria-live="polite"
    >
      <span aria-label={`Error for ${fieldName}`}>{error}</span>
    </div>
  );
}
```

### 8. Table Accessibility

```tsx
// Accessible data table
function DocumentsTable({ documents }) {
  return (
    <table
      role="table"
      aria-label="Documents list"
      className="table"
    >
      <caption className="sr-only">
        List of {documents.length} documents
      </caption>
      <thead>
        <tr>
          <th scope="col">Title</th>
          <th scope="col">Modified</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {documents.map(doc => (
          <tr key={doc.id}>
            <td>
              <a href={`/documents/${doc.id}`}>
                {doc.title}
              </a>
            </td>
            <td>
              <time dateTime={doc.updatedAt}>
                {formatDate(doc.updatedAt)}
              </time>
            </td>
            <td>
              <button
                className="btn btn-sm"
                aria-label={`Delete ${doc.title}`}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 9. Testing Accessibility

#### Automated Testing Tools

```bash
# Install testing tools
npm install --save-dev @axe-core/react jest-axe
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

```typescript
// client/src/setupTests.ts
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

```typescript
// Example accessibility test
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

test('Button should not have accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

#### Manual Testing Checklist

- [ ] Navigate entire app using only keyboard (Tab, Enter, Escape)
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify color contrast with tools
- [ ] Test with 200% zoom
- [ ] Test with Windows High Contrast mode
- [ ] Test with browser extensions disabled
- [ ] Verify focus indicators visible
- [ ] Check form validation announcements

#### Testing Tools

1. **axe DevTools** (Browser extension)
2. **WAVE** (Web Accessibility Evaluation Tool)
3. **Lighthouse** (Chrome DevTools)
4. **Color Contrast Analyzer**
5. **Screen readers**: NVDA (Windows), JAWS (Windows), VoiceOver (Mac)

### 10. Responsive Text Sizing

```css
/* Use relative units for scalability */
html {
  font-size: 16px; /* Base size */
}

body {
  font-size: 1rem; /* 16px */
  line-height: 1.5; /* WCAG recommendation */
}

h1 {
  font-size: 2rem; /* 32px */
  line-height: 1.2;
}

h2 {
  font-size: 1.5rem; /* 24px */
  line-height: 1.3;
}

p {
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

/* Support text zoom up to 200% */
@media (min-width: 768px) {
  body {
    font-size: 1.125rem; /* 18px for better readability */
  }
}
```

## Accessibility Checklist

### Perceivable
- [ ] Text alternatives for images
- [ ] Captions for videos
- [ ] Color not sole indicator
- [ ] Sufficient color contrast (4.5:1)
- [ ] Text resizable to 200%
- [ ] No horizontal scrolling at 320px width

### Operable
- [ ] All functionality via keyboard
- [ ] No keyboard traps
- [ ] Skip navigation links
- [ ] Clear focus indicators
- [ ] Enough time for interactions
- [ ] No seizure-inducing flashing (3Hz rule)
- [ ] Descriptive page titles
- [ ] Logical focus order

### Understandable
- [ ] Language of page declared
- [ ] Consistent navigation
- [ ] Consistent identification
- [ ] Clear error messages
- [ ] Error prevention
- [ ] Context-sensitive help
- [ ] Labels and instructions

### Robust
- [ ] Valid HTML
- [ ] Name, role, value for components
- [ ] Status messages announced
- [ ] Compatible with assistive tech

## ARIA Patterns Reference

```tsx
// Button
<button aria-label="Close dialog">×</button>

// Toggle button
<button
  aria-pressed={isPressed}
  onClick={toggle}
>
  {isPressed ? 'On' : 'Off'}
</button>

// Checkbox
<input
  type="checkbox"
  id="terms"
  aria-describedby="terms-description"
/>

// Combobox (Searchable dropdown)
<input
  role="combobox"
  aria-expanded={isOpen}
  aria-controls="suggestions-list"
  aria-autocomplete="list"
/>

// Progress bar
<div
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Upload progress"
/>

// Alert
<div role="alert" aria-live="assertive">
  Error: Please try again
</div>

// Status
<div role="status" aria-live="polite">
  Document saved
</div>
```

## Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Testing Services
- [UsableNet](https://usablenet.com/)
- [Deque](https://www.deque.com/)
- [Level Access](https://www.levelaccess.com/)

---

**Compliance Target**: WCAG 2.1 Level AA
**Testing Frequency**: Quarterly audits + pre-release testing
**Review**: Accessibility specialist review recommended
