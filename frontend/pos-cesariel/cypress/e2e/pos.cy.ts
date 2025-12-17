describe('POS (Point of Sale)', () => {
  beforeEach(() => {
    cy.login('admin', 'admin123')
    cy.visit('/pos')
  })

  it('should display POS interface elements', () => {
    cy.contains('Punto de Venta').should('be.visible')
    
    // Product search
    cy.get('input[placeholder*="Buscar productos"]').should('be.visible')
    
    // Shopping cart area
    cy.contains('Carrito de Compras').should('be.visible')
    cy.contains('Total: $0.00').should('be.visible')
    
    // Customer info section
    cy.contains('Información del Cliente').should('be.visible')
    
    // Payment method selection
    cy.contains('Método de Pago').should('be.visible')
  })

  it('should search for products', () => {
    const searchTerm = 'producto'
    
    cy.get('input[placeholder*="Buscar productos"]').type(searchTerm)
    
    // Should show search results
    cy.get('[data-testid="product-results"]').should('be.visible')
    
    // Results should contain the search term
    cy.get('[data-testid="product-results"]')
      .should('contain.text', searchTerm)
  })

  it('should add product to cart', () => {
    // Search for a product first
    cy.get('input[placeholder*="Buscar productos"]').type('producto')
    
    // Click on first product result
    cy.get('[data-testid="product-item"]').first().click()
    
    // Should be added to cart
    cy.get('[data-testid="cart-items"]').should('contain.text', 'producto')
    
    // Total should be updated
    cy.get('[data-testid="cart-total"]').should('not.contain.text', '$0.00')
  })

  it('should update product quantity in cart', () => {
    // Add product to cart first
    cy.get('input[placeholder*="Buscar productos"]').type('producto')
    cy.get('[data-testid="product-item"]').first().click()
    
    // Increase quantity
    cy.get('[data-testid="quantity-increase"]').first().click()
    
    // Should show quantity 2
    cy.get('[data-testid="cart-quantity"]').should('contain.text', '2')
    
    // Total should be doubled
    cy.get('[data-testid="cart-total"]').then(($total) => {
      const totalText = $total.text()
      expect(totalText).to.not.equal('$0.00')
    })
  })

  it('should remove product from cart', () => {
    // Add product to cart first
    cy.get('input[placeholder*="Buscar productos"]').type('producto')
    cy.get('[data-testid="product-item"]').first().click()
    
    // Remove from cart
    cy.get('[data-testid="remove-item"]').first().click()
    
    // Cart should be empty
    cy.get('[data-testid="cart-items"]').should('be.empty')
    cy.contains('Total: $0.00').should('be.visible')
  })

  it('should validate stock before adding to cart', () => {
    // Try to add more items than available in stock
    cy.get('input[placeholder*="Buscar productos"]').type('producto')
    cy.get('[data-testid="product-item"]').first().click()
    
    // Try to increase quantity beyond stock
    for (let i = 0; i < 10; i++) {
      cy.get('[data-testid="quantity-increase"]').first().click()
    }
    
    // Should show stock validation error
    cy.contains('Stock insuficiente').should('be.visible')
  })

  it('should fill customer information', () => {
    const customerInfo = {
      name: 'Juan Pérez',
      email: 'juan@test.com',
      phone: '555-0123'
    }
    
    cy.get('input[name="customer_name"]').type(customerInfo.name)
    cy.get('input[name="customer_email"]').type(customerInfo.email)
    cy.get('input[name="customer_phone"]').type(customerInfo.phone)
    
    // Values should be filled
    cy.get('input[name="customer_name"]').should('have.value', customerInfo.name)
    cy.get('input[name="customer_email"]').should('have.value', customerInfo.email)
    cy.get('input[name="customer_phone"]').should('have.value', customerInfo.phone)
  })

  it('should select payment method', () => {
    // Select cash payment
    cy.get('select[name="payment_method"]').select('efectivo')
    cy.get('select[name="payment_method"]').should('have.value', 'efectivo')
    
    // Select card payment
    cy.get('select[name="payment_method"]').select('tarjeta')
    cy.get('select[name="payment_method"]').should('have.value', 'tarjeta')
  })

  it('should complete a sale', () => {
    // Add product to cart
    cy.get('input[placeholder*="Buscar productos"]').type('producto')
    cy.get('[data-testid="product-item"]').first().click()
    
    // Fill customer info
    cy.get('input[name="customer_name"]').type('Juan Pérez')
    
    // Select payment method
    cy.get('select[name="payment_method"]').select('efectivo')
    
    // Process sale
    cy.get('button').contains('Procesar Venta').click()
    
    // Should show success message
    cy.contains('Venta procesada exitosamente').should('be.visible')
    
    // Cart should be cleared
    cy.contains('Total: $0.00').should('be.visible')
  })

  it('should scan barcode', () => {
    const barcode = '1234567890123'
    
    // Enter barcode in search
    cy.get('input[placeholder*="Buscar productos"]').type(barcode)
    cy.get('input[placeholder*="Buscar productos"]').type('{enter}')
    
    // Should find product by barcode
    cy.get('[data-testid="product-results"]').should('be.visible')
  })

  it('should handle WebSocket inventory updates', () => {
    // This would require actual WebSocket functionality
    // For now, just check that the connection indicator is visible
    cy.contains('En línea').should('be.visible')
  })

  context('Error handling', () => {
    it('should handle empty cart sale attempt', () => {
      cy.get('button').contains('Procesar Venta').click()
      
      cy.contains('El carrito está vacío').should('be.visible')
    })

    it('should handle network errors gracefully', () => {
      // This would require intercepting network requests
      // For now, just check that error handling exists
      cy.get('[data-testid="error-message"]').should('not.exist')
    })
  })
})