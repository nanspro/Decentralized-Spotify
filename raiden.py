import requests
x = requests.put('http://localhost:5001/api/v1/tokens/0x795c0c7716eecd8a4d346247c962fc6899dc2d46', headers={ 'Content-Type': 'application/json', })
print(x)