/** Hook para CRUD de usuarios con soft delete y reset de contraseña */

import { useState } from "react";
import { usersApi } from "@/lib/api";
import { User } from "../types/users.types";
import toast from "react-hot-toast";

// Type-safe user data based on backend schema
type CreateUserData = {
  username: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'SELLER' | 'ECOMMERCE';
  branch_id: number | null;
  is_active?: boolean;
};

type UpdateUserData = Partial<Omit<CreateUserData, 'password'>>;

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // React Compiler handles optimization
  const loadUsers = async () => {
    try {
      const response = await usersApi.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar usuarios");
    }
  };

  // React Compiler handles optimization
  const createUser = async (userData: CreateUserData) => {
    try {
      await usersApi.createUser(userData);
      toast.success("Usuario creado exitosamente");
      await loadUsers();
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      
      let errorMessage = "Error al crear usuario";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }
      
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  };

  // React Compiler handles optimization
  const updateUser = async (id: number, userData: UpdateUserData) => {
    try {
      await usersApi.updateUser(id, userData);
      toast.success("Usuario actualizado exitosamente");
      await loadUsers();
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      
      let errorMessage = "Error al actualizar usuario";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }
      
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  };

  // React Compiler handles optimization
  const deleteUser = async (id: number) => {
    try {
      const response = await usersApi.deleteUser(id);

      if (response.data?.soft_delete) {
        toast.success("Usuario desactivado exitosamente (tiene registros asociados)");
      } else {
        toast.success("Usuario eliminado exitosamente");
      }

      await loadUsers();
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      
      let errorMessage = "Error al eliminar usuario";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }
      
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  };

  // React Compiler handles optimization
  const resetPassword = async (id: number) => {
    try {
      const response = await usersApi.resetPassword(id);
      const tempPassword = response.data?.temporary_password;

      if (tempPassword) {
        toast.success(
          `Contraseña restablecida. Nueva contraseña temporal: ${tempPassword}`,
          { duration: 10000 }
        );
      } else {
        toast.success("Contraseña restablecida exitosamente");
      }

      await loadUsers();
      return true;
    } catch (error) {
      console.error("Error resetting password:", error);
      
      let errorMessage = "Error al restablecer la contraseña";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }
      
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  };

  return {
    users,
    loading,
    setLoading,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
  };
}
