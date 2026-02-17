SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Crear base de datos y usarla (descomenta si es la primera vez)
CREATE DATABASE IF NOT EXISTS trabajoets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trabajoets;

-- --------------------------------------------
-- Tabla: users (RF001 - Registro, RF002 - Login)
-- --------------------------------------------
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS establishments;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_matricula (matricula),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: establishments (RF007 - Establecimientos)
-- --------------------------------------------
CREATE TABLE establishments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    logo_url VARCHAR(500) DEFAULT NULL,
    is_accepting_orders TINYINT(1) DEFAULT 1,
    horario VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: menu_items (RF003 - Menú por categorías)
-- --------------------------------------------
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    establishment_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria ENUM('Entradas', 'Platos principales', 'Postres') NOT NULL,
    precio_centavos INT NOT NULL DEFAULT 0,
    imagen_url VARCHAR(500) DEFAULT NULL,
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
    INDEX idx_menu_items_establishment (establishment_id),
    INDEX idx_menu_items_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: orders (RF006 - Pedidos, RF010 - Historial)
-- --------------------------------------------
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    establishment_id INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'wallet',
    pickup_slot VARCHAR(50) DEFAULT NULL,
    status ENUM('pending', 'confirmed', 'ready', 'picked_up', 'cancelled') DEFAULT 'pending',
    total_centavos INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE RESTRICT,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_establishment (establishment_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: order_items (RF004, RF005 - Ítems del pedido)
-- --------------------------------------------
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario_centavos INT NOT NULL,
    subtotal_centavos INT NOT NULL,
    notas TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
    INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: wallets (RF008 - Monedero digital)
-- --------------------------------------------
CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    balance_centavos INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_wallets_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------
-- Procedimiento almacenado: wallet_topup
-- Equivalente al RPC de Supabase
-- --------------------------------------------
DELIMITER //

DROP PROCEDURE IF EXISTS wallet_topup //

CREATE PROCEDURE wallet_topup(
    IN p_user_id INT,
    IN p_amount INT
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Verificar si existe la wallet
    SELECT COUNT(*) INTO v_exists FROM wallets WHERE user_id = p_user_id;

    IF v_exists = 0 THEN
        INSERT INTO wallets (user_id, balance_centavos)
        VALUES (p_user_id, p_amount);
    ELSE
        UPDATE wallets
        SET balance_centavos = balance_centavos + p_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id;
    END IF;

    COMMIT;

    -- Retornar el saldo actualizado
    SELECT balance_centavos, balance_centavos / 100 AS balance
    FROM wallets
    WHERE user_id = p_user_id;
END //

DELIMITER ;
