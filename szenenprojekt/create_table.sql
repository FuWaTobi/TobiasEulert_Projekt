CREATE DATABASE IF NOT EXISTS szenen;
USE szenen;

CREATE TABLE IF NOT EXISTS szenen_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    info TEXT,
    objekte JSON
);