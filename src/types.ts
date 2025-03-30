// src/types.ts

// 問題データの型
export interface Problem {
    questionId: number;
    category?: string;
    numberInSequence?: number;
    sourceUrl?: string;
    imageUrl: string | null;
    type: string;        // "twoSelection" などを想定
    question: string;
    explanation: string;
    answer?: boolean;     // twoSelection の場合は boolean
    choices?: string[];
    answers?: boolean[];
}

// 解答履歴の型
export interface AnswerRecord {
    questionId: number;
    isCorrect: boolean | null; // null は「わからない」
    timestamp: number;         // 解答したUNIXタイムスタンプ (ミリ秒)
}

// 苦手度マップの型 { 問題ID: 苦手度スコア }
export type DifficultyMap = Record<number, number>;

// localStorage 操作ユーティリティ (共通化)
export const loadData = <T>(key: string, defaultValue: T): T => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error(`Failed to load data for key "${key}":`, e);
        // エラーが発生した場合、キーを削除してデフォルト値を返す試み
        localStorage.removeItem(key);
        return defaultValue;
    }
};

export const saveData = <T>(key: string, data: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Failed to save data for key "${key}":`, e);
    }
};

// localStorage キー (共通化)
export const ANSWER_HISTORY_KEY = 'driving_license_answer_history';
export const DIFFICULTY_MAP_KEY = 'driving_license_difficulty_map';