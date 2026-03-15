# 📁 Estructura de Carpetas — React.js (Proyectos a Gran Escala)

> Arquitectura moderna, escalable y mantenible para aplicaciones React con TypeScript.

---

## 🗂️ Vista General

```
src/
├── assets/
├── components/
│   ├── ui/
│   ├── forms/
│   ├── layout/
│   └── common/
├── features/
│   ├── auth/
│   ├── dashboard/
│   └── users/
├── hooks/
├── services/
├── store/
├── pages/
├── lib/
├── types/
├── config/
└── providers/
```

---

## 📋 Referencia de Carpetas

| Carpeta | Contenido | Capa |
|---|---|---|
| `assets/` | Fuentes, imágenes, iconos, SVGs estáticos | Estática |
| `components/` | Componentes reutilizables y presentacionales | UI |
| `features/` | Módulos de negocio autocontenidos | Dominio |
| `hooks/` | Custom hooks compartidos a nivel global | Lógica |
| `services/` | Capa HTTP, clientes API, interceptores | Datos |
| `store/` | Estado global (Redux, Zustand, Jotai) | Estado |
| `pages/` | Componentes de entrada por ruta | Routing |
| `lib/` | Utilidades puras, helpers, formateadores | Util |
| `types/` | Tipos e interfaces TypeScript compartidos | Tipos |
| `config/` | Variables de entorno, rutas, feature flags | Config |
| `providers/` | Proveedores de contexto React | Contexto |

---

## ⭐ La Carpeta Más Importante: `features/`

Cada feature es un **mini-módulo independiente**. Si eliminas o despliegas una feature, todo lo relacionado está en un solo lugar.

```
src/features/auth/
├── components/        ← LoginForm, OTPInput
├── hooks/             ← useLogin, useSession
├── store/             ← authSlice.ts
├── services/          ← authApi.ts
├── types/             ← auth.types.ts
└── index.ts           ← barrel export público
```

---

## 📌 Reglas Clave

### `components/` — Solo UI "tonta"
- ✅ Botones, cards, modales, inputs reutilizables
- ❌ Sin lógica de negocio ni llamadas a la API
- ❌ Si el componente conoce tu dominio → va en `features/`

### `services/` — Dueña de toda la capa HTTP
- ✅ Las funciones de servicio son las únicas que llaman a `fetch` o `axios`
- ✅ Los componentes y hooks solo invocan funciones de servicio
- ✅ Facilita el mock en tests

### `store/` — Solo configuración global
- ✅ `index.ts` ensambla el store, `rootReducer.ts`, middlewares
- ✅ Los slices/átomos concretos viven dentro de `features/`

### `types/` — Solo tipos verdaderamente compartidos
- ✅ Formas de respuesta de la API, enums globales
- ❌ Los tipos específicos de una feature permanecen en su feature

### `providers/` — Composición única en la raíz
```tsx
// main.tsx
<AppProviders>
  <App />
</AppProviders>

// providers/AppProviders.tsx
<QueryClientProvider>
  <ThemeProvider>
    <RouterProvider>
      {children}
    </RouterProvider>
  </ThemeProvider>
</QueryClientProvider>
```

---

## 📄 Archivos Raíz

```
/
├── src/
├── public/
├── App.tsx
├── main.tsx
├── vite.config.ts
├── tsconfig.json
├── .env
├── .env.example
└── package.json
```

---

## 🔗 Flujo de Dependencias

```
pages/  →  features/  →  services/  →  API
   ↓            ↓
components/   store/
   ↓            ↓
  hooks/  →   lib/  →  types/
```

> **Regla de oro:** Las dependencias fluyen hacia abajo. `features/` puede importar de `components/`, `hooks/`, `lib/` y `services/`, pero **nunca al revés**.

---

## 🛠️ Stack Recomendado

| Categoría | Herramienta |
|---|---|
| Bundler | Vite |
| Lenguaje | TypeScript |
| Estado global | Redux Toolkit / Zustand |
| Data fetching | TanStack Query (React Query) |
| Routing | React Router v6 |
| Testing | Vitest + Testing Library |
| Estilos | Tailwind CSS / CSS Modules |

---

*Tip: Este patrón funciona con cualquier gestor de estado — Redux Toolkit, Zustand o Jotai. La estructura de `features/` permanece idéntica.*