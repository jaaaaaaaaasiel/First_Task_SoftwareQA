# The Fast Food Salle

Pre-order y recogida en ventanilla. Pide desde clase y recoge sin hacer fila.

## Estructura

```
TrabajoETS/
├── backend/
│   └── src/
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── home.html
│   ├── menu.html
│   ├── cart.html
│   ├── orders.html
│   ├── wallet.html
│   ├── css/style.css
│   └── js/
│       ├── api.js
│       ├── login.js
│       ├── register.js
│       ├── home.js
│       ├── menu.js
│       ├── cart.js
│       ├── orders.js
│       └── wallet.js
└── database/
```

## Cómo ejecutar

```bash
cd backend
npm install
```

Crear archivo `.env` con:
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- JWT_SECRET

```bash
npm run dev
```

Abre http://localhost:4000 en el navegador.
