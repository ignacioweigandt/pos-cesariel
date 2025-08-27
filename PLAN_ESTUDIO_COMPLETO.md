# 📚 PLAN DE ESTUDIO COMPLETO - PROYECTO POS CESARIEL

## 📋 ÍNDICE
1. [Diagrama de Estructura del Proyecto](#-diagrama-de-estructura-del-proyecto)
2. [Resumen del Plan (12-16 semanas)](#-resumen-del-plan-12-16-semanas)
3. [FASE 2: React Fundamentals](#-fase-2-react-fundamentals---semanas-1-2)
4. [FASE 3: Next.js y Patrones Avanzados](#-fase-3-nextjs-y-patrones-avanzados---semanas-3-4)
5. [FASE 4: TypeScript](#-fase-4-typescript---paralelo-a-react)
6. [FASE 5: Estilización y UI](#-fase-5-estilización-y-ui---semanas-5-6)
7. [FASE 6: Backend con Python y FastAPI](#-fase-6-backend-con-python-y-fastapi---semanas-7-10)
8. [FASE 7: Integración y Conceptos Avanzados](#-fase-7-integración-y-conceptos-avanzados---semanas-11-12)

---

## 📁 DIAGRAMA DE ESTRUCTURA DEL PROYECTO

```
pos-cesariel/                          # 🏠 Directorio Raíz del Proyecto
├── 📊 GESTIÓN PROYECTO
│   ├── docker-compose.yml            # Orquestación de contenedores
│   ├── Makefile                      # Comandos de desarrollo
│   ├── setup.sh                      # Script de configuración automática
│   ├── check_system.sh               # Verificación de estado del sistema
│   └── *.md                          # Documentación (README, CLAUDE, etc.)
│
├── 🗄️ BACKEND (FastAPI + PostgreSQL)
│   ├── main.py                       # 🚀 Punto de entrada de la aplicación
│   ├── models.py                     # 🏗️ Modelos de base de datos (SQLAlchemy)
│   ├── schemas.py                    # 📋 Validadores Pydantic
│   ├── database.py                   # 🔌 Configuración de base de datos
│   ├── auth.py & auth_compat.py      # 🔐 Sistema de autenticación JWT
│   ├── websocket_manager.py          # 🔄 WebSockets para tiempo real
│   ├── routers/                      # 🛣️ ENDPOINTS DE API
│   │   ├── auth.py                   # Login/logout
│   │   ├── products.py               # CRUD productos
│   │   ├── sales.py                  # Sistema de ventas
│   │   ├── users.py                  # Gestión usuarios
│   │   ├── config.py                 # Configuraciones (🎯 recién modificado)
│   │   ├── ecommerce_*.py            # API e-commerce
│   │   └── websockets.py             # Conexiones WebSocket
│   ├── services/                     # 🧠 LÓGICA DE NEGOCIO
│   │   └── auth_service.py           # Servicios de autenticación
│   ├── config/                       # ⚙️ CONFIGURACIÓN
│   │   └── settings.py               # Variables de entorno
│   ├── exceptions/                   # 🚨 MANEJO DE ERRORES
│   ├── utils/                        # 🛠️ UTILIDADES
│   ├── tests/                        # 🧪 PRUEBAS AUTOMATIZADAS
│   │   ├── unit/                     # Pruebas unitarias
│   │   └── integration/              # Pruebas de integración
│   └── requirements.txt              # 📦 Dependencias Python
│
├── 💻 FRONTEND POS (Next.js 15 - Puerto 3000)
│   └── pos-cesariel/
│       ├── app/                      # 📱 APP ROUTER (Next.js 13+)
│       │   ├── layout.tsx            # Layout principal
│       │   ├── page.tsx              # Página de login
│       │   ├── dashboard/            # Panel principal
│       │   ├── pos/                  # 🛒 Punto de venta
│       │   ├── inventory/            # 📦 Gestión de inventario
│       │   ├── settings/             # ⚙️ Configuraciones (🎯 simplificadas)
│       │   │   ├── currency/         # Configuración moneda
│       │   │   ├── payment-methods/  # Métodos de pago
│       │   │   ├── tax-rates/        # Impuestos
│       │   │   ├── notifications/    # Notificaciones
│       │   │   └── security-backups/ # Seguridad y respaldos
│       │   ├── reports/              # 📊 Reportes
│       │   └── users/                # 👥 Gestión usuarios
│       ├── components/               # 🧩 COMPONENTES REUTILIZABLES
│       ├── lib/                      # 📚 LIBRERÍAS CORE
│       │   ├── api.ts                # Cliente HTTP (Axios)
│       │   ├── auth.ts               # Manejo de autenticación
│       │   └── websocket.ts          # Cliente WebSocket
│       ├── __tests__/                # 🧪 PRUEBAS
│       │   ├── components/           # Pruebas componentes (Jest + RTL)
│       │   └── cypress/              # Pruebas E2E
│       └── package.json              # Dependencias Node.js
│
├── 🛍️ FRONTEND E-COMMERCE (Next.js 15 - Puerto 3001)
│   └── ecommerce/
│       ├── app/                      # 🌐 TIENDA ONLINE
│       │   ├── productos/            # Catálogo de productos
│       │   ├── carrito/              # Carrito de compras
│       │   ├── context/              # Estado global React
│       │   │   ├── CartContext.tsx   # Manejo del carrito
│       │   │   └── EcommerceContext.tsx # Estado e-commerce
│       │   ├── components/           # Componentes específicos
│       │   │   └── modals/           # Modales (carrito, checkout)
│       │   └── lib/
│       │       ├── api.ts            # Cliente API
│       │       └── data-service.ts   # Capa de caché (5 min)
│       ├── components/ui/            # 🎨 COMPONENTES UI (shadcn/ui + Radix)
│       ├── services/                 # Servicios API centralizados
│       └── package.json              # Dependencias (React 19, Radix UI)
│
└── 📚 DOCUMENTACIÓN
    └── docs/
        ├── arquitectura/             # Documentación técnica
        ├── casos-de-uso/             # Casos de uso
        ├── metricas/                 # Estadísticas del proyecto
        └── presentacion/             # Material de tesis
```

---

## 🎯 RESUMEN DEL PLAN (12-16 SEMANAS)

| Fase | Duración | Tecnologías | Objetivo |
|------|----------|-------------|----------|
| **FASE 1** | ✅ **Completada** | HTML, CSS, JavaScript | Base sólida |
| **FASE 2** | Semanas 1-2 | **React Fundamentals** | Entender componentes |
| **FASE 3** | Semanas 3-4 | **Next.js Avanzado** | App Router, routing |
| **FASE 4** | Paralelo | **TypeScript** | Tipado estático |
| **FASE 5** | Semanas 5-6 | **Tailwind + Radix UI** | Estilización moderna |
| **FASE 6** | Semanas 7-10 | **Python + FastAPI** | Backend APIs |
| **FASE 7** | Semanas 11-12 | **Integración** | Full-stack connection |

---

## 🚀 FASE 2: REACT FUNDAMENTALS - Semanas 1-2

### **Concepto 1: Componentes Funcionales**

**¿Qué es?** Un componente es una función que retorna JSX (HTML dentro de JavaScript).

**En tu código, mira este ejemplo:**
```typescript
// archivo: frontend/pos-cesariel/app/settings/currency/page.tsx (líneas 43-47)
export default function CurrencyPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      {/* Tu interfaz aquí */}
    </div>
  );
}
```

**Ejercicio práctico:**
1. Abre `frontend/pos-cesariel/app/settings/currency/page.tsx`
2. Ve cómo está estructurado el componente
3. Identifica: ¿dónde empieza la función? ¿qué retorna?

### **Concepto 2: Props (Propiedades)**

**¿Qué son?** Datos que se pasan de un componente padre a un componente hijo.

**En tu código:**
```typescript
// Si miras cualquier componente, verás props como:
interface PaymentConfig {
  id: number;
  payment_type: string;
  surcharge_percentage: number;
  is_active: boolean;
}

// Y se usan así:
{paymentConfigs.map((config) => (
  <div key={config.id}>  {/* config es una prop */}
    <h3>{config.payment_type}</h3>  {/* Usando la prop */}
  </div>
))}
```

### **Concepto 3: Estado (useState)**

**¿Qué es?** Variables que pueden cambiar y hacer que el componente se vuelva a renderizar.

**En tu código real:**
```typescript
// archivo: frontend/pos-cesariel/app/settings/payment-methods/page.tsx (líneas 40-44)
const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [hasChanges, setHasChanges] = useState(false);
```

**¿Cómo funciona?**
- `paymentConfigs` = valor actual
- `setPaymentConfigs` = función para cambiar el valor
- `useState([])` = valor inicial (array vacío)

### **Concepto 4: Efectos (useEffect)**

**¿Qué es?** Código que se ejecuta cuando el componente se monta o cuando cambian ciertas variables.

**En tu código:**
```typescript
// archivo: frontend/pos-cesariel/app/settings/payment-methods/page.tsx (líneas 46-58)
useEffect(() => {
  if (!user) {
    router.push('/');  // Si no hay usuario, redirigir
    return;
  }

  if (!['admin', 'manager'].includes(user.role)) {
    toast.error('No tienes permisos');
    return;
  }

  loadData();  // Cargar datos cuando el componente se monta
}, [user, router]);  // Se ejecuta cuando 'user' o 'router' cambian
```

### **Concepto 5: Event Handling (Manejo de Eventos)**

**¿Qué es?** Responder a clicks, cambios de input, etc.

**En tu código:**
```typescript
// archivo: frontend/pos-cesariel/app/settings/payment-methods/page.tsx
const handleUpdateSurcharge = (id: number, surcharge: number) => {
  // Lógica para actualizar el recargo
  setPaymentConfigs(prev => 
    prev.map(c => c.id === id ? {...c, surcharge_percentage: surcharge} : c)
  );
  setHasChanges(true);
};

// Y se usa en el JSX:
<input
  type="number"
  value={config.surcharge_percentage}
  onChange={(e) => handleUpdateSurcharge(config.id, parseFloat(e.target.value) || 0)}
/>
```

## 🎯 EJERCICIOS PRÁCTICOS CON TU CÓDIGO

### **Ejercicio 1: Explorar un Componente Completo**
1. Abre `frontend/pos-cesariel/app/settings/payment-methods/page.tsx`
2. Identifica:
   - ¿Cuáles son todos los `useState` que se usan?
   - ¿Qué hace el `useEffect`?
   - ¿Cuáles son las funciones de manejo de eventos?

### **Ejercicio 2: Rastrear el Flujo de Datos**
1. Busca donde se llama `setHasChanges(true)` 
2. Encuentra donde se usa `hasChanges` en el JSX
3. Ve cómo esto hace aparecer/desaparecer la barra amarilla de "cambios sin guardar"

### **Ejercicio 3: Entender el Rendering Condicional**
```typescript
// En tu código verás patrones como:
{hasChanges && (
  <div className="bg-yellow-50">
    {/* Esta sección solo aparece cuando hasChanges es true */}
  </div>
)}

{loading ? (
  <div>Cargando...</div>  // Si loading=true, muestra esto
) : (
  <div>Contenido</div>    // Si loading=false, muestra esto
)}
```

## 📚 RECURSOS PARA ESTA SEMANA

### **Documentación Oficial:**
- **React.dev**: https://react.dev/learn
- **Capítulos importantes**: "Thinking in React", "State", "Effects"

### **Práctica con tu Código:**
1. **Lee y entiende** `app/settings/currency/page.tsx` (más simple)
2. **Luego analiza** `app/settings/payment-methods/page.tsx` (más complejo)
3. **Experimenta**: Cambia algunos valores y ve qué pasa

### **Conceptos Clave a Dominar:**

✅ **Componentes funcionales** - Funciones que retornan JSX
✅ **Props** - Datos que se pasan entre componentes  
✅ **Estado (useState)** - Variables que pueden cambiar
✅ **Efectos (useEffect)** - Código que se ejecuta en ciertos momentos
✅ **Event handlers** - Funciones que responden a eventos
✅ **Rendering condicional** - Mostrar/ocultar elementos según condiciones

## 🎯 META DE LA SEMANA

**Al final de esta semana deberías poder:**
1. **Leer cualquier componente** de tu proyecto y entender qué hace
2. **Identificar el estado** y cómo se modifica
3. **Seguir el flujo** desde un evento (click) hasta el cambio en la UI
4. **Entender** por qué se re-renderiza un componente

---

## 🔥 FASE 3: NEXT.JS Y PATRONES AVANZADOS - Semanas 3-4

### **Concepto 1: App Router (Next.js 13+)**

**¿Qué es?** El nuevo sistema de rutas basado en carpetas que usa tu proyecto.

**En tu código:**
```
app/
├── page.tsx              # Ruta: / (login)
├── dashboard/
│   └── page.tsx          # Ruta: /dashboard
├── settings/
│   ├── page.tsx          # Ruta: /settings
│   ├── currency/
│   │   └── page.tsx      # Ruta: /settings/currency
│   └── payment-methods/
│       └── page.tsx      # Ruta: /settings/payment-methods
```

**Concepto clave:**
- Cada carpeta = segmento de ruta
- `page.tsx` = página accesible
- `layout.tsx` = layout compartido

### **Concepto 2: Layouts**

**¿Qué es?** Componentes que envuelven páginas y se comparten entre rutas.

**En tu código:**
```typescript
// archivo: frontend/pos-cesariel/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>  {/* Proveedor de autenticación global */}
          {children}    {/* Aquí se renderizan las páginas */}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### **Concepto 3: Navigation (useRouter)**

**¿Qué es?** Hook para navegar programáticamente entre páginas.

**En tu código:**
```typescript
// archivo: frontend/pos-cesariel/app/settings/currency/page.tsx
import { useRouter } from 'next/navigation';

export default function CurrencyPage() {
  const router = useRouter();
  
  // Navegar a otra página
  const goToSettings = () => {
    router.push('/settings');
  };
  
  // Redirigir si no tiene permisos
  useEffect(() => {
    if (!user) {
      router.push('/');  // Ir al login
    }
  }, [user, router]);
}
```

### **Concepto 4: Custom Hooks**

**¿Qué es?** Funciones que encapsulan lógica de React reutilizable.

**En tu código:**
```typescript
// archivo: frontend/pos-cesariel/lib/auth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Lógica de autenticación...
  
  return { user, loading, login, logout };
}

// Y se usa en componentes:
export default function SomePage() {
  const { user, loading } = useAuth();  // ¡Hook personalizado!
  
  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>No autenticado</div>;
  
  return <div>Hola {user.name}</div>;
}
```

### **Concepto 5: Estado Global (Context API)**

**¿Qué es?** Compartir estado entre componentes sin pasar props manualmente.

**En tu proyecto e-commerce:**
```typescript
// archivo: ecommerce/app/context/CartContext.tsx
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
  };
  
  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook para usar el contexto
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
```

## 🎯 EJERCICIOS PRÁCTICOS

### **Ejercicio 1: Seguir el Routing**
1. Abre tu aplicación en `http://localhost:3000`
2. Navega de `/settings` a `/settings/currency`
3. Mira los archivos correspondientes y ve cómo se mapean las URLs

### **Ejercicio 2: Analizar el Layout**
1. Abre `frontend/pos-cesariel/app/layout.tsx`
2. Identifica qué componentes están disponibles en toda la app
3. Ve cómo se usa `{children}` para renderizar las páginas

### **Ejercicio 3: Estudiar useAuth**
1. Abre `frontend/pos-cesariel/lib/auth.ts`
2. Ve cómo se implementa el hook personalizado
3. Busca donde se usa `useAuth()` en otros componentes

### **Ejercicio 4: Entender el Context del E-commerce**
1. Abre `ecommerce/app/context/CartContext.tsx`
2. Ve cómo se maneja el estado del carrito
3. Busca donde se usa `useCart()` en componentes

## 📚 RECURSOS PARA ESTA SEMANA

### **Documentación:**
- **Next.js App Router**: https://nextjs.org/docs/app
- **React Context**: https://react.dev/reference/react/useContext

### **Archivos clave a estudiar:**
1. `frontend/pos-cesariel/app/layout.tsx` - Layout principal
2. `frontend/pos-cesariel/lib/auth.ts` - Hook de autenticación
3. `ecommerce/app/context/CartContext.tsx` - Context del carrito
4. Cualquier `page.tsx` - Ve el patrón de páginas

## 🎯 META DE LA SEMANA

**Al final deberías entender:**
1. **Cómo funciona el routing** basado en carpetas
2. **Qué son los layouts** y cómo se comparten
3. **Cómo crear y usar custom hooks** como `useAuth()`
4. **Qué es Context** y cuándo usarlo vs props
5. **Navegación programática** con `useRouter`

---

## 📝 FASE 4: TYPESCRIPT - Paralelo a React

### **¿Por qué TypeScript en tu proyecto?**

TypeScript añade **tipado estático** a JavaScript, lo que significa que defines qué tipo de datos espera cada variable/función. Esto previene muchos errores y hace el código más legible.

### **Concepto 1: Tipos Básicos**

**En tu código verás:**
```typescript
// Tipos primitivos
const loading: boolean = true;
const count: number = 42;
const message: string = "Hola";

// Arrays
const ids: number[] = [1, 2, 3];
const names: string[] = ["Ana", "Luis"];
```

### **Concepto 2: Interfaces**

**¿Qué son?** Definen la "forma" que debe tener un objeto.

**En tu código:**
```typescript
// archivo: frontend/pos-cesariel/app/settings/payment-methods/page.tsx
interface PaymentConfig {
  id: number;
  payment_type: string;
  card_type?: string;        // ? significa opcional
  installments: number;
  surcharge_percentage: number;
  is_active: boolean;
  description?: string;
}

// Uso:
const config: PaymentConfig = {
  id: 1,
  payment_type: "tarjeta",
  installments: 3,
  surcharge_percentage: 8.0,
  is_active: true
  // card_type y description son opcionales
};
```

### **Concepto 3: Tipos de Funciones**

**En tu código:**
```typescript
// Función con tipos de parámetros y retorno
const handleUpdateSurcharge = (id: number, surcharge: number): void => {
  // void = no retorna nada
  setPaymentConfigs(prev => 
    prev.map(c => c.id === id ? {...c, surcharge_percentage: surcharge} : c)
  );
};

// Función que retorna algo
const calculateTotal = (price: number, tax: number): number => {
  return price * (1 + tax / 100);
};
```

### **Concepto 4: Generics**

**¿Qué son?** Tipos que pueden ser "parametrizados".

**En tu código:**
```typescript
// useState es un generic
const [configs, setConfigs] = useState<PaymentConfig[]>([]);
//                                   ^^^^^^^^^^^^^^^^^^^
//                                   Le decimos que configs será un array de PaymentConfig

// También verás:
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

// Uso:
const response: ApiResponse<PaymentConfig[]> = await api.get('/payment-config');
```

### **Concepto 5: Union Types**

**¿Qué son?** Un valor que puede ser de varios tipos.

**En tu código:**
```typescript
// Un valor puede ser string O null
const user: User | null = getUser();

// Un status puede ser una de estas opciones
type Status = 'loading' | 'success' | 'error';
const [status, setStatus] = useState<Status>('loading');

// Props opcionales
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}
```

## 🎯 EJERCICIOS PRÁCTICOS

### **Ejercicio 1: Leer Interfaces**
1. Abre `frontend/pos-cesariel/app/settings/payment-methods/page.tsx`
2. Encuentra todas las interfaces definidas
3. Ve cómo se usan en el código

### **Ejercicio 2: Seguir los Tipos**
1. Mira la función `handleUpdateSurcharge`
2. Ve qué tipos recibe como parámetros
3. Sigue cómo se usa `PaymentConfig[]` en el useState

### **Ejercicio 3: Entender Generics**
1. Busca todos los `useState<...>` en un archivo
2. Ve qué tipo se especifica en cada uno
3. Entiende por qué es importante especificar el tipo

## 📚 RECURSOS

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **React + TypeScript**: https://react.dev/learn/typescript

---

## 🎨 FASE 5: ESTILIZACIÓN Y UI - Semanas 5-6

### **Concepto 1: Tailwind CSS (Utility-first)**

**¿Qué es?** En lugar de escribir CSS, usas clases predefinidas.

**En tu código:**
```typescript
// Tradicional CSS:
// .button { background-color: blue; padding: 8px 16px; border-radius: 4px; }

// Tailwind:
<button className="bg-blue-500 px-4 py-2 rounded">
  Guardar
</button>
```

**Clases comunes en tu código:**
```typescript
// archivo: frontend/pos-cesariel/app/settings/currency/page.tsx
<div className="space-y-6">        // margin-top entre hijos
  <div className="bg-white shadow rounded-lg p-6">  // fondo, sombra, bordes, padding
    <h1 className="text-2xl font-bold text-black">  // tamaño, peso, color
      Configuración de Moneda
    </h1>
  </div>
</div>
```

### **Concepto 2: Responsive Design**

**En tu código:**
```typescript
// Responsive classes: sm: md: lg: xl:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  // 1 columna en móvil, 2 en tablet, 3 en desktop
</div>

<div className="w-full md:w-1/2">  // ancho completo en móvil, mitad en desktop
```

### **Concepto 3: Estados y Interacciones**

**En tu código:**
```typescript
// Hover, focus, active, disabled
<button className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
  
// Peer (sibling interactions)
<input className="sr-only peer" type="checkbox" />
<div className="peer-checked:bg-blue-600">  // cambia cuando el input está checked
```

### **Concepto 4: Componentes UI con Radix (E-commerce)**

**¿Qué es Radix?** Componentes accesibles sin estilos que puedes personalizar.

**En tu e-commerce:**
```typescript
// archivo: ecommerce/components/ui/button.tsx
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Uso:
<Button variant="destructive" size="lg">
  Eliminar
</Button>
```

### **Concepto 5: shadcn/ui Pattern**

**¿Qué es?** Sistema de componentes copy-paste basado en Radix + Tailwind.

**En tu e-commerce:**
```typescript
// Los componentes están en ecommerce/components/ui/
// Se copian al proyecto y se pueden personalizar completamente

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// Uso combinado:
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Configurar Producto</DialogTitle>
    </DialogHeader>
    <Input placeholder="Nombre del producto" />
    <Button>Guardar</Button>
  </DialogContent>
</Dialog>
```

## 🎯 EJERCICIOS PRÁCTICOS

### **Ejercicio 1: Decodificar Tailwind**
1. Abre `frontend/pos-cesariel/app/settings/payment-methods/page.tsx`
2. Encuentra esta línea:
```typescript
className="bg-white shadow rounded-lg p-6"
```
3. Traduce cada clase:
   - `bg-white` = fondo blanco
   - `shadow` = sombra sutil
   - `rounded-lg` = bordes redondeados grandes
   - `p-6` = padding de 6 unidades (24px)

### **Ejercicio 2: Analizar Componentes Responsive**
1. Busca clases como `md:grid-cols-2 lg:grid-cols-5`
2. Ve cómo cambia el layout en diferentes tamaños
3. Redimensiona el navegador para ver el efecto

### **Ejercicio 3: Estudiar shadcn/ui**
1. Abre `ecommerce/components/ui/button.tsx`
2. Ve cómo se definen las variantes
3. Busca dónde se usa el Button en la aplicación

## 📚 RECURSOS

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/docs/primitives
- **shadcn/ui**: https://ui.shadcn.com/docs

---

## 🐍 FASE 6: BACKEND CON PYTHON Y FASTAPI - Semanas 7-10

### **Concepto 1: FastAPI Básico**

**¿Qué es FastAPI?** Framework web moderno para Python, similar a Express en Node.js pero con validación automática.

**En tu código:**
```python
# archivo: backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="POS Cesariel API",
    description="API para el sistema POS",
    version="1.0.0"
)

# CORS para permitir requests desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Tus frontends
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Incluir routers
from routers import auth, products, sales, config
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(config.router)  # El que modificamos juntos
```

### **Concepto 2: Routers y Endpoints**

**¿Qué son?** Organizan las rutas de la API por funcionalidad.

**En tu código:**
```python
# archivo: backend/routers/config.py
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(
    prefix="/config",           # Todas las rutas empiezan con /config
    tags=["config"],           # Para documentación
)

@router.get("/payment-config")  # GET /config/payment-config
async def get_payment_configs(
    db: Session = Depends(get_db),                    # Inyección de dependencia
    current_user: User = Depends(get_current_active_user)  # Requiere autenticación
):
    """Obtener configuraciones de pago"""
    configs = get_payment_configs()
    return configs

@router.put("/payment-config/{config_id}")  # PUT /config/payment-config/1
async def update_payment_config(
    config_id: int,                              # Parámetro de la URL
    config_data: PaymentConfigUpdate,           # Datos del body (JSON)
    current_user: User = Depends(admin_or_manager_required)
):
    """Actualizar configuración de pago"""
    updated_config = update_payment_config_in_store(config_id, config_data.dict())
    return updated_config
```

### **Concepto 3: Modelos de Base de Datos (SQLAlchemy)**

**¿Qué son?** Representan las tablas de la base de datos como clases Python.

**En tu código:**
```python
# archivo: backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Decimal
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(Enum(UserRole), default=UserRole.SELLER)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    
    # Relación: un usuario pertenece a una sucursal
    branch = relationship("Branch", back_populates="users")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    price = Column(Decimal(10, 2), nullable=False)  # Precio con 2 decimales
    stock = Column(Integer, default=0)
    show_in_ecommerce = Column(Boolean, default=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    
    # Relación: un producto tiene una categoría
    category = relationship("Category", back_populates="products")
```

### **Concepto 4: Schemas (Pydantic)**

**¿Qué son?** Validan y serializan los datos de entrada/salida de la API.

**En tu código:**
```python
# archivo: backend/schemas.py
from pydantic import BaseModel, validator
from typing import Optional
from decimal import Decimal

class PaymentConfigBase(BaseModel):
    payment_type: str
    card_type: Optional[str] = None
    installments: int = 1
    surcharge_percentage: Decimal = 0
    is_active: bool = True
    description: Optional[str] = None

class PaymentConfigCreate(PaymentConfigBase):
    """Para crear nueva configuración"""
    pass

class PaymentConfigUpdate(BaseModel):
    """Para actualizar - todos los campos opcionales"""
    payment_type: Optional[str] = None
    surcharge_percentage: Optional[Decimal] = None
    is_active: Optional[bool] = None
    
    @validator('surcharge_percentage')
    def validate_surcharge(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError('El recargo debe estar entre 0 y 100')
        return v

class PaymentConfig(PaymentConfigBase):
    """Para respuesta - incluye ID y timestamps"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # Para convertir desde modelos SQLAlchemy
```

### **Concepto 5: Dependency Injection**

**¿Qué es?** Sistema para inyectar dependencias (DB, autenticación, etc.) en los endpoints.

**En tu código:**
```python
# archivo: backend/database.py
def get_db():
    """Dependency que proporciona una sesión de base de datos"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# archivo: backend/auth_compat.py
def get_current_active_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Dependency que valida el token JWT y retorna el usuario"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# archivo: backend/routers/config.py
def admin_or_manager_required(current_user: User = Depends(get_current_active_user)):
    """Dependency que requiere rol admin o manager"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return current_user
```

## 🎯 EJERCICIOS PRÁCTICOS

### **Ejercicio 1: Seguir un Endpoint Completo**
1. Ve a `http://localhost:8000/docs` (documentación automática)
2. Encuentra el endpoint `PUT /config/payment-config/{config_id}`
3. Sigue el código desde `routers/config.py` hasta la función que lo maneja
4. Ve qué dependencies se inyectan

### **Ejercicio 2: Entender Models vs Schemas**
1. Compara `models.py` y `schemas.py`
2. Ve la diferencia entre:
   - `PaymentConfig` (modelo de DB) 
   - `PaymentConfigUpdate` (schema de entrada)
   - `PaymentConfigSchema` (schema de salida)

### **Ejercicio 3: Rastrear la Autenticación**
1. Mira cómo funciona `get_current_active_user`
2. Ve cómo se usa en los endpoints
3. Entiende el flujo: Token JWT → Usuario → Validación de rol

### **Ejercicio 4: Analizar la Función que Modificamos**
1. Abre `backend/routers/config.py`
2. Ve la función `update_payment_config`
3. Entiende el flujo:
   - Recibe `config_id` de la URL
   - Recibe `config_data` del body JSON
   - Valida los datos con Pydantic
   - Actualiza en el almacén global
   - Retorna la configuración actualizada

## 📚 RECURSOS

- **FastAPI**: https://fastapi.tiangolo.com/tutorial/
- **SQLAlchemy**: https://docs.sqlalchemy.org/en/20/tutorial/
- **Pydantic**: https://docs.pydantic.dev/latest/

---

## 🔗 FASE 7: INTEGRACIÓN Y CONCEPTOS AVANZADOS - Semanas 11-12

### **Concepto 1: Comunicación Frontend-Backend**

**¿Cómo se conecta todo?** Tu frontend hace requests HTTP al backend usando Axios.

**El flujo completo:**
```typescript
// 1. Frontend: Usuario hace click en "Guardar Cambios"
// archivo: frontend/pos-cesariel/app/settings/payment-methods/page.tsx

const handleSaveChanges = async () => {
  try {
    setSaving(true);
    
    // 2. Frontend: Encuentra qué configuraciones cambiaron
    const changedConfigs = paymentConfigs.filter(config => {
      const original = originalPaymentConfigs.find(orig => orig.id === config.id);
      return original && (
        original.surcharge_percentage !== config.surcharge_percentage ||
        original.is_active !== config.is_active
      );
    });

    // 3. Frontend: Hace requests al backend para cada cambio
    const updatePromises = changedConfigs.map(config =>
      configApi.updatePaymentConfig(config.id, {
        surcharge_percentage: config.surcharge_percentage,
        is_active: config.is_active
      })
    );

    await Promise.all(updatePromises);
    
    // 6. Frontend: Actualiza el estado local
    setOriginalPaymentConfigs(JSON.parse(JSON.stringify(paymentConfigs)));
    setHasChanges(false);
    
    toast.success(`Configuración guardada (${changedConfigs.length} cambios)`);
  } catch (error) {
    toast.error('Error guardando configuración');
  }
};
```

```typescript
// archivo: frontend/pos-cesariel/lib/api.ts
export const configApi = {
  updatePaymentConfig: (id: number, data: any) => 
    api.put(`/config/payment-config/${id}`, data),  // 4. HTTP PUT request
}
```

```python
# 5. Backend: Procesa la request
# archivo: backend/routers/config.py

@router.put("/payment-config/{config_id}")
async def update_payment_config(
    config_id: int,
    config_data: PaymentConfigUpdate,
    current_user: User = Depends(admin_or_manager_required)
):
    # Valida los datos automáticamente con Pydantic
    update_data = config_data.dict(exclude_unset=True)
    
    # Actualiza en el almacén global
    updated_config = update_payment_config_in_store(config_id, update_data)
    
    return updated_config  # Respuesta JSON al frontend
```

### **Concepto 2: Autenticación JWT**

**¿Cómo funciona el login?**

```typescript
// 1. Usuario ingresa credenciales
// archivo: frontend/pos-cesariel/lib/auth.ts

const login = async (username: string, password: string) => {
  try {
    // 2. Frontend envía credenciales al backend
    const response = await authApi.login({ username, password });
    
    // 4. Frontend recibe y guarda el token
    const { access_token, user } = response.data;
    localStorage.setItem('token', access_token);
    setUser(user);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Credenciales inválidas' };
  }
};
```

```python
# 3. Backend valida y genera JWT
# archivo: backend/routers/auth.py

@router.post("/login-json")
async def login_json(
    form_data: LoginRequest,
    db: Session = Depends(get_db)
):
    # Buscar usuario en la BD
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # Verificar contraseña
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    # Generar JWT token
    access_token = create_access_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
```

```typescript
// 5. Frontend incluye token en requests subsecuentes
// archivo: frontend/pos-cesariel/lib/api.ts

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;  // Envía token en cada request
    }
    return config;
  }
);
```

### **Concepto 3: WebSockets para Tiempo Real**

**¿Para qué se usan?** Actualizaciones en tiempo real (ej: stock actualizado en múltiples pantallas).

```python
# Backend: WebSocket Manager
# archivo: backend/websocket_manager.py

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Conexión cerrada, remover de la lista
                self.active_connections.remove(connection)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Mantener conexión abierta...
```

```typescript
// Frontend: Cliente WebSocket
// archivo: frontend/pos-cesariel/lib/websocket.ts

class WebSocketManager {
  private ws: WebSocket | null = null;
  
  connect() {
    this.ws = new WebSocket('ws://localhost:8000/ws');
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'stock_update') {
        // Actualizar stock en la UI
        updateProductStock(data.product_id, data.new_stock);
      }
    };
  }
  
  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}
```

### **Concepto 4: Manejo de Errores**

**¿Cómo se manejan los errores?**

```python
# Backend: Excepciones HTTP
# archivo: backend/routers/config.py

@router.put("/payment-config/{config_id}")
async def update_payment_config(config_id: int, config_data: PaymentConfigUpdate):
    try:
        # Validación personalizada
        if 'surcharge_percentage' in update_data:
            if update_data['surcharge_percentage'] < 0 or update_data['surcharge_percentage'] > 100:
                raise HTTPException(
                    status_code=400,
                    detail="El porcentaje de recargo debe estar entre 0 y 100"
                )
        
        # Buscar configuración
        updated_config = update_payment_config_in_store(config_id, update_data)
        
        if not updated_config:
            raise HTTPException(
                status_code=404,
                detail="Configuración de pago no encontrada"
            )
        
        return updated_config
        
    except HTTPException:
        raise  # Re-lanzar excepciones HTTP
    except Exception as e:
        logger.error(f"Error inesperado: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
```

```typescript
// Frontend: Interceptor de errores
// archivo: frontend/pos-cesariel/lib/api.ts

api.interceptors.response.use(
  (response) => response,  // Respuesta exitosa, no hacer nada
  (error) => {
    // Manejar errores HTTP
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    
    if (error.response?.status === 403) {
      toast.error('No tienes permisos para esta acción');
    }
    
    if (error.response?.status >= 500) {
      toast.error('Error del servidor. Intenta más tarde.');
    }
    
    return Promise.reject(error);
  }
);
```

### **Concepto 5: Caching y Optimización**

**¿Cómo se optimiza la performance?**

```typescript
// E-commerce: Data Service con caché
// archivo: ecommerce/app/lib/data-service.ts

class DataService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  
  async getProducts(): Promise<Product[]> {
    const cacheKey = 'products';
    const cached = this.cache.get(cacheKey);
    
    // Verificar si el caché es válido
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    
    try {
      // Hacer request al backend
      const response = await api.get('/products?show_in_ecommerce=true');
      const products = response.data;
      
      // Guardar en caché
      this.cache.set(cacheKey, { data: products, timestamp: Date.now() });
      
      return products;
    } catch (error) {
      // Fallback a datos estáticos si hay error
      console.warn('Backend no disponible, usando datos de fallback');
      return getFallbackProducts();
    }
  }
}
```

## 🎯 EJERCICIOS FINALES

### **Ejercicio 1: Rastrear un Flujo Completo**
1. Ve a `/settings/payment-methods`
2. Cambia un recargo y presiona "Guardar"
3. Usa las herramientas de desarrollador (F12) para ver:
   - La request HTTP en la pestaña "Network"
   - Los cambios de estado en React DevTools

### **Ejercicio 2: Probar Manejo de Errores**
1. Desconecta el backend (`make down`)
2. Intenta hacer una operación
3. Ve cómo se maneja el error

### **Ejercicio 3: Entender el Flujo de Autenticación**
1. Cierra sesión
2. Intenta acceder a `/settings` directamente
3. Ve cómo te redirige al login
4. Inicia sesión y ve cómo se guarda el token

## 🎯 ¡FELICITACIONES!

**Al completar este plan habrás dominado:**

✅ **React** - Componentes, estado, efectos, eventos
✅ **Next.js** - App Router, layouts, navegación, SSR
✅ **TypeScript** - Tipos, interfaces, generics
✅ **Tailwind CSS** - Utility-first styling
✅ **Radix UI** - Componentes accesibles
✅ **FastAPI** - APIs modernas con Python
✅ **SQLAlchemy** - ORM para base de datos
✅ **JWT Authentication** - Autenticación segura
✅ **WebSockets** - Comunicación en tiempo real
✅ **Full-stack Integration** - Conectar frontend y backend

**¡Ahora puedes mantener y expandir tu proyecto de tesis completamente!**

---

## 📖 RECURSOS ADICIONALES

### **Documentación Oficial:**
- [React](https://react.dev)
- [Next.js](https://nextjs.org/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)

### **Herramientas de Desarrollo:**
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [VS Code](https://code.visualstudio.com/) con extensiones TypeScript y Python
- [Postman](https://www.postman.com/) para probar APIs
- [pgAdmin](https://www.pgadmin.org/) para administrar PostgreSQL

### **Comunidades:**
- [Stack Overflow](https://stackoverflow.com/) para preguntas específicas
- [Reddit r/reactjs](https://www.reddit.com/r/reactjs/)
- [FastAPI Discord](https://discord.gg/VQjSZaeJmf)

---

**¿Listo para comenzar? ¡Empieza con la Fase 2 y ve paso a paso!** 🚀