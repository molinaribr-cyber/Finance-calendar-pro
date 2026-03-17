# 📊 Calendario Financiero PRO

App de calendario financiero con IA integrada para S&P 500, NASDAQ 100 y Merval.

---

## 🚀 Deploy en Vercel (5 minutos)

### Paso 1 — Conseguí tu API Key de Anthropic
1. Entrá a https://console.anthropic.com
2. Andá a **API Keys** → **Create Key**
3. Copiá la key (empieza con `sk-ant-...`)
4. ⚠️ Guardala en un lugar seguro, no la compartás

### Paso 2 — Subí el proyecto a Vercel

**Opción A: Sin código (más fácil)**
1. Instalá la CLI de Vercel:
   ```
   npm install -g vercel
   ```
2. Abrí una terminal en la carpeta `finanzas-pro`
3. Ejecutá:
   ```
   vercel
   ```
4. Seguí los pasos (proyecto nuevo, dejá todo por defecto)
5. Al final te da una URL como `https://finanzas-pro-xxx.vercel.app`

**Opción B: Desde GitHub**
1. Subí esta carpeta a un repositorio de GitHub
2. Entrá a https://vercel.com → **Add New Project**
3. Importá el repositorio
4. Deploy automático

### Paso 3 — Configurá la API Key (obligatorio)
1. En el dashboard de Vercel, entrá a tu proyecto
2. **Settings** → **Environment Variables**
3. Agregá:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (tu key)
   - **Environment:** Production, Preview, Development ✓
4. Click **Save**
5. Volvé a **Deployments** → **Redeploy** (para que tome la variable)

### Paso 4 — ¡Listo!
Tu URL pública funciona 24/7. Compartila con quien quieras.

---

## 📁 Estructura del proyecto
```
finanzas-pro/
├── api/
│   └── search.js        ← Backend seguro (esconde la API key)
├── public/
│   └── index.html       ← El calendario completo
├── vercel.json          ← Configuración de Vercel
└── README.md
```

## 💡 Cómo funciona
- El HTML vive en `public/index.html` y es servido estáticamente
- Cuando el usuario hace una búsqueda con IA, llama a `/api/search`
- La función serverless en `api/search.js` usa la API key guardada en Vercel (nunca expuesta al browser)
- La respuesta vuelve al frontend de forma segura

## 💰 Costo estimado
- **Vercel:** Gratis (plan Hobby, más que suficiente)
- **Anthropic API:** ~$0.003 por búsqueda (muy barato)

---

Hecho con Claude · Anthropic
