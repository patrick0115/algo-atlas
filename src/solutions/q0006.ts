import type { GridViewData } from '../types'
import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 6. Zigzag Conversion

const S = 'PAYPALISHIRING'
const R = 4

function zigView(upto: number, label: string): GridViewData {
  const cycle = 2 * R - 2
  const cols = Math.ceil(S.length / cycle) * (R - 1)
  const cells: string[][] = Array.from({ length: R }, () => Array(cols).fill(''))
  const hl: [number, number][] = []
  for (let i = 0; i < upto; i++) {
    const k = i % cycle
    const block = Math.floor(i / cycle) * (R - 1)
    const [r, c] = k < R ? [k, block] : [cycle - k, block + k - R + 1]
    cells[r][c] = S[i]
    if (i === upto - 1) hl.push([r, c])
  }
  return { kind: 'grid', label, cells, rowLabels: Array.from({ length: R }, (_, r) => `列 ${r}`), marks: { hl } }
}

function simFig(): FigStep[] {
  const rows: string[] = Array(R).fill('')
  let r = 0
  let step = 1
  for (const c of S) {
    rows[r] += c
    if (r === 0) step = 1
    else if (r === R - 1) step = -1
    r += step
  }
  return [
    { note: `把字一個一個「寫」到 ${R} 列上:往下寫到底,再斜著往上寫到頂,一直重複(像 Z 字形)`, views: [zigView(R + 2, '先往下、再斜上')] },
    { note: '每個字只要知道「目前在哪一列」:到頂就改往下,到底就改往上。各列用一個字串收集', views: [zigView(S.length, '全部寫完')] },
    { note: `最後一列一列接起來:${rows.map((x) => `"${x}"`).join(' + ')} = "${rows.join('')}"`, views: [arr(rows, { label: '每一列' })] },
  ]
}

function formulaFig(): FigStep[] {
  const cycle = 2 * R - 2
  return [
    { note: `不模擬:一個循環有 ${cycle} 個字(2·numRows − 2)。第 0 列和最後一列,每個循環只有 1 個字:索引 0、${cycle}、${2 * cycle}…`, views: [arr(S.split(''), { label: 's', highlight: [0, cycle, 2 * cycle] })] },
    { note: `中間的第 r 列每個循環有 2 個字:k·${cycle} + r 和 (k+1)·${cycle} − r。例如第 1 列:1、5、7、11、13`, views: [arr(S.split(''), { label: 's', highlight: [1, cycle - 1, cycle + 1, 2 * cycle - 1, 2 * cycle + 1] })] },
  ]
}

export const q0006: Solution = {
  id: 6,
  plain: '把一串字寫成 Z 字形:往下寫 numRows 個,再斜著往上寫,再往下……寫好之後一列一列從左到右念出來,得到新的字串。',
  statement: '把字串 `s` 依 `numRows` 列以 Z 字形(往下、再斜上)排列,然後逐列讀取,回傳讀出的字串。',
  examples: [
    { input: 's = "PAYPALISHIRING", numRows = 3', output: '"PAHNAPLSIIGYIR"' },
    { input: 's = "PAYPALISHIRING", numRows = 4', output: '"PINALSIGYAHRPI"' },
    { input: 's = "A", numRows = 1', output: '"A"' },
  ],
  constraints: ['長度 ≤ 1000', 'numRows = 1 時不會轉彎,直接回傳原字串'],
  insight: ['不需要真的畫出二維表格,只要知道每個字落在哪一列', '列號 0, 1, …, R−1, R−2, …, 1, 0, 1… 來回跑', '或者找規律:一個循環 2R − 2 個字,每列在循環裡的位置是固定的'],
  approaches: [
    {
      name: '模擬列號上下跑',
      idea: '每列一個字串;`r` 在 0 和 R−1 之間來回,每個字接到 `rows[r]`。',
      steps: ['`numRows == 1` → 直接回傳 s', '`rows = [""] * numRows`、`r = 0`、`step = 1`', '每個字:`rows[r] += c`;到頂或到底就把 step 反向;`r += step`', '回傳 `"".join(rows)`'],
      figure: { title: `s = "${S}",numRows = ${R}`, steps: simFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個字放一次。' },
      verdict: '最推薦,好懂不易錯。',
      code: {
        python: `def convert(s, numRows):
    if numRows == 1:
        return s
    rows = [''] * numRows
    r, step = 0, 1
    for c in s:
        rows[r] += c
        if r == 0:
            step = 1                          # 到頂了,往下
        elif r == numRows - 1:
            step = -1                         # 到底了,往上
        r += step
    return ''.join(rows)`,
        c: `char *convert(char *s, int numRows) {
    int n = strlen(s);
    char *res = malloc(n + 1);
    if (numRows == 1) { strcpy(res, s); return res; }
    int *row = malloc(n * sizeof(int)), r = 0, step = 1, k = 0;
    for (int i = 0; i < n; i++) {                 // 先算出每個字在哪一列
        row[i] = r;
        if (r == 0) step = 1;
        else if (r == numRows - 1) step = -1;
        r += step;
    }
    for (int t = 0; t < numRows; t++)             // 再一列一列收集
        for (int i = 0; i < n; i++) if (row[i] == t) res[k++] = s[i];
    res[k] = '\\0';
    free(row);
    return res;
}`,
        cpp: `string convert(string s, int numRows) {
    if (numRows == 1) return s;
    vector<string> rows(numRows);
    int r = 0, step = 1;
    for (char c : s) {
        rows[r] += c;
        if (r == 0) step = 1;
        else if (r == numRows - 1) step = -1;
        r += step;
    }
    string res;
    for (auto &x : rows) res += x;
    return res;
}`,
        java: `String convert(String s, int numRows) {
    if (numRows == 1) return s;
    StringBuilder[] rows = new StringBuilder[numRows];
    for (int i = 0; i < numRows; i++) rows[i] = new StringBuilder();
    int r = 0, step = 1;
    for (char c : s.toCharArray()) {
        rows[r].append(c);
        if (r == 0) step = 1;
        else if (r == numRows - 1) step = -1;
        r += step;
    }
    StringBuilder res = new StringBuilder();
    for (StringBuilder x : rows) res.append(x);
    return res.toString();
}`,
        javascript: `function convert(s, numRows) {
  if (numRows === 1) return s;
  const rows = new Array(numRows).fill('');
  let r = 0, step = 1;
  for (const c of s) {
    rows[r] += c;
    if (r === 0) step = 1;
    else if (r === numRows - 1) step = -1;
    r += step;
  }
  return rows.join('');
}`,
      },
    },
    {
      name: '依循環直接算索引',
      idea: '`cycle = 2R − 2`;第 r 列依序取 `k·cycle + r`,中間列還要取 `(k+1)·cycle − r`。',
      steps: ['`cycle = 2 * numRows − 2`', '`for r in 0..R−1`:`for j in range(r, n, cycle)`:取 `s[j]`', '中間列(0 < r < R−1)還要取 `j + cycle − 2r`(若 < n)'],
      figure: { title: `s = "${S}",numRows = ${R}`, steps: formulaFig() },
      complexity: { time: 'O(n)', space: 'O(1)(不算輸出)', why: '每個字剛好被取一次。' },
      verdict: '不需要每列的暫存字串,直接照輸出順序取。找規律比較花時間。',
      code: {
        python: `def convert(s, numRows):
    if numRows == 1:
        return s
    n, cycle = len(s), 2 * numRows - 2
    res = []
    for r in range(numRows):
        for j in range(r, n, cycle):
            res.append(s[j])                  # 往下那一筆
            mid = j + cycle - 2 * r           # 斜上那一筆(只有中間的列有)
            if 0 < r < numRows - 1 and mid < n:
                res.append(s[mid])
    return ''.join(res)`,
        c: `char *convert(char *s, int numRows) {
    int n = strlen(s), k = 0;
    char *res = malloc(n + 1);
    if (numRows == 1) { strcpy(res, s); return res; }
    int cycle = 2 * numRows - 2;
    for (int r = 0; r < numRows; r++)
        for (int j = r; j < n; j += cycle) {
            res[k++] = s[j];
            int mid = j + cycle - 2 * r;
            if (r > 0 && r < numRows - 1 && mid < n) res[k++] = s[mid];
        }
    res[k] = '\\0';
    return res;
}`,
        cpp: `string convert(string s, int numRows) {
    if (numRows == 1) return s;
    int n = s.size(), cycle = 2 * numRows - 2;
    string res;
    for (int r = 0; r < numRows; r++)
        for (int j = r; j < n; j += cycle) {
            res += s[j];
            int mid = j + cycle - 2 * r;
            if (r > 0 && r < numRows - 1 && mid < n) res += s[mid];
        }
    return res;
}`,
        java: `String convert(String s, int numRows) {
    if (numRows == 1) return s;
    int n = s.length(), cycle = 2 * numRows - 2;
    StringBuilder res = new StringBuilder();
    for (int r = 0; r < numRows; r++)
        for (int j = r; j < n; j += cycle) {
            res.append(s.charAt(j));
            int mid = j + cycle - 2 * r;
            if (r > 0 && r < numRows - 1 && mid < n) res.append(s.charAt(mid));
        }
    return res.toString();
}`,
        javascript: `function convert(s, numRows) {
  if (numRows === 1) return s;
  const n = s.length, cycle = 2 * numRows - 2;
  let res = '';
  for (let r = 0; r < numRows; r++)
    for (let j = r; j < n; j += cycle) {
      res += s[j];
      const mid = j + cycle - 2 * r;
      if (r > 0 && r < numRows - 1 && mid < n) res += s[mid];
    }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['numRows = 1 時 cycle = 0,迴圈會卡住或除以 0,要先特判', '模擬時轉向的時機:到第 0 列或第 R−1 列「之後」才改方向'],
  check: {
    kind: 'fn',
    fn: 'convert',
    cases: [
      { args: [S, 3], out: 'PAHNAPLSIIGYIR' },
      { args: [S, R], out: 'PINALSIGYAHRPI' },
      { args: ['A', 1], out: 'A' },
      { args: ['AB', 1], out: 'AB' },
      { args: ['ABCD', 2], out: 'ACBD' },
      { args: ['ABC', 5], out: 'ABC' },
    ],
  },
}
