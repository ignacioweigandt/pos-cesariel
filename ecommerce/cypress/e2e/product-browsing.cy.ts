describe('Product Browsing E2E Tests', () => {
  beforeEach(() => {
    cy.clearStorages()
    cy.visit('/')
    cy.waitForPageLoad()
  })

  it('should display product cards with essential information', () => {
    // Wait for products to load
    cy.get('[data-testid="product-card"], .product-card', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
    
    // Check first product card has required elements
    cy.get('[data-testid="product-card"], .product-card')
      .first()
      .within(() => {
        // Product name
        cy.get('h3, .product-name, [data-testid="product-name"]')
          .should('be.visible')
          .and('not.be.empty')
        
        // Product price
        cy.get('.price, [data-testid="product-price"]')
          .should('be.visible')
          .and('contain', '$')
        
        // Product image
        cy.get('img')
          .should('be.visible')
          .and('have.attr', 'src')
          .and('not.be.empty')
        
        // View details button or link
        cy.get('a, button')
          .contains(/ver detalles|detalle|comprar/i)
          .should('be.visible')
      })
  })

  it('should navigate to product detail page', () => {
    // Click on first product
    cy.get('[data-testid="product-card"], .product-card')
      .first()
      .click()
    
    cy.waitForPageLoad()
    
    // Should be on product detail page
    cy.url().should('match', /\/productos\/\d+/)
    
    // Should show product details
    cy.get('[data-testid="product-detail"], .product-detail')
      .should('be.visible')
  })

  it('should show product images in detail view', () => {
    // Navigate to a product
    cy.get('[data-testid="product-card"], .product-card')
      .first()
      .find('a, button')
      .first()
      .click()
    
    cy.waitForPageLoad()
    
    // Check main product image
    cy.get('[data-testid="product-image"], .product-image, .main-image')
      .should('be.visible')
      .find('img')
      .should('have.attr', 'src')
      .and('not.be.empty')
  })

  it('should handle image carousel if multiple images exist', () => {
    // Navigate to a product
    cy.get('[data-testid="product-card"], .product-card')
      .first()
      .click()
    
    cy.waitForPageLoad()
    
    // Check if image navigation buttons exist (for products with multiple images)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="image-next"], .image-next, button:has(svg)').length > 0) {
        // Click next image button
        cy.get('[data-testid="image-next"], .image-next, button:has(svg)')
          .first()
          .click()
        
        // Image should change
        cy.get('[data-testid="product-image"], .product-image img')
          .should('be.visible')
      }
    })
  })

  it('should show product information in detail view', () => {
    // Navigate to a product
    cy.get('[data-testid="product-card"], .product-card')
      .first()
      .click()
    
    cy.waitForPageLoad()
    
    // Check product name
    cy.get('[data-testid="product-name"], h1, .product-title')
      .should('be.visible')
      .and('not.be.empty')
    
    // Check product price
    cy.get('[data-testid="product-price"], .price')
      .should('be.visible')
      .and('contain', '$')
    
    // Check product description if exists
    cy.get('[data-testid="product-description"], .description')
      .should('be.visible')
  })

  it('should handle size selection for products with sizes', () => {
    // Navigate to a product
    cy.get('[data-testid="product-card"], .product-card')
      .first()
      .click()
    
    cy.waitForPageLoad()
    
    // Check if size selector exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="size-selector"], .size-options').length > 0) {
        // Select a size
        cy.get('[data-testid="size-selector"], .size-options')
          .find('button, input')
          .first()
          .click()
        
        // Size should be selected
        cy.get('[data-testid="size-selector"], .size-options')
          .find('.selected, [data-selected="true"], input:checked')
          .should('exist')
      }
    })
  })

  it('should handle quantity selection', () => {
    // Navigate to a product
    cy.get('[data-testid="product-card"], .product-card')
      .first()
      .click()
    
    cy.waitForPageLoad()
    
    // Check if quantity input exists
    cy.get('[data-testid="quantity-input"], input[type="number"], .quantity-selector')
      .should('be.visible')
    
    // Test quantity increase
    cy.get('[data-testid="quantity-plus"], .quantity-plus, button:contains("+")')
      .should('be.visible')
      .click()
    
    // Check quantity changed
    cy.get('[data-testid="quantity-input"], input[type="number"]')
      .should('have.value', '2')
    
    // Test quantity decrease
    cy.get('[data-testid="quantity-minus"], .quantity-minus, button:contains("-")')
      .should('be.visible')
      .click()
    
    // Check quantity changed back
    cy.get('[data-testid="quantity-input"], input[type="number"]')
      .should('have.value', '1')
  })

  it('should show add to cart button', () => {
    // Navigate to a product
    cy.get('[data-testid="product-card"], .product-card')
      .first()
      .click()
    
    cy.waitForPageLoad()
    
    // Check add to cart button
    cy.get('[data-testid="add-to-cart"], button:contains("carrito")')
      .should('be.visible')
      .and('not.be.disabled')
  })

  it('should navigate back to products list', () => {
    // Navigate to a product
    cy.get('[data-testid="product-card"], .product-card')
      .first()
      .click()
    
    cy.waitForPageLoad()
    
    // Click back button or navigate back
    cy.get('[data-testid="back-button"], button:contains("volver"), .back-link')
      .should('be.visible')
      .click()
    
    cy.waitForPageLoad()
    
    // Should be back on homepage or products list
    cy.get('[data-testid="product-card"], .product-card')
      .should('have.length.greaterThan', 0)
  })

  it('should handle product not found gracefully', () => {
    // Navigate to non-existent product
    cy.visit('/productos/99999')
    cy.waitForPageLoad()
    
    // Should show error message or redirect
    cy.get('[data-testid="error-message"], .error, .not-found')
      .should('be.visible')
  })

  it('should show related products or recommendations', () => {
    // Navigate to a product
    cy.get('[data-testid="product-card"], .product-card')
      .first()
      .click()
    
    cy.waitForPageLoad()
    
    // Check if related products section exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="related-products"], .related-products, .recommendations').length > 0) {
        cy.get('[data-testid="related-products"], .related-products, .recommendations')
          .should('be.visible')
          .find('[data-testid="product-card"], .product-card')
          .should('have.length.greaterThan', 0)
      }
    })
  })

  it('should handle API failures gracefully', () => {
    // Intercept product API and simulate failure
    cy.intercept('GET', '**/productos/*', { forceNetworkError: true })
    
    // Navigate to a product
    cy.visit('/productos/1')
    cy.waitForPageLoad()
    
    // Should show error state or fallback content
    cy.get('[data-testid="error-message"], .error, .fallback')
      .should('be.visible')
  })
})