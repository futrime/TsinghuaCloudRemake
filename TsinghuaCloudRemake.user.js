/**
 *    Copyright (c) 2022 Futrime
 *    清华大学云盘 Remake is licensed under Mulan PSL v2.
 *    You can use this software according to the terms and conditions of the Mulan PSL v2. 
 *    You may obtain a copy of Mulan PSL v2 at:
 *                http://license.coscl.org.cn/MulanPSL2 
 *    THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.  
 *    See the Mulan PSL v2 for more details.  
 */

// ==UserScript==
// @name         清华大学云盘 Remake
// @description  清华大学云盘视频播放增强脚本
// @version      1.0.0
// @author       Futrime
// @copyright    2021, Futrime (https://github.com/Futrime)
// @license      MulanPSL-2.0
// @match        *://cloud.tsinghua.edu.cn/f/*
// @match        *://cloud.tsinghua.edu.cn/d/*/files/?p=*
// @run-at       document-end

// @icon         https://tsinghuacloudremake.api.021121.xyz/static/img/favicon.ico
// ==/UserScript==

/*
 * Configurations
 */
const config = {
    staticURL: 'https://tsinghuacloudremake.api.021121.xyz/static',
    backendURL: 'https://tsinghuacloudremake.api.021121.xyz',
    widgetIndex: [
        {
            "type": "index",
            "url": "https://tsinghuacloudremake.api.021121.xyz/widgets/widgets.json"
        }
    ]
};

(async () => {
    'use strict';

    if (shared.pageOptions.fileType !== 'Video') {
        return; // only support video pages currently
    }

    console.info('[TCR] TsinghuaCloudRemake is loaded.');

    const pages = {
        video: await fetch(config.staticURL + '/video.html').then((res) => res.text())
    };

    document.querySelector('body').remove();
    document.write(pages.video);

    const configNode = document.createElement('meta');
    configNode.setAttribute('data-tcr-static-url', config.staticURL);
    configNode.setAttribute('data-tcr-backend-url', config.backendURL);
    configNode.setAttribute('data-tcr-widget-index', JSON.stringify(config.widgetIndex, null, 0));
    document.querySelector('head').append(configNode);
})();