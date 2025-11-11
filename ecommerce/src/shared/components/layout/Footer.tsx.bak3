"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { storeConfigApi, socialMediaApi } from "@/app/lib/api"

interface SocialMedia {
  id: number
  platform: string
  username: string
  url: string
  display_order: number
}

interface StoreConfig {
  store_name: string
  store_description: string
  store_logo: string | null
  contact_email: string
  contact_phone: string
  address: string
  currency: string
  tax_percentage: number
}

const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return Facebook
    case 'instagram':
      return Instagram
    case 'twitter':
      return Twitter
    default:
      return Mail
  }
}

export default function Footer() {
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null)
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storeResponse, socialResponse] = await Promise.all([
          storeConfigApi.get(),
          socialMediaApi.getActive()
        ])
        
        setStoreConfig(storeResponse.data.data)
        setSocialMedia(socialResponse.data.data)
      } catch (error) {
        console.error('Error loading footer data:', error)
        // Fallback data
        setStoreConfig({
          store_name: "POS Cesariel",
          store_description: "Tu tienda online de confianza con los mejores productos y precios.",
          store_logo: null,
          contact_email: "info@poscesariel.com",
          contact_phone: "+54 11 1234-5678",
          address: "Buenos Aires, Argentina",
          currency: "ARS",
          tax_percentage: 21
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{storeConfig?.store_name || "Mi Tienda"}</h3>
            <p className="text-gray-300 mb-4">{storeConfig?.store_description || "Tu tienda online de confianza con los mejores productos y precios."}</p>
            <div className="flex space-x-4">
              {socialMedia.map((social) => {
                const Icon = getSocialIcon(social.platform)
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                    title={`${social.platform}: ${social.username}`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/productos" className="text-gray-300 hover:text-white">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="text-gray-300 hover:text-white">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/productos?categoria=ropa" className="text-gray-300 hover:text-white">
                  Ropa
                </Link>
              </li>
              <li>
                <Link href="/productos?categoria=calzado" className="text-gray-300 hover:text-white">
                  Calzado
                </Link>
              </li>
              <li>
                <Link href="/productos?categoria=accesorios" className="text-gray-300 hover:text-white">
                  Accesorios
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-gray-300">{storeConfig?.contact_phone || "+54 11 1234-5678"}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-gray-300">{storeConfig?.contact_email || "info@mitienda.com"}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-gray-300">{storeConfig?.address || "Buenos Aires, Argentina"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">© 2024 {storeConfig?.store_name || "Mi Tienda"}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
