import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 202. Happy Number

const next = (n: number) => [...String(n)].reduce((s, d) => s + Number(d) ** 2, 0)
const sq = (n: number) => [...String(n)].map((d) => `${d}²`).join(' + ')

function setFig(start: number): FigStep[] {
  const seen: number[] = []
  let n = start
  const out: FigStep[] = [{ note: `從 ${start} 開始,一直做「每一位平方相加」。用一個 set 記下出現過的數:看到 1 就是快樂數;看到重複的數就代表繞進圈圈出不來`, views: [arr([n], { label: '目前的數' }), kv([], 'seen')] }]
  while (n !== 1 && !seen.includes(n)) {
    seen.push(n)
    const m = next(n)
    out.push({ note: `${n} → ${sq(n)} = ${m}`, views: [arr(seen.concat(m), { label: '目前的路徑', highlight: [seen.length] }), kv(seen.map((v) => [v, '✓']), 'seen', [n])] })
    n = m
  }
  out.push({ note: n === 1 ? '走到 1 了 → 是快樂數' : `${n} 之前出現過 → 進入循環,永遠到不了 1 → 不是快樂數`, views: [arr(seen.concat(n), { label: '完整路徑', highlight: [seen.length], compare: n === 1 ? [] : [seen.indexOf(n)] })] })
  return out
}

function floydFig(start: number): FigStep[] {
  let slow = start
  let fast = next(start)
  const out: FigStep[] = [{ note: '不用 set:把這串數字想成一條鏈結串列,用「快慢指針」。慢的一次走一步、快的一次走兩步。有環的話快的一定會追上慢的', views: [arr([slow, fast], { label: 'slow、fast' })] }]
  let guard = 0
  while (fast !== 1 && slow !== fast && guard++ < 30) {
    slow = next(slow)
    fast = next(next(fast))
    out.push({ note: `slow 走一步 → ${slow};fast 走兩步 → ${fast}`, views: [arr([slow, fast], { label: 'slow、fast', highlight: slow === fast ? [0, 1] : [] })] })
  }
  out.push({ note: fast === 1 ? 'fast 先走到 1 → 快樂數' : `slow 和 fast 在 ${slow} 相遇,而且不是 1 → 有環,不是快樂數`, views: [arr([slow, fast], { label: 'slow、fast', done: [0, 1] })] })
  return out
}

export const q0202: Solution = {
  id: 202,
  plain: '拿一個數,把每一位數字平方後加起來,得到新的數,一直重複。如果最後會變成 1,它就是「快樂數」;如果永遠在幾個數之間繞圈圈,就不是。',
  statement: '「快樂數」:從正整數 `n` 開始,把它換成「每一位數字的平方和」,一直重複。最後會變成 1 的是快樂數;會陷入不含 1 的無限循環的不是。判斷 `n` 是不是快樂數。',
  examples: [
    { input: 'n = 19', output: 'true', note: '1² + 9² = 82 → 68 → 100 → 1' },
    { input: 'n = 2', output: 'false', note: '2 → 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4 → …(回到 4)' },
  ],
  constraints: [
    '`1 ≤ n ≤ 2³¹ − 1` → 最多 10 位數,一次轉換後最多 10 × 81 = 810,之後數字都很小',
    '所以序列一定會「變成 1」或「進入一個循環」,不會無限變大',
  ],
  insight: [
    '關鍵觀察:數字很快就會變小(10 位數的平方和最多 810),之後只會在小於 1000 的數之間打轉 —— 所以一定會**重複**',
    '重複 = 進入循環。如果循環裡有 1(1 → 1),就是快樂數;否則不是',
    '「判斷一個序列有沒有進入循環」:可以用 set 記看過的數,也可以把序列當成鏈結串列,用 [141](#/q/141) 的快慢指針',
  ],
  approaches: [
    {
      name: 'Hash Set 記錄看過的數',
      idea: '一直轉換,每個數都放進 set。遇到 1 → true;遇到已經在 set 裡的數 → 進入循環 → false。',
      steps: ['`seen = set()`', '`while n != 1 and n not in seen`:`seen.add(n)`、`n = 平方和(n)`', '回傳 `n == 1`'],
      figure: { title: 'n = 2', steps: setFig(2) },
      complexity: { time: 'O(log n)', space: 'O(log n)', why: '第一步把 n 變成 O(log n) 位數的平方和;之後的數都小於 1000,步數是常數。set 存的數也是同樣的量級。' },
      verdict: '最直覺、最好寫,面試首選。',
      code: {
        python: `def isHappy(n):
    def nxt(x):
        s = 0
        while x:
            x, d = divmod(x, 10)
            s += d * d
        return s

    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        n = nxt(n)
    return n == 1`,
        c: `static int nxt(int x) {
    int s = 0;
    while (x) { int d = x % 10; s += d * d; x /= 10; }
    return s;
}

bool isHappy(int n) {
    // 第一次轉換之後都 <= 810,用陣列當 set
    bool seen[1000] = {false};
    n = nxt(n);
    while (n != 1 && !seen[n]) {
        seen[n] = true;
        n = nxt(n);
    }
    return n == 1;
}`,
        cpp: `bool isHappy(int n) {
    auto nxt = [](int x) { int s = 0; while (x) { s += (x % 10) * (x % 10); x /= 10; } return s; };
    unordered_set<int> seen;
    while (n != 1 && !seen.count(n)) {
        seen.insert(n);
        n = nxt(n);
    }
    return n == 1;
}`,
        java: `boolean isHappy(int n) {
    Set<Integer> seen = new HashSet<>();
    while (n != 1 && seen.add(n)) n = nxt(n);   // add 回傳 false 代表看過了
    return n == 1;
}

private int nxt(int x) {
    int s = 0;
    while (x > 0) { int d = x % 10; s += d * d; x /= 10; }
    return s;
}`,
        javascript: `function isHappy(n) {
  const nxt = (x) => {
    let s = 0;
    for (; x > 0; x = Math.floor(x / 10)) s += (x % 10) ** 2;
    return s;
  };
  const seen = new Set();
  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    n = nxt(n);
  }
  return n === 1;
}`,
      },
    },
    {
      name: '快慢指針(Floyd 判環)',
      idea: '把 `n → 平方和(n)` 看成「下一個節點」。`slow` 每次走一步、`fast` 每次走兩步。有環的話兩者一定會相遇;fast 先碰到 1 就是快樂數。',
      steps: ['`slow = n`、`fast = 平方和(n)`', '`while fast != 1 and slow != fast`:`slow` 走一步、`fast` 走兩步', '回傳 `fast == 1`'],
      figure: { title: 'n = 2', steps: floydFig(2) },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '和 set 版走的步數同量級,但只用兩個變數。' },
      verdict: 'O(1) 空間。示範「序列 = 隱形的鏈結串列」這個觀念,[287. Find the Duplicate Number](#/q/287) 也是同一招。',
      code: {
        python: `def isHappy(n):
    def nxt(x):
        s = 0
        while x:
            x, d = divmod(x, 10)
            s += d * d
        return s

    slow, fast = n, nxt(n)
    while fast != 1 and slow != fast:
        slow = nxt(slow)                  # 一步
        fast = nxt(nxt(fast))             # 兩步
    return fast == 1`,
        c: `static int nxt(int x) {
    int s = 0;
    while (x) { int d = x % 10; s += d * d; x /= 10; }
    return s;
}

bool isHappy(int n) {
    int slow = n, fast = nxt(n);
    while (fast != 1 && slow != fast) {
        slow = nxt(slow);
        fast = nxt(nxt(fast));
    }
    return fast == 1;
}`,
        cpp: `bool isHappy(int n) {
    auto nxt = [](int x) { int s = 0; while (x) { s += (x % 10) * (x % 10); x /= 10; } return s; };
    int slow = n, fast = nxt(n);
    while (fast != 1 && slow != fast) {
        slow = nxt(slow);
        fast = nxt(nxt(fast));
    }
    return fast == 1;
}`,
        java: `boolean isHappy(int n) {
    int slow = n, fast = nxt(n);
    while (fast != 1 && slow != fast) {
        slow = nxt(slow);
        fast = nxt(nxt(fast));
    }
    return fast == 1;
}

private int nxt(int x) {
    int s = 0;
    while (x > 0) { int d = x % 10; s += d * d; x /= 10; }
    return s;
}`,
        javascript: `function isHappy(n) {
  const nxt = (x) => {
    let s = 0;
    for (; x > 0; x = Math.floor(x / 10)) s += (x % 10) ** 2;
    return s;
  };
  let slow = n, fast = nxt(n);
  while (fast !== 1 && slow !== fast) {
    slow = nxt(slow);
    fast = nxt(nxt(fast));
  }
  return fast === 1;
}`,
      },
    },
    {
      name: '數學:不快樂的數一定會經過 4',
      idea: '可以證明(或寫程式驗證):所有不快樂的數,最後都會掉進同一個循環 `4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4`。所以一直轉換,碰到 1 或 4 就停。',
      steps: ['`while n != 1 and n != 4`:`n = 平方和(n)`', '回傳 `n == 1`'],
      figure: { title: 'n = 2', steps: setFig(2).slice(-1).concat([{ note: '循環裡有 4。所以只要碰到 4,就能確定不是快樂數', views: [arr([4, 16, 37, 58, 89, 145, 42, 20], { label: '唯一的不快樂循環', highlight: [0] })] }]) },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '步數同前兩種,只用一個變數。' },
      verdict: '最短,但依賴一個「要另外知道」的數學事實。面試時可以當作補充,主要還是講前兩種。',
      code: {
        python: `def isHappy(n):
    while n != 1 and n != 4:              # 不快樂的數一定會經過 4
        n = sum(int(d) ** 2 for d in str(n))
    return n == 1`,
        c: `bool isHappy(int n) {
    while (n != 1 && n != 4) {
        int s = 0;
        while (n) { int d = n % 10; s += d * d; n /= 10; }
        n = s;
    }
    return n == 1;
}`,
        cpp: `bool isHappy(int n) {
    while (n != 1 && n != 4) {
        int s = 0;
        while (n) { s += (n % 10) * (n % 10); n /= 10; }
        n = s;
    }
    return n == 1;
}`,
        java: `boolean isHappy(int n) {
    while (n != 1 && n != 4) {
        int s = 0;
        while (n > 0) { s += (n % 10) * (n % 10); n /= 10; }
        n = s;
    }
    return n == 1;
}`,
        javascript: `function isHappy(n) {
  while (n !== 1 && n !== 4) n = [...String(n)].reduce((s, d) => s + d * d, 0);
  return n === 1;
}`,
      },
    },
  ],
  pitfalls: [
    '沒有偵測循環就一直算:不快樂的數會變成無窮迴圈',
    '快慢指針的初始值:`slow = n`、`fast = 平方和(n)`;如果兩個都從 n 開始,要用 do-while,不然迴圈一開始就因為相等而結束',
    'C 用陣列當 set 時,要先轉換一次讓數字變小,不然 n 可能到 2³¹ 開不了陣列',
  ],
  followUp: [
    { q: '同樣的「找環」技巧還用在哪?', a: '[141. Linked List Cycle](#/q/141)、142. Linked List Cycle II(找環的入口)、[287. Find the Duplicate Number](#/q/287)(把陣列值當成 next 指標)。' },
  ],
  check: {
    kind: 'fn',
    fn: 'isHappy',
    cases: [
      { args: [19], out: true },
      { args: [2], out: false },
      { args: [1], out: true },
      { args: [7], out: true },
      { args: [4], out: false },
      { args: [2147483647], out: false },
    ],
  },
}
