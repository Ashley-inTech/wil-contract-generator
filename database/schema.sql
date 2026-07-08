-- Create database
CREATE DATABASE IF NOT EXISTS wil_contract_db;
USE wil_contract_db;

-- 1. Career Categories
CREATE TABLE career_categories (
    career_id INT PRIMARY KEY AUTO_INCREMENT,
    career_name VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(100) NOT NULL,
    responsibilities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Exposure Areas
CREATE TABLE exposure_areas (
    exposure_id INT PRIMARY KEY AUTO_INCREMENT,
    career_id INT NOT NULL,
    exposure_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (career_id) REFERENCES career_categories(career_id) ON DELETE CASCADE,
    UNIQUE KEY unique_career_exposure (career_id, exposure_name)
);

-- 3. Participants (Main table)
CREATE TABLE participants (
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
);

-- 4. Contracts
CREATE TABLE contracts (
    contract_id INT PRIMARY KEY AUTO_INCREMENT,
    participant_id INT NOT NULL,
    generated_pdf VARCHAR(255),
    generated_docx VARCHAR(255),
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Draft', 'Generated', 'Signed') DEFAULT 'Generated',
    FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE CASCADE
);

-- 5. WIL Letters
CREATE TABLE wil_letters (
    wil_letter_id INT PRIMARY KEY AUTO_INCREMENT,
    participant_id INT NOT NULL,
    generated_pdf VARCHAR(255),
    generated_docx VARCHAR(255),
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Draft', 'Generated', 'Sent') DEFAULT 'Generated',
    FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_participant_status ON participants(status);
CREATE INDEX idx_participant_name ON participants(first_name, last_name);
CREATE INDEX idx_participant_dates ON participants(commencement_date, termination_date);