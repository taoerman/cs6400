# cs6400-2025-01-Team002
## install django and run the server
>`pip install django`
>
>`python manage.py runserver 8080`
## install MySQL
>`brew install mysql pkg-config`
>
>`pip install mysqlclient`

## create a new app
>python manage.py startapp app

## Register the app in settings.py
>team_project/settings.py
>
> INSTALLED_APPS = [

    ...,
    'app name',

]

# API
[API specification](apis.md)
