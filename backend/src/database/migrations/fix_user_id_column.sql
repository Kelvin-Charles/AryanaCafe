    -- Drop existing foreign key if it exists
    SET FOREIGN_KEY_CHECKS=0;

    -- Update any NULL userId values with admin user's ID
    UPDATE reservations 
    SET userId = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
    WHERE userId IS NULL;

    -- Make userId NOT NULL and add foreign key constraint
    ALTER TABLE reservations 
    MODIFY COLUMN userId INT NOT NULL,
    ADD CONSTRAINT fk_reservations_user 
    FOREIGN KEY (userId) REFERENCES users(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

    SET FOREIGN_KEY_CHECKS=1; 