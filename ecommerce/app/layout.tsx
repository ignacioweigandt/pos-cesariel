import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { EcommerceProvider } from "./context/EcommerceContext"
import Header from "./components/Header"
import Footer from "./components/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mi Tienda Online - E-commerce",
  description: "Tienda online con productos de calidad y los mejores precios",
  keywords: "tienda, online, ropa, calzado, accesorios",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <EcommerceProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </EcommerceProvider>
      </body>
    </html>
  )
}
