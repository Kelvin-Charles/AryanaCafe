-- Add orderId column to reservations table
ALTER TABLE reservations
ADD COLUMN orderId INT,
ADD CONSTRAINT fk_reservations_order
FOREIGN KEY (orderId) REFERENCES orders(id)
ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_reservations_order_id ON reservations(orderId); 