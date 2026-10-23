import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2300. Successful Pairs of Spells and Potions

const SP = [5, 1, 3]
const PO = [1, 2, 3, 4, 5]
const SUCCESS = 7

function bsFig(): FigStep[] {
  const p = [...PO].sort((a, b) => a - b)
  const m = p.length
  const out: FigStep[] = [{ note: `藥水先排序。對每個咒語 s,要找「s × 藥水 ≥ ${SUCCESS}」的藥水:排序後它們一定是**後面連續一段**,找到第一個夠強的位置就能直接算出個數`, views: [arr(p, { label: 'potions(排序後)' })] }]
  for (const s of SP) {
    const need = Math.ceil(SUCCESS / s)
    let lo = 0
    let hi = m
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (s * p[mid] >= SUCCESS) hi = mid
      else lo = mid + 1
    }
    out.push({ note: `咒語 ${s}:藥水至少要 ⌈${SUCCESS}/${s}⌉ = ${need}。二分找到第一個 ≥ ${need} 的位置 ${lo} → 成功的有 ${m} − ${lo} = ${m - lo} 瓶`, views: [arr(p, { label: `potions(咒語 ${s})`, done: Array.from({ length: m - lo }, (_, i) => lo + i), dim: Array.from({ length: lo }, (_, i) => i), pointers: lo < m ? [{ name: '第一個成功', index: lo }] : [] })] })
  }
  return out
}

function twoPtrFig(): FigStep[] {
  const p = [...PO].sort((a, b) => a - b)
  const order = SP.map((s, i) => [s, i]).sort((a, b) => a[0] - b[0])
  const res = Array(SP.length).fill(0)
  let j = p.length
  const out: FigStep[] = [{ note: '咒語也排序(記住原本的位置)。咒語越強,需要的藥水門檻越低 → 「第一個成功的藥水」只會往左移', views: [arr(order.map((o) => o[0]), { label: '咒語(由弱到強)' }), arr(p, { label: 'potions' })] }]
  for (const [s, idx] of order) {
    while (j > 0 && s * p[j - 1] >= SUCCESS) j--
    res[idx] = p.length - j
    out.push({ note: `咒語 ${s}:指標往左移到 ${j}(左邊那瓶 × ${s} 就不夠了)→ ${p.length - j} 瓶,填回原本位置 ${idx}`, views: [arr(p, { label: 'potions', done: Array.from({ length: p.length - j }, (_, i) => j + i), pointers: j < p.length ? [{ name: 'j', index: j }] : [] }), arr([...res], { label: '答案', highlight: [idx] })] })
  }
  return out
}

export const q2300: Solution = {
  id: 2300,
  plain: '每個咒語有一個強度,每瓶藥水也有強度。咒語配藥水,強度相乘夠大就算成功。對每個咒語,問有幾瓶藥水能和它成功配對。',
  statement: '給 `spells`(長度 n)、`potions`(長度 m)和 `success`。咒語 i 與藥水 j 的強度乘積 ≥ success 時配對成功。回傳長度 n 的陣列,第 i 個是能與咒語 i 成功配對的藥水數。',
  examples: [
    { input: 'spells = [5,1,3], potions = [1,2,3,4,5], success = 7', output: '[4,0,3]' },
    { input: 'spells = [3,1,2], potions = [8,5,8], success = 16', output: '[2,0,2]' },
  ],
  constraints: ['n, m ≤ 10⁵ → 兩兩相乘 O(n·m) 太慢', '強度 ≤ 10⁵,success ≤ 10¹⁰ → 乘積要用 64 位元'],
  insight: ['固定咒語 s 時,條件是「藥水 ≥ success / s」→ 藥水排序後,成功的是後面一段', '二分搜尋找第一個成功的位置,個數 = m − 位置', '或者咒語也排序:咒語越強門檻越低,指標只往一個方向動'],
  approaches: [
    {
      name: '藥水排序 + 二分搜尋',
      idea: '排序 potions;每個 s 二分找第一個 `s · p ≥ success` 的索引 i,答案 `m − i`。',
      steps: ['排序 potions', '每個 s:`lo, hi = 0, m`;二分找第一個 `s * potions[mid] >= success`', '答案 `m − lo`'],
      figure: { title: `spells = [${SP}],potions = [${PO}],success = ${SUCCESS}`, steps: bsFig() },
      complexity: { time: 'O((n + m) log m)', space: 'O(1) ~ O(m)', why: '排序 m log m;每個咒語二分 log m。' },
      verdict: '最推薦。[[p:binary-search]]的「找第一個滿足條件的位置」,條件寫成乘法避免浮點除法。',
      code: {
        python: `def successfulPairs(spells, potions, success):
    potions.sort()
    m, res = len(potions), []
    for s in spells:
        lo, hi = 0, m
        while lo < hi:                        # 找第一個 s * p >= success 的位置
            mid = (lo + hi) // 2
            if s * potions[mid] >= success:
                hi = mid
            else:
                lo = mid + 1
        res.append(m - lo)
    return res`,
        c: `static int cmp(const void *a, const void *b) { return *(int *)a - *(int *)b; }

int *successfulPairs(int *spells, int spellsSize, int *potions, int potionsSize, long long success, int *returnSize) {
    qsort(potions, potionsSize, sizeof(int), cmp);
    int *res = malloc(spellsSize * sizeof(int));
    for (int i = 0; i < spellsSize; i++) {
        int lo = 0, hi = potionsSize;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if ((long long)spells[i] * potions[mid] >= success) hi = mid;
            else lo = mid + 1;
        }
        res[i] = potionsSize - lo;
    }
    *returnSize = spellsSize;
    return res;
}`,
        cpp: `vector<int> successfulPairs(vector<int>& spells, vector<int>& potions, long long success) {
    sort(potions.begin(), potions.end());
    vector<int> res;
    for (long long s : spells) {
        // 第一個 p >= ceil(success / s) 的位置
        long long need = (success + s - 1) / s;
        res.push_back(potions.end() - lower_bound(potions.begin(), potions.end(), need));
    }
    return res;
}`,
        java: `int[] successfulPairs(int[] spells, int[] potions, long success) {
    Arrays.sort(potions);
    int m = potions.length;
    int[] res = new int[spells.length];
    for (int i = 0; i < spells.length; i++) {
        int lo = 0, hi = m;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if ((long) spells[i] * potions[mid] >= success) hi = mid;
            else lo = mid + 1;
        }
        res[i] = m - lo;
    }
    return res;
}`,
        javascript: `function successfulPairs(spells, potions, success) {
  potions.sort((a, b) => a - b);
  const m = potions.length;
  return spells.map((s) => {
    let lo = 0, hi = m;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (s * potions[mid] >= success) hi = mid;
      else lo = mid + 1;
    }
    return m - lo;
  });
}`,
      },
    },
    {
      name: '兩邊都排序 + 單向指標',
      idea: '咒語依強度由弱到強處理(記住原索引);指標 j 從 m 往左移到「左邊那瓶不夠」為止,答案 `m − j`。',
      steps: ['potions 排序;咒語的索引依強度排序', '`j = m`', '依序處理咒語 s:`while j > 0 and s * potions[j−1] >= success`:`j -= 1`', '`res[原索引] = m − j`'],
      figure: { title: `spells = [${SP}],potions = [${PO}],success = ${SUCCESS}`, steps: twoPtrFig() },
      complexity: { time: 'O(n log n + m log m)', space: 'O(n)', why: '兩次排序;指標總共最多移 m 次。' },
      verdict: '排序之後的配對是線性的。漸進複雜度和二分差不多,示範「單調性 → 指標只往一個方向動」。',
      code: {
        python: `def successfulPairs(spells, potions, success):
    potions.sort()
    m = len(potions)
    res = [0] * len(spells)
    j = m
    for i in sorted(range(len(spells)), key=lambda i: spells[i]):   # 咒語由弱到強
        while j > 0 and spells[i] * potions[j - 1] >= success:
            j -= 1                            # 咒語更強,門檻更低,j 只會往左
        res[i] = m - j
    return res`,
        c: `static int *SP_;
static int cmpv(const void *a, const void *b) { return *(int *)a - *(int *)b; }
static int cmpi(const void *a, const void *b) { return SP_[*(int *)a] - SP_[*(int *)b]; }

int *successfulPairs(int *spells, int spellsSize, int *potions, int potionsSize, long long success, int *returnSize) {
    qsort(potions, potionsSize, sizeof(int), cmpv);
    int *idx = malloc(spellsSize * sizeof(int)), *res = malloc(spellsSize * sizeof(int));
    for (int i = 0; i < spellsSize; i++) idx[i] = i;
    SP_ = spells;
    qsort(idx, spellsSize, sizeof(int), cmpi);
    int j = potionsSize;
    for (int t = 0; t < spellsSize; t++) {
        int i = idx[t];
        while (j > 0 && (long long)spells[i] * potions[j - 1] >= success) j--;
        res[i] = potionsSize - j;
    }
    free(idx);
    *returnSize = spellsSize;
    return res;
}`,
        cpp: `vector<int> successfulPairs(vector<int>& spells, vector<int>& potions, long long success) {
    sort(potions.begin(), potions.end());
    int n = spells.size(), m = potions.size(), j = m;
    vector<int> idx(n), res(n);
    iota(idx.begin(), idx.end(), 0);
    sort(idx.begin(), idx.end(), [&](int a, int b) { return spells[a] < spells[b]; });
    for (int i : idx) {
        while (j > 0 && (long long)spells[i] * potions[j - 1] >= success) j--;
        res[i] = m - j;
    }
    return res;
}`,
        java: `int[] successfulPairs(int[] spells, int[] potions, long success) {
    Arrays.sort(potions);
    int n = spells.length, m = potions.length, j = m;
    Integer[] idx = new Integer[n];
    for (int i = 0; i < n; i++) idx[i] = i;
    Arrays.sort(idx, (a, b) -> spells[a] - spells[b]);
    int[] res = new int[n];
    for (int i : idx) {
        while (j > 0 && (long) spells[i] * potions[j - 1] >= success) j--;
        res[i] = m - j;
    }
    return res;
}`,
        javascript: `function successfulPairs(spells, potions, success) {
  potions.sort((a, b) => a - b);
  const m = potions.length, res = new Array(spells.length);
  const idx = spells.map((_, i) => i).sort((a, b) => spells[a] - spells[b]);
  let j = m;
  for (const i of idx) {
    while (j > 0 && spells[i] * potions[j - 1] >= success) j--;
    res[i] = m - j;
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['乘積用 int:10⁵ × 10⁵ = 10¹⁰ 溢位', '用 `success / s` 的浮點數當門檻:要嘛用乘法比較,要嘛用整數的無條件進位 `(success + s − 1) / s`'],
  check: {
    kind: 'fn',
    fn: 'successfulPairs',
    cases: [
      { args: [SP, PO, SUCCESS], out: [4, 0, 3] },
      { args: [[3, 1, 2], [8, 5, 8], 16], out: [2, 0, 2] },
      { args: [[100000], [100000], 10000000000], out: [1] },
      { args: [[1, 2], [1], 3], out: [0, 0] },
    ],
  },
}
