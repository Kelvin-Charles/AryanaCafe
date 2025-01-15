-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS aryana_cafe;
USE aryana_cafe;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Menu items table (publicly visible)
CREATE TABLE IF NOT EXISTS menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category ENUM('beverages', 'desserts', 'snacks', 'main', 'appetizers') NOT NULL,
    image VARCHAR(255) NOT NULL,
    available BOOLEAN DEFAULT true,
    preparation_time INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Dietary restrictions for menu items (many-to-many relationship)
CREATE TABLE IF NOT EXISTS dietary_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    menu_item_id INT,
    dietary_type ENUM('vegetarian', 'vegan', 'gluten-free', 'dairy-free') NOT NULL,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_dietary_option (menu_item_id, dietary_type)
);

-- Reservations table (requires account)
CREATE TABLE IF NOT EXISTS reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INT NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    special_requests TEXT,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_reservation (date, time)
);

-- Orders table (supports both registered users and guest orders)
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,  -- Made optional for guest/in-person orders
    guest_name VARCHAR(255),
    guest_phone VARCHAR(20), -- Required for in-person/guest orders
    guest_email VARCHAR(255),
    status ENUM('pending', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
    order_type ENUM('dine-in', 'takeaway', 'delivery') NOT NULL,
    table_number INT,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    payment_method ENUM('cash', 'card', 'online') DEFAULT 'cash',
    special_requests TEXT,
    estimated_delivery_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    -- Ensure either user_id or guest_phone is provided
    CONSTRAINT check_user_or_guest CHECK (
        (user_id IS NOT NULL) OR 
        (guest_phone IS NOT NULL)
    )
);

-- Order items table (for items in each order)
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Delivery addresses for orders (only required for delivery orders)
CREATE TABLE IF NOT EXISTS delivery_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Insert default admin user
INSERT INTO users (name, email, password, role) 
VALUES (
    'Admin User', 
    'admin@aryanacafe.com',
    '$2a$10$YourHashedPasswordHere', -- You should change this to a properly hashed password
    'admin'
) ON DUPLICATE KEY UPDATE email = email;

-- Insert some sample menu items
INSERT INTO menu_items (name, description, price, category, image, preparation_time) VALUES
('Classic Coffee', 'Rich and aromatic coffee made from premium beans', 3.99, 'beverages', '/images/coffee.jpg', 5),
('Green Tea', 'Organic green tea with natural antioxidants', 2.99, 'beverages', '/images/green-tea.jpg', 3),
('Chocolate Cake', 'Decadent chocolate cake with rich frosting', 6.99, 'desserts', '/images/choc-cake.jpg', 10),
('Club Sandwich', 'Triple-decker sandwich with chicken, bacon, and fresh vegetables', 12.99, 'main', '/images/club-sandwich.jpg', 15); 