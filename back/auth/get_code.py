import os

client_id = os.environ.get("client_id")
client_secret = os.environ.get("client_secret")
redirect_uri = "http://localhost:8080"

auth_url = f"https://hh.ru/oauth/authorize?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}"
print("Перейдите по этой ссылке для авторизации:", auth_url)