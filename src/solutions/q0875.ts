import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 875. Koko Eating Bananas

const PILES = [3, 6, 7, 11]
const H = 8

const hours = (k: number) => PILES.reduce((s, p) => s + Math.ceil(p / k), 0)

function linearFig(): FigStep[] {
  const out: FigStep[] = [{ note: `速度 k = 每小時最多吃 k 根;一堆 p 根要 ⌈p / k⌉ 小時(吃不完那堆也不會換下一堆)。從 k = 1 開始一個一個試,第一個能在 ${H} 小時內吃完的就是答案`, views: [arr(PILES, { label: 'piles', mode: 'bars' })] }]
  for (let k = 1; k <= Math.max(...PILES); k++) {
    const h = hours(k)
    out.push({ note: `k = ${k}:每堆要 ${PILES.map((p) => Math.ceil(p / k)).join(' + ')} = ${h} 小時 ${h <= H ? `≤ ${H} → 答案是 ${k}` : `> ${H},太慢`}`, views: [arr(PILES.map((p) => Math.ceil(p / k)), { label: `k = ${k} 時每堆要幾小時`, highlight: h <= H ? range(0, PILES.length - 1) : [] })] })
    if (h <= H) break
  }
  return out
}

function bsFig(): FigStep[] {
  const mx = Math.max(...PILES)
  let lo = 1
  let hi = mx
  const ks = range(1, mx)
  const out: FigStep[] = [{ note: `關鍵:速度越快,花的時間只會越少(單調)。所以「能不能在 ${H} 小時內吃完」會是 ✗✗✗…✓✓✓,要找的是第一個 ✓ → 對速度二分`, views: [arr(ks.map((k) => (hours(k) <= H ? '✓' : '✗')), { label: '速度 1 ~ max 能不能吃完(一般不會先算出來,這裡只是示意)' })] }]
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    const h = hours(mid)
    const ok = h <= H
    out.push({ note: `試 k = ${mid}:要 ${h} 小時 ${ok ? `≤ ${H} → 吃得完,答案 ≤ ${mid},hi = mid` : `> ${H} → 太慢,答案 > ${mid},lo = mid + 1`}`, views: [arr(ks, { label: '候選速度', range: [lo - 1, hi - 1], compare: [mid - 1] })] })
    if (ok) hi = mid
    else lo = mid + 1
  }
  out.push({ note: `lo == hi = ${lo} → 最小的速度是 ${lo}`, views: [arr(ks, { label: '候選速度', highlight: [lo - 1] })] })
  return out
}

export const q0875: Solution = {
  id: 875,
  plain: 'Koko 要在 h 小時內吃完幾堆香蕉。她每小時挑一堆吃 k 根(那堆不足 k 根就吃完那堆,這小時就結束)。找出能準時吃完的**最慢**速度 k。',
  statement: '有 n 堆香蕉 `piles[i]`,警衛 `h` 小時後回來。Koko 選一個速度 k:每小時挑一堆吃掉 k 根,那堆不到 k 根就吃完那堆(這一小時不會再吃別堆)。回傳能在 h 小時內吃完的**最小** k。',
  examples: [
    { input: 'piles = [3,6,7,11], h = 8', output: '4', note: 'k = 4:1 + 2 + 2 + 3 = 8 小時' },
    { input: 'piles = [30,11,23,4,20], h = 5', output: '30' },
    { input: 'piles = [30,11,23,4,20], h = 6', output: '23' },
  ],
  constraints: ['`n ≤ h ≤ 10⁹`,`piles[i] ≤ 10⁹` → 速度從 1 試到 10⁹ 太慢', '速度至少 1、最多 max(piles)(再快也沒用,每堆最少也要 1 小時)'],
  insight: [
    '給定速度 k,吃完要 `Σ ⌈p / k⌉` 小時,O(n) 就能算',
    '速度越快,時間不會變多 —— **單調性**。所以「速度 k 能不能吃完」是 ✗✗…✗✓✓…✓ 的形狀',
    '要找第一個 ✓ → 在答案的範圍 [1, max(piles)] 上**二分搜尋**。這叫「對答案二分」:不是在陣列裡找,而是猜答案、驗證、縮小範圍',
  ],
  approaches: [
    {
      name: '從 1 開始一個一個試',
      idea: '`k = 1, 2, 3, …`,第一個 `hours(k) ≤ h` 的就是答案。',
      steps: ['`hours(k) = Σ ⌈p / k⌉`', '`k` 從 1 往上:`hours(k) <= h` → 回傳 k'],
      figure: { title: `piles = [${PILES.join(',')}], h = ${H}`, steps: linearFig() },
      complexity: { time: 'O(n · max(p))', space: 'O(1)', why: '最多試 max(p) 個速度,每個 O(n)。max(p) 到 10⁹,會超時。' },
      verdict: '確認「算時間」的寫法沒問題。答案很大時太慢。',
      code: {
        python: `def minEatingSpeed(piles, h):
    k = 1
    while sum((p + k - 1) // k for p in piles) > h:   # (p + k - 1) // k 就是 ceil(p / k)
        k += 1
    return k`,
        c: `int minEatingSpeed(int *piles, int pilesSize, int h) {
    for (int k = 1;; k++) {
        long long t = 0;
        for (int i = 0; i < pilesSize; i++) t += (piles[i] + k - 1) / k;
        if (t <= h) return k;
    }
}`,
        cpp: `int minEatingSpeed(vector<int>& piles, int h) {
    for (int k = 1;; k++) {
        long long t = 0;
        for (int p : piles) t += (p + k - 1) / k;
        if (t <= h) return k;
    }
}`,
        java: `int minEatingSpeed(int[] piles, int h) {
    for (int k = 1;; k++) {
        long t = 0;
        for (int p : piles) t += (p + k - 1) / k;
        if (t <= h) return k;
    }
}`,
        javascript: `function minEatingSpeed(piles, h) {
  for (let k = 1; ; k++) {
    let t = 0;
    for (const p of piles) t += Math.ceil(p / k);
    if (t <= h) return k;
  }
}`,
      },
    },
    {
      name: '對速度二分搜尋',
      idea: '答案在 `[1, max(piles)]`。猜中間的 mid:吃得完 → 答案 ≤ mid(`hi = mid`);吃不完 → 答案 > mid(`lo = mid + 1`)。',
      steps: ['`lo = 1`、`hi = max(piles)`', '`while lo < hi`:`mid = (lo + hi) / 2`', '`hours(mid) <= h` → `hi = mid`,否則 `lo = mid + 1`', '回傳 `lo`'],
      figure: { title: `piles = [${PILES.join(',')}], h = ${H}`, steps: bsFig() },
      complexity: { time: 'O(n · log max(p))', space: 'O(1)', why: '二分約 30 次(log₂ 10⁹),每次 O(n) 算時間。' },
      verdict: '標準解,[[p:binary-search-answer]]的代表題。看到「求最小的 X 使得某條件成立」而且條件有單調性,就想到對答案二分:1011、410、1482、2187 都是。',
      code: {
        python: `def minEatingSpeed(piles, h):
    def hours(k):
        return sum((p + k - 1) // k for p in piles)

    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if hours(mid) <= h:
            hi = mid                      # 吃得完:可能還能更慢
        else:
            lo = mid + 1                  # 吃不完:一定要更快
    return lo`,
        c: `int minEatingSpeed(int *piles, int pilesSize, int h) {
    int lo = 1, hi = 1;
    for (int i = 0; i < pilesSize; i++) if (piles[i] > hi) hi = piles[i];
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        long long t = 0;                      // 總時數可能超過 int
        for (int i = 0; i < pilesSize; i++) t += (piles[i] + (long long)mid - 1) / mid;
        if (t <= h) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        cpp: `int minEatingSpeed(vector<int>& piles, int h) {
    int lo = 1, hi = *max_element(piles.begin(), piles.end());
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        long long t = 0;
        for (int p : piles) t += (p + (long long)mid - 1) / mid;
        if (t <= h) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        java: `int minEatingSpeed(int[] piles, int h) {
    int lo = 1, hi = 0;
    for (int p : piles) hi = Math.max(hi, p);
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        long t = 0;
        for (int p : piles) t += (p + (long) mid - 1) / mid;
        if (t <= h) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        javascript: `function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    let t = 0;
    for (const p of piles) t += Math.ceil(p / mid);
    if (t <= h) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      },
    },
  ],
  pitfalls: [
    '用 `p / k` 整數除法(往下取整):7 根、速度 4 要 2 小時不是 1 小時,要**往上取整** `(p + k − 1) / k`',
    '總時數用 int:10⁴ 堆、每堆 10⁹ 根、速度 1 時總時數到 10¹³,要用 long',
    '`p + k − 1` 在 p 接近 2³¹ 時也可能溢位,C / Java 先轉成 long 再加',
    '下界從 0 開始:速度 0 會除以零',
  ],
  followUp: [{ q: '同類型「對答案二分」的題?', a: '1011. Capacity To Ship Packages(船的最小載重)、410. Split Array Largest Sum、1482. 最少要等幾天才能做 m 束花。' }],
  check: {
    kind: 'fn',
    fn: 'minEatingSpeed',
    cases: [
      { args: [PILES, H], out: 4 },
      { args: [[30, 11, 23, 4, 20], 5], out: 30 },
      { args: [[30, 11, 23, 4, 20], 6], out: 23 },
      { args: [[1], 1], out: 1 },
      { args: [[100, 50], 3], out: 50 },
      { args: [[312884470], 968709470], out: 1 },
    ],
  },
}
