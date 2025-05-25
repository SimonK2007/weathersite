<script>
    import { page } from "$app/state";
    import Bookmarks from "./Bookmarks.svelte";

    let { bookmarks = $bindable(), city = $bindable(), loadbookmarks} = $props();

    let suggestions = $state([]);
    let showSuggestions = $state(false);
    let bookmarkImageSource = $state("/bookmarkAdd.svg");

    $effect(() => {
        if (city) {
            const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
            bookmarkImageSource = bookmarks.includes(city) ? "/bookmarkAdded.svg" : "/bookmarkAdd.svg";
        }
    });

    async function fetchSuggestions() {
        if (!city) {
            suggestions = [];
            showSuggestions = false;
            return;
        }
        
        try {
            const geoRes = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=50`,
            );
            const geoData = await geoRes.json();
            suggestions = geoData.results || [];
            showSuggestions = suggestions.length > 0;
            window.history.pushState(
                {},
                "",
                `/weather/${encodeURIComponent(city)}`,
            );
            
            // Überprüfe ob die Stadt bereits gebookmarked ist
            const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
            bookmarkImageSource = bookmarks.includes(city) ? "/bookmarkAdded.svg" : "/bookmarkAdd.svg";
        } catch (err) {
            suggestions = [];
            showSuggestions = false;
        }
    }

    function debounceFetch() {
        fetchSuggestions();
    }

    function selectSuggestion(suggestion) {
        city = suggestion.name;
        window.history.pushState(
            {},
            "",
            `/weather/${encodeURIComponent(city)}`,
        );
        showSuggestions = false;
        
        // Überprüfe ob die ausgewählte Stadt bereits gebookmarked ist
         bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
        bookmarkImageSource = bookmarks.includes(city) ? "/bookmarkAdded.svg" : "/bookmarkAdd.svg";
    }

    function toggleBookmark(city) {
        
        console.log($state.snapshot(bookmarks[0]));
        
        if (bookmarks.includes(city)) {
            
            const index = bookmarks.indexOf(city);
            bookmarks.splice(index, 1);
            bookmarkImageSource = "/bookmarkAdd.svg";
            
        } else {
            bookmarks.push(city);
            bookmarkImageSource = "/bookmarkAdded.svg";
            
        }
        
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        loadbookmarks();
    }

    function removeBookmark(city) {
        bookmarks = bookmarks.filter((b) => b !== city);
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        
        loadbookmarks();
        bookmarkImageSource = "/bookmarkAdd.svg";
    }

    function handleBookmarkClick(bookmark) {
        city = bookmark;
    }
</script>

<div class="mb-6 flex gap-2 relative">
    <div class="relative flex-1">
        <input
            bind:value={city}
            oninput={debounceFetch}
            onfocus={() => city.length > 1 && (showSuggestions = true)}
            onblur={() => setTimeout(() => (showSuggestions = false), 200)}
            class="border border-gray-300 p-2 rounded w-full shadow-sm pr-8"
            placeholder="Stadt eingeben..."
        />
        <span
            class="absolute right-2 top-1/2 transform -translate-y-1/2 hover: cursor-pointer"
        >
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <img
                onclick={() => toggleBookmark(city)}
                src={bookmarkImageSource}
                alt="Bookmark"
                class="w-6 h-6"
            />
        </span>
    </div>

    {#if showSuggestions && suggestions.length > 0}
        <ul
            class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded shadow-lg z-10 mt-1 max-h-60 overflow-auto"
        >
            {#each suggestions as suggestion}
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <li
                    onclick={() => selectSuggestion(suggestion)}
                    class="p-2 hover:bg-gray-100 cursor-pointer"
                >
                    {suggestion.name}, {suggestion.admin1 || suggestion.country}
                    {#if suggestion.country_code}
                        <span class="ml-2">({suggestion.country_code})</span>
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</div>



    <!-- Bookmarks row -->
    <div class="flex flex-wrap gap-1 my-2 justify-center">
        {#each bookmarks as bookmark}
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <Bookmarks {bookmark} {removeBookmark} {handleBookmarkClick} />
        {/each}
    
    </div>