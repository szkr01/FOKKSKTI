<template>
  <div class="settings-view">
    <h1>設定</h1>

    <!-- 学習データ管理 -->
    <section class="setting-section">
      <h2>学習データ管理</h2>
      <button class="setting-button danger" @click="confirmResetLearningData">
        学習履歴と苦手度をリセット
      </button>
      <p class="description">注意: これまでの解答履歴と苦手度スコアがすべて削除され、初期状態に戻ります。この操作は元に戻せません。</p>
    </section>

    <!-- 苦手度計算パラメータ (表示のみ) -->
    <section class="setting-section">
        <h2>苦手度計算パラメータ (参考値)</h2>
         <div class="setting-item">
            <label>スコア範囲:</label>
            <span>{{ MIN_DIFFICULTY_SCORE }} 〜 {{ MAX_DIFFICULTY_SCORE }}</span>
        </div>
        <div class="setting-item">
            <label>正解時の基本変化係数:</label>
             <span>-1.0</span>
        </div>
        <div class="setting-item">
            <label>不正解時の基本変化係数:</label>
             <span>+2.5</span>
        </div>
         <div class="setting-item">
            <label>「わからない」時の基本変化係数:</label>
             <span>+1.5</span>
        </div>
         <div class="setting-item">
            <label>時間経過の重み:</label>
             <span>1.0 (0日) 〜 約 5.0 (最大)</span>
        </div>
         <p class="description">
             最終解答からの経過時間に応じて変化量が調整されます。<br>
             現在は固定値です。将来的には調整可能にする予定です。
          </p>
    </section>

    <!-- アプリ情報 -->
    <section class="setting-section">
      <h2>アプリ情報</h2>
      <p>バージョン: 1.1.0 (高度な苦手度実装)</p>
      <p>開発者: [あなたの名前または組織名]</p>
      <a href="#" @click.prevent="showFeedbackAlert">フィードバックを送る (準備中)</a>
    </section>

     <!-- その他 -->
     <section class="setting-section">
        <h2>その他</h2>
        <a href="#" @click.prevent="showPolicyAlert('利用規約')">利用規約 (準備中)</a> <br>
        <a href="#" @click.prevent="showPolicyAlert('プライバシーポリシー')">プライバシーポリシー (準備中)</a>
     </section>
  </div>
</template>

<script setup lang="ts">
// 共通の型定義とユーティリティ、定数をインポート
import { ANSWER_HISTORY_KEY, DIFFICULTY_MAP_KEY } from '../types';

// PracticeViewで定義されている定数 (表示用)
const MAX_DIFFICULTY_SCORE = 20;
const MIN_DIFFICULTY_SCORE = 0;

// 学習データ削除処理
const clearLearningData = (): boolean => {
    try {
        localStorage.removeItem(ANSWER_HISTORY_KEY);
        localStorage.removeItem(DIFFICULTY_MAP_KEY);
        console.log('学習データを削除しました。');
        return true; // 成功
    } catch (e) {
        console.error('学習データの削除に失敗しました:', e);
        return false; // 失敗
    }
}

// リセット確認と実行
const confirmResetLearningData = () => {
  if (confirm('本当に学習履歴と苦手度データをリセットしますか？\nこの操作は元に戻せません。')) {
     const success = clearLearningData();
     if (success) {
         alert('学習履歴と苦手度データをリセットしました。\nホーム画面に戻ると反映されます。');
         // 必要であればここで状態をリセットしたり、ホームに強制遷移させる
         // 例: import { useRouter } from 'vue-router'; const router = useRouter(); router.push('/');
     } else {
         alert('データの削除中にエラーが発生しました。');
     }
  }
};

// ダミーのアラート関数
const showFeedbackAlert = () => {
    alert('フィードバック機能は現在準備中です。');
}
const showPolicyAlert = (docName: string) => {
     alert(`${docName} は現在準備中です。`);
}

</script>

<style scoped>
.settings-view {
  padding: 1rem;
  height: 100%;
  overflow-y: auto; /* 設定項目が多い場合にスクロール可能 */
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  background-color: #f9f9f9; /* 背景を少しグレーに */
}

h1 {
  margin-bottom: 1.5rem; /* タイトルの下の余白を少し増やす */
  color: #333;
}

h2 {
  margin-bottom: 1rem;
  color: #555;
  font-size: 1.1rem;
  border-bottom: 1px solid #eee; /* 見出しの下線 */
  padding-bottom: 0.5rem;
}

.setting-section {
  background-color: #fff;
  padding: 1.2rem; /* パディングを少し増やす */
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.08); /* 影を少し調整 */
}

.setting-button {
  padding: 0.8rem 1.5rem;
  border: 1px solid #ccc;
  background-color: #f8f8f8;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 0.5rem;
   transition: background-color 0.2s ease, border-color 0.2s ease;
}
 .setting-button:hover {
    background-color: #e9ecef;
    border-color: #bbb;
 }

.setting-button.danger {
  background-color: #dc3545;
  color: white;
  border: 1px solid #dc3545;
}
 .setting-button.danger:hover {
    background-color: #c82333;
    border-color: #bd2130;
 }


.description {
  font-size: 0.85rem; /* 説明文のフォントを少し小さく */
  color: #666;
  margin-top: 0.8rem; /* ボタンや項目との間隔 */
  line-height: 1.5; /* 行間を調整 */
}

.setting-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.9rem; /* 項目間の余白 */
    font-size: 0.95rem;
}

.setting-item label {
    width: 200px; /* ラベル幅を固定 */
    flex-shrink: 0; /* ラベルが縮まないように */
    margin-right: 1rem;
    color: #333;
    font-weight: 500; /* 少し太く */
}
.setting-item span {
    font-weight: normal; /* 値は通常の太さ */
    color: #444;
}


a {
    color: #007bff;
    text-decoration: none;
    display: inline-block;
    margin-top: 0.5rem;
    font-size: 0.95rem;
    transition: color 0.2s ease;
}
a:hover {
    text-decoration: underline;
    color: #0056b3;
}

</style>