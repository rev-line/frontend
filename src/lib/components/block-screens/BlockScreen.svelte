<script lang="ts">
    let {fullscreen, text} = $props();
</script>


<div class={"d-flex " + (fullscreen ? 'h-100' : '') }>
    <div class="m-auto">
        <h1 class="text-center">{text ?? 'Loading...'}</h1>
    </div>
</div>
