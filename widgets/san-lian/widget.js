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
 *    一键三连
 *    TsinghuaCloudRemake Official Widget
 *    一键三连！
 *    id: san-lian
 *    context: [video]
 */

(async () => { // a widget should not pollute global environment
    g_sharedVariable.sanLian = {};

    // Add animate.css
    let cssNode = document.createElement('link');
    cssNode.setAttribute('rel', 'stylesheet');
    cssNode.setAttribute('href', 'https://cdn.jsdelivr.net/npm/animate.css@4/animate.min.css');
    document.querySelector('head').append(cssNode);

    document.querySelector('.tcr-toolbar>.tcr-like-button').addEventListener('mousedown', () => {
        g_sharedVariable.sanLian.mouseDownTime = (new Date()).getTime();
        g_sharedVariable.sanLian.isMouseDown = true;
        g_sharedVariable.sanLian.timeout1 = setTimeout(() => {
            if (g_sharedVariable.sanLian.isMouseDown) {
                document.querySelector('.tcr-toolbar').classList.add('animate__animated', 'animate__shakeX');
                setTimeout(() => {
                    document.querySelector('.tcr-toolbar').classList.remove('animate__animated', 'animate__shakeX');
                }, 1000);
            }
        }, 200);
        g_sharedVariable.sanLian.timeout2 = setTimeout(() => {
            if (g_sharedVariable.sanLian.isMouseDown) {
                document.querySelector('.tcr-toolbar>.tcr-like-button').classList.replace('link-dark', 'link-info');
                document.querySelector('.tcr-toolbar>.tcr-collect-button').classList.replace('link-dark', 'link-info');
                document.querySelector('.tcr-toolbar>.tcr-download-button').classList.replace('link-dark', 'link-info');
                g_sharedVariable.sanLian.isActivated = true;
            }
        }, 1200);
    });

    document.querySelector('.tcr-toolbar>.tcr-like-button').addEventListener('mouseup', () => {
        g_sharedVariable.sanLian.isMouseDown = false;
        clearTimeout(g_sharedVariable.sanLian.timeout1);
        clearTimeout(g_sharedVariable.sanLian.timeout2);

        if (g_sharedVariable.sanLian.isActivated) {
            g_sharedVariable.sanLian.isActivated = false;
            document.querySelector('.tcr-toolbar>.tcr-download-button').classList.replace('link-info', 'link-dark');
            if (!has_collected) {
                document.querySelector('.tcr-toolbar>.tcr-collect-button').click();
            }
            if (has_liked) {
                document.querySelector('.tcr-toolbar>.tcr-like-button').click();
            }
            document.querySelector('.tcr-toolbar>.tcr-download-button').click();
        }
    });
})();