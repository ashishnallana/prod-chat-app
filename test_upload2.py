import requests

files = {'file': ('test.txt', b'hello world', 'text/plain')}
response = requests.post('http://localhost:8000/api/v1/files/upload', files=files)
print("Status Code:", response.status_code)
print("Response Text:", response.text)
