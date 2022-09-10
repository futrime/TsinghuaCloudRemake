# 清华大学云盘 Remake

**清华大学云盘 Remake** 是一个强大的清华大学云盘视频播放增强脚本，可以让你的网课学习变得更加有趣。

## 功能简介

本脚本包括但不限于以下功能：

* 视频播放界面的仿B站风格美化
* 突破分享限制的视频下载
* 强大的视频弹幕系统
* 弹幕列表
* 视频评论系统
* 视频播放速度调整
* 视频网页全屏
* 视频点赞
* 视频收藏和收藏夹
* 播放、下载、点赞、收藏数据统计
* 视频动态和用户关注
* 向发布者发邮件
* 视频选集
* 观看历史记录
* 一键跳转网络学堂和清华云盘资料库
* 基于SHAO Pastebin的笔记分享系统
* 还有一套方便的外接插件系统，发烧友们可以自由开发插件辣！

各种插件的详细介绍，请前往`/widgets/`下各插件主路径内查看**README.md**.


## 安装

需要浏览器装有 [Tampermonkey](https://tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/) 插件, 下方表格中挑一个链接安装。

**注意事项**

* 由于后端服务器位于美国圣何塞，加载可能较慢。
* 新版本一旦发布，旧版本将不再受到任何支持。由于后端更新，旧版本可能将不可用。
* 开发版后端数据将不会持续保存。
* 可能会提示"脚本试图访问跨域资源", 请选择"始终允许"。
* 可能无法很好地适应窄屏幕, 请尽量以 1280 x 720 以上的逻辑分辨率使用此脚本。

| 安装源 | 安装链接 |
| --- | --- |
| Gitee | [安装](https://gitee.com/futrime/tsinghua-cloud-remake/raw/master/TsinghuaCloudRemake.user.js) |

### 后端安装

请参考[代码贡献指南](CONTRIBUTING.md)中相关内容。

## 设置

脚本启用后，打开任意清华大学云盘的分享链接（而不是在网页版清华云盘直接打开自己的文件）即可体验。

如果想暂时禁用脚本，在脚本管理器关闭即可。

## 推荐配置

* 操作系统：Windows 10+
* 分辨率：1080p+
* 浏览器：Edge 15+ / Firefox 54+ / Chrome 51+ / Safari 10+ / Opera 38+
* 处理器：Intel Core i3-8100 / AMD Ryzen 3 2200G 或更高
* 内存：8GB
* 脚本管理器：Tampermonkey 4.13+
* 显卡：Intel UHD630 / NVIDIA GeForce GT1030 / AMD Radeon Vega 8 或更高
* 网络：30Mbps

## 历史版本

请参考[更新日志](CHANGELOG.md)查看历史版本信息。同时，历史版本的源代码文件均可以从发行版菜单选择下载。

请注意，本项目的公共后端仅提供最新的正式版和开发版，历史版本可能与公共后端不兼容。

## 隐私和安全声明

* 本脚本不会对在线认证系统([id.tsinghua.edu.cn](https://id.tsinghua.edu.cn))生效，不存在窃取用户密码的可能。
* 本脚本在使用时会上传包括头像、邮箱在内的部分个人信息用于提供服务。
* 本脚本不会上传任何与清华大学云盘无关的信息，也不会上传任何Cookie和清华大学云盘本身在设备上保存的信息。
* 任何脚本对用户数据都具有完全的访问能力，故本仓库的任何Fork以及任何并非从本仓库安装的版本，均有可能非法获取用户信息。请注意甄别本仓库地址：https://gitee.com/Futrime/tsinghua-cloud-remake .

## 第三方插件

这些插件为本脚本的开发提供了相当多的便利，在此表示感谢。

* [normalize.css](https://github.com/necolas/normalize.css/)
* [Bootstrap](https://github.com/twbs/bootstrap)
* [Bootstrap Icons](https://github.com/twbs/icons)
* [Javascript MD5](https://github.com/blueimp/JavaScript-MD5)
* [NPlayer](https://github.com/woopen/nplayer)
* [Valine](https://github.com/xCss/Valine)

## 参与开发

欢迎参考[代码贡献指南](CONTRIBUTING.md)来为本项目添砖加瓦。