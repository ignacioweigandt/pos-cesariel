describe('Authentication', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
  })

  it('should display login form on home page', () => {
    cy.get('input[name="username"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
    cy.contains('Iniciar Sesión').should('be.visible')
  })

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click()
    cy.contains('Usuario requerido').should('be.visible')
    cy.contains('Contraseña requerida').should('be.visible')
  })

  it('should login successfully with valid admin credentials', () => {
    cy.fixture('users').then((users) => {
      const admin = users.admin
      
      cy.get('input[name="username"]').type(admin.username)
      cy.get('input[name="password"]').type(admin.password)
      cy.get('button[type="submit"]').click()
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard')
      
      // Should display user info in header
      cy.contains(admin.full_name).should('be.visible')
      cy.contains(admin.role).should('be.visible')
      
      // Should have token in localStorage
      cy.window().its('localStorage.token').should('exist')
    })
  })

  it('should login successfully with manager credentials', () => {
    cy.fixture('users').then((users) => {
      const manager = users.manager
      
      cy.get('input[name="username"]').type(manager.username)
      cy.get('input[name="password"]').type(manager.password)
      cy.get('button[type="submit"]').click()
      
      cy.url().should('include', '/dashboard')
      cy.contains(manager.full_name).should('be.visible')
    })
  })

  it('should show error for invalid credentials', () => {
    cy.get('input[name="username"]').type('invalid_user')
    cy.get('input[name="password"]').type('wrong_password')
    cy.get('button[type="submit"]').click()
    
    // Should show error message
    cy.contains('Credenciales inválidas').should('be.visible')
    
    // Should stay on login page
    cy.url().should('not.include', '/dashboard')
  })

  it('should logout successfully', () => {
    // Login first
    cy.login('admin', 'admin123')
    cy.visit('/dashboard')
    
    // Click logout button
    cy.get('button').contains('Cerrar Sesión').click()
    
    // Should redirect to login
    cy.url().should('not.include', '/dashboard')
    cy.get('input[name="username"]').should('be.visible')
    
    // Should clear localStorage
    cy.window().its('localStorage.token').should('not.exist')
  })

  it('should redirect to login when accessing protected route without auth', () => {
    cy.visit('/dashboard')
    
    // Should redirect to login
    cy.url().should('not.include', '/dashboard')
    cy.get('input[name="username"]').should('be.visible')
  })

  it('should maintain session after page refresh', () => {
    cy.login('admin', 'admin123')
    cy.visit('/dashboard')
    
    // Refresh page
    cy.reload()
    
    // Should still be logged in
    cy.url().should('include', '/dashboard')
    cy.contains('Administrador del Sistema').should('be.visible')
  })
})