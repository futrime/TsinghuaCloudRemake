/**
 *    Copyright (c) 2022 Futrime
 *    清华大学云盘 Remake is licensed under Mulan PSL v2.
 *    You can use this software according to the terms and conditions of the Mulan PSL v2. 
 *    You may obtain a copy of Mulan PSL v2 at:
 *                http://license.coscl.org.cn/MulanPSL2 
 *    THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.  
 *    See the Mulan PSL v2 for more details.  
 */

/***********************************
 * Declaration of Global Variables *
 ***********************************/

const pageID = md5(shared.pageOptions.repoID + shared.pageOptions.filePath).toUpperCase(); // Unique ID for each file
const pathID = md5(shared.pageOptions.repoID + shared.pageOptions.filePath.slice(0, -shared.pageOptions.fileName.length)).toUpperCase(); // Unique ID for each folder
const fileRealName = shared.pageOptions.fileName.slice(0, -(shared.pageOptions.fileExt.length + 1)); // The filename without extension suffix
const g_sharedVariable = {}; // An object storing all shared variables
const widgetList = [];
let enabledWidgetList = [];
let videoInfo = false;
let userInfo = false;
let publisherInfo = false;


/*************
 * Functions *
 *************/

/**
 * The function to execute when a switch in widget menu is changed
 * @param {Event} event A change event
 */
function changeWidgetSwitch(event) {
    const id = event.target.parentElement.parentElement.getAttribute('data-tcr-widget-id');
    const status = event.target.checked;
    if (status === true && enabledWidgetList.indexOf(id) === -1) {
        enabledWidgetList.push(id);
    } else if (status === false && enabledWidgetList.indexOf(id) !== -1) {
        enabledWidgetList.splice(enabledWidgetList.indexOf(id));
    }
    localStorage.setItem('tcr:enabled_widgets', JSON.stringify(enabledWidgetList, null, 0));
}

/**
 * Parse all widgets and remote indexes in a widget index and save to widgetList
 * @param {array} widgetIndex A widget index list
 * @param {string} url The url of this widget index file
 */
async function getWidgets(widgetIndex) {
    if (g_sharedVariable.fetchedWidgets === undefined) {
        g_sharedVariable.fetchedWidgets = [];
    }
    for (const item of widgetIndex) {
        if (item.type === 'widget' && g_sharedVariable.fetchedWidgets.indexOf(item.id) === -1) {
            g_sharedVariable.fetchedWidgets.push(item.id);
            widgetList.push(item);
        } else if (item.type === 'index') {
            let index = await fetch(item.url).then(res => res.json());
            await getWidgets(index);
        }
    }
}

/**
 * Update activity menu
 */
async function updateActivity() {
    let activityVideos = [];
    let followedInfo = {};
    for (const x of userInfo['following']) {
        let videos = await (await fetch(config.backendURL + '/library/', {
            method: 'POST',
            body: JSON.stringify({
                action: 'getFileInfo',
                publisher: x,
                type: 'video'
            }, null, 0)
        })).json();
        if (videos == false) { // if this user hasn't published any video
            continue;
        }
        activityVideos = activityVideos.concat(videos);
    }
    activityVideos.sort((a, b) => (b['time'] - a['time'])); // newer first
    for (const x of userInfo['following']) {
        let info = await (await fetch(config.backendURL + '/user/?username=' + x)).json();
        followedInfo[x] = info;
    }

    const template = document.querySelector('.tcr-activity>.tcr-list>.tcr-unit');
    for (let i = 0; i < activityVideos.length; i++) {
        const x = activityVideos[i];
        const el = template.cloneNode(true);
        el.querySelector('img').setAttribute('src', followedInfo[x['publisher']]['avatar_url']);
        el.querySelector('.tcr-publisher').textContent = followedInfo[x['publisher']]['name'];
        el.querySelector('.tcr-name').textContent = x['brief'];
        el.querySelector('.tcr-time').textContent = (new Date(x['time'] * 1000)).toLocaleString('zh-CN');
        el.querySelector('a').setAttribute('href', x['url']);
        if (i !== 0) {
            el.classList.add('border-top');
        }
        el.removeAttribute('hidden');
        document.querySelector('.tcr-activity>.tcr-list').append(el);
    }
};

/**
 * Update collection menu
 */
async function updateCollection() {
    // Get videos in collection
    let collectionVideos = [];
    for (const x of userInfo['collection']) {
        let videos = await (await fetch(config.backendURL + '/library/', {
            method: 'POST',
            body: JSON.stringify({
                action: 'getFileInfo',
                fid: x,
                type: 'video'
            }, null, 0)
        })).json();
        if (videos == false) { // if this video does not exist (abnormal)
            continue;
        }
        collectionVideos.push(videos[0]);
    }
    collectionVideos = collectionVideos.reverse();

    // Get publishers' information
    let publisherList = [];
    let publisherInfoList = [];
    for (const x of collectionVideos) {
        publisherList.push(x['publisher']);
    }
    publisherList = Array.from(new Set(publisherList)); // remove duplicated items to reduce time consumption
    for (const x of publisherList) {
        let info = await (await fetch(config.backendURL + '/user/?username=' + x)).json();
        publisherInfoList[x] = info;
    }

    // Display collection
    const template = document.querySelector('.tcr-collection>.tcr-list>.tcr-unit');
    for (let i = 0; i < collectionVideos.length; i++) {
        const x = collectionVideos[i];
        const el = template.cloneNode(true);
        el.querySelector('img').setAttribute('src', publisherInfoList[x['publisher']]['avatar_url']);
        el.querySelector('.tcr-publisher').textContent = publisherInfoList[x['publisher']]['name'];
        el.querySelector('.tcr-name').textContent = x['brief'];
        el.querySelector('a').setAttribute('href', x['url']);
        if (i !== 0) {
            el.classList.add('border-top');
        }
        el.removeAttribute('hidden');
        document.querySelector('.tcr-collection>.tcr-list').append(el);
    }
};


/******************
 * Initialization *
 ******************/
(async () => {
    await getWidgets(config.widgetIndex); // get all widgets
    if (localStorage.getItem('tcr:enabled_widgets') === null) {
        localStorage.setItem('tcr:enabled_widgets', JSON.stringify([], null, 0));
        enabledWidgetList = [];
    } else {
        enabledWidgetList = JSON.parse(localStorage.getItem('tcr:enabled_widgets'));
    }

    // Load asynchronous widgets
    for (const widget of widgetList) {
        if (widget.context.indexOf('video') === -1 || // if the widget cannot run in video context
            widget.runtime === 'defer' || // if the widget should be run after initialization
            enabledWidgetList.indexOf(widget.id) === -1 // if the widget is disabled
        ) {
            continue;
        }
        let jsNode = document.createElement('script');
        jsNode.setAttribute('src', `${widget.url}/widget.js`);
        jsNode.setAttribute('async', '');
        document.querySelector('body').append(jsNode);
    }

    // Load video information
    try {
        videoInfo = (await (await fetch(config.backendURL + '/library/', {
            method: 'POST',
            body: JSON.stringify({
                action: 'getFileInfo',
                fid: pageID,
                type: 'video'
            }, null, 0)
        })).json())[0];
    } catch (error) {
        console.log('[TCR] This video has not been uploaded.');
    }
    if (videoInfo === undefined) {
        videoInfo = false;
    }

    if (app.pageOptions.username !== '') {
        await fetch(config.backendURL + '/user/', {
            method: 'POST',
            body: JSON.stringify({
                action: 'updateUserInfo',
                username: app.pageOptions.username,
                name: app.pageOptions.name,
                email: app.pageOptions.contactEmail,
                avatar_url: app.config.avatarURL
            }, null, 0)
        }); // update user information, not need to wait
        userInfo = await (await fetch(config.backendURL + '/user/?username=' + app.pageOptions.username)).json();
    }

    if (videoInfo !== false) {
        publisherInfo = await (await fetch(config.backendURL + '/user/?username=' + videoInfo['publisher'])).json();
    }

    // Update header
    if (userInfo !== false) { // if user has signed in
        document.querySelector('header .tcr-activity-button').removeAttribute('hidden');
        document.querySelector('header .tcr-collection-button').removeAttribute('hidden');
        if (videoInfo === false) { // if the video hasn't been published
            document.querySelector('header .tcr-publish-button').removeAttribute('hidden'); // Allow publishing
        }
    }

    // Update subtitle
    if (videoInfo !== false) {
        document.querySelector('.tcr-subtitle>.tcr-view-count').textContent = videoInfo['visit_count'];
        document.querySelector('.tcr-subtitle>.tcr-publish-time').textContent = (new Date(videoInfo['time'] * 1000)).toLocaleString('zh-CN');
    }

    // Update toolbar
    if (videoInfo !== false) {
        document.querySelector('.tcr-toolbar .tcr-like-count').textContent = videoInfo['like_count'];
        document.querySelector('.tcr-toolbar .tcr-collect-count').textContent = videoInfo['collect_count'];
        document.querySelector('.tcr-toolbar .tcr-download-count').textContent = videoInfo['download_count'];
        if (userInfo !== false) {
            document.querySelector('.tcr-toolbar .tcr-like-button').removeAttribute('hidden');
            document.querySelector('.tcr-toolbar .tcr-collect-button').removeAttribute('hidden');
            if (videoInfo['metadata']['like_list'].indexOf(userInfo['username']) !== -1) {
                has_liked = true;
                document.querySelector('.tcr-toolbar>.tcr-like-button').classList.replace('link-dark', 'link-info');
            }
            if (userInfo['collection'].indexOf(pageID) !== -1) {
                has_collected = true;
                document.querySelector('.tcr-toolbar>.tcr-collect-button').classList.replace('link-dark', 'link-info');
            }
        }
    }

    // Update publisher information
    if (videoInfo === false) { // if this video has not been uploaded
        document.querySelector('.tcr-publisher-info .tcr-name').textContent = shared.pageOptions.sharedBy + '（资料库）'; // Display repo sharer
    } else {
        document.querySelector('.tcr-publisher-info>.tcr-avatar').setAttribute('src', publisherInfo['avatar_url']);

        document.querySelector('.tcr-publisher-info .tcr-name').textContent = publisherInfo['name'];
        document.querySelector('.tcr-publisher-info .tcr-name').classList.replace('link-secondary', 'link-primary');

        document.querySelector('.tcr-publisher-info .tcr-email-button').setAttribute('href', 'mailto:' + publisherInfo.email);
        document.querySelector('.tcr-publisher-info .tcr-email-button').removeAttribute('hidden');

        for (const x of document.querySelectorAll('.tcr-publisher-info .tcr-subscribe-count')) {
            x.textContent = publisherInfo['followed_count'];
        }

        if (userInfo !== false) { // if user has signed in
            document.querySelector('.tcr-publisher-info .tcr-subscribe-button-disabled').setAttribute('hidden', '');
            if (userInfo['following'].indexOf(publisherInfo['username']) === -1) { // if not subscribed
                document.querySelector('.tcr-publisher-info .tcr-subscribe-button').removeAttribute('hidden');
            } else {
                document.querySelector('.tcr-publisher-info .tcr-subscribe-button-subscribed').removeAttribute('hidden');
            }
        }
    }

    // Update activity asynchronously
    if (userInfo !== false) {
        updateActivity();
    }

    // Update collection asynchronously
    if (userInfo !== false) {
        updateCollection();
    }

    // Update widget menu
    for (const widget of widgetList) {
        const el = document.querySelector('.tcr-widget>.tcr-list>.tcr-unit[hidden]').cloneNode(true);
        window.ele = el;
        el.removeAttribute('hidden');
        el.setAttribute('data-tcr-widget-id', widget.id);
        el.querySelector('.tcr-name').textContent = widget.name;
        if (enabledWidgetList.indexOf(widget.id) !== -1) {
            el.querySelector('.tcr-switch').setAttribute('checked', '');
        }
        el.addEventListener('change', changeWidgetSwitch);
        document.querySelector('.tcr-widget>.tcr-list').append(el);
    }

    // Load deferred widgets
    for (const widget of widgetList) {
        if (widget.context.indexOf('video') === -1 || // if the widget cannot run in video context
            widget.runtime === 'async' || // if the widget should be run after initialization
            enabledWidgetList.indexOf(widget.id) === -1 // if the widget is disabled
        ) {
            continue;
        }
        let jsNode = document.createElement('script');
        jsNode.setAttribute('src', `${widget.url}/widget.js`);
        jsNode.setAttribute('defer', '');
        document.querySelector('body').append(jsNode);
    }

    document.querySelector('.tcr-loading-mask').setAttribute('hidden', ''); // Remove loading spinner
})();


/**************
 * Main Logic *
 **************/

/**
 * Head, Icon and Header
 */
document.querySelector('title').textContent = fileRealName + ' - 清华大学云盘 Remake'
document.querySelector('header .tcr-logo').setAttribute('src', config.staticURL + '/img/logo.png')
document.querySelector('header .tcr-avatar').setAttribute('src', app.config.avatarURL);

document.querySelector('header .tcr-activity-button').addEventListener('click', () => {
    const el = document.querySelector('.tcr-activity');
    const toast = new bootstrap.Toast(el);
    toast.show();
}); // show activity menu

document.querySelector('header .tcr-collection-button').addEventListener('click', () => {
    const el = document.querySelector('.tcr-collection');
    const toast = new bootstrap.Toast(el);
    toast.show();
}); // show collection menu

document.querySelector('header .tcr-history-button').addEventListener('click', () => {
    const el = document.querySelector('.tcr-history');
    const toast = new bootstrap.Toast(el);
    toast.show();
}); // show history menu

document.querySelector('header .tcr-widget-button').addEventListener('click', () => {
    const el = document.querySelector('.tcr-widget');
    const toast = new bootstrap.Toast(el);
    toast.show();
}); // show widget menu

document.querySelector('header .tcr-publish-button').addEventListener('click', async () => {
    const spinner = document.createElement('span');
    spinner.classList.add('spinner-border');
    spinner.classList.add('spinner-border-sm');
    spinner.classList.add('ms-1');
    document.querySelector('header .tcr-publish-button').append(spinner);
    const info = await (await fetch(config.backendURL + '/library/', {
        method: 'POST',
        body: JSON.stringify({
            action: 'getFileInfo',
            fid: pageID,
            type: 'video'
        }, null, 0)
    })).json();
    if (info == false) { // if current video is not in remote library
        await fetch(config.backendURL + '/library/', {
            method: 'POST',
            body: JSON.stringify({
                action: 'shareFile',
                fid: pageID,
                pid: pathID,
                publisher: app.pageOptions.username,
                type: 'video',
                tag: [],
                brief: fileRealName,
                url: location.href,
                metadata: {
                    like_list: []
                }
            }, null, 0)
        })
    }
    location.reload();
});

/**
 * Title and Subtitle
 */
document.querySelector('.tcr-title').textContent = fileRealName;

/**
 * Player
 */
const player = new window.NPlayer.Player({
    bpControls: {},
    contextMenus: [],
    contextMenuToggle: false,
    controls: [
        ['play', 'time', 'danmaku-send', 'danmaku-settings', 'airplay', 'volume', 'settings', 'web-fullscreen', 'fullscreen'],
        ['progress']
    ],
    i18n: 'zh-CN',
    settings: ['loop', 'pip', 'speed'],
    src: shared.pageOptions.rawPath,
    themeColor: 'rgba(0, 0, 0, 0.3)',
    volumeVertical: true,
    plugins: [
        new NPlayerDanmaku({
            autoInsert: false
        })
    ]
});
if (app.pageOptions.username === '') { // if not signed in, disable danmaku sending
    player.updateControlItems(['play', 'time', 'spacer', 'danmaku-settings', 'airplay', 'volume', 'settings', 'web-fullscreen', 'fullscreen']);
}
player.mount('.tcr-player');

// Listen on DanmakuSend event
player.on('DanmakuSend', opts => {
    const requestBody = {
        vid: pageID,
        author: app.pageOptions.name,
        color: opts.color,
        text: opts.text,
        time: opts.time,
        type: opts.type,
        metadata: {
            email: app.pageOptions.contactEmail,
            send_time: (new Date()).getTime()
        }
    };
    fetch(config.backendURL + '/danmaku/', {
        method: 'POST',
        body: JSON.stringify(requestBody, null, 0)
    });
});

// Listen on Play event
let has_played = false;
player.on('Play', () => {
    if (!has_played) {
        has_played = true;
        fetch(config.backendURL + '/library/', {
            method: 'POST',
            body: JSON.stringify({
                action: 'visit',
                username: "", // not required
                fid: pageID,
                type: true
            }, null, 0)
        })
    }
});

/**
 * Toolbar
 */
// Like button
let has_liked = false;
document.querySelector('.tcr-toolbar>.tcr-like-button').addEventListener('click', async () => {
    document.querySelector('.tcr-toolbar>.tcr-like-button').setAttribute('disabled', '');
    if (userInfo === false) {
        return;
    }
    if (!has_liked) {
        has_liked = true;
        document.querySelector('.tcr-toolbar>.tcr-like-button').classList.replace('link-dark', 'link-info');
        videoInfo['like_count'] += 1;
        await fetch(config.backendURL + '/library/', {
            method: 'POST',
            body: JSON.stringify({
                action: 'like',
                username: userInfo['username'],
                fid: pageID,
                type: true
            }, null, 0)
        });
    } else {
        has_liked = false;
        document.querySelector('.tcr-toolbar>.tcr-like-button').classList.replace('link-info', 'link-dark');
        videoInfo['like_count'] -= 1;
        await fetch(config.backendURL + '/library/', {
            method: 'POST',
            body: JSON.stringify({
                action: 'like',
                username: userInfo['username'],
                fid: pageID,
                type: false
            }, null, 0)
        });
    }
    document.querySelector('.tcr-toolbar>.tcr-like-button>.tcr-like-count').textContent = videoInfo['like_count'];
    document.querySelector('.tcr-toolbar>.tcr-like-button').removeAttribute('disabled');
});

// Collect button
let has_collected = false;
document.querySelector('.tcr-toolbar>.tcr-collect-button').addEventListener('click', async () => {
    document.querySelector('.tcr-toolbar>.tcr-collect-button').setAttribute('disabled', '');
    if (userInfo === false) {
        return;
    }
    if (!has_collected) {
        has_collected = true;
        document.querySelector('.tcr-toolbar>.tcr-collect-button').classList.replace('link-dark', 'link-info');
        videoInfo['collect_count'] += 1;
        await fetch(config.backendURL + '/library/', {
            method: 'POST',
            body: JSON.stringify({
                action: 'collect',
                username: userInfo['username'],
                fid: pageID,
                type: true
            }, null, 0)
        });
    } else {
        has_collected = false;
        document.querySelector('.tcr-toolbar>.tcr-collect-button').classList.replace('link-info', 'link-dark');
        videoInfo['collect_count'] -= 1;
        await fetch(config.backendURL + '/library/', {
            method: 'POST',
            body: JSON.stringify({
                action: 'collect',
                username: userInfo['username'],
                fid: pageID,
                type: false
            }, null, 0)
        });
    }
    document.querySelector('.tcr-toolbar>.tcr-collect-button>.tcr-collect-count').textContent = videoInfo['collect_count'];
    document.querySelector('.tcr-toolbar>.tcr-collect-button').removeAttribute('disabled');
});

document.querySelector('.tcr-toolbar>.tcr-download-button').setAttribute('href', shared.pageOptions.rawPath);
document.querySelector('.tcr-toolbar>.tcr-download-button').setAttribute('download', shared.pageOptions.fileName);
document.querySelector('.tcr-toolbar>.tcr-download-button').addEventListener('click', () => {
    fetch(config.backendURL + '/library/', {
        method: 'POST',
        body: JSON.stringify({
            action: 'download',
            username: "", // not required
            fid: pageID,
            type: true
        }, null, 0)
    })
});

/**
 * Publisher Information
 */
document.querySelector('.tcr-publisher-info .tcr-subscribe-button').addEventListener('click', async () => {
    document.querySelector('.tcr-publisher-info .tcr-subscribe-button').setAttribute('disabled', '');

    userInfo['following'].push(publisherInfo['username']);
    userInfo['following'] = Array.from(new Set(userInfo['following'])); // remove duplicated items

    const spinner = document.createElement('span');
    spinner.classList.add('spinner-border');
    spinner.classList.add('spinner-border-sm');
    spinner.classList.add('ms-1');
    document.querySelector('.tcr-publisher-info .tcr-subscribe-button').append(spinner);

    await fetch(config.backendURL + '/user/', {
        method: 'POST',
        body: JSON.stringify({
            action: 'followUser',
            username: app.pageOptions.username,
            follow: publisherInfo['username'],
            type: 'follow'
        }, null, 0)
    }); // update user information, not need to wait

    publisherInfo['followed_count'] += 1;
    for (const x of document.querySelectorAll('.tcr-publisher-info .tcr-subscribe-count')) {
        x.textContent = publisherInfo['followed_count'];
    }

    spinner.remove();
    document.querySelector('.tcr-publisher-info .tcr-subscribe-button').setAttribute('hidden', '');
    document.querySelector('.tcr-publisher-info .tcr-subscribe-button-subscribed').removeAttribute('hidden');
    document.querySelector('.tcr-publisher-info .tcr-subscribe-button').removeAttribute('disabled');
});

document.querySelector('.tcr-publisher-info .tcr-subscribe-button-subscribed').addEventListener('click', async () => {
    document.querySelector('.tcr-publisher-info .tcr-subscribe-button-subscribed').setAttribute('disabled', '');

    if (userInfo['following'].indexOf(publisherInfo['username']) !== -1) {
        userInfo['following'].splice(userInfo['following'].indexOf(publisherInfo['username']), 1);
    }

    const spinner = document.createElement('span');
    spinner.classList.add('spinner-border');
    spinner.classList.add('spinner-border-sm');
    spinner.classList.add('ms-1');
    document.querySelector('.tcr-publisher-info .tcr-subscribe-button-subscribed').append(spinner);

    await fetch(config.backendURL + '/user/', {
        method: 'POST',
        body: JSON.stringify({
            action: 'followUser',
            username: app.pageOptions.username,
            follow: publisherInfo['username'],
            type: 'unfollow'
        }, null, 0)
    }); // update user information, not need to wait

    publisherInfo['followed_count'] -= 1;
    for (const x of document.querySelectorAll('.tcr-publisher-info .tcr-subscribe-count')) {
        x.textContent = publisherInfo['followed_count'];
    }

    spinner.remove();
    document.querySelector('.tcr-publisher-info .tcr-subscribe-button').removeAttribute('hidden');
    document.querySelector('.tcr-publisher-info .tcr-subscribe-button-subscribed').setAttribute('hidden', '');
    document.querySelector('.tcr-publisher-info .tcr-subscribe-button-subscribed').removeAttribute('disabled');
});

/**
 * Danmaku List
 */
fetch(config.backendURL + '/danmaku/?vid=' + pageID)
    .then(res => res.json())
    .then(res => {
        player.danmaku.resetItems(res);
        document.querySelector('.tcr-subtitle>.tcr-danmaku-count').textContent = res.length;
        document.querySelector('.tcr-danmaku-list .tcr-list>.tcr-unit').setAttribute('hidden', '');
        res.sort((a, b) => (a.time - b.time));
        for (const danmaku of res) {
            const el = document.querySelector('.tcr-danmaku-list .tcr-list>.tcr-unit').cloneNode(true);
            el.querySelector('.tcr-time').textContent = `${Math.floor(danmaku.time / 60).toString().padStart(2, '0')}:${Math.floor(danmaku.time % 60).toString().padStart(2, '0')}`;
            el.querySelector('.tcr-text').textContent = danmaku.text;
            el.querySelector('.tcr-author').textContent = danmaku.author;
            el.removeAttribute('hidden');
            document.querySelector('.tcr-danmaku-list .tcr-list').append(el);
        }
    }); // Load danmakus

/**
 * Series List
 */
fetch(config.backendURL + '/library/', {
    method: 'POST',
    body: JSON.stringify({
        action: 'getFileInfo',
        pid: pathID,
        type: 'video'
    }, null, 0)
})
    .then(res => res.json())
    .then(res => {
        document.querySelector('.tcr-series-list>.tcr-list>.tcr-unit').setAttribute('hidden', '');
        if (res == false) {
            return;
        }
        res.sort((a, b) => a['brief'].localeCompare(b['brief']));
        const template = document.querySelector('.tcr-series-list>.tcr-list>.tcr-unit');
        for (let i = 0; i < res.length; i++) {
            const el = template.cloneNode(true);
            el.querySelector('.tcr-no').textContent = `P${i + 1}`;
            el.querySelector('.tcr-text').textContent = res[i]['brief'];
            if (res[i]['fid'] === pageID) {
                el.classList.replace('text-dark', 'text-primary');
                el.querySelector('.tcr-status').removeAttribute('hidden');
            }
            el.setAttribute('href', res[i]['url']);
            if (i !== 0) {
                el.classList.add('border-top');
            }
            el.removeAttribute('hidden');
            document.querySelector('.tcr-series-list>.tcr-list').append(el);
        }
    });

/*
 * Comments
 */
const comments = new Valine({
    el: '.tcr-comments',
    appId: 'ocjPj9BOoMaS2kI9S29TiQC3-MdYXbMMI',
    appKey: 'QffyyBLYGUOWqHXFzyyv4WCo',
    placeholder: '发一条友善的评论',
    path: pageID,
    avatar: 'retro',
    meta: ['nick', 'mail'],
    lang: 'zh-CN',
    recordIP: true,
    serverURLs: 'https://ocjpj9bo.api.lncldglobal.com'
});

/**
 * History
 */
(async () => {
    document.querySelector('.tcr-player video').addEventListener('pause', (event) => {
        const video = document.querySelector('.tcr-player video');
        const canvas = document.createElement('canvas');
        canvas.height = video.videoHeight / 16; // Resize to 1/16 to reduce the size of images
        canvas.width = video.videoWidth / 16;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg');
        localStorage.setItem('thumbnail:' + pageID, dataURL); // Store the image via StorageAPI
    }); // Capture and store screenshots for history bar when paused

    const historyListEl = document.querySelector('.tcr-history>.tcr-list');
    let metadata = JSON.parse(localStorage.getItem('history_metadata'));
    if (metadata === null) {
        metadata = [];
    }
    const history_item_template = document.querySelector('.tcr-history>.tcr-list>.tcr-unit');
    let metadata_clone = metadata.slice();
    for (const x of metadata_clone) {
        if (x.id === pageID) {
            metadata.splice(metadata.indexOf(x), 1); // Remove metadata of current page
            continue;
        }
        const node = history_item_template.cloneNode(true);
        if (localStorage.getItem('thumbnail:' + x.id) !== null) {
            node.querySelector('img').setAttribute('src', localStorage.getItem('thumbnail:' + x.id));
        }
        node.querySelector('a').setAttribute('href', x.url);
        const title = (x.title.length <= 22) ? x.title : (x.title.substring(0, 20) + '……');
        node.querySelector('.tcr-name').textContent = title;
        const date_str = (new Date(x.timestamp)).toLocaleString('zh-CN', {
            dateStyle: "long",
            timeStyle: "short",
            hour12: false
        });
        node.querySelector('.tcr-date').textContent = ' ' + date_str;
        node.querySelector('.tcr-publisher').textContent = ' ' + x.sharer;
        node.removeAttribute('hidden');
        historyListEl.append(node);
    }
    let sharer = shared.pageOptions.sharedBy;
    if (videoInfo !== false) {
        sharer = videoInfo['publisher'];
    }
    let current_meta = {
        id: pageID,
        url: location.href,
        title: shared.pageOptions.fileName.slice(0, -(shared.pageOptions.fileExt.length + 1)),
        timestamp: Date.now(),
        sharer: sharer
    };
    metadata.unshift(current_meta);
    metadata.sort((a, b) => (b.timestamp - a.timestamp));
    localStorage.setItem('history_metadata', JSON.stringify(metadata));
})();