# fb-live-trigger 自动留言系统

## ✅ 项目说明
本项目用于 Facebook 直播中自动监听留言“关”或“Close”，触发倒数留言流程（通过 Make.com Webhook 调用）。

## 📁 文件结构
- `/api/trigger.js`：监听直播留言逻辑
- `vercel.json`：配置 API 路由
- `test.html`：手动测试触发器
- `cron设置说明.txt`：指导设置每 1 分钟自动访问

## 🚀 部署步骤
1. 上传本项目至 GitHub 仓库
2. 登录 Vercel → 创建新项目 → 连接该仓库 → 自动部署
3. 设置 EasyCron，每分钟访问：https://你的项目名.vercel.app/api/trigger

## ✅ 成功触发时会调用 Make Webhook：
https://hook.us2.make.com/jed2lptdmv1wjgvn3wdk6tuwxljguf45
