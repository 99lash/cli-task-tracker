# Task Tracker

A solution for [Task Tracker](https://roadmap.sh/projects/task-tracker) project challenge from [roadmap.sh](roadmap.sh) 

## Getting Started

These instructions will give you a copy of the project up and running on
your local machine for development and testing purposes.

## How to use

### Installing

Clone this repository and run the following command:

    git clone https://github.com/99lash/cli-task-tracker.git
    cd cli-task-tracker


### Commands
 
Help

    node taskcli --help 

Creating a new task

    node taskcli --add <task-name>

Updating a task

    node taskcli --update <id>

Deleting a task

    node taskcli --delete <id>

Marking a task status as [ todo | in progress | done ]

    node taskcli --mark-in-progress <id>
    node taskcli --mark-done <id>
    node taskcli --mark-todo <id>

List all tasks or filtered tasks by status

    node taskcli --list
    node taskcli --list todo
    node taskcli --list in-progress
    node taskcli --list done