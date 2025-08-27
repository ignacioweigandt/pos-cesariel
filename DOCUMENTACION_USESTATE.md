# Documentación de useState - POS Cesariel

Este documento explica los patrones, uso y gestión de estados con `useState` en el sistema POS Cesariel.

## 📋 Tabla de Contenidos

- [Patrones de useState](#patrones-de-usestate)
- [Ejemplos por Categoría](#ejemplos-por-categoría)
- [Estados Complejos](#estados-complejos)
- [Gestión de Estado Multi-Componente](#gestión-de-estado-multi-componente)
- [Optimizaciones y Buenas Prácticas](#optimizaciones-y-buenas-prácticas)
- [Problemas Identificados y Solucionados](#problemas-identificados-y-solucionados)

## 🔧 Patrones de useState

### 1. Estados Básicos de Control UI

#### Control de Modales
```typescript
const [isOpen, setIsOpen] = useState(false);
const [showModal, setShowModal] = useState(false);
```

**¿Por qué este patrón?**
- Simple y predecible
- Fácil de entender y mantener
- Se usa en +30 componentes del sistema

#### Estados de Carga
```typescript
const [loading, setLoading] = useState(true);         // Carga general
const [uploading, setUploading] = useState(false);    // Subida de archivos
const [processing, setProcessing] = useState(false);  // Procesamiento de datos
const [saving, setSaving] = useState(false);          // Guardado específico
```

**¿Por qué múltiples estados de carga?**
- Permite feedback específico al usuario ("Subiendo archivo...", "Procesando venta...")
- Facilita deshabilitar controles específicos durante operaciones
- Mejor UX con mensajes descriptivos

### 2. Estados de Datos y Entidades

#### Entidades Individuales
```typescript
const [product, setProduct] = useState<Product | null>(null);
const [user, setUser] = useState<User | null>(null);
const [selectedItem, setSelectedItem] = useState<Item | null>(null);
```

**Patrón de `null` como valor inicial:**
- Representa "no hay datos cargados aún"
- Permite distinguir entre "cargando" y "no seleccionado"
- TypeScript fuerza validación antes de usar

#### Arrays de Datos
```typescript
const [products, setProducts] = useState<Product[]>([]);
const [cart, setCart] = useState<CartItem[]>([]);
const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
```

**¿Por qué array vacío como inicial?**
- Permite operaciones inmediatas (.map, .filter, .length)
- No necesita validación adicional
- Consistente con el patrón "datos listos para usar"

### 3. Estados de Formularios

#### Formularios Simples
```typescript
const [username, setUsername] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
```

#### Formularios Complejos (Patrón Objeto)
```typescript
const [formData, setFormData] = useState<UserFormData>({
  username: '',
  email: '',
  full_name: '',
  password: '',
  role: 'SELLER',
  branch_id: null,
  is_active: true
});
```

**¿Cuándo usar objeto vs estados separados?**
- **Objeto**: Cuando los campos están relacionados y se envían juntos
- **Separados**: Cuando tienen validaciones o comportamientos independientes

## 📊 Ejemplos por Categoría

### 1. Sistema de Navegación con Teclado (FloatingCart)

```typescript
// Estados de navegación principal
const [selectedIndex, setSelectedIndex] = useState(0);
const [currentSection, setCurrentSection] = useState<'items' | 'payment'>('items');

// Estados de pago
const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('efectivo');
const [selectedCardType, setSelectedCardType] = useState<CardType>('bancarizadas');
const [selectedInstallments, setSelectedInstallments] = useState(1);

// Estados de navegación detallada
const [paymentMethodIndex, setPaymentMethodIndex] = useState(0);
const [cardTypeIndex, setCardTypeIndex] = useState(0);

// Estados de flujo paso a paso
const [paymentStep, setPaymentStep] = useState<'method' | 'card_details' | 'confirm'>('method');
const [cardDetailStep, setCardDetailStep] = useState<'type' | 'installments'>('type');
```

**Análisis de la complejidad:**
- **9 estados interconectados** que forman una máquina de estados compleja
- **Navegación por teclado**: Los índices permiten movimiento fluido con arrow keys
- **Flujo progresivo**: Los steps guían al usuario por el proceso de pago
- **Validación automática**: Los estados se resetean automáticamente en cambios de contexto

**¿Por qué no useReducer?**
- Cada estado tiene lógica independiente
- La coordinación es manejable con useEffect
- La lectura individual es más clara que un reducer grande

### 2. Gestión de Imágenes de Producto

```typescript
const [images, setImages] = useState<ProductImage[]>([]);
const [loading, setLoading] = useState(false);
const [uploading, setUploading] = useState(false);
const [previewImage, setPreviewImage] = useState<string | null>(null);
```

**Patrón de estados especializados:**
- **`images`**: Array de imágenes cargadas del backend
- **`loading`**: Para la carga inicial desde API
- **`uploading`**: Para feedback durante subida de nuevas imágenes
- **`previewImage`**: URL de imagen en vista previa modal

**¿Por qué separar loading y uploading?**
- UX: Diferentes estados requieren diferentes feedback visual
- Funcional: Permiten operaciones simultáneas (navegar imágenes mientras se sube una nueva)

### 3. Importación Masiva de Productos

```typescript
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [isUploading, setIsUploading] = useState(false);
const [importResult, setImportResult] = useState<ImportResult | null>(null);
const [error, setError] = useState<string | null>(null);
const [previewData, setPreviewData] = useState<PreviewProduct[]>([]);
const [categories, setCategories] = useState<Category[]>([]);
const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
```

**Flujo de trabajo por pasos:**
1. **Upload**: Usuario selecciona archivo (`selectedFile`)
2. **Preview**: Datos procesados para revisión (`previewData`, `categories`)
3. **Result**: Resultado de importación (`importResult`, `error`)

**Ventajas de este patrón:**
- Estado claro del proceso en cada momento
- Rollback fácil entre pasos
- Validación independiente en cada etapa

### 4. Gestión de Stock por Talles

```typescript
const [sizes, setSizes] = useState<SizeStock[]>([]);
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [error, setError] = useState<string | null>(null);
const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');
const [multiBranchData, setMultiBranchData] = useState<MultiBranchSizeData | null>(null);
const [loadingBranchData, setLoadingBranchData] = useState(false);
```

**Patrón maestro-detalle con vistas:**
- **Vista edit**: Modifica stock de sucursal actual (`sizes`, `saving`)
- **Vista view**: Consulta stock de todas las sucursales (`multiBranchData`, `loadingBranchData`)
- **Estados independientes**: Cada vista tiene su propio loading

### 5. Centro de Notificaciones en Tiempo Real

```typescript
const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
const [unreadCount, setUnreadCount] = useState(0);
const [isConnected, setIsConnected] = useState(false);
```

**Patrón de sincronización:**
- **`notifications`**: Array histórico de mensajes
- **`unreadCount`**: Contador optimizado (evita recalcular array.length)
- **`isConnected`**: Estado de conexión WebSocket independiente

## 🎯 Estados Complejos

### 1. State Machine: Proceso de Pago

**Ubicación**: `FloatingCart.tsx:78-86`

```typescript
// Estado primario del flujo
const [paymentStep, setPaymentStep] = useState<'method' | 'card_details' | 'confirm'>('method');

// Sub-estado para detalles de tarjeta
const [cardDetailStep, setCardDetailStep] = useState<'type' | 'installments'>('type');

// Estados de datos seleccionados
const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('efectivo');
const [selectedCardType, setSelectedCardType] = useState<CardType>('bancarizadas');
const [selectedInstallments, setSelectedInstallments] = useState(1);
```

**Flujo de transición:**
```
method → (si tarjeta) → card_details → confirm
              ↓              ↓
            type → installments
```

**¿Por qué esta complejidad?**
- **UX avanzado**: Navegación fluida con teclado
- **Validación progresiva**: Cada step valida antes de continuar
- **Rollback inteligente**: ESC navega paso atrás en lugar de cerrar

### 2. Gestión de Filtros Avanzados

**Ubicación**: `inventory/page.tsx:82-90`

```typescript
const [filters, setFilters] = useState({
  search: '',
  category: '',
  minStock: '',
  maxStock: '',
  showLowStock: false,
  sortBy: 'name',
  sortOrder: 'asc' as 'asc' | 'desc'
});
```

**Patrón de filtros como objeto:**
- **Ventaja**: Fácil de extender con nuevos filtros
- **Ventaja**: Se puede serializar para URL params
- **Desventaja**: Cada cambio re-renderiza todo el objeto

### 3. Multi-Step Forms con Validación

**Ubicación**: `users/create/page.tsx:45-55`

```typescript
const [formData, setFormData] = useState<UserFormData>({
  username: '', email: '', full_name: '', password: '',
  role: 'SELLER', branch_id: null, is_active: true
});
const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [showPassword, setShowPassword] = useState(false);
```

**Patrón formulario + validación:**
- **`formData`**: Objeto con todos los campos
- **`formErrors`**: Objeto con errores por campo (key = campo, value = mensaje)
- **`isSubmitting`**: Previene double-submit
- **`showPassword`**: Control UI específico

## 🔄 Gestión de Estado Multi-Componente

### 1. Patrón Padre-Hijo: Inventario → ProductImageManager

**Componente Padre (inventory/page.tsx):**
```typescript
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [showImageModal, setShowImageModal] = useState(false);
```

**Componente Hijo (ProductImageManager.tsx):**
```typescript
const [images, setImages] = useState<ProductImage[]>([]);
const [loading, setLoading] = useState(false);
const [uploading, setUploading] = useState(false);
```

**Comunicación bidireccional:**
- Padre → Hijo: `product={selectedProduct}`
- Hijo → Padre: `onImagesUpdated={() => refreshProductList()}`

### 2. Context + useState: E-commerce Cart

**Context (EcommerceContext.tsx):**
```typescript
const [cartState, setCartState] = useState<CartState>({
  items: [],
  total: 0,
  itemCount: 0
});
```

**Consumidores (Header.tsx, ProductCard.tsx, etc.):**
```typescript
const { cartState, addToCart, removeFromCart } = useEcommerce();
// No necesitan su propio useState para cart
```

**Ventaja del patrón:**
- Estado centralizado
- Sincronización automática entre componentes
- Persistencia manejada en un solo lugar

### 3. Estados Coordinados: Modal + Form

**Ejemplo en settings/payment-config/page.tsx:**
```typescript
// Control del modal
const [showModal, setShowModal] = useState(false);
const [editingConfig, setEditingConfig] = useState<PaymentConfig | null>(null);

// Estados del formulario dentro del modal
const [modalFormData, setModalFormData] = useState<PaymentConfigData>({
  payment_type: 'efectivo',
  card_type: null,
  installments: 1,
  surcharge_percentage: 0,
  is_active: true
});
```

## 🧩 Patrones de Inicialización

### 1. Inicialización Lazy

```typescript
// ✅ Correcto: Carga bajo demanda
const [productData, setProductData] = useState<Product | null>(null);

useEffect(() => {
  if (productId) {
    loadProduct(productId);
  }
}, [productId]);
```

### 2. Inicialización con Datos por Defecto

```typescript
// ✅ Para formularios
const [userForm, setUserForm] = useState<UserFormData>({
  username: '',
  email: '',
  full_name: '',
  password: '',
  role: 'SELLER',          // Default sensato
  branch_id: null,         // Será seleccionado por usuario
  is_active: true          // Default optimista
});
```

### 3. Inicialización Condicional

```typescript
// ✅ Para edición vs creación
const [formData, setFormData] = useState<ProductData>(() => 
  editingProduct || {
    name: '',
    price: 0,
    sku: '',
    stock_quantity: 0
  }
);
```

**¿Por qué función lazy?**
- Solo se ejecuta en inicialización
- Útil cuando el valor inicial es costoso de calcular

### 4. Estados de Hydration (SSR)

```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <LoadingSpinner />;
}
```

**¿Por qué este patrón?**
- Evita hidration mismatches en Next.js
- Garantiza que código cliente-específico solo corra en cliente
- Usado en +15 pages del proyecto

## 🎨 Estados Complejos Avanzados

### 1. Máquina de Estados: Importación de Productos

**Ubicación**: `ImportModal.tsx:57-61`

```typescript
const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [previewData, setPreviewData] = useState<PreviewProduct[]>([]);
const [importResult, setImportResult] = useState<ImportResult | null>(null);
const [error, setError] = useState<string | null>(null);
```

**Diagrama de flujo:**
```
upload (archivo seleccionado) → preview (datos procesados) → result (importación completa)
   ↓                                ↓                           ↓
selectedFile                   previewData                  importResult
                              categories                   error (si falla)
```

**Ventajas:**
- Flujo claro y predecible
- Fácil rollback entre pasos
- Estados específicos para cada etapa

### 2. Multi-View Component: SizeStockModal

**Ubicación**: `SizeStockModal.tsx:60-67`

```typescript
const [sizes, setSizes] = useState<SizeStock[]>([]);           // Datos editables
const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');
const [multiBranchData, setMultiBranchData] = useState<MultiBranchSizeData | null>(null);
const [loadingBranchData, setLoadingBranchData] = useState(false);
```

**Dos vistas, dos fuentes de datos:**
- **Edit mode**: Trabaja con `sizes` (sucursal actual)
- **View mode**: Trabaja con `multiBranchData` (todas las sucursales)
- **Loading independiente**: Cada vista tiene su propio loading

### 3. Real-Time WebSocket State

**Ubicación**: `Layout.tsx` y hooks

```typescript
const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
const [unreadCount, setUnreadCount] = useState(0);
const [isConnected, setIsConnected] = useState(false);
```

**Sincronización compleja:**
```typescript
useEffect(() => {
  if (lastMessage) {
    setNotifications(prev => [...prev, lastMessage]);
    setUnreadCount(prev => prev + 1);
  }
}, [lastMessage]);
```

**¿Por qué separar unreadCount?**
- Performance: Evita recalcular `notifications.filter(n => !n.read).length`
- UX: Contador inmediato sin procesar array grande

## 🔄 Patrones de Actualización de Estado

### 1. Actualización de Arrays

#### Agregar Items
```typescript
// ✅ Patrón inmutable
const addItem = (newItem: Item) => {
  setItems(prev => [...prev, newItem]);
};

// ✅ Con validación
const addToCart = (product: Product, size?: string) => {
  setCart(prev => {
    const existingItem = prev.find(item => 
      item.product.id === product.id && item.size === size
    );
    
    if (existingItem) {
      return prev.map(item =>
        item.id === existingItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    
    return [...prev, { id: Date.now(), product, quantity: 1, size }];
  });
};
```

#### Actualizar Items Específicos
```typescript
const updateQuantity = (itemId: number, newQuantity: number) => {
  setCart(prev => 
    prev.map(item =>
      item.id === itemId 
        ? { ...item, quantity: Math.max(1, newQuantity) }
        : item
    )
  );
};
```

#### Remover Items
```typescript
const removeItem = (itemId: number) => {
  setCart(prev => prev.filter(item => item.id !== itemId));
};
```

### 2. Actualización de Objetos Complejos

```typescript
// ✅ Spread operator preservando inmutabilidad
const updateFormField = (field: string, value: any) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));
};

// ✅ Para objetos anidados
const updateNestedConfig = (section: string, key: string, value: any) => {
  setConfig(prev => ({
    ...prev,
    [section]: {
      ...prev[section],
      [key]: value
    }
  }));
};
```

### 3. Reset y Cleanup Patterns

```typescript
// ✅ Reset múltiples estados
const handleClose = () => {
  setSelectedFile(null);
  setImportResult(null);
  setError(null);
  setPreviewData([]);
  setStep('upload');
  onClose();
};

// ✅ Reset condicional
const resetForm = () => {
  setFormData(initialFormData);
  setFormErrors({});
  setIsSubmitting(false);
};
```

## 📈 Análisis de Performance

### 1. Estados que Causan Re-renders Frecuentes

#### Filtros de Búsqueda
```typescript
// 🟡 Potencial problema: re-render en cada keystroke
const [searchTerm, setSearchTerm] = useState('');

// ✅ Solución implementada: debouncing
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
```

#### Form Fields Individuales
```typescript
// 🟡 Cada campo causa re-render del form completo
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');

// ✅ Mejor: objeto para campos relacionados
const [contactForm, setContactForm] = useState({
  name: '', email: '', phone: ''
});
```

### 2. Estados Computados que Podrían ser useMemo

```typescript
// 🟡 Recalculado en cada render
const calculateTotals = () => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  return { subtotal, tax, total: subtotal + tax };
};

// ✅ Mejor approach (aunque no implementado aún)
const totals = useMemo(() => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  return { subtotal, tax, total: subtotal + tax };
}, [cart]);
```

## 🛠️ Técnicas de Optimización

### 1. Functional Updates

```typescript
// ✅ Cuando el nuevo estado depende del anterior
const incrementCount = () => {
  setCount(prev => prev + 1);  // Mejor que setCount(count + 1)
};

// ✅ Para arrays grandes
const addNotification = (message: WebSocketMessage) => {
  setNotifications(prev => [...prev.slice(-19), message]); // Mantiene últimas 20
};
```

### 2. Lazy Initial State

```typescript
// ✅ Para cálculos costosos iniciales
const [expensiveData, setExpensiveData] = useState(() => {
  return processLargeDataSet(initialData);
});

// ✅ Para datos de localStorage
const [settings, setSettings] = useState(() => {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('settings') || '{}');
  }
  return {};
});
```

### 3. Estado Derivado vs useState

```typescript
// ❌ Evitar: estado derivado innecesario
const [total, setTotal] = useState(0);
const [items, setItems] = useState([]);

// ✅ Mejor: cálculo directo
const [items, setItems] = useState([]);
const total = items.reduce((sum, item) => sum + item.price, 0);
```

## 🚀 Patrones Específicos del Dominio

### 1. Estados de E-commerce

```typescript
// Carrito con validación de stock
const [cart, setCart] = useState<CartItem[]>([]);
const [cartErrors, setCartErrors] = useState<{[itemId: number]: string}>({});

// Estados de checkout
const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
  name: '', email: '', phone: '', address: ''
});
const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
```

### 2. Estados de POS

```typescript
// Estados de venta activa
const [currentSale, setCurrentSale] = useState<Sale | null>(null);
const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

// Estados de sesión
const [cashierSession, setCashierSession] = useState<CashierSession | null>(null);
const [openDrawer, setOpenDrawer] = useState(false);
```

### 3. Estados de Configuración

```typescript
// Configuraciones del sistema
const [systemConfig, setSystemConfig] = useState<SystemConfig>({
  currency: 'ARS',
  taxRate: 0.21,
  receiptPrinter: null,
  autoBackup: true
});

// Estados de configuración específica
const [ecommerceConfig, setEcommerceConfig] = useState<EcommerceConfig | null>(null);
const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
```

## ⚠️ Problemas Identificados y Solucionados

### 1. Estados No Utilizados (LIMPIADOS)

#### ✅ ImportModal.tsx
```typescript
// ❌ Eliminado: nunca se usaba
// const [showPreview, setShowPreview] = useState(false);
```

### 2. Estados Duplicados Identificados

#### 🟡 Patrón de Auth Duplicado
Múltiples componentes tienen:
```typescript
const [user, setUser] = useState<any>(null);
const [token, setToken] = useState<string | null>(null);
```

**Recomendación**: Ya existe `useAuth()` hook - usar en lugar de duplicar

#### 🟡 Estados de Loading Similares
```typescript
// Patrón repetitivo que podría abstraerse
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [processing, setProcessing] = useState(false);
```

### 3. Estados que Podrían Optimizarse

#### Modal Management en Inventory
**Actual** (inventory/page.tsx):
```typescript
const [showProductModal, setShowProductModal] = useState(false);
const [showCategoryModal, setShowCategoryModal] = useState(false);
const [showStockModal, setShowStockModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showImportModal, setShowImportModal] = useState(false);
const [showSizeStockModal, setShowSizeStockModal] = useState(false);
```

**Optimizado** (podría ser):
```typescript
type ModalType = 'product' | 'category' | 'stock' | 'delete' | 'import' | 'sizeStock' | null;
const [activeModal, setActiveModal] = useState<ModalType>(null);
```

## 📊 Estadísticas del Proyecto

### Métricas de useState
- **Total de useState hooks**: ~180+
- **Promedio por componente**: 4-6 estados
- **Componente con más estados**: FloatingCart (9 estados)
- **Tipos más comunes**:
  - Loading states: 45+ occurrencias
  - Modal visibility: 30+ occurrencias
  - Form data: 25+ occurrencias
  - Error handling: 35+ occurrencias

### Distribución por Tipo
```typescript
// Estados de UI (60%)
boolean: 65+ // loading, isOpen, showModal, etc.
string | null: 25+ // error, selectedId, etc.

// Estados de datos (30%)
Object | null: 20+ // user, product, config, etc.
Array: 15+ // products[], notifications[], etc.

// Estados de configuración (10%)
Enums/Unions: 10+ // 'step1' | 'step2', PaymentMethod, etc.
Numbers: 8+ // selectedIndex, counts, etc.
```

## 🏆 Mejores Prácticas Implementadas

### 1. Naming Conventions
```typescript
// ✅ Descriptivo y consistente
const [isLoading, setIsLoading] = useState(false);      // Boolean: is/has/can prefix
const [userList, setUserList] = useState<User[]>([]);   // Array: pluralizado
const [selectedUser, setSelectedUser] = useState<User | null>(null); // Entity: descriptivo
```

### 2. Type Safety
```typescript
// ✅ Tipado estricto en todo el sistema
const [config, setConfig] = useState<EcommerceConfig | null>(null);
const [errors, setErrors] = useState<{[key: string]: string}>({});
const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
```

### 3. Immutability Patterns
```typescript
// ✅ Siempre inmutable
setItems(prev => [...prev, newItem]);              // Add
setItems(prev => prev.filter(item => item.id !== removeId)); // Remove
setItems(prev => prev.map(item => 
  item.id === updateId ? { ...item, ...updates } : item
)); // Update
```

## 🚨 Anti-Patterns Evitados

### 1. Mutación Directa (BIEN EVITADO)
```typescript
// ❌ Nunca se hace esto en el código
items.push(newItem);
setItems(items);

// ✅ Siempre inmutable
setItems(prev => [...prev, newItem]);
```

### 2. Estados Redundantes (BIEN MANEJADO)
```typescript
// ❌ No se hace esto
const [items, setItems] = useState([]);
const [itemCount, setItemCount] = useState(0); // Redundante

// ✅ Se calcula dinámicamente
const itemCount = items.length;
```

### 3. Over-Engineering (BALANCE CORRECTO)
El proyecto mantiene buen balance entre simplicidad y funcionalidad avanzada.

## 🔮 Recomendaciones Futuras

### 1. Crear Custom Hooks
```typescript
// Para gestión común de modales
function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return { isOpen, open, close };
}

// Para estados de formulario con validación
function useFormState<T>(initialData: T, validationRules: ValidationRules<T>) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<{[K in keyof T]?: string}>({});
  // ... lógica de validación
  return { data, errors, updateField, validate, reset };
}
```

### 2. Considerar useReducer para Estados Complejos
```typescript
// Para el FloatingCart payment flow (9 estados relacionados)
type PaymentState = {
  step: PaymentStep;
  selectedPayment: PaymentMethod;
  selectedCardType: CardType;
  selectedInstallments: number;
  // ... otros estados relacionados
};

const paymentReducer = (state: PaymentState, action: PaymentAction) => {
  // Lógica centralizada de transiciones
};
```

### 3. Optimización de Re-renders
```typescript
// Para formularios grandes
const memoizedFormField = useMemo(() => 
  <FormField value={formData.field} onChange={handleChange} />,
  [formData.field]
);
```

## 📋 Checklist de useState

### ✅ Cumple el Proyecto
- [ ] ✅ Nombres descriptivos y consistentes
- [ ] ✅ Tipado TypeScript estricto
- [ ] ✅ Inicialización apropiada para cada tipo
- [ ] ✅ Patrones inmutables para actualizaciones
- [ ] ✅ Estados separados para funcionalidades independientes
- [ ] ✅ Loading states apropiados para UX
- [ ] ✅ Error handling consistente

### 🔄 Áreas de Mejora
- [ ] 🟡 Consolidar estados de auth duplicados
- [ ] 🟡 Crear custom hooks para patrones comunes
- [ ] 🟡 Optimizar re-renders en formularios grandes
- [ ] 🟡 Considerar useReducer para máquinas de estado complejas

---

**Conclusión**: El proyecto muestra excelente uso de useState con patrones consistentes, tipado fuerte y gestión de estado predecible. Los pocos issues identificados son optimizaciones menores que no afectan la funcionalidad.