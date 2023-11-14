import { waitForElm } from "./utils";
import Button from "./Button.svelte";

const { stash } = unsafeWindow.stash;

stash.addEventListener("page:scene", function () {
  let elms = ".ml-auto .btn-group";
  waitForElm(elms).then(() => {
    const e = new Button({ target: document.querySelector(elms) });
  });
});
