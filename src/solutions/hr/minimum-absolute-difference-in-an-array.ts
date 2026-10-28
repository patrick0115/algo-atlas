import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const VALUES = [3, -7, 0]

function bruteFig(): FigStep[] {
  const steps: FigStep[] = []
  let best = Infinity
  for (let i = 0; i < VALUES.length; i++) {
    for (let j = i + 1; j < VALUES.length; j++) {
      const diff = Math.abs(VALUES[i] - VALUES[j])
      best = Math.min(best, diff)
      steps.push({ note: `比較 ${VALUES[i]} 和 ${VALUES[j]}：距離 ${diff}，目前最小距離 ${best}。`, views: [arr(VALUES, { label: '原始數列', highlight: [i, j] }), kv([['本次差距', diff], ['目前最小', best]], '兩兩比較')] })
    }
  }
  return steps
}

function sortedFig(): FigStep[] {
  const sorted = [...VALUES].sort((a, b) => a - b)
  const steps: FigStep[] = [{ note: `把數值由小到大排好：${sorted.join('、')}。距離最短的兩個值一定相鄰。`, views: [arr(sorted, { label: '排序結果' })] }]
  let best = Infinity
  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i] - sorted[i - 1]
    best = Math.min(best, diff)
    steps.push({ note: `相鄰的 ${sorted[i - 1]} 與 ${sorted[i]} 差 ${diff}；把最小值更新成 ${best}。`, views: [arr(sorted, { label: '相鄰元素', highlight: [i - 1, i] }), kv([['本次差距', diff], ['目前最小', best]], '掃描狀態')] })
  }
  steps.push({ note: `所有相鄰距離都比完了，答案為 ${best}；隔著其他數的兩點不可能更近。`, views: [kv([['答案', best]], '最短距離')] })
  return steps
}

export const hrMinimumAbsoluteDifferenceInAnArray: HrSolution = {
  slug: 'minimum-absolute-difference-in-an-array',
  plain: '把幾個人在數線上排隊，找站得最近的兩人；排好順序後只需看隔壁。',
  statement: '輸入至少兩個整數的陣列 arr。選任意兩個不同位置，計算兩數差的絕對值；回傳所有配對中最小的差。',
  examples: [
    { input: 'arr = [3,-7,0]', output: '3', note: '0 與 3 的距離是 3，小於另兩組。' },
    { input: 'arr = [-59,-36,-13,1,-53,-92,-2,-96,-54,75]', output: '1', note: '-54 和 -53 相差 1。' },
  ],
  constraints: [
    '陣列可能有約 10^5 個元素 → O(n²) 的逐對檢查不適用。',
    '數值可能是負的 → 比較時需要絕對差，排序後的右減左則必定非負。',
  ],
  insight: [
    '先用雙層迴圈列出每一組，維護最小絕對差，確認要找的是任意兩個位置。',
    '若把數值由小到大排列，兩個不相鄰的值之間一定夾著另一個值；夾在中間的值和其中一端更近或一樣近。',
    '因此只要排序後逐個比較相鄰差值，這是 [[p:greedy]] 的局部觀察，也和 [1200](#/q/1200) 的核心相同。',
  ],
  approaches: [
    {
      name: '所有兩數逐對比較',
      idea: '把每一組 i < j 的絕對差都算出來，保留最小值。',
      steps: ['答案先設為無限大。', '固定 i，讓 j 從 i+1 走到尾端。', '用兩數絕對差更新答案。'],
      figure: { title: '[3,-7,0] 的全部配對', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '共有 n(n-1)/2 對，只需要一個最小值變數。' },
      verdict: '容易寫，但 n 大時比較次數太多。',
      code: {
        python: `def minimumAbsoluteDifference(arr):
    best = float('inf')
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            # 每對位置只算一次
            best = min(best, abs(arr[i] - arr[j]))
    return best`,
        c: `int minimumAbsoluteDifference(int arr_count, int* arr) {
    int best = INT_MAX;
    for (int i = 0; i < arr_count; i++) {
        for (int j = i + 1; j < arr_count; j++) {
            long long d = llabs((long long)arr[i] - arr[j]);
            if (d < best) best = (int)d;
        }
    }
    return best;
}`,
        cpp: `int minimumAbsoluteDifference(vector<int> arr) {
    long long best = LLONG_MAX;
    for (int i = 0; i < (int)arr.size(); i++) {
        for (int j = i + 1; j < (int)arr.size(); j++) {
            best = min(best, llabs((long long)arr[i] - arr[j]));  // 相減可到 2·10^9,先轉 64 位元
        }
    }
    return (int)best;
}`,
        java: `public static int minimumAbsoluteDifference(List<Integer> arr) {
    long best = Long.MAX_VALUE;
    for (int i = 0; i < arr.size(); i++) {
        for (int j = i + 1; j < arr.size(); j++) {
            best = Math.min(best, Math.abs((long) arr.get(i) - arr.get(j)));  // 相減可到 2·10^9
        }
    }
    return (int) best;
}`,
        javascript: `function minimumAbsoluteDifference(arr) {
  let best = Infinity;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      best = Math.min(best, Math.abs(arr[i] - arr[j]));
    }
  }
  return best;
}`,
      },
    },
    {
      name: '排序後只看鄰居',
      idea: '最近的一對在排序序列中一定相鄰。',
      steps: ['先將 arr 升冪排序。', '從第二個值開始，計算它與前一個值的差。', '不斷更新最小差值，掃完回傳。'],
      figure: { title: '[3,-7,0] 排序後的相鄰差', steps: sortedFig() },
      complexity: { time: 'O(n log n)', space: 'O(n) 或依排序器而定', why: '排序主導時間；複製陣列或排序器可能用到額外記憶體。' },
      verdict: '適合大資料；核心證明是中間值不可能比兩端都更遠。',
      code: {
        python: `def minimumAbsoluteDifference(arr):
    arr.sort()
    best = float('inf')
    for i in range(1, len(arr)):
        # 最近的一對一定在排序後相鄰
        best = min(best, arr[i] - arr[i - 1])
    return best`,
        c: `int compareInt(const void* a, const void* b) {
    int x = *(const int*)a;
    int y = *(const int*)b;
    return (x > y) - (x < y);
}

int minimumAbsoluteDifference(int arr_count, int* arr) {
    qsort(arr, arr_count, sizeof(int), compareInt);
    long long best = LLONG_MAX;
    for (int i = 1; i < arr_count; i++) {
        long long d = (long long)arr[i] - arr[i - 1];  // 相減可到 2·10^9,先轉 64 位元
        if (d < best) best = d;
    }
    return (int)best;
}`,
        cpp: `int minimumAbsoluteDifference(vector<int> arr) {
    sort(arr.begin(), arr.end());
    long long best = LLONG_MAX;
    for (int i = 1; i < (int)arr.size(); i++) {
        best = min(best, (long long)arr[i] - arr[i - 1]);  // 相減可到 2·10^9
    }
    return (int)best;
}`,
        java: `public static int minimumAbsoluteDifference(List<Integer> arr) {
    Collections.sort(arr);
    long best = Long.MAX_VALUE;
    for (int i = 1; i < arr.size(); i++) {
        best = Math.min(best, (long) arr.get(i) - arr.get(i - 1));  // 相減可到 2·10^9
    }
    return (int) best;
}`,
        javascript: `function minimumAbsoluteDifference(arr) {
  arr.sort((a, b) => a - b);
  let best = Infinity;
  for (let i = 1; i < arr.length; i++) {
    best = Math.min(best, arr[i] - arr[i - 1]);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    'JavaScript sort 預設按字串排，必須提供數字比較函式。',
    '排序後要比較相鄰兩值，不要把最小值或最大值固定當一端。',
    '負數和正數可以形成最小差，不能只在同號數字間比較。',
  ],
  followUp: [
    { q: '若還要回傳所有達到最小差的配對呢？', a: '排序後先找最小相鄰差，再掃一次相鄰元素；差等於最小值的每一對都加入答案。' },
  ],
  check: {
    kind: 'fn',
    fn: 'minimumAbsoluteDifference',
    cases: [
      { args: [[-1000000000, 0, 1000000000]], out: 1000000000 },
      { args: [[3, -7, 0]], out: 3 },
      { args: [[-59, -36, -13, 1, -53, -92, -2, -96, -54, 75]], out: 1 },
      { args: [[1, -1]], out: 2 },
      { args: [[5, 5]], out: 0 },
      { args: [[4, 2, 1, 3]], out: 1 },
      { args: [[100, 1, 50]], out: 49 },
    ],
  },
}
