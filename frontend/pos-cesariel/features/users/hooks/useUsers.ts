/** Hook para CRUD de usuarios con soft delete y reset de contraseña */

import { useState, useCallback } from "react";
import { usersApi } from "@/lib/api";
import { User } from "../types/users.types";
import toast from "react-hot-toast";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      const response = await usersApi.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar usuarios");
    }
  }, []);

  const createUser = useCallback(async (userData: any) => {
    try {
      await usersApi.createUser(userData);
      toast.success("Usuario creado exitosamente");
      await loadUsers();
      return true;
    } catch (error: any) {
      console.error("Error creating user:", error);
      const errorMessage =
        error.response?.data?.detail || "Error al crear usuario";
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  }, [loadUsers]);

  const updateUser = useCallback(async (id: number, userData: any) => {
    try {
      await usersApi.updateUser(id, userData);
      toast.success("Usuario actualizado exitosamente");
      await loadUsers();
      return true;
    } catch (error: any) {
      console.error("Error updating user:", error);
      const errorMessage =
        error.response?.data?.detail || "Error al actualizar usuario";
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  }, [loadUsers]);

  const deleteUser = useCallback(async (id: number) => {
    try {
      const response = await usersApi.deleteUser(id);

      if (response.data?.soft_delete) {
        toast.success("Usuario desactivado exitosamente (tiene registros asociados)");
      } else {
        toast.success("Usuario eliminado exitosamente");
      }

      await loadUsers();
      return true;
    } catch (error: any) {
      console.error("Error deleting user:", error);
      const errorMessage =
        error.response?.data?.detail || "Error al eliminar usuario";
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  }, [loadUsers]);

  const resetPassword = useCallback(async (id: number) => {
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
    } catch (error: any) {
      console.error("Error resetting password:", error);
      const errorMessage =
        error.response?.data?.detail || "Error al restablecer la contraseña";
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  }, [loadUsers]);

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
