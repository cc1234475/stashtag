<script>
  import { getScenarioAndID, getUrlSprite, STASHTAG_API_URL  } from "./utils";
  import Match from "./Matches.svelte";

  let scanner = false;

  async function getTags() {
    scanner = true;
    const [, scene_id] = getScenarioAndID();
    let url = await getUrlSprite(scene_id);
    console.log(url);

    if (!url) {
      alert("No sprite found, please ensure you have sprites enabled and generated for your scenes.");
      scanner = false;
      return;
    }

    // get image blob
    const iblob = await fetch(url).then(res => res.blob());
    let image = await new Promise(resolve => {
      let reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(iblob);
    });

    // get vtt blob
    const vtt_url = url.replace("_sprite.jpg", "_thumbs.vtt");
    const vblob = await fetch(vtt_url).then(res => res.blob());
    let vtt = await new Promise(resolve => {
      let reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(vblob);
    });
    // query the api with a threshold of 0.2 as we want to do the filtering ourselves
    var data = {"data": [image, vtt, 0.2]};
    var requestDetails = {
      method: "POST",
      url: STASHTAG_API_URL,
      data: JSON.stringify(data),
      headers: {"Content-Type": "application/json; charset=utf-8"},
      onload: function (response) {
        if (response.status !== 200) {
            scanner = false;
            alert("Something went wrong. It's likely a server issue, Please try again later.")
            return;
        }
        try {
          var data = JSON.parse(response.responseText);
        } catch (e) {
          alert("Error: " + response.responseText);
          return;
        }
        scanner = false;
        if (data.data[0].length === 0) {
          alert("No tags found");
          return;
        }
        // grab stash-tag-threshold from local storage or set to default
        let threshold = localStorage.getItem('stash-tag-threshold') || 0.4;
        new Match({
            target: document.body,
            props: { matches: data.data[0], url: url, threshold: threshold },
          });
      },
      onerror: function (response) {
        scanner = false;
        alert("Error: " + response.responseText);
      },
    };
    GM_xmlhttpRequest(requestDetails);
  }
</script>

<button on:click={getTags} class:scanner id="stashtag">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="m21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4a2 2 0 0 0-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58c.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41c0-.55-.23-1.06-.59-1.42M5.5 7A1.5 1.5 0 0 1 4 5.5A1.5 1.5 0 0 1 5.5 4A1.5 1.5 0 0 1 7 5.5A1.5 1.5 0 0 1 5.5 7m11.77 8.27L13 19.54l-4.27-4.27A2.52 2.52 0 0 1 8 13.5a2.5 2.5 0 0 1 2.5-2.5c.69 0 1.32.28 1.77.74l.73.72l.73-.73c.45-.45 1.08-.73 1.77-.73a2.5 2.5 0 0 1 2.5 2.5c0 .69-.28 1.32-.73 1.77Z"/></svg>
</button>

<style>
  button {
    background-color: var(--nav-color);
    border: 0px;
  }

  .scanner {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 var(--light);
    }

    70% {
      transform: scale(1.1);
      box-shadow: 0 0 0 10px var(--info);
    }

    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 var(--primary);
    }
  }
</style>
