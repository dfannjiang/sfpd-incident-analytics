#!/bin/bash

# Replace 'your-heroku-app-name' with the name of your Heroku app
HEROKU_APP_NAME="sfpd-incident-analytics"

# Replace 'your-command' with the command you want to run in the Heroku shell
HEROKU_COMMAND="python3 app/data_load.py"

# Open a Heroku bash shell and run the command
heroku run bash -a $HEROKU_APP_NAME -c "$HEROKU_COMMAND"