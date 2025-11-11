import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sobre Nosotros - Mi Tienda Online",
  description: "Conoce nuestra historia, misión y valores. Tu tienda online de confianza.",
}

export default function SobreNosotros() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Sobre Nosotros
          </h1>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Nuestra Historia</h2>
                <p className="text-gray-600 leading-relaxed">
                  Desde nuestros inicios, nos hemos dedicado a ofrecer productos de calidad 
                  a precios accesibles. Comenzamos como una pequeña tienda local y hoy somos 
                  una empresa que atiende a clientes en todo el país a través de nuestro 
                  e-commerce integrado con nuestro sistema de punto de venta.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Nuestra Misión</h2>
                <p className="text-gray-600 leading-relaxed">
                  Proporcionar una experiencia de compra excepcional, ofreciendo productos 
                  de alta calidad, precios competitivos y un servicio al cliente superior. 
                  Nos esforzamos por ser la primera opción de nuestros clientes cuando 
                  buscan ropa, calzado y accesorios.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Nuestros Valores</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Calidad</h3>
                    <p className="text-blue-700">
                      Seleccionamos cuidadosamente cada producto para garantizar 
                      la mejor calidad para nuestros clientes.
                    </p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Confianza</h3>
                    <p className="text-green-700">
                      Construimos relaciones duraderas basadas en la transparencia 
                      y el compromiso con nuestros clientes.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">Innovación</h3>
                    <p className="text-purple-700">
                      Constantemente mejoramos nuestros servicios y adoptamos 
                      nuevas tecnologías para brindar la mejor experiencia.
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Servicio</h3>
                    <p className="text-yellow-700">
                      Nuestro equipo está siempre disponible para ayudarte y 
                      resolver cualquier consulta que puedas tener.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">¿Por qué elegirnos?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🚚</span>
                    </div>
                    <h3 className="font-semibold mb-2">Envío Rápido</h3>
                    <p className="text-gray-600 text-sm">
                      Entregamos tus productos en tiempo récord
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💳</span>
                    </div>
                    <h3 className="font-semibold mb-2">Pago Seguro</h3>
                    <p className="text-gray-600 text-sm">
                      Múltiples métodos de pago seguros
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📞</span>
                    </div>
                    <h3 className="font-semibold mb-2">Soporte 24/7</h3>
                    <p className="text-gray-600 text-sm">
                      Estamos aquí para ayudarte cuando lo necesites
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}