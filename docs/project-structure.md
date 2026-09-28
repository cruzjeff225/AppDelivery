# Estructura de carpetas — APP Delivery

## Visión general

```text
univo-delivery/
├── apps/
│   ├── backend/         # API Node.js + Express (Clean Architecture)
│   └── frontend/         # React (Vite)
├── database/              # schema.sql y migraciones de referencia
├── docs/                  # documentación técnica del proyecto
├── infrastructure/        # nginx, configuración de despliegue
├── .github/                # plantillas de PR e Issues
├── docker-compose.yml
├── .gitignore
└── README.md
```

Es un **monorepo**: un solo repositorio con backend y frontend adentro.

---

## Backend — Clean Architecture por capas

```text
apps/backend/src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── errors/
├── application/
│   ├── use-cases/
│   ├── ports/
│   └── dto/
├── infrastructure/
│   ├── database/
│   ├── repositories/
│   ├── security/
│   ├── config/
│   └── logging/
├── adapters/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   └── validators/
├── app.js
└── server.js
```

### Regla de dependencias (lo más importante de todo)

```
adapters       ──▶  application  ──▶  domain
infrastructure ──▶  application  ──▶  domain
```

Una capa **nunca** importa código de una capa que esté más afuera de ella. El `domain` no sabe que existe Express ni PostgreSQL.

### Qué va en cada carpeta

| Carpeta | Qué contiene | Por qué está separada |
|---|---|---|
| `domain/entities/` | Clases con las reglas de negocio puras (`User`, `Order`, `Product`...) | Es el corazón del sistema; no debe cambiar aunque cambies de framework o de base de datos |
| `domain/value-objects/` | Conceptos con validación propia (`OrderStatus`, `Money`, `Role`) | Evita que un estado o un monto inválido exista en cualquier parte del sistema |
| `domain/errors/` | Excepciones propias del negocio (`InvalidOrderStatusTransitionError`) | Diferencia errores de negocio de errores técnicos (de red, de base de datos, etc.) |
| `application/use-cases/` | Un archivo por cada acción del sistema (`create-order.use-case.js`, `login-user.use-case.js`) | Cada caso de uso orquesta el negocio; es el "qué hace" el sistema |
| `application/ports/` | **Interfaces/contratos** (`user.repository.js`, `password-hasher.port.js`) | Permite que `application` hable con la base de datos o servicios externos sin conocer su implementación real |
| `application/dto/` | Objetos simples para mover datos entre capas (`create-order.dto.js`) | Evita pasar directamente objetos de Express o de PostgreSQL entre capas |
| `infrastructure/repositories/` | Implementación real de los `ports` (`postgres-order.repository.js`) | Aquí sí vive el SQL; es el único lugar que debe conocer PostgreSQL |
| `infrastructure/security/` | `bcrypt-password-hasher.js`, `jwt-token-service.js` | Implementaciones concretas de seguridad, reemplazables sin tocar el dominio |
| `infrastructure/database/` | Migraciones y seeds | Control de versiones del esquema de la base de datos |
| `infrastructure/config/` | Conexión a PostgreSQL, variables de entorno | Configuración técnica, no lógica de negocio |
| `adapters/controllers/` | Reciben el `req`, llaman a un caso de uso, devuelven el `res` | Solo traducen HTTP ↔ caso de uso; **nunca** contienen lógica de negocio ni SQL |
| `adapters/routes/` | Definen los endpoints (`/api/orders`) y qué middlewares aplican | Mapea URLs a controladores |
| `adapters/middlewares/` | `authenticate-jwt.middleware.js`, `authorize-role.middleware.js` | Validaciones que se ejecutan antes de llegar al controlador |
| `adapters/validators/` | Validan el `body`/`params` del request | Evita que datos inválidos lleguen al caso de uso |

### Ejemplo de flujo real

```
POST /api/orders
  → order.routes.js
  → order.controller.js
  → create-order.use-case.js       (application)
  → order.repository.js            (interfaz, application/ports)
  → postgres-order.repository.js   (implementación, infrastructure)
  → PostgreSQL
  → Response 201
```

---

## Frontend — organizado por funcionalidad (feature-based)

```text
apps/frontend/src/
├── components/       # componentes reutilizables (Button, Modal...)
├── features/
│   ├── auth/
│   ├── catalog/
│   ├── cart/
│   ├── orders/
│   ├── addresses/
│   ├── dashboard/
│   └── delivery/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── services/
├── layouts/          # ClientLayout, AdminLayout, DeliveryLayout
├── routes/           # árbol de rutas + ProtectedRoute (control por rol)
├── services/          # cliente HTTP centralizado
├── App.jsx
└── main.jsx
```

### Qué va en cada carpeta y por qué

| Carpeta | Qué contiene | Por qué |
|---|---|---|
| `components/` | Piezas 100% genéricas, sin conocimiento del negocio | Un `Button` no sabe qué es una "orden"; se reutiliza en toda la app |
| `features/<nombre>/components/` | Componentes que sí conocen el negocio (`OrderStatusBadge`) | Vive junto al módulo al que pertenece, no mezclado con lo genérico |
| `features/<nombre>/pages/` | Las pantallas de ese módulo | Cada feature es dueño de sus propias vistas |
| `features/<nombre>/hooks/` | Lógica de estado propia del módulo (`useCart`, `useAuth`) | Aísla la lógica sin ensuciar el componente |
| `features/<nombre>/services/` | Llamadas a la API de ese módulo | Centraliza el consumo de endpoints por módulo |
| `layouts/` | Estructura visual compartida por tipo de usuario | Cliente, Administrador y Repartidor ven layouts distintos |
| `routes/` | Rutas + `ProtectedRoute` que valida el rol antes de renderizar | Controla qué actor puede ver qué pantalla |
| `services/` | Cliente HTTP base (fetch/axios) | Un solo lugar que agrega el token JWT a cada petición |

---

## Cómo nombrar los archivos

| Tipo de archivo | Convención | Ejemplo |
|---|---|---|
| Entidad de dominio | `<nombre>.entity.js` | `order.entity.js` |
| Value Object | `<nombre>.vo.js` | `order-status.vo.js` |
| Error de dominio | `<nombre>.error.js` | `invalid-order-status-transition.error.js` |
| Caso de uso | `<verbo-accion>.use-case.js` | `create-order.use-case.js` |
| Puerto/interfaz | `<nombre>.repository.js` o `<nombre>.port.js` | `user.repository.js`, `token-service.port.js` |
| DTO | `<nombre>.dto.js` | `create-order.dto.js` |
| Repositorio (implementación) | `postgres-<nombre>.repository.js` | `postgres-order.repository.js` |
| Controlador | `<nombre>.controller.js` | `order.controller.js` |
| Rutas | `<nombre>.routes.js` | `order.routes.js` |
| Middleware | `<accion>.middleware.js` | `authenticate-jwt.middleware.js` |
| Validador | `<nombre>.validator.js` | `order.validator.js` |
| Componente React | `PascalCase.jsx` | `OrderStatusBadge.jsx` |
| Hook React | `use-<nombre>.js` (archivo) → `useNombre` (función) | `use-cart.js` → `useCart()` |

**Regla general:** todo en `kebab-case` (minúsculas con guiones), excepto los componentes React, que van en `PascalCase` porque así los reconoce React. El sufijo (`.use-case.js`, `.entity.js`, `.controller.js`) es obligatorio: permite saber qué es un archivo con solo mirar su nombre, sin necesidad de abrirlo.

---

## Otros aspectos importantes
- **`.env` nunca se sube al repositorio** (ver `.gitignore`); solo se sube `.env.example` con las claves sin valores reales.
- **`node_modules/` tampoco se sube**; se regenera con `npm install` en cada máquina.