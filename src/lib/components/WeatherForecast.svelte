<script>
    import DayDetail from "./DayDetail.svelte";
    import ForecastDay from "./ForecastDay.svelte";

    let { forecast, city } = $props();
    let scrollContainer;
    let selectedDay = $state(null);

    function selectDay(day){
        selectedDay = day;
        console.log("Selected day:", selectedDay);
    }
    
</script>

<div class="mt-8">
    <h2 class="text-xl font-semibold mb-4">14-Tage Vorhersage</h2>
    <div class="relative">
        <div 
            class="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 scrollbar-thumb-rounded scrollbar-track-rounded"
            bind:this={scrollContainer}
        >
            <div class="flex gap-4 w-max">
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                {#each forecast as day, i}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <div class="w-32 flex-shrink-0" onclick={() => selectDay(day)}>
                        <ForecastDay {day} {i}/>
                    </div>
                {/each}
            </div>
            
            
        </div>
        {#if selectedDay}
                <DayDetail {selectedDay} {city} />
            {/if}
    </div>
</div>