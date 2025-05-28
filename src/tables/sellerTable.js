const createSellerTable = `
  CREATE TABLE IF NOT EXISTS seller ( 
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sellerId UUID NOT NULL,
      eventName TEXT NOT NULL,
      price TEXT NOT NULL,
      quantity TEXT NOT NULL,
      category TEXT NOT NULL,
      CONSTRAINT fk_id FOREIGN KEY (sellerId) REFERENCES users(id)
  );
`

module.exports = createSellerTable;
