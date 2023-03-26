// ==UserScript==
// @name         stashtag
// @namespace    https://github.com/cc1234475
// @version      0.0.1
// @description  Find tags for a scene
// @author       cc12344567
// @match        http://localhost:9999/*
// @connect      localhost
// @connect      hf.space
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @require      https://code.jquery.com/jquery-2.0.3.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
// @require      https://raw.githubusercontent.com/7dJx1qP/stash-userscripts/master/src\StashUserscriptLibrary.js
// ==/UserScript==

var AUTOTAG_API_URL = "https://cc1234-stashtag.hf.space/api/predict";
// var AUTOTAG_API_URL = "http://localhost:7860/api/predict";

(function () {
  "use strict";

  const {
    stash,
    Stash,
    waitForElementId,
    waitForElementClass,
    waitForElementByXpath,
    getElementByXpath,
    insertAfter,
    createElementFromHTML,
  } = unsafeWindow.stash;

  function waitForElm(selector) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  var scanning = `<div role="dialog" aria-modal="true" class="fade ModalComponent modal show" tabindex="-1" style="display: block">
  <div class="modal-dialog scrape-query-dialog modal-xl">
    <div class="modal-content">
      <div class="modal-header"><span>Scanning...</span></div>
      <div class="modal-body">
        <div class="row justify-content-center">
        <h3>Scanning Scene for tags</h3>
        </div>
      </div>
      <div class="ModalFooter modal-footer">
        <div>
          <button id="tags_cancel" type="button" class="ml-2 btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</div>`;

  var top = `<div role="dialog" aria-modal="true" class="fade ModalComponent modal show" tabindex="-1" style="display: block">
<div class="modal-dialog scrape-query-dialog modal-xl">
  <div class="modal-content">
    <div class="modal-header"><span>Possible matching tags</span></div>
    <div class="modal-body">
      <div class="row justify-content-center">`;

  var match = (id, tag, url, offsets) => `
  <div style="padding: 5px;" id="tag-${id}" data-label="${tag}">
  <div class="scrubber-item" style="width: 160px; height: 90px; position: relative; background-position: -${offsets[0]}px -${offsets[1]}px; background-image: url(&quot;${url}&quot;);"></div>
  <span class="tag-item badge badge-secondary">${tag}
    <div role="button" class="react-select__multi-value__remove" aria-label="Remove ${tag}">
      <svg height="14" width="14" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
      </svg>
    </div>
  </span>
  </div>
  `;

  var bottom = `</div>
  </div>
  <div class="ModalFooter modal-footer">
    <div>
      <button id="tags_cancel" type="button" class="ml-2 btn btn-secondary">Cancel</button>
      <button id="tags_accept" type="button" class="ml-2 btn btn-secondary">Add Tags</button>
    </div>
  </div>
</div>
</div>
</div>`;

  async function show_matches(matches) {
    var html = top;
    let tags = await get_all_tags();
    let url = getUrlSprite();
    console.log(matches);

    let ii = 0;
    for (const key in matches) {
      let offset = matches[key]['offset']
      console.log(offset);
      html += match(ii, key, url, offset);
      ii++;
    }

    html += bottom;
    $("body").append(html);

    $("#tags_cancel").click(function () {
      close_modal();
    });

    $("#tags_accept").click(async function () {
      const scene_id = get_scene_id();
      let existing_tags = await get_tags_for_scene(scene_id);
      for (const tag in matches) {
        // if tag doesn't exist, create it
        if (tags[tag] === undefined) {
          existing_tags.push(await create_tag(tag));
        } else if (!existing_tags.includes(tags[tag])) {
          existing_tags.push(tags[tag]);
        }
      }
      await update_scene(scene_id, existing_tags);
      close_modal();
      location.reload();
    });

    ii = 0
    for (const key in matches) {
      $(`#tag-${ii}`).click(function () {
        let label = $(this).data('label');
        delete matches[label];
        $(this).remove();
      });
      ii++;
    }
  }

  async function create_tag(tag_name) {
    const reqData = {
      variables: { input: {name: tag_name} },
      query: `mutation tagCreate($input: TagCreateInput!) {
        tagCreate(input: $input){
              id
          }
        }`,
    };
    let result = await stash.callGQL(reqData);
    return result.data.tagCreate.id;
  }

  async function get_tags_for_scene(scene_id) {
    const reqData = {
      query: `{
        findScene(id: "${scene_id}") {
          tags {
            id
          }
        }
      }`,
    };
    var result = await stash.callGQL(reqData);
    return result.data.findScene.tags.map((p) => p.id);
  }


  async function update_scene(scene_id, tag_ids) {
    const reqData = {
      variables: { input: { id: scene_id, tag_ids: tag_ids } },
      query: `mutation sceneUpdate($input: SceneUpdateInput!){
        sceneUpdate(input: $input) {
          id
        }
      }`,
    };
    return await stash.callGQL(reqData);
  }

  function get_scene_id() {
    return document.URL.match(/scenes\/(\d+)/)[1];
  }

  async function get_all_tags() {
    const reqData = {
      query: `{
        allTags{
          id
          name
          aliases
        }
      }`,
    };
    var result = await stash.callGQL(reqData);
    return result.data.allTags.reduce((map, obj) => {
      map[obj.name] = obj.id;
      obj.aliases.forEach((alias) => {
        map[alias] = obj.id;
      });
      return map;
    }, {});
  }

  async function getTags() {
    let url = getUrlSprite();

    // get image blob
    const iblob = await fetch(url).then(res => res.blob());
    let image = await new Promise(resolve => {
      let reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(iblob);
    });

    // get vtt blob
    url = url.replace("_sprite.jpg", "_thumbs.vtt");
    const vblob = await fetch(url).then(res => res.blob());
    let vtt = await new Promise(resolve => {
      let reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(vblob);
    });

    $("body").append(scanning);
    var data = {"data": [image, vtt]};
    var requestDetails = {
      method: "POST",
      url: AUTOTAG_API_URL,
      data: JSON.stringify(data),
      headers: {"Content-Type": "application/json; charset=utf-8"},
      onload: function (response) {
        var data = JSON.parse(response.responseText);
        close_modal();
        if (data.data[0].length === 0) {
          alert("No tags found");
          return;
        }
        show_matches(data.data[0]);
      },
      onerror: function (response) {
        close_modal();
        alert("Error: " + response.responseText);
      },
    };
    GM_xmlhttpRequest(requestDetails);
  }

  function getUrlSprite(){
    return $(".scrubber-item")[0].style.backgroundImage.slice(5, -2);
  }

  function close_modal() {
    $(".ModalComponent").remove();
  }

  function create_button(action) {
    waitForElm(".ml-auto .btn-group").then(() => {
      const grp = document.querySelector(".ml-auto .btn-group");
      const btn = document.createElement("button");
      btn.setAttribute("id", "tagger");
      btn.setAttribute("title", "Scan for tags");
      btn.classList.add("btn", "btn-secondary", "minimal");
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="m21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4a2 2 0 0 0-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58c.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41c0-.55-.23-1.06-.59-1.42M5.5 7A1.5 1.5 0 0 1 4 5.5A1.5 1.5 0 0 1 5.5 4A1.5 1.5 0 0 1 7 5.5A1.5 1.5 0 0 1 5.5 7m11.77 8.27L13 19.54l-4.27-4.27A2.52 2.52 0 0 1 8 13.5a2.5 2.5 0 0 1 2.5-2.5c.69 0 1.32.28 1.77.74l.73.72l.73-.73c.45-.45 1.08-.73 1.77-.73a2.5 2.5 0 0 1 2.5 2.5c0 .69-.28 1.32-.73 1.77Z"/></svg>';
      btn.onclick = action;
      grp.appendChild(btn);
    });
  }

  stash.addEventListener("page:scene", function () {
    create_button(getTags);
  });

})();
