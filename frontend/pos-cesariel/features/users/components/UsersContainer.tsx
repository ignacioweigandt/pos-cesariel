/**
 * UsersContainer Component
 *
 * Main container for the Users module, orchestrating tabs and modals
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

// Hooks
import { useUsers } from "../hooks/useUsers";
import { useBranches } from "../hooks/useBranches";

// Types
import { User, UserFormData, Branch, BranchFormData } from "../types/users.types";

// Tab Components
import { UsersTab } from "./Tabs/UsersTab";
import { BranchesTab } from "./Tabs/BranchesTab";
import { RolesTab } from "./Tabs/RolesTab";

// Modal Components
import { UserViewModal } from "./Modals/UserViewModal";
import { DeleteUserModal } from "./Modals/DeleteUserModal";
import { ResetPasswordModal } from "./Modals/ResetPasswordModal";
import { BranchViewModal } from "./Modals/BranchViewModal";
import { DeleteBranchModal } from "./Modals/DeleteBranchModal";

// Form Components
import { UserFormModal } from "./Forms/UserFormModal";
import { BranchFormModal } from "./Forms/BranchFormModal";

/**
 * Users and Branches management container
 */
export function UsersContainer() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  // Custom hooks for data management
  const { users, loading, setLoading, loadUsers, deleteUser, resetPassword } = useUsers();
  const { branches, loadBranches, deleteBranch } = useBranches();

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showViewBranchModal, setShowViewBranchModal] = useState(false);
  const [showDeleteBranchModal, setShowDeleteBranchModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branchToView, setBranchToView] = useState<Branch | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);

  // UI states
  const [submittingUser, setSubmittingUser] = useState(false);
  const [submittingBranch, setSubmittingBranch] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Form states
  const [userFormData, setUserFormData] = useState<UserFormData>({
    username: "",
    email: "",
    full_name: "",
    password: "",
    role: "SELLER",
    branch_id: null,
    is_active: true,
  });

  const [branchFormData, setBranchFormData] = useState<BranchFormData>({
    name: "",
    address: "",
    phone: "",
    email: "",
    is_active: true,
  });

  useEffect(() => {
    setMounted(true);

    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/");
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Check if user has permission to access this module
      if (!["admin", "manager", "ADMIN", "MANAGER"].includes(parsedUser.role)) {
        router.push("/dashboard");
        return;
      }
    }

    // Load initial data
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadUsers(), loadBranches()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewUserModal(true);
  };

  const handleEditUser = (user: User) => {
    router.push(`/users/edit/${user.id}`);
  };

  const handleResetPassword = (user: User) => {
    setUserToResetPassword(user);
    setShowResetPasswordModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteUserModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setActionLoading(true);
    const success = await deleteUser(userToDelete.id);
    setActionLoading(false);

    if (success) {
      setShowDeleteUserModal(false);
      setUserToDelete(null);
    }
  };

  const confirmResetPassword = async () => {
    if (!userToResetPassword) return;

    setActionLoading(true);
    const success = await resetPassword(userToResetPassword.id);
    setActionLoading(false);

    if (success) {
      setShowResetPasswordModal(false);
      setUserToResetPassword(null);
    }
  };

  // Branch Actions
  const handleViewBranch = (branch: Branch) => {
    setBranchToView(branch);
    setShowViewBranchModal(true);
  };

  const handleDeleteBranch = (branch: Branch) => {
    setBranchToDelete(branch);
    setShowDeleteBranchModal(true);
  };

  const confirmDeleteBranch = async () => {
    if (!branchToDelete) return;

    setActionLoading(true);
    const success = await deleteBranch(branchToDelete.id);
    setActionLoading(false);

    if (success) {
      setShowDeleteBranchModal(false);
      setBranchToDelete(null);
    }
  };

  // Utility functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "seller":
        return "bg-green-100 text-green-800";
      case "ecommerce":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "manager":
        return "Gerente";
      case "seller":
        return "Vendedor";
      case "ecommerce":
        return "E-commerce";
      default:
        return role;
    }
  };

  const resetUserForm = () => {
    setUserFormData({
      username: "",
      email: "",
      full_name: "",
      password: "",
      role: "SELLER",
      branch_id: null,
      is_active: true,
    });
    setSelectedUser(null);
    setFormErrors({});
    setShowPassword(false);
  };

  const resetBranchForm = () => {
    setBranchFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      is_active: true,
    });
    setSelectedBranch(null);
    setFormErrors({});
  };

  const openUserModal = (userToEdit?: User) => {
    if (userToEdit) {
      setSelectedUser(userToEdit);
      setUserFormData({
        username: userToEdit.username,
        email: userToEdit.email,
        full_name: userToEdit.full_name,
        password: "",
        role: userToEdit.role,
        branch_id: userToEdit.branch_id || null,
        is_active: userToEdit.is_active,
      });
    } else {
      resetUserForm();
    }
    setShowUserModal(true);
  };

  const openBranchModal = (branchToEdit?: Branch) => {
    if (branchToEdit) {
      setSelectedBranch(branchToEdit);
      setBranchFormData({
        name: branchToEdit.name,
        address: branchToEdit.address || "",
        phone: branchToEdit.phone || "",
        email: branchToEdit.email || "",
        is_active: branchToEdit.is_active,
      });
    } else {
      resetBranchForm();
    }
    setShowBranchModal(true);
  };

  // Form Validation (kept for modal forms if still used)
  const validateUserForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!userFormData.full_name.trim()) {
      errors.full_name = "El nombre completo es requerido";
    }

    if (!userFormData.username.trim()) {
      errors.username = "El nombre de usuario es requerido";
    } else if (userFormData.username.length < 3) {
      errors.username = "El nombre de usuario debe tener al menos 3 caracteres";
    }

    if (!userFormData.email.trim()) {
      errors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(userFormData.email)) {
      errors.email = "El email no es válido";
    }

    if (!selectedUser && !userFormData.password) {
      errors.password = "La contraseña es requerida";
    } else if (userFormData.password && userFormData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateBranchForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!branchFormData.name.trim()) {
      errors.name = "El nombre de la sucursal es requerido";
    }

    if (branchFormData.email && !/\S+@\S+\.\S+/.test(branchFormData.email)) {
      errors.email = "El email no es válido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This would be implemented if using modal forms
    // For now, redirecting to separate pages for create/edit
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This would be implemented if using modal forms
    // For now, redirecting to separate pages for create/edit
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: "users", name: "Usuarios", icon: UsersIcon },
    { id: "branches", name: "Sucursales", icon: BuildingStorefrontIcon },
    { id: "roles", name: "Roles y Permisos", icon: ShieldCheckIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <UsersIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Gestión de Usuarios
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.full_name} - {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {activeTab === "users" && (
                <UsersTab
                  users={users}
                  branches={branches}
                  onView={handleViewUser}
                  onEdit={handleEditUser}
                  onResetPassword={handleResetPassword}
                  onDelete={handleDeleteUser}
                  onCreate={() => openUserModal()}
                  getRoleColor={getRoleColor}
                  getRoleLabel={getRoleLabel}
                />
              )}

              {activeTab === "branches" && (
                <BranchesTab
                  branches={branches}
                  onView={handleViewBranch}
                  onEdit={openBranchModal}
                  onCreate={() => openBranchModal()}
                  onDelete={handleDeleteBranch}
                />
              )}

              {activeTab === "roles" && <RolesTab />}
            </>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserFormModal
          user={selectedUser}
          formData={userFormData}
          branches={branches}
          formErrors={formErrors}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          submittingUser={submittingUser}
          onFormChange={setUserFormData}
          onSubmit={handleUserSubmit}
          onClose={() => {
            setShowUserModal(false);
            resetUserForm();
          }}
          getRoleLabel={getRoleLabel}
        />
      )}

      {/* Branch Modal */}
      {showBranchModal && (
        <BranchFormModal
          branch={selectedBranch}
          formData={branchFormData}
          formErrors={formErrors}
          submittingBranch={submittingBranch}
          onFormChange={setBranchFormData}
          onSubmit={handleBranchSubmit}
          onClose={() => {
            setShowBranchModal(false);
            resetBranchForm();
          }}
        />
      )}

      {/* View User Modal */}
      {showViewUserModal && selectedUser && (
        <UserViewModal
          user={selectedUser}
          onClose={() => setShowViewUserModal(false)}
          getRoleLabel={getRoleLabel}
        />
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteUserModal && userToDelete && (
        <DeleteUserModal
          user={userToDelete}
          loading={actionLoading}
          onConfirm={confirmDeleteUser}
          onCancel={() => {
            setShowDeleteUserModal(false);
            setUserToDelete(null);
          }}
        />
      )}

      {showDeleteBranchModal && branchToDelete && (
        <DeleteBranchModal
          branch={branchToDelete}
          loading={actionLoading}
          onConfirm={confirmDeleteBranch}
          onCancel={() => {
            setShowDeleteBranchModal(false);
            setBranchToDelete(null);
          }}
        />
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && userToResetPassword && (
        <ResetPasswordModal
          user={userToResetPassword}
          loading={actionLoading}
          onConfirm={confirmResetPassword}
          onCancel={() => {
            setShowResetPasswordModal(false);
            setUserToResetPassword(null);
          }}
        />
      )}

      {/* View Branch Modal */}
      {showViewBranchModal && branchToView && (
        <BranchViewModal
          branch={branchToView}
          onClose={() => setShowViewBranchModal(false)}
        />
      )}

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}
