"use client";

import {
  BookOpenIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import Layout from "@/components/layout/Layout";

// Documentation Page Component

export default function DocumentationPage() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documentación</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manuales, guías y ayuda del sistema
            </p>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <DocumentTextIcon className="mx-auto h-24 w-24 text-gray-400" />
              <h3 className="mt-6 text-xl font-medium text-gray-900">
                Módulo de Documentación
              </h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                Este módulo está en desarrollo. Próximamente encontrarás
                manuales de usuario, guías paso a paso y ayuda del sistema.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-lg mx-auto">
                <div className="relative group bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <BookOpenIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <h4 className="mt-2 font-medium text-gray-900">Manuales</h4>
                    <p className="text-sm text-gray-500">Guías de usuario</p>
                  </div>
                </div>

                <div className="relative group bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <VideoCameraIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <h4 className="mt-2 font-medium text-gray-900">
                      Tutoriales
                    </h4>
                    <p className="text-sm text-gray-500">Videos explicativos</p>
                  </div>
                </div>

                <div className="relative group bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <QuestionMarkCircleIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <h4 className="mt-2 font-medium text-gray-900">FAQ</h4>
                    <p className="text-sm text-gray-500">
                      Preguntas frecuentes
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Volver al Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
