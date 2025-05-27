const createOtpTable = `
 CREATE TABLE IF NOT EXISTS otp(
     id SERIAL PRIMARY KEY,
     otp TEXT NOT NULL,
     isUsed BOOLEAN DEFAULT FALSE,
     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     email TEXT NOT NULL,
     CONSTRAINT fk_email FOREIGN KEY(email) REFERENCES users(email)
 );
`

module.exports = createOtpTable;
