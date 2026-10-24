import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 1539. Kth Missing Positive Number
const A = [2, 3, 4, 7, 11]

export const q1539: Solution = {
  id: 1539,
  plain: '從 1 往上數，跳過已經出現在陣列裡的數字，找第 k 個沒出現的正整數。',
  statement: 'arr 是嚴格遞增的正整數陣列。求未出現在 arr 中的第 k 個正整數。',
  examples: [{ input: 'arr = [2,3,4,7,11], k = 5', output: '9' }, { input: 'arr = [1,2,3,4], k = 2', output: '6' }],
  constraints: ['1 ≤ arr.length ≤ 1000；1 ≤ k ≤ 1000；arr 嚴格遞增。'],
  insight: ['到 arr[i] 為止，原本應有 arr[i] 個正整數，實際只有 i+1 個，因此缺了 arr[i]−i−1 個。', '這個缺少數量隨 i 不減，適合 [[p:binary-search]]。', '也可從 1 一個一個往上數。'],
  approaches: [
    {
      name: '二分第一個缺口足夠的位置',
      idea: '找第一個使 arr[i]−i−1 ≥ k 的索引 i；答案是 i+k。',
      steps: ['定義 missing(i) = arr[i]−i−1。', '二分找 missing(i) ≥ k 的第一個 i。', '若全部不足，i = n；統一回傳 i+k。'],
      figure: { title: 'arr = [2,3,4,7,11], k = 5', steps: [
        { note: '各位置以前的缺少數量是 [1,1,1,3,6]；要找首次達到 5。', views: [arr([1, 1, 1, 3, 6], { label: '缺少數量' })] },
        { note: '先看中點索引 2，缺 1 個，不足 5，往右找。', views: [arr(A, { label: 'arr', highlight: [2] })] },
        { note: '看索引 4，缺 6 個，已超過 5，收縮到左側。', views: [arr(A, { label: 'arr', highlight: [4] })] },
        { note: '索引 3 缺 3 個，仍不足；第一個足夠的是索引 4，答案 4+5=9。', views: [arr([9], { label: '第 5 個缺少數', done: [0] })] },
      ] },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每次二分將搜尋範圍減半。' },
      verdict: '資料量大時很有效；公式 i+k 包含答案在陣列末尾之後的情況。',
      code: {
        python: `def findKthPositive(arr, k):
    left, right = 0, len(arr)
    while left < right:
        mid = (left + right) // 2
        missing = arr[mid] - mid - 1       # 到此位置已缺少幾個
        if missing < k:
            left = mid + 1
        else:
            right = mid
    return left + k`,
        c: `int findKthPositive(int *arr, int arrSize, int k) {
    int left = 0;
    int right = arrSize;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] - mid - 1 < k) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left + k;
}`,
        cpp: `int findKthPositive(vector<int>& arr, int k) {
    int left = 0;
    int right = arr.size();
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] - mid - 1 < k) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left + k;
}`,
        java: `int findKthPositive(int[] arr, int k) {
    int left = 0;
    int right = arr.length;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] - mid - 1 < k) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left + k;
}`,
        javascript: `function findKthPositive(arr, k) {
  let left = 0;
  let right = arr.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] - mid - 1 < k) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left + k;
}`,
      },
    },
    {
      name: '逐個數缺少的正整數',
      idea: '從 1 開始往上數；遇到不在 arr 的數字，就把 k 減一。',
      steps: ['從 candidate = 1、索引 i = 0 開始。', '若 candidate 等於 arr[i] 就跳過陣列元素；否則 k 減一。', 'k 變 0 時回傳 candidate。'],
      figure: { title: 'arr = [2,3,4,7,11], k = 5', steps: [
        { note: '1 不在陣列，是第 1 個缺少的數。', views: [arr([1], { label: '缺少', highlight: [0] })] },
        { note: '2、3、4 都在陣列，跳過；5 是第 2 個缺少的數。', views: [arr([1, 5], { label: '缺少', highlight: [1] })] },
        { note: '6 是第 3 個；7 已存在，8 才是第 4 個。', views: [arr([1, 5, 6, 8], { label: '缺少', highlight: [3] })] },
        { note: '9 是第 5 個，停止並回傳 9。', views: [arr([1, 5, 6, 8, 9], { label: '缺少', done: [4] })] },
      ] },
      complexity: { time: 'O(n + k)', space: 'O(1)', why: '最多經過 n 個已存在數與 k 個缺少數。' },
      verdict: '最容易跟著題意寫，適合 k 不大時。',
      code: {
        python: `def findKthPositive(arr, k):
    index = 0
    candidate = 1
    while True:
        if index < len(arr) and arr[index] == candidate:
            index += 1                    # 已存在，不算缺少
        else:
            k -= 1
            if k == 0:
                return candidate
        candidate += 1`,
        c: `int findKthPositive(int *arr, int arrSize, int k) {
    int index = 0;
    int candidate = 1;
    for (;;) {
        if (index < arrSize && arr[index] == candidate) {
            index++;
        } else {
            k--;
            if (k == 0) {
                return candidate;
            }
        }
        candidate++;
    }
}`,
        cpp: `int findKthPositive(vector<int>& arr, int k) {
    int index = 0;
    int candidate = 1;
    for (;;) {
        if (index < (int)arr.size() && arr[index] == candidate) {
            index++;
        } else {
            k--;
            if (k == 0) {
                return candidate;
            }
        }
        candidate++;
    }
}`,
        java: `int findKthPositive(int[] arr, int k) {
    int index = 0;
    int candidate = 1;
    while (true) {
        if (index < arr.length && arr[index] == candidate) {
            index++;
        } else {
            k--;
            if (k == 0) {
                return candidate;
            }
        }
        candidate++;
    }
}`,
        javascript: `function findKthPositive(arr, k) {
  let index = 0;
  let candidate = 1;
  while (true) {
    if (index < arr.length && arr[index] === candidate) {
      index++;
    } else {
      k--;
      if (k === 0) {
        return candidate;
      }
    }
    candidate++;
  }
}`,
      },
    },
  ],
  pitfalls: ['陣列最後一個數之後也可能繼續缺數；二分右界應可到 n。', 'missing(i) 是 arr[i]−(i+1)，不是 arr[i]−i。'],
  check: { kind: 'fn', fn: 'findKthPositive', cases: [
    { args: [A, 5], out: 9 }, { args: [[1, 2, 3, 4], 2], out: 6 }, { args: [[2], 1], out: 1 }, { args: [[1], 1], out: 2 },
  ] },
}
