<template>
  <div class="home-view">
    <h1>ホーム</h1>

    <!-- 学習状況サマリー -->
    <section class="summary-section">
      <h2>学習状況サマリー</h2>
      <div class="progress-bar-container">
        <span>全体の進捗率</span>
        <div class="progress-bar">
          <div class="progress" :style="{ width: overallProgress + '%' }"></div>
        </div>
        <span>{{ overallProgress.toFixed(1) }}%</span>
      </div>
      <p>前回学習: {{ lastStudyDate || 'まだありません' }}</p>
      <p>最近の正答率: {{ recentAccuracy !== null ? recentAccuracy.toFixed(1) + '%' : 'データなし' }}</p>
      <button class="start-practice-button" @click="goToPractice">
          問題練習を始める (苦手度順)
      </button>
    </section>

    <!-- 苦手問題プレビュー -->
     <section class="苦手-section">
        <h2>苦手な問題 Top {{ MAX_WEAK_PROBLEMS_DISPLAY }}</h2>
        <div v-if="isLoadingData">
            <p>学習データと問題情報を読み込み中...</p>
        </div>
        <ul v-else-if="weakProblemsForPreview.length > 0">
            <li v-for="problem in weakProblemsForPreview" :key="problem.questionId" :class="getDifficultyClass(problem.difficultyScore)">
               <div class="problem-info">
                   <span class="problem-id">問 {{ problem.questionId }}:</span>
                   <!-- 全文表示に変更 -->
                   <p class="problem-text">{{ problem.questionText }}</p>
               </div>
               <div class="problem-details">
                   <span class="correct-answer">正解: {{ problem.correctAnswerText }}</span>
                   <span class="difficulty-score">苦手度: {{ problem.difficultyScore.toFixed(2) }}</span>
               </div>
            </li>
        </ul>
        <p v-else>苦手な問題はありません。</p>
     </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Problem, AnswerRecord, DifficultyMap } from '../types';
import { loadData, ANSWER_HISTORY_KEY, DIFFICULTY_MAP_KEY } from '../types';

// --- 定数 ---
const MAX_WEAK_PROBLEMS_DISPLAY = 5;
const WEAKNESS_PREVIEW_THRESHOLD = 1.0;
const MAX_DIFFICULTY_SCORE = 20; // PracticeView と合わせる

// --- リアクティブな状態 ---
const router = useRouter();
const answerHistory = ref<AnswerRecord[]>([]);
const difficultyMap = ref<DifficultyMap>({});
const allProblems = ref<Problem[]>([]);
const isLoadingData = ref<boolean>(true);

// --- COMPUTED ---
const overallProgress = computed(() => {
    if (allProblems.value.length === 0) return 0;
    const answeredIds = new Set(answerHistory.value.map(r => r.questionId));
    const totalTwoSelection = allProblems.value.filter(p => p.type === 'twoSelection').length;
    if (totalTwoSelection === 0) return 0;
    return (answeredIds.size / totalTwoSelection) * 100;
});

const lastStudyDate = computed(() => {
    if (answerHistory.value.length === 0) return null;
    const lastTimestamp = Math.max(...answerHistory.value.map(r => r.timestamp));
    return new Date(lastTimestamp).toLocaleDateString();
});

const recentAccuracy = computed(() => {
    const validAnswers = answerHistory.value.filter(r => r.isCorrect !== null);
    if (validAnswers.length === 0) return null;
    const correctCount = validAnswers.filter(r => r.isCorrect === true).length;
    return (correctCount / validAnswers.length) * 100;
});

// ホーム画面表示用の苦手問題プレビューリスト
const weakProblemsForPreview = computed(() => {
    if (isLoadingData.value || allProblems.value.length === 0) {
        return [];
    }
    return Object.entries(difficultyMap.value)
        .filter(([__id, score]) => score >= WEAKNESS_PREVIEW_THRESHOLD)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, MAX_WEAK_PROBLEMS_DISPLAY)
        .map(([idStr, score]) => {
            const questionId = parseInt(idStr, 10);
            const problemData = allProblems.value.find(p => p.questionId === questionId);
            if (!problemData) return null;

            // ★問題文の全文を取得（ひらがな除去）
            const fullText = problemData.question.replace(/\([ぁ-ん]+\)/g, '');
            const answerText = typeof problemData.answer === 'boolean' ? (problemData.answer ? '○' : '×') : 'N/A';

            return {
                questionId: questionId,
                questionText: fullText, // 全文を使用
                correctAnswerText: answerText,
                difficultyScore: score
            };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);
});

// --- メソッド ---
const loadAllData = async () => {
  isLoadingData.value = true;
  try {
    answerHistory.value = loadData<AnswerRecord[]>(ANSWER_HISTORY_KEY, []);
    difficultyMap.value = loadData<DifficultyMap>(DIFFICULTY_MAP_KEY, {});

    const response = await fetch('/problems.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const rawData: { [key: string]: string } = await response.json();
    allProblems.value = Object.values(rawData).map(jsonString => {
        try {
            const problemData = JSON.parse(jsonString) as Problem;
            if (typeof problemData.questionId === 'number') return problemData;
            return null;
        } catch (parseError) {
             console.error("問題データのパースに失敗しました:", jsonString, parseError);
             return null;
        }
    }).filter((p): p is Problem => p !== null);

  } catch (error) {
    console.error("データ読み込み中にエラーが発生しました:", error);
  } finally {
    isLoadingData.value = false;
  }
};

const getDifficultyClass = (score: number): string => {
    const normalizedScore = Math.min(1, Math.max(0, score / MAX_DIFFICULTY_SCORE));
    const level = Math.floor(normalizedScore * 6.999) + 1;
    return `difficulty-level-${Math.min(7, Math.max(1, level))}`;
};

const goToPractice = () => {
  router.push('/practice');
};

// --- ライフサイクルフック ---
onMounted(() => {
  loadAllData();
});

</script>

<style scoped>
.home-view {
  padding: 1rem; height: 100%; overflow: hidden; display: flex; flex-direction: column;
}
h1, h2 { margin-bottom: 1rem; }
.summary-section, .苦手-section {
  background-color: #fff; padding: 1rem; border-radius: 8px;
  margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex-shrink: 0;
}
.苦手-section { flex-grow: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; min-height: 0; }
.progress-bar-container { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.progress-bar { flex-grow: 1; height: 10px; background-color: #e0e0e0; border-radius: 5px; overflow: hidden; }
.progress { height: 100%; background-color: #007bff; transition: width 0.5s ease; }
.start-practice-button {
  display: block; width: 100%; padding: 0.8rem; margin-top: 1rem; border: none;
  background-color: #007bff; color: white; border-radius: 5px; text-align: center;
  cursor: pointer; font-size: 1rem; font-weight: bold; transition: background-color 0.2s ease;
}
.start-practice-button:hover { background-color: #0056b3; }
.苦手-section ul { list-style: none; padding: 0; margin: 0; }
.苦手-section li {
  padding: 0.8rem 0.6rem; border-bottom: 1px solid #eee;
  border-left: 5px solid transparent; transition: border-color 0.3s ease;
}
.苦手-section li:last-child { border-bottom: none; }

.problem-info {
    /* IDとテキストを縦に並べるように変更 */
    margin-bottom: 0.6rem; /* 詳細との間隔 */
}
.problem-id {
    font-weight: bold; margin-right: 0.5em; color: #555;
    font-size: 0.85rem; display: block; /* 改行させる */ margin-bottom: 0.3em;
}
/* 問題文のスタイル変更 */
.problem-text {
    font-size: 0.95rem; color: #333; line-height: 1.5; /* 行間調整 */
    margin: 0; /* <p> のデフォルトマージンリセット */
    white-space: normal; /* 折り返しを許可 */
    word-break: break-word; /* 単語の途中でも折り返す */
}
.problem-details { display: flex; justify-content: space-between; font-size: 0.85rem; color: #666; }
.correct-answer { font-weight: bold; }
.difficulty-score { font-style: italic; }

/* 7段階の色分け (左ボーダーの色と背景色を少し変える) */
.difficulty-level-7 { border-left-color: #e57373; background-color: #ffebee; } /* Red */
.difficulty-level-6 { border-left-color: #ffb74d; background-color: #fff3e0; } /* Orange */
.difficulty-level-5 { border-left-color: #fff176; background-color: #fffde7; } /* Yellow */
.difficulty-level-4 { border-left-color: #aed581; background-color: #f1f8e9; } /* Light Green */
.difficulty-level-3 { border-left-color: #4dd0e1; background-color: #e0f7fa; } /* Cyan */
.difficulty-level-2 { border-left-color: #7986cb; background-color: #e8eaf6; } /* Indigo */
.difficulty-level-1 { border-left-color: #81c784; background-color: #e8f5e9; } /* Green */


.苦手-section p { color: #666; font-size: 0.9rem; padding: 0.5rem 0; }
</style>