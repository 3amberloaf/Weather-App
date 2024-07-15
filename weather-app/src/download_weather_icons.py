import os
import requests
from zipfile import ZipFile

# Directory to save the images
image_dir = 'weather_icons'
os.makedirs(image_dir, exist_ok=True)

# List of icon URLs
icon_urls = [
    "http://openweathermap.org/img/wn/01d.png",
    "http://openweathermap.org/img/wn/01n.png",
    "http://openweathermap.org/img/wn/02d.png",
    "http://openweathermap.org/img/wn/02n.png",
    "http://openweathermap.org/img/wn/03d.png",
    "http://openweathermap.org/img/wn/03n.png",
    "http://openweathermap.org/img/wn/04d.png",
    "http://openweathermap.org/img/wn/04n.png",
    "http://openweathermap.org/img/wn/09d.png",
    "http://openweathermap.org/img/wn/09n.png",
    "http://openweathermap.org/img/wn/10d.png",
    "http://openweathermap.org/img/wn/10n.png",
    "http://openweathermap.org/img/wn/11d.png",
    "http://openweathermap.org/img/wn/11n.png",
    "http://openweathermap.org/img/wn/13d.png",
    "http://openweathermap.org/img/wn/13n.png",
    "http://openweathermap.org/img/wn/50d.png",
    "http://openweathermap.org/img/wn/50n.png"
]

# Download the images
for url in icon_urls:
    response = requests.get(url)
    if response.status_code == 200:
        icon_name = os.path.basename(url)
        with open(os.path.join(image_dir, icon_name), 'wb') as f:
            f.write(response.content)

# Create a ZIP file
zip_filename = 'weather_icons.zip'
with ZipFile(zip_filename, 'w') as zipf:
    for root, dirs, files in os.walk(image_dir):
        for file in files:
            zipf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), image_dir))

print(f'Images downloaded and zipped into {zip_filename}')
