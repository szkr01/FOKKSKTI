<template>
  <div class="practice-view">
    <!-- コンテンツ表示エリア -->
    <div class="content-area">
      <div v-if="isLoading" class="loading">
        <p>問題を読み込み中...</p>
      </div>

      <!-- 問題表示 (出題フェーズ) -->
      <div v-else-if="phase === 'question' && currentProblem" class="question-display">
        <p class="question-number">
           問題 {{ currentProblemIndex + 1 }} / {{ problems.length }} (苦手度順)
        </p>
        <!-- 問題カード: 7段階の苦手度クラス + 苦手度スコア表示を追加 -->
        <div class="problem-card" :class="difficultyLevelClass">
          <!-- 苦手度スコア表示を追加 -->
          <span class="card-difficulty-display">
              苦手度: {{ currentDifficultyScore?.toFixed(1) ?? 'N/A' }}
          </span>
          <div class="problem-card-content">
            <img v-if="currentProblem.imageUrl" :src="currentProblem.imageUrl" alt="問題画像" class="question-image">
            <p class="question-text">{{ formattedQuestion }}</p>
          </div>
        </div>
      </div>

      <!-- 解説表示 (解説フェーズ) -->
      <div v-else-if="phase === 'explanation' && currentProblem" class="explanation-content" :class="explanationColorClass">
        <div class="explanation-header">
          <h1 class="explanation-title">{{ explanationTitle }}</h1>
          <p class="difficulty-indicator">
             苦手度スコア: {{ currentDifficultyScore?.toFixed(2) ?? '0.00' }} (Level {{ currentDifficultyLevel }})
             <span v-if="difficultyChange !== 0" :class="difficultyChange > 0 ? 'increase' : 'decrease'">
               ({{ difficultyChange > 0 ? '+' : '' }}{{ difficultyChange.toFixed(2) }})
             </span>
          </p>
        </div>
        <div class="explanation-body">
          <div class="result-details">
            <p>あなたの回答: <span class="answer-label" :class="userChoiceClass">{{ userChoiceText }}</span></p>
            <p>正解: <span class="answer-label" :class="correctAnswerClass">{{ correctAnswerText }}</span></p>
          </div>
          <div class="explanation-text-wrapper">
            <p class="explanation-text">{{ formattedExplanation }}</p>
          </div>
        </div>
      </div>

      <div v-else class="no-problem">
         <p v-if="!isLoading">表示できる問題がありません。</p>
      </div>
    </div>

    <!-- アクションボタンエリア -->
    <div class="action-area">
      <div v-if="phase === 'question' && !isLoading && currentProblem" class="button-group-question">
        <button class="action-button correct" @click="handleAnswer(true)">○</button>
        <button class="action-button wrong" @click="handleAnswer(false)">×</button>
        <button class="action-button unsure" @click="handleAnswer(null)">わからない</button>
      </div>
      <div v-else-if="phase === 'explanation' && !isLoading && currentProblem" class="button-group-explanation">
        <button class="next-button" @click="goToNextQuestion">次へ</button>
      </div>
      <div v-else-if="!isLoading && !currentProblem" class="button-group-placeholder">
          <button class="next-button" @click="goBackHome">ホームに戻る</button>
      </div>
      <div v-else class="button-group-placeholder"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { Problem, AnswerRecord, DifficultyMap } from '../types';
import { loadData, saveData, ANSWER_HISTORY_KEY, DIFFICULTY_MAP_KEY } from '../types';

// --- 定数 ---
const MAX_DIFFICULTY_SCORE = 10;
const MIN_DIFFICULTY_SCORE = 0;
// INITIAL_DIFFICULTY_SCORE は SettingsView でのみ使用

// --- リアクティブな状態 ---
const router = useRouter();
const problems = ref<Problem[]>([]);
const allFetchedProblems = ref<Problem[]>([]);
const currentProblemIndex = ref<number>(0);
const isLoading = ref<boolean>(true);
const phase = ref<'question' | 'explanation'>('question');
const userChoice = ref<boolean | null>(null);
const isCorrect = ref<boolean | null>(null);
const answerHistory = ref<AnswerRecord[]>([]);
const difficultyMap = ref<DifficultyMap>({});
const difficultyChange = ref<number>(0);

// --- COMPUTED ---
const currentProblem = computed<Problem | null>(() => {
  return problems.value[currentProblemIndex.value] ?? null;
});
const formattedQuestion = computed(() => {
  return currentProblem.value?.question.replace(/\([ぁ-ん]+\)/g, '') ?? '';
});
const formattedExplanation = computed(() => {
  return currentProblem.value?.explanation.replace(/\([ぁ-ん]+\)/g, '') ?? '';
});
const currentDifficultyScore = computed<number | undefined>(() => {
    return currentProblem.value ? difficultyMap.value[currentProblem.value.questionId] : undefined;
});
const currentDifficultyLevel = computed<number>(() => {
    const score = currentDifficultyScore.value ?? MIN_DIFFICULTY_SCORE;
    const normalizedScore = Math.min(1, Math.max(0, score / MAX_DIFFICULTY_SCORE));
    const level = Math.floor(normalizedScore * 6.999) + 1;
    return Math.min(7, Math.max(1, level));
});
const difficultyLevelClass = computed(() => {
    return `difficulty-level-${currentDifficultyLevel.value}`;
});
const explanationTitle = computed(() => {
  if (userChoice.value === null) return '回答: わからない';
  return isCorrect.value ? '正解！' : '不正解...';
});
const explanationColorClass = computed(() => {
  if (userChoice.value === null) return 'explanation-unsure';
  return isCorrect.value ? 'explanation-correct' : 'explanation-incorrect';
});
const userChoiceText = computed(() => {
  if (userChoice.value === null) return 'わからない';
  return userChoice.value ? '○' : '×';
});
const correctAnswerText = computed(() => {
  return currentProblem.value?.answer === true ? '○' : (currentProblem.value?.answer === false ? '×' : 'N/A');
});
const userChoiceClass = computed(() => {
  if (userChoice.value === null) return 'unsure-text';
  return isCorrect.value ? 'correct-text' : 'incorrect-text';
});
const correctAnswerClass = computed(() => {
  return currentProblem.value?.answer === true ? 'correct-text' : (currentProblem.value?.answer === false ? 'incorrect-text' : '');
});

// --- メソッド ---
const findLastAnswerRecord = (problemId: number): AnswerRecord | undefined => {
    return answerHistory.value
        .filter(record => record.questionId === problemId)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
};
const calculateTimeWeight = (timeSinceLastMs: number | null): number => {
    if (timeSinceLastMs === null || timeSinceLastMs === Infinity) return 2.0;
    const daysPassed = timeSinceLastMs / (1000 * 60 * 60 * 24);
    const weight = Math.min(5.0, 1.0 + Math.log10(Math.max(1, daysPassed + 1)));
    return weight;
};
const updateDifficultyScore = (problemId: number, choice: boolean | null, correctAnswer: boolean, answeredTimestamp: number) => {
    const currentScore = difficultyMap.value[problemId] ?? MIN_DIFFICULTY_SCORE; // なければ 0 から開始
    const lastRecord = findLastAnswerRecord(problemId);
    const timeSinceLastMs = lastRecord ? answeredTimestamp - lastRecord.timestamp : null;
    const timeWeight = calculateTimeWeight(timeSinceLastMs);
    let correctnessFactor: number;
    if (choice === null) correctnessFactor = 1.5;
    else if (choice === correctAnswer) correctnessFactor = -1.0;
    else correctnessFactor = 2.5;
    const scoreChange = correctnessFactor * timeWeight;
    const newScore = Math.max(MIN_DIFFICULTY_SCORE, Math.min(MAX_DIFFICULTY_SCORE, currentScore + scoreChange));
    difficultyChange.value = newScore - currentScore;
    difficultyMap.value = { ...difficultyMap.value, [problemId]: newScore };
};
const fetchAndPrepareProblems = async () => {
  isLoading.value = true;
  try {
    const response = await fetch('/problems.json');
    if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
    const rawData: { [key: string]: string } = await response.json();
    allFetchedProblems.value = Object.values(rawData).map(jsonString => {
      try {
        const problemData = JSON.parse(jsonString) as Problem;
        if (problemData.type === 'twoSelection' && typeof problemData.answer === 'boolean' && typeof problemData.questionId === 'number') return problemData;
        return null;
      } catch { return null; }
    }).filter((p): p is Problem => p !== null);

    if (allFetchedProblems.value.length === 0) {
        problems.value = []; return;
    }
    problems.value = [...allFetchedProblems.value].sort((a, b) => {
        // difficultyMap に存在しない ID はデフォルトスコア (MIN or INITIAL?) で比較。ここでは MIN(0) とする。
        const scoreA = difficultyMap.value[a.questionId] ?? Math.random() * MAX_DIFFICULTY_SCORE;
        const scoreB = difficultyMap.value[b.questionId] ?? Math.random() * MAX_DIFFICULTY_SCORE;
        return scoreB - scoreA;
    });
    currentProblemIndex.value = 0;
    phase.value = 'question';
    userChoice.value = null;
    isCorrect.value = null;
    difficultyChange.value = 0;
  } catch (error) {
    console.error("Failed to fetch/prepare problems:", error);
    problems.value = [];
  } finally {
    isLoading.value = false;
  }
};
const handleAnswer = (choice: boolean | null) => {
  if (!currentProblem.value || typeof currentProblem.value.answer !== 'boolean') return;
  const problemId = currentProblem.value.questionId;
  const correctAnswer = currentProblem.value.answer;
  const answeredTimestamp = Date.now();
  userChoice.value = choice;
  isCorrect.value = (choice === correctAnswer);
  updateDifficultyScore(problemId, choice, correctAnswer, answeredTimestamp);
  const newRecord: AnswerRecord = { questionId: problemId, isCorrect: choice === null ? null : isCorrect.value, timestamp: answeredTimestamp };
  answerHistory.value.push(newRecord);
  phase.value = 'explanation';
};
const goToNextQuestion = () => {
  difficultyChange.value = 0;
  if (currentProblemIndex.value < problems.value.length - 1) {
    currentProblemIndex.value++;
    phase.value = 'question';
    userChoice.value = null;
    isCorrect.value = null;
  } else {
    alert("全ての問題が完了しました！お疲れ様でした。");
    goBackHome();
  }
};
const goBackHome = () => { router.push('/'); }

// --- ライフサイクルフック & Watchers ---
onMounted(async () => {
  answerHistory.value = loadData<AnswerRecord[]>(ANSWER_HISTORY_KEY, []);
  difficultyMap.value = loadData<DifficultyMap>(DIFFICULTY_MAP_KEY, {});
  await fetchAndPrepareProblems();
});
watch(difficultyMap, (newMap) => { saveData(DIFFICULTY_MAP_KEY, newMap); }, { deep: true });
watch(answerHistory, (newHistory) => { saveData(ANSWER_HISTORY_KEY, newHistory); }, { deep: true });

</script>

<style scoped>
/* 既存スタイル ... */
.practice-view { height: 100%; width: 100%; background-color: #fff; overflow: hidden; position: relative; display: flex; flex-direction: column; }
.content-area { flex: 0.85; padding: 1rem; overflow: hidden; box-sizing: border-box; display: flex; flex-direction: column; min-height: 0; }
.loading, .no-problem { text-align: center; color: #666; font-size: 1.1rem; margin: auto; }
.question-display { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; min-height: 0; }
.question-number { position: absolute; top: 0; right: 0; font-size: 0.75rem; color: #555; padding: 0.3rem 0.8rem; background-color: rgba(220, 220, 220, 0.7); border-bottom-left-radius: 6px; z-index: 1; }

/* 問題カード */
.problem-card {
    flex: 1; border-radius: 12px; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
    margin-top: 1.5rem; margin-bottom: 0.5rem; display: flex; overflow: hidden;
    transition: background-color 0.3s ease, border-color 0.3s ease;
    border: 2px solid;
    position: relative; /* 苦手度表示の基準点 */
}

/* ★問題カード内の苦手度表示スタイル */
.card-difficulty-display {
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.4); /* 半透明の黒背景 */
    color: white;
    font-size: 0.7rem;
    font-weight: bold;
    padding: 0.2rem 0.6rem;
    border-bottom-right-radius: 6px; /* 右下を角丸に */
    z-index: 2; /* 問題番号より手前、カード内容より手前 */
    opacity: 0.8; /* 少し透明に */
}

/* 7段階の色分け */
.difficulty-level-7 { background-color: #FFEDED; border-color: #FFBDBD; }
.difficulty-level-6 { background-color: #FFF2E5; border-color: #FFDAB9; }
.difficulty-level-5 { background-color: #FFFFE0; border-color: #FFFACD; }
.difficulty-level-4 { background-color: #F0FFF0; border-color: #C1FFC1; }
.difficulty-level-3 { background-color: #E0FFFF; border-color: #AFEEEE; }
.difficulty-level-2 { background-color: #E6E6FA; border-color: #D8BFD8; }
.difficulty-level-1 { background-color: #E9FFDB; border-color: #C1E1C1; }

.problem-card-content { flex: 1; padding: 1.2rem 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow-y: auto; -webkit-overflow-scrolling: touch; padding-top: 2rem; /* 苦手度表示と被らないように少し下げる */ }
.question-image { max-width: 100%; max-height: 28vh; height: auto; margin-bottom: 1.2rem; border-radius: 8px; object-fit: contain; flex-shrink: 0; }
.question-text { font-size: clamp(1.1rem, 4.5vw, 1.3rem); line-height: 1.7; color: #212529; text-align: left; width: 100%; margin: 0; font-weight: 500; }

/* 解説表示 */
.explanation-content { flex: 1; width: 100%; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; min-height: 0; color: #333; transition: background-color 0.3s ease, border-color 0.3s ease; border: 2px solid; }
.explanation-correct { background-color: #e7f3ff; border-color: #a0c4ff; }
.explanation-incorrect { background-color: #fbe8ea; border-color: #f5b7b1; }
.explanation-unsure { background-color: #f8f9fa; border-color: #e9ecef; }
.explanation-header { padding: 0.8rem 1rem; text-align: center; flex-shrink: 0; border-bottom: 1px solid rgba(0,0,0,0.1); position: relative; }
.difficulty-indicator { font-size: 0.8rem; color: #555; margin-top: 0.3rem; }
.difficulty-indicator .increase { color: #dc3545; font-weight: bold; }
.difficulty-indicator .decrease { color: #198754; font-weight: bold; }
.explanation-correct .explanation-title { color: #0a58ca; }
.explanation-incorrect .explanation-title { color: #b02a37; }
.explanation-unsure .explanation-title { color: #5c636a; }
.explanation-title { margin: 0; font-size: 4.3rem; font-weight: bold; }
.explanation-body { padding: 1rem 1.2rem; flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
.result-details { font-weight: bold;margin-bottom: 1rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(0,0,0,0.1); font-size: 1rem; line-height: 1.5; flex-shrink: 0; }
.result-details p { font-weight: bold; margin: 0.3rem 0; font-size: 2.3rem; }
.answer-label { font-weight: bold; font-size: 3.3rem;}
.explanation-text-wrapper { overflow-y: auto; -webkit-overflow-scrolling: touch; flex: 1; min-height: 0; padding-right: 5px; }
.explanation-text { font-size: clamp(1rem, 4vw, 1.1rem); line-height: 1.7; color: #333; margin: 0; font-weight: 400; }

/* アクションボタンエリア */
.action-area { position: fixed; bottom: 60px; left: 0; right: 0; height: 80px; max-width: 600px; margin: 0 auto; padding: 0 0.8rem; background-color: #ffffff; border-top: 1px solid #e0e0e0; display: flex; align-items: center; justify-content: center; box-sizing: border-box; z-index: 90; }
.button-group-question, .button-group-explanation, .button-group-placeholder { display: flex; gap: 0.8rem; width: 100%; height: 56px; align-items: center; }
.button-group-placeholder .next-button { flex: none; width: auto; padding: 0 2rem; margin: 0 auto; }
.action-button, .next-button { flex: 1; padding: 0 0.5rem; font-size: clamp(1rem, 4vw, 1.2rem); font-weight: bold; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; display: flex; justify-content: center; align-items: center; height: 100%; border: 2px solid; overflow: hidden; white-space: nowrap; }
.action-button:active, .next-button:active { transform: scale(0.96); }
.action-button.correct { border-color: #0d6efd; color: #0d6efd; background-color: #fff; }
.action-button.correct:hover { background-color: #e7f3ff; }
.action-button.wrong { border-color: #dc3545; color: #dc3545; background-color: #fff; }
.action-button.wrong:hover { background-color: #fbe8ea; }
.action-button.unsure { border-color: #6c757d; color: #6c757d; background-color: #fff; }
.action-button.unsure:hover { background-color: #f8f9fa; }
.next-button { background-color: #198754; color: white; border: none; }
.next-button:hover { background-color: #157347; }
.correct-text { color: #0a58ca; }
.incorrect-text { color: #b02a37; }
.unsure-text { color: #5c636a; }
</style>