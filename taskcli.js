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
    let newId;
    if (tasks.length > 0) {
      newId = tasks[tasks.length - 1].id + 1;
    } else {
      newId = 1;
    }
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
  console.log(`${Background.blue}Added new task: ${tasks[tasks.length-1].description}.${Color.reset}`);
}

function listTasks(tasks) {
  if (tasks.length <= 0) {
    console.log('Yey, no tasks for today ;>');
    return;
  }

  if (args.length > 1) {
    console.log('Provide a valid status to list the tasks.');
    return;
  }
  const status = (args[0]) ? args[0].toLowerCase() : '';
  const sortedDescendingTasks = tasks.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));



  if (status.length === 0) {
    console.log(sortedDescendingTasks);
    return;
  } else if (status === 'todo') {
    // const meow = new Date(tasks[0].createdAt);
    // console.log(meow.toLocaleDateString())
    // console.log(meow.toLocaleTimeString())
    const tasksFilteredAsTodo = sortedDescendingTasks.filter((task) => task.completed === false && task.inProgress === false);
    console.log(tasksFilteredAsTodo);
    return;
  } else if (status === 'done') {
    const tasksFilteredAsDone = sortedDescendingTasks.filter((task) => task.completed === true);
    console.log(tasksFilteredAsDone);
    return;
  } else if (status === 'in-progress') {
    const tasksFilteredAsInProgress = sortedDescendingTasks.filter((task) => task.inProgress === true);
    console.log(tasksFilteredAsInProgress);
    return;
  }

  if (status.startsWith('to') || status.endsWith('o')) {
    console.log(`${Background.red}Incorrect status. Do you mean "todo"?${Color.reset}`);
  } else if (status.startsWith('in') || status.endsWith('s')) {
    console.log(`${Background.red}Incorrect status. Do you mean "in-progress"?${Color.reset}`);
  } else if (status.startsWith('do') || status.endsWith('e')) {
    console.log(`${Background.red}Incorrect status. Do you mean "done"?${Color.reset}`);
  } else {
    console.log(`${Background.red}Incorrect status${Color.reset}`);
  }
}

function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === parseInt(id));
}

function updateTaskById(tasks) {
  if (args.length > 2) {
    console.log('Provide a new valid task description to update.');
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
    console.log(`${Background.red}Task not found with the id: ${id}${Color.reset}`);
  }
}

function deleteTaskById(tasks) {
  if (args.length < 1 || args.length > 1) {
    console.log('Provide a valid task id to delete.');
    return;
  }
  const id = args[0];
  const task = findTaskById(tasks, id);

  if (task) {
    tasks = tasks.filter((task) => task.id !== parseInt(id));
    writeDataToFile(tasks);
    console.log(`${Background.blue}Task removed succesfully!${Color.reset}`)
    return;
  }
  console.log(`${Background.red}Task not found with the id: ${id}${Color.reset}`);
}

function markTodoById(tasks) {
  if (args.length < 1 || args.length > 1) {
    console.log('Provide a valid task id to mark as todo.');
    return;
  }
  const id = args[0];
  const task = findTaskById(tasks, id);

  if (task) {
    task.completed = (task.completed === true) && false;
    task.inProgress = (task.inProgress === true) && false;
    console.log(`${Background.blue}Task mark as todo.${Color.reset}`);
    // console.log(tasks);
    writeDataToFile(tasks);
    return;
  }
  console.log(`${Background.red}Task not found with the id: ${id}${Color.reset}`);
}

function markInProgressById(tasks) {
  if (args.length < 1 || args.length > 1) {
    console.log('Provide a valid task id to mark as in progress.');
    return;
  }
  const id = args[0];
  const task = findTaskById(tasks, id);

  if (task) {
    task.completed = (task.completed === true) && false;
    task.inProgress = true;
    console.log(`${Background.blue}Task mark as in progress.${Color.reset}`);
    // console.log(tasks);
    writeDataToFile(tasks);
    return;
  }
  console.log(`${Background.red}Task not found with the id: ${id}${Color.reset}`);
}

function markAsDoneById(tasks) {
  if (args.length < 1 || args.length > 1) {
    console.log('Provide a valid task id to mark as done.');
    return;
  }
  const id = args[0];
  const task = findTaskById(tasks, id);

  if (task) {
    task.inProgress = (task.inProgress === true) && false;
    task.completed = true;
    console.log(`${Background.blue}Task mark as done.${Color.reset}`);
    // console.log(tasks);
    writeDataToFile(tasks);
    return;
  }
  console.log(`${Background.red}Task not found with the id: ${id}${Color.reset}`);
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

    case '--delete':
    case '-d':
      deleteTaskById(tasks);
      break;

    case '--mark-todo':
    case '-mt':
      markTodoById(tasks);
      break;

    case '--mark-in-progress':
    case '-mp':
      markInProgressById(tasks);
      break;

    case '--mark-done':
    case '-md':
      markAsDoneById(tasks);
      break;

    default:
      console.log(`See "node taskcli --help" for command usage.`);
      break;
  }
}

function writeDataToFile(tasks) {
  fs.writeFile(storagePath, JSON.stringify(tasks), 'utf-8', (err) => {
    if (err) throw err;
  });
}

function displayHelp() {
  console.log(`${Background.blue} Usage: ${Color.reset}\nnode taskcli [ operations ] [ arguments | tasks ]`);
  console.log(`\n${Background.blue} Operations: ${Color.reset}`);
  console.log(`${Color.green}--add, -a${Color.reset}\t\t\tAdd a task.\n\t\t\t\t${Color.red}Syntax:${Color.reset} --add <tasks> (e.g. --add "wash dishes").\n`);
  console.log(`${Color.green}--list, -l${Color.reset}\t\t\tList all tasks.\n\t\t\t\t${Color.red}Syntax:${Color.reset} --list <status | null> (e.g. --list done, --list in-progress, --list todo).\n`);
  console.log(`${Color.green}--update, -u${Color.reset}\t\t\tUpdate a task.\n\t\t\t\t${Color.red}Syntax:${Color.reset} --update <id> <new-task-description> (e.g. --update 2 "wash the dishes").\n`);
  console.log(`${Color.green}--delete, -d${Color.reset}\t\t\tDelete a task.\n\t\t\t\t${Color.red}Syntax:${Color.reset} --delete <id> (e.g. --delete 2).\n`);
  console.log(`${Color.green}--mark-todo, -mt${Color.reset}\t\tMark a task as todo.\n\t\t\t\t${Color.red}Syntax:${Color.reset} --mark-todo <id> (e.g. --mark-todo 2).\n`);
  console.log(`${Color.green}--mark-in-progress, -mp${Color.reset}\t\tMark a task as in progress.\n\t\t\t\t${Color.red}Syntax:${Color.reset} --mark-in-progress <id> (e.g. --mark-in-progress 2).\n`);
  console.log(`${Color.green}--mark-done, -md${Color.reset}\t\tMark a task as done.\n\t\t\t\t${Color.red}Syntax:${Color.reset} --mark-done <id> (e.g. --mark-done 2).\n`);
}