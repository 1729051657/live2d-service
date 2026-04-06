# Live2D Model Service Template

这是给 `live2d-web-widget` 配套的模型托管服务模板，目标是：

- 你把自己的 Live2D 模型资源放进 `public/models/`
- 修改 `config/model-list.json`
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

## 目录结构

```text
live2d-service/
├─ api/
│  ├─ health.js
│  ├─ hitokoto.js
│  ├─ model-list.js
│  ├─ next.js
│  └─ random.js
├─ lib/
│  └─ manifest.cjs
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

## 2. 修改模型清单

编辑 `config/model-list.json`：

```json
{
  "serviceName": "My Live2D Model Service",
  "models": [
    "characters/shizuku",
    ["characters/uiharu", "characters/wed_16"]
  ],
  "messages": [
    "欢迎来到我的站点。",
    "换个角色看看。"
  ]
}
```

说明：

- `models` 里的路径都相对于 `/models/`
- 字符串表示单个模型目录
- 字符串数组表示同一组候选模型，前端会随机选一个

## 3. 部署到 Vercel

推荐做法：

1. 把这个目录单独发布成一个 GitHub 公共仓库
2. 在仓库里上传模型资源和 `config/model-list.json`
3. 在 Vercel 导入该仓库并直接部署

如果你准备把它做成公开模板仓库，可以在仓库 README 里放一键部署按钮：

```md
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourname/live2d-model-service-template)
```

把 `yourname/live2d-model-service-template` 换成你自己的公开仓库地址即可。

## 4. 前端插件接入

部署完成后，前端只需要配置服务地址：

```ts
import { createLive2DWidget } from "live2d-web-widget";

createLive2DWidget({
  serviceUrl: "https://your-live2d-service.vercel.app",
  infoLink: "https://github.com/yourname/live2d-model-service-template"
});
```

组件默认会访问：

- `https://your-live2d-service.vercel.app/api/model-list`
- `https://your-live2d-service.vercel.app/models/...`
- Next / Shuffle / Talk 分别请求 `api/next`、`api/random`、`api/hitokoto`（可通过 `useServiceNavigation: false` 关闭）

## API 返回格式

`GET /api/model-list`

```json
{
  "serviceName": "My Live2D Model Service",
  "models": [
    "characters/shizuku"
  ],
  "messages": [
    "欢迎来到这里。"
  ],
  "modelBaseUrl": "https://your-live2d-service.vercel.app/models/"
}
```

`GET /api/next?prev=0` / `GET /api/random?current=0`

```json
{
  "nextIndex": 1,
  "message": "换个角色看看。"
}
```

`GET /api/hitokoto`：与 [一言](https://hitokoto.cn/) JSON 格式一致（代理失败时返回 `502` 与 `{ "error": "hitokoto_proxy_failed" }`）。

## 注意事项

- Vercel 默认可以直接托管静态文件，但这里额外加了 `vercel.json`，确保跨域访问模型资源时有 CORS 头。
- 公开发布前，请确认模型资源拥有可分发权限。
- 体积较大的模型建议做精简，避免仓库和部署包过大。
