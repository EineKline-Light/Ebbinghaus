# Ebbinghaus · 艾宾浩斯

Android 离线复习管理应用，结合间隔复习、记忆曲线、日历排期与番茄专注。

## 下载

当前版本 **1.1.6**，安装包位于 [Release/Ebbinghaus-v1.1.6.apk](Release/Ebbinghaus-v1.1.6.apk)。最低 Android 7.0（API 24），当前使用调试签名。

## 功能

- 学习内容录入、五轮复习排期和打卡保存。
- 记忆衰减与复习恢复曲线，固定日期的纵向过渡动效。
- 粒子背景、弹性日历和底部导航动效。
- 相框图片导入与滑动、主题和字体定制。
- 番茄专注计时、JSON 数据备份与恢复。

记忆保持率为示意模型估算，并非个人实测数据。后台计时可在返回应用时恢复，未实现系统级到点通知。

## 开发

使用 JDK 17 或 21、Gradle 8.14.3 和 Android SDK 35。在本地 `local.properties` 配置 `sdk.dir` 后运行：

```sh
gradle assembleDebug lintDebug
```

离线样式已包含在 `app/src/main/assets/app.css`。修改样式后重新生成：

```sh
npm exec --yes --package=tailwindcss@3.4.17 -- tailwindcss -i tools/styles.css -o app/src/main/assets/app.css --minify
```

主要回归检查：

```sh
node tools/test-curve.cjs
node tools/test-transition-integration.cjs
node tools/test-scheme-a.cjs
node tools/test-wave.cjs
node tools/test-photo.cjs
```

应用页面与行为位于 `app/src/main/assets/`，Android 宿主位于 `app/src/main/java/`。`previews/` 包含曲线动效比较稿，`exports/` 包含 6 秒演示视频和 GIF。`tools/` 包含开发、导出及回归脚本，历史修改脚本不需要在构建前运行。

构建、静态检查和签名验证已通过；不同品牌设备仍需进一步真机测试。仓库不包含原版备份 APK、本机 SDK 路径、构建缓存或密钥。
