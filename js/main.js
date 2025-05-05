// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    const weatherContainer = document.getElementById('weather-container');
    const errorAlert = document.getElementById('error-alert');
    const refreshBtn = document.getElementById('refresh-btn');
    const timestamp = document.getElementById('timestamp');
    const location = document.getElementById('location');

    // Station configurations
    const stations = [
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

    // Weather parameters and their icons
    const weatherParams = {
        temp: { icon: 'fa-thermometer-half', label: 'Temperature', unit: '°F' },
        hum: { icon: 'fa-tint', label: 'Humidity', unit: '%' },
        wind_speed_last: { icon: 'fa-wind', label: 'Wind Speed', unit: 'mph' },
        wind_dir_last: { icon: 'fa-compass', label: 'Wind Direction', unit: '°' },
        bar_sea_level: { icon: 'fa-compress-alt', label: 'Pressure', unit: 'inHg' },
        rain_rate_last_mm: { icon: 'fa-cloud-rain', label: 'Rain Rate', unit: 'mm/h' },
        solar_rad: { icon: 'fa-sun', label: 'Solar Radiation', unit: 'W/m²' },
        uv_index: { icon: 'fa-sun', label: 'UV Index', unit: '' }
    };

    // Get weather condition and icon based on current conditions
    function getWeatherCondition(data) {
        if (data.rain_rate_last_mm > 0) {
            return {
                condition: 'Raining',
                icon: 'fa-cloud-rain',
                description: `Light rain with ${data.rain_rate_last_mm.toFixed(1)} mm/h`
            };
        } else if (data.solar_rad > 500) {
            return {
                condition: 'Sunny',
                icon: 'fa-sun',
                description: 'Clear skies with high solar radiation'
            };
        } else if (data.solar_rad > 200) {
            return {
                condition: 'Partly Cloudy',
                icon: 'fa-cloud-sun',
                description: 'Mixed conditions with some cloud cover'
            };
        } else {
            return {
                condition: 'Cloudy',
                icon: 'fa-cloud',
                description: 'Overcast conditions'
            };
        }
    }

    // Create weather card HTML
    function createWeatherCard(param, value, icon, label, unit) {
        return `
            <div class="weather-card bg-white rounded-xl shadow-lg p-6 flex flex-col items-center transform hover:-translate-y-1 transition duration-200">
                <div class="bg-blue-50 rounded-full p-4 mb-4">
                    <i class="fas ${icon} text-4xl text-blue-600"></i>
                </div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">${label}</h3>
                <p class="text-3xl font-bold text-blue-600">${value}${unit}</p>
            </div>
        `;
    }

    // Update weather display
    function updateWeatherDisplay(data) {
        weatherContainer.innerHTML = '';
        const sensorData = data.sensors[0].data[0];

        // Update weather condition
        const weatherCondition = getWeatherCondition(sensorData);
        location.innerHTML = `
            <div class="flex items-center justify-center md:justify-start">
                <div class="bg-blue-100 rounded-full p-3 mr-4">
                    <i class="fas ${weatherCondition.icon} text-3xl text-blue-600"></i>
                </div>
                <div>
                    <h3 class="text-2xl font-bold text-gray-800">${weatherCondition.condition}</h3>
                    <p class="text-gray-600">${weatherCondition.description}</p>
                </div>
            </div>
        `;

        // Create cards for each weather parameter
        for (const [param, details] of Object.entries(weatherParams)) {
            if (sensorData[param] !== undefined) {
                const value = param === 'wind_dir_last' 
                    ? getWindDirection(sensorData[param])
                    : Number(sensorData[param]).toFixed(1);
                
                weatherContainer.innerHTML += createWeatherCard(
                    param,
                    value,
                    details.icon,
                    details.label,
                    details.unit
                );
            }
        }

        // Update wind details
        updateWindDetails(data);
        // Update precipitation details
        updatePrecipitationDetails(data);

        // Update timestamp
        const date = new Date(data.generated_at * 1000);
        timestamp.textContent = `Last updated: ${date.toLocaleString()}`;
    }

    // Update wind details section
    function updateWindDetails(data) {
        const wind = data.sensors[0].data[0];
        const windDetails = document.getElementById('wind-details');
        windDetails.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-gray-600">Current Speed</p>
                    <p class="text-2xl font-bold text-blue-600">${wind.wind_speed_last.toFixed(1)} mph</p>
                </div>
                <div class="p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-gray-600">Direction</p>
                    <p class="text-2xl font-bold text-blue-600">${getWindDirection(wind.wind_dir_last)}</p>
                </div>
                <div class="p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-gray-600">Gust (2 min)</p>
                    <p class="text-2xl font-bold text-blue-600">${wind.wind_speed_hi_last_2_min.toFixed(1)} mph</p>
                </div>
                <div class="p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-gray-600">Wind Chill</p>
                    <p class="text-2xl font-bold text-blue-600">${wind.wind_chill.toFixed(1)}°F</p>
                </div>
            </div>
        `;
    }

    // Update precipitation details section
    function updatePrecipitationDetails(data) {
        const rain = data.sensors[0].data[0];
        const precipitationDetails = document.getElementById('precipitation-details');
        precipitationDetails.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-gray-600">Current Rate</p>
                    <p class="text-2xl font-bold text-blue-600">${rain.rain_rate_last_mm.toFixed(1)} mm/h</p>
                </div>
                <div class="p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-gray-600">Daily Total</p>
                    <p class="text-2xl font-bold text-blue-600">${rain.rainfall_daily_mm.toFixed(1)} mm</p>
                </div>
                <div class="p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-gray-600">Monthly Total</p>
                    <p class="text-2xl font-bold text-blue-600">${rain.rainfall_monthly_mm.toFixed(1)} mm</p>
                </div>
                <div class="p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-gray-600">Yearly Total</p>
                    <p class="text-2xl font-bold text-blue-600">${rain.rainfall_year_mm.toFixed(1)} mm</p>
                </div>
            </div>
        `;
    }

    // Convert wind direction degrees to cardinal direction
    function getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                          'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }

    // Fetch and display weather data for a specific station
    async function fetchStationWeather(stationId, stationUuid) {
        const stationContainer = document.getElementById(`station-${stationId}`);
        if (!stationContainer) return;

        try {
            const stationError = stationContainer.querySelector('.error-message');
            const stationLoading = stationContainer.querySelector('.loading-indicator');
            
            stationError.classList.add('hidden');
            stationLoading.classList.remove('hidden');

            const result = await weatherAPI.fetchWeatherData(stationId, stationUuid);
            
            if (result.success) {
                updateWeatherDisplay(result.data, stationId);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            const stationError = stationContainer.querySelector('.error-message');
            stationError.textContent = error.message;
            stationError.classList.remove('hidden');
        } finally {
            const stationLoading = stationContainer.querySelector('.loading-indicator');
            stationLoading.classList.add('hidden');
        }
    }

    // Fetch weather for all stations
    async function fetchAllStations() {
        errorAlert.classList.add('hidden');
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<span class="loading mr-2"></span>Refreshing...';

        try {
            await Promise.all(stations.map(station => 
                fetchStationWeather(station.id, station.uuid)
            ));
        } catch (error) {
            errorAlert.textContent = 'Error fetching weather data. Please try again later.';
            errorAlert.classList.remove('hidden');
        } finally {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Refresh';
            
            // Update timestamp
            const now = new Date();
            timestamp.textContent = `Last updated: ${now.toLocaleString()}`;
        }
    }

    // Create station containers
    function createStationContainers() {
        weatherContainer.innerHTML = stations.map(station => `
            <div id="station-${station.id}" class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">${station.name}</h2>
                    <button class="station-refresh bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                            data-station-id="${station.id}"
                            data-station-uuid="${station.uuid}">
                        <i class="fas fa-sync-alt mr-2"></i>Refresh
                    </button>
                </div>
                <div class="loading-indicator hidden text-center py-4">
                    <i class="fas fa-circle-notch fa-spin text-3xl text-blue-600"></i>
                    <p class="mt-2 text-gray-600">Loading weather data...</p>
                </div>
                <div class="error-message hidden"></div>
                <div class="weather-data grid grid-cols-2 md:grid-cols-4 gap-4"></div>
            </div>
        `).join('');

        // Add event listeners to station refresh buttons
        document.querySelectorAll('.station-refresh').forEach(button => {
            button.addEventListener('click', () => {
                const { stationId, stationUuid } = button.dataset;
                fetchStationWeather(stationId, stationUuid);
            });
        });
    }

    // Initialize
    createStationContainers();
    
    // Event listeners
    refreshBtn.addEventListener('click', fetchAllStations);

    // Initial fetch
    fetchAllStations();

    // Auto refresh every 5 minutes
    setInterval(fetchAllStations, 5 * 60 * 1000);
});
