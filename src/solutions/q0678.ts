import { arr, range } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 678. Valid Parenthesis String

const S = '(*))'

function stackFig(): FigStep[] {
  const chars = [...S]
  const lefts: number[] = []
  const stars: number[] = []
  const out: FigStep[] = [{ note: '兩個堆疊:一個放「左括號的位置」,一個放「星號的位置」。右括號優先拿左括號配,沒有才拿星號', views: [arr(chars, { label: 's' })] }]
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    let note = ''
    if (c === '(') {
      lefts.push(i)
      note = `( 放進左括號堆疊`
    } else if (c === '*') {
      stars.push(i)
      note = `* 放進星號堆疊`
    } else if (lefts.length) {
      note = `) 和第 ${lefts.pop()} 個 ( 配對`
    } else if (stars.length) {
      note = `) 沒有左括號可配,用第 ${stars.pop()} 個 * 當成 (`
    } else {
      out.push({ note: ') 沒有任何東西可以配 → false', views: [arr(chars, { label: 's', highlight: [i] })] })
      return out
    }
    out.push({ note, views: [arr(chars, { label: 's', highlight: [i], dim: range(0, i - 1) }), arr(lefts, { label: '左括號的位置' }), arr(stars, { label: '星號的位置' })] })
  }
  out.push({ note: `最後剩下的左括號要用「在它右邊的星號」當 ) 配掉。剩下左括號 [${lefts}]、星號 [${stars}] → ${lefts.length <= stars.length ? 'OK' : '不夠'}`, views: [arr(lefts, { label: '剩下的左括號' }), arr(stars, { label: '剩下的星號' })] })
  return out
}

function rangeFig(): FigStep[] {
  const chars = [...S]
  let lo = 0
  let hi = 0
  const out: FigStep[] = [{ note: '不管星號怎麼選,「還沒配對的左括號數」一定落在某個範圍 [lo, hi]:lo = 星號都盡量當 ) 的情況,hi = 星號都當 ( 的情況', views: [arr(chars, { label: 's' })] }]
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    if (c === '(') {
      lo++
      hi++
    } else if (c === ')') {
      lo--
      hi--
    } else {
      lo--
      hi++
    }
    const why = c === '(' ? '( → 兩邊都 +1' : c === ')' ? ') → 兩邊都 −1' : '* 可以是 )、空、( → lo − 1、hi + 1'
    if (hi < 0) {
      out.push({ note: `${why},hi = ${hi} < 0:就算星號全當 ( 也不夠配右括號 → false`, views: [arr(chars, { label: 's', highlight: [i] })] })
      return out
    }
    lo = Math.max(lo, 0)
    out.push({ note: `${why} → 範圍 [${lo}, ${hi}](lo 不能小於 0:負的代表多用了 ),那種選法不合法)`, views: [arr(chars, { label: 's', highlight: [i], dim: range(0, i - 1) }), arr([lo, hi], { label: '[lo, hi]' })] })
  }
  out.push({ note: `走完了,lo = ${lo}:${lo === 0 ? '存在一種選法讓左括號全部配完 → true' : '最少也還剩左括號 → false'}`, views: [arr([lo, hi], { label: '[lo, hi]', done: lo === 0 ? [0] : [] })] })
  return out
}

function dpFig(): FigStep[] {
  const n = S.length
  const dp = Array.from({ length: n }, () => Array(n).fill(false))
  const view = (hl: [number, number][]): GridViewData => ({
    kind: 'grid',
    label: 'dp[i][j]:s[i..j] 能不能變合法(✓ / ·)',
    cells: dp.map((row, i) => row.map((v, j) => (j < i ? '' : v ? '✓' : '·'))),
    rowLabels: [...S].map((c, i) => `${i}:${c}`),
    colLabels: [...S].map((c, j) => `${j}:${c}`),
    marks: { hl, done: dp.flatMap((row, i) => row.flatMap((v, j) => (v ? [[i, j] as [number, number]] : []))) },
  })
  for (let i = 0; i < n; i++) dp[i][i] = S[i] === '*'
  const out: FigStep[] = [{ note: '長度 1:只有 * 能變合法(當成空字串)。表格只看右上半(i ≤ j)', views: [view([])] }]
  for (let len = 2; len <= n; len++)
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      const inner = len === 2 ? true : dp[i + 1][j - 1]
      let ok = '(*'.includes(S[i]) && ')*'.includes(S[j]) && inner
      let how = ok ? `兩端可以配成 ( )${len > 2 ? `,中間 s[${i + 1}..${j - 1}] 也合法` : ''}` : ''
      for (let k = i; k < j && !ok; k++)
        if (dp[i][k] && dp[k + 1][j]) {
          ok = true
          how = `切成 s[${i}..${k}] 和 s[${k + 1}..${j}],兩段都合法`
        }
      dp[i][j] = ok
      out.push({ note: `s[${i}..${j}] = "${S.slice(i, j + 1)}":${ok ? how + ' → ✓' : '兩端配不起來、也找不到切點 → ·'}`, views: [view([[i, j]])] })
    }
  out.push({ note: `看右上角 dp[0][${n - 1}] = ${dp[0][n - 1] ? '✓ → true' : '· → false'}`, views: [view([[0, n - 1]])] })
  return out
}

export const q0678: Solution = {
  id: 678,
  plain: '檢查括號有沒有配對好,但多了一種萬用符號 `*`:它可以當成 `(`、當成 `)`,或當作沒看到。問有沒有一種選法讓整串括號合法。',
  statement: '字串 `s` 只含 `(`、`)`、`*`。`*` 可以當作 `(`、`)` 或空字串。判斷是否存在一種替換方式,讓 s 成為合法的括號字串。',
  examples: [
    { input: 's = "()"', output: 'true' },
    { input: 's = "(*)"', output: 'true' },
    { input: 's = "(*))"', output: 'true', note: '* 當 (' },
    { input: 's = "(()"', output: 'false' },
  ],
  constraints: ['`1 ≤ s.length ≤ 100`'],
  insight: [
    '暴力:每個 * 有 3 種選法,3¹⁰⁰ 太多',
    '堆疊的想法:左括號和星號分開存位置。右括號優先配左括號,沒有才用星號。最後剩下的左括號,要用**在它右邊**的星號當 ) 配掉',
    '更巧的想法:不用知道每個 * 怎麼選,只追蹤「未配對的左括號數」可能的**範圍** [lo, hi]。hi < 0 就失敗;lo 不能低於 0;最後 lo == 0 就成功',
  ],
  approaches: [
    {
      name: '兩個堆疊(左括號、星號的位置)',
      idea: '遇到 ( 和 * 分別把位置放進兩個堆疊;遇到 ) 先配 (、沒有再配 *、都沒有就失敗。最後把剩下的 ( 和它右邊的 * 配掉。',
      steps: ['`(` → `lefts.push(i)`;`*` → `stars.push(i)`', '`)` → `lefts` 不空就 pop;否則 `stars` 不空就 pop;否則 false', '最後:`while lefts`:`stars` 空或 `stars.top < lefts.top`(星號在左括號左邊)→ false;否則兩個都 pop', '→ true'],
      figure: { title: `s = "${S}"`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個字元進出堆疊一次。' },
      verdict: '直觀:延續 [20](#/q/20) 的堆疊做法,多處理星號。記位置是為了最後檢查「星號要在左括號的右邊」。',
      code: {
        python: `def checkValidString(s):
    lefts, stars = [], []
    for i, c in enumerate(s):
        if c == '(':
            lefts.append(i)
        elif c == '*':
            stars.append(i)
        elif lefts:
            lefts.pop()                   # 優先配真的左括號
        elif stars:
            stars.pop()                   # 用 * 當 (
        else:
            return False
    while lefts:                          # 剩下的 ( 要用右邊的 * 當 ) 配
        if not stars or stars[-1] < lefts[-1]:
            return False
        lefts.pop()
        stars.pop()
    return True`,
        c: `bool checkValidString(char *s) {
    int n = strlen(s), lefts[100], stars[100], lt = 0, st = 0;
    for (int i = 0; i < n; i++) {
        if (s[i] == '(') lefts[lt++] = i;
        else if (s[i] == '*') stars[st++] = i;
        else if (lt) lt--;
        else if (st) st--;
        else return false;
    }
    while (lt) {
        if (!st || stars[st - 1] < lefts[lt - 1]) return false;
        lt--; st--;
    }
    return true;
}`,
        cpp: `bool checkValidString(string s) {
    vector<int> lefts, stars;
    for (int i = 0; i < (int)s.size(); i++) {
        if (s[i] == '(') lefts.push_back(i);
        else if (s[i] == '*') stars.push_back(i);
        else if (!lefts.empty()) lefts.pop_back();
        else if (!stars.empty()) stars.pop_back();
        else return false;
    }
    while (!lefts.empty()) {
        if (stars.empty() || stars.back() < lefts.back()) return false;
        lefts.pop_back(); stars.pop_back();
    }
    return true;
}`,
        java: `boolean checkValidString(String s) {
    Deque<Integer> lefts = new ArrayDeque<>(), stars = new ArrayDeque<>();
    for (int i = 0; i < s.length(); i++) {
        char c = s.charAt(i);
        if (c == '(') lefts.push(i);
        else if (c == '*') stars.push(i);
        else if (!lefts.isEmpty()) lefts.pop();
        else if (!stars.isEmpty()) stars.pop();
        else return false;
    }
    while (!lefts.isEmpty()) {
        if (stars.isEmpty() || stars.peek() < lefts.peek()) return false;
        lefts.pop(); stars.pop();
    }
    return true;
}`,
        javascript: `function checkValidString(s) {
  const lefts = [], stars = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') lefts.push(i);
    else if (c === '*') stars.push(i);
    else if (lefts.length) lefts.pop();
    else if (stars.length) stars.pop();
    else return false;
  }
  while (lefts.length) {
    if (!stars.length || stars[stars.length - 1] < lefts[lefts.length - 1]) return false;
    lefts.pop();
    stars.pop();
  }
  return true;
}`,
      },
    },
    {
      name: '貪心:追蹤未配對左括號數的範圍 [lo, hi]',
      idea: '`(` → lo、hi 都 +1;`)` → 都 −1;`*` → lo − 1、hi + 1。hi < 0 → false;lo 小於 0 就拉回 0。最後 lo == 0 → true。',
      steps: ['`lo = hi = 0`', '每個字元照上面更新 lo、hi', '`hi < 0` → false(右括號多到救不回來)', '`lo = max(lo, 0)`', '回傳 `lo == 0`'],
      figure: { title: `s = "${S}"`, steps: rangeFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只用兩個變數。' },
      verdict: '最精簡的解法。思考方式是「不決定每個星號,只追蹤所有可能性的範圍」—— 這種把一堆可能的狀態壓縮成區間的技巧很值得學。',
      code: {
        python: `def checkValidString(s):
    lo = hi = 0                           # 未配對左括號數的最小、最大可能
    for c in s:
        if c == '(':
            lo, hi = lo + 1, hi + 1
        elif c == ')':
            lo, hi = lo - 1, hi - 1
        else:                             # * 可以是 ) 、空、(
            lo, hi = lo - 1, hi + 1
        if hi < 0:
            return False                  # 就算 * 全當 ( 也不夠
        lo = max(lo, 0)                   # 負的代表那種選法不合法,丟掉
    return lo == 0`,
        c: `bool checkValidString(char *s) {
    int lo = 0, hi = 0;
    for (; *s; s++) {
        if (*s == '(') { lo++; hi++; }
        else if (*s == ')') { lo--; hi--; }
        else { lo--; hi++; }
        if (hi < 0) return false;
        if (lo < 0) lo = 0;
    }
    return lo == 0;
}`,
        cpp: `bool checkValidString(string s) {
    int lo = 0, hi = 0;
    for (char c : s) {
        if (c == '(') { lo++; hi++; }
        else if (c == ')') { lo--; hi--; }
        else { lo--; hi++; }
        if (hi < 0) return false;
        lo = max(lo, 0);
    }
    return lo == 0;
}`,
        java: `boolean checkValidString(String s) {
    int lo = 0, hi = 0;
    for (char c : s.toCharArray()) {
        if (c == '(') { lo++; hi++; }
        else if (c == ')') { lo--; hi--; }
        else { lo--; hi++; }
        if (hi < 0) return false;
        lo = Math.max(lo, 0);
    }
    return lo == 0;
}`,
        javascript: `function checkValidString(s) {
  let lo = 0, hi = 0;
  for (const c of s) {
    if (c === '(') { lo++; hi++; }
    else if (c === ')') { lo--; hi--; }
    else { lo--; hi++; }
    if (hi < 0) return false;
    lo = Math.max(lo, 0);
  }
  return lo === 0;
}`,
      },
    },
    {
      name: 'DP:dp[i][j] = s[i..j] 能不能變合法',
      idea: '區間 DP:`s[i..j]` 合法 ⇔(s[i] 能當 ( 且 s[j] 能當 ) 且中間合法)或 存在切點 k 讓兩段都合法。空字串和單一個 `*` 合法。',
      steps: ['長度 0 合法;長度 1 只有 `*` 合法', '長度從 2 往上:`dp[i][j] = (s[i] ∈ "(*" and s[j] ∈ ")*" and dp[i+1][j−1])`', '或 `dp[i][k] and dp[k+1][j]` 對某個 k', '回傳 `dp[0][n−1]`'],
      figure: { title: `s = "${S}"`, steps: dpFig() },
      complexity: { time: 'O(n³)', space: 'O(n²)', why: 'n² 個區間,每個試 n 個切點。n = 100 時 10⁶,能過。' },
      verdict: '最「笨」但最通用:不需要任何聰明的觀察,直接照定義切子問題。展示 [[p:interval-dp]] 的形狀。',
      code: {
        python: `def checkValidString(s):
    n = len(s)
    if n == 0:
        return True
    dp = [[False] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = s[i] == '*'
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            inner = True if length == 2 else dp[i + 1][j - 1]
            if s[i] in '(*' and s[j] in ')*' and inner:
                dp[i][j] = True
                continue
            for k in range(i, j):
                if dp[i][k] and dp[k + 1][j]:
                    dp[i][j] = True
                    break
    return dp[0][n - 1]`,
        c: `bool checkValidString(char *s) {
    int n = strlen(s);
    static bool dp[100][100];
    for (int i = 0; i < n; i++) dp[i][i] = s[i] == '*';
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            bool inner = len == 2 ? true : dp[i + 1][j - 1];
            dp[i][j] = (s[i] == '(' || s[i] == '*') && (s[j] == ')' || s[j] == '*') && inner;
            for (int k = i; k < j && !dp[i][j]; k++) dp[i][j] = dp[i][k] && dp[k + 1][j];
        }
    return dp[0][n - 1];
}`,
        cpp: `bool checkValidString(string s) {
    int n = s.size();
    vector<vector<bool>> dp(n, vector<bool>(n, false));
    for (int i = 0; i < n; i++) dp[i][i] = s[i] == '*';
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            bool inner = len == 2 ? true : dp[i + 1][j - 1];
            bool ok = (s[i] == '(' || s[i] == '*') && (s[j] == ')' || s[j] == '*') && inner;
            for (int k = i; k < j && !ok; k++) ok = dp[i][k] && dp[k + 1][j];
            dp[i][j] = ok;
        }
    return dp[0][n - 1];
}`,
        java: `boolean checkValidString(String s) {
    int n = s.length();
    boolean[][] dp = new boolean[n][n];
    for (int i = 0; i < n; i++) dp[i][i] = s.charAt(i) == '*';
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            char a = s.charAt(i), b = s.charAt(j);
            boolean inner = len == 2 || dp[i + 1][j - 1];
            boolean ok = (a == '(' || a == '*') && (b == ')' || b == '*') && inner;
            for (int k = i; k < j && !ok; k++) ok = dp[i][k] && dp[k + 1][j];
            dp[i][j] = ok;
        }
    return dp[0][n - 1];
}`,
        javascript: `function checkValidString(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = 0; i < n; i++) dp[i][i] = s[i] === '*';
  for (let len = 2; len <= n; len++)
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      const inner = len === 2 ? true : dp[i + 1][j - 1];
      let ok = '(*'.includes(s[i]) && ')*'.includes(s[j]) && inner;
      for (let k = i; k < j && !ok; k++) ok = dp[i][k] && dp[k + 1][j];
      dp[i][j] = ok;
    }
  return dp[0][n - 1];
}`,
      },
    },
  ],
  pitfalls: [
    '只數「左括號數 ≤ 右括號數 + 星號數」:`"*("` 數量上可以,但星號在左括號左邊,沒辦法當 ) 配它',
    '範圍法忘了 `lo = max(lo, 0)`:lo 變負代表把太多星號當成 ),那種選法無效,不能讓它把結果拉低',
    '堆疊法最後只比數量、沒比位置',
  ],
  followUp: [{ q: '只有 ( 和 )?', a: '[20. Valid Parentheses](#/q/20) 的單一括號版:一個計數器就夠,lo 和 hi 會一直相等。' }],
  check: {
    kind: 'fn',
    fn: 'checkValidString',
    cases: [
      { args: ['()'], out: true },
      { args: ['(*)'], out: true },
      { args: [S], out: true },
      { args: ['(()'], out: false },
      { args: ['*('], out: false },
      { args: ['(((******))'], out: true },
      { args: [')('], out: false },
      { args: ['*'], out: true },
    ],
  },
}
