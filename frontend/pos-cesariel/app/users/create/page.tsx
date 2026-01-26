"use client";

import {
  ArrowLeftIcon,
  CheckIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { branchesApi, usersApi } from "../../../lib/api";

interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
}

interface UserFormData {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role: string;
  branch_id: number | null;
  is_active: boolean;
}

// Component
export default function CreateUserPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    full_name: "",
    password: "",
    role: "SELLER",
    branch_id: null,
    is_active: true,
  });

  // Form errors state
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setMounted(true);

    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    // Load branches
    loadBranches();
  }, [router]);

  const loadBranches = async () => {
    try {
      const response = await branchesApi.getBranches();
      setBranches(response.data);
    } catch (error) {
      console.error("Error loading branches:", error);
      toast.error("Error al cargar las sucursales");
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.full_name.trim()) {
      errors.full_name = "El nombre completo es requerido";
    }

    if (!formData.username.trim()) {
      errors.username = "El nombre de usuario es requerido";
    } else if (formData.username.length < 3) {
      errors.username = "El nombre de usuario debe tener al menos 3 caracteres";
    }

    if (!formData.email.trim()) {
      errors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "El email no tiene un formato válido";
    }

    if (!formData.password.trim()) {
      errors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.role) {
      errors.role = "El rol es requerido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "branch_id"
          ? value
            ? parseInt(value)
            : null
          : value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    setSubmitting(true);

    try {
      await usersApi.createUser(formData);
      toast.success("Usuario creado exitosamente");
      router.push("/users");
    } catch (error: any) {
      console.error("Error creating user:", error);

      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Error al crear el usuario");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to get role label
  const getRoleLabel = (role: string) => {
    const roleLabels = {
      ADMIN: "Administrador",
      MANAGER: "Gerente",
      SELLER: "Vendedor",
      ECOMMERCE: "E-commerce",
    };
    return roleLabels[role] || role;
  };

  // Render loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  // Main render
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
                <UserPlusIcon className="h-6 w-6 text-indigo-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Crear Nuevo Usuario
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
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg leading-6 font-medium text-black mb-4">
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="full_name"
                        className="block text-sm font-medium text-black"
                      >
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Ingresa el nombre completo"
                        className={`mt-1 text-black focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                          formErrors.full_name ? "border-red-300" : ""
                        }`}
                      />
                      {formErrors.full_name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {formErrors.full_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-black"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="usuario@ejemplo.com"
                        className={`mt-1 text-black focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                          formErrors.email ? "border-red-300" : ""
                        }`}
                      />
                      {formErrors.email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Information Section */}
                <div>
                  <h3 className="text-lg leading-6 font-medium text-black mb-4">
                    Información de Cuenta
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-black"
                      >
                        Nombre de Usuario *
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="nombre_usuario"
                        className={`mt-1 text-black focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                          formErrors.username ? "border-red-300" : ""
                        }`}
                      />
                      {formErrors.username && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {formErrors.username}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-black"
                      >
                        Contraseña *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Mínimo 6 caracteres"
                          className={`mt-1 text-black focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md pr-10 ${
                            formErrors.password ? "border-red-300" : ""
                          }`}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-700" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-700" />
                          )}
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {formErrors.password}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role and Branch Section */}
                <div>
                  <h3 className="text-lg leading-6 font-medium text-black mb-4">
                    Rol y Sucursal
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-black"
                      >
                        Rol *
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={`mt-1 text-black block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                          formErrors.role ? "border-red-300" : ""
                        }`}
                      >
                        <option value="SELLER">Vendedor</option>
                        <option value="MANAGER">Gerente</option>
                        <option value="ADMIN">Administrador</option>
                        <option value="ECOMMERCE">E-commerce</option>
                      </select>
                      {formErrors.role && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {formErrors.role}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="branch_id"
                        className="block text-sm font-medium text-black"
                      >
                        Sucursal
                      </label>
                      <select
                        id="branch_id"
                        name="branch_id"
                        value={formData.branch_id || ""}
                        onChange={handleInputChange}
                        className="mt-1 text-black block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">Seleccionar sucursal</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-sm text-gray-800 flex items-center">
                        <InformationCircleIcon className="h-4 w-4 mr-1" />
                        Opcional: Deja vacío para acceso a todas las sucursales
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
                      Usuario activo
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-gray-800">
                    Los usuarios inactivos no podrán acceder al sistema
                  </p>
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
                        Crear Usuario
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
