const inquirer = require("inquirer")
const mysql = require("mysql")

// const PORT = process.env.PORT || 3000;
const mysqlPort = 3306

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password1",
    database: "employees_db"
})

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
    "Remove Departments",
    "Exit"
]

const setupTables = function(){
    let query;
    // create employees table
    query = connection.query(`CREATE TABLE IF NOT EXISTS employees(
        id INT NOT NULL AUTO_INCREMENT,
        first_name VARCHAR(30),
        last_name VARCHAR(30),
        role_id INT,
        manager_id INT,
        PRIMARY KEY(id)
    );`,
    function(err, res){
        if (err) throw err;
    });

    query = connection.query(`CREATE TABLE IF NOT EXISTS role(
        id INT NOT NULL AUTO_INCREMENT,
        title VARCHAR(30),
        salary DECIMAL,
        department_id INT,
        PRIMARY KEY(id)
        );`,
        function(err, res){
            if (err) throw err;
        });

    query = connection.query(`CREATE TABLE IF NOT EXISTS department(
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(30),
        PRIMARY KEY(id)
        );`,
        function(err, res){
            if (err) throw err;
        });
    console.log("setup complete.")
}

const viewEmployees = function(){
    const query = connection.query(`SELECT first_name, last_name FROM employees
    INNER JOIN role ON employees.id=role.id`,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    });
}

const viewByDepartment = function(){
    const query = connection.query(``,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const viewByManager = function(){
    const query = connection.query(``,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const addEmployee = function(){
    const query = connection.query(``,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const removeEmployee = function(){
    const query = connection.query(``,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const updateRole = function(){
    const query = connection.query(``,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const updateManager = function(){
    const query = connection.query(``,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const viewRoles = function(){
    const query = connection.query(``,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const addRole = function(){
    const query = connection.query(``,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const removeRole = function(){
    const query = connection.query(``,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const viewDepartments = function(){
    const query = connection.query(``,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const addDepartment = function(){
    const query = connection.query(``,
    function(err, res){
        if (err) throw err;
        console.table(res);
        promptTask();
    })
}

const removeDepartment = function(){
    const query = connection.query(``,
    function(err, res){
        if (err) throw err;
        console.table(res);
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
            updateRole();
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
    console.log(answer);
}

const main = async function() {
    connection.connect(function (err) {
        if (err) throw err;
        // console.log(`connection established as id ${connection.threadId}`);
    })
    setupTables();
    promptTask();
}

main()