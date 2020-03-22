INSERT INTO employees
	(first_name, last_name, role_id, manager_id)
VALUES
	("AF", "AL", 3, 2),
	("BF", "BL", 1, 1),
	("CF", "CL", 2, 2),
	("DF", "DL", 2, 3);

INSERT INTO role
	(title, salary, department_id)
VALUES
	("R1", 1000000.00, 1),
	("R2", 100000.00, 3),
	("R2", 90000.00, 2),
	("R3", 50000.00, 1);

INSERT INTO department
	(name)
VALUES
	("D1"),
	("D2"),
	("D3");