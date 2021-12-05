# owned

![screenshot](/screenshot.png)

A companion userscript for [PlayniteGistLib](https://github.com/kevinfiol/PlayniteGistLib). Helps prevent you from buying the same game twice across multiple storefronts. Works on Steam and GOG.

## Install

1. Install a Userscript Manager
    * Chromium-based Browsers: [Violentmonkey](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag) or [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
    * Firefox: [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/) or [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)

Note: I recommend Violentmonkey since it is Free, Open-Source, and light on system resources.

2. **[Click here to install the userscript](https://github.com/kevinfiol/owned/raw/master/owned.user.js)**

## Usage

You must be using Playnite and have set up the [PlayniteGistLib](https://github.com/kevinfiol/PlayniteGistLib) extension before using this userscript.

Assuming you've already set up PlayniteGistLib, copy the Gist ID you created for PlayniteGistLib. After installing the `owned` userscript, you may visit a store page on either Steam or GOG to get started. Upon initialization, `owned` will prompt you for your Gist ID. Simply paste, and hit OK on the prompt. In the case that you mistyped the ID, or you'd like to change the ID, you can always click the `Edit Gist ID` button (as seen in the screenshot above).