/**
 *    Copyright (c) 2022 Futrime
 *    SHAO Note is licensed under Mulan PSL v2.
 *    You can use this software according to the terms and conditions of the Mulan PSL v2. 
 *    You may obtain a copy of Mulan PSL v2 at:
 *                http://license.coscl.org.cn/MulanPSL2 
 *    THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.  
 *    See the Mulan PSL v2 for more details.  
 */

/**
 *    SHAO Note
 *    TsinghuaCloudRemake Official Widget
 *    A note taking widget based on SHAO-Pastebin
 *    id: shao-note
 *    context: [video]
 */

(async () => { // a widget should not pollute global environment
    function createEntry() {
        const el1 = document.createElement('span');
        el1.classList.add('bi-journal-text', 'fs-3', 'me-2', 'align-middle');

        const el2 = document.createElement('span');
        el2.classList.add('align-middle');
        el2.textContent = '做笔记';

        const el = document.createElement('a');
        el.setAttribute('href', '#');
        el.classList.add('text-decoration-none', 'link-dark', 'me-5', 'shao-note-entry');
        el.append(el1);
        el.append(el2);

        document.querySelector('.tcr-toolbar').append(el);
        return el;
    }

    function createContainer() {
        const el = document.createElement('div');
        el.classList.add('shao-note-container');
        document.querySelector('.tcr-float-container-bottom-end').append(el);
        return el;
    }

    async function loadWidget(widgetURL, container) {
        const html = await (await fetch(widgetURL + 'widget.html')).text();
        container.innerHTML = html;
        return container.querySelector('.shao-note-widget');
    }

    /**
     * Post an object to path of the backend and return the return value as an object.
     * 
     * @param {String} path The path of the backend to post.
     * @param {Object} obj The object to post.
     * @returns {Object} The return value of the response.
     */
    async function postData(path, obj) {
        let data = new FormData();
        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                let element = obj[key];
                if (element === null) {
                    element = '';
                }
                data.append(key, element);
            }
        }
        const res = await fetch(shaoConfig.backendURL + path, {
            method: 'POST',
            cache: 'no-cache',
            body: data
        });
        const resData = await res.json();
        return resData;
    }

    /**
     * Perform login operation
     * 
     * @param {String} username The username
     * @param {String} password The password
     * @returns {Object} The response object including code and message
     */
    async function performLogin(username, password) {
        const resData = await postData('/user.php', {
            username: username,
            password: password,
            type: 'login'
        });
        if (resData.code === 0) {
            localStorage.setItem('shao_note_token', resData.token);
        }
        return resData;
    }

    async function fillPaste(widget) {
        const pasteList = await postData('/pastebin.php', {
            token: localStorage.getItem('shao_note_token'),
            type: 'list'
        }).then(res => res['data']);
        let paste = null;
        for (const x of pasteList) {
            try {
                let metadata = JSON.parse(x['metadata']);
                if (metadata['provider'] === 'tcr_shao_note' && metadata['fid'] === pageID) {
                    paste = x;
                }
            } catch (e) {
                continue;
            }
        }
        if (paste === null) { // if the paste hasn't been created
            await postData('/pastebin.php', {
                token: localStorage.getItem('shao_note_token'),
                type: 'add',
                title: '笔记 - ' + fileRealName,
                text: `## ${fileRealName}\n[原视频地址](${location.href})`,
                encryption: 0,
                password: '',
                metadata: JSON.stringify({
                    provider: 'tcr_shao_note',
                    fid: pageID,
                    type: 'video',
                    src: shared.pageOptions.rawPath
                }, null, 0)
            });
            fillPaste(widget);
            return;
        } else {
            paste = await postData('/pastebin.php', {
                token: localStorage.getItem('shao_note_token'),
                id: paste['id'],
                type: 'info'
            });
            console.log(paste);
            widget.querySelector('.shao-note-paste .shao-note-textarea').value = paste['text'];
            widget.querySelector('.shao-note-paste .shao-note-textarea').setAttribute('data-shao-note-id', paste['id']);
        }
    }

    const widgetURL = (() => {
        for (const widget of widgetList) {
            if (widget['id'] !== 'shao-note') {
                continue;
            }
            return (widget['url'] === '') ? `${config.staticURL}/widgets/${widget['id']}/` : `${widget['url']}/`;
        }
    })();

    const shaoConfig = await (async () => {
        return await (await fetch(widgetURL + 'config.json')).json();
    })();

    (() => {
        let cssNode = document.createElement('link');
        cssNode.setAttribute('rel', 'stylesheet');
        cssNode.setAttribute('href', widgetURL + 'widget.css');
        document.querySelector('head').append(cssNode);
    })(); // load CSS

    const entry = createEntry();
    const container = createContainer();
    const widget = await loadWidget(widgetURL, container);

    entry.addEventListener('click', () => {
        const toast = new bootstrap.Toast(widget);
        toast.show();
    });

    widget.querySelector('.shao-note-paste .shao-note-textarea').addEventListener('blur', async () => {
        postData('/pastebin.php', {
            token: localStorage.getItem('shao_note_token'),
            id: widget.querySelector('.shao-note-paste .shao-note-textarea').getAttribute('data-shao-note-id'),
            type: 'update',
            title: '笔记 - ' + fileRealName,
            text: widget.querySelector('.shao-note-paste .shao-note-textarea').value,
            encryption: 0,
            password: '',
            metadata: JSON.stringify({
                provider: 'tcr_shao_note',
                fid: pageID,
                type: 'video',
                src: shared.pageOptions.rawPath
            }, null, 0)
        })
    });

    widget.querySelector('.shao-note-login .shao-login-button').addEventListener('click', async () => {
        widget.querySelector('.shao-note-login .shao-note-login-hint').setAttribute('hidden', '');
        const username = widget.querySelector('.shao-note-login #floatingInput').value;
        const password = md5(widget.querySelector('.shao-note-login #floatingPassword').value);
        console.log(username);
        console.log(password);
        const res = await performLogin(username, password);
        if (res.code !== 0) {
            widget.querySelector('.shao-note-login .shao-note-login-hint').removeAttribute('hidden');
        } else {
            widget.querySelector('.shao-note-login').setAttribute('hidden', '');
            await fillPaste(widget);
            widget.querySelector('.shao-note-paste').removeAttribute('hidden');
        }
    });

    if (localStorage.getItem('shao_note_token') === null) {
        widget.querySelector('.shao-note-login').removeAttribute('hidden');
    } else {
        const res = await postData('/pastebin.php', {
            token: localStorage.getItem('shao_note_token'),
            type: 'list'
        });
        if (res.code !== 0) {
            localStorage.removeItem('shao_note_token');
            widget.querySelector('.shao-note-login').removeAttribute('hidden');
        } else {
            await fillPaste(widget);
            widget.querySelector('.shao-note-paste').removeAttribute('hidden');
        }
    }
})();