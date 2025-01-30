-- Add userId column to reservations table
ALTER TABLE reservations
ADD COLUMN userId INT NOT NULL,
ADD CONSTRAINT fk_reservations_user
FOREIGN KEY (userId) REFERENCES users(id);

-- Update existing reservations to have a default user (you may want to adjust this based on your data)
UPDATE reservations
SET userId = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
WHERE userId IS NULL; 