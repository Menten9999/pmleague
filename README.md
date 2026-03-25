# PM League

Next.js + Prisma + Auth.js (NextAuth) で構成されたリーグ管理アプリです。

## Local Development

1. 依存関係をインストール

```bash
npm ci
```

2. `.env.example` をコピーして `.env` を作成し、接続情報を設定

3. Prisma クライアント生成

```bash
npx prisma generate
```

4. 開発サーバー起動

```bash
npm run dev
```

## Vercel Deployment

このアプリは API ルート（`/api/auth/[...nextauth]` など）を使うため、静的エクスポート（`output: export`）では動きません。

### 1. Vercel プロジェクト作成

```bash
npx --yes vercel
```

### 2. Vercel 環境変数を設定

Vercel Dashboard の Project Settings > Environment Variables に、以下を登録してください。

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL`（推奨）

### 3. デプロイ

```bash
npx --yes vercel --prod --yes
```

## Build

```bash
npm run build
```
