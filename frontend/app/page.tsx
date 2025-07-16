'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string>('Conectando...')

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/health`)
        const data = await response.json()
        setBackendStatus(`✅ Backend: ${data.status}`)
      } catch (error) {
        setBackendStatus('❌ Backend: No disponible')
      }
    }

    checkBackend()
    const interval = setInterval(checkBackend, 10000) // Check every 10 seconds
    
    return () => clearInterval(interval)
  }, [])

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🛒 POS Cesariel</h1>
      <p>Sistema de punto de venta</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Estado del Sistema</h2>
        <p>{backendStatus}</p>
        <p>✅ Frontend: Funcionando</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Enlaces útiles</h2>
        <ul>
          <li><a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">📚 API Documentation</a></li>
          <li><a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">🗄️ Adminer (Base de datos)</a></li>
        </ul>
      </div>
    </main>
  )
}
