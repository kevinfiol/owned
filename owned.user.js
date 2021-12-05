// ==UserScript==
// @name owned
// @namespace https://github.com/kevinfiol/owned
// @version 0.1.1
// @description don't buy the same game twice
// @icon https://raw.githubusercontent.com/kevinfiol/owned/raw/master/assets/icon.png
// @license MIT; https://github.com/kevinfiol/owned/blob/master/LICENSE
// @include http://*.steampowered.com/app/*
// @include https://*.steampowered.com/app/*
// @include http://*.gog.com/game/*
// @include https://*.gog.com/game/*
// @updateURL https://github.com/kevinfiol/owned/raw/master/owned.user.js
// @downloadURL https://github.com/kevinfiol/owned/raw/master/owned.user.js
// @run-at document-idle
// @grant GM_xmlhttpRequest
// @grant GM.xmlHttpRequest
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_deleteValue
// @grant GM_listValues
// ==/UserScript==

(async () => {
    const STORAGE_KEY = 'owned_userscript_gist_id';
    const ICONS = {
        Epic: 'https://github.com/kevinfiol/owned/raw/master/assets/epic.png',
        GOG: 'https://github.com/kevinfiol/owned/raw/master/assets/gog.png',
        Humble: 'https://github.com/kevinfiol/owned/raw/master/assets/humble.png',
        'itch.io': 'https://github.com/kevinfiol/owned/raw/master/assets/itch.png',
        Steam: 'https://github.com/kevinfiol/owned/raw/master/assets/steam.png'
    };

    const storage = Storage();

    const url = window.location.href;
    const results = [];
    let gistId = storage.getValue(STORAGE_KEY);
    let json;
    let library;
    let title = '';
    let store = null;

    if (!gistId) {
        gistId = promptForGistId();
        if (!gistId.trim()) logError('Invalid Gist ID provided');
        else storage.setValue(STORAGE_KEY, gistId);
    }

    if (gistId) {
        try {
            json = await request('GET', `https://api.github.com/gists/${gistId}`);
        } catch (_e) {
            logError(`Could not retrieve Gist content. Gist may not exist: https://api.github.com/gists/${gistId}`);
        }

        try {
            library = JSON.parse(JSON.parse(json).files['library.json'].content);
        } catch {
            logError('Could not parse JSON');
        }
    }

    if (url.includes('steampowered.com')) {
        title = q('#appHubAppName').innerText;
        store = 'STEAM';
    } else if (url.includes('gog.com')) {
        title = q('meta[property="og:title"]').getAttribute('content');
        store = 'GOG';
    }

    if (title) title = removeNonASCII(title.toUpperCase());
    else logError('Could not get title.');

    if (title && library && library.games) {
        for (let i = 0, len = library.games.length; i < len; i += 1) {
            if (removeNonASCII(library.games[i].name.toUpperCase()) === title && library.games[i].store.toUpperCase() !== store) {
                results.push(library.games[i]);
            }
        }
    }

    // render elements
    let purchaseBox;
    const appContainer = c('div', 'owned-container');
    const resultsExist = results.length > 0;

    if (store == 'STEAM') {
        style(appContainer, {
            padding: '1em',
            position: 'relative',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            fontSize: '12px',
            zIndex: '0',
            color: 'rgb(98, 99, 102)',
        });

        appContainer.innerHTML = `
            <div>
                ${resultsExist
                    ? `
                        <div style="padding-bottom: 1em;">
                            <b>You already own this game on:</b>
                        </div>
                        <div>
                            ${results.map((result) => `
                                <span style="padding-right: 2em">
                                    ${ICONS[result.store]
                                        ? `
                                            <img
                                                src=${ICONS[result.store]}
                                                style="width: 20px; height: 20px; vertical-align: middle; margin: 0 4px 0 0;"
                                            />
                                        `
                                        : ''
                                    }
                                    ${result.url
                                        ? `<a href="${result.url}">${result.store}</a>`
                                        : result.store
                                    }
                                </span>
                            `).join('\n')}
                        </div>
                    `
                    : ''
                }

                <button id="owned-config-button">
                    ⚙️ Edit Gist ID
                </button>
            </div>
        `;

        purchaseBox = q('.game_area_purchase_game');
        purchaseBox.insertAdjacentElement('beforebegin', appContainer);
    } else if (store == 'GOG') {
        appContainer.innerHTML = `
            <div>
                <div style="box-shadow: rgba(0, 0, 0, 0.25) 0px 4px 6px -2px; height: 14px; position: absolute; left: 0px; width: 100%;"></div>
                <div style="padding-top: 2.2em; font-size: 13px; line-height: 1.7em;">
                    ${resultsExist
                        ? `
                            <div>
                                <b>You already own this game on:</b>
                            </div>
                            ${results.map((result) => `
                                <span style="padding-right: 2em">
                                    ${result.url
                                        ? `<a href="${result.url}" style="text-decoration: underline;">${result.store}</a>`
                                        : result.store
                                    }
                                </span>
                            `).join('\n')}
                        `
                        : ''
                    }

                    <button id="owned-config-button">
                        ⚙️ Edit Gist ID
                    </button>
                </div>
            </div>
        `;

        purchaseBox = q('div.product-actions');
        purchaseBox.appendChild(appContainer);
    }

    // get config button element, style, and add event listener
    const configButton = document.getElementById('owned-config-button');

    style(configButton, {
        fontSize: '12px',
        border: '1px solid rgba(100, 100, 100, 0.2)',
        marginTop: '1em',
        padding: '0.5em',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        color: 'inherit'
    });

    configButton.addEventListener('click', (ev) => {
        ev.preventDefault();
        const newGistId = promptForGistId(gistId);
        storage.setValue(STORAGE_KEY, newGistId);
    });

    /**
     * Utils
     */
    function q(query) {
        return document.querySelector(query);
    }

    function c(tag, className, innerHTML = '') {
        const el = document.createElement(tag);
        el.className = className;
        el.innerHTML = innerHTML;
        return el;
    };

    function request(method, endpoint, params = {}) {
        const query = Object.entries(params).reduce((str, [key, value]) => {
            if (!str) str += '?';
            if (str.length > 1) str += '&';
            str += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            return str;
        }, '');

        const url = endpoint + query;

        return new Promise((resolve, reject) => {
            if (window.GM_xmlhttpRequest) {
                const xhr = window.GM_xmlhttpRequest;

                xhr({
                    method,
                    url,
                    onload: res => {
                        if (res.status >= 200 && res.status < 300) {
                            resolve(res.responseText);
                        } else {
                            reject(res.statusText);
                        }
                    },
                    onerror: err => reject(err.statusText)
                });
            } else {
                const xhr = new XMLHttpRequest();
                xhr.open(method, url);
        
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject(xhr.statusText);
                    }
                };
        
                xhr.onerror = () => reject(xhr.statusText);
                xhr.send();
            }
        });
    };

    function Storage() {
        return {
            getValue: key => GM_getValue(key, null),
            setValue: (key, value) => GM_setValue(key, value),
            deleteValue: key => GM_deleteValue(key),
            listValues: () => GM_listValues()
        };
    };

    function logError(msg) {
        console.error(`owned User Script Error: ${msg}`);
    }

    function removeNonASCII(str) {
        return str.replace(/[^\x00-\x7F]/g, '');
    }

    function promptForGistId(existing = '') {
        return prompt('Please enter your PlayniteGistLib Gist ID:', existing);
    }

    function style(el, styles) {
        Object.entries(styles).map(([prop, value]) => {
            el.style[prop] = value;
        });
    }
})();