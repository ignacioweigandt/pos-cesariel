# Solución: Bug al Eliminar Usuarios

## 🐛 Problema Original

Al intentar eliminar un usuario después de cambiarle la contraseña, se producía el siguiente error:

```
AxiosError: Network Error
```

### Causa Raíz
El error ocurría porque el endpoint DELETE no manejaba correctamente las **restricciones de foreign key** en la base de datos. Cuando un usuario tiene registros relacionados (ventas, notificaciones, configuraciones), PostgreSQL bloquea la eliminación para mantener la integridad referencial.

## ✅ Solución Implementada

### 1. Backend - Soft Delete vs Hard Delete (`backend/routers/users.py`)

Se implementó una estrategia inteligente de eliminación:

#### Soft Delete (Usuario con registros relacionados)
- El usuario se **desactiva** en lugar de eliminarse (`is_active = False`)
- Se modifica username: `username_deleted_ID`
- Se modifica email manteniendo formato válido: `username_deleted_ID@domain.com`
- Se preserva el historial de ventas y registros asociados
- Retorna mensaje informativo al usuario

```python
if has_sales or has_notifications:
    user.is_active = False
    user.username = f"{user.username}_deleted_{user_id}"
    # Keep email format valid for Pydantic validation (username_deleted_ID@domain.com)
    email_parts = user.email.split('@')
    if len(email_parts) == 2:
        user.email = f"{email_parts[0]}_deleted_{user_id}@{email_parts[1]}"
    else:
        user.email = f"deleted_{user_id}@deleted.local"
    return {
        "message": "Usuario desactivado exitosamente (tiene registros asociados)",
        "soft_delete": True
    }
```

#### Hard Delete (Usuario sin registros)
- Eliminación completa de la base de datos
- Solo para usuarios sin ventas, notificaciones u otros registros
- Incluye manejo de errores con rollback

```python
else:
    try:
        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully", "soft_delete": False}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")
```

### 2. Backend - Endpoint Reset Password Real

Se implementó un endpoint funcional para resetear contraseñas con generación aleatoria segura:

**Endpoint**: `POST /users/{user_id}/reset-password`

**Características del generador de contraseñas**:
- 12 caracteres de longitud
- Al menos 1 mayúscula, 1 minúscula, 1 dígito, 1 carácter especial
- Generación criptográficamente segura con `secrets` module
- Cada contraseña es única y aleatoria
- Ejemplos: `&tvqzlMPp#3s`, `FIPX5b1$l0@@`, `vvNslG4y&hM3`

```python
def generate_temporary_password(length: int = 12) -> str:
    """Generate a secure random password with uppercase, lowercase, digits, and special chars."""
    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    digits = string.digits
    special = "!@#$%&*"

    # Ensure at least one of each type
    password = [
        secrets.choice(uppercase),
        secrets.choice(lowercase),
        secrets.choice(digits),
        secrets.choice(special),
    ]

    # Fill the rest randomly
    all_characters = uppercase + lowercase + digits + special
    password += [secrets.choice(all_characters) for _ in range(length - 4)]

    # Shuffle for unpredictability
    secrets.SystemRandom().shuffle(password)
    return ''.join(password)

@router.post("/{user_id}/reset-password")
async def reset_user_password(user_id: int, ...):
    temporary_password = generate_temporary_password(length=12)
    user.hashed_password = get_password_hash(temporary_password)
    db.commit()
    return {
        "message": "Password reset successfully",
        "temporary_password": temporary_password,
        "user": {...}
    }
```

### 3. Frontend - API Client (`usersApi.ts`)

Agregado método para reset de contraseña:

```typescript
resetPassword: (id: number) => 
    apiClient.post(`/users/${id}/reset-password`)
```

### 4. Frontend - Hook useUsers (`useUsers.ts`)

#### Función `deleteUser` mejorada:
```typescript
const response = await usersApi.deleteUser(id);

if (response.data?.soft_delete) {
    toast.success("Usuario desactivado exitosamente (tiene registros asociados)");
} else {
    toast.success("Usuario eliminado exitosamente");
}
```

#### Nueva función `resetPassword`:
```typescript
const resetPassword = useCallback(async (id: number) => {
    const response = await usersApi.resetPassword(id);
    const tempPassword = response.data?.temporary_password;
    
    if (tempPassword) {
        toast.success(
            `Contraseña restablecida. Nueva contraseña temporal: ${tempPassword}`,
            { duration: 10000 }
        );
    }
}, [loadUsers]);
```

### 5. Frontend - Componente (`UsersContainer.tsx`)

Reemplazado el setTimeout simulado por llamada real al API:

```typescript
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
```

## 📊 Archivos Modificados

### Backend
- ✅ `backend/routers/users.py` - Endpoint DELETE mejorado + nuevo endpoint reset-password

### Frontend
- ✅ `frontend/pos-cesariel/features/users/api/usersApi.ts` - Método resetPassword
- ✅ `frontend/pos-cesariel/features/users/hooks/useUsers.ts` - Funciones deleteUser y resetPassword
- ✅ `frontend/pos-cesariel/features/users/components/UsersContainer.tsx` - confirmResetPassword real

## 🧪 Como Probar

### Escenario 1: Usuario con Ventas (Soft Delete)
1. Crear un usuario de prueba
2. Realizar una venta con ese usuario
3. Cambiar la contraseña del usuario
4. Intentar eliminar el usuario
5. **Resultado esperado**: "Usuario desactivado exitosamente (tiene registros asociados)"

### Escenario 2: Usuario Sin Registros (Hard Delete)
1. Crear un usuario de prueba (sin hacer ventas)
2. Intentar eliminarlo
3. **Resultado esperado**: "Usuario eliminado exitosamente"

### Escenario 3: Reset de Contraseña
1. Seleccionar un usuario
2. Hacer clic en "Cambiar Contraseña"
3. Confirmar la acción
4. **Resultado esperado**: Toast con contraseña temporal aleatoria (ej: `&tvqzlMPp#3s`) visible por 10 segundos

## ✨ Beneficios de la Solución

### Integridad de Datos
- ✅ Se preserva el historial de ventas y transacciones
- ✅ No se pierde información de auditoría
- ✅ Cumple con restricciones de foreign key de PostgreSQL

### Experiencia de Usuario
- ✅ Mensajes claros y descriptivos
- ✅ Diferencia entre desactivación y eliminación
- ✅ Contraseña temporal visible por tiempo suficiente (10 segundos)
- ✅ No más errores de "Network Error"

### Seguridad
- ✅ Solo administradores pueden eliminar/desactivar usuarios
- ✅ No se puede eliminar la propia cuenta
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Transacciones con rollback en caso de error

### Mejores Prácticas
- ✅ Soft delete para registros con relaciones
- ✅ Hard delete solo cuando es seguro
- ✅ Manejo robusto de errores
- ✅ Feedback claro al usuario

## 🔧 Comandos de Prueba API

```bash
# 1. Login como admin
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"

# 2. Resetear contraseña (reemplazar TOKEN)
curl -X POST http://localhost:8000/users/5/reset-password \
  -H "Authorization: Bearer TOKEN_AQUI"

# 3. Eliminar usuario
curl -X DELETE http://localhost:8000/users/5 \
  -H "Authorization: Bearer TOKEN_AQUI"
```

## 📝 Notas Técnicas

### Relaciones del Modelo User
```python
# app/models/user.py
sales = relationship("Sale", back_populates="user")
notifications = relationship("Notification", back_populates="user")
notification_settings = relationship("NotificationSetting", back_populates="user")
```

Estas relaciones causan el constraint de foreign key cuando se intenta hacer DELETE directo.

### Verificación de Registros Relacionados
```python
has_sales = db.query(Sale).filter(Sale.user_id == user_id).count() > 0
has_notifications = db.query(Notification).filter(Notification.user_id == user_id).count() > 0
```

## 🚀 Próximos Pasos (Opcional)

- [ ] Agregar un filtro para mostrar/ocultar usuarios desactivados
- [ ] Implementar reactivación de usuarios desactivados
- [x] ✅ Generar contraseñas temporales aleatorias (IMPLEMENTADO)
- [ ] Enviar email con contraseña temporal al usuario
- [ ] Agregar logs de auditoría para cambios de contraseña
- [ ] Implementar expiración de contraseñas temporales
- [ ] Permitir al admin configurar longitud y complejidad de contraseñas

## 🔧 Notas de Corrección (v1.1)

### Fix: Email Validation Error
**Problema**: Después del soft delete, el email quedaba como `user@domain.com_deleted_4` lo cual es inválido.

**Solución**: El email ahora se modifica correctamente a `user_deleted_4@domain.com`, manteniendo un formato válido que pasa la validación de Pydantic.

**Código corregido**:
```python
email_parts = user.email.split('@')
if len(email_parts) == 2:
    user.email = f"{email_parts[0]}_deleted_{user_id}@{email_parts[1]}"
else:
    user.email = f"deleted_{user_id}@deleted.local"
```

**Migración de datos existentes**: Se ejecutó un script para corregir usuarios que ya tenían el formato incorrecto.

## 🔒 Mejora de Seguridad (v1.2)

### Generador de Contraseñas Aleatorias
**Implementación**: Se reemplazó la contraseña fija por un generador criptográficamente seguro.

**Antes**:
```python
temporary_password = "TempPass123!"  # Siempre la misma
```

**Ahora**:
```python
temporary_password = generate_temporary_password(length=12)  # Aleatoria y única
```

**Beneficios**:
- ✅ Cada reset genera una contraseña única
- ✅ Imposible predecir la contraseña generada
- ✅ Cumple con estándares de seguridad (mayúsculas, minúsculas, dígitos, especiales)
- ✅ Usa `secrets` module (criptográficamente seguro)

**Ejemplos de contraseñas generadas**:
- `&tvqzlMPp#3s`
- `FIPX5b1$l0@@`
- `vvNslG4y&hM3`
- `QlB%zcojUxX1`
- `sn!DLcpUm97x`

---

**Fecha de Implementación**: 14 de Noviembre, 2025
**Última Actualización**: 14 de Noviembre, 2025 (v1.2 - Contraseñas Aleatorias)
**Bug Resuelto**: ✅ Eliminación de usuarios después de cambio de contraseña
**Mejora Agregada**: ✅ Generador de contraseñas aleatorias seguras
**Impacto**: 🔴 Alto - Funcionalidad crítica del módulo Usuarios
