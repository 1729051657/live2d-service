# Live2D Model Service Template

给 [`live2d-web-widget`](https://github.com/1729051657/nodejs-plugin) 用的模型托管服务：把模型放进 `public/models/` 并部署后，前端只需配置一个 `serviceUrl`。

写法参考 [ourongxing/chatgpt-vercel](https://github.com/ourongxing/chatgpt-vercel) 的 README：**先讲一键部署，再讲 Fork 与本地维护**。

## 部署到 Vercel

如果你只需要先跑起来、不一定要在本地改代码，**完全可以不在本机安装依赖**，直接点下面按钮，按提示用 GitHub 登录并部署即可（默认**无需配置环境变量**；模型可以之后再往仓库里加，保存后重新部署）。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/1729051657/live2d-service)

**说明**：按钮里的 `repository-url` 指向本仓库 [`1729051657/live2d-service`](https://github.com/1729051657/live2d-service)。若你要部署 **自己的 fork**，请 [Fork](https://github.com/1729051657/live2d-service/fork) 后，到 [Vercel 新建项目](https://vercel.com/new) 里 **Import Git Repository** 选择**你的**仓库（这样 `repository-url` 自然就是「你自己的项目地址」）。这和 [chatgpt-vercel](https://github.com/ourongxing/chatgpt-vercel) README 里「先 fork，再在 Vercel 导入自己的仓库」是同一套路。

不过**只点上面按钮、不 fork** 时，不容易跟着本仓库更新；更推荐：**fork → 在 Vercel 导入你的 fork → 上游有更新时在 GitHub 点 `Sync fork` 再部署**。若你要改代码或大批量换模型，把仓库 `git clone` 到本地，改完 `git push` 即可触发重新部署；也可用 [Vercel CLI](https://vercel.com/cli)：`vercel deploy --prod`。

---

## 功能说明

- 模型放在 `public/models/`，每个模型一个目录，根上有 `index.json`。
- **模型列表由服务端扫描目录生成**，`GET /api/model-list` 不依赖手写路径列表。
- 可选 `config/model-list.json`：只填 `serviceName`、与扫描顺序对齐的 `messages`。
- 部署后前端通过 `serviceUrl` 访问：`/api/model-list`、`/models/...`。
- 与看板娘工具栏配套：`/api/next`、`/api/random`、`/api/hitokoto`（一言代理）、`/api/health`。

Node 端可复用同一套 HTTP：`import { createLive2dServiceClient } from "live2d-web-widget/service-client"`。

## 本地运行（Node.js）

`api/*.js` 是为 **Vercel Serverless** 写的处理函数；在本地要用 **Express** 包一层才能监听端口。

```bash
cd live2d-service
npm install
npm run dev
```

默认监听 **`http://127.0.0.1:3000`**（可用环境变量 **`PORT`** 修改）。浏览器或前端里把 `serviceUrl` 设为该地址即可。

- `GET http://127.0.0.1:3000/api/model-list`
- 静态资源：`http://127.0.0.1:3000/models/...`（对应 `public/models/`）

线上 **Vercel** 仍按原样部署，不经过 `server.cjs`。

## 目录结构

```text
live2d-service/
├─ server.cjs          # 本地 Node 入口（Express）
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
│  └─ models/
└─ vercel.json
```

## 1. 放入模型资源

把你下载好的模型完整目录复制到 `public/models/` 下，保持 `index.json` 的相对引用结构不变。

例如：

```text
public/
└─ models/
   └─ characters/
      └─ shizuku/
         ├─ index.json
         ├─ model.moc
         ├─ textures/
         └─ motions/
```

## 2.（可选）元数据 `config/model-list.json`

**不再手写 `models`。** 部署后服务端会扫描 `public/models/`，找出所有包含 `index.json` 的目录，按路径字典序排序后作为 `models` 数组返回给前端。

可选配置文件只用于：

- `serviceName`：服务展示名
- `messages`：与 **扫描结果顺序一致** 的每条气泡文案（条数不足会补空字符串，多余会截断）

```json
{
  "serviceName": "My Live2D Model Service",
  "messages": [
    "第一个模型的欢迎语",
    "第二个模型的欢迎语"
  ]
}
```

若文件不存在或字段省略，会使用默认 `serviceName`，`messages` 为空串。

## 3. 前端插件接入

部署完成后，把下面示例里的 `serviceUrl` 换成你在 Vercel 上的实际域名（部署成功后控制台里可见）：

```ts
import { createLive2DWidget } from "live2d-web-widget";

createLive2DWidget({
  serviceUrl: "https://live2d-service.vercel.app",
  infoLink: "https://github.com/1729051657/live2d-service"
});
```

组件默认会访问：

- `${serviceUrl}/api/model-list`
- `${serviceUrl}/models/...`
- Next / Shuffle / Talk 分别请求 `api/next`、`api/random`、`api/hitokoto`（可通过 `useServiceNavigation: false` 关闭）

## API 返回格式

`GET /api/model-list`

`models` 为运行时扫描 `public/models/` 得到的路径列表（相对 `/models/`，已排序）。`messages` 与 `config/model-list.json` 对齐到同一顺序。

```json
{
  "serviceName": "My Live2D Model Service",
  "models": [
    "chiaki_kitty",
    "uiharu"
  ],
  "messages": [
    "欢迎来到这里。",
    "又见面啦。"
  ],
  "modelBaseUrl": "https://live2d-service.vercel.app/models/"
}
```

（`models` 以 `GET /api/model-list` 为准；示例里用的是本仓库里真实存在的路径。实际响应里的 `modelBaseUrl` 由请求域名生成。）

可访问示例：`https://live2d-service.vercel.app/models/uiharu/index.json`。旧文档里的占位路径 `/models/characters/example-model/` 会 **重写** 到内置示例 `uiharu`（与线上 `vercel.json` 中 `rewrites` 一致；本地 `npm run dev` 同样支持）。

`GET /api/next?prev=0` / `GET /api/random?current=0`

```json
{
  "nextIndex": 1,
  "message": "换个角色看看。"
}
```

`GET /api/hitokoto`：与 [一言](https://hitokoto.cn/) JSON 格式一致（代理失败时返回 `502` 与 `{ "error": "hitokoto_proxy_failed" }`）。

## 注意事项

- 模型路径以 **`GET /api/model-list`** 返回的 `models` 为准，不要猜 `characters/example-model` 这类旧占位；该路径已 **301/内部重写** 到 `uiharu` 以免外链 404。
- 扫描结果有 **约 60 秒内存缓存**；新增/删除模型后，短时间内列表可能略滞后，之后会更新。
- Vercel 默认可以直接托管静态文件，但这里额外加了 `vercel.json`，确保跨域访问模型资源时有 CORS 头。
- 公开发布前，请确认模型资源拥有可分发权限。
- 体积较大的模型建议做精简，避免仓库和部署包过大。
