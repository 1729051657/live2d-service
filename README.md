# Live2D Model Service Template

这是给 `live2d-web-widget` 配套的模型托管服务模板，目标是：

- 你把自己的 Live2D 模型资源放进 `public/models/`（每个模型一个目录，根上有 `index.json`）
- **模型列表由后端扫描目录自动生成**，`GET /api/model-list` 返回的 `models` 不依赖手写路径列表
- 可选编辑 `config/model-list.json` 只填展示名、气泡文案等元数据
- 直接部署到 Vercel
- 前端 npm 插件只配置一个 `serviceUrl`

部署完成后，插件会自动读取：

- `GET /api/model-list`
- 模型资源目录 `/models/...`

与浏览器端工具栏配套的 **动态接口**（与 `live2d-web-widget` 默认 `serviceUrl` 行为一致）：

- `GET /api/next?prev=<index>`：顺序下一款，返回 `nextIndex` 与 `message`
- `GET /api/random?current=<index>`：随机另一款（尽量避免与当前相同）
- `GET /api/hitokoto`：服务端代理一言（转发 `v1.hitokoto.cn`，便于统一 CORS）
- `GET /api/health`：健康检查

Node 端可复用同一 HTTP 契约，使用前端 npm 包的子路径：`import { createLive2dServiceClient } from "live2d-web-widget/service-client"`（仓库见 **nodejs-plugin**）。

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

## 3. 部署到 Vercel

推荐做法：

1. 把这个目录单独发布成一个 GitHub 公共仓库
2. 在仓库里上传 `public/models/` 下的模型目录（可选再改 `config/model-list.json` 里的文案）
3. 在 Vercel 导入该仓库并直接部署

若要把本仓库当作**公开模板**给别人一键部署，README 里可直接使用下面按钮（`repository-url` 已指向本仓库的公开地址；fork 后请把路径里的 `1729051657` 换成你的 GitHub 用户名，或整段换成你 fork 后的仓库 URL）：

```md
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F1729051657%2Flive2d-service)
```

说明：`repository-url` 必须是 **HTTPS、可匿名 clone 的公开仓库地址**，形如 `https://github.com/<owner>/<repo>`。本模板对应：

`https://github.com/1729051657/live2d-service`

## 4. 前端插件接入

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
    "characters/shizuku"
  ],
  "messages": [
    "欢迎来到这里。"
  ],
  "modelBaseUrl": "https://live2d-service.vercel.app/models/"
}
```

（实际响应里的 `modelBaseUrl` 由请求的域名动态生成，部署在你自己的 Vercel 域名下即为 `https://<你的项目>.vercel.app/models/`。）

`GET /api/next?prev=0` / `GET /api/random?current=0`

```json
{
  "nextIndex": 1,
  "message": "换个角色看看。"
}
```

`GET /api/hitokoto`：与 [一言](https://hitokoto.cn/) JSON 格式一致（代理失败时返回 `502` 与 `{ "error": "hitokoto_proxy_failed" }`）。

## 注意事项

- 扫描结果有 **约 60 秒内存缓存**；新增/删除模型后，短时间内列表可能略滞后，之后会更新。
- Vercel 默认可以直接托管静态文件，但这里额外加了 `vercel.json`，确保跨域访问模型资源时有 CORS 头。
- 公开发布前，请确认模型资源拥有可分发权限。
- 体积较大的模型建议做精简，避免仓库和部署包过大。
