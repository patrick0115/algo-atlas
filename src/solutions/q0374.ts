import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 374. Guess Number Higher or Lower

const N = 10
const PICK = 6

function bsFig(): FigStep[] {
  let lo = 1
  let hi = N
  const out: FigStep[] = [{ note: `答案在 1..${N} 之間。每次猜正中間:系統回答「太大(−1)」「太小(1)」或「猜中(0)」,每次都能把範圍砍半`, views: [arr(range(1, N), { label: '可能的答案', range: [0, N - 1] })] }]
  while (lo <= hi) {
    const m = lo + ((hi - lo) >> 1)
    const g = m > PICK ? -1 : m < PICK ? 1 : 0
    out.push({ note: `猜 ${m} → ${g === 0 ? '猜中!' : g < 0 ? `太大了,答案在 ${lo}..${m - 1}` : `太小了,答案在 ${m + 1}..${hi}`}`, views: [arr(range(1, N), { label: '可能的答案', range: [lo - 1, hi - 1], highlight: [m - 1], done: g === 0 ? [m - 1] : [] })] })
    if (g === 0) break
    if (g < 0) hi = m - 1
    else lo = m + 1
  }
  return out
}

function terFig(): FigStep[] {
  return [
    { note: '三分搜尋:一次猜兩個點 m1、m2,把範圍切成三段。看起來每輪砍掉 2/3,但每輪要問兩次', views: [arr(range(1, N), { label: '1..10', highlight: [3, 6] })] },
    { note: `猜 4(太小)、猜 7(太大)→ 答案在 5..6。總詢問次數 ≈ 2·log₃ n ≈ 1.26·log₂ n,反而比二分多`, views: [arr(range(1, N), { label: '1..10', range: [4, 5] })] },
  ]
}

const GAME = (fn: string) => `

// 測試用:模擬系統的 guess(),答案是 pick
function guessGame(n, pick) {
  guess = (x) => (x > pick ? -1 : x < pick ? 1 : 0);
  return ${fn}(n);
}`

export const q0374: Solution = {
  id: 374,
  plain: '「猜數字」遊戲:我心裡想一個 1 到 n 的數字,你每猜一次,我會說「太大」「太小」或「猜中」。用最少的次數猜到它。',
  statement: '系統選了 1..n 中的一個數 pick。你可以呼叫預先定義的 `guess(num)`:回傳 −1 表示 num > pick、1 表示 num < pick、0 表示猜中。實作 `guessNumber(n)` 回傳 pick。(這裡用 `guessGame(n, pick)` 模擬系統來測試。)',
  examples: [
    { input: 'n = 10, pick = 6', output: '6' },
    { input: 'n = 1, pick = 1', output: '1' },
    { input: 'n = 2, pick = 1', output: '1' },
  ],
  constraints: ['n ≤ 2³¹ − 1 → 算中點時 `lo + hi` 會溢位'],
  insight: ['每次猜中間,不管回答太大或太小,都能丟掉一半 → [[p:binary-search]]', 'n 可以到 2³¹ − 1,中點要寫成 `lo + (hi − lo) / 2`'],
  approaches: [
    {
      name: '二分搜尋',
      idea: '`lo = 1`、`hi = n`;猜 `m`,−1 → `hi = m − 1`,1 → `lo = m + 1`,0 → 回傳。',
      steps: ['`lo, hi = 1, n`', '`m = lo + (hi − lo) // 2`;`r = guess(m)`', '`r == 0` → 回傳 m;`r < 0` → `hi = m − 1`;否則 `lo = m + 1`'],
      figure: { title: `n = ${N},pick = ${PICK}`, steps: bsFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每次範圍砍半;n = 2³¹ 時最多 31 次。' },
      verdict: '最推薦,二分搜尋最原始的樣子。',
      code: {
        python: `def guessNumber(n):
    lo, hi = 1, n
    while lo <= hi:
        m = (lo + hi) // 2                    # Python 整數不會溢位
        r = guess(m)
        if r == 0:
            return m
        if r < 0:
            hi = m - 1                        # 猜太大
        else:
            lo = m + 1                        # 猜太小
    return -1

def guessGame(n, pick):                       # 測試用:模擬系統的 guess()
    global guess
    guess = lambda x: -1 if x > pick else 1 if x < pick else 0
    return guessNumber(n)`,
        c: `static int PICK_;
int guess(int num) { return num > PICK_ ? -1 : num < PICK_ ? 1 : 0; }   // 測試用的系統

int guessNumber(int n) {
    int lo = 1, hi = n;
    while (lo <= hi) {
        int m = lo + (hi - lo) / 2;            // 不要寫 (lo + hi) / 2:會溢位
        int r = guess(m);
        if (r == 0) return m;
        if (r < 0) hi = m - 1;
        else lo = m + 1;
    }
    return -1;
}

int guessGame(int n, int pick) { PICK_ = pick; return guessNumber(n); }`,
        cpp: `static int PICK_;
int guess(int num) { return num > PICK_ ? -1 : num < PICK_ ? 1 : 0; }

int guessNumber(int n) {
    int lo = 1, hi = n;
    while (lo <= hi) {
        int m = lo + (hi - lo) / 2;
        int r = guess(m);
        if (r == 0) return m;
        if (r < 0) hi = m - 1;
        else lo = m + 1;
    }
    return -1;
}

int guessGame(int n, int pick) { PICK_ = pick; return guessNumber(n); }`,
        java: `private int pick;
int guess(int num) { return num > pick ? -1 : num < pick ? 1 : 0; }

int guessNumber(int n) {
    int lo = 1, hi = n;
    while (lo <= hi) {
        int m = lo + (hi - lo) / 2;
        int r = guess(m);
        if (r == 0) return m;
        if (r < 0) hi = m - 1;
        else lo = m + 1;
    }
    return -1;
}

int guessGame(int n, int pick) { this.pick = pick; return guessNumber(n); }`,
        javascript: `let guess;

function guessNumber(n) {
  let lo = 1, hi = n;
  while (lo <= hi) {
    const m = lo + Math.floor((hi - lo) / 2);
    const r = guess(m);
    if (r === 0) return m;
    if (r < 0) hi = m - 1;
    else lo = m + 1;
  }
  return -1;
}${GAME('guessNumber')}`,
      },
    },
    {
      name: '三分搜尋',
      idea: '每輪猜 `m1 = lo + (hi−lo)/3`、`m2 = hi − (hi−lo)/3`,依兩個回答把範圍縮成三段之一。',
      steps: ['猜 m1:中了就回傳;太大 → 答案在 m1 左邊', '猜 m2:中了就回傳;太小 → 答案在 m2 右邊', '否則答案在 (m1, m2) 之間'],
      figure: { title: `n = ${N},pick = ${PICK}`, steps: terFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每輪範圍變 1/3,但每輪問兩次:總詢問 2·log₃ n > log₂ n。' },
      verdict: '拿來說明「切越多段不一定越快」:詢問次數才是成本,二分最省。',
      code: {
        python: `def guessNumber(n):
    lo, hi = 1, n
    while lo <= hi:
        m1 = lo + (hi - lo) // 3
        m2 = hi - (hi - lo) // 3
        r1 = guess(m1)
        if r1 == 0:
            return m1
        r2 = guess(m2)
        if r2 == 0:
            return m2
        if r1 < 0:
            hi = m1 - 1                       # 比 m1 還小
        elif r2 > 0:
            lo = m2 + 1                       # 比 m2 還大
        else:
            lo, hi = m1 + 1, m2 - 1           # 在兩者之間
    return -1

def guessGame(n, pick):
    global guess
    guess = lambda x: -1 if x > pick else 1 if x < pick else 0
    return guessNumber(n)`,
        c: `static int PICK_;
int guess(int num) { return num > PICK_ ? -1 : num < PICK_ ? 1 : 0; }

int guessNumber(int n) {
    int lo = 1, hi = n;
    while (lo <= hi) {
        int m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
        int r1 = guess(m1);
        if (r1 == 0) return m1;
        int r2 = guess(m2);
        if (r2 == 0) return m2;
        if (r1 < 0) hi = m1 - 1;
        else if (r2 > 0) lo = m2 + 1;
        else { lo = m1 + 1; hi = m2 - 1; }
    }
    return -1;
}

int guessGame(int n, int pick) { PICK_ = pick; return guessNumber(n); }`,
        cpp: `static int PICK_;
int guess(int num) { return num > PICK_ ? -1 : num < PICK_ ? 1 : 0; }

int guessNumber(int n) {
    int lo = 1, hi = n;
    while (lo <= hi) {
        int m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
        int r1 = guess(m1);
        if (r1 == 0) return m1;
        int r2 = guess(m2);
        if (r2 == 0) return m2;
        if (r1 < 0) hi = m1 - 1;
        else if (r2 > 0) lo = m2 + 1;
        else { lo = m1 + 1; hi = m2 - 1; }
    }
    return -1;
}

int guessGame(int n, int pick) { PICK_ = pick; return guessNumber(n); }`,
        java: `private int pick;
int guess(int num) { return num > pick ? -1 : num < pick ? 1 : 0; }

int guessNumber(int n) {
    int lo = 1, hi = n;
    while (lo <= hi) {
        int m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
        int r1 = guess(m1);
        if (r1 == 0) return m1;
        int r2 = guess(m2);
        if (r2 == 0) return m2;
        if (r1 < 0) hi = m1 - 1;
        else if (r2 > 0) lo = m2 + 1;
        else { lo = m1 + 1; hi = m2 - 1; }
    }
    return -1;
}

int guessGame(int n, int pick) { this.pick = pick; return guessNumber(n); }`,
        javascript: `let guess;

function guessNumber(n) {
  let lo = 1, hi = n;
  while (lo <= hi) {
    const m1 = lo + Math.floor((hi - lo) / 3), m2 = hi - Math.floor((hi - lo) / 3);
    const r1 = guess(m1);
    if (r1 === 0) return m1;
    const r2 = guess(m2);
    if (r2 === 0) return m2;
    if (r1 < 0) hi = m1 - 1;
    else if (r2 > 0) lo = m2 + 1;
    else {
      lo = m1 + 1;
      hi = m2 - 1;
    }
  }
  return -1;
}${GAME('guessNumber')}`,
      },
    },
  ],
  pitfalls: ['中點寫成 `(lo + hi) / 2`:n = 2³¹ − 1 時 lo + hi 會溢位', '把 −1 / 1 的意思弄反:−1 是「你猜的太大」'],
  check: {
    kind: 'fn',
    fn: 'guessGame',
    cases: [
      { args: [N, PICK], out: PICK },
      { args: [1, 1], out: 1 },
      { args: [2, 1], out: 1 },
      { args: [2, 2], out: 2 },
      { args: [2147483647, 2147483647], out: 2147483647 },
      { args: [2147483647, 1702766719], out: 1702766719 },
    ],
  },
}
