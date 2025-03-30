import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa' // ★ インポート済み

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({ // ★ VitePWA プラグインの設定
      registerType: 'autoUpdate', // Service Worker を自動更新する
      injectRegister: 'auto',   // Service Worker 登録スクリプトを自動挿入
      workbox: {
        // ★ キャッシュするファイルのパターンを明確化
        // js, css, html, 画像, フォント, そして重要な problems.json を含む json ファイルをキャッシュ
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        // runtimeCaching は静的アセット中心の場合、通常は不要
        // APIなどをキャッシュする場合はここに設定を追加
      },
      // ★ includeAssets: public ディレクトリ内のファイルを明示的にキャッシュに含める場合
      // favicon.ico や apple-touch-icon.png はよく含められる
      // problems.json が public にある場合、globPatterns でカバーされるはずだが、
      // 明示的に含めたい場合は ['favicon.ico', 'apple-touch-icon.png', 'problems.json'] のようにする
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      // ★ Web App Manifest の設定 (既存の設定を維持)
      // 注意: manifest内のアイコンパス (例: '/icons/icon-192.png') は
      //       public ディレクトリ内の実際のファイルパスと一致している必要があります。
      //       (例: public/icons/icon-192.png)
      manifest: {
        name: '学科練習アプリ', // アプリのフルネーム
        short_name: '学科練習', // ホーム画面に表示される短い名前
        description: '自動車教習所の学科試験対策学習アプリ', // アプリの説明
        theme_color: '#ffffff', // アプリのテーマカラー (アドレスバーなど)
        background_color: '#ffffff', // スプラッシュスクリーンの背景色
        display: 'standalone', // アプリをスタンドアロンモードで開く
        scope: '/', // アプリのスコープ
        start_url: '/', // アプリ起動時に開くURL
        icons: [
          {
            src: '/icons/icon-192.png', // public/icons/icon-192.png を参照
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png', // public/icons/icon-512.png を参照
            sizes: '512x512',
            type: 'image/png'
          },
          {
            // マスク可能なアイコン (Androidで推奨)
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable' // 'any maskable' も可
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      // '@': fileURLToPath(new URL('./src', import.meta.url)) // 必要に応じてエイリアス設定
    }
  },
  server: {
    port: 3000, // 開発サーバーのポート番号
    https:{
      key: './ssl/key.pem', // SSL証明書のキー
      cert: './ssl/cert.pem' // SSL証明書
    }
  }
})