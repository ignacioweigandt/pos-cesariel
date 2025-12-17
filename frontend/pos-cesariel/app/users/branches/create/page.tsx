"use client";

import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CheckIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  MapPinIcon,
  PhoneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { branchesApi } from "../../../../lib/api";

interface BranchFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
}

// Main Component
export default function CreateBranchPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<BranchFormData>({
    name: "",
    address: "",
    phone: "",
    email: "",
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setMounted(true);

    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
  }, [router]);

  // Form Validation
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = "El nombre de la sucursal es requerido";
    } else if (formData.name.length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.address.trim()) {
      errors.address = "La dirección es requerida";
    } else if (formData.address.length < 5) {
      errors.address = "La dirección debe tener al menos 5 caracteres";
    }

    if (formData.phone.trim() && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = "El teléfono no tiene un formato válido";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      errors.email = "El email no tiene un formato válido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Input Changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    setSubmitting(true);

    try {
      await branchesApi.createBranch(formData);
      toast.success("Sucursal creada exitosamente");
      router.push("/users");
    } catch (error: any) {
      console.error("Error creating branch:", error);

      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Error al crear la sucursal");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // JSX Return
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/users")}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Volver
              </button>
              <div className="flex items-center space-x-2">
                <BuildingStorefrontIcon className="h-6 w-6 text-indigo-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Crear Nueva Sucursal
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Section */}
                <div>
                  <h3 className="text-lg leading-6 font-medium text-black mb-4">
                    Información Básica
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-black"
                      >
                        Nombre de la Sucursal *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ej: Sucursal Centro, Sucursal Norte"
                        className={`mt-1 text-black focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                          formErrors.name ? "border-red-300" : ""
                        }`}
                      />
                      {formErrors.name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-black"
                      >
                        Dirección *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPinIcon className="h-5 w-5 text-gray-700" />
                        </div>
                        <textarea
                          id="address"
                          name="address"
                          rows={3}
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Ingresa la dirección completa de la sucursal"
                          className={`mt-1 text-black pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                            formErrors.address ? "border-red-300" : ""
                          }`}
                        />
                      </div>
                      {formErrors.address && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {formErrors.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div>
                  <h3 className="text-lg leading-6 font-medium text-black mb-4">
                    Información de Contacto
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-black"
                      >
                        Teléfono
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-700" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+54 11 1234-5678"
                          className={`mt-1 text-black pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                            formErrors.phone ? "border-red-300" : ""
                          }`}
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {formErrors.phone}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gray-800">
                        Opcional: Número de contacto de la sucursal
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-black"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <EnvelopeIcon className="h-5 w-5 text-gray-700" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="sucursal@ejemplo.com"
                          className={`mt-1 text-black pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                            formErrors.email ? "border-red-300" : ""
                          }`}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {formErrors.email}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gray-800">
                        Opcional: Email de contacto de la sucursal
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Section */}
                <div>
                  <h3 className="text-lg leading-6 font-medium text-black mb-4">
                    Estado
                  </h3>
                  <div className="flex items-center">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="is_active"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Sucursal activa
                    </label>
                  </div>
                  <div className="mt-2 flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                    <div className="text-sm text-gray-800">
                      <p>Las sucursales activas aparecerán disponibles para:</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Asignación de usuarios</li>
                        <li>Procesamiento de ventas</li>
                        <li>Gestión de inventario</li>
                        <li>Reportes y análisis</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push("/users")}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2 inline" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Crear Sucursal
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Información sobre Sucursales
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Las sucursales te permiten organizar tu negocio por
                    ubicaciones físicas. Cada sucursal puede tener usuarios
                    asignados y manejar su propio inventario y ventas.
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>El nombre debe ser descriptivo y único</li>
                    <li>La dirección es importante para reportes y entregas</li>
                    <li>
                      Los datos de contacto son opcionales pero recomendados
                    </li>
                    <li>
                      Puedes crear la sucursal inactiva y activarla después
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
