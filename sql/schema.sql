-- Generated from backend SQLAlchemy models (PostgreSQL dialect)

CREATE TABLE admins (
    id SERIAL NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE INDEX ix_admins_id ON admins (id);
CREATE UNIQUE INDEX ix_admins_username ON admins (username);

CREATE TABLE app_settings (
    key VARCHAR(100) NOT NULL,
    value TEXT,
    PRIMARY KEY (key)
);

CREATE TABLE combo_offers (
    id SERIAL NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    pick_count INTEGER NOT NULL,
    combo_price FLOAT NOT NULL,
    original_price FLOAT,
    badge_text VARCHAR(100),
    image_urls JSON,
    category VARCHAR(100),
    material VARCHAR(100),
    fit VARCHAR(50),
    sizes JSON,
    colors JSON,
    is_couple_offer BOOLEAN,
    men_sizes JSON,
    men_colors JSON,
    women_sizes JSON,
    women_colors JSON,
    variant_stock JSON,
    rating FLOAT,
    review_count INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id)
);

CREATE INDEX ix_combo_offers_id ON combo_offers (id);
CREATE INDEX ix_combo_offers_is_active ON combo_offers (is_active);

CREATE TABLE contact_messages (
    id SERIAL NOT NULL,
    name VARCHAR(200),
    email VARCHAR(200),
    subject VARCHAR(300),
    message TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id)
);

CREATE INDEX ix_contact_messages_id ON contact_messages (id);

CREATE TABLE hero_slides (
    id SERIAL NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(500),
    button_text VARCHAR(100),
    button_link VARCHAR(200),
    sort_order INTEGER,
    active BOOLEAN,
    PRIMARY KEY (id)
);

CREATE INDEX ix_hero_active_sort ON hero_slides (active, sort_order);
CREATE INDEX ix_hero_slides_active ON hero_slides (active);
CREATE INDEX ix_hero_slides_sort_order ON hero_slides (sort_order);

CREATE TABLE newsletter_subs (
    id SERIAL NOT NULL,
    email VARCHAR(200),
    created_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE INDEX ix_newsletter_subs_id ON newsletter_subs (id);

CREATE TABLE otp_records (
    id SERIAL NOT NULL,
    identifier VARCHAR(255) NOT NULL,
    otp_code VARCHAR(128) NOT NULL,
    method VARCHAR(20),
    used BOOLEAN,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY (id)
);

CREATE INDEX ix_otp_lookup ON otp_records (identifier, method, used);
CREATE INDEX ix_otp_records_expires_at ON otp_records (expires_at);
CREATE INDEX ix_otp_records_identifier ON otp_records (identifier);
CREATE INDEX ix_otp_records_method ON otp_records (method);
CREATE INDEX ix_otp_records_used ON otp_records (used);

CREATE TABLE otp_throttles (
    id SERIAL NOT NULL,
    identifier VARCHAR(255) NOT NULL,
    method VARCHAR(50) NOT NULL,
    ip_address VARCHAR(64) NOT NULL,
    failed_attempts INTEGER NOT NULL,
    locked_until TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_otp_throttle_scope UNIQUE (identifier, method, ip_address)
);

CREATE INDEX ix_otp_throttles_id ON otp_throttles (id);
CREATE INDEX ix_otp_throttles_identifier ON otp_throttles (identifier);
CREATE INDEX ix_otp_throttles_ip_address ON otp_throttles (ip_address);
CREATE INDEX ix_otp_throttles_method ON otp_throttles (method);

CREATE TABLE products (
    id SERIAL NOT NULL,
    name VARCHAR(300) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    discount_price FLOAT,
    category VARCHAR(100),
    sub_category VARCHAR(100),
    stock INTEGER,
    available BOOLEAN,
    badge VARCHAR(100),
    rating FLOAT,
    reviews INTEGER,
    material VARCHAR(200),
    fit VARCHAR(100),
    is_best_seller BOOLEAN,
    is_bogo BOOLEAN,
    combo_quantity INTEGER,
    offer_type VARCHAR(50),
    offer_end_time TIMESTAMP WITHOUT TIME ZONE,
    sizes JSON,
    colors JSON,
    tags JSON,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id)
);

CREATE INDEX ix_products_available ON products (available);
CREATE INDEX ix_products_category ON products (category);
CREATE INDEX ix_products_category_available ON products (category, available);
CREATE INDEX ix_products_combo_quantity ON products (combo_quantity);
CREATE INDEX ix_products_created_at ON products (created_at);
CREATE INDEX ix_products_id ON products (id);
CREATE INDEX ix_products_is_best_seller ON products (is_best_seller);
CREATE INDEX ix_products_is_bogo ON products (is_bogo);
CREATE INDEX ix_products_name ON products (name);
CREATE INDEX ix_products_offer_type ON products (offer_type);
CREATE INDEX ix_products_sub_category ON products (sub_category);

CREATE TABLE security_audit_logs (
    id SERIAL NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    actor_type VARCHAR(20),
    actor_id INTEGER,
    ip_address VARCHAR(64),
    user_agent VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY (id)
);

CREATE INDEX ix_security_audit_logs_actor_id ON security_audit_logs (actor_id);
CREATE INDEX ix_security_audit_logs_actor_type ON security_audit_logs (actor_type);
CREATE INDEX ix_security_audit_logs_created_at ON security_audit_logs (created_at);
CREATE INDEX ix_security_audit_logs_event_type ON security_audit_logs (event_type);
CREATE INDEX ix_security_audit_logs_id ON security_audit_logs (id);
CREATE INDEX ix_security_audit_logs_ip_address ON security_audit_logs (ip_address);
CREATE INDEX ix_security_audit_logs_status ON security_audit_logs (status);

CREATE TABLE site_content (
    id SERIAL NOT NULL,
    section VARCHAR(100) NOT NULL,
    title VARCHAR(500),
    subtitle VARCHAR(500),
    description TEXT,
    image_url VARCHAR(500),
    PRIMARY KEY (id)
);

CREATE INDEX ix_site_content_id ON site_content (id);
CREATE UNIQUE INDEX ix_site_content_section ON site_content (section);

CREATE TABLE site_offers (
    id SERIAL NOT NULL,
    offer_key VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    enabled BOOLEAN,
    end_time TIMESTAMP WITHOUT TIME ZONE,
    sort_order INTEGER,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id),
    UNIQUE (offer_key)
);

CREATE TABLE users (
    id SERIAL NOT NULL,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(500),
    is_verified BOOLEAN NOT NULL,
    failed_login_attempts INTEGER NOT NULL,
    locked_until TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE INDEX ix_users_id ON users (id);
CREATE INDEX ix_users_is_verified ON users (is_verified);
CREATE INDEX ix_users_phone ON users (phone);

CREATE TABLE cart (
    id SERIAL NOT NULL,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY(user_id) REFERENCES users (id),
    FOREIGN KEY(product_id) REFERENCES products (id)
);

CREATE INDEX ix_cart_id ON cart (id);
CREATE INDEX ix_cart_product_id ON cart (product_id);
CREATE INDEX ix_cart_user_id ON cart (user_id);
CREATE INDEX ix_cart_user_product ON cart (user_id, product_id);

CREATE TABLE combo_offer_reviews (
    id SERIAL NOT NULL,
    combo_offer_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id),
    CONSTRAINT uq_combo_user_review UNIQUE (combo_offer_id, user_id),
    FOREIGN KEY(combo_offer_id) REFERENCES combo_offers (id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_combo_offer_reviews_combo_offer_id ON combo_offer_reviews (combo_offer_id);
CREATE INDEX ix_combo_offer_reviews_created_at ON combo_offer_reviews (created_at);
CREATE INDEX ix_combo_offer_reviews_id ON combo_offer_reviews (id);
CREATE INDEX ix_combo_offer_reviews_user_id ON combo_offer_reviews (user_id);
CREATE INDEX ix_combo_reviews_combo_created ON combo_offer_reviews (combo_offer_id, created_at);
CREATE INDEX ix_combo_reviews_combo_rating ON combo_offer_reviews (combo_offer_id, rating);

CREATE TABLE orders (
    id SERIAL NOT NULL,
    user_id INTEGER NOT NULL,
    total_price FLOAT NOT NULL,
    status VARCHAR(50),
    razorpay_order_id VARCHAR(200),
    razorpay_payment_id VARCHAR(200),
    shipping_address VARCHAR(500),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id),
    FOREIGN KEY(user_id) REFERENCES users (id),
    UNIQUE (payment_reference)
);

CREATE INDEX ix_orders_created_at ON orders (created_at);
CREATE INDEX ix_orders_id ON orders (id);
CREATE INDEX ix_orders_razorpay_order_id ON orders (razorpay_order_id);
CREATE INDEX ix_orders_razorpay_payment_id ON orders (razorpay_payment_id);
CREATE INDEX ix_orders_status ON orders (status);
CREATE INDEX ix_orders_user_id ON orders (user_id);

CREATE TABLE payment_sessions (
    id SERIAL NOT NULL,
    user_id INTEGER NOT NULL,
    qr_id VARCHAR(150) NOT NULL,
    amount FLOAT NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    paid BOOLEAN NOT NULL,
    payment_id VARCHAR(150),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_payment_sessions_expires_at ON payment_sessions (expires_at);
CREATE INDEX ix_payment_sessions_id ON payment_sessions (id);
CREATE INDEX ix_payment_sessions_paid ON payment_sessions (paid);
CREATE UNIQUE INDEX ix_payment_sessions_qr_id ON payment_sessions (qr_id);
CREATE INDEX ix_payment_sessions_user_id ON payment_sessions (user_id);

CREATE TABLE product_images (
    id SERIAL NOT NULL,
    product_id INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE INDEX ix_product_images_id ON product_images (id);
CREATE INDEX ix_product_images_product_id ON product_images (product_id);

CREATE TABLE refresh_tokens (
    id SERIAL NOT NULL,
    user_id INTEGER NOT NULL,
    jti VARCHAR(128) NOT NULL,
    token_hash VARCHAR(128) NOT NULL,
    issued_ip VARCHAR(64),
    user_agent VARCHAR(255),
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL,
    revoked_at TIMESTAMP WITHOUT TIME ZONE,
    rotated_to_jti VARCHAR(128),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_refresh_tokens_expires_at ON refresh_tokens (expires_at);
CREATE INDEX ix_refresh_tokens_id ON refresh_tokens (id);
CREATE UNIQUE INDEX ix_refresh_tokens_jti ON refresh_tokens (jti);
CREATE INDEX ix_refresh_tokens_revoked ON refresh_tokens (revoked);
CREATE INDEX ix_refresh_tokens_user_id ON refresh_tokens (user_id);

CREATE TABLE reviews (
    id SERIAL NOT NULL,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id),
    CONSTRAINT uq_product_user_review UNIQUE (product_id, user_id),
    FOREIGN KEY(product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_reviews_created_at ON reviews (created_at);
CREATE INDEX ix_reviews_id ON reviews (id);
CREATE INDEX ix_reviews_product_created ON reviews (product_id, created_at);
CREATE INDEX ix_reviews_product_id ON reviews (product_id);
CREATE INDEX ix_reviews_product_rating ON reviews (product_id, rating);
CREATE INDEX ix_reviews_user_id ON reviews (user_id);

CREATE TABLE user_addresses (
    id SERIAL NOT NULL,
    user_id INTEGER NOT NULL,
    label VARCHAR(50),
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    pincode VARCHAR(10) NOT NULL,
    is_default BOOLEAN,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id),
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_user_addresses_id ON user_addresses (id);
CREATE INDEX ix_user_addresses_is_default ON user_addresses (is_default);
CREATE INDEX ix_user_addresses_user_default ON user_addresses (user_id, is_default);
CREATE INDEX ix_user_addresses_user_id ON user_addresses (user_id);

CREATE TABLE order_items (
    id SERIAL NOT NULL,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    price FLOAT NOT NULL,
    selected_size VARCHAR(20),
    selected_color VARCHAR(50),
    combo_offer_id INTEGER,
    combo_item_index INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY(order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products (id),
    FOREIGN KEY(combo_offer_id) REFERENCES combo_offers (id)
);

CREATE INDEX ix_order_items_combo_offer_id ON order_items (combo_offer_id);
CREATE INDEX ix_order_items_id ON order_items (id);
CREATE INDEX ix_order_items_order_id ON order_items (order_id);
CREATE INDEX ix_order_items_product_id ON order_items (product_id);
