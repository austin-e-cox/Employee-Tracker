CREATE database
IF NOT EXISTS employees_db;

USE employees_db;

DROP TABLE IF EXISTS employees;
CREATE TABLE employees
(
	id INT NOT NULL
	AUTO_INCREMENT,
	first_name VARCHAR
	(30),
	last_name VARCHAR
	(30),
	role_id INT,
	manager_id INT,
	PRIMARY KEY
	(id)
);

	DROP TABLE IF EXISTS role;
	CREATE TABLE role
	(
		id INT NOT NULL
		AUTO_INCREMENT,
	title VARCHAR
		(30),
	salary DECIMAL,
	department_id INT,
	PRIMARY KEY
		(id)
);

		DROP TABLE IF EXISTS department;
		CREATE TABLE department
		(
			id INT NOT NULL
			AUTO_INCREMENT,
	name VARCHAR
			(30),
	PRIMARY KEY
			(id)
);
