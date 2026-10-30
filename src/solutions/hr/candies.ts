import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const rating = [4, 6, 4, 5, 6, 2]

function relaxFig(): FigStep[] {
  const out: FigStep[] = []
  const sweets = Array(rating.length).fill(1) as number[]
  let changed = true, round = 0
  while (changed) {
    changed = false
    round++
    for (let i = 0; i < rating.length; i++) {
      const need = Math.max(1, i && rating[i] > rating[i - 1] ? sweets[i - 1] + 1 : 1, i + 1 < rating.length && rating[i] > rating[i + 1] ? sweets[i + 1] + 1 : 1)
      if (need > sweets[i]) { sweets[i] = need; changed = true }
      out.push({ note: `第 ${round} 輪看位置 ${i}，評分 ${rating[i]}；相鄰較低者要求至少 ${need} 顆，現在分配 ${sweets[i]} 顆。`, views: [arr(rating, { label: '評分', highlight: [i] }), arr([...sweets], { label: '糖果', highlight: [i] })] })
    }
  }
  return out
}

function passesFig(): FigStep[] {
  const out: FigStep[] = []
  const sweets = Array(rating.length).fill(1) as number[]
  for (let i = 1; i < rating.length; i++) {
    if (rating[i] > rating[i - 1]) sweets[i] = sweets[i - 1] + 1
    out.push({ note: `左到右到 ${i}：${rating[i]} ${rating[i] > rating[i - 1] ? '高於' : '不高於'}左鄰，給 ${sweets[i]} 顆。`, views: [arr(rating, { label: '評分', highlight: [i, i - 1] }), arr([...sweets], { label: '糖果', highlight: [i] })] })
  }
  for (let i = rating.length - 2; i >= 0; i--) {
    if (rating[i] > rating[i + 1]) sweets[i] = Math.max(sweets[i], sweets[i + 1] + 1)
    out.push({ note: `右到左到 ${i}：右鄰有 ${sweets[i + 1]} 顆；本格取 ${sweets[i]}，兼顧左右限制。`, views: [arr(rating, { label: '評分', highlight: [i, i + 1] }), arr([...sweets], { label: '糖果', highlight: [i] })] })
  }
  return out
}

export const hrCandies: HrSolution = {
  slug: 'candies',
  plain: '像按表現給排成一列的小朋友分糖：每人至少一顆，表現比隔壁好的人必須拿更多，總數要最少。',
  statement: '輸入孩子數 n 與依座位順序排列的評分 arr。每人至少得一顆糖；若某人評分高於左或右鄰，糖果數也要嚴格多於那位鄰居。求符合所有相鄰條件的最小總糖數。相同評分沒有大小限制。',
  examples: [
    { input: 'n=6, arr=[4,6,4,5,6,2]', output: '10', note: '可分成 [1,2,1,2,3,1]，總共 10 顆。' },
    { input: 'n=3, arr=[1,2,2]', output: '4', note: '可分 [1,2,1]；相同評分的兩人不必一樣多。' },
  ],
  constraints: [
    'n 最多 10^5 → 反覆掃描到穩定在最壞情況會太慢。',
    '每人至少一顆 → 可先全設為 1，再補上必要的差距。',
    '答案可能超過 32 位元 → C、C++、Java 使用 64 位元加總。',
  ],
  insight: [
    '先全給一顆；若某人的評分高於鄰居但糖不夠，就增加到鄰居加一。反覆修正終會合法，但長坡可能多輪傳遞。',
    '左鄰造成的限制只需從左到右傳一次；右鄰造成的限制只需從右到左傳一次。',
    '第二遍使用 max 保留第一遍的成果，於是同時滿足兩側；這是 [[p:greedy]] 的局部最低分配，也可視為一維狀態傳播。',
  ],
  approaches: [
    {
      name: '反覆修正違規位置',
      idea: '從每人一顆開始，不斷把高評分者提高到比低評分鄰居多一顆。',
      steps: ['糖果陣列全部填 1。', '反覆掃描每人，分別檢查左右鄰居。', '若評分較高且糖果不夠，就增加到鄰居糖數加 1。', '整輪沒有改動時，加總糖果。'],
      figure: { title: 'arr=[4,6,4,5,6,2]', steps: relaxFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '最壞長度 n 的遞減坡需要 O(n) 輪，單輪掃描 O(n)；另存每人的糖果數。' },
      verdict: '好理解限制如何傳播，但長坡反覆修正太慢。',
      code: {
        python: `def candies(n, arr):
    sweets = [1] * n
    changed = True
    while changed:
        changed = False
        for i in range(n):
            need = 1
            if i > 0 and arr[i] > arr[i - 1]:
                need = max(need, sweets[i - 1] + 1)
            if i + 1 < n and arr[i] > arr[i + 1]:
                need = max(need, sweets[i + 1] + 1)
            if need > sweets[i]:
                sweets[i] = need  # 只增加到恰好符合鄰居限制
                changed = True
    return sum(sweets)`,
        c: `long long candies(int n, int arr_count, int* arr) {
    int* sweets = malloc(sizeof(int) * n);
    for (int i = 0; i < n; i++) sweets[i] = 1;
    int changed = 1;
    while (changed) {
        changed = 0;
        for (int i = 0; i < n; i++) {
            int need = 1;
            if (i > 0 && arr[i] > arr[i - 1] && sweets[i - 1] + 1 > need) need = sweets[i - 1] + 1;
            if (i + 1 < n && arr[i] > arr[i + 1] && sweets[i + 1] + 1 > need) need = sweets[i + 1] + 1;
            if (need > sweets[i]) {
                sweets[i] = need;
                changed = 1;
            }
        }
    }
    long long answer = 0;
    for (int i = 0; i < n; i++) answer += sweets[i];
    free(sweets);
    return answer;
}`,
        cpp: `long long candies(int n, vector<int> arr) {
    vector<int> sweets(n, 1);
    bool changed = true;
    while (changed) {
        changed = false;
        for (int i = 0; i < n; i++) {
            int need = 1;
            if (i > 0 && arr[i] > arr[i - 1]) need = max(need, sweets[i - 1] + 1);
            if (i + 1 < n && arr[i] > arr[i + 1]) need = max(need, sweets[i + 1] + 1);
            if (need > sweets[i]) {
                sweets[i] = need;
                changed = true;
            }
        }
    }
    return accumulate(sweets.begin(), sweets.end(), 0LL);
}`,
        java: `public static long candies(int n, List<Integer> arr) {
    int[] sweets = new int[n];
    java.util.Arrays.fill(sweets, 1);
    boolean changed = true;
    while (changed) {
        changed = false;
        for (int i = 0; i < n; i++) {
            int need = 1;
            if (i > 0 && arr.get(i) > arr.get(i - 1)) need = Math.max(need, sweets[i - 1] + 1);
            if (i + 1 < n && arr.get(i) > arr.get(i + 1)) need = Math.max(need, sweets[i + 1] + 1);
            if (need > sweets[i]) {
                sweets[i] = need;
                changed = true;
            }
        }
    }
    long answer = 0;
    for (int x : sweets) answer += x;
    return answer;
}`,
        javascript: `function candies(n, arr) {
  const sweets = Array(n).fill(1);
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < n; i++) {
      let need = 1;
      if (i > 0 && arr[i] > arr[i - 1]) need = Math.max(need, sweets[i - 1] + 1);
      if (i + 1 < n && arr[i] > arr[i + 1]) need = Math.max(need, sweets[i + 1] + 1);
      if (need > sweets[i]) {
        sweets[i] = need;
        changed = true;
      }
    }
  }
  return sweets.reduce((sum, x) => sum + x, 0);
}`,
      },
    },
    {
      name: '左右各掃描一次',
      idea: '第一遍滿足左鄰限制，第二遍滿足右鄰限制且保留前一遍已給的糖。',
      steps: ['建立全為 1 的糖果陣列。', '左到右：評分高於左鄰時，設為左鄰糖數加 1。', '右到左：評分高於右鄰時，與右鄰糖數加 1 取較大。', '加總並回傳。'],
      figure: { title: 'arr=[4,6,4,5,6,2]', steps: passesFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '兩遍各走 n 格，糖果陣列佔 n 格。' },
      verdict: '每個方向的限制各解一次，是適用大輸入的標準做法。',
      code: {
        python: `def candies(n, arr):
    sweets = [1] * n
    for i in range(1, n):
        if arr[i] > arr[i - 1]:
            sweets[i] = sweets[i - 1] + 1  # 先滿足左鄰
    for i in range(n - 2, -1, -1):
        if arr[i] > arr[i + 1]:
            sweets[i] = max(sweets[i], sweets[i + 1] + 1)  # 保留左邊限制
    return sum(sweets)`,
        c: `long long candies(int n, int arr_count, int* arr) {
    int* sweets = malloc(sizeof(int) * n);
    for (int i = 0; i < n; i++) sweets[i] = 1;
    for (int i = 1; i < n; i++) {
        if (arr[i] > arr[i - 1]) sweets[i] = sweets[i - 1] + 1;
    }
    for (int i = n - 2; i >= 0; i--) {
        if (arr[i] > arr[i + 1] && sweets[i] <= sweets[i + 1]) sweets[i] = sweets[i + 1] + 1;
    }
    long long answer = 0;
    for (int i = 0; i < n; i++) answer += sweets[i];
    free(sweets);
    return answer;
}`,
        cpp: `long long candies(int n, vector<int> arr) {
    vector<int> sweets(n, 1);
    for (int i = 1; i < n; i++) {
        if (arr[i] > arr[i - 1]) sweets[i] = sweets[i - 1] + 1;
    }
    for (int i = n - 2; i >= 0; i--) {
        if (arr[i] > arr[i + 1]) sweets[i] = max(sweets[i], sweets[i + 1] + 1);
    }
    return accumulate(sweets.begin(), sweets.end(), 0LL);
}`,
        java: `public static long candies(int n, List<Integer> arr) {
    int[] sweets = new int[n];
    java.util.Arrays.fill(sweets, 1);
    for (int i = 1; i < n; i++) {
        if (arr.get(i) > arr.get(i - 1)) sweets[i] = sweets[i - 1] + 1;
    }
    for (int i = n - 2; i >= 0; i--) {
        if (arr.get(i) > arr.get(i + 1)) sweets[i] = Math.max(sweets[i], sweets[i + 1] + 1);
    }
    long answer = 0;
    for (int x : sweets) answer += x;
    return answer;
}`,
        javascript: `function candies(n, arr) {
  const sweets = Array(n).fill(1);
  for (let i = 1; i < n; i++) {
    if (arr[i] > arr[i - 1]) sweets[i] = sweets[i - 1] + 1;
  }
  for (let i = n - 2; i >= 0; i--) {
    if (arr[i] > arr[i + 1]) sweets[i] = Math.max(sweets[i], sweets[i + 1] + 1);
  }
  return sweets.reduce((sum, x) => sum + x, 0);
}`,
      },
    },
  ],
  pitfalls: [
    '評分相等時沒有多一顆的要求，不能用 ≥ 判斷。',
    '右到左若直接覆蓋，可能破壞左到右已滿足的關係；要取最大值。',
    '最小總糖數不一定落在 32 位元整數範圍內。',
  ],
  check: {
    kind: 'fn', fn: 'candies', cases: [
      { args: [6, [4, 6, 4, 5, 6, 2]], out: 10 },
      { args: [3, [1, 2, 2]], out: 4 },
      { args: [1, [5]], out: 1 },
      { args: [4, [3, 3, 3, 3]], out: 4 },
      { args: [4, [4, 3, 2, 1]], out: 10 },
      { args: [3, [1, 3, 1]], out: 4 },
    ],
  },
}
