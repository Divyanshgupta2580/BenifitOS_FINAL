// BenefitOS Playwright E2E Smoke Test Specification

export const E2ESmokeSuite = {
  name: 'BenefitOS Web SPA Playwright E2E Smoke Suite',
  tests: [
    {
      id: 'E2E-001',
      description: 'App Shell Load - Navigation bar, Header, and Footer render',
      route: '/',
      expectedElement: 'header',
    },
    {
      id: 'E2E-002',
      description: 'Authentication Route - Login form elements and submit controls',
      route: '/login',
      expectedElement: 'input[name="email"]',
    },
    {
      id: 'E2E-003',
      description: 'Protected Route Guard - Unauthenticated user redirected to /login',
      route: '/dashboard',
      expectedRedirect: '/login',
    },
    {
      id: 'E2E-004',
      description: 'Scheme Discovery Catalog - Scheme filter buttons and search input render',
      route: '/schemes',
      expectedElement: '.scheme-card',
    },
    {
      id: 'E2E-005',
      description: 'AI Copilot Route - Chat UI interface loads without fatal browser error',
      route: '/copilot',
      expectedElement: '#chat-container',
    },
  ],
};
