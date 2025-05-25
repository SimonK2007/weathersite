<svelte:head>
    <title>{city} - Weathersite</title> 
</svelte:head>
<script>
    import { goto } from "$app/navigation";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import WeatherForecast from "$lib/components/WeatherForecast.svelte";
    import WeatherNow from "$lib/components/WeatherNow.svelte";
    import { onMount } from "svelte";
    import { load } from "./+page.js";

    
    const { data } = $props();

    $inspect(data, 'data');

    let city = $state(data.city);

    let weatherNow = $state(null);
    let forecast = $state([]);
    let error = $state(null);
    $inspect(weatherNow);

    let bookmarks = $state([]);

    onMount(() => {
        loadbookmarks();
    });

    function loadbookmarks() {
        bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    }

    function handleBookmarkClick(bookmark) {
        city = bookmark;
        searchWeather();
    }

    async function fetchWeather(lat, long, name, admin1, country) {
        try {
            const locationName = `${name}, ${admin1 || country}`;

            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=14`,
            );
            const weatherData = await weatherRes.json();

            weatherNow = {
                temp: weatherData.current.temperature_2m,
                humidity: weatherData.current.relative_humidity_2m,
                rain: weatherData.current.precipitation,
                wind: weatherData.current.wind_speed_10m,
                time: weatherData.current.time,
                location: locationName,
                code: weatherData.current.weather_code,
            };

            forecast = weatherData.daily.time.map((date, i) => ({
                date,
                temp_max: weatherData.daily.temperature_2m_max[i],
                temp_min: weatherData.daily.temperature_2m_min[i],
                rain: weatherData.daily.precipitation_sum[i],
                code: weatherData.daily.weather_code[i],
            }));

            error = null;
        } catch (err) {
            error = err.message;
            weatherNow = null;
            forecast = [];
        }
    }

    async function searchWeather() {
        try {

            const geoRes = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`,
            );
            const geoData = await geoRes.json();
            if (!geoData.results?.length) throw new Error("Ort nicht gefunden");

            const { latitude, longitude, name, country, admin1 } = geoData.results[0];
            await fetchWeather(latitude, longitude, name, admin1, country);
        } catch (err) {
            error = err.message;
            weatherNow = null;
            forecast = [];
        }
    }

    function handleSelect(event) {
    const suggestion = event.detail;
    city = suggestion.name; 
    fetchWeather(
        suggestion.latitude, 
        suggestion.longitude, 
        suggestion.name, 
        suggestion.admin1, 
        suggestion.country
    );
}

    $effect(() => {
    if (city) {
        searchWeather();
    }
});

    

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString("de-DE", { weekday: "long" });
    }
</script>

<main class="min-h-screen p-4 max-w-3xl mx-auto font-sans relative">
    <h1 class="text-3xl font-bold text-center mb-4">Wettervorhersage für {city}</h1>
    <SearchBar bind:bookmarks={bookmarks} bind:city onselect={handleSelect} {loadbookmarks}/>
    
     

     {#if error}
        <p class="text-red-600 text-center font-semibold">{error}</p>
    {:else if weatherNow}
        <WeatherNow {weatherNow} />
        {#if forecast.length > 0}
            <WeatherForecast {forecast} {city}/>
        {/if}
    {:else}
        <p>⏳ Lade Wetterdaten…</p>
    {/if}
</main>


