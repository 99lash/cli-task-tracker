const fs = require('fs');
const path = require('path');
const process = require('process');

const storagePath = path.join(__dirname, 'data', 'tasks.json');

const Color = {
  reset: '\x1b[0m',
  white: '\x1b[37m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

const Background = {
  black: '\x1b[40m',
  red: '\x1b[41m',
  green: '\x1b[42m',
  blue: '\x1b[44m'
}

const query = process.argv.slice(2);
const operation = query[0];

if (operation === '--help' || operation === '-h') {
  displayHelp();
  return;
}
const args = query.slice(1);
// console.log(args);
// console.log(query);
// console.log(operation !== '--list' && operation !== '-l' && query <= 0);
if (operation !== '--list' && operation !== '-l' && query <= 0) {
  displayHelp();
  return;
}
checkQuery();

function retrieveTasksData() {
  const dirname = path.dirname(storagePath);
  const filename = path.basename(storagePath);

  if (!fs.existsSync(dirname)) {
    // console.log('directory does not exist.');
    console.log(`created new folder: ${dirname}`);
    fs.mkdirSync(dirname);
  }

  if (!fs.existsSync(storagePath)) {
    // console.log('File does not exist.');
    console.log(`created new database: ${filename}`);
    writeDataToFile([]);
  }

  return new Promise((resolve, reject) => {
    fs.readFile(storagePath, async (err, data) => {
      if (err) reject(err);
      resolve(JSON.parse(data));
    });
  });
}

function addTask(tasks) {
  tasks.sort((a, b) => a.id - b.id);
  args.forEach((taskName) => {
    const newId = tasks.length + 1;
    const newTask = {
      id: newId,
      description: taskName,
      completed: false,
      inProgress: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    tasks.push(newTask);
  });
  writeDataToFile(tasks);
  listTasks(tasks);
}

function listTasks(tasks) {
  if (tasks.length <= 0) {
    console.log('Yey, no tasks for today ;>');
    return;
  }

  // const meow = new Date(tasks[0].createdAt);
  // console.log(meow.toLocaleDateString())
  // console.log(meow.toLocaleTimeString())
  const sortedTasks = tasks.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  sortedTasks.forEach(task => {
    console.log(task);
  });
}

function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === parseInt(id));
}

function updateTaskById(tasks) {
  if (args.length > 2) {
    console.log('Provide valid task description');
    return;
  }

  const id = args[0];
  const newDescription = args[1];
  const task = findTaskById(tasks, id);

  if (task) {
    task.description = newDescription;
    task.updatedAt = new Date();
    console.log(task);
    writeDataToFile(tasks);
  } else {
    console.log(`Task not found with the id of ${id}.`)
  }
}

async function checkQuery() {
  const response = await retrieveTasksData();
  let tasks = response;
  switch (operation.toLowerCase()) {
    case '--add':
    case '-a':
      addTask(tasks);
      break;

    case '--list':
    case '-l':
      listTasks(tasks);
      break;

    case '--update':
    case '-u':
      updateTaskById(tasks);
      break;

    default:
      displayHelp();
      break;
  }
}

function writeDataToFile(tasks) {
  fs.writeFile(storagePath, JSON.stringify(tasks), 'utf-8', (err) => {
    if (err) throw err;
  });
}

function displayHelp() {
  console.log(`${Background.blue} Usage: ${Color.reset}\n\tnode taskcli [ operations ] [ arguments | tasks ]`);
  console.log(`\n${Background.blue} Operations: ${Color.reset}`);
  console.log(`\t${Color.green}--add, -a${Color.reset}\tAdd a task.\n\t\t\t${Color.red}Syntax:${Color.reset} --add <tasks> (e.g. --add "wash dishes").\n`);
  console.log(`\t${Color.green}--list, -l${Color.reset}\tList all tasks.\n\t\t\t${Color.red}Syntax:${Color.reset} --list.\n`);
  console.log(`\t${Color.green}--update, -u${Color.reset}\tUpdate a task.\n\t\t\t${Color.red}Syntax:${Color.reset} --update <id> <new-task-description> (e.g. --update 2 "wash the dishes").\n`);
}