const createBuyerTable =
    `
    CREATE TABLE IF NOT EXISTS buyer (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        eventName TEXT NOT NULL,
        price TEXT NOT NULL,
        quantity TEXT NOT NULL,
        category TEXT NOT NULL,
        buyerId UUID NOT NULL,
        CONSTRAINT fk_id FOREIGN KEY (buyerId) REFERENCES users(id)
        );
    `

module.exports = createBuyerTable;
