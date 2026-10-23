import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 344. Reverse String

const S = ['h', 'e', 'l', 'l', 'o']

function twoPtrFig(): FigStep[] {
  const a = [...S]
  const out: FigStep[] = [{ note: '左右各放一個指標,從兩端往中間走:每一步把兩端的字交換,就像把一排人頭尾對調', views: [arr([...a], { label: 's', pointers: [{ name: 'L', index: 0 }, { name: 'R', index: a.length - 1, color: 'b' }] })] }]
  let l = 0
  let r = a.length - 1
  while (l < r) {
    ;[a[l], a[r]] = [a[r], a[l]]
    out.push({ note: `交換 s[${l}] 和 s[${r}],然後 L 往右、R 往左`, views: [arr([...a], { label: 's', highlight: [l, r], done: [...Array.from({ length: l }, (_, k) => k), ...Array.from({ length: a.length - 1 - r }, (_, k) => a.length - 1 - k)], pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] })] })
    l++
    r--
  }
  out.push({ note: `L 和 R 相遇(中間那個字不用動),反轉完成 → [${a.map((c) => `"${c}"`).join(',')}]`, views: [arr(a, { label: 's', done: a.map((_, i) => i) })] })
  return out
}

function recFig(): FigStep[] {
  return [
    { note: '遞迴版:「反轉 s[l..r]」= 交換兩端,再反轉 s[l+1..r−1](一個更小的同樣問題)', views: [arr(['o', 'e', 'l', 'l', 'h'], { label: 'swap(0, 4) 之後', highlight: [0, 4], range: [1, 3] })] },
    { note: '一層一層往內,直到 l ≥ r 停下。每層用掉一格呼叫堆疊,所以額外空間是 O(n),不符合題目的 O(1) 要求', views: [arr(['o', 'l', 'l', 'e', 'h'], { label: 'swap(1, 3) 之後', highlight: [1, 3], range: [2, 2] })] },
  ]
}

export const q0344: Solution = {
  id: 344,
  plain: '把一排字母倒過來排,而且不能拿新的紙重寫,只能在原地調換位置。就像一排人要變成反方向站,頭尾兩個人換位置,再往中間換下一對。',
  statement: '給字元陣列 `s`,**原地**把它反轉,只能用 O(1) 額外空間。',
  examples: [
    { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
    { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
  ],
  constraints: ['長度 ≤ 10⁵', '原地修改,O(1) 額外空間'],
  insight: ['反轉 = 第 i 個和倒數第 i 個交換', '兩個指標從兩端往中間走,相遇就停', '只需要做 n/2 次交換'],
  approaches: [
    {
      name: '左右雙指標交換',
      idea: '`l = 0`、`r = n − 1`;`while l < r`:交換、`l += 1`、`r −= 1`。',
      steps: ['`l, r = 0, n − 1`', '`while l < r`:交換 `s[l]`、`s[r]`', '`l += 1`、`r -= 1`'],
      figure: { title: `s = [${S.map((c) => `"${c}"`).join(',')}]`, steps: twoPtrFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: 'n/2 次交換,只用兩個指標。' },
      verdict: '標準答案,[[p:two-pointers]]「左右往中間夾」的入門題。',
      code: {
        python: `def reverseString(s):
    l, r = 0, len(s) - 1
    while l < r:
        s[l], s[r] = s[r], s[l]               # 兩端交換
        l += 1
        r -= 1`,
        c: `void reverseString(char *s, int sSize) {
    for (int l = 0, r = sSize - 1; l < r; l++, r--) {
        char t = s[l];
        s[l] = s[r];
        s[r] = t;
    }
}`,
        cpp: `void reverseString(vector<char>& s) {
    for (int l = 0, r = (int)s.size() - 1; l < r; l++, r--) swap(s[l], s[r]);
}`,
        java: `void reverseString(char[] s) {
    for (int l = 0, r = s.length - 1; l < r; l++, r--) {
        char t = s[l];
        s[l] = s[r];
        s[r] = t;
    }
}`,
        javascript: `function reverseString(s) {
  for (let l = 0, r = s.length - 1; l < r; l++, r--) [s[l], s[r]] = [s[r], s[l]];
}`,
      },
    },
    {
      name: '遞迴',
      idea: '`rev(l, r)`:`l >= r` 就停;否則交換 `s[l]`、`s[r]`,再 `rev(l + 1, r − 1)`。',
      steps: ['`rev(l, r)`:`if l >= r: return`', '交換兩端', '`rev(l + 1, r − 1)`'],
      figure: { title: `s = [${S.map((c) => `"${c}"`).join(',')}]`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '遞迴深度 n/2,每層佔一格呼叫堆疊。' },
      verdict: '練習把迴圈改寫成遞迴用。n = 10⁵ 時 Python 會超過預設遞迴上限,實戰用雙指標。',
      code: {
        python: `import sys

def reverseString(s):
    sys.setrecursionlimit(max(1000, len(s)))
    def rev(l, r):
        if l >= r:
            return
        s[l], s[r] = s[r], s[l]
        rev(l + 1, r - 1)                     # 剩下中間那段,是同樣的問題
    rev(0, len(s) - 1)`,
        c: `static void rev(char *s, int l, int r) {
    if (l >= r) return;
    char t = s[l]; s[l] = s[r]; s[r] = t;
    rev(s, l + 1, r - 1);
}

void reverseString(char *s, int sSize) { rev(s, 0, sSize - 1); }`,
        cpp: `void rev(vector<char>& s, int l, int r) {
    if (l >= r) return;
    swap(s[l], s[r]);
    rev(s, l + 1, r - 1);
}

void reverseString(vector<char>& s) { rev(s, 0, (int)s.size() - 1); }`,
        java: `void reverseString(char[] s) { rev(s, 0, s.length - 1); }

private void rev(char[] s, int l, int r) {
    if (l >= r) return;
    char t = s[l]; s[l] = s[r]; s[r] = t;
    rev(s, l + 1, r - 1);
}`,
        javascript: `function reverseString(s) {
  const rev = (l, r) => {
    if (l >= r) return;
    [s[l], s[r]] = [s[r], s[l]];
    rev(l + 1, r - 1);
  };
  rev(0, s.length - 1);
}`,
      },
    },
  ],
  pitfalls: ['迴圈條件寫成 `l <= r` 沒有錯(中間自己和自己交換),但寫成跑完整個陣列會換兩次、等於沒換', 'Python 寫 `s = s[::-1]` 只是讓區域變數指向新串列,原本的陣列沒變;要寫 `s[:] = s[::-1]`'],
  check: {
    kind: 'fn',
    fn: 'reverseString',
    inplace: 0,
    cases: [
      { args: [S], out: ['o', 'l', 'l', 'e', 'h'] },
      { args: [['H', 'a', 'n', 'n', 'a', 'h']], out: ['h', 'a', 'n', 'n', 'a', 'H'] },
      { args: [['x']], out: ['x'] },
      { args: [['a', 'b']], out: ['b', 'a'] },
    ],
  },
}
