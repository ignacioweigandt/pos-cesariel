// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for login
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.session(
    [username, password],
    () => {
      cy.visit('/')
      cy.get('input[name="username"]').type(username)
      cy.get('input[name="password"]').type(password)
      cy.get('button[type="submit"]').click()
      
      // Wait for successful login by checking for dashboard or redirect
      cy.url().should('not.include', '/login')
      cy.url().should('not.eq', Cypress.config().baseUrl + '/')
    },
    {
      validate: () => {
        // Validate session by checking localStorage for token
        expect(localStorage.getItem('token')).to.exist
      },
    }
  )
})

// Custom command for getting elements by data-testid
Cypress.Commands.add('getByTestId', (dataTestId: string) => {
  return cy.get(`[data-testid="${dataTestId}"]`)
})

// Custom command for clearing localStorage
Cypress.Commands.add('clearLocalStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
  })
})

// Override visit to wait for page load
Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  return originalFn(url, {
    ...options,
    onBeforeLoad: (win) => {
      // Add any global setup here
      if (options?.onBeforeLoad) {
        options.onBeforeLoad(win)
      }
    },
  })
})