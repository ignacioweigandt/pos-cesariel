describe('Dashboard', () => {
  beforeEach(() => {
    cy.login('admin', 'admin123')
    cy.visit('/dashboard')
  })

  it('should display dashboard stats cards', () => {
    // Check for main dashboard elements
    cy.contains('Dashboard').should('be.visible')
    
    // Check for stats cards
    cy.contains('Ventas del Día').should('be.visible')
    cy.contains('Ventas del Mes').should('be.visible')
    cy.contains('Total Productos').should('be.visible')
    cy.contains('Stock Bajo').should('be.visible')
    
    // Check for quick actions
    cy.contains('Acciones Rápidas').should('be.visible')
    cy.contains('Nueva Venta').should('be.visible')
    cy.contains('Gestionar Inventario').should('be.visible')
  })

  it('should navigate to POS from quick actions', () => {
    cy.contains('Nueva Venta').click()
    cy.url().should('include', '/pos')
    cy.contains('Punto de Venta').should('be.visible')
  })

  it('should navigate to inventory from quick actions', () => {
    cy.contains('Gestionar Inventario').click()
    cy.url().should('include', '/inventory')
    cy.contains('Inventario').should('be.visible')
  })

  it('should display WebSocket connection status', () => {
    // Check for connection indicator
    cy.contains('En línea').should('be.visible')
    
    // Check for notification bell
    cy.get('[data-testid="bell-icon"]').should('be.visible')
  })

  it('should show low stock alerts if any', () => {
    // This would depend on having products with low stock
    // For now, just check that the section exists
    cy.contains('Alertas de Stock Bajo').should('be.visible')
  })

  it('should display recent activity or stats', () => {
    // Check for any charts or recent activity sections
    cy.get('.recharts-wrapper').should('exist')
  })

  context('Role-based access', () => {
    it('should show all navigation items for admin', () => {
      cy.contains('Dashboard').should('be.visible')
      cy.contains('POS-Ventas').should('be.visible')
      cy.contains('Inventario').should('be.visible')
      cy.contains('Reportes').should('be.visible')
      cy.contains('E-commerce').should('be.visible')
      cy.contains('Usuarios').should('be.visible')
      cy.contains('Configuración').should('be.visible')
    })

    it('should show limited navigation items for seller', () => {
      cy.clearLocalStorage()
      cy.login('seller', 'seller123')
      cy.visit('/dashboard')
      
      cy.contains('Dashboard').should('be.visible')
      cy.contains('POS-Ventas').should('be.visible')
      
      // These should not be visible for seller
      cy.contains('Usuarios').should('not.exist')
      cy.contains('Configuración').should('not.exist')
      cy.contains('Reportes').should('not.exist')
    })
  })

  it('should refresh stats when new data is available', () => {
    // This would require WebSocket functionality
    // For now, just check that stats are displayed
    cy.get('[data-testid="sales-today"]').should('exist')
    cy.get('[data-testid="sales-month"]').should('exist')
  })
})