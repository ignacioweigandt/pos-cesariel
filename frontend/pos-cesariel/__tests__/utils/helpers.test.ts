// Simple utility tests to verify Jest setup
describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(amount)
    }

    it('should format currency correctly', () => {
      expect(formatCurrency(100)).toBe('$100,00')
      expect(formatCurrency(1234.56)).toBe('$1.234,56')
      expect(formatCurrency(0)).toBe('$0,00')
    })

    it('should handle negative amounts', () => {
      expect(formatCurrency(-100)).toBe('-$100,00')
    })
  })

  describe('formatDate', () => {
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('es-AR')
    }

    it('should format date correctly', () => {
      const testDate = new Date('2024-01-15')
      const formatted = formatDate(testDate)
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })
  })

  describe('calculateTotal', () => {
    const calculateTotal = (items: Array<{quantity: number, price: number}>): number => {
      return items.reduce((total, item) => total + (item.quantity * item.price), 0)
    }

    it('should calculate total correctly', () => {
      const items = [
        { quantity: 2, price: 10.50 },
        { quantity: 1, price: 5.25 },
        { quantity: 3, price: 8.75 }
      ]
      
      expect(calculateTotal(items)).toBe(47.5)
    })

    it('should handle empty array', () => {
      expect(calculateTotal([])).toBe(0)
    })

    it('should handle zero quantities', () => {
      const items = [
        { quantity: 0, price: 10.50 },
        { quantity: 2, price: 5.25 }
      ]
      
      expect(calculateTotal(items)).toBe(10.5)
    })
  })

  describe('validateEmail', () => {
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('admin+tag@company.org')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('test@domain')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('generateSaleNumber', () => {
    const generateSaleNumber = (): string => {
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      return `SALE-${timestamp}-${random}`
    }

    it('should generate unique sale numbers', () => {
      const sale1 = generateSaleNumber()
      const sale2 = generateSaleNumber()
      
      expect(sale1).toMatch(/^SALE-\d+-\d{3}$/)
      expect(sale2).toMatch(/^SALE-\d+-\d{3}$/)
      expect(sale1).not.toBe(sale2)
    })
  })
})