# RF-04 y RF-05: carrito y checkout

Trabajo aislado en `carrito-branch`, creado desde `develop`. No requiere integrar la rama para probarla.

## Preparación

1. Instalar dependencias con `npm ci` en `app/backend` y `app/frontend`.
2. En una base existente, ejecutar **una vez antes de iniciar esta versión** `app/backend/src/infrastructure/database/migrations/006_create_orders.sql` con un cliente PostgreSQL. Requiere las tablas de usuarios, productos, stock y direcciones. Para instalaciones nuevas, `database/schema.sql` incluye las nuevas tablas.
3. Configurar la conexión del backend y `JWT_SECRET` como en la aplicación existente. Iniciar ambos proyectos con `npm run dev`.

No se ejecutan migraciones automáticamente sobre Supabase ni sobre una base compartida.

## Comportamiento

- Agregar, quitar y cambiar cantidades desde el catálogo/carrito. Cantidades limitadas a existencias conocidas y 10000 unidades por producto; el servidor comprueba nuevamente el inventario.
- `products.price` representa el precio **sin IVA**. Se muestran precios unitarios con y sin IVA en catálogo, lista administrativa y tabla del carrito.
- IVA del 13 %, redondeado al centavo por línea (`precio × cantidad`). El total suma subtotales, IVA y el envío existente de $2.50. El carrito vacío no cobra envío. El precio unitario con IVA es informativo: al multiplicarlo puede diferir un centavo del total calculado por línea.
- La confirmación utiliza precios actuales del servidor y muestra el total finalmente registrado. Si el precio cambió desde que se agregó al carrito, este importe puede diferir de la estimación.
- El pedido queda en estado `CREADO`. No se procesa un pago ni se implementan las transiciones de RF-06/RF-10.
- La dirección y el nombre/precio del producto se conservan como datos históricos del pedido.
- Si ocurre un error, el carrito se conserva y la base revierte cabecera, detalles y descuentos de inventario.

## API

`POST /api/orders`, con JWT en `Authorization: Bearer ...` y una cabecera `Idempotency-Key` de 16–80 letras, números o guiones. El frontend utiliza un UUID y lo conserva durante los reintentos, incluso al recargar la pestaña.

```json
{
  "address_id": 1,
  "items": [{ "product_id": 1, "quantity": 2 }]
}
```

Responde `201` con `{ "order": { ... }, "replayed": false }`; un reintento idéntico responde `200` con el mismo pedido. Una misma clave con otro contenido devuelve `409`. Precios, impuestos, usuario y total enviados por el cliente no se aceptan como fuente de verdad.

La transacción bloquea productos en orden de ID y sus lotes para evitar ventas simultáneas por encima del inventario. Consume lotes por fecha de ingreso e ID, conservando lotes agotados con cantidad cero. La restricción única `(user_id, idempotency_key)` protege también frente a reintentos simultáneos.

## Verificación

- Backend: `npm test -- --runInBand`. Pruebas HTTP contra PostgreSQL embebido (PGlite), sin conectarse a una base compartida: persistencia, IVA, reintentos, validación, autorización, stock insuficiente y rollback real.
- Frontend: `npm test` y `npm run build`.
- Prueba manual: iniciar sesión, agregar productos, revisar las columnas y el IVA, cambiar cantidades y confirmar con una dirección propia; comprobar el número de pedido y las existencias restantes. Probar también stock agotado y un fallo de red: el carrito debe conservarse y reintentar sin duplicar el pedido.
- Las pruebas embebidas no simulan conexiones PostgreSQL concurrentes; verificar compras simultáneas en una base de pruebas antes de desplegar.

### Resultado de la implementación

12 pruebas del backend y 4 del frontend aprobadas. Compilación de producción aprobada con Vite, importando la configuración directamente por una restricción del entorno Windows al cargarla mediante esbuild:

```sh
node --input-type=module -e "import {build} from 'vite'; import config from './vite.config.js'; await build({...config,configFile:false});"
```

La revisión de lint de los nuevos módulos del frontend y las páginas de checkout/catálogo modificadas pasó. El lint global conserva errores previos en otros módulos y la advertencia de estructura de exportaciones del hook del carrito. No se realizó una prueba visual en navegador ni se aplicó la migración a Supabase.
