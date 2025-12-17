"use client";

import {
  PhotoIcon,
  RectangleStackIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface ContentTabProps {
  onManageBanners: () => void;
  onManageLogo: () => void;
  onManageSocialMedia: () => void;
}

/**
 * ContentTab Component
 *
 * Content management hub for the e-commerce platform.
 * Provides access to:
 * - Banner management (up to 3 promotional banners)
 * - Store logo configuration
 * - Social media links management
 *
 * This component serves as a dashboard to access various content
 * management modals for visual customization of the online store.
 */
export function ContentTab({
  onManageBanners,
  onManageLogo,
  onManageSocialMedia,
}: ContentTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestión de Contenido
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Administra el contenido visual de tu tienda online
          </p>
        </div>
      </div>

      {/* Content Management Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Banner Management */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <RectangleStackIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900">Banners</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Gestiona hasta 3 banners para la página principal
                </p>
              </div>
            </div>
            <div className="mt-5">
              <button
                onClick={onManageBanners}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Gestionar Banners
              </button>
            </div>
          </div>
        </div>

        {/* Store Logo */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhotoIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Logo de Tienda
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configura el logo de tu tienda online
                </p>
              </div>
            </div>
            <div className="mt-5">
              <button
                onClick={onManageLogo}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
              >
                Gestionar Logo
              </button>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Redes Sociales
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configura enlaces a redes sociales
                </p>
              </div>
            </div>
            <div className="mt-5">
              <button
                onClick={onManageSocialMedia}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Gestionar Redes Sociales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <RectangleStackIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Gestión de Contenido
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Desde esta sección puede gestionar todo el contenido visual de
                su tienda online. Configure banners promocionales, suba el logo
                de su marca y gestione enlaces a redes sociales.
              </p>
            </div>
            <div className="mt-4">
              <div className="text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Banners:</strong> Hasta 3 banners promocionales
                  </li>
                  <li>
                    <strong>Logo:</strong> Imagen representativa de su marca
                  </li>
                  <li>
                    <strong>Redes Sociales:</strong> Enlaces a sus perfiles
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
