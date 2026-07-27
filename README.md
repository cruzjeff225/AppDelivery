# GitFlow — APP Delivery

Estrategia de ramificación del equipo. Basada en GitFlow, ideal para lanzamientos estructurados en 3 cómputos.

## Ramas

| Rama | Propósito | Reglas |
|---|---|---|
| **`main`** | Aloja únicamente el código estable, ya desplegado en producción | Protegida. Nunca commits directos. Solo recibe merges vía Pull Request desde `develop` |
| **`develop`** | Rama base donde se integran las funcionalidades terminadas | Protegida. Nunca commits directos. Recibe Pull Requests desde `feature/*` |
| **`feature/*`** | Rama temporal y aislada donde cada programador desarrolla una tarea específica | Se crea desde `develop`. Se elimina después de integrarse |

```text
main      ●──────────────────●───────────────●
           \                 /               /
develop     ●───●───●───●───●───●───●───●───●
                 \     /       \       /
feature/x         ●───●         (otro feature)
```

---

## Flujo de trabajo paso a paso

### 1. Crear una rama feature

Siempre desde `develop` actualizado:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-de-la-tarea
```

**Ejemplos aplicados al proyecto:**
```text
feature/user-authentication
feature/product-catalog-crud
feature/checkout-flow
feature/order-status-management
feature/delivery-portal
```

### 2. Trabajar y confirmar cambios

```bash
git add .
git commit -m "feat(orders): agrega creación de pedidos"
```

Formato de commit: `tipo(alcance): descripción breve`. Tipos usados: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

### 3. Publicar la rama en GitHub

```bash
git push -u origin feature/nombre-de-la-tarea
```

### 4. Abrir Pull Request hacia `develop`

En GitHub: **base = `develop`**, **compare = `feature/nombre-de-la-tarea`**.

El PR debe incluir:
- Título claro (`feat(orders): agrega creación de pedidos`).
- Descripción de qué cambia y por qué.
- Referencia al issue (`Closes #12`).
- Al menos 1 revisión aprobada de otro integrante.

### 5. Integrar y limpiar

Una vez aprobado y sin conflictos, se integra el PR (merge) a `develop`. Luego:

```bash
git checkout develop
git pull origin develop
git branch -d feature/nombre-de-la-tarea
git push origin --delete feature/nombre-de-la-tarea
```

### 6. De `develop` a `main`

Al cerrar un cómputo/entrega, se abre un Pull Request de `develop` → `main`. Solo se integra si `develop` está estable (build y pruebas pasando).

---

## Reglas obligatorias

- ❌ Nunca hacer commit directo en `main` ni en `develop`.
- ❌ Nunca hacer `push --force` sobre `main` o `develop`.
- ✅ Toda funcionalidad nace de `develop` y vuelve a `develop` vía Pull Request.
- ✅ Cada Pull Request necesita al menos una revisión antes de integrarse.
- ✅ `main` y `develop` deben estar protegidas en la configuración de GitHub (Settings → Branches).

## Actualizar tu rama con los últimos cambios de `develop`

Si `develop` avanzó mientras trabajabas en tu feature:

```bash
git checkout develop
git pull origin develop
git checkout feature/nombre-de-la-tarea
git merge develop
```