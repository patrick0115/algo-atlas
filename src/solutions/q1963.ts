import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1963. Minimum Number of Swaps to Make the String Balanced

const S = ']]][[['

function stackFig(): FigStep[] {
  const out: FigStep[] = [{ note: '先把能配對的 [ ] 都消掉(像 [20](#/q/20) 那樣用堆疊),剩下的一定長得像 "]]]…[[[":前面一串沒人配的 ],後面一串沒人配的 [', views: [arr(S.split(''), { label: 's' })] }]
  let open = 0
  let bad = 0
  S.split('').forEach((c, i) => {
    if (c === '[') open++
    else if (open > 0) open--
    else bad++
    if (i === 2 || i === S.length - 1) out.push({ note: `掃到第 ${i} 個:沒配對的 ] 有 ${bad} 個,還開著的 [ 有 ${open} 個`, views: [arr(S.split(''), { label: 's', done: Array.from({ length: i + 1 }, (_, k) => k) }), arr([bad, open], { label: '沒配對的 ] / 開著的 [' })] })
  })
  out.push({ note: `剩 ${bad} 個沒配對的 ](和 ${bad} 個 [)。一次交換最多修好 2 對:把最前面的 ] 和最後面的 [ 交換,"]]][[[" → "[]][[]"…所以答案是 ⌈${bad} / 2⌉ = ${Math.ceil(bad / 2)}`, views: [arr('[]][[]'.split(''), { label: '交換第 0 和第 5 個之後', highlight: [0, 5] })] })
  return out
}

function countFig(): FigStep[] {
  let bal = 0
  let mn = 0
  const pre: number[] = []
  for (const c of S) {
    bal += c === '[' ? 1 : -1
    mn = Math.min(mn, bal)
    pre.push(bal)
  }
  return [
    { note: '不用堆疊:[ 算 +1、] 算 −1,一路累加。累加值掉到負數,代表有 ] 找不到前面的 [ 配', views: [arr(S.split(''), { label: 's' }), arr(pre, { label: '累加值', highlight: [pre.indexOf(mn)] })] },
    { note: `最低掉到 ${mn} → 有 ${-mn} 個 ] 沒配對。答案 ⌈${-mn} / 2⌉ = ${Math.ceil(-mn / 2)}`, views: [arr(pre, { label: '累加值', done: [pre.indexOf(mn)] })] },
  ]
}

export const q1963: Solution = {
  id: 1963,
  plain: '一串括號,左括號 [ 和右括號 ] 一樣多,但順序亂了。每次可以任選兩個位置互換,最少換幾次能讓括號全部正確配對?',
  statement: '給長度為偶數 n 的字串 `s`,恰好有 n/2 個 `[` 和 n/2 個 `]`。每次可以交換任意兩個位置的字元,回傳讓 s 變成**平衡括號字串**的最少交換次數。',
  examples: [
    { input: 's = "][]["', output: '1' },
    { input: 's = "]]][[["', output: '2' },
    { input: 's = "[]"', output: '0' },
  ],
  constraints: ['n ≤ 10⁶ → 只能 O(n)'],
  insight: ['已經配好的括號不用動,先把它們消掉', '剩下的一定是 "]]]…[[[",各 m 個', '一次交換(最前面的 ] 和最後面的 [)能修好 2 對;m 是奇數時最後一次只修 1 對 → 答案 ⌈m/2⌉'],
  approaches: [
    {
      name: '數沒配對的 ](堆疊的想法)',
      idea: '`open` 記目前開著的 [;遇到 ] 時有 [ 就配掉,沒有就 `bad += 1`。答案 `(bad + 1) // 2`。',
      steps: ['`open = bad = 0`', '`[` → `open += 1`;`]` → `open > 0` 就 `open -= 1`,否則 `bad += 1`', '回傳 `(bad + 1) // 2`'],
      figure: { title: `s = "${S}"`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '堆疊裡只會有 [,所以只要記數量,不用真的開堆疊。' },
      verdict: '最推薦。把「堆疊」簡化成一個計數器,是括號題常見的省空間技巧。',
      code: {
        python: `def minSwaps(s):
    open_ = bad = 0
    for c in s:
        if c == '[':
            open_ += 1
        elif open_:
            open_ -= 1                        # 和前面的 [ 配掉
        else:
            bad += 1                          # 沒人配的 ]
    return (bad + 1) // 2                     # 一次交換修好兩對`,
        c: `int minSwaps(char *s) {
    int open = 0, bad = 0;
    for (; *s; s++) {
        if (*s == '[') open++;
        else if (open) open--;
        else bad++;
    }
    return (bad + 1) / 2;
}`,
        cpp: `int minSwaps(string s) {
    int open = 0, bad = 0;
    for (char c : s) {
        if (c == '[') open++;
        else if (open) open--;
        else bad++;
    }
    return (bad + 1) / 2;
}`,
        java: `int minSwaps(String s) {
    int open = 0, bad = 0;
    for (char c : s.toCharArray()) {
        if (c == '[') open++;
        else if (open > 0) open--;
        else bad++;
    }
    return (bad + 1) / 2;
}`,
        javascript: `function minSwaps(s) {
  let open = 0, bad = 0;
  for (const c of s) {
    if (c === '[') open++;
    else if (open) open--;
    else bad++;
  }
  return (bad + 1) >> 1;
}`,
      },
    },
    {
      name: '前綴和的最低點',
      idea: '`[` = +1、`]` = −1 累加,最低點 `mn`(≤ 0)代表有 `−mn` 個 ] 沒配到。答案 `(−mn + 1) // 2`。',
      steps: ['`bal = mn = 0`', '每個字元:`bal += 1 or −1`,`mn = min(mn, bal)`', '回傳 `(−mn + 1) // 2`'],
      figure: { title: `s = "${S}"`, steps: countFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描。' },
      verdict: '和第一種是同一件事的另一個角度:累加值掉到多低,就欠多少個 [。',
      code: {
        python: `def minSwaps(s):
    bal = mn = 0
    for c in s:
        bal += 1 if c == '[' else -1
        mn = min(mn, bal)                     # 最低點 = 最多欠幾個 [
    return (-mn + 1) // 2`,
        c: `int minSwaps(char *s) {
    int bal = 0, mn = 0;
    for (; *s; s++) {
        bal += *s == '[' ? 1 : -1;
        if (bal < mn) mn = bal;
    }
    return (-mn + 1) / 2;
}`,
        cpp: `int minSwaps(string s) {
    int bal = 0, mn = 0;
    for (char c : s) mn = min(mn, bal += c == '[' ? 1 : -1);
    return (-mn + 1) / 2;
}`,
        java: `int minSwaps(String s) {
    int bal = 0, mn = 0;
    for (char c : s.toCharArray()) mn = Math.min(mn, bal += c == '[' ? 1 : -1);
    return (-mn + 1) / 2;
}`,
        javascript: `function minSwaps(s) {
  let bal = 0, mn = 0;
  for (const c of s) mn = Math.min(mn, (bal += c === '[' ? 1 : -1));
  return (-mn + 1) >> 1;
}`,
      },
    },
  ],
  pitfalls: ['答案寫成 bad / 2(無條件捨去):"][][" 的 bad = 1,要換 1 次不是 0 次', '真的去模擬交換:沒有必要,而且 n = 10⁶ 時容易寫成 O(n²)'],
  check: {
    kind: 'fn',
    fn: 'minSwaps',
    cases: [
      { args: ['][]['], out: 1 },
      { args: [S], out: 2 },
      { args: ['[]'], out: 0 },
      { args: [']]]][[[['], out: 2 },
      { args: ['[]][]['], out: 1 },
    ],
  },
}
