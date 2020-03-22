const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");

const mysqlPort = 3306;

const connection = mysql.createConnection({
  host: "localhost",
  port: mysqlPort,
  user: "root",
  password: "password1",
  database: "employees_db"
});

// main menu selection options
const mainChoices = [
  "View All Employees",
  "View All Employees by Department",
  "View All Employees by Manager",
  "Add Employee",
  "Remove Employee",
  "Update Employee Role",
  "Update Employee Manager",
  "View All Roles",
  "Add Role",
  "Remove Role",
  "Add Department",
  "View All Departments",
  "Remove Department",
  "View Department Budget",
  "Exit"
];

// setup queries
const setupTables = function() {
  let query;

  // employees table
  query = connection.query(`DROP TABLE IF EXISTS employees;`, function(
    err,
    res
  ) {
    if (err) throw err;
  });
  query = connection.query(
    `CREATE TABLE employees(
        id INT NOT NULL AUTO_INCREMENT,
        first_name VARCHAR(30) NOT NULL,
        last_name VARCHAR(30) NOT NULL,
        role_id INT NOT NULL,
        manager_id INT NOT NULL,
        PRIMARY KEY(id)
        );`,
    function(err, res) {
      if (err) throw err;
    }
  );
  query = connection.query(
    `INSERT INTO employees(first_name, last_name, role_id, manager_id) VALUES
        ("AF", "AL", 3, 2),
        ("BF", "BL", 1, 1),
        ("CF", "CL", 2, 2),
        ("DF", "DL", 2, 3);`,
    function(err, res) {
      if (err) throw err;
    }
  );

  // role table
  query = connection.query(`DROP TABLE role`, function(err, res) {
    if (err) throw err;
  });
  query = connection.query(
    `CREATE TABLE role(
        id INT NOT NULL AUTO_INCREMENT,
        title VARCHAR(30) NOT NULL,
        salary DECIMAL NOT NULL,
        department_id INT NOT NULL,
        PRIMARY KEY(id)
        );`,
    function(err, res) {
      if (err) throw err;
    }
  );
  query = connection.query(
    `INSERT INTO role(title, salary, department_id) VALUES
        ("R1", 1000000.00, 1),
        ("R2", 100000.00, 3),
        ("R2", 90000.00, 2),
        ("R3", 50000.00, 1);`,
    function(err, res) {
      if (err) throw err;
    }
  );

  // department table
  query = connection.query(`DROP TABLE department;`, function(err, res) {
    if (err) throw err;
  });
  query = connection.query(
    `CREATE TABLE department(
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(30) NOT NULL,
        PRIMARY KEY(id)
        );`,
    function(err, res) {
      if (err) throw err;
    }
  );
  query = connection.query(
    `INSERT INTO department(name) VALUES
        ("D1"),
        ("D2"),
        ("D3")`,
    function(err, res) {
      if (err) throw err;
    }
  );
  console.log(
    "\n==============================\n    Tables have been reset.\n==============================\n"
  );
};

const { promisify } = require("util");

//helper functions
let getDepartments = function(role) {
  return new Promise(function(resolve, reject) {
    if (role) {
      connection.query(
        `SELECT department.name FROM department 
        INNER JOIN role ON department.id=role.department_id WHERE role.title=?`,
        role,
        function(err, res) {
          if (err) reject(new Error(err));
          console.log(res);
          let ra = new Set();
          res.forEach(item => ra.add(item.name));
          departments = [...ra];
          resolve([...ra]);
        }
      );
    } else {
      connection.query(`SELECT name FROM department`, function(err, res) {
        if (err) reject(new Error(err));
        console.log(res);
        let ra = new Set();
        res.forEach(item => ra.add(item.name));
        departments = [...ra];
        resolve([...ra]);
      });
    }
  });
};

let getRoles = function(department) {
  return new Promise(function(resolve, reject) {
    if (department) {
      connection.query(
        `SELECT role.title FROM role 
            INNER JOIN department ON department.id=role.department_id WHERE department.name=?`,
        role,
        function(err, res) {
          if (err) reject(new Error(err));
          console.log(res);
          let ra = new Set();
          res.forEach(item => ra.add(item.title));
          resolve([...ra]);
        }
      );
    } else {
      connection.query(`SELECT title FROM role`, function(err, res) {
        if (err) reject(new Error(err));
        console.log(res);
        let ra = new Set();
        res.forEach(item => ra.add(item.title));
        resolve([...ra]);
      });
    }
  });
};

// main queries
//first, last, title, department, salary, manager
const viewEmployees = function() {
  const query = connection.query(
    `SELECT employees.first_name, employees.last_name, role.salary, role.title AS role, department.name AS department FROM employees
    INNER JOIN role ON employees.role_id=role.id 
    INNER JOIN department ON role.department_id=department.id`,
    function(err, res) {
      if (err) throw err;
      console.table(res);
      promptTask();
    }
  );
};

const viewByDepartment = async function() {
  departments = await getDepartments();
  let p = await inquirer.prompt([
    {
      type: "input",
      message: "Enter department:",
      name: "department"
    }
  ]);
  let department = p.department;

  const query = connection.query(
    `SELECT employees.first_name, employees.last_name, role.title, role.salary, department.name FROM employees
    INNER JOIN role ON employees.role_id=role.id 
    INNER JOIN department ON role.department_id=department.id 
    WHERE department.name=?;`,
    department,
    function(err, res) {
      if (err) throw err;
      if (res.length === 0) {
        console.log("department not found");
      } else {
        console.table(res);
      }
      promptTask();
    }
  );
};

const viewByManager = async function() {
  let p = await inquirer.prompt([
    {
      type: "input",
      message: "Manager's first name:",
      name: "managerFirst"
    },
    {
      type: "input",
      message: "Manager's last name:",
      name: "managerLast"
    }
  ]);

  const query = connection.query(
    `SELECT employees.first_name, employees.last_name, role.title, role.salary, department.name FROM employees 
    INNER JOIN role ON employees.role_id=role.id
    INNER JOIN department ON role.department_id=department.id 
    WHERE employees.manager_id=(SELECT id from employees WHERE first_name=? AND last_name=?);`,
    [p.managerFirst, p.managerLast],
    function(err, res) {
      if (err) throw err;
      if (res.length === 0) {
        console.log("manager not found\n");
      } else {
        console.table(res);
      }
      promptTask();
    }
  );
};

const addEmployee = async function(details) {
  // name, role title, manager name
  let p = await inquirer.prompt([
    {
      type: "input",
      message: "Employee first name:",
      name: "employeeFirst"
    },
    {
      type: "input",
      message: "Employee last name:",
      name: "employeeLast"
    },
    {
      type: "input",
      message: "Employee role:",
      name: "role"
    },
    {
      type: "input",
      message: `Employee's department:`,
      name: "department"
    },
    {
      type: "input",
      message: "Manager's first name:",
      name: "managerFirst"
    },
    {
      type: "input",
      message: "Manager's last name",
      name: "managerLast"
    }
  ]);

  const query = connection.query(
    `INSERT INTO employees(first_name, last_name, role_id, manager_id) 
    VALUES (?,?,
	(SELECT id FROM role WHERE role.title=? AND role.department_id=(SELECT id FROM department WHERE department.name=?)),
    (SELECT * FROM (SELECT id from employees WHERE first_name=? AND last_name=?) tmpTbl));`,
    [
      p.employeeFirst,
      p.employeeLast,
      p.role,
      p.department,
      p.managerFirst,
      p.managerLast
    ],
    function(err, res) {
      if (err) throw err;
      console.log(
        `Employee ${p.employeeFirst} ${p.employeeLast} added with role ${p.role}, in department ${p.department} with manager ${p.managerFirst} ${p.managerLast}`
      );
      promptTask();
    }
  );
};

const removeEmployee = async function() {
  let p = await inquirer.prompt([
    {
      type: "input",
      message: "Employee first name:",
      name: "employeeFirst"
    },
    {
      type: "input",
      message: "Employee last name:",
      name: "employeeLast"
    }
  ]);
  const query = connection.query(
    `DELETE employees FROM employees
    INNER JOIN role ON employees.role_id=role.id
    INNER JOIN department ON role.department_id=department.id
    WHERE (employees.first_name=? AND employees.last_name=?);`,
    [p.employeeFirst, p.employeeLast],
    function(err, res) {
      if (err) throw err;
      if (res.affectedRows === 0) {
        console.log("The employee entered does not exist, nothing updated.\n");
      } else {
        console.log(`employee: ${p.employeeFirst} ${p.employeeLast} deleted`);
      }
      promptTask();
    }
  );
};

// update employee role
const updateEmployeeRole = async function() {
  // employee name (first/last), new role
  // assume role is only unique to department level
  // break name into first and last
  let p = await inquirer.prompt([
    {
      type: "input",
      message: "Employee first name:",
      name: "employeeFirst"
    },
    {
      type: "input",
      message: "Employee last name:",
      name: "employeeLast"
    },
    {
      type: "input",
      message: `Employee's new role:`,
      name: "role"
    },
    {
      type: "input",
      message: `Employee's department:`,
      name: "department"
    }
  ]);

  const query = connection.query(
    `UPDATE employees
    INNER JOIN role ON employees.role_id=role.id
    SET role_id=(SELECT id FROM role WHERE title=? 
	    AND role.department_id=(SELECT id FROM department WHERE name=?))
    WHERE (employees.first_name=? AND employees.last_name=?);`,
    [p.role, p.department, p.employeeFirst, p.employeeLast],
    function(err, res) {
      if (err) throw err;
      if (res.changedRows === 0) {
        console.log("Could not update role based on the given information.\n");
      } else {
        console.log(
          `employee: ${p.employeeFirst} ${p.employeeLast}'s role updated to ${p.role}, ${p.department}`
        );
      }
      promptTask();
    }
  );
};

// update employee manager
const updateManager = async function(names) {
  //  manager name, employee name
  let p = await inquirer.prompt([
    {
      type: "input",
      message: "Employee first name:",
      name: "employeeFirst"
    },
    {
      type: "input",
      message: "Employee last name:",
      name: "employeeLast"
    },
    {
      type: "input",
      message: "Manager's first name:",
      name: "managerFirst"
    },
    {
      type: "input",
      message: "Manager's last name:",
      name: "managerLast"
    }
  ]);

  const query = connection.query(
    `UPDATE employees
    SET manager_id=(SELECT * FROM 
        (SELECT id FROM employees WHERE first_name=? AND last_name=?) tmpTbl)
    WHERE (first_name=? AND last_name=?);`,
    [p.managerFirst, p.managerLast, p.employeeFirst, p.employeeLast],
    function(err, res) {
      if (err) throw err;
      if (res.changedRows === 0) {
        console.log(
          "Either the employee or manager does not exist, nothing updated.\n"
        );
      } else {
        console.log(
          `${p.employeeFirst} ${p.employeeLast}'s manager updated to ${p.managerFirst} ${p.managerLast}`
        );
      }
      promptTask();
    }
  );
};

// view roles
const viewRoles = function() {
  const query = connection.query(
    `SELECT role.title AS role, role.salary, department.name AS department FROM role
    INNER JOIN department ON department.id=role.department_id;`,
    function(err, res) {
      if (err) throw err;
      console.table(res);
      promptTask();
    }
  );
};

// add a new role
const addRole = async function() {
  // title, salary, department name
  let roles = await getRoles(null);
  let departments;
  let p = await inquirer.prompt([
    {
      type: "list",
      message: "Specify the role", // before when
      name: "title",
      choices: roles
    },
    {
      type: "input",
      message: `Salary:`,
      name: "salary"
    }
  ]);
  console.log(roles);
  console.log(p.title);
  departments = await getDepartments(p.title);
  console.log(departments);
  let p2 = await inquirer.prompt([
    {
      type: "list",
      message: `Department:`,
      name: "department",
      choices: departments
    }
  ]);

  const query = connection.query(
    `INSERT role(title, salary, department_id) VALUES
    (?,?,(SELECT id FROM department WHERE name=?));`,
    [p.title, p.salary, p2.department],
    function(err, res) {
      if (err) throw err;
      console.log(
        `Role ${p.title} with salary ${p.salary} added to department ${p.department}`
      );
      promptTask();
    }
  );
};

// remove a roll
const removeRole = async function() {
  // title, department
  let p = await inquirer.prompt([
    {
      type: "input",
      message: `Role name:`,
      name: "role"
    },
    {
      type: "input",
      message: `Department name:`,
      name: "department"
    }
  ]);

  const query = connection.query(
    `DELETE role FROM role
    WHERE title=?
    AND department_id=(SELECT id FROM department WHERE name=?);`,
    [p.role, p.department],
    function(err, res) {
      if (err) throw err;
      if (res.affectedRows === 0) {
        console.log("Could not find role, nothing deleted.\n");
      } else {
        console.log(`role ${p.role} in department ${p.department} removed`);
      }
      promptTask();
    }
  );
};

// view departments
const viewDepartments = function() {
  const query = connection.query(`SELECT name FROM department;`, function(
    err,
    res
  ) {
    if (err) throw err;
    console.table(res);
    promptTask();
  });
};

// add a new department
const addDepartment = async function() {
  let p = await inquirer.prompt([
    {
      type: "input",
      message: `Department name to add:`,
      name: "department"
    }
  ]);

  const query = connection.query(
    `INSERT INTO department(name) VALUES (?);`,
    p.department,
    function(err, res) {
      if (err) throw err;
      console.log(`department ${p.department} added`);
      promptTask();
    }
  );
};

// remove a department
const removeDepartment = async function(deptName) {
  let p = await inquirer.prompt([
    {
      type: "input",
      message: `Department name to remove:`,
      name: "department"
    }
  ]);

  const query = connection.query(
    `DELETE department FROM department
    WHERE name=?;`,
    p.department,
    function(err, res) {
      if (err) throw err;
      if (res.affectedRows === 0) {
        console.log("Could not find department, nothing deleted.\n");
      } else {
        console.log(`department ${p.department} removed`);
      }
      promptTask();
    }
  );
};

// passes chosen action off to applicable function
const promptTask = async function() {
  let answer = await inquirer.prompt({
    name: "action",
    type: "list",
    message: "What would you like to do?",
    choices: mainChoices
  });
  switch (answer.action) {
    case "View All Employees":
      viewEmployees();
      break;
    case "View All Employees by Department":
      viewByDepartment();
      break;
    case "View All Employees by Manager":
      viewByManager();
      break;
    case "Add Employee":
      addEmployee();
      break;
    case "Remove Employee":
      removeEmployee();
      break;
    case "Update Employee Role":
      updateEmployeeRole();
      break;
    case "Update Employee Manager":
      updateManager();
      break;
    case "View All Roles":
      viewRoles();
      break;
    case "Add Role":
      addRole();
      break;
    case "Remove Role":
      removeRole();
      break;
    case "Add Department":
      addDepartment();
      break;
    case "View All Departments":
      viewDepartments();
      break;
    case "Remove Department":
      removeDepartment();
      break;
    case "Exit":
      connection.end();
      break;
  }
};

const main = async function() {
  connection.connect(function(err) {
    if (err) throw err;
  });

  if (process.argv.length > 2) {
    if (process.argv[2] === "--reset" || process.argv[2] === "-r") {
      setupTables();
    }
  }
  promptTask();
};

main();
