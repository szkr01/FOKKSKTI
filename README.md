# 学科練習アプリ

自動車教習所の学科試験対策のためのシンプルな学習アプリケーションです。苦手な問題を効率的に復習できます。PWA (Progressive Web App) に対応しており、オフラインでの利用やデバイスへのインストールが可能です。

## ✨ 主な機能

*   **問題練習**: ○×形式の学科問題を解くことができます。
*   **苦手度計算**: 解答履歴と解答時間（間隔）に基づいて問題ごとの苦手度を自動計算します。
*   **苦手問題優先出題**: 苦手度が高い問題から優先的に出題されます。
*   **学習状況サマリー**: 全体の進捗率、最終学習日、最近の正答率をホーム画面で確認できます。
*   **苦手問題プレビュー**: ホーム画面で苦手な問題をリスト表示し、復習を促します。
*   **学習データリセット**: 設定画面から解答履歴と苦手度データをリセットできます。
*   **PWA対応**:
    *   オフラインでも問題練習が可能です（初回アクセス後にキャッシュされます）。
    *   スマートフォンやデスクトップにアプリとしてインストールできます。

## 💻 技術スタック

*   **フロントエンド**: [Vue.js](https://vuejs.org/) 3 (Composition API, `<script setup>`)
*   **ルーティング**: [Vue Router](https://router.vuejs.org/)
*   **状態管理**: Vue リアクティビティ (`ref`, `computed`) + `localStorage`
*   **ビルドツール**: [Vite](https://vitejs.dev/)
*   **言語**: [TypeScript](https://www.typescriptlang.org/)
*   **PWA**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
*   **スタイリング**: Scoped CSS

## 🚀 セットアップと実行

### 前提条件

*   [Node.js](https://nodejs.org/) (LTS バージョン推奨)
*   [npm](https://www.npmjs.com/) または [yarn](https://yarnpkg.com/)

### インストール

プロジェクトディレクトリで以下のコマンドを実行して、依存関係をインストールします。

```bash
npm install
# または
yarn install
```

### 開発モード (HTTPS)

開発サーバーを起動します。`vite.config.ts` で HTTPS が設定されているため、証明書 (`./ssl/key.pem`, `./ssl/cert.pem`) が必要です。初回アクセス時にブラウザで証明書の警告が表示される場合がありますが、許可して進んでください。

```bash
npm run dev
# または
yarn dev
```

アプリは `https://localhost:3000` (または設定したポート) で利用可能になります。

### ビルド

プロダクション用にアプリをビルドします。ビルドされたファイルは `dist` ディレクトリに出力されます。

```bash
npm run build
# または
yarn build
```

### プレビュー (ビルド後)

ビルドされたアプリをローカルでプレビューします。

```bash
npm run preview
# または
yarn preview
```

プレビューサーバーも `https://localhost:3001` (または設定したポート) で起動します。

## 📱 PWA (Progressive Web App)

このアプリは PWA として動作します。

*   **オフライン利用**: 一度アクセスすると、問題データ (`problems.json`) を含むアプリ全体がキャッシュされ、オフライン環境でも問題練習が可能です。
*   **インストール**: 対応しているブラウザ（Chrome, Edge, Safari on iOS など）では、「ホーム画面に追加」や「アプリをインストール」オプションが表示され、ネイティブアプリのようにデバイスにインストールできます。

## 💾 問題データ

問題データは `public/problems.json` に格納されています。このファイルはアプリ起動時に `fetch` され、練習問題として使用されます。オフライン利用のために、このファイルは Service Worker によってキャッシュされます。

JSON ファイルは、問題IDをキーとし、各問題オブジェクト（`Problem` 型）をJSON文字列として値に持つ形式です。

```json
{
  "1": "{\"questionId\":1,\"imageUrl\":null,\"type\":\"twoSelection\",\"question\":\"この標識は「車両通行止め」である。\",\"explanation\":\"説明文...\",\"answer\":true}",
  "2": "{\"questionId\":2,\"imageUrl\":\"/images/sample.png\",\"type\":\"twoSelection\",\"question\":\"...\",\"explanation\":\"...\",\"answer\":false}",
  // ... 他の問題
}
```

## 📁 ディレクトリ構成 (主要部分)

```
.
├── public/              # 静的アセット (画像, problems.json, PWAアイコンなど)
│   ├── icons/
│   ├── problems.json
│   └── ...
├── src/
│   ├── assets/          # CSS内で参照する静的アセットなど
│   ├── components/      # 共通コンポーネント (BottomNav.vue など)
│   ├── router/          # Vue Router 設定 (index.ts)
│   ├── views/           # 各画面コンポーネント (HomeView.vue, PracticeView.vue など)
│   ├── App.vue          # ルートコンポーネント
│   ├── main.ts          # アプリケーションエントリーポイント
│   ├── style.css        # グローバルスタイル
│   ├── types.ts         # TypeScript 型定義、共通ユーティリティ
│   └── vite-env.d.ts    # Vite 環境変数型定義
├── ssl/                 # 開発用SSL証明書 (自己署名など)
│   ├── cert.pem
│   └── key.pem
├── index.html           # エントリーHTMLファイル
├── package.json         # プロジェクト設定、依存関係
├── tsconfig.json        # TypeScript 設定
├── vite.config.ts       # Vite 設定 (PWA設定を含む)
└── README.md            # このファイル
```