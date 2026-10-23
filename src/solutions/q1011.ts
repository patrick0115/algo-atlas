import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1011. Capacity To Ship Packages Within D Days

const W = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const D = 5

function days(cap: number): number {
  let d = 1
  let cur = 0
  for (const w of W) {
    if (cur + w > cap) {
      d++
      cur = 0
    }
    cur += w
  }
  return d
}

function bsFig(): FigStep[] {
  let lo = Math.max(...W)
  let hi = W.reduce((a, b) => a + b, 0)
  const out: FigStep[] = [{ note: `船的載重 c 越大,需要的天數越少(單調)→ 二分搜尋答案。範圍:至少要載得動最重的 ${lo},最多一天載完 ${hi}`, views: [arr(W, { label: 'weights(必須照順序)' })] }]
  while (lo < hi) {
    const m = (lo + hi) >> 1
    const d = days(m)
    out.push({ note: `c = ${m}:照順序裝,裝不下就換下一天 → 需要 ${d} 天 ${d <= D ? `≤ ${D},可以,hi = ${m}` : `> ${D},太小,lo = ${m + 1}`}`, views: [arr([lo, m, hi], { label: 'lo / c / hi', highlight: [1] })] })
    if (d <= D) hi = m
    else lo = m + 1
  }
  out.push({ note: `答案 ${lo}:[1,2,3,4,5] [6,7] [8] [9] [10]`, views: [arr([lo], { label: '最小載重', done: [0] })] })
  return out
}

function linFig(): FigStep[] {
  return [
    { note: '暴力:載重從 max(weights) 開始一個一個往上試,第一個能在 D 天內運完的就是答案', views: [arr([10, 11, 12, 13, 14, 15], { label: '依序嘗試', dim: [0, 1, 2, 3, 4] })] },
    { note: '最壞要試 sum − max 次,每次 O(n)。二分就是把「一個一個試」換成「每次砍半」', views: [arr([15], { label: '答案', done: [0] })] },
  ]
}

export const q1011: Solution = {
  id: 1011,
  plain: '一條輸送帶上有一排包裹,要在 days 天內按照順序全部運走,每天裝一船。船的載重上限至少要多少才夠?',
  statement: '`weights[i]` 是第 i 個包裹的重量,必須依序裝船;每天的總重不能超過船的載重。回傳能在 `days` 天內運完所有包裹的**最小載重**。',
  examples: [
    { input: 'weights = [1,2,3,4,5,6,7,8,9,10], days = 5', output: '15' },
    { input: 'weights = [3,2,2,4,1,4], days = 3', output: '6' },
    { input: 'weights = [1,2,3,1,1], days = 4', output: '3' },
  ],
  constraints: ['n ≤ 5·10⁴,重量 ≤ 500'],
  insight: ['給定載重 c,可以貪心算出需要幾天:一直裝,裝不下就換下一天', 'c 越大天數越少 → 單調 → 二分搜尋最小可行的 c', '下界是最重的包裹,上界是全部重量的和'],
  approaches: [
    {
      name: '二分搜尋答案 + 貪心檢查',
      idea: '`lo = max(w)`、`hi = sum(w)`;`days(m) <= D` → `hi = m`,否則 `lo = m + 1`。',
      steps: ['`need(c)`:`d = 1`、`cur = 0`;每個 w:`cur + w > c` → `d += 1`、`cur = 0`;`cur += w`', '`lo, hi = max(w), sum(w)`', '`while lo < hi`:`m = (lo + hi) // 2`;`need(m) <= days` → `hi = m`,否則 `lo = m + 1`', '回傳 lo'],
      figure: { title: `weights = [${W}],days = ${D}`, steps: bsFig() },
      complexity: { time: 'O(n log(sum))', space: 'O(1)', why: '二分 log(sum) 次,每次掃一遍。' },
      verdict: '最推薦,[[p:binary-search-answer]]的模板題,和 [875](#/q/875)(吃香蕉)同一個結構。',
      code: {
        python: `def shipWithinDays(weights, days):
    def need(cap):                            # 載重 cap 時要幾天
        d, cur = 1, 0
        for w in weights:
            if cur + w > cap:
                d += 1                        # 裝不下,換下一天
                cur = 0
            cur += w
        return d

    lo, hi = max(weights), sum(weights)
    while lo < hi:
        m = (lo + hi) // 2
        if need(m) <= days:
            hi = m
        else:
            lo = m + 1
    return lo`,
        c: `static int need(int *w, int n, int cap) {
    int d = 1, cur = 0;
    for (int i = 0; i < n; i++) {
        if (cur + w[i] > cap) { d++; cur = 0; }
        cur += w[i];
    }
    return d;
}

int shipWithinDays(int *weights, int weightsSize, int days) {
    int lo = 0, hi = 0;
    for (int i = 0; i < weightsSize; i++) { if (weights[i] > lo) lo = weights[i]; hi += weights[i]; }
    while (lo < hi) {
        int m = lo + (hi - lo) / 2;
        if (need(weights, weightsSize, m) <= days) hi = m;
        else lo = m + 1;
    }
    return lo;
}`,
        cpp: `int shipWithinDays(vector<int>& weights, int days) {
    auto need = [&](int cap) {
        int d = 1, cur = 0;
        for (int w : weights) {
            if (cur + w > cap) { d++; cur = 0; }
            cur += w;
        }
        return d;
    };
    int lo = *max_element(weights.begin(), weights.end()), hi = accumulate(weights.begin(), weights.end(), 0);
    while (lo < hi) {
        int m = lo + (hi - lo) / 2;
        if (need(m) <= days) hi = m;
        else lo = m + 1;
    }
    return lo;
}`,
        java: `int shipWithinDays(int[] weights, int days) {
    int lo = 0, hi = 0;
    for (int w : weights) { lo = Math.max(lo, w); hi += w; }
    while (lo < hi) {
        int m = lo + (hi - lo) / 2, d = 1, cur = 0;
        for (int w : weights) {
            if (cur + w > m) { d++; cur = 0; }
            cur += w;
        }
        if (d <= days) hi = m;
        else lo = m + 1;
    }
    return lo;
}`,
        javascript: `function shipWithinDays(weights, days) {
  const need = (cap) => {
    let d = 1, cur = 0;
    for (const w of weights) {
      if (cur + w > cap) {
        d++;
        cur = 0;
      }
      cur += w;
    }
    return d;
  };
  let lo = Math.max(...weights), hi = weights.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (need(m) <= days) hi = m;
    else lo = m + 1;
  }
  return lo;
}`,
      },
    },
    {
      name: '從最小可能的載重逐一往上試',
      idea: '`c = max(weights)`,`while need(c) > days`:`c += 1`。',
      steps: ['`c = max(weights)`', '`while need(c) > days`:`c += 1`', '回傳 c'],
      figure: { title: `weights = [${W}],days = ${D}`, steps: linFig() },
      complexity: { time: 'O(n · (sum − max))', space: 'O(1)', why: '最壞試 sum − max 個載重。' },
      verdict: '一定正確但很慢;二分搜尋就是建立在「答案有單調性」上的加速。',
      code: {
        python: `def shipWithinDays(weights, days):
    def need(cap):
        d, cur = 1, 0
        for w in weights:
            if cur + w > cap:
                d += 1
                cur = 0
            cur += w
        return d
    c = max(weights)
    while need(c) > days:
        c += 1                                # 一個一個往上試
    return c`,
        c: `int shipWithinDays(int *weights, int weightsSize, int days) {
    int c = 0;
    for (int i = 0; i < weightsSize; i++) if (weights[i] > c) c = weights[i];
    for (;; c++) {
        int d = 1, cur = 0;
        for (int i = 0; i < weightsSize; i++) {
            if (cur + weights[i] > c) { d++; cur = 0; }
            cur += weights[i];
        }
        if (d <= days) return c;
    }
}`,
        cpp: `int shipWithinDays(vector<int>& weights, int days) {
    for (int c = *max_element(weights.begin(), weights.end());; c++) {
        int d = 1, cur = 0;
        for (int w : weights) {
            if (cur + w > c) { d++; cur = 0; }
            cur += w;
        }
        if (d <= days) return c;
    }
}`,
        java: `int shipWithinDays(int[] weights, int days) {
    int c = 0;
    for (int w : weights) c = Math.max(c, w);
    for (;; c++) {
        int d = 1, cur = 0;
        for (int w : weights) {
            if (cur + w > c) { d++; cur = 0; }
            cur += w;
        }
        if (d <= days) return c;
    }
}`,
        javascript: `function shipWithinDays(weights, days) {
  for (let c = Math.max(...weights); ; c++) {
    let d = 1, cur = 0;
    for (const w of weights) {
      if (cur + w > c) {
        d++;
        cur = 0;
      }
      cur += w;
    }
    if (d <= days) return c;
  }
}`,
      },
    },
  ],
  pitfalls: ['下界從 1 開始:載重小於最重的包裹時,那個包裹永遠裝不上,貪心會算錯天數', '可以重新排列包裹的順序?不行,必須照順序裝'],
  check: {
    kind: 'fn',
    fn: 'shipWithinDays',
    cases: [
      { args: [W, D], out: 15 },
      { args: [[3, 2, 2, 4, 1, 4], 3], out: 6 },
      { args: [[1, 2, 3, 1, 1], 4], out: 3 },
      { args: [[10], 1], out: 10 },
    ],
  },
}
