#!/bin/bash

set -o errexit

# Exit immediately on any error

pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate

python manage.py runserver
