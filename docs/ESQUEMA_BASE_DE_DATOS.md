# Esquema de base de datos

Alineado con `.cursor`: Pre-order & Smart Pickup (no delivery), respuestas < 0.5s, **BCrypt** (no AES), validación estricta **@lasallebajio.edu.mx**, y **Monedero Digital (Wallet)** con saldo acumulado.

---

## 1. Tablas principales

### `users` (RF001, RF002)
| Columna         | Tipo         | Restricciones                          |
|-----------------|--------------|----------------------------------------|
| id              | UUID         | PK, default gen_random_uuid()          |
| nombre          | TEXT         | NOT NULL                               |
| email           | TEXT         | UNIQUE, NOT NULL, CHECK (email LIKE '%@lasallebajio.edu.mx') |
| matricula       | TEXT         | UNIQUE, NOT NULL                       |
| password_hash   | TEXT         | NOT NULL (BCrypt)                      |
| created_at      | TIMESTAMPTZ  | default now()                          |

Índices: `UNIQUE(email)`, `UNIQUE(matricula)`.

---

### `establishments` (RF007)
| Columna             | Tipo        | Restricciones                |
|---------------------|-------------|-----------------------------|
| id                  | UUID        | PK                          |
| nombre              | TEXT        | NOT NULL                    |
| logo_url            | TEXT        |                             |
| is_accepting_orders | BOOLEAN     | default true                |
| horario             | TEXT        |                             |
| created_at          | TIMESTAMPTZ | default now()               |

Índice: `WHERE is_accepting_orders = true` para listado rápido.

---

### `menu_items` (RF003, RF005)
| Columna          | Tipo   | Restricciones                                      |
|------------------|--------|----------------------------------------------------|
| id               | UUID   | PK                                                 |
| establishment_id | UUID   | FK → establishments(id), NOT NULL                  |
| nombre           | TEXT   | NOT NULL                                           |
| categoria        | TEXT   | NOT NULL, CHECK (categoria IN ('Entradas','Platos principales','Postres')) |
| precio_centavos  | INT    | NOT NULL, >= 0                                     |
| permite_personalizacion | BOOLEAN | default false                            |
| created_at       | TIMESTAMPTZ | default now()                                 |

Índices: `(establishment_id, categoria)` para menú por establecimiento y categoría.

---

### `orders` (RF006, RF008, RF009, RF010 – Pre-order & Pickup)
| Columna          | Tipo        | Restricciones |
|------------------|-------------|---------------|
| id               | UUID        | PK            |
| user_id          | UUID        | FK → users(id) |
| establishment_id | UUID        | FK → establishments(id) |
| status           | TEXT        | pending \| en_preparacion \| listo_para_recoger \| recogido \| cancelado |
| payment_method   | TEXT        | efectivo \| tarjeta \| wallet |
| total_centavos   | INT         | NOT NULL      |
| pickup_slot      | TIMESTAMPTZ | ventana de recolección |
| created_at       | TIMESTAMPTZ | default now() |
| updated_at       | TIMESTAMPTZ | default now() |

Índices: `(user_id, created_at DESC)`, `(establishment_id, status)`.

---

### `order_items` (RF004, RF005)
| Columna        | Tipo   | Restricciones            |
|----------------|--------|--------------------------|
| id             | UUID   | PK                       |
| order_id       | UUID   | FK → orders(id)          |
| menu_item_id   | UUID   | FK → menu_items(id)      |
| cantidad       | INT    | NOT NULL, > 0           |
| precio_centavos| INT    | NOT NULL (snapshot)      |
| notas          | TEXT   | personalización          |

---

### `wallets` (Monedero digital – RF008 ampliado)
| Columna          | Tipo        | Restricciones    |
|------------------|-------------|------------------|
| id               | UUID        | PK               |
| user_id          | UUID        | FK → users(id), UNIQUE |
| balance_centavos | BIGINT      | NOT NULL, default 0, >= 0 |
| updated_at       | TIMESTAMPTZ | default now()    |

Índice: `UNIQUE(user_id)`.

---

### `wallet_transactions` (auditoría del monedero)
| Columna       | Tipo        | Restricciones   |
|---------------|-------------|-----------------|
| id            | UUID        | PK              |
| wallet_id     | UUID        | FK → wallets(id) |
| amount_centavos| INT        | positivo recarga, negativo pago |
| type          | TEXT        | topup \| payment |
| order_id      | UUID        | FK nullable (si es pago) |
| created_at    | TIMESTAMPTZ | default now()   |

---

## 2. Funciones / RPC (Supabase)

- **`wallet_topup(p_user_id UUID, p_amount INT)`**  
  Crea o actualiza `wallets` para `p_user_id`, incrementa `balance_centavos` por `p_amount`, inserta fila en `wallet_transactions` (type = 'topup').  
  Usar con **Service Role** desde el backend para evitar que el cliente modifique saldos.

- **Pago con wallet al confirmar pedido**  
  Transacción en backend: descontar de `wallets`, crear `wallet_transactions` (type = 'payment', order_id), crear/actualizar `orders` con `payment_method = 'wallet'`.

---

## 3. Políticas de seguridad (RLS – Supabase)

- **users**: lectura de perfil propio por `auth.uid()` (si usas Supabase Auth) o por JWT custom (recomendado: backend con Service Key y JWT propio).
- **orders / order_items**: usuario solo ve sus pedidos (`user_id = auth.uid()` o validación en API).
- **wallets**: solo el dueño puede ver su saldo; escritura solo desde backend con Service Key.

---

## 4. Rendimiento (< 0.5s)

- Índices anteriores.
- Supabase: conexión cercana (región), conexión persistente desde el backend.
- Evitar N+1: listar pedidos con `orders` + `order_items` + `establishments` en una o dos consultas (select con joins o RPC).
- Cachear menú por establecimiento (TTL corto) si hace falta.

---

## 5. Alternativa Firebase (Firestore)

Si eliges Firebase en lugar de Supabase:

- **Colecciones**: `users`, `establishments`, `menuItems` (por establishment), `orders` (subcolección o colección con `userId`), `wallets`.
- Mismo modelo lógico: `password_hash` (BCrypt) en `users`, `balance_centavos` en `wallets`, `payment_method` en `orders`.
- Reglas: solo lectura/escritura del propio usuario en `users/{userId}`, `orders` donde `userId == request.auth.uid`, y que solo el backend (Admin SDK) pueda actualizar `wallets`.

---

Si quieres, el siguiente paso puede ser generar los scripts SQL de Supabase (CREATE TABLE + índices + RPC) listos para pegar en el editor SQL del proyecto.
