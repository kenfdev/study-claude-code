# Modern Todo App Development Guidelines
## Technology Stack (STRICT REQUIREMENTS)
- **Frontend**: React 18 + TypeScript + React Router v7 + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript + SQLite
- **Testing**: vitest + @testing-library/react + supertest
- **E2E**: Playwright
- **Deployment**: Cloudflare Pages (Frontend) + Cloudflare Workers (Backend)
## React Router v7 Specific Requirements- Use the new data loading patterns with `loader` functions
- Implement proper error boundaries with `errorElement`- Use the new `createBrowserRouter` API (not deprecated Switch/Route)
- Follow the latest file-based routing conventions if applicable
## Project Structure (ENFORCE THIS)

```
src/
├── components/ # Reusable UI components
├── pages/ # Route components with loaders
├── hooks/ # Custom React hooks
├── utils/ # Pure utility functions
├── types/ # TypeScript type definitions
├── api/ # API client functions
└── tests/ # Component and integration tests
```

## Development Commands
- `npm run dev` - Start both frontend (5173) and backend (3001) with concurrently
- `npm run test` - Run vitest in watch mode
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run build` - Build for Cloudflare Pages deployment
- `npm run preview` - Preview built app locally

## Code Quality Standards (NON-NEGOTIABLE)
- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Airbnb configuration + React hooks rules
- **Prettier**: 2-space indentation, single quotes, trailing commas
- **Testing**: Minimum 80% code coverage required
- **Accessibility**: WCAG 2.1 AA compliance mandatory

## API Design Patterns
- RESTful endpoints: `/api/v1/todos`, `/api/v1/auth`
- Consistent JSON responses with `{ data, error, message }` structure
- Proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Request validation with Zod schemas
- Rate limiting: 100 requests/minute per IP

## React Patterns to Use
- Functional components with hooks only (NO class components)
- Custom hooks for data fetching (`useTodos`, `useAuth`)
- Context API for global state (auth, theme)
- Error boundaries for graceful error handling
- Suspense for async operations

## Vitest Testing Strategy
```javascript
// Preferred test structure
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should handle user interaction correctly', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Cloudflare-Specific Requirements

- **Pages**: Static site generation optimized
- **Workers**: Edge function patterns for API endpoints
- **Environment Variables**: Use `CLOUDFLARE_` prefix
- **Build Output**: `/dist` folder with proper `_routes.json`

## CRITICAL RULES (NEVER BREAK THESE)

- ALWAYS write git commit messages in English. NEVER EVER WRITE COMMIT MESSAGES IN OTHER LANGUAGES INCLUDING UNICODE.
- ALWAYS use React Router v7 patterns (not v6 or older)
- ALWAYS write tests with vitest (not Jest)
- ALWAYS target Cloudflare deployment (not Vercel/Netlify)
- ALWAYS use TypeScript strict mode
- ALWAYS implement proper error handling
- ALWAYS ensure mobile-first responsive design
- ALWAYS run tests before committing

## Performance Targets

- Lighthouse Score: 95+ for all metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Bundle Size: Frontend < 300KB gzipped
- API Response Time: < 200ms average