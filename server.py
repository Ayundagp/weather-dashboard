from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
from urllib.parse import urlparse, parse_qs
from datetime import datetime
import random

class WeatherHandler(SimpleHTTPRequestHandler):
    def generate_mock_weather_data(self, station_id, station_name):
        temp = round(random.uniform(24, 32), 1)
        humidity = round(random.uniform(65, 85), 1)
        wind_speed = round(random.uniform(0, 20), 1)
        wind_dir = round(random.uniform(0, 360), 1)
        pressure = round(random.uniform(1008, 1015), 1)
        rain_rate = round(random.uniform(0, 5), 1)
        solar_rad = round(random.uniform(0, 1000), 1)
        uv_index = round(random.uniform(0, 12), 1)

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
            query = parse_qs(urlparse(self.path).query)
            station_id = query.get('station_id', [''])[0]
            station_name = "BSM" if station_id == "205024" else "KBS PT Sungai Rangit"
            
            weather_data = self.generate_mock_weather_data(station_id, station_name)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(weather_data).encode())
        else:
            return SimpleHTTPRequestHandler.do_GET(self)

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8000), WeatherHandler)
    print('Starting server on http://localhost:8000')
    server.serve_forever()
