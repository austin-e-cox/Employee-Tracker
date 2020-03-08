const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');

// const PORT = process.env.PORT || 3000;
const mysqlPort = 3306;

const connection = mysql.createConnection({
    host: "localhost",
    port: mysqlPort,
    user: "root",
    password: "password1",
    database: "employees_db"
})

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
]

// setup queries
const setupTables = function(){
    let query;
    
    // employees table
    query = connection.query(`
        DROP TABLE IF EXISTS employees;`,
        function(err, res){
            if (err) throw err;
        }
    );
    query = connection.query(`
        CREATE TABLE employees(
        id INT NOT NULL AUTO_INCREMENT,
        first_name VARCHAR(30) NOT NULL,
        last_name VARCHAR(30) NOT NULL,
        role_id INT NOT NULL,
        manager_id INT,
        PRIMARY KEY(id)
        );`,
        function(err, res){
            if (err) throw err;
        }
    );
    query = connection.query(`
        INSERT INTO employees(first_name, last_name, role_id, manager_id) VALUES
        ("AF", "AL", 3, 2),
        ("BF", "BL", 1, 1),
        ("CF", "CL", 2, 2);`,
        function(err, res){
            if (err) throw err;
        }
    );

    // role table
    query = connection.query(`
        DROP TABLE role`,
        function(err, res){
            if (err) throw err;
        }
    );
    query = connection.query(`
        CREATE TABLE role(
        id INT NOT NULL AUTO_INCREMENT,
        title VARCHAR(30) NOT NULL,
        salary DECIMAL NOT NULL,
        department_id INT NOT NULL,
        PRIMARY KEY(id)
        );`,
        function(err, res){
            if (err) throw err;
        }
    );
    query = connection.query(`
        INSERT INTO role(title, salary, department_id) VALUES
        ("R1", 1000000.00, 1),
        ("R2", 100000.00, 3),
        ("R2", 90000.00, 2);`,
        function(err, res){
            if (err) throw err;
        }
    );

    // department table
    query = connection.query(`
        DROP TABLE department;`,
        function(err, res){
            if (err) throw err;
        }
    );
    query = connection.query(`
        CREATE TABLE department(
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(30) NOT NULL,
        PRIMARY KEY(id)
        );`,
        function(err, res){
            if (err) throw err;
        }
    );
    query = connection.query(`
        INSERT INTO department(name) VALUES
        ("D1"),
        ("D2"),
        ("D3")`,
        function(err, res){
            if (err) throw err;
        }
    );
    console.log("\n==============================\n    Tables have been reset.\n==============================\n");
}


// main queries

//first, last, title, department, salary, manager
const viewEmployees = function(){
    const query = connection.query(`SELECT employees.first_name, employees.last_name, role.salary, role.title AS role, department.name AS department FROM employees
    INNER JOIN role ON employees.role_id=role.id 
    INNER JOIN department ON role.department_id=department.id`,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    });
}

const viewByDepartment = async function(){
    let p = await inquirer.prompt([
        {
            type: 'input',
            message: 'Enter department:',
            name: 'department'
        }
    ]);
    console.log(p);
    let department = p.department;

    const query = connection.query(`SELECT employees.first_name, employees.last_name, role.title, role.salary, department.name FROM employees
    INNER JOIN role ON employees.role_id=role.id 
    INNER JOIN department ON role.department_id=department.id 
    WHERE department.name=?;`,
    department,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    });
}

const viewByManager = async function(){
    let p = await inquirer.prompt([
        {
            type: 'input',
            message: 'Enter manager name:',
            name: 'manager'
        }
    ]);

    let name = p.manager.split(" ")
    if (name.length != 2){
        throw console.error("invalid first and last name for manager");
    }
    const query = connection.query(`SELECT employees.first_name, employees.last_name, role.title, role.salary, department.name FROM employees 
    INNER JOIN role ON employees.role_id=role.id
    INNER JOIN department ON role.department_id=department.id 
    WHERE employees.manager_id=(SELECT id from employees WHERE first_name=? AND last_name=?);`,
    name,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const addEmployee = async function(details){
    // name, role title, manager name
    let p = await inquirer.prompt([
        {
            type: 'input',
            message: 'Employee name:',
            name: 'employee'
        },
        {
            type: 'input',
            message: 'Employee role:',
            name: 'role'
        },
        {
            type: 'input',
            message: `Employee's department:`,
            name: 'department'
        },
        {
            type: 'input',
            message: 'Employee manager:',
            name: 'manager'
        },
    ]);

    let employee = p.employee.split(" ")
    if (employee.length != 2){
        throw console.error("invalid first and last name for employee");
    }
    let manager = p.manager.split(" ")
    if (manager.length != 2){
        throw console.error("invalid first and last name for manager");
    }

    const query = connection.query(`INSERT INTO employees(first_name, last_name, role_id, manager_id) 
    VALUES (?,?,
	(SELECT id FROM role WHERE role.title=? AND role.department_id=(SELECT id FROM department WHERE department.name=?)),
    (SELECT * FROM (SELECT id from employees WHERE first_name=? AND last_name=?) tmpTbl));`,
    [employee[0], employee[1], p.role, p.department, manager[0], manager[1]],
    function(err, res){
        if (err) throw err;
        console.log(`Employee ${p.employee} added with role ${p.role}, in department ${p.department} and manager ${p.manger}`);
        //console.table(res);
        promptTask();
    });
    
}

const removeEmployee = async function(){
    let p = await inquirer.prompt([
        {
            type: 'input',
            message: 'Enter employee name:',
            name: 'employee'
        }
    ]);
    // name
    let name = p.employee.split(" ")
    if (name.length != 2){
        throw console.error("invalid first and last name for employee");
    }
    const query = connection.query(`DELETE employees FROM employees
    INNER JOIN role ON employees.role_id=role.id
    INNER JOIN department ON role.department_id=department.id
    WHERE (employees.first_name=? AND employees.last_name=?);`,
    name,
    function(err, res){
        if (err) throw err;
        console.log(`employee: ${p.employee} deleted`);
        promptTask();
    })
}

// update employee role
const updateEmployeeRole = async function(){
    // employee name (first/last), new role
    // assume role is only unique to department level
    // break name into first and last
    let p = await inquirer.prompt([
        {
            type: 'input',
            message: `Employee's name:`,
            name: 'employee'
        },
        {
            type: 'input',
            message: `Employee's new role:`,
            name: 'role'
        },
        {
            type: 'input',
            message: `Employee's department:`,
            name: 'department'
        },
    ]);
    
    let name = p.employee.split(" ")
    if (name.length != 2){
        throw console.error("invalid first and last name for employee");
    }

    const query = connection.query(`
    UPDATE employees
    INNER JOIN role ON employees.role_id=role.id
    SET role_id=(SELECT id FROM role WHERE title=? 
	    AND role.department_id=(SELECT id FROM department WHERE name=?))
    WHERE (employees.first_name=? AND employees.last_name=?);`,
    [p.role, p.department, name[0], name[1]],
    function(err, res){
        if (err) throw err;
        console.log(`employee:${p.employee}'s role updated to ${p.role}, ${p.department}`)
        //console.table(res);
        promptTask();
    })
}

const updateManager = async function(names){
    //  manager name, employee name
    let p = await inquirer.prompt([
        {
            type: 'input',
            message: `Employee's name:`,
            name: 'employee'
        },
        {
            type: 'input',
            message: `Employee's new manager:`,
            name: 'manager'
        },
    ]);
    let employee = p.employee.split(" ")
    if (employee.length != 2){
        throw console.error("invalid first and last name for employee");
    }
    let manager = p.manager.split(" ")
    if (manager.length != 2){
        throw console.error("invalid first and last name for manager");
    }

    const query = connection.query(`UPDATE employees
    SET manager_id=(SELECT * FROM 
        (SELECT id FROM employees WHERE first_name=? AND last_name=?) tmpTbl)
    WHERE (first_name=? AND last_name=?);`,
    [...manager, ...employee],
    function(err, res){
        if (err) throw err;
        console.log(`${p.employee}'s manager updated to ${p.manager}`);
        promptTask();
    })
}

const viewRoles = function(){
    const query = connection.query(`SELECT role.title AS role, role.salary, department.name AS department FROM role
    INNER JOIN department ON department.id=role.department_id;`,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const addRole = async function(){
    // title, salary, department name
    let p = await inquirer.prompt([
        {
            type: 'input',
            message: `Role Title:`,
            name: 'title'
        },
        {
            type: 'input',
            message: `Salary:`,
            name: 'salary'
        },
        {
            type: 'input',
            message: `Department:`,
            name: 'department'
        }
    ]);
    const query = connection.query(`INSERT role(title, salary, department_id) VALUES
    (?,?,(SELECT id FROM department WHERE name=?));`,
    [p.title,p.salary,p.department],
    function(err, res){
        if (err) throw err;
        console.log(`Role ${p.title} with salary ${p.salary} added to department ${p.department}`)
        //(res);
        promptTask();
    })
}

const removeRole = async function(){
    // title, department
    let p = await inquirer.prompt([
        {
            type: 'input',
            message: `Role name:`,
            name: 'role',
        },
        {
            type: 'input',
            message: `Department name:`,
            name: 'department'
        }
    ]);

    const query = connection.query(`DELETE role FROM role
    WHERE title=?
    AND department_id=(SELECT id FROM department WHERE name=?);`,
    [p.role, p.department],
    function(err, res){
        if (err) throw err;
        console.log(`role ${p.role} in department ${p.department} removed`);
        //console.table(res);
        promptTask();
    })
}

const viewDepartments = function(){
    const query = connection.query(`SELECT name FROM department;`,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const addDepartment = async function(){
    let p = await inquirer.prompt([
        {
            type: 'input',
            message: `Department name to add:`,
            name: 'department'
        }
    ]);
            
    const query = connection.query(`INSERT INTO department(name) VALUES (?);`,
    p.department,
    function(err, res){
        if (err) throw err;
        console.log(`department ${p.department} added`);
        //console.table(res);
        promptTask();
    })
}

// const viewBudget = async function(){
//     let p = await inquirer.prompt([
//         {
//             type: 'input',
//             message: `Department:`,
//             name: 'department'
//         }
//     ]);
            
//     const query = connection.query(`INSERT INTO department(name) VALUES (?);`,
//     p.department,
//     function(err, res){
//         if (err) throw err;
//         console.log(`department ${p.department} added`);
//         //console.table(res);
//         promptTask();
//     })
// }

const removeDepartment = async function(deptName){
    let p = await inquirer.prompt([
        {
            type: 'input',
            message: `Department name to remove:`,
            name: 'department'
        }
    ]);

    const query = connection.query(`DELETE department FROM department
    WHERE name=?;`,
    p.department,
    function(err, res){
        if (err) throw err;
        console.log(`department ${p.department} removed`);
        //console.table(res);
        promptTask();
    })
}


const promptTask = async function (){
    let answer = await inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: mainChoices
    });
    switch (answer.action){
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
        //case "View Department Budget":
        //    viewBudget();
        //    break;
        case "Exit":
            connection.end();
            break; 
    }
    //console.log(answer);
}

const main = async function() {
    connection.connect(function (err) {
        if (err) throw err;
        // console.log(`connection established as id ${connection.threadId}`);
    });

    if (process.argv.length > 2){
        if (process.argv[2]==="--reset" || process.argv[2] === "-r"){
            setupTables();
        }    
    }
    promptTask();
}

main()