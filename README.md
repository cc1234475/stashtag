# Stash Tag

![](_media/tag_logo.png)

Stash tag is a tool that utilizes playbar sprite images to perform image recognition and generate a list of potential tags for a video.

To be used with [Stash](https://github.com/stashapp/stash)

# Stash Userscripts

Installation requires a browser extension such as [Tampermonkey](https://www.tampermonkey.net/).

**By default the userscripts only work for `http://localhost:9999`**

> If you access Stash from a different address, you will need to modify the userscript when you install it.
>
> Find the line `// @match       http://localhost:9999/*` and replace `http://localhost:9999/*` with your Stash address.

[INSTALL USERSCRIPT](dist/stashtag.user.js?raw=1)

Once installed, A new icon will show on a scene's page next to the organized button.

![](_media/tag_scan_icon.png)
