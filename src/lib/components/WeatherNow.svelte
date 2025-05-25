<script>
    let {weatherNow} = $props();
    
    function getWeatherIcon(code) {
        if (code === 0) return "☀️";
        if (code <= 2) return "⛅";
        if (code <= 45) return "🌫️";
        if (code <= 55) return "🌧️";
        if (code <= 65) return "🌦️";
        if (code <= 75) return "❄️";
        return "⛈️";
    }
    
    function getWeatherDescription(code) {
        const descriptions = {
            0: "Klarer Himmel",
            1: "Überwiegend klar",
            2: "Teilweise bewölkt",
            3: "Bedeckt",
            45: "Nebel",
            48: "Nebel mit Raureif",
            51: "Leichter Nieselregen",
            53: "Mäßiger Nieselregen",
            55: "Starker Nieselregen",
            56: "Leichter gefrierender Nieselregen",
            57: "Starker gefrierender Nieselregen",
            61: "Leichter Regen",
            63: "Mäßiger Regen",
            65: "Starker Regen",
            66: "Leichter gefrierender Regen",
            67: "Starker gefrierender Regen",
            71: "Leichter Schneefall",
            73: "Mäßiger Schneefall",
            75: "Starker Schneefall",
            77: "Schneekörner",
            80: "Leichte Regenschauer",
            81: "Mäßige Regenschauer",
            82: "Starke Regenschauer",
            85: "Leichte Schneeschauer",
            86: "Starke Schneeschauer",
            95: "Gewitter",
            96: "Gewitter mit leichtem Hagel",
            99: "Gewitter mit starkem Hagel"
        };
        return descriptions[code] || "Unbekanntes Wetter";
    }
    
    function getBackgroundClass(code) {
        if (code === 0) return "bg-gradient-to-br from-blue-400 to-yellow-200"; // Sunny
        if (code <= 2) return "bg-gradient-to-br from-blue-300 to-blue-100"; // Partly cloudy
        if (code <= 45) return "bg-gray-200"; // Fog
        if (code <= 65) return "bg-gradient-to-br from-blue-500 to-gray-300"; // Rain
        if (code <= 75) return "bg-gradient-to-br from-blue-100 to-white"; // Snow
        return "bg-gradient-to-br from-gray-700 to-gray-400"; // Thunderstorm
    }
</script>

{#if weatherNow}
    <div class="rounded-xl overflow-hidden shadow-lg text-white {getBackgroundClass(weatherNow.code)}">
        <div class="p-6">
            <!-- Location and time -->
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h2 class="text-2xl font-bold">{weatherNow.location}</h2>
                    <p class="text-sm opacity-80">
                        {new Date(weatherNow.time).toLocaleString("de-DE", {
                            weekday: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
                <span class="text-4xl">{getWeatherIcon(weatherNow.code)}</span>
            </div>
            
            <!-- Main weather info -->
            <div class="flex items-center justify-between mb-6">
                <div>
                    <span class="text-5xl font-light">{Math.round(weatherNow.temp)}</span>
                    <span class="text-2xl align-top">°C</span>
                    <p class="text-sm">{getWeatherDescription(weatherNow.code)}</p>
                </div>
                <div class="text-right">
                    <div class="flex items-center justify-end space-x-2">
                        <span class="text-lg">💧</span>
                        <span>{weatherNow.humidity}%</span>
                    </div>
                    <div class="flex items-center justify-end space-x-2">
                        <span class="text-lg">🌬️</span>
                        <span>{weatherNow.wind} km/h</span>
                    </div>
                    {#if weatherNow.rain > 0}
                        <div class="flex items-center justify-end space-x-2">
                            <span class="text-lg">🌧️</span>
                            <span>{weatherNow.rain} mm</span>
                        </div>
                    {/if}
                </div>
            </div>
            
            <!-- Additional details -->
            <div class="bg-black bg-opacity-10 rounded-lg p-3 text-sm">
                <div class="grid grid-cols-2 gap-2">
                    <div class="flex items-center space-x-1">
                        <span>🌡️ Gefühlt:</span>
                        <span>{Math.round(weatherNow.temp)}°C</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <span>👁️ Sichtweite:</span>
                        <span>{weatherNow.code <= 45 ? 'Gering' : 'Gut'}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <span>☂️ Regenrisiko:</span>
                        <span>{weatherNow.code >= 50 && weatherNow.code < 80 ? 'Hoch' : 'Niedrig'}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <span>🌞 UV-Index:</span>
                        <span>{weatherNow.code <= 2 ? 'Mittel' : 'Niedrig'}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}