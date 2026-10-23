import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2390. Removing Stars From a String

const S = 'leet**cod*e'

function stackFig(): FigStep[] {
  const st: string[] = []
  const out: FigStep[] = [{ note: '每個 * 會刪掉它左邊**最近的**、還沒被刪的字 → 堆疊:字母 push,* 就 pop', views: [arr(S.split(''), { label: 's' }), arr([], { label: '堆疊' })] }]
  S.split('').forEach((c, i) => {
    if (c === '*') {
      const x = st.pop()
      if (i === 4 || i === 5 || i === 9) out.push({ note: `"*" → 刪掉最近的 "${x}"`, views: [arr(S.split(''), { label: 's', highlight: [i], done: Array.from({ length: i }, (_, k) => k) }), arr([...st], { label: '堆疊' })] })
    } else {
      st.push(c)
      if (i === 3 || i === 8) out.push({ note: `字母 "${c}" → push`, views: [arr(S.split(''), { label: 's', highlight: [i], done: Array.from({ length: i }, (_, k) => k) }), arr([...st], { label: '堆疊', highlight: [st.length - 1] })] })
    }
  })
  out.push({ note: `剩下的就是答案 "${st.join('')}"`, views: [arr(st, { label: '答案', done: st.map((_, i) => i) })] })
  return out
}

function writeFig(): FigStep[] {
  return [
    { note: '不另開堆疊:直接在字元陣列上用寫入指標 w 當「堆疊頂」。字母 → 寫到 w、w + 1;* → w − 1', views: [arr('leet**cod*e'.split(''), { label: '陣列', pointers: [{ name: 'w', index: 4 }] })] },
    { note: '最後前 w 個就是答案 "lecoe"。和 [27](#/q/27)、[283](#/q/283) 的快慢指標是同一個技巧', views: [arr('lecoe'.split(''), { label: '前 w 個', done: [0, 1, 2, 3, 4] })] },
  ]
}

export const q2390: Solution = {
  id: 2390,
  plain: '一串字裡有些是星號 *。每個 * 就像按一次「倒退鍵」:刪掉它自己,和它左邊最近的一個字。全部處理完剩下什麼?',
  statement: '給含有 `*` 的字串 `s`。每次操作選一個 `*`,刪除它和它左邊最近的非星號字元。重複直到沒有星號,回傳結果(保證一定能完成,結果唯一)。',
  examples: [
    { input: 's = "leet**cod*e"', output: '"lecoe"' },
    { input: 's = "erase*****"', output: '""' },
  ],
  constraints: ['長度 ≤ 10⁵ → 每次刪除都重建字串會 O(n²)'],
  insight: ['* = 倒退鍵:刪掉最近打的那個字', '「最近的」→ 後進先出 → 堆疊', '堆疊可以用陣列 + 寫入指標代替,原地完成'],
  approaches: [
    {
      name: '堆疊',
      idea: '字母 push,* 就 pop;最後把堆疊接成字串。',
      steps: ['`st = []`', '`for c in s`:`c == "*"` → `st.pop()`;否則 `st.append(c)`', '回傳 `"".join(st)`'],
      figure: { title: `s = "${S}"`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個字元進出堆疊最多一次。' },
      verdict: '最推薦,[[p:stack]]最直接的應用:「撤銷最近一次」。',
      code: {
        python: `def removeStars(s):
    st = []
    for c in s:
        if c == '*':
            st.pop()                          # 倒退鍵:刪掉最近的字
        else:
            st.append(c)
    return ''.join(st)`,
        c: `char *removeStars(char *s) {
    int n = strlen(s), top = 0;
    char *st = malloc(n + 1);
    for (int i = 0; i < n; i++) {
        if (s[i] == '*') top--;
        else st[top++] = s[i];
    }
    st[top] = '\\0';
    return st;
}`,
        cpp: `string removeStars(string s) {
    string st;
    for (char c : s) {
        if (c == '*') st.pop_back();
        else st.push_back(c);
    }
    return st;
}`,
        java: `String removeStars(String s) {
    StringBuilder st = new StringBuilder();
    for (char c : s.toCharArray()) {
        if (c == '*') st.deleteCharAt(st.length() - 1);
        else st.append(c);
    }
    return st.toString();
}`,
        javascript: `function removeStars(s) {
  const st = [];
  for (const c of s) {
    if (c === '*') st.pop();
    else st.push(c);
  }
  return st.join('');
}`,
      },
    },
    {
      name: '原地寫入指標',
      idea: '把字串轉成陣列,`w` 是寫入位置:字母 `a[w] = c`、`w += 1`;* 就 `w −= 1`。回傳 `a[:w]`。',
      steps: ['`a = list(s)`、`w = 0`', '`for c in s`:`*` → `w -= 1`;否則 `a[w] = c`、`w += 1`', '回傳 `"".join(a[:w])`'],
      figure: { title: `s = "${S}"`, steps: writeFig() },
      complexity: { time: 'O(n)', space: 'O(1)(不算字元陣列)', why: '直接覆寫原陣列。' },
      verdict: '堆疊的「陣列實作」:不額外配置空間。C 語言可以直接改輸入字串。',
      code: {
        python: `def removeStars(s):
    a, w = list(s), 0
    for c in s:
        if c == '*':
            w -= 1                            # 「pop」:寫入位置退一格
        else:
            a[w] = c
            w += 1
    return ''.join(a[:w])`,
        c: `char *removeStars(char *s) {
    int w = 0;
    for (int i = 0; s[i]; i++) {
        if (s[i] == '*') w--;
        else s[w++] = s[i];                   // w ≤ i,不會蓋到還沒讀的字
    }
    s[w] = '\\0';
    return s;
}`,
        cpp: `string removeStars(string s) {
    int w = 0;
    for (char c : s) {
        if (c == '*') w--;
        else s[w++] = c;
    }
    s.resize(w);
    return s;
}`,
        java: `String removeStars(String s) {
    char[] a = s.toCharArray();
    int w = 0;
    for (char c : a) {
        if (c == '*') w--;
        else a[w++] = c;
    }
    return new String(a, 0, w);
}`,
        javascript: `function removeStars(s) {
  const a = s.split('');
  let w = 0;
  for (const c of s) {
    if (c === '*') w--;
    else a[w++] = c;
  }
  return a.slice(0, w).join('');
}`,
      },
    },
  ],
  pitfalls: ['真的去字串裡找星號、刪掉兩個字再重來:每次 O(n),總共 O(n²)', 'Java 用 String 一直 `+`:每次都產生新字串'],
  check: {
    kind: 'fn',
    fn: 'removeStars',
    cases: [
      { args: [S], out: 'lecoe' },
      { args: ['erase*****'], out: '' },
      { args: ['abc'], out: 'abc' },
      { args: ['ab*c*d'], out: 'ad' },
    ],
  },
}
