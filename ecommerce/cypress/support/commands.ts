/// <reference types="cypress" />

// Custom commands for E-commerce testing

Cypress.Commands.add('waitForPageLoad', () => {
  // Wait for main content to be visible
  cy.get('[data-testid="main-content"], main, .main-content', { timeout: 10000 })
    .should('be.visible')
  
  // Wait for any loading spinners to disappear
  cy.get('[data-testid="loading"], .loading, .spinner', { timeout: 5000 })
    .should('not.exist')
})

Cypress.Commands.add('addProductToCart', (productId: string, quantity = 1) => {
  // Navigate to product detail page
  cy.visit(`/productos/${productId}`)
  cy.waitForPageLoad()
  
  // Set quantity if different from 1
  if (quantity > 1) {
    cy.get('[data-testid="quantity-input"], input[type="number"]')
      .clear()
      .type(quantity.toString())
  }
  
  // Click add to cart button
  cy.get('[data-testid="add-to-cart"], button:contains("Agregar al carrito")')
    .click()
  
  // Wait for cart update
  cy.get('[data-testid="cart-count"], .cart-count')
    .should('contain', quantity.toString())
})

Cypress.Commands.add('fillCustomerInfo', (customerData) => {
  // Fill customer name
  cy.get('[data-testid="customer-name"], input[name="name"]')
    .clear()
    .type(customerData.name)
  
  // Fill customer phone
  cy.get('[data-testid="customer-phone"], input[name="phone"]')
    .clear()
    .type(customerData.phone)
  
  // Fill customer email if provided
  if (customerData.email) {
    cy.get('[data-testid="customer-email"], input[name="email"]')
      .clear()
      .type(customerData.email)
  }
})

Cypress.Commands.add('mockApiResponse', (endpoint: string, fixture: string) => {
  cy.intercept('GET', `**/api${endpoint}`, { fixture }).as(`mock${endpoint.replace(/\//g, '_')}`)
})

// Additional helper commands

// Command to check if element exists without failing
Cypress.Commands.add('elementExists', { prevSubject: 'optional' }, (subject, selector) => {
  if (subject) {
    return cy.wrap(subject).find(selector)
  } else {
    return cy.get('body').then(($body) => {
      if ($body.find(selector).length > 0) {
        return cy.get(selector)
      } else {
        return cy.wrap(null)
      }
    })
  }
})

// Command to wait for API calls to complete
Cypress.Commands.add('waitForApi', () => {
  // Wait for any pending requests to complete
  cy.window().then((win) => {
    // Check if there are any pending fetch requests
    return new Cypress.Promise((resolve) => {
      let attempts = 0
      const maxAttempts = 50
      
      const checkPendingRequests = () => {
        attempts++
        
        // Simple check for loading states
        const hasLoadingElements = win.document.querySelectorAll('[data-testid="loading"], .loading, .spinner').length > 0
        
        if (!hasLoadingElements || attempts >= maxAttempts) {
          resolve()
        } else {
          setTimeout(checkPendingRequests, 100)
        }
      }
      
      checkPendingRequests()
    })
  })
})

// Command to clear localStorage and sessionStorage
Cypress.Commands.add('clearStorages', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
  cy.window().then((win) => {
    win.sessionStorage.clear()
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      elementExists(selector: string): Chainable<JQuery<HTMLElement>>
      waitForApi(): Chainable<void>
      clearStorages(): Chainable<void>
    }
  }
}