-- Borrar tablas si existen
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS establishments;
DROP TABLE IF EXISTS users;

-- Tabla users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_matricula ON users(matricula);
CREATE INDEX idx_users_email ON users(email);

-- Tabla establishments
CREATE TABLE establishments (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    logo_url VARCHAR(500),
    is_accepting_orders BOOLEAN DEFAULT TRUE,
    horario VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla menu_items
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria TEXT CHECK (categoria IN ('Entradas','Platos principales','Postres')),
    precio_centavos INT NOT NULL DEFAULT 0,
    imagen_url VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_items_establishment ON menu_items(establishment_id);
CREATE INDEX idx_menu_items_categoria ON menu_items(categoria);

-- Tabla orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    establishment_id INT NOT NULL REFERENCES establishments(id) ON DELETE RESTRICT,
    payment_method VARCHAR(50) DEFAULT 'wallet',
    pickup_slot VARCHAR(50),
    status TEXT CHECK (status IN ('pending','confirmed','ready','picked_up','cancelled')) DEFAULT 'pending',
    total_centavos INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_establishment ON orders(establishment_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Tabla order_items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario_centavos INT NOT NULL,
    subtotal_centavos INT NOT NULL,
    notas TEXT
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Tabla wallets
CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance_centavos INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallets_user ON wallets(user_id);

-- FUNCTION (RPC) equivalente a tu PROCEDURE wallet_topup
CREATE OR REPLACE FUNCTION wallet_topup(p_user_id INT, p_amount INT)
RETURNS TABLE(balance_centavos INT, balance NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = p_user_id) THEN
        INSERT INTO wallets (user_id, balance_centavos)
        VALUES (p_user_id, p_amount);
    ELSE
        UPDATE wallets
        SET balance_centavos = balance_centavos + p_amount,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;

    RETURN QUERY
    SELECT w.balance_centavos, w.balance_centavos / 100.0
    FROM wallets w
    WHERE w.user_id = p_user_id;
END;
$$;
