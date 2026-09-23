# Comprehensive Testing Guide

## Testing Strategy

### Test Pyramid
```
       /\
      /E2E\       10% - End-to-End Tests
     /______\
    /Integration\ 30% - Integration Tests
   /____________\
  /  Unit Tests  \ 60% - Unit Tests
 /________________\
```

## Task 26: Write Comprehensive Tests

### 1. Unit Tests (Jest + Testing Library)

#### Setup

```bash
# Install dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event jest-environment-jsdom
npm install --save-dev ts-jest @types/jest
```

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

#### Backend Unit Tests

**Testing Services**:
```typescript
// server/src/modules/auth/__tests__/auth.service.test.ts
import { AuthService } from '../auth.service';
import { prisma } from '../../../database/prisma';
import { hashPassword } from '../../../security/password';

jest.mock('../../../database/prisma');
jest.mock('../../../security/password');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      (hashPassword as jest.Mock).mockResolvedValue('hashed_password');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: input.email,
        name: input.name,
        createdAt: new Date(),
      });

      const result = await authService.register(input);

      expect(hashPassword).toHaveBeenCalledWith(input.password);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: input.email,
          name: input.name,
          hashedPassword: 'hashed_password',
        },
      });
      expect(result.email).toBe(input.email);
    });

    it('should throw error if email already exists', async () => {
      const input = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: input.email,
      });

      await expect(authService.register(input)).rejects.toThrow(
        'User already exists'
      );
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        email: input.email,
        hashedPassword: 'hashed_password',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(input);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(input.email);
    });

    it('should throw error for invalid credentials', async () => {
      const input = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(input)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });
});
```

**Testing Utilities**:
```typescript
// server/src/utils/__tests__/validation.test.ts
import { validateSchema } from '../validation';
import { z } from 'zod';

describe('validateSchema', () => {
  const schema = z.object({
    email: z.string().email(),
    age: z.number().min(18),
  });

  it('should return validated data for valid input', () => {
    const input = { email: 'test@example.com', age: 25 };
    const result = validateSchema(schema, input);
    expect(result).toEqual(input);
  });

  it('should throw ValidationError for invalid input', () => {
    const input = { email: 'invalid-email', age: 15 };
    expect(() => validateSchema(schema, input)).toThrow('Validation failed');
  });
});
```

**Testing AI Components**:
```typescript
// server/src/ai/__tests__/PromptEngine.test.ts
import { PromptEngine } from '../PromptEngine';

describe('PromptEngine', () => {
  let promptEngine: PromptEngine;

  beforeEach(() => {
    promptEngine = new PromptEngine();
  });

  describe('buildPrompt', () => {
    it('should build correct prompt for standard mode', () => {
      const request = {
        text: 'Test text',
        mode: 'standard' as const,
        language: 'en',
        synonymLevel: 2,
        frozenTerms: [],
        providerId: '1',
        modelId: 'gpt-3.5-turbo',
      };

      const prompt = promptEngine.buildPrompt(request);

      expect(prompt).toContain('Rewrite the following text');
      expect(prompt).toContain('Test text');
    });

    it('should include frozen terms in prompt', () => {
      const request = {
        text: 'Test text with API',
        mode: 'standard' as const,
        language: 'en',
        synonymLevel: 2,
        frozenTerms: ['API'],
        providerId: '1',
        modelId: 'gpt-3.5-turbo',
      };

      const prompt = promptEngine.buildPrompt(request);

      expect(prompt).toContain('PRESERVE EXACTLY');
      expect(prompt).toContain('"API"');
    });
  });

  describe('buildGrammarPrompt', () => {
    it('should build grammar check prompt', () => {
      const prompt = promptEngine.buildGrammarPrompt(
        'This are wrong',
        'en'
      );

      expect(prompt).toContain('Check and correct');
      expect(prompt).toContain('This are wrong');
    });
  });
});
```

#### Frontend Unit Tests

**Testing Components**:
```typescript
// client/src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

**Testing Stores**:
```typescript
// client/src/stores/__tests__/authStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../authStore';
import { authService } from '../../services/auth.service';

jest.mock('../../services/auth.service');

describe('authStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.reset();
    });
  });

  it('should login successfully', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@example.com', name: 'Test' },
      accessToken: 'token',
      refreshToken: 'refresh',
    };

    (authService.login as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockResponse.user);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login error', async () => {
    (authService.login as jest.Mock).mockRejectedValue(
      new Error('Invalid credentials')
    );

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('test@example.com', 'wrong');
    });

    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should logout and clear state', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser({
        id: '1',
        email: 'test@example.com',
        name: 'Test',
      });
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

**Testing Services**:
```typescript
// client/src/services/__tests__/paraphrase.service.test.ts
import { paraphraseService } from '../paraphrase.service';
import { apiClient } from '../api';

jest.mock('../api');

describe('paraphraseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should paraphrase text successfully', async () => {
    const request = {
      text: 'Test text',
      mode: 'standard' as const,
      language: 'en',
      synonymLevel: 2,
      frozenTerms: [],
      providerId: '1',
      modelId: 'gpt-3.5-turbo',
    };

    const mockResponse = {
      text: 'Paraphrased text',
      provider: 'OpenAI',
      model: 'gpt-3.5-turbo',
      latency: 1000,
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await paraphraseService.paraphrase(request);

    expect(apiClient.post).toHaveBeenCalledWith('/paraphrase', request);
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors', async () => {
    (apiClient.post as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    await expect(
      paraphraseService.paraphrase({} as any)
    ).rejects.toThrow('Network error');
  });
});
```

### 2. Integration Tests

```typescript
// server/src/__tests__/integration/auth.integration.test.ts
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../app';
import { prisma } from '../../database/prisma';

describe('Auth Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clear test database
    await prisma.user.deleteMany();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.user.email).toBe('test@example.com');
      expect(body).toHaveProperty('accessToken');
    });

    it('should reject duplicate email', async () => {
      // Register first user
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      });

      // Try to register again
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password456',
          name: 'Another User',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      });
    });

    it('should login with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
    });

    it('should reject invalid password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
```

### 3. End-to-End Tests (Playwright)

#### Setup

```bash
npm install --save-dev @playwright/test
npx playwright install
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### E2E Test Examples

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should login existing user', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'demo@rewritebot.com');
    await page.fill('[name="password"]', 'demo123456');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
  });
});
```

```typescript
// e2e/paraphrase.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Paraphrasing', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'demo@rewritebot.com');
    await page.fill('[name="password"]', 'demo123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should paraphrase text', async ({ page }) => {
    const inputText = 'This is a test sentence for paraphrasing.';

    // Enter text
    await page.fill('[data-testid="input-editor"]', inputText);

    // Select mode
    await page.selectOption('[data-testid="mode-select"]', 'standard');

    // Click paraphrase
    await page.click('[data-testid="paraphrase-button"]');

    // Wait for result
    await page.waitForSelector('[data-testid="output-editor"]');
    
    const outputText = await page.textContent('[data-testid="output-editor"]');
    expect(outputText).toBeTruthy();
    expect(outputText).not.toBe(inputText);
  });

  test('should export document', async ({ page }) => {
    // Enter and paraphrase text
    await page.fill('[data-testid="input-editor"]', 'Test text');
    await page.click('[data-testid="paraphrase-button"]');
    await page.waitForSelector('[data-testid="output-editor"]');

    // Export as TXT
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-button"]');
    await page.click('[data-testid="export-txt"]');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.txt');
  });
});
```

### 4. Performance Tests

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test('should load homepage within 3 seconds', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);
});

test('API response time should be under 500ms', async ({ page }) => {
  await page.goto('/login');
  
  const [response] = await Promise.all([
    page.waitForResponse('/api/v1/auth/login'),
    page.fill('[name="email"]', 'demo@rewritebot.com'),
    page.fill('[name="password"]', 'demo123456'),
    page.click('button[type="submit"]'),
  ]);

  const timing = response.request().timing();
  expect(timing?.responseEnd).toBeLessThan(500);
});
```

### 5. Test Coverage

```bash
# Run tests with coverage
npm test -- --coverage

# Coverage thresholds in jest.config.js
coverageThresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

## CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      
      - run: npm run lint
      
      - run: npm run typecheck
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Testing Checklist

### Unit Tests
- [ ] All services have > 70% coverage
- [ ] All utility functions tested
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] Mocks properly implemented

### Integration Tests
- [ ] All API endpoints tested
- [ ] Authentication flow tested
- [ ] Database operations tested
- [ ] Error responses validated
- [ ] Rate limiting tested

### E2E Tests
- [ ] Critical user flows tested
- [ ] Authentication tested
- [ ] Paraphrasing flow tested
- [ ] Document management tested
- [ ] Export functionality tested
- [ ] Error scenarios tested

### Performance Tests
- [ ] Load time < 3s
- [ ] API response < 500ms
- [ ] Load testing completed
- [ ] Memory leaks checked

---

**Coverage Target**: 70% overall
**Test Execution Time**: < 5 minutes
**E2E Tests**: Critical paths only
**Review**: Pre-release testing mandatory
