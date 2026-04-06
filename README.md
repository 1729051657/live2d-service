# Live2D Model Service

给浏览器端包 [**live2d-web-widget**](https://github.com/1729051657/live2d-web) 使用的 **模型托管 + HTTP API**：把模型放进 `public/models/` 并部署到 Vercel（或本地 Node）后，前端只需配置一个 **`serviceUrl`**。

| 项目 | 地址 |
|------|------|
| **本仓库（模型与 API）** | [github.com/1729051657/live2d-service](https://github.com/1729051657/live2d-service) |
| **前端 npm 包（看板娘组件）** | [github.com/1729051657/live2d-web](https://github.com/1729051657/live2d-web) |
| **npm** | [`live2d-web-widget`](https://www.npmjs.com/package/live2d-web-widget)（若已发布） |

部署完成后，在页面里：

```ts
import { createLive2DWidget } from "live2d-web-widget";

createLive2DWidget({
  serviceUrl: "https://<你的部署域名>",
  infoLink: "https://github.com/1729051657/live2d-service"
});
```

更完整的参数与实例 API 见 [live2d-web README](https://github.com/1729051657/live2d-web#readme)。

---

## 一键部署到 Vercel

若只需先跑通、不必在本机装依赖，可直接用下面按钮，按提示用 GitHub 登录并部署（默认**无需环境变量**；模型可后续加入仓库再重新部署）。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/1729051657/live2d-service)

- 按钮中的 `repository-url` 指向本仓库。若要长期跟随更新，建议 **[Fork](https://github.com/1729051657/live2d-service/fork)** 后在 [Vercel 新建项目](https://vercel.com/new) 导入 **你的 fork**，与 [chatgpt-vercel](https://github.com/ourongxing/chatgpt-vercel) 类项目「先 fork 再导入」的方式一致。
- 本地改代码或批量换模型：`git clone` → 修改 → `git push` 触发部署；或使用 [Vercel CLI](https://vercel.com/cli)：`vercel deploy --prod`。

---

## 功能说明

- 模型位于 **`public/models/<模型目录>/`**，根目录需有 **`index.json`**（及 `.moc`、贴图等相对引用）。
- **`GET /api/model-list`**：由服务端**扫描**目录生成模型列表，无需手写全部路径。
- 可选 **`config/model-list.json`**：填写 `serviceName`、与扫描顺序一致的 `messages`（气泡文案）。
- 静态资源通过 **`/models/...`** 提供；`vercel.json` 中已配置 **CORS**，便于浏览器跨域加载。
- 工具栏配套 API：`/api/next`、`/api/random`、`/api/hitokoto`（一言代理）、`/api/health`。

Node 脚本或后端也可直接调同一套 HTTP，例如：

`import { createLive2dServiceClient } from "live2d-web-widget/service-client"`（见 [live2d-web 文档](https://github.com/1729051657/live2d-web#node-%E7%AB%AF%E8%B0%83%E7%94%A8%E5%90%8C%E4%B8%80%E5%A5%97-api)）。

---

## 本地运行（Node.js）

`api/*.js` 面向 **Vercel Serverless**；本地通过 **`server.cjs`**（Express）监听端口。

```bash
cd live2d-service
npm install
npm run dev
```

默认 **`http://127.0.0.1:3000`**（可用环境变量 **`PORT`** 修改）。前端将 `serviceUrl` 设为该地址即可联调。

- `GET http://127.0.0.1:3000/api/model-list`
- 静态模型：`http://127.0.0.1:3000/models/...` → `public/models/`

线上 Vercel 部署不经过 `server.cjs`，由平台路由到 `api/*.js` 与静态文件。

---

## 目录结构

```text
live2d-service/
├─ server.cjs          # 本地 Express 入口
├─ api/
│  ├─ health.js
│  ├─ hitokoto.js
│  ├─ model-list.js
│  ├─ next.js
│  └─ random.js
├─ lib/
│  ├─ manifest.cjs
│  └─ scanModels.cjs
├─ config/
│  └─ model-list.json
├─ public/
│  └─ models/          # 每个子目录一个模型，含 index.json
└─ vercel.json
```

---

## 1. 放入模型

将完整模型目录复制到 `public/models/` 下，保持 **`index.json`** 内相对路径有效（例如 `moc/xxx.moc`、`textures/`）。

```text
public/
└─ models/
   └─ my-character/
      ├─ index.json
      ├─ ...
```

部分偏高、易裁切的模型可在 **`index.json`** 中增加或调整 **`layout`**（如 `width`、`height`、`center_y`），与前端画布比例配合；细节以 Live2D/Cubism 2 模型说明为准。

---

## 2.（可选）`config/model-list.json`

**不必手写 `models` 列表**（由扫描生成）。本文件可选字段：

- **`serviceName`**：服务展示名
- **`messages`**：字符串数组，顺序与 **`/api/model-list` 返回的 `models` 扫描顺序**一致；条数不足会补空串，多余会截断

```json
{
  "serviceName": "My Live2D Model Service",
  "messages": [
    "第一个模型的欢迎语",
    "第二个模型的欢迎语"
  ]
}
```

若文件不存在，使用默认 `serviceName`，`messages` 可为空。

---

## 3. 前端接入示例

将 `serviceUrl` 换成你的 Vercel 域名（部署后在控制台可见），例如：

```ts
import { createLive2DWidget } from "live2d-web-widget";

createLive2DWidget({
  serviceUrl: "https://live2d-service.vercel.app",
  infoLink: "https://github.com/1729051657/live2d-service"
});
```

组件会请求：

- `${serviceUrl}/api/model-list`
- `${serviceUrl}/models/...`

Next / Shuffle / Talk → `api/next`、`api/random`、`api/hitokoto`；不需要时可设 `useServiceNavigation: false`。

---

## API 返回格式

### `GET /api/model-list`

`models` 为扫描 `public/models/` 得到的目录名列表（已排序）。`modelBaseUrl` 由当前请求域名生成。

```json
{
  "serviceName": "My Live2D Model Service",
  "models": ["chiaki_kitty", "uiharu"],
  "messages": ["欢迎来到这里。", "又见面啦。"],
  "modelBaseUrl": "https://live2d-service.vercel.app/models/"
}
```

示例资源（若线上仍部署该路径）：[`.../models/uiharu/index.json`](https://live2d-service.vercel.app/models/uiharu/index.json)。

### `GET /api/next?prev=0` / `GET /api/random?current=0`

```json
{
  "nextIndex": 1,
  "message": "换个角色看看。"
}
```

### `GET /api/hitokoto`

与 [一言](https://hitokoto.cn/) JSON 类似；代理失败时可能返回 `502` 与 `{ "error": "hitokoto_proxy_failed" }`。

---

## 注意事项

- 模型路径以 **`GET /api/model-list`** 为准；旧占位路径可能由 `vercel.json` **重写** 到示例模型，避免外链 404。
- 列表有约 **60 秒**内存缓存；增删模型后短时间内列表可能略滞后。
- 公开发布前请确认模型**授权与分发**合规；大模型建议精简以控制仓库与部署体积。

---

## 相关链接

- 前端包与 API 文档：[1729051657/live2d-web](https://github.com/1729051657/live2d-web)
- 本文档部署目标：本仓库 [1729051657/live2d-service](https://github.com/1729051657/live2d-service)
