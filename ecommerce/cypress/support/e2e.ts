// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Custom assertions for better test readability
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to wait for the page to load completely
       */
      waitForPageLoad(): Chainable<Element>
      
      /**
       * Custom command to add a product to cart
       */
      addProductToCart(productId: string, quantity?: number): Chainable<Element>
      
      /**
       * Custom command to fill customer information
       */
      fillCustomerInfo(customerData: {
        name: string
        phone: string
        email?: string
      }): Chainable<Element>
      
      /**
       * Custom command to mock API responses
       */
      mockApiResponse(endpoint: string, fixture: string): Chainable<Element>
    }
  }
}

// Hide XHR requests in command log to reduce noise
const app = window.top;
if (!app?.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app?.document.createElement('style');
  if (style) {
    style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
    style.setAttribute('data-hide-command-log-request', '');
    app?.document.head.appendChild(style);
  }
}