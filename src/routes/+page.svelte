<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  let city = ''; // This will hold the detected city/country
  
  const getLocationAndNavigate = async () => {
    try {
      // 1. Get geolocation
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });
      
      // 2. Reverse geocode to get country
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
      );
      
      const data = await response.json();
      
      // 3. Use country (or city if you prefer)
      const country = data.countryName;
      // OR use locality if you want city:
      // const locality = data.locality;
      
      // 4. Navigate to weather page
      goto(`/weather/${country}`);
      
    } catch (error) {
      console.error("Error getting location:", error);
      // Fallback to some default location
      goto(`/weather/default`);
    }
  };
  
  onMount(() => {
    getLocationAndNavigate();
  });
</script>