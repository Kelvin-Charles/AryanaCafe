    -- Drop existing foreign key if it exists
    SET FOREIGN_KEY_CHECKS=0;

    -- First, try to drop the existing foreign key constraints
    ALTER TABLE reservations
    DROP FOREIGN KEY IF EXISTS fk_reservations_user,
    DROP FOREIGN KEY IF EXISTS reservations_UserId_foreign_idx;

    -- Rename the column if it exists as userId
    ALTER TABLE reservations
    CHANGE COLUMN IF EXISTS userId UserId INT;

    -- Update any NULL userId values with admin user's ID
    UPDATE reservations 
    SET UserId = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
    WHERE UserId IS NULL;

    -- Make UserId NOT NULL and add foreign key constraint
    ALTER TABLE reservations 
    MODIFY COLUMN UserId INT NOT NULL,
    ADD CONSTRAINT fk_reservations_user 
    FOREIGN KEY (UserId) REFERENCES users(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

    SET FOREIGN_KEY_CHECKS=1; 