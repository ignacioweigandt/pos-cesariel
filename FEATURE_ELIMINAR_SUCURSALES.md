# ✅ Nueva Funcionalidad: Eliminar Sucursales

## 🎯 Solicitud

**Usuario**: _"Me gustaría agregar la opción de eliminar una sucursal en la pestaña de Sucursales dentro del módulo usuarios"_

---

## 📋 Análisis de la Situación Inicial

### Estado Anterior
- ✅ Crear sucursales
- ✅ Editar sucursales
- ✅ Ver detalles de sucursales
- ❌ **NO había opción de eliminar** sucursales en la UI

### Backend
El endpoint DELETE ya existía (`/branches/{id}`), pero:
- ❌ Solo hacía **hard delete** (eliminación permanente)
- ❌ Fallaba si la sucursal tenía usuarios asignados
- ❌ No consideraba otros registros relacionados (ventas, inventario)

---

## ✅ Solución Implementada

### 1️⃣ Backend - Smart Delete Strategy

**Archivo**: `backend/routers/branches.py`

Se mejoró el endpoint DELETE para usar la misma estrategia que con usuarios:

#### Soft Delete (Sucursal con registros relacionados)
```python
@router.delete("/{branch_id}")
async def delete_branch(branch_id: int, ...):
    # Check if branch has related records
    has_users = db.query(User).filter(User.branch_id == branch_id).count() > 0
    has_sales = db.query(Sale).filter(Sale.branch_id == branch_id).count() > 0
    has_inventory = db.query(BranchStock).filter(BranchStock.branch_id == branch_id).count() > 0

    if has_users or has_sales or has_inventory:
        # Soft delete: mark as inactive
        branch.is_active = False
        branch.name = f"{branch.name} (Eliminada)"
        db.commit()

        return {
            "message": "Branch deactivated successfully (has related records)",
            "soft_delete": True,
            "branch": {...}
        }
```

**Características**:
- ✅ Marca `is_active = False`
- ✅ Agrega "(Eliminada)" al nombre para identificación
- ✅ Preserva historial de ventas, usuarios e inventario
- ✅ Retorna información sobre el tipo de eliminación

#### Hard Delete (Sucursal sin registros)
```python
    else:
        # Hard delete: no related records, safe to delete
        try:
            db.delete(branch)
            db.commit()
            return {
                "message": "Branch deleted successfully",
                "soft_delete": False
            }
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
```

---

### 2️⃣ Frontend - Modal de Confirmación

**Archivo creado**: `frontend/pos-cesariel/features/users/components/Modals/DeleteBranchModal.tsx`

```tsx
export function DeleteBranchModal({
  branch,
  loading,
  onConfirm,
  onCancel,
}: DeleteBranchModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50...">
      <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
      <h3>Confirmar Eliminación</h3>
      <p>
        ¿Estás seguro de que quieres eliminar la sucursal{" "}
        <strong>{branch.name}</strong>?
      </p>
      <p className="text-xs text-gray-400">
        Si la sucursal tiene usuarios, ventas o inventario asociado, será
        desactivada en lugar de eliminarse.
      </p>
      {/* Botones Cancelar / Eliminar */}
    </div>
  );
}
```

**Características**:
- ✅ Modal de confirmación con advertencia clara
- ✅ Indica que será soft delete si hay registros
- ✅ Spinner de loading durante el proceso
- ✅ Botón de cancelar para abortar

---

### 3️⃣ Frontend - Hook useBranches

**Archivo modificado**: `frontend/pos-cesariel/features/users/hooks/useBranches.ts`

```typescript
const deleteBranch = useCallback(async (id: number) => {
  try {
    const response = await branchesApi.deleteBranch(id);

    // Handle both soft delete and hard delete
    if (response.data?.soft_delete) {
      toast.success("Sucursal desactivada exitosamente (tiene registros asociados)");
    } else {
      toast.success("Sucursal eliminada exitosamente");
    }

    await loadBranches();
    return true;
  } catch (error: any) {
    console.error("Error deleting branch:", error);
    const errorMessage = error.response?.data?.detail || "Error al eliminar sucursal";
    toast.error(`Error: ${errorMessage}`);
    return false;
  }
}, [loadBranches]);
```

**Características**:
- ✅ Maneja soft delete y hard delete
- ✅ Mensajes diferenciados según el tipo de eliminación
- ✅ Recarga automática de la lista después de eliminar
- ✅ Manejo robusto de errores

---

### 4️⃣ Frontend - Botón de Eliminar en UI

**Archivo modificado**: `frontend/pos-cesariel/features/users/components/Tabs/BranchesTab.tsx`

```tsx
import { TrashIcon } from "@heroicons/react/24/outline";

interface BranchesTabProps {
  // ... otros props
  onDelete: (branch: Branch) => void;  // ← Nuevo
}

// En el render de cada sucursal:
<button
  onClick={() => onDelete(branch)}
  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
  title="Eliminar sucursal"
>
  <TrashIcon className="h-5 w-5" />
</button>
```

**Ubicación del botón**:
```
Cada tarjeta de sucursal muestra:
┌────────────────────────────────┐
│ Sucursal Principal      🟢     │
│ Av. Principal 123              │
│ 📞 123-456-7890                │
│ ✉️ principal@pos.com          │
│                                │
│        [✏️] [👁️] [🗑️]          │
│       Editar Ver Eliminar      │
└────────────────────────────────┘
```

---

### 5️⃣ Frontend - Integración en UsersContainer

**Archivo modificado**: `frontend/pos-cesariel/features/users/components/UsersContainer.tsx`

```typescript
// Import modal
import { DeleteBranchModal } from "./Modals/DeleteBranchModal";

// State
const [showDeleteBranchModal, setShowDeleteBranchModal] = useState(false);
const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

// Hook con deleteBranch
const { branches, loadBranches, deleteBranch } = useBranches();

// Handler
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

// Render del tab
<BranchesTab
  branches={branches}
  onView={handleViewBranch}
  onEdit={openBranchModal}
  onCreate={() => openBranchModal()}
  onDelete={handleDeleteBranch}  // ← Nuevo
/>

// Render del modal
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
```

---

## 📊 Estado Actual de Sucursales

```
================================================================================
SUCURSALES EN EL SISTEMA
================================================================================

🟢 Activa | ID: 1 | Sucursal Principal
         └─ Usuarios: 1 | Ventas: 60 | Inventario: 100
         └─ Dirección: Av. Principal 123, Ciudad

🟢 Activa | ID: 2 | Sucursal Norte
         └─ Usuarios: 1 | Ventas: 1 | Inventario: 100
         └─ Dirección: Av. Norte 456, Ciudad

🟢 Activa | ID: 3 | Sucursal VGB
         └─ Usuarios: 1 | Ventas: 7 | Inventario: 100
         └─ Dirección: los robles 112

================================================================================
Total sucursales: 3
Activas: 3
Inactivas: 0
================================================================================
```

**Nota**: Todas las sucursales actuales tienen registros asociados, por lo que al eliminarlas se aplicará **soft delete**.

---

## 🧪 Escenarios de Prueba

### ✅ Escenario 1: Sucursal con Registros (Soft Delete)
1. Navegar a Usuarios → Pestaña "Sucursales"
2. Hacer clic en botón 🗑️ de "Sucursal Norte"
3. Confirmar eliminación en modal
4. **Resultado esperado**:
   - ✅ Toast: "Sucursal desactivada exitosamente (tiene registros asociados)"
   - ✅ Sucursal marcada como 🔴 Inactiva
   - ✅ Nombre cambia a "Sucursal Norte (Eliminada)"
   - ✅ Usuarios, ventas e inventario preservados

### ✅ Escenario 2: Sucursal sin Registros (Hard Delete)
1. Crear nueva sucursal de prueba (sin asignar usuarios ni inventario)
2. Hacer clic en botón 🗑️
3. Confirmar eliminación
4. **Resultado esperado**:
   - ✅ Toast: "Sucursal eliminada exitosamente"
   - ✅ Sucursal eliminada permanentemente de la base de datos
   - ✅ No aparece en la lista

### ✅ Escenario 3: Cancelar Eliminación
1. Hacer clic en botón 🗑️
2. Hacer clic en "Cancelar" en el modal
3. **Resultado esperado**:
   - ✅ Modal se cierra
   - ✅ Sucursal permanece sin cambios

---

## 📝 Archivos Modificados

### Backend (1 archivo)
- ✅ `backend/routers/branches.py` - Mejorado endpoint DELETE con soft/hard delete

### Frontend (4 archivos creados/modificados)
- ✅ `frontend/pos-cesariel/features/users/components/Modals/DeleteBranchModal.tsx` - **NUEVO**
- ✅ `frontend/pos-cesariel/features/users/hooks/useBranches.ts` - Agregada función `deleteBranch`
- ✅ `frontend/pos-cesariel/features/users/components/Tabs/BranchesTab.tsx` - Agregado botón eliminar
- ✅ `frontend/pos-cesariel/features/users/components/UsersContainer.tsx` - Integración completa

**Nota**: El endpoint en `branchesApi.ts` ya existía, no fue necesario modificarlo.

---

## ✨ Beneficios de la Solución

### Integridad de Datos
- ✅ **Historial preservado**: Ventas, usuarios e inventario se mantienen
- ✅ **Auditoría**: Las sucursales desactivadas quedan registradas
- ✅ **Cumplimiento**: No se violan restricciones de foreign key

### Experiencia de Usuario
- ✅ **Mensajes claros**: Diferencia entre desactivación y eliminación
- ✅ **Confirmación**: Modal previene eliminaciones accidentales
- ✅ **Feedback visual**: Loading spinner durante el proceso
- ✅ **Información**: El modal advierte sobre soft delete

### Seguridad
- ✅ **Solo administradores**: Requiere rol ADMIN
- ✅ **Validación**: Verifica registros relacionados antes de eliminar
- ✅ **Rollback**: Transacciones con manejo de errores

### Consistencia
- ✅ **Mismo patrón**: Igual que eliminación de usuarios
- ✅ **Reutilización**: Código similar en usuarios y sucursales
- ✅ **Mantenibilidad**: Fácil de entender y modificar

---

## 🔄 Flujo de Eliminación

```
┌─────────────────────────────────────────────────────────────┐
│                    Usuario hace clic en 🗑️                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           Se muestra modal de confirmación                  │
│  "¿Seguro que quieres eliminar Sucursal Norte?"            │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
        Cancelar                      Confirmar
             │                            │
             ▼                            ▼
    ┌─────────────┐         ┌──────────────────────────────┐
    │ Modal cierra│         │ Backend verifica registros   │
    └─────────────┘         └──────────┬───────────────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     │                                   │
                     ▼                                   ▼
         ┌───────────────────────┐         ┌────────────────────────┐
         │ Tiene usuarios/ventas │         │ NO tiene registros     │
         │ → SOFT DELETE         │         │ → HARD DELETE          │
         │                       │         │                        │
         │ is_active = False     │         │ DELETE FROM branches   │
         │ name += "(Eliminada)" │         │ WHERE id = X           │
         └───────────┬───────────┘         └──────────┬─────────────┘
                     │                                │
                     ▼                                ▼
         ┌───────────────────────┐         ┌────────────────────────┐
         │ Toast: "Desactivada"  │         │ Toast: "Eliminada"     │
         │ (tiene registros)     │         │                        │
         └───────────┬───────────┘         └──────────┬─────────────┘
                     │                                │
                     └────────────┬───────────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │  Lista de sucursales     │
                     │  se recarga              │
                     │  automáticamente         │
                     └──────────────────────────┘
```

---

## 🚀 Próximas Mejoras Opcionales

- [ ] Filtro para mostrar/ocultar sucursales inactivas
- [ ] Función de reactivar sucursales desactivadas
- [ ] Confirmación adicional para sucursales con muchos registros
- [ ] Exportar datos de sucursal antes de eliminar
- [ ] Logs de auditoría (quién y cuándo eliminó)

---

**Fecha de Implementación**: 14 de Noviembre, 2025
**Versión**: 1.0
**Estado**: ✅ COMPLETADO Y VERIFICADO
**Impacto**: 🟢 Medio - Mejora de funcionalidad en módulo Usuarios
**Tiempo de Implementación**: ~45 minutos
