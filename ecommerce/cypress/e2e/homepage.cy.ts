describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    // Start with clean state
    cy.clearStorages()
    cy.visit('/')
    cy.waitForPageLoad()
  })

  it('should load the homepage successfully', () => {
    // Check page title and basic elements
    cy.title().should('contain', 'E-commerce')
    
    // Check header is present
    cy.get('header').should('be.visible')
    
    // Check main content area exists
    cy.get('main, [data-testid="main-content"]').should('be.visible')
  })

  it('should display store branding', () => {
    // Check for store logo or name
    cy.get('[data-testid="store-logo"], img[alt*="logo"], h1')
      .should('be.visible')
  })

  it('should show banners section', () => {
    // Check if banners are displayed
    cy.get('[data-testid="banners"], .banner, .hero')
      .should('be.visible')
  })

  it('should display products section', () => {
    // Wait for products to load
    cy.get('[data-testid="products-section"], .products-grid', { timeout: 10000 })
      .should('be.visible')
    
    // Check if at least one product is displayed
    cy.get('[data-testid="product-card"], .product-card')
      .should('have.length.greaterThan', 0)
  })

  it('should show categories navigation', () => {
    // Check for categories menu or links
    cy.get('[data-testid="categories"], .categories, nav')
      .should('be.visible')
  })

  it('should display connection status indicator', () => {
    // Check for connection status component
    cy.get('[data-testid="connection-status"]')
      .should('be.visible')
  })

  it('should show cart icon in header', () => {
    // Check for cart icon or button
    cy.get('[data-testid="cart-button"], .cart-icon, button:contains("carrito")')
      .should('be.visible')
  })

  it('should handle responsive design', () => {
    // Test mobile viewport
    cy.viewport('iphone-x')
    cy.reload()
    cy.waitForPageLoad()
    
    // Check header is still visible
    cy.get('header').should('be.visible')
    
    // Check main content adapts
    cy.get('main, [data-testid="main-content"]').should('be.visible')
    
    // Test tablet viewport
    cy.viewport('ipad-2')
    cy.reload()
    cy.waitForPageLoad()
    
    // Check layout still works
    cy.get('header').should('be.visible')
    cy.get('main, [data-testid="main-content"]').should('be.visible')
  })

  it('should handle offline/API failure gracefully', () => {
    // Intercept API calls and simulate failure
    cy.intercept('GET', '**/ecommerce/products', { forceNetworkError: true })
    cy.intercept('GET', '**/ecommerce/categories', { forceNetworkError: true })
    cy.intercept('GET', '**/ecommerce-advanced/banners', { forceNetworkError: true })
    
    cy.reload()
    cy.waitForPageLoad()
    
    // Should still show basic layout
    cy.get('header').should('be.visible')
    cy.get('main, [data-testid="main-content"]').should('be.visible')
    
    // Should show fallback content or error message
    cy.get('[data-testid="fallback-content"], .fallback, .error-message')
      .should('be.visible')
  })

  it('should load and navigate through banners', () => {
    // Check if banner carousel exists
    cy.get('[data-testid="banners"], .banner-carousel')
      .should('be.visible')
    
    // If there are multiple banners, test navigation
    cy.get('.banner-slide, .banner-item').then(($banners) => {
      if ($banners.length > 1) {
        // Test next button if exists
        cy.get('[data-testid="banner-next"], .banner-next, button:contains("siguiente")')
          .should('be.visible')
          .click()
        
        // Test previous button if exists
        cy.get('[data-testid="banner-prev"], .banner-prev, button:contains("anterior")')
          .should('be.visible')
          .click()
      }
    })
  })

  it('should filter products by category', () => {
    // Click on a category if categories exist
    cy.get('[data-testid="category-link"], .category-item, a[href*="categoria"]')
      .first()
      .click()
    
    // Should navigate or filter products
    cy.url().should('contain', 'categoria')
    cy.waitForPageLoad()
    
    // Should show filtered products
    cy.get('[data-testid="product-card"], .product-card')
      .should('be.visible')
  })

  it('should search for products', () => {
    // Look for search input
    cy.get('[data-testid="search-input"], input[placeholder*="buscar"], input[type="search"]')
      .should('be.visible')
      .type('test product{enter}')
    
    cy.waitForPageLoad()
    
    // Should show search results or no results message
    cy.get('[data-testid="search-results"], .search-results, .no-results')
      .should('be.visible')
  })
})