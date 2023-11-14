const {stash} = unsafeWindow.stash;

export let STASHTAG_API_URL = "_STASHTAG_API_URL";
export let THRESHOLD = 20.0; // remove matches with a distance higher than this
export let MAX_RESULTS = 12; // number of results to show, don't change this for now

export var OPTIONS = [
  'Anal',
  'Vaginal Penetration',
  'Blow Job',
  'Doggy Style',
  'Cowgirl',
  'Reverse Cowgirl',
  'Side Fuck',
  'Seashell',
  'Gape',
  'Face Fuck',
  'Fingering',
  'Kneeling',
  'Butter Churner',
  'Table Top',
  'Double Penetration',
  'Missionary',
  'Scissoring',
  'Flatiron',
  'Pussy Licking',
  'Ass Licking',
  'Ball Licking',
  'Face Sitting',
  'Hand Job',
  'Tit Job',
  '69',
  'Kissing',
  'Dildo',
  'Cumshot'];



export function waitForElm(selector) {
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

/**
 * Returns an array containing the scenario and scenario ID extracted from the current URL.
 * @returns {Array<string>} An array containing the scenario and scenario ID.
 */
export function getScenarioAndID() {
  var result = document.URL.match(/(scenes|images)\/(\d+)/);
  var scenario = result[1];
  var scenario_id = result[2];
  return [scenario, scenario_id];
}


/**
 * Retrieves the tags associated with a given scene ID.
 *
 * @param {string} scene_id - The ID of the scene to retrieve tags for.
 * @returns {Promise<string[]>} - A promise that resolves with an array of tag IDs.
 */
export async function getTagsForScene(scene_id) {
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


/**
 * Updates a scene with the given scene_id and tag_ids.
 * @param {string} scene_id - The ID of the scene to update.
 * @param {Array<string>} tag_ids - An array of tag IDs to associate with the scene.
 * @returns {Promise<Object>} - A promise that resolves with the updated scene object.
 */
export async function updateScene(scene_id, tag_ids) {
  const reqData = {
    variables: { input: { id: scene_id, tag_ids: tag_ids } },
    query: `mutation sceneUpdate($input: SceneUpdateInput!){
      sceneUpdate(input: $input) {
        id
      }
    }`,
  };
  return stash.callGQL(reqData);
}


/**
 * Creates a new tag with the given name.
 * @param {string} tag_name - The name of the tag to create.
 * @returns {Promise<string>} - A Promise that resolves with the ID of the newly created tag.
 */
export async function createTag(tag_name) {
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


/**
 * Retrieves all tags from the server and returns them as a map with tag names (and aliases) as keys and tag IDs as values.
 * @returns {Promise<Object>} A promise that resolves to an object with tag names (and aliases) as keys and tag IDs as values.
 */
export async function getAllTags() {
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
    map[obj.name.toLowerCase()] = obj.id;
    obj.aliases.forEach((alias) => {
      map[alias.toLowerCase()] = obj.id;
    });
    return map;
  }, {});
}


/**
 * Retrieves the URL of the sprite for a given scene ID.
 *
 * @param {number} scene_id - The ID of the scene to retrieve the sprite URL for.
 * @returns {Promise<string|null>} - A Promise that resolves with the sprite URL if it exists, or null if it does not.
 */
export async function getUrlSprite(scene_id) {
  const reqData = {
    query: `{
      findScene(id: ${scene_id}){
        paths{
          sprite
        }
      }
    }`,
  };
  var result = await stash.callGQL(reqData);
  const url = result.data.findScene.paths["sprite"];
  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  } else {
    return result.data.findScene.paths["sprite"];
  }
}
