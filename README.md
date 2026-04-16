# 外城小站

一个前后端一体的个人博客原型。

## 技术栈

- 前端：Vite + React
- 后端：CloudWeGo Hertz + GORM
- 数据库：MySQL 8.4
- 本地组件：Docker Compose

## 启动 MySQL

```bash
docker compose up -d mysql
```

## 启动后端

```bash
./backend/script/start.sh
```

后端默认监听：

```text
http://127.0.0.1:8080
```

健康检查：

```bash
curl http://127.0.0.1:8080/api/health
```

## 启动前端

```bash
npm install
npm run dev -- --port 5173
```

前端默认访问：

```text
http://127.0.0.1:5173/
```

Vite 已配置 `/api` 代理到 `http://127.0.0.1:8080`。
