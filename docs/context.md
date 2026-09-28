# Context — APP Delivery (fuente de verdad técnica)

> Este documento describe el **estado real** del proyecto (no el ideal ni el planeado). Se actualiza cada vez que se agrega o cambia una funcionalidad significativa. Ante cualquier duda sobre "qué existe hoy", este archivo manda sobre la memoria de conversaciones anteriores.
>
> Última revisión: 2026-08-21 (rama `develop`, commit `cd4b6db`).

---

## 1. Qué es el proyecto

**Univo Delivery / AppDelivery**: plataforma de pedidos y entrega (delivery) con tres roles previstos: cliente, administrador y repartidor. Monorepo con backend API (Node/Express) y frontend SPA (React/Vite), base de datos PostgreSQL.

## 2. Stack técnico

| Capa | Tecnología | Versión relevante |
|---|---|---|
| Backend | Node.js + Express | Express 5.x |
| Backend DB driver | `pg` (pool nativo, sin ORM) | 8.x |
| Auth (dependencia instalada, **no conectada**) | `jsonwebtoken`, `bcrypt` | — |
| Backend tests | Jest + Supertest (configurado, **sin tests escritos**) | — |
| Frontend | React 19 + Vite | React 19.2 |
| Frontend routing | `react-router-dom` v7 | — |
| Frontend HTTP | `axios` (instancia centralizada) | — |
| UI | Bootstrap 5 (dependencia) + sistema propio "Clean Design" en CSS puro (`app-theme.css`) | — |
| Iconos | `lucide-react` | — |
| Base de datos | PostgreSQL 15 (Docker) | — |
| CI | GitHub Actions (build validation) | — |

No hay ORM: todo el acceso a datos es SQL parametrizado directo vía `pg`.

## 3. Estructura de carpetas

Monorepo real (nota: `docs/project-structure.md` documenta `apps/` en plural, pero la carpeta real es **`app/`** en singular):

```
app-delivery/
├── app/
│   ├── backend/   → API Express, Clean Architecture (parcial, ver §4)
│   └── frontend/  → SPA React (Vite), feature-based
├── database/schema.sql   → esquema "unificado" usado por docker-compose para bootstrap
├── docs/                 → documentación técnica (este archivo vive aquí)
├── infrastructure/       → placeholder, aún vacío (solo .gitkeep)
├── .github/workflows/    → ci.yml + auto-pr.yml
└── docker-compose.yml    → postgres + backend + frontend
```

Convenciones de nombres de archivo (backend): `*.entity.js`, `*.use-case.js`, `*.repository.js`, `*.controller.js`, `*.routes.js`, `*.middleware.js`, `*.validator.js`. Frontend: componentes en `PascalCase.jsx`, hooks en `use-nombre.js` (función `useNombre`). Todo lo demás en `kebab-case`. Ver `docs/project-structure.md` para el detalle completo de la convención objetivo.

## 4. Arquitectura backend — estado real vs. documentado

`docs/project-structure.md` define Clean Architecture completa (domain / application / infrastructure / adapters). La carpeta antes llamada `presentation` se renombró a **`adapters`** para que coincida con el nombre que exige la guía técnica del parcial (RNF-03). **Los módulos `addresses` y `auth` siguen ese patrón completo**: `auth` tiene `domain/entities/User.js` + `domain/errors/{ConflictError,UnauthorizedError}.js` + `application/use-cases/{register-user,login-user}.use-case.js`, que orquestan las reglas de negocio (unicidad de email, hash de password, firma de JWT) antes de tocar el repositorio; `addresses` tiene `domain/entities/Address.js` + `application/use-cases/*` (create, update, delete, get, set-default).

Todos los demás módulos (`users`, `categories`, `products`, `stock`, `locations`) usan un patrón **más simple de 2 capas**: `controller` → `repository` directo, sin `use-case` ni entidad de dominio intermedia. La regla de dependencias (`adapters → application → domain`) no se viola, simplemente esas capas intermedias no existen todavía para esos módulos.

**Importante:** al agregar funcionalidad nueva, seguir el patrón que ya predomina en el módulo que se está tocando, salvo que el usuario pida explícitamente migrar un módulo a Clean Architecture completa. No mezclar estilos dentro del mismo módulo.

### Patrón de controller estándar (categories/products/stock/users)
- Try/catch por handler, respuestas JSON directas.
- Validación de body vía función `validate()` de un `*.validator.js` (validación manual, sin librería tipo Zod/Joi todavía, aunque `zod` sí está instalado en el **frontend**).
- Manejo de errores de Postgres por código: `23505` (unique violation → 409), `23503` (FK violation → 409).

## 5. Módulos backend existentes

| Módulo | Rutas montadas (`/api/...`) | Endpoints | Estado |
|---|---|---|---|
| `auth` | `/api/auth` | `POST /register`, `POST /login` | Login emite JWT firmado (`jwt.service.js`), verificado contra hash bcrypt. |
| `users` | `/api/users` | CRUD completo (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`) | **Toda la ruta requiere `authenticateJwt` + `authorizeRole('admin')`.** |
| `addresses` | `/api/addresses` | `POST /`, `GET /`, `PUT /:id`, `PATCH /:id/default`, `DELETE /:id` | **Toda la ruta requiere `authenticateJwt` + `authorizeRole('customer')`** (solo el cliente; el recurso es del propio usuario). Regla de negocio "primera dirección = default automático" se mantiene. |
| `categories` | `/api/categories` | CRUD completo | `GET` público; `POST`/`PUT`/`DELETE` requieren `authenticateJwt` + `authorizeRole('admin')`. |
| `products` | `/api/products` | CRUD completo + subida de imagen (`multer`, campo `image`) | `GET` público; mutaciones requieren admin. Imagen se sirve desde `/uploads` (estático). Precio sin IVA y mayor a 0 (validador en crear/editar y `CHECK` de la migración `008_product_price_positive.sql`). |
| `stock` | `/api/stock` | `GET /:product_id`, `GET /:product_id/total`, `POST /:product_id`, `DELETE /lot/:lot_id` | `GET` público; `POST`/`DELETE` requieren admin. Manejo por lotes (`lot_number`, `expiry_date`). |
| `locations` | `/api/locations` | `GET /departments`, `GET /departments/:id/municipalities`, `GET /municipalities` | Catálogo estático de El Salvador (departamentos/municipios), solo lectura. |
| `orders` | `/api/orders` | `POST /` (checkout), `GET /mine`, `GET /:id`, `GET /`, `PATCH /:id/status` | `POST` y `/mine` solo `customer` (admin y repartidor no compran); `/:id` cualquier autenticado (visibilidad por la entidad); `GET /` y `PATCH` solo `admin`/`delivery`. Máquina de estados en `domain/entities/Order.js` con casos de uso (ver `docs/estados-pedido.md`). |

`GET /health` disponible en la raíz (fuera de `/api`) para chequeo de salud.

## 6. Autenticación (login + JWT + roles) — implementado

Login real con JWT y control de roles (RF-02/RNF-02 del parcial), implementado:

- **Backend**: `POST /api/auth/login` → `auth.controller.js` (capa `adapters`) invoca `login-user.use-case.js` (capa `application`), que valida credenciales vía `infrastructure/security/password.service.js` (bcrypt), firma un JWT (`infrastructure/security/jwt.service.js`, payload `{ id, role, name, email }`, usa `JWT_SECRET`/`JWT_EXPIRES_IN` del `.env`) y responde `{ token, user }` (sin password). El registro sigue el mismo patrón vía `register-user.use-case.js`. Ambos casos de uso lanzan errores de dominio tipados (`domain/errors/ConflictError.js`, `UnauthorizedError.js`) que el controller mapea a `409`/`401`.
- **Middlewares** (`adapters/middlewares/`): `authenticate-jwt.middleware.js` (lee `Authorization: Bearer <token>`, setea `req.user = { id, role, email }`, `401` si falta/inválido) y `authorize-role.middleware.js` (factory `authorizeRole(...roles)`, `403` si el rol no matchea).
- **Rutas protegidas**: `/api/addresses` y la compra `POST /api/orders` (solo `customer`), `/api/users` (solo `admin`), mutaciones de `/api/categories`/`/api/products`/`/api/stock` (solo `admin`; los `GET` siguen públicos para navegación de catálogo sin sesión). Ver tabla de §5.
- **Frontend**: `features/auth/hooks/use-auth.jsx` expone `AuthProvider`/`useAuth()` (Context, persiste `token`/`authUser` en `localStorage`, mismas llaves que ya usaba el interceptor de `services/api.js`). Rutas nuevas `/login` (`LoginPage.jsx`) y `/register` (ya existía `RegisterPage.jsx`, solo faltaba enrutarla) agregadas en `App.jsx`. `routes/ProtectedRoute.jsx` protege `/admin/users`, `/admin/catalog` (rol `admin`) y `/addresses`, `/checkout`, `/orders` (solo `customer`; el menú, el carrito y "Agregar al carrito" se ocultan al personal, y el dashboard del personal muestra un resumen de pedidos) — redirige a `/login` sin sesión o a `/dashboard` si el rol no alcanza.
- **Navbar** (`layouts/MainLayout.jsx`): muestra nombre/rol reales vía `useAuth()`, botón de logout, y oculta los ítems "Usuarios"/"Catálogo & Stock" si el rol no es `admin`. Sin sesión, muestra enlace "Iniciar sesión" en vez del bloque de usuario.
- **Seed del admin**: `database/schema.sql` ya guarda el hash bcrypt real de `admin123` para `admin@delivery.com` (antes estaba en texto plano, lo cual rompía `bcrypt.compare`). **Ojo:** esto solo aplica a bases de datos creadas desde cero; una base ya existente con el password viejo en texto plano necesita un `UPDATE` manual o recrear el volumen de Postgres.

Roles usados en código (no cambiar sin coordinarlo): `customer`, `admin`, `delivery` (inglés, minúsculas — ver dropdown de `AdminUsersPage.jsx`).

### Pendiente relacionado (no cubierto en esta iteración)
- El interceptor de `services/api.js` todavía tiene el fallback `x-user-id` (ahora efectivamente muerto para rutas protegidas, ya que el middleware corta antes de llegar al controller). No se limpió por no ser parte del alcance pedido.
- Rol `delivery` usa el panel `/orders/monitor` para tomar y entregar pedidos; el feature `delivery` del frontend sigue vacío.

## 7. Base de datos

Dos fuentes de esquema que hay que tener en cuenta (no están 100% sincronizadas, revisar antes de asumir):
- `database/schema.sql`: esquema "unificado", es el que realmente monta `docker-compose` al levantar Postgres (`docker-entrypoint-initdb.d`).
- `app/backend/src/infrastructure/database/migrations/*.sql`: migraciones incrementales de referencia (users, categories, products, stock, addresses), no se aplican automáticamente.

### Tablas actuales
- `users`: id, name, email (unique), phone, password (hash), role (default `customer`), created_at. Seed: admin id=1 (`admin@delivery.com`).
- `departments` / `municipalities`: catálogo fijo de El Salvador (14 departamentos + municipios), poblado por seed en `schema.sql`.
- `categories`: id, name (unique), description.
- `products`: id, category_id (FK RESTRICT), name, description, price, image_path, is_available, timestamps.
- `stock`: id, product_id (FK CASCADE), lot_number, quantity (>0), entry_date, expiry_date — manejo de inventario por lotes.
- `addresses`: id, user_id (FK CASCADE), receiver_name/phone, full_name, phone, dui, title, address_line1/2, city, state, postal_code, country (default 'El Salvador'), latitude/longitude, is_default, timestamps.

### No existe todavía
- Tabla de **repartidores/entregas** (`deliveries`) — el feature `delivery` en frontend solo tiene carpetas vacías (`.gitkeep`).

## 8. Frontend

### Ruteo (`App.jsx`)
Rutas actuales, todas bajo `MainLayout` (sidebar + topbar únicos, sin distinción de layout por rol pese a que `docs/project-structure.md` prevé `ClientLayout`/`AdminLayout`/`DeliveryLayout` separados):

```
/            → DashboardPage
/dashboard   → DashboardPage
/catalog     → CatalogPage
/addresses   → AddressManagementPage
/checkout    → CheckoutPage
/admin/users   → AdminUsersPage
/admin/catalog → AdminCatalogPage
*            → redirect a /dashboard
```

No hay rutas `/login` ni control de acceso por rol todavía (ver §6).

### Estado global
- **Carrito** (`features/cart/hooks/use-cart.jsx`): Context + `localStorage` (`app_delivery_cart`), sin persistencia backend. Calcula subtotal, envío fijo ($2.50 si hay ítems) y total. Respeta el stock disponible del producto (`total_stock`) al agregar/actualizar cantidad.
- **Notificaciones** (`context/SileoNotificationContext.jsx`): contexto de notificaciones in-app (campana en el topbar).
- **Direcciones** (`features/addresses/hooks/useAddresses.js`): fetch + mutaciones contra `/api/addresses`.

### Features implementados (con UI real)
`auth` (solo registro + gestión de usuarios admin), `addresses` (CRUD completo con modal/drawer), `catalog` (catálogo cliente + panel admin de categorías/productos/stock), `cart` (carrito local), `dashboard` (resumen agregando carrito + direcciones, sin métricas reales de backend).

### Features con carpetas creadas pero sin implementación
`orders`, `delivery` — solo `.gitkeep` en `components/hooks/pages/services`. Es el trabajo pendiente más obvio para "seguir con más funcionalidades".

### Cliente HTTP
`app/frontend/src/services/api.js`: instancia Axios única, `baseURL` desde `VITE_API_URL` (fallback `http://localhost:4000/api`). Interceptor agrega `Authorization: Bearer <token>` si existe, si no manda `x-user-id` (placeholder, ver §6). Hay también un `app/frontend/src/config/api.js` con constantes `API_BASE_URL`/`UPLOADS_URL` hardcodeadas — **no está unificado con `services/api.js`**, cuidado al agregar código nuevo: preferir el cliente de `services/api.js`.

## 9. Sistema de diseño — "Clean Design"

Definido en `app/frontend/src/styles/app-theme.css` mediante variables CSS (`:root`). Es la fuente de verdad de estilos; **no introducir colores/spacing/radios "a mano"** si ya existe un token equivalente.

- **Color primario**: Emerald `#10b981` (hover `#059669`, dark `#047857`, fondos suaves `#ecfdf5`/`#d1fae5`).
- Secundario `#6366f1` (indigo), acentos ámbar `#f59e0b` y rosa `#f43f5e`.
- Fondo app `#f8fafc`, cards blancas, sidebar blanca (no oscura).
- Texto: `--text-main` (`#0f172a`) a `--text-light` (`#94a3b8`), escala de grises azulados.
- Radios: `--radius-xs` (6px) a `--radius-2xl` (24px) + `--radius-full`.
- Sombras: `--shadow-xs` a `--shadow-lg`, todas muy sutiles (bajo alpha).
- Transiciones: 150/200/250ms `ease`.
- Tipografía: `Inter` con fallback a system fonts.

Componentes reutilizables clave: `CleanModal` (modal genérico con header/icon/subtitle/footer configurables) y `ConfirmDeleteModal` en `components/`. Cada feature además tiene sus propios modales especializados (`AddressFormModal`, `ProductModal`, `CategoryModal`, `StockModal`, etc.) que **reusan las clases `app-modal*`** del theme en vez de reinventar estilos.

El commit más reciente (`cd4b6db feat(ui): redesign all forms, modals, and inputs with modern design system`) unificó formularios/modales/inputs bajo este sistema — es el estándar visual a seguir para cualquier UI nueva. Antes de crear un componente de formulario/modal nuevo, revisar `CleanModal.jsx` y las clases `.app-modal*`/`.app-sidebar*`/`.app-topbar*` en `app-theme.css` para reutilizar el lenguaje visual existente en vez de crear uno paralelo.

## 10. Testing

Configurado (Jest + Supertest en backend, carpeta `tests/` en frontend) pero **no hay ningún archivo de test escrito todavía** — solo `.gitkeep` en `tests/unit`, `tests/integration`, `tests/e2e` (backend) y `tests/` (frontend). `npm test` en backend correrá Jest sin encontrar tests.

## 11. Workflow de Git — obligatorio para todo el trabajo futuro

Documentado en `README.md`, se debe seguir sin excepción:

- **Ramas**: `main` (producción, protegida) ← PR ← `develop` (integración, protegida) ← PR ← `feature/<nombre-tarea>` (temporal, se borra tras merge).
- Toda funcionalidad nueva nace de `develop` actualizado: `git checkout develop && git pull origin develop && git checkout -b feature/nombre-tarea`.
- **Nunca** commit directo a `main` o `develop`, **nunca** `push --force` sobre esas ramas.
- Commits en **Conventional Commits**, breves, tipo `tipo(alcance): descripción` (tipos usados: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`). Ejemplo real del historial: `feat(catalog): add CRUD for categories, products, and stock`.
- **Los commits no deben leerse como generados por IA** (nada de explicaciones largas, listas de bullets excesivas, tono robótico) — mensaje corto y directo, como los escribiría el equipo.
- **Nunca agregar a Claude como autor o coautor** del commit (sin `Co-Authored-By: Claude` ni similar), ni firmas/menciones de IA en el mensaje.
- PR hacia `develop`: título claro, descripción de qué/por qué, referencia a issue (`Closes #12`), mínimo 1 revisión aprobada.
- Al cerrar un "cómputo"/entrega: PR de `develop` → `main`, solo si `develop` está estable.
- CI (`ci.yml`) corre build de frontend y backend en cada push/PR a `develop`/`main`. `auto-pr.yml` abre automáticamente un PR draft hacia `develop` en cada push a `feature/**`.

## 12. Brechas / próximos pasos evidentes

Ordenado por lo que más bloquea funcionalidad nueva:

1. **Órdenes**: checkout (`docs/carrito-checkout.md`) y ciclo de vida con panel de monitoreo (`docs/estados-pedido.md`) implementados, incluida la vista "Mis pedidos" del cliente (`/orders`).
2. **Delivery/repartidor**: el repartidor ya toma y entrega pedidos desde `/orders/monitor`; no hay pasarela de pago ni seguimiento de ubicación.
3. **Tests**: ninguno escrito pese a estar configurado.
4. **Duplicación de esquema**: `database/schema.sql` vs `migrations/*.sql` — confirmar con el usuario cuál es la fuente real antes de modificar el esquema.
5. **`config/api.js` vs `services/api.js`**: dos formas de apuntar al backend en frontend, conviene unificar antes de que crezca más.
6. **Contenedor Docker desactualizado**: `docker-compose.yml` levanta `appdelivery-backend` con la imagen construida hace tiempo; no refleja el código nuevo hasta hacer `docker compose build backend` (en esta máquina falló por un problema de credenciales de Docker Desktop — `docker-credential-desktop` no encontrado — ajeno al código, hay que resolverlo localmente).

---

*Mantener este archivo actualizado tras cada feature significativa: agregar módulo nuevo, brecha cerrada, o cambio de convención debe reflejarse aquí.*
