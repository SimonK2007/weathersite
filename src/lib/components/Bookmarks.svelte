<script>
    let {bookmark, removeBookmark, handleBookmarkClick} = $props();
</script>

<div class="flex items-center bg-white shadow rounded-full px-1 py-0.5 transition hover:shadow-md text-xs">
            <button 
                onclick={() => handleBookmarkClick(bookmark)}
                class="px-2 py-1 bg-blue-100 hover:bg-blue-300 text-blue-800 rounded-full font-medium transition truncate max-w-[100px]"
            >
                <span class="truncate">{bookmark}</span>
            </button>
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <img 
                src="/delete.svg" 
                alt="Löschen" 
                title="Lesezeichen entfernen"
                class="w-4 h-4 ml-1 cursor-pointer opacity-70 hover:opacity-100 transition"
                onclick={() => removeBookmark(bookmark)}
            />
        </div>