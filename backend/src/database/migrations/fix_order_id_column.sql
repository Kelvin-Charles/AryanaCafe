SET FOREIGN_KEY_CHECKS=0;

-- First, try to drop the foreign key if it exists
ALTER TABLE reservations
DROP FOREIGN KEY IF EXISTS fk_reservations_order;

-- Then drop the index if it exists
ALTER TABLE reservations
DROP INDEX IF EXISTS idx_reservations_order_id;

-- Add or modify the OrderId column
ALTER TABLE reservations
MODIFY COLUMN OrderId INT,
ADD CONSTRAINT fk_reservations_OrderId
FOREIGN KEY (OrderId) REFERENCES orders(id)
ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS=1; 