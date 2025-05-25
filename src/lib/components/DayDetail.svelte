<script>
    import { onMount, tick } from 'svelte';
    import Chart from 'chart.js/auto';
    
    let { selectedDay, city } = $props();
    
    let location = $state(null);
    let chart = $state(null);
    let chartCanvas = $state(null);
    let hourlyData = $state([]);
    let isLoading = $state(false);
    let error = $state(null);

    // React to changes in selectedDay or city
    $effect(() => {
        if (selectedDay && city) {
            updateData();
        }
    });

    async function updateData() {
        await fetchLocation();
        await tick();
        await fetchHourlyData();
        renderChart();
    }

    onMount(async () => {
        await updateData();
        
        return () => {
            if (chart) chart.destroy();
        };
    });

    async function fetchLocation() {
        try {
            isLoading = true;
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
            const data = await res.json();
            location = data.results[0];
            console.log('Location fetched:', location);
        } catch (err) {
            console.error('Failed to fetch location:', err);
            error = 'Standort konnte nicht gefunden werden';
        } finally {
            isLoading = false;
        }
    }
    
    function renderChart() {
        if (!chartCanvas || !hourlyData.length) return;
        
        if (chart) chart.destroy();
        
        try {
            chart = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: hourlyData.map(d => d.time),
                    datasets: [{
                        label: 'Temperatur (°C)',
                        data: hourlyData.map(d => d.temp),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.parsed.y}°C`
                            }
                        }
                    },
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Temperatur (°C)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Uhrzeit'
                            }
                        }
                    }
                }
            });
        } catch (err) {
            console.error('Failed to create chart:', err);
        }
    }

    async function fetchHourlyData() {
        isLoading = true;
        error = null;
        
        try {
            if (!location) {
                return;
            }
            
            const dateStr = selectedDay.date.split('T')[0];
            console.log('Fetching hourly data for:', dateStr);
            
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,weather_code,precipitation&start_date=${dateStr}&end_date=${dateStr}&timezone=auto`
            );
            
            const data = await response.json();
            
            if (!data.hourly) {
                throw new Error('No hourly data available');
            }
            
            hourlyData = data.hourly.time.map((time, index) => ({
                time: new Date(time).toLocaleTimeString('de-DE', { hour: '2-digit' }),
                temp: data.hourly.temperature_2m[index],
                code: data.hourly.weather_code[index],
                precipitation: data.hourly.precipitation[index]
            }));
            
            await tick();
            renderChart();
            
        } catch (err) {
            error = err.message;
            console.error('Failed to fetch hourly data:', err);
        } finally {
            isLoading = false;
        }
    }

    const formattedDate = $derived(selectedDay ? formatDate(selectedDay.date) : '');

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString("de-DE", { weekday: 'long', day: 'numeric', month: 'long' });
    }
    
    function getWeatherIcon(code) {
        const weatherMap = {
            0: "☀️", // Clear sky
            1: "🌤️", // Mainly clear
            2: "⛅", // Partly cloudy
            3: "☁️", // Overcast
            45: "🌫️", // Fog
            48: "🌫️", // Depositing rime fog
            51: "🌦️", // Drizzle: Light
            53: "🌦️", // Drizzle: Moderate
            55: "🌦️", // Drizzle: Dense
            56: "🌧️", // Freezing Drizzle: Light
            57: "🌧️", // Freezing Drizzle: Dense
            61: "🌧️", // Rain: Slight
            63: "🌧️", // Rain: Moderate
            65: "🌧️", // Rain: Heavy
            66: "🌧️", // Freezing Rain: Light
            67: "🌧️", // Freezing Rain: Heavy
            71: "❄️", // Snow fall: Slight
            73: "❄️", // Snow fall: Moderate
            75: "❄️", // Snow fall: Heavy
            77: "❄️", // Snow grains
            80: "🌦️", // Rain showers: Slight
            81: "🌦️", // Rain showers: Moderate
            82: "🌦️", // Rain showers: Violent
            85: "❄️", // Snow showers: Slight
            86: "❄️", // Snow showers: Heavy
            95: "⛈️", // Thunderstorm
            96: "⛈️", // Thunderstorm with slight hail
            99: "⛈️", // Thunderstorm with heavy hail
        };
        return weatherMap[code] || "❓";
    }
</script>

<div class="bg-white rounded-lg shadow-lg overflow-hidden">
    <div class="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h2 class="text-2xl font-bold">{formattedDate}</h2>
        <div class="flex items-center justify-between mt-2">
            <div class="text-5xl">{selectedDay && getWeatherIcon(selectedDay.code)}</div>
            <div class="text-right">
                <div class="text-4xl font-bold">
                    {selectedDay ? Math.round(selectedDay.temp_max) : '--'}° / {selectedDay ? Math.round(selectedDay.temp_min) : '--'}°
                </div>
                <div class="text-sm">Höchst- / Tiefsttemperatur</div>
            </div>
        </div>
    </div>
    
    <div class="p-6">
        {#if isLoading}
            <div class="text-center py-8">Lade stündliche Daten...</div>
        {:else if error}
            <div class="text-red-600 text-center py-8">{error}</div>
        {:else}
            <h3 class="text-xl font-semibold mb-4">Temperaturverlauf</h3>
            <div class="h-90">
                <canvas bind:this={chartCanvas}></canvas>
            </div>
            
            <div class="mt-8 grid grid-cols-2 gap-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-500 mb-2">Niederschlag</h4>
                    <div class="flex items-center">
                        <span class="text-3xl mr-2">🌧️</span>
                        <span class="text-2xl font-bold">
                            {hourlyData.reduce((sum, hour) => sum + hour.precipitation, 0).toFixed(1)} mm
                        </span>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-500 mb-2">Wetterbedingungen</h4>
                    <div class="flex items-center">
                        <span class="text-3xl mr-2">{selectedDay && getWeatherIcon(selectedDay.code)}</span>
                        <span class="text-lg">
                            {#if !selectedDay}
                                Keine Daten
                            {:else if selectedDay.code === 0}
                                Klarer Himmel
                            {:else if selectedDay.code === 1 || selectedDay.code === 2}
                                Teilweise bewölkt
                            {:else if selectedDay.code === 3}
                                Bedeckt
                            {:else if selectedDay.code >= 45 && selectedDay.code <= 48}
                                Nebel
                            {:else if selectedDay.code >= 51 && selectedDay.code <= 57}
                                Nieselregen
                            {:else if selectedDay.code >= 61 && selectedDay.code <= 67}
                                Regen
                            {:else if selectedDay.code >= 71 && selectedDay.code <= 77}
                                Schnee
                            {:else if selectedDay.code >= 80 && selectedDay.code <= 82}
                                Regenschauer
                            {:else if selectedDay.code >= 85 && selectedDay.code <= 86}
                                Schneeschauer
                            {:else if selectedDay.code >= 95 && selectedDay.code <= 99}
                                Gewitter
                            {:else}
                                Wechselhaft
                            {/if}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="mt-6">
                <h4 class="font-medium mb-2">Stündliche Übersicht</h4>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-gray-50 rounded-lg">
                        <thead>
                            <tr class="text-left border-b">
                                <th class="p-3">Uhrzeit</th>
                                <th class="p-3">Temp.</th>
                                <th class="p-3">Wetter</th>
                                <th class="p-3">Niederschlag</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each hourlyData as hour, i}
                                {#if i % 3 === 0} <!-- Show every 3 hours to reduce clutter -->
                                    <tr class="border-b hover:bg-gray-100">
                                        <td class="p-3">{hour.time}</td>
                                        <td class="p-3 font-medium">{Math.round(hour.temp)}°C</td>
                                        <td class="p-3">{getWeatherIcon(hour.code)}</td>
                                        <td class="p-3">{hour.precipitation} mm</td>
                                    </tr>
                                {/if}
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        {/if}
    </div>
</div>