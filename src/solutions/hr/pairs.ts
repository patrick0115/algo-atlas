import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const SAMPLE = [1, 5, 3, 4, 2]

function searchFig(): FigStep[] {
  const steps: FigStep[] = []
  let answer = 0
  for (let i = 0; i < SAMPLE.length; i++) {
    for (let j = i + 1; j < SAMPLE.length; j++) {
      const gap = Math.abs(SAMPLE[i] - SAMPLE[j])
      if (gap === 2) answer++
      steps.push({
        note: `比較位置 ${i + 1} 的 ${SAMPLE[i]} 和位置 ${j + 1} 的 ${SAMPLE[j]}：差 ${gap}${gap === 2 ? '，符合，累計 ' + answer + ' 對' : '，不符合'}`,
        views: [arr(SAMPLE, { label: '原陣列', highlight: [i, j] }), kv([['目前配對數', answer]], '逐對檢查')],
      })
    }
  }
  return steps
}

function setFig(): FigStep[] {
  const steps: FigStep[] = []
  const seen = new Set<number>()
  let answer = 0
  for (let i = 0; i < SAMPLE.length; i++) {
    const x = SAMPLE[i]
    if (seen.has(x - 2)) answer++
    if (seen.has(x + 2)) answer++
    seen.add(x)
    steps.push({
      note: `讀到 ${x}；先找已看過的 ${x - 2} 與 ${x + 2}，配對數成為 ${answer}，再把 ${x} 放進集合，避免和自己配對。`,
      views: [arr(SAMPLE, { label: '掃描位置', highlight: [i], dim: SAMPLE.map((_, j) => j > i ? j : -1).filter(j => j >= 0) }), kv([...seen].map(v => [v, '已見']), '已見數字'), kv([['配對數', answer]], '結果')],
    })
  }
  return steps
}

export const hrPairs: HrSolution = {
  slug: 'pairs',
  plain: '像在桌上找兩張號碼牌，只要兩張相差剛好 k 就算一對；每對只記一次。',
  statement: '給整數 k 與互不重複的整數陣列 arr。計算有多少組不同元素的絕對差恰好為 k，回傳組數；元素在原陣列的先後順序不影響答案。',
  examples: [
    { input: 'k = 2, arr = [1,5,3,4,2]', output: '3', note: '符合的是 (1,3)、(3,5)、(2,4)。' },
    { input: 'k = 1, arr = [1,2,3,4]', output: '3', note: '連續相鄰的數值各形成一對，共三對。' },
  ],
  constraints: [
    '陣列最多 10^5 個值 → 逐對比較的 O(n²) 只適合小資料。',
    '數值互不重複，且 k > 0 → 每個數值配另一個數值時不必處理重複元素或自己配自己。',
  ],
  insight: [
    '先直接列出所有兩兩組合，對每組取絕對差，能確認「一對只算一次」的定義。',
    '固定一個 x 後，符合的另一端只可能是 x-k 或 x+k，沒有必要掃完整個陣列。',
    '把已讀過的值放進 [[p:hash-map]] 集合；新值出現時只查兩個候選值，每對恰好在第二個值到達時被計算。',
  ],
  approaches: [
    {
      name: '逐對列舉',
      idea: '用雙層迴圈把每組位置 i < j 都檢查一次。',
      steps: ['答案設為 0。', '固定 i，讓 j 從 i+1 走到尾端。', '若兩個值的絕對差等於 k，答案加一。'],
      figure: { title: 'k = 2，逐對檢查', steps: searchFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '共有 n(n-1)/2 組要比較，只用一個累計變數。' },
      verdict: '寫法最直觀，適合先確認配對定義，但大陣列會超時。',
      code: {
        python: `def pairs(k, arr):
    answer = 0
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            # 每組索引只比較一次
            if abs(arr[i] - arr[j]) == k:
                answer += 1
    return answer`,
        c: `int pairs(int k, int arr_count, int* arr) {
    int answer = 0;
    for (int i = 0; i < arr_count; i++) {
        for (int j = i + 1; j < arr_count; j++) {
            if (abs(arr[i] - arr[j]) == k) {
                answer++;
            }
        }
    }
    return answer;
}`,
        cpp: `int pairs(int k, vector<int> arr) {
    int answer = 0;
    for (int i = 0; i < (int)arr.size(); i++) {
        for (int j = i + 1; j < (int)arr.size(); j++) {
            if (abs(arr[i] - arr[j]) == k) {
                answer++;
            }
        }
    }
    return answer;
}`,
        java: `public static int pairs(int k, List<Integer> arr) {
    int answer = 0;
    for (int i = 0; i < arr.size(); i++) {
        for (int j = i + 1; j < arr.size(); j++) {
            if (Math.abs(arr.get(i) - arr.get(j)) == k) {
                answer++;
            }
        }
    }
    return answer;
}`,
        javascript: `function pairs(k, arr) {
  let answer = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (Math.abs(arr[i] - arr[j]) === k) {
        answer++;
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '集合查找',
      idea: '每讀到 x，只查已出現的 x-k 和 x+k。',
      steps: ['建立空集合 seen 和計數 answer。', '依序讀 x；若 seen 有 x-k，答案加一；若有 x+k，再加一。', '最後才將 x 放入 seen，回傳答案。'],
      figure: { title: 'k = 2，依序查候選值', steps: setFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個元素做兩次平均 O(1) 的集合查找，集合最多存 n 個值。' },
      verdict: '一次掃描即可解決；也可先建完整集合再只查 x+k。',
      code: {
        python: `def pairs(k, arr):
    seen = set()
    answer = 0
    for x in arr:
        # 只找已出現的兩個候選值
        if x - k in seen:
            answer += 1
        if x + k in seen:
            answer += 1
        seen.add(x)
    return answer`,
        c: `typedef struct { long long key; int used; } Slot;

/* 開放定址雜湊集合:用 x 算起始格,撞到就往後找下一格 */
int findSlot(Slot* table, int capacity, long long key) {
    unsigned long long h = (unsigned long long)key * 11400714819323198485ULL;
    int pos = (int)(h & (capacity - 1));
    while (table[pos].used && table[pos].key != key) pos = (pos + 1) & (capacity - 1);
    return pos;
}

int pairs(int k, int arr_count, int* arr) {
    int capacity = 1;
    while (capacity < arr_count * 2) capacity <<= 1;
    Slot* seen = calloc(capacity, sizeof(Slot));
    int answer = 0;
    for (int i = 0; i < arr_count; i++) {
        long long x = arr[i];
        if (seen[findSlot(seen, capacity, x - k)].used) answer++;
        if (seen[findSlot(seen, capacity, x + k)].used) answer++;
        int pos = findSlot(seen, capacity, x);
        seen[pos].used = 1;
        seen[pos].key = x;
    }
    free(seen);
    return answer;
}`,
        cpp: `int pairs(int k, vector<int> arr) {
    unordered_set<long long> seen;
    int answer = 0;
    for (long long x : arr) {  // x + k 可能超過 int
        if (seen.count(x - k)) answer++;
        if (seen.count(x + k)) answer++;
        seen.insert(x);
    }
    return answer;
}`,
        java: `public static int pairs(int k, List<Integer> arr) {
    Set<Long> seen = new HashSet<>();
    int answer = 0;
    for (long x : arr) {  // x + k 可能超過 int
        if (seen.contains(x - k)) answer++;
        if (seen.contains(x + k)) answer++;
        seen.add(x);
    }
    return answer;
}`,
        javascript: `function pairs(k, arr) {
  const seen = new Set();
  let answer = 0;
  for (const x of arr) {
    if (seen.has(x - k)) answer++;
    if (seen.has(x + k)) answer++;
    seen.add(x);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '只查 x+k 且只看已讀元素會漏掉先出現較大的那一對；要同時查兩個方向。',
    '先把 x 加入集合再查，遇到 k=0 會把自己算進去；查完才加入更安全。',
    '計的是元素配對，不是不同的差值；[1,2,3] 且 k=1 的答案是 2。',
  ],
  check: {
    kind: 'fn',
    fn: 'pairs',
    cases: [
      { args: [999999999, [2147483646, 1147483647]], out: 1 },
      { args: [2, [1, 5, 3, 4, 2]], out: 3 },
      { args: [1, [1, 2, 3, 4]], out: 3 },
      { args: [3, [1, 4]], out: 1 },
      { args: [5, [1, 2]], out: 0 },
      { args: [2, [5, 3, 1]], out: 2 },
      { args: [10, [-5, 5, 15]], out: 2 },
    ],
  },
}
