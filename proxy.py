from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from urllib.parse import urlparse, parse_qs
from datetime import datetime
import random
import os

class ProxyHandler(BaseHTTPRequestHandler):
    def generate_mock_weather_data(self, station_id, station_name):
        # Generate realistic weather data based on Indonesian climate
        temp = round(random.uniform(24, 32), 1)  # Temperature in Celsius
        humidity = round(random.uniform(65, 85), 1)  # Humidity percentage
        wind_speed = round(random.uniform(0, 20), 1)  # Wind speed in km/h
        wind_dir = round(random.uniform(0, 360), 1)  # Wind direction in degrees
        pressure = round(random.uniform(1008, 1015), 1)  # Pressure in hPa
        rain_rate = round(random.uniform(0, 5), 1)  # Rain rate in mm/h
        solar_rad = round(random.uniform(0, 1000), 1)  # Solar radiation in W/m²
        uv_index = round(random.uniform(0, 12), 1)  # UV index

        return {
            "station_info": {
                "station_id": station_id,
                "station_name": station_name,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            "sensors": [{
                "data": [{
                    "temp": temp,
                    "hum": humidity,
                    "wind_speed_last": wind_speed,
                    "wind_dir_last": wind_dir,
                    "bar_sea_level": pressure,
                    "rain_rate_last_mm": rain_rate,
                    "solar_rad": solar_rad,
                    "uv_index": uv_index,
                    "rainfall_daily_mm": round(rain_rate * random.uniform(1, 4), 1),
                    "rainfall_monthly_mm": round(rain_rate * random.uniform(10, 40), 1),
                    "rainfall_year_mm": round(rain_rate * random.uniform(100, 400), 1),
                    "wind_speed_hi_last_2_min": round(wind_speed * random.uniform(1.1, 1.3), 1),
                    "wind_chill": round(temp - random.uniform(1, 3), 1) if wind_speed > 10 else temp
                }]
            }],
            "generated_at": int(datetime.now().timestamp())
        }

    def do_GET(self):
        if self.path.startswith('/api/weather'):
            # Parse query parameters
            query = parse_qs(urlparse(self.path).query)
            station_id = query.get('station_id', [''])[0]
            
            # Get station name based on station ID
            station_name = "BSM" if station_id == "205024" else "KBS PT Sungai Rangit"
            
            # Generate mock weather data
            weather_data = self.generate_mock_weather_data(station_id, station_name)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(weather_data).encode())

        else:
            # Serve static files
            try:
                if self.path == '/':
                    file_path = './index.html'
                else:
                    # Remove query parameters if any
                    clean_path = self.path.split('?')[0]
                    # Ensure the path starts with ./ and doesn't try to access parent directories
                    file_path = os.path.normpath('./' + clean_path.lstrip('/'))
                    if not file_path.startswith('./'):
                        file_path = './' + file_path

                if os.path.isfile(file_path):
                    with open(file_path, 'rb') as file:
                        content = file.read()
                        self.send_response(200)
                        
                        if file_path.endswith('.html'):
                            self.send_header('Content-type', 'text/html')
                        elif file_path.endswith('.css'):
                            self.send_header('Content-type', 'text/css')
                        elif file_path.endswith('.js'):
                            self.send_header('Content-type', 'application/javascript')
                        
                        self.end_headers()
                        self.wfile.write(content)
                else:
                    print(f"File not found: {file_path}")
                    self.send_response(404)
                    self.end_headers()
                    self.wfile.write(b'File not found')
            except Exception as e:
                print(f"Error serving file: {str(e)}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(b'Internal server error')

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8000), ProxyHandler)
    print('Starting proxy server on http://localhost:8000')
    server.serve_forever()
