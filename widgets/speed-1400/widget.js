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
 *    +1400%倍速
 *    TsinghuaCloudRemake Official Widget
 *    提高视频1400%倍速，提高1400%效率
 *    id: speed-1400
 *    context: [video]
 */

(async () => { // a widget should not pollute global environment
    player.getSettingItem('speed').options.push({value: 14, html: '+1400%'}) 
})();