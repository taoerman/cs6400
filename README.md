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

## urls
>http://127.0.0.1:8080/accounts/users/
> 
> http://127.0.0.1:8080/dogs/get_dog/1/
> 
> http://127.0.0.1:8080/dogs/get_all_dogs/
> 
> http://127.0.0.1:8080/dogs/edit_dog/1/

# API
[API specification](apis.md)

# API Example
[example](api_example.md)
