import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const sample = [-2, 1, 3, -4, 5]

function enumerateFig(): FigStep[] {
  const out: FigStep[] = []
  let best = 0
  for (let mask = 0; mask < 1 << sample.length; mask++) {
    if (mask & (mask << 1)) continue
    const chosen = sample.flatMap((v, i) => mask & (1 << i) ? [v] : [])
    const sum = chosen.reduce((a, b) => a + b, 0)
    best = Math.max(best, sum)
    out.push({ note: `選 ${chosen.join('、') || '空集合'}，和為 ${sum}；目前最大是 ${best}。`, views: [arr(sample, { label: '原陣列', highlight: sample.flatMap((_, i) => mask & (1 << i) ? [i] : []) }), arr([sum, best], { label: '這次總和、最佳總和' })] })
  }
  return out
}

function dpFig(): FigStep[] {
  const out: FigStep[] = []
  let prev2 = 0, prev1 = 0
  for (let i = 0; i < sample.length; i++) {
    const take = prev2 + sample[i]
    const curr = Math.max(prev1, take)
    out.push({ note: `位置 ${i} 值 ${sample[i]}：不選是 ${prev1}，選則是 ${prev2}+${sample[i]}=${take}；取 ${curr}。`, views: [arr(sample, { label: '數列', highlight: [i] }), arr([prev2, prev1, curr], { label: '前兩格最佳、前一格最佳、目前最佳' })] })
    prev2 = prev1
    prev1 = curr
  }
  return out
}

export const hrMaxArraySum: HrSolution = {
  slug: 'max-array-sum',
  plain: '像在一排座位上挑獎品，拿走一個就不能拿隔壁的；也可以全部不拿，求最高總價。',
  statement: '給定可含負數的整數陣列，選任意一些元素但不能同時選相鄰位置，求選中元素的最大總和。空集合合法，因此答案至少是 0。',
  examples: [
    { input: 'arr = [-2, 1, 3, -4, 5]', output: '8', note: '選 3 與 5，兩者不相鄰，總和 8。' },
    { input: 'arr = [-2, -3, -1]', output: '0', note: '全是負數，全部不選最好。' },
  ],
  constraints: [
    '數列可很長 → 枚舉所有子集合的指數時間不能用於大輸入。',
    '數值可能為負 → 必須容許空集合，初始最佳值設為 0。',
    '只能限制相鄰位置 → 決策只需記住前一格與前兩格的最佳值。',
  ],
  insight: [
    '直覺上每個位置都可選或不選，枚舉後過濾相鄰的選法。',
    '若處理到 i，不選 i 就沿用 i−1 的答案；選 i 就加上 i−2 的答案。',
    '所以 `dp[i] = max(dp[i-1], dp[i-2] + arr[i])`；只用到兩個舊值，可將 [[p:dp-1d]] 壓成常數空間。另可參考 [198](#/q/198)。',
  ],
  approaches: [
    {
      name: '枚舉合法子集合',
      idea: '逐一嘗試所有選取方式，跳過有相鄰選取的組合。',
      steps: ['用二進位遮罩表示每個位置是否選。', '若任兩個相鄰位元同為 1，跳過。', '加總選中元素並更新答案，空集合自然給出 0。'],
      figure: { title: 'arr = [-2, 1, 3, -4, 5]', steps: enumerateFig() },
      complexity: { time: 'O(n·2^n)', space: 'O(1)', why: '有 2^n 個選法，每個選法最多掃描 n 個位置；只保留累計值。' },
      verdict: '可當小資料的正確性基準，大資料須利用重複子問題。',
      code: {
        python: `def maxSubsetSum(arr):
    n = len(arr)
    answer = 0
    for mask in range(1 << n):
        if mask & (mask << 1):
            continue  # 相鄰兩位同時選取不合法
        total = sum(arr[i] for i in range(n) if mask & (1 << i))
        answer = max(answer, total)
    return answer`,
        c: `int maxSubsetSum(int arr_count, int* arr) {
    int answer = 0;
    for (unsigned long long mask = 0; mask < (1ULL << arr_count); mask++) {
        if (mask & (mask << 1)) continue;
        int total = 0;
        for (int i = 0; i < arr_count; i++) {
            if (mask & (1ULL << i)) total += arr[i];
        }
        if (total > answer) answer = total;
    }
    return answer;
}`,
        cpp: `int maxSubsetSum(vector<int> arr) {
    int answer = 0;
    for (unsigned long long mask = 0; mask < (1ULL << arr.size()); mask++) {
        if (mask & (mask << 1)) continue;
        int total = 0;
        for (int i = 0; i < (int)arr.size(); i++) {
            if (mask & (1ULL << i)) total += arr[i];
        }
        answer = max(answer, total);
    }
    return answer;
}`,
        java: `public static int maxSubsetSum(List<Integer> arr) {
    return maxSubsetSum(arr.stream().mapToInt(Integer::intValue).toArray());
}
public static int maxSubsetSum(int[] arr) {
    int answer = 0;
    for (long mask = 0; mask < (1L << arr.length); mask++) {
        if ((mask & (mask << 1)) != 0) continue;
        int total = 0;
        for (int i = 0; i < arr.length; i++) {
            if ((mask & (1L << i)) != 0) total += arr[i];
        }
        answer = Math.max(answer, total);
    }
    return answer;
}`,
        javascript: `function maxSubsetSum(arr) {
  let answer = 0;
  for (let mask = 0; mask < 2 ** arr.length; mask++) {
    let total = 0;
    let valid = true;
    for (let i = 0; i < arr.length; i++) {
      if (Math.floor(mask / 2 ** i) % 2) {
        if (i && Math.floor(mask / 2 ** (i - 1)) % 2) valid = false;
        total += arr[i];
      }
    }
    if (valid) answer = Math.max(answer, total);
  }
  return answer;
}`,
      },
    },
    {
      name: '兩個狀態的動態規劃',
      idea: '每格只比較選與不選，保留前一格和前兩格的最佳總和。',
      steps: ['將前兩格與前一格的最佳值都設為 0。', '讀到 x 時，選它的值為前兩格最佳加 x；不選則為前一格最佳。', '取兩者最大，將狀態向前推一格。', '掃描完成回傳前一格最佳。'],
      figure: { title: 'arr = [-2, 1, 3, -4, 5]', steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個數只處理一次，只存兩個舊的最佳值。' },
      verdict: '可處理長數列與負數，實作也簡短。',
      code: {
        python: `def maxSubsetSum(arr):
    prev2 = 0
    prev1 = 0
    for x in arr:
        current = max(prev1, prev2 + x)  # 不選與選此格取較大
        prev2, prev1 = prev1, current
    return prev1`,
        c: `int maxSubsetSum(int arr_count, int* arr) {
    int prev2 = 0, prev1 = 0;
    for (int i = 0; i < arr_count; i++) {
        int take = prev2 + arr[i];
        int current = prev1 > take ? prev1 : take;
        prev2 = prev1;
        prev1 = current;
    }
    return prev1;
}`,
        cpp: `int maxSubsetSum(vector<int> arr) {
    int prev2 = 0, prev1 = 0;
    for (int x : arr) {
        int current = max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = current;
    }
    return prev1;
}`,
        java: `public static int maxSubsetSum(List<Integer> arr) {
    return maxSubsetSum(arr.stream().mapToInt(Integer::intValue).toArray());
}
public static int maxSubsetSum(int[] arr) {
    int prev2 = 0, prev1 = 0;
    for (int x : arr) {
        int current = Math.max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = current;
    }
    return prev1;
}`,
        javascript: `function maxSubsetSum(arr) {
  let prev2 = 0;
  let prev1 = 0;
  for (const x of arr) {
    const current = Math.max(prev1, prev2 + x);
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}`,
      },
    },
  ],
  pitfalls: [
    '不能強迫選至少一個數；全負時答案是 0。',
    '選目前元素時只能加前兩格最佳，不可加前一格。',
    '更新狀態的順序要先算 current，否則會覆蓋仍需使用的 prev2。',
  ],
  check: {
    kind: 'fn', fn: 'maxSubsetSum', cases: [
      { args: [[-2, 1, 3, -4, 5]], out: 8 },
      { args: [[-2, -3, -1]], out: 0 },
      { args: [[5]], out: 5 },
      { args: [[-5]], out: 0 },
      { args: [[2, 2, 2, 2]], out: 4 },
      { args: [[3, 7, 4, 6, 5]], out: 13 },
    ],
  },
}
