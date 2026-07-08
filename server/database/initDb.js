//initDb.js
import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

const DB_HOST = process.env.DB_HOST;
const DB_USER= process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

async function createDatabaseAndTables() {
    // 1) Create the database if it doesn't exist
    const root = await mysql.createConnection({
        host: `${DB_HOST}`,
        user: `${DB_USER}`,
        password: `${DB_PASSWORD}`,
        database: `${DB_NAME}`,
        multipleStatements: true,
    });

    await root.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await root.end();

    //2)Connect to the DB
    const db = mysql.createPool({
        host: `${DB_HOST}`,
        user: `${DB_USER}`,
        password: `${DB_PASSWORD}`,
        database: `${DB_NAME}`,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    //3)Tables
    /*-- =========================================
    -- 1. career_categories
    -- =========================================*/
    await db.query(`
        CREATE TABLE IF NOT EXISTS career_categories (
            career_id INT PRIMARY KEY AUTO_INCREMENT,
            career_name VARCHAR(100) NOT NULL UNIQUE,
            role VARCHAR(100) NOT NULL,
            responsibilities TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    /*-- =========================================
    -- 2. exposure_areas
    -- =========================================*/
    await db.query(`
        CREATE TABLE IF NOT EXISTS exposure_areas (
            exposure_id INT PRIMARY KEY AUTO_INCREMENT,
            career_id INT NOT NULL,
            exposure_name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (career_id) REFERENCES career_categories(career_id) ON DELETE CASCADE,
            UNIQUE KEY unique_career_exposure (career_id, exposure_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    /*-- =========================================
    -- 3. participants
    -- =========================================*/
    await db.query(`
        CREATE TABLE IF NOT EXISTS participants (
            participant_id INT PRIMARY KEY AUTO_INCREMENT,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            id_number VARCHAR(20) NOT NULL UNIQUE,
            commencement_date DATE NOT NULL,
            termination_date DATE NOT NULL,
            career_id INT NOT NULL,
            participant_role VARCHAR(100),
            responsibilities TEXT,
            exposure_areas TEXT,
            signed_at DATE,
            participant_signature VARCHAR(255),
            status ENUM('Active', 'Completed', 'Terminated') DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (career_id) REFERENCES career_categories(career_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    /*-- =========================================
    -- 4. contracts
    -- =========================================*/
    await db.query(`
        CREATE TABLE IF NOT EXISTS contracts (
            contract_id INT PRIMARY KEY AUTO_INCREMENT,
            participant_id INT NOT NULL,
            generated_pdf VARCHAR(255),
            generated_docx VARCHAR(255),
            generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status ENUM('Draft', 'Generated', 'Signed') DEFAULT 'Generated',
            FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    /*-- =========================================
    -- 5. wil_letters
    -- =========================================*/
    await db.query(`
        CREATE TABLE IF NOT EXISTS wil_letters (
            wil_letter_id INT PRIMARY KEY AUTO_INCREMENT,
            participant_id INT NOT NULL,
            generated_pdf VARCHAR(255),
            generated_docx VARCHAR(255),
            generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status ENUM('Draft', 'Generated', 'Sent') DEFAULT 'Generated',
            FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    //performance
    await db.query(`CREATE INDEX idx_participant_status ON participants(status)`);
    await db.query(`CREATE INDEX idx_participant_name ON participants(first_name, last_name)`);
    await db.query(`CREATE INDEX idx_participant_dates ON participants(commencement_date, termination_date)`);

    console.log('✅ Checked/created all tables');
}

export default createDatabaseAndTables;

// Run when executed directly
if (process.argv[1].includes("initDb.js")) {
  createDatabaseAndTables()
    .then(() => {
      console.log("✅ Database initialized successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error initializing database:", error);
      process.exit(1);
    });
}