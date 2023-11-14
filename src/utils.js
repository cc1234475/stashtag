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

export function getScenarioAndID() {
  var result = document.URL.match(/(scenes|images)\/(\d+)/);
  var scenario = result[1];
  var scenario_id = result[2];
  return [scenario, scenario_id];
}


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
    map[obj.name] = obj.id;
    obj.aliases.forEach((alias) => {
      map[alias] = obj.id;
    });
    return map;
  }, {});
}


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
