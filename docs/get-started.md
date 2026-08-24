# Cómo empezar — Univo Delivery

## 1. Clonar el repositorio

```bash
git clone https://github.com/cruzjeff225/AppDelivery.git
cd app-delivery
```

## 2. Instalar dependencias

### Backend
```bash
cd app/backend
npm install
cp .env.example .env   # ajusta tus valores locales
```

### Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
```

### Base de datos (Supabase)
El proyecto usa un Postgres alojado en Supabase. En `app/backend/.env`, define `DATABASE_URL`
con la cadena del **Session pooler** (Project Settings → Database → Connection string → URI,
puerto 5432) y `DB_SSL=true`. No uses el host de conexión directa (`db.<ref>.supabase.co`):
solo resuelve por IPv6 y da `ENOTFOUND` en redes sin salida IPv6. El esquema
(`database/schema.sql`) se ejecuta una sola vez contra ese proyecto, desde el SQL Editor de
Supabase o con `psql "$DATABASE_URL" -f database/schema.sql`.

Si prefieres desarrollar contra un Postgres local en vez de Supabase, comenta `DATABASE_URL`/
`DB_SSL` en tu `.env`, descomenta las variables `DB_HOST`/`DB_PORT`/... y levanta el servicio
opcional:
```bash
cd ../..
docker compose --profile local-db up -d postgres
```

## 3. Verificar que todo corre

```bash
cd app/backend && npm run dev    # http://localhost:4000
cd app/frontend && npm run dev   # http://localhost:5173
```

---

## 4. Cómo reportar/notificar una nueva dependencia

Si instalas un paquete nuevo (`npm install <paquete>`), **no basta con hacer commit del `package.json`**. Debes avisar al equipo para que todos actualicen su entorno local.

### Pasos obligatorios

1. **Instala el paquete indicando si es de producción o de desarrollo:**
   ```bash
   npm install <paquete>              # dependencia de producción
   npm install --save-dev <paquete>   # solo para desarrollo
   ```

2. **Haz commit de `package.json` y `package-lock.json` juntos** (nunca subas solo uno de los dos):
   ```bash
   git add package.json package-lock.json
   git commit -m "chore(deps): agrega <paquete> para <motivo>"
   ```

3. **Notifica al equipo** en el canal del proyecto (WhatsApp) con este formato mínimo:

   ```text
   📦 Nueva dependencia instalada
   Paquete: <nombre>@<versión>
   Tipo: producción / desarrollo
   Proyecto: backend / frontend
   Motivo: <para qué se usa, en 1 línea>
   Acción requerida: correr `npm install` al actualizar tu rama
   ```

   **Ejemplo real:**
   ```text
   📦 Nueva dependencia instalada
   Paquete: zod@3.23.0
   Tipo: producción
   Proyecto: backend
   Motivo: validar el body de las peticiones en los use cases
   Acción requerida: correr `npm install` al actualizar tu rama
   ```

### Regla clave para el resto del equipo

Cada vez que hagas `git pull` y notes que `package.json` cambió, corre `npm install` antes de seguir trabajando:

```bash
git pull origin develop
npm install
```

Esto evita el clásico error de "en mi máquina sí funciona" por dependencias desactualizadas.