<script>
    import DayDetail from "./DayDetail.svelte";

    let {day, i} = $props();

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString("de-DE", { weekday: "long" });
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

<div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow h-full">
    <div class="text-center">
        <p class="font-medium">
            {i === 0 ? "Heute" : formatDate(day.date)}
        </p>
        <p class="text-4xl my-2">{getWeatherIcon(day.code)}</p>
        <div class="flex justify-center gap-4">
            <div>
                <p class="text-sm text-gray-300">Hoch</p>
                <p class="text-xl font-bold">
                    {Math.round(day.temp_max)}°
                </p>
            </div>
            <div>
                <p class="text-sm text-gray-300">Tief</p>
                <p class="text-xl font-bold">
                    {Math.round(day.temp_min)}°
                </p>
            </div>
        </div>
        {#if day.rain > 0}
            <p class="mt-2 text-sm">
                🌧️ {day.rain} mm
            </p>
        {/if}
    </div>
</div>
