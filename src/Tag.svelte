<script>
  import { OPTIONS } from "./utils";
  import { createEventDispatcher } from "svelte";

  export let name;
  export let data;
  export let url = "";

  const dispatch = createEventDispatcher();

  function confidence(prob) {
    prob = prob * 100;

    if (prob < 50.0) {
      return "danger";
    } else if (prob < 75.0) {
      return "warning";
    } else {
      return "success";
    }
  }

  function scrubberMove(event) {
    let target = event.target;
    let imageWidth = 160;
    let backgroundPosition = target.style.backgroundPosition.split(" ");
    let offset = Number(target.getAttribute("data-offset").split(",")[0]);

    if (event.offsetX < 53) {
      backgroundPosition[0] = `-${offset - imageWidth}px`;
      target.style.backgroundPosition = backgroundPosition.join(" ");
    } else if (
      event.offsetX > 53 &&
      event.offsetX < imageWidth &&
      event.offsetX < 106
    ) {
      backgroundPosition[0] = `-${offset}px`;
      target.style.backgroundPosition = backgroundPosition.join(" ");
    } else if (event.offsetX > 106) {
      backgroundPosition[0] = `-${offset + imageWidth}px`;
      target.style.backgroundPosition = backgroundPosition.join(" ");
    }
  }

  function scrubberReset(event) {
    let backgroundPosition = event.target.style.backgroundPosition.split(" ");
    let offset = Number(event.target.getAttribute("data-offset").split(",")[0]);
    backgroundPosition[0] = `-${offset}px`;
    event.target.style.backgroundPosition = backgroundPosition.join(" ");
  }

</script>

<div style="padding: 20px;">
  <div
    class="scrubber-item"
    on:mousemove={scrubberMove}
    on:mouseleave={scrubberReset}
    style="background-position: -{data.offset[0]}px -{data.offset[1]}px; 
           background-image: url('{url}');"
    data-offset={data.offset}
  />
  <div class="progress" style="height: 5px">
    <div
      class="progress-bar progress-bar-striped bg-{confidence(data.prob)}"
      role="progressbar"
      style="width: {data.prob * 100}%"
      aria-valuenow={data.prob * 100}
      aria-valuemin="0"
      aria-valuemax="100"
    />
  </div>
  <span class="tag-item badge badge-secondary">
    <select bind:value={name} style="color: #f5f8fa" class="tag-item-select" >
      {#each OPTIONS as name}
        <option style="color: #f5f8fa" value={name}>{name}</option>
      {/each}
    </select>
    <svg
      height="20"
      width="20"
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
      class="tag-item-reject"
      on:click={() => {
        dispatch("remove", data.id);
      }}
      ><path
        d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"
      /></svg
    >
  </span>
</div>

<style>
  .tag-item {
    background-color: var(--card-color);
    width: 100%; 
    padding: 5px; 
    margin: 0px; 
  }

  .tag-item-select{
    border: none;
    outline: none;
    scroll-behavior: smooth;
  }

  .tag-item-reject:hover {
    fill: #a82c2c;
    transition: fill 0.2s ease-out;
  }

  .scrubber-item{
    width: 160px; 
    height: 90px; 
    border-radius: 5px 5px 0px 0px; 
    position: relative;
  }
  svg {
    fill: #ffffff;
  }

</style>
