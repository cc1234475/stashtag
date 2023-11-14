<script>
  import Tag from "./Tag.svelte";

  import { onMount } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { quintOut } from "svelte/easing";
  import {
    createTag,
    getAllTags,
    getTagsForScene,
    updateScene,
    getScenarioAndID,
  } from "./utils";

  export let matches = [];
  export let url = "";
  export let threshold = 0.2;

  let visible = false;
  let saving = false;
  let modal;
  let tags;

  matches = Object.entries(matches)
    .sort((a, b) => b[1].frame - a[1].frame)
    .reverse();

  // add random id to each match
  matches = matches.map((x) => {
    x[1].id = Math.random().toString(36).substring(7);
    return x;
  });

  $: filteredMatches = matches.filter((x) => x[1].prob > threshold);

  onMount(async () => {
    // so we see a nice transition
    visible = true;
    tags = await getAllTags();
  });

  async function close() {
    // so we see a nice transition
    visible = false;
    setTimeout(() => {
      modal.remove();
    }, 400);
  }

  function remove(event) {
    const id = event.detail;
    matches = matches.filter((x) => x[1].id !== id);
  }

  async function save() {
    saving = true;
    const [, scene_id] = getScenarioAndID();
    let existingTags = await getTagsForScene(scene_id);

    for (const [tag] of filteredMatches) {
      let tagLower = tag.toLowerCase();
      // if tag doesn't exist, create it
      if (tags[tagLower] === undefined) {
        existingTags.push(await createTag(tag));
      } else if (!existingTags.includes(tags[tagLower])) {
        existingTags.push(tags[tagLower]);
      }
    }
    await updateScene(scene_id, existingTags);
    saving = false;
    close();
    location.reload();
  }

  function changeThreshold() {
    localStorage.setItem("stash-tag-threshold", threshold);
  }
</script>

{#if visible}
  <div
    bind:this={modal}
    role="dialog"
    aria-modal="true"
    class="fade ModalComponent modal show"
    tabindex="-1"
    style="display: block"
    in:fly={{ y: 100, duration: 400 }}
    out:fly={{ y: -100, duration: 400 }}
  >
    <div class="modal-dialog modal-xl top-accent">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Stash Tag</h3>
        </div>
        <div class="modal-body">
          <div class="row justify-content-center">
            {#each filteredMatches as [tagName, tagData] (tagData.id)}
              <div
                out:fade
                in:fade
                animate:flip={{ duration: 250, easing: quintOut }}
              >
                <Tag
                  bind:name={tagName}
                  data={tagData}
                  {url}
                  on:remove={remove}
                />
              </div>
            {/each}
          </div>
        </div>
        <div class="ModalFooter modal-footer">
          <div>
            <button
              id="tags-cancel"
              type="button"
              on:click={close}
              class="ml-2 btn btn-secondary">Close</button
            >
            <button
              id="tags-accept"
              type="button"
              on:click={save}
              class="ml-2 btn btn-primary"
            >
              {#if saving}
                <div class="lds-dual-ring" />
              {/if}
              Add Tags</button
            >
          </div>
          <div>
            Threshold: <input
              type="range"
              min="0.2"
              max="0.9"
              step="0.1"
              bind:value={threshold}
              on:change={changeThreshold}
              id="stash-tag-threshold"
              style="margin: 0px; height: 10px;"
            />
            {threshold * 100} %
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .top-accent {
    border-top: 10px solid var(--primary);
    /* give it rounded corners */
    border-radius: 3px;

  }
  .modal-header {
    font-size: 2.4rem;
    border-bottom: 0px;
    padding: 20px;
  }

  .modal-footer {
    border-top: 0px;
  }

  .lds-dual-ring {
    display: inline-block;
    width: 16px;
    height: 16px;
  }
  .lds-dual-ring:after {
    content: " ";
    display: block;
    width: 12px;
    height: 12px;
    margin: 3px;
    border-radius: 50%;
    border: 6px solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: lds-dual-ring 1.2s linear infinite;
  }
  @keyframes lds-dual-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
