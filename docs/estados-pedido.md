# RF-06 y RF-10: ciclo de vida del pedido y panel de monitoreo

## Preparación

En una base existente, ejecutar **una vez** `app/backend/src/infrastructure/database/migrations/007_order_status.sql` (requiere `006_create_orders.sql`). Para instalaciones nuevas, `database/schema.sql` ya la incluye. La migración es idempotente e inicia el historial de los pedidos anteriores con su estado actual.

## Máquina de estados

Definida en la entidad de dominio `app/backend/src/domain/entities/Order.js`:

```
CREADO → PAGADO → EN_PREPARACION → EN_CAMINO → ENTREGADO
   ↓        ↓            ↓
CANCELADO CANCELADO  CANCELADO
```

- `ENTREGADO` y `CANCELADO` son estados finales.
- Un pedido solo puede cancelarse antes de salir a entrega. Al cancelar, los productos regresan al inventario como un lote nuevo `DEV-<id del pedido>`; los lotes consumidos conservan su historial.
- `PAGADO` lo marca el administrador manualmente: no hay pasarela de pago.
- La base valida los estados con un `CHECK`; cada cambio queda en `order_status_history` (estado anterior, nuevo, usuario y fecha).

### Permisos por rol

| Rol | Ve | Puede |
|---|---|---|
| `admin` | Todos los pedidos | Cualquier transición válida |
| `delivery` | Pedidos `EN_PREPARACION` o `EN_CAMINO` sin repartidor, y los asignados a él | `EN_PREPARACION → EN_CAMINO` y `EN_CAMINO → ENTREGADO` |
| `customer` | — | — (`403`) |

El repartidor que mueve un pedido sin asignar queda como responsable (`orders.delivery_user_id`) y solo él puede marcarlo como entregado. Un pedido que el usuario no puede ver responde `404`.

## API

Todas requieren `Authorization: Bearer ...` con rol `admin` o `delivery`.

- `GET /api/orders`: pedidos en curso. `?status=ENTREGADO` o `?status=CREADO,PAGADO` filtra; `?status=ALL` incluye los finalizados. Cada pedido trae `available_transitions`, los estados a los que el usuario actual puede moverlo.
- `GET /api/orders/:id`: detalle con `items` e `history`.
- `PATCH /api/orders/:id/status` con `{ "status": "EN_CAMINO" }`: responde el pedido actualizado. Transición inválida `409`, rol sin permiso `403`, estado desconocido `400`.

El cambio de estado, el historial y la devolución de inventario se guardan en una sola transacción con el pedido bloqueado (`FOR UPDATE`), por lo que dos cambios simultáneos no se pisan.

## Frontend

`/orders/monitor` (menú **Operación → Monitoreo de pedidos**), visible para `admin` y `delivery`. Pestañas En curso / Entregados / Cancelados (esta última solo admin), acciones según `available_transitions`, confirmación al cancelar, detalle con productos e historial, y actualización automática cada 30 segundos.

## Verificación

- Backend: `npm test -- --runInBand` (29 pruebas; las nuevas en `order-entity.test.js` y `order-status.test.js`, contra PostgreSQL embebido).
- Frontend: `npm test` y `npm run build`.
- Prueba manual: con `admin@delivery.com` marcar un pedido como pagado y en preparación; con un usuario `delivery`, tomarlo y entregarlo; comprobar el historial en el detalle. Cancelar otro pedido y revisar que el stock del producto aumente.
