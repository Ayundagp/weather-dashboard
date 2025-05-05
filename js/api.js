class WeatherAPI {
    constructor() {
        this.baseUrl = 'https://pwsdashboard.com/wll/index.php';
        this.apiKey = 'fabjtppqp2qtvxffvmkxxqhgivwukhxd';
        this.apiSecret = 'c6dyt3jlx9jtq3u92weao2omanvxv0ev';
        this.stations = [
            {
                id: '205024',
                uuid: '546ccdcd-7d6f-402e-8c8d-47152b0b4d26',
                name: 'BSM'
            },
            {
                id: '207238',
                uuid: '585149cb-db4e-45af-b0db-3b3a084dc4d5',
                name: 'KBS PT Sungai Rangit'
            }
        ];
    }

    async fetchWeatherData(stationId, stationUuid) {
        try {
            const url = new URL('/api/weather', window.location.origin);
            url.searchParams.append('station_id', stationId);
            url.searchParams.append('station_uuid', stationUuid);

            const response = await fetch(url.toString());
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: this.processWeatherData(data)
            };
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return {
                success: false,
                error: 'Failed to fetch weather data. Please try again later.'
            };
        }
    }

    processWeatherData(data) {
        // Process and format the weather data
        // This is a placeholder - adjust according to actual API response structure
        return {
            temperature: this.formatValue(data.temperature, '°C'),
            humidity: this.formatValue(data.humidity, '%'),
            windSpeed: this.formatValue(data.wind_speed, 'km/h'),
            windDirection: this.formatValue(data.wind_direction, '°'),
            rainfall: this.formatValue(data.rainfall, 'mm'),
            pressure: this.formatValue(data.pressure, 'hPa'),
            solarRadiation: this.formatValue(data.solar_radiation, 'W/m²'),
            timestamp: new Date(data.timestamp).toLocaleString()
        };
    }

    formatValue(value, unit) {
        if (value === undefined || value === null) {
            return 'N/A';
        }
        return `${value}${unit}`;
    }

    getStationById(stationId) {
        return this.stations.find(station => station.id === stationId);
    }

    async fetchAllStationsData() {
        const results = {};
        for (const station of this.stations) {
            results[station.id] = await this.fetchWeatherData(station.id, station.uuid);
        }
        return results;
    }
}

// Create a global instance of the API
const weatherAPI = new WeatherAPI();
