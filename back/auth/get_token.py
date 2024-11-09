import requests
import os

token_url = "https://hh.ru/oauth/token"
client_id = os.environ.get("client_id")
client_secret = os.environ.get("client_secret")

redirect_uri = "http://localhost:8080"

authorization_code = "SFBG1U2PLU0L6OFVKKJ2G6O9TFVKD11BFNRKJOKGHHBJOD5AQ20HRSRG3016ULJJ"

data = {
    "grant_type": "authorization_code",
    "client_id": client_id,
    "client_secret": client_secret,
    "code": authorization_code,
    "redirect_uri": redirect_uri
}

response = requests.post(token_url, data=data)
token_data = response.json()

if response.status_code == 200:
    access_token = token_data.get("access_token")
    print("Access Token:", access_token)
else:
    print("Ошибка при получении токена:", response.text)
    exit()