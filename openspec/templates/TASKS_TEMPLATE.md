# Tasks: [Nombre del Cambio]

**Relacionado con:** [DESIGN_XXX.md]  
**Estimación total:** [X horas]  
**Fecha inicio:** [YYYY-MM-DD]

---

## 📋 Overview

### Fases
1. **Preparación** - [X min]
2. **Implementación** - [X horas]
3. **Testing** - [X min]
4. **Deployment** - [X min]
5. **Monitoring** - [X min]

---

## 1️⃣ FASE: Preparación

### 1.1 Setup de Entorno
- [ ] **Branch creada:** `git checkout -b feature/[nombre]`
- [ ] **Dependencies actualizadas:** `pip install -r requirements.txt` (backend)
- [ ] **Tests baseline pasando:** `make test-backend`
- [ ] **Backup de BD:** `make backup-db` (si hay cambios de schema)

**Tiempo estimado:** 5 minutos

---

### 1.2 Migración de Base de Datos (si aplica)

#### Crear migración
```bash
cd backend
make migrate-create MSG="[descripción del cambio]"

# Output esperado: backend/alembic/versions/[hash]_[description].py
```

#### Revisar archivo de migración generado
- [ ] **Verificar upgrade():** SQL es correcto
- [ ] **Verificar downgrade():** Puede revertir cambios
- [ ] **Test en local:** `make migrate-upgrade`

```python
# Ejemplo de migración:
def upgrade():
    op.add_column('products', sa.Column('new_field', sa.String(255), nullable=True))

def downgrade():
    op.drop_column('products', 'new_field')
```

**Tiempo estimado:** 15 minutos

---

## 2️⃣ FASE: Implementación

### 2.1 Backend - Models (si aplica)

**Archivo:** `backend/app/models/[domain].py`

- [ ] **Modelo creado/modificado**
  ```python
  class [ModelName](Base):
      __tablename__ = "[table_name]"
      
      id = Column(Integer, primary_key=True)
      [field1] = Column(String(255), nullable=False)
      # ...
  ```

- [ ] **Registrado en** `backend/app/models/__init__.py`
  ```python
  from app.models.[domain] import [ModelName]
  __all__ = [..., "[ModelName]"]
  ```

**Tiempo estimado:** 20 minutos

---

### 2.2 Backend - Schemas (si aplica)

**Archivo:** `backend/app/schemas/[domain].py`

- [ ] **Schemas Pydantic creados**
  ```python
  class [ModelName]Base(BaseModel):
      field1: str
      field2: Optional[int] = None
  
  class [ModelName]Create([ModelName]Base):
      pass
  
  class [ModelName]([ModelName]Base):
      id: int
      created_at: datetime
      
      class Config:
          from_attributes = True
  ```

- [ ] **Registrado en** `backend/app/schemas/__init__.py`

**Tiempo estimado:** 15 minutos

---

### 2.3 Backend - Repository (si aplica)

**Archivo:** `backend/app/repositories/[domain].py`

- [ ] **Repository implementado**
  ```python
  class [ModelName]Repository(BaseRepository[[ModelName]]):
      def __init__(self, db: Session):
          super().__init__(db, [ModelName])
      
      def get_by_[field](self, [field]: str) -> Optional[[ModelName]]:
          return self.db.query(self.model).filter(
              self.model.[field] == [field]
          ).first()
      
      # Custom methods...
  ```

**Tiempo estimado:** 30 minutos

---

### 2.4 Backend - Service (si aplica)

**Archivo:** `backend/app/services/[domain]_service.py`

- [ ] **Service con lógica de negocio**
  ```python
  class [ModelName]Service:
      def __init__(self, db: Session):
          self.db = db
          self.repository = [ModelName]Repository(db)
      
      def create_[model](self, [model]_data: [ModelName]Create) -> [ModelName]:
          # Validaciones
          # Lógica compleja
          # Llamadas a múltiples repositories
          return self.repository.create([model]_data)
  ```

**Tiempo estimado:** 45 minutos

---

### 2.5 Backend - Router (endpoint)

**Archivo:** `backend/routers/[domain].py`

- [ ] **Endpoints implementados**
  ```python
  from fastapi import APIRouter, Depends
  from app.schemas.[domain] import [ModelName], [ModelName]Create
  from app.services.[domain]_service import [ModelName]Service
  
  router = APIRouter(prefix="/[domain]", tags=["[domain]"])
  
  @router.get("/")
  def list_[models](
      skip: int = 0,
      limit: int = 100,
      db: Session = Depends(get_db),
      current_user: User = Depends(get_current_user)
  ):
      service = [ModelName]Service(db)
      return service.get_multi(skip=skip, limit=limit)
  
  @router.post("/", response_model=[ModelName])
  def create_[model](
      [model]_data: [ModelName]Create,
      db: Session = Depends(get_db),
      current_user: User = Depends(get_current_user)
  ):
      service = [ModelName]Service(db)
      return service.create_[model]([model]_data)
  ```

- [ ] **Router registrado en** `backend/main.py`
  ```python
  from routers import [domain]
  app.include_router([domain].router)
  ```

**Tiempo estimado:** 30 minutos

---

### 2.6 Frontend - Types (si aplica)

**Archivo:** `frontend/pos-cesariel/features/[feature]/types/[model].ts`

- [ ] **Interfaces TypeScript creadas**
  ```typescript
  export interface [ModelName] {
    id: number;
    field1: string;
    field2?: number;
    created_at: string;
  }
  
  export interface [ModelName]Create {
    field1: string;
    field2?: number;
  }
  ```

**Tiempo estimado:** 10 minutos

---

### 2.7 Frontend - API Client (si aplica)

**Archivo:** `frontend/pos-cesariel/features/[feature]/api/[model].ts`

- [ ] **Funciones de API implementadas**
  ```typescript
  import apiClient from '@/shared/api/client';
  import { [ModelName], [ModelName]Create } from '../types/[model]';
  
  export async function get[Models](): Promise<[ModelName][]> {
    const response = await apiClient.get('/[domain]');
    return response.data;
  }
  
  export async function create[Model](data: [ModelName]Create): Promise<[ModelName]> {
    const response = await apiClient.post('/[domain]', data);
    return response.data;
  }
  ```

**Tiempo estimado:** 15 minutos

---

### 2.8 Frontend - Hook (si aplica)

**Archivo:** `frontend/pos-cesariel/features/[feature]/hooks/use[Model].ts`

- [ ] **Hook de datos implementado**
  ```typescript
  import { useState, useEffect } from 'react';
  import { get[Models], create[Model] } from '../api/[model]';
  import { [ModelName], [ModelName]Create } from '../types/[model]';
  
  export function use[Models]() {
    const [data, setData] = useState<[ModelName][]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
      loadData();
    }, []);
    
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await get[Models]();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    const create = async (data: [ModelName]Create) => {
      const newItem = await create[Model](data);
      setData([...data, newItem]);
    };
    
    return { data, loading, error, create, refresh: loadData };
  }
  ```

**Tiempo estimado:** 20 minutos

---

### 2.9 Frontend - Component (si aplica)

**Archivo:** `frontend/pos-cesariel/features/[feature]/components/[Component].tsx`

- [ ] **Componente implementado**
  ```typescript
  import { use[Models] } from '../hooks/use[Model]';
  
  export function [Component]() {
    const { data, loading, error, create } = use[Models]();
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
      <div>
        {/* UI aquí */}
      </div>
    );
  }
  ```

**Tiempo estimado:** 45 minutos

---

## 3️⃣ FASE: Testing

### 3.1 Tests Unitarios - Backend

**Archivo:** `backend/tests/unit/test_[domain].py`

- [ ] **Tests de modelo**
  ```python
  def test_create_[model](db_session):
      [model] = [ModelName](field1="value")
      db_session.add([model])
      db_session.commit()
      
      assert [model].id is not None
      assert [model].field1 == "value"
  ```

- [ ] **Tests de repository**
  ```python
  def test_get_by_[field](db_session):
      repo = [ModelName]Repository(db_session)
      [model] = repo.get_by_[field]("value")
      
      assert [model] is not None
      assert [model].field1 == "value"
  ```

**Comando:** `pytest tests/unit/test_[domain].py -v`

**Tiempo estimado:** 30 minutos

---

### 3.2 Tests de Integración - Backend

**Archivo:** `backend/tests/integration/test_[domain]_api.py`

- [ ] **Test GET endpoint**
  ```python
  def test_list_[models](client, auth_headers_admin):
      response = client.get("/[domain]/", headers=auth_headers_admin)
      
      assert response.status_code == 200
      assert isinstance(response.json(), list)
  ```

- [ ] **Test POST endpoint**
  ```python
  def test_create_[model](client, auth_headers_admin):
      data = {"field1": "value"}
      response = client.post("/[domain]/", json=data, headers=auth_headers_admin)
      
      assert response.status_code == 200
      assert response.json()["field1"] == "value"
  ```

**Comando:** `pytest tests/integration/test_[domain]_api.py -v`

**Tiempo estimado:** 30 minutos

---

### 3.3 Linting y Code Quality

- [ ] **Backend linting**
  ```bash
  cd backend
  pylint app/ routers/ --fail-under=8.0
  ```

- [ ] **Frontend linting**
  ```bash
  cd frontend/pos-cesariel
  npm run lint
  ```

**Tiempo estimado:** 5 minutos

---

## 4️⃣ FASE: Deployment

### 4.1 Pre-Deploy Checklist

- [ ] **Tests pasando:** `make test-backend`
- [ ] **Linting OK:** pylint, eslint
- [ ] **Migrations revisadas:** (si aplica)
- [ ] **Backup de BD creado:** `make backup-db` (si hay migrations)
- [ ] **Variables de entorno verificadas** en Railway Dashboard

**Tiempo estimado:** 10 minutos

---

### 4.2 Deployment a Producción

#### Opción A: Auto-deploy (recomendado)
```bash
# Merge a main branch
git checkout main
git merge feature/[nombre]
git push origin main

# Railway auto-deploy se activa automáticamente
```

#### Opción B: Manual deploy
```bash
# Push directo a Railway
railway up -s backend
railway up -s frontend-pos
railway up -s ecommerce
```

**Tiempo estimado:** 5 minutos (auto-deploy)

---

### 4.3 Aplicar Migraciones (si aplica)

```bash
# Solo si hay cambios de schema
railway run -s backend make migrate-upgrade

# Verificar que migración aplicó correctamente
railway run -s backend make migrate-current
```

**Tiempo estimado:** 5 minutos

---

## 5️⃣ FASE: Monitoring y Verificación

### 5.1 Health Checks

- [ ] **Backend health check**
  ```bash
  curl https://backend-production-c20a.up.railway.app/health
  # Expected: {"status": "healthy", "environment": "production"}
  ```

- [ ] **Endpoint específico**
  ```bash
  curl -X GET https://backend-production-c20a.up.railway.app/[domain]/
  # Expected: 200 OK
  ```

**Tiempo estimado:** 2 minutos

---

### 5.2 Smoke Testing Manual

- [ ] **Escenario 1:** [Descripción del test]
  - Pasos: [1, 2, 3]
  - Resultado esperado: [...]

- [ ] **Escenario 2:** [Descripción del test]
  - Pasos: [1, 2, 3]
  - Resultado esperado: [...]

**Tiempo estimado:** 10 minutos

---

### 5.3 Verificación de Logs

```bash
# Ver logs de backend
railway logs -s backend

# Buscar errores
railway logs -s backend | grep ERROR
railway logs -s backend | grep CRITICAL
```

**Verificar:**
- [ ] Sin errores 500 en logs
- [ ] Sin excepciones no manejadas
- [ ] Sin warnings críticos

**Tiempo estimado:** 5 minutos

---

### 5.4 Monitoring de Métricas (primeras 24 horas)

**Railway Dashboard:**
- [ ] **CPU Usage:** Verificar que esté < 80%
- [ ] **Memory Usage:** Verificar que no haya memory leaks
- [ ] **Request Count:** Verificar patrones normales
- [ ] **Response Time:** p95 < 500ms

**PostgreSQL:**
- [ ] **Active Connections:** < 20
- [ ] **Query Latency:** Sin degradación

**Tiempo estimado:** 5 minutos cada 6 horas (día 1)

---

## ✅ Checklist Final

### Pre-Deploy
- [ ] Todos los tasks de implementación completados
- [ ] Tests unitarios pasando
- [ ] Tests de integración pasando
- [ ] Linting pasando
- [ ] Migraciones revisadas (si aplica)
- [ ] Backup de BD creado (si aplica)

### Post-Deploy
- [ ] Health checks OK
- [ ] Smoke tests OK
- [ ] Logs sin errores críticos
- [ ] Métricas dentro de lo esperado
- [ ] Features funcionando en producción

### Post-Mortem (48 horas)
- [ ] Métricas revisadas
- [ ] Feedback de cliente recopilado (si aplica)
- [ ] Learnings capturados en Engram
- [ ] Documentación actualizada
- [ ] Cambio archivado en openspec/changes/archive/

---

## 📝 Notas de Implementación

[Espacio para notas durante la implementación, decisiones tomadas, problemas encontrados, etc.]
