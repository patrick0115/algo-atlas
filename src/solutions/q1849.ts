import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1849. Splitting a String Into Descending Consecutive Values

const S = '050043'

function btFig(): FigStep[] {
  return [
    { note: `把 "${S}" 切成至少兩段,每段的數值要比前一段**剛好少 1**。關鍵:第一段一決定,後面每一段要的值就固定了`, views: [arr(S.split(''), { label: 's' })] },
    { note: '第一段 "0" = 0 → 下一段要 −1,不可能;第一段 "05" = 5 → 下一段要 4', views: [arr(S.split(''), { label: '第一段 "05"', range: [0, 1] })] },
    { note: '往後讀:"0" = 0、"00" = 0、"004" = 4 ✓ → 下一段要 3:"3" ✓,剛好用完', views: [arr(['05', '004', '3'], { label: '切法', done: [0, 1, 2] })] },
    { note: '5 → 4 → 3,答案 true。往後讀時一旦數值 ≥ 前一段,再讀下去只會更大 → 直接停', views: [arr([5, 4, 3], { label: '數值', done: [0, 1, 2] })] },
  ]
}

function greedyFig(): FigStep[] {
  return [
    { note: '既然後面每段要的值固定,其實不用回溯:對每種第一段,往後**直接比對**。目標值 > 0 時,滿足的前綴只有一種(前導零之後數值嚴格變大)', views: [arr(S.split(''), { label: '第一段 "05",目標 4', range: [2, 4] })] },
    { note: '唯一的例外是目標 0:要嘛剩下全是 0(整段吞掉),要嘛失敗(之後要 −1)。每種第一段 O(n) 檢查完', views: [arr(['05', '004', '3'], { label: '一路比對成功', done: [0, 1, 2] })] },
  ]
}

export const q1849: Solution = {
  id: 1849,
  plain: '一串數字,能不能切成至少兩段,讓每一段代表的數字都比前一段剛好少 1(像 5、4、3)?數字開頭可以有 0。',
  statement: '給只含數字的字串 `s`,判斷能否把它切成**兩個以上**非空子字串,使各段的數值依序遞減且相鄰兩段的差恰為 1。(子字串可以有前導零。)',
  examples: [
    { input: 's = "1234"', output: 'false' },
    { input: 's = "050043"', output: 'true', note: '[05, 004, 3] → 5, 4, 3' },
    { input: 's = "9080701"', output: 'false' },
    { input: 's = "10009998"', output: 'true', note: '[100, 099, 98]' },
  ],
  constraints: ['1 ≤ s.length ≤ 20'],
  insight: ['第一段決定了整條序列:後面每段的值都是 前一段 − 1', '[[p:backtracking]]:枚舉第一段,再往後找下一段', '數值最多 10 位數(否則後面的段放不下)→ 用 64 位元整數不會溢位'],
  approaches: [
    {
      name: '回溯',
      idea: '枚舉第一段(不能是整個字串);`dfs(start, prev)`:從 start 往後累積數值 cur,`cur == prev − 1` 就遞迴,`cur >= prev` 就停。',
      steps: ['`for i in 0..n−2`:`v = int(s[:i+1])`;`v ≥ 10¹⁰` 就停', '`dfs(i + 1, v)` 成功 → True', '`dfs(start, prev)`:`start == n` → True', '累積 cur;`cur >= prev` 停;`cur == prev − 1` 且 `dfs(j + 1, cur)` → True'],
      figure: { title: `s = "${S}"`, steps: btFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每段的目標值固定,後面幾乎只有一條路可走;第一段有 n 種。' },
      verdict: '最推薦,回溯的寫法最直覺,剪枝 `cur >= prev` 讓它跑得很快。',
      code: {
        python: `def splitString(s):
    n = len(s)

    def dfs(start, prev):
        if start == n:
            return True
        cur = 0
        for j in range(start, n):
            cur = cur * 10 + int(s[j])
            if cur >= prev:
                break                         # 只會越讀越大
            if cur == prev - 1 and dfs(j + 1, cur):
                return True
        return False

    v = 0
    for i in range(n - 1):                    # 第一段不能是整個字串
        v = v * 10 + int(s[i])
        if v >= 10 ** 10:
            break
        if dfs(i + 1, v):
            return True
    return False`,
        c: `static char *S;
static int n;

static bool dfs(int start, long long prev) {
    if (start == n) return true;
    long long cur = 0;
    for (int j = start; j < n; j++) {
        cur = cur * 10 + S[j] - '0';
        if (cur >= prev) break;
        if (cur == prev - 1 && dfs(j + 1, cur)) return true;
    }
    return false;
}

bool splitString(char *s) {
    S = s; n = strlen(s);
    long long v = 0;
    for (int i = 0; i < n - 1; i++) {
        v = v * 10 + s[i] - '0';
        if (v >= 10000000000LL) break;        // 超過 10 位數,後面不可能接得上
        if (dfs(i + 1, v)) return true;
    }
    return false;
}`,
        cpp: `bool splitString(string s) {
    int n = s.size();
    function<bool(int, long long)> dfs = [&](int start, long long prev) {
        if (start == n) return true;
        long long cur = 0;
        for (int j = start; j < n; j++) {
            cur = cur * 10 + s[j] - '0';
            if (cur >= prev) break;
            if (cur == prev - 1 && dfs(j + 1, cur)) return true;
        }
        return false;
    };
    long long v = 0;
    for (int i = 0; i < n - 1; i++) {
        v = v * 10 + s[i] - '0';
        if (v >= 10000000000LL) break;
        if (dfs(i + 1, v)) return true;
    }
    return false;
}`,
        java: `boolean splitString(String s) {
    long v = 0;
    for (int i = 0; i < s.length() - 1; i++) {
        v = v * 10 + s.charAt(i) - '0';
        if (v >= 10000000000L) break;
        if (dfs(s, i + 1, v)) return true;
    }
    return false;
}

boolean dfs(String s, int start, long prev) {
    if (start == s.length()) return true;
    long cur = 0;
    for (int j = start; j < s.length(); j++) {
        cur = cur * 10 + s.charAt(j) - '0';
        if (cur >= prev) break;
        if (cur == prev - 1 && dfs(s, j + 1, cur)) return true;
    }
    return false;
}`,
        javascript: `function splitString(s) {
  const n = s.length;
  const dfs = (start, prev) => {
    if (start === n) return true;
    let cur = 0;
    for (let j = start; j < n; j++) {
      cur = cur * 10 + Number(s[j]);
      if (cur >= prev) break;
      if (cur === prev - 1 && dfs(j + 1, cur)) return true;
    }
    return false;
  };
  let v = 0;
  for (let i = 0; i < n - 1; i++) {
    v = v * 10 + Number(s[i]);
    if (v >= 1e10) break;
    if (dfs(i + 1, v)) return true;
  }
  return false;
}`,
      },
    },
    {
      name: '枚舉第一段 + 直接比對',
      idea: '對每個第一段,目標值逐次減 1,往後讀到數值 ≥ 目標就停:相等就繼續下一段,否則失敗。目標是 0 時,剩下必須全是 0。',
      steps: ['`for` 第一段 `v`', '`pos`、`target = v − 1`;`target < 0` → 失敗', '`target == 0` → 剩下全是 0 才成功', '否則累積到 `cur >= target`;相等就 `pos` 前進、`target −= 1`,不等就失敗'],
      figure: { title: `s = "${S}"`, steps: greedyFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '第一段 n 種,每種線性比對。' },
      verdict: '想通「下一段是唯一的」之後,回溯就退化成一條路;寫法不用遞迴。',
      code: {
        python: `def splitString(s):
    n = len(s)
    v = 0
    for i in range(n - 1):
        v = v * 10 + int(s[i])
        if v >= 10 ** 10:
            break
        pos, target, ok = i + 1, v - 1, True
        while pos < n:
            if target < 0:
                ok = False
                break
            if target == 0:                   # 剩下必須全是 0
                ok = set(s[pos:]) == {'0'}
                break
            cur = 0
            while pos < n and cur < target:
                cur = cur * 10 + int(s[pos])
                pos += 1
            if cur != target:
                ok = False
                break
            target -= 1
        if ok:
            return True
    return False`,
        c: `bool splitString(char *s) {
    int n = strlen(s);
    long long v = 0;
    for (int i = 0; i < n - 1; i++) {
        v = v * 10 + s[i] - '0';
        if (v >= 10000000000LL) break;
        int pos = i + 1;
        long long target = v - 1;
        bool ok = true;
        while (pos < n) {
            if (target < 0) { ok = false; break; }
            if (target == 0) {
                for (int k = pos; k < n; k++) if (s[k] != '0') ok = false;
                break;
            }
            long long cur = 0;
            while (pos < n && cur < target) cur = cur * 10 + s[pos++] - '0';
            if (cur != target) { ok = false; break; }
            target--;
        }
        if (ok) return true;
    }
    return false;
}`,
        cpp: `bool splitString(string s) {
    int n = s.size();
    long long v = 0;
    for (int i = 0; i < n - 1; i++) {
        v = v * 10 + s[i] - '0';
        if (v >= 10000000000LL) break;
        int pos = i + 1;
        long long target = v - 1;
        bool ok = true;
        while (pos < n) {
            if (target < 0) { ok = false; break; }
            if (target == 0) { ok = s.find_first_not_of('0', pos) == string::npos; break; }
            long long cur = 0;
            while (pos < n && cur < target) cur = cur * 10 + s[pos++] - '0';
            if (cur != target) { ok = false; break; }
            target--;
        }
        if (ok) return true;
    }
    return false;
}`,
        java: `boolean splitString(String s) {
    int n = s.length();
    long v = 0;
    for (int i = 0; i < n - 1; i++) {
        v = v * 10 + s.charAt(i) - '0';
        if (v >= 10000000000L) break;
        int pos = i + 1;
        long target = v - 1;
        boolean ok = true;
        while (pos < n) {
            if (target < 0) { ok = false; break; }
            if (target == 0) {
                for (int k = pos; k < n; k++) if (s.charAt(k) != '0') ok = false;
                break;
            }
            long cur = 0;
            while (pos < n && cur < target) cur = cur * 10 + s.charAt(pos++) - '0';
            if (cur != target) { ok = false; break; }
            target--;
        }
        if (ok) return true;
    }
    return false;
}`,
        javascript: `function splitString(s) {
  const n = s.length;
  let v = 0;
  for (let i = 0; i < n - 1; i++) {
    v = v * 10 + Number(s[i]);
    if (v >= 1e10) break;
    let pos = i + 1, target = v - 1, ok = true;
    while (pos < n) {
      if (target < 0) {
        ok = false;
        break;
      }
      if (target === 0) {
        ok = /^0*$/.test(s.slice(pos));
        break;
      }
      let cur = 0;
      while (pos < n && cur < target) cur = cur * 10 + Number(s[pos++]);
      if (cur !== target) {
        ok = false;
        break;
      }
      target--;
    }
    if (ok) return true;
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: ['第一段取整個字串:題目要求至少兩段', '數值用 int 或沒設上限:20 位數會溢位', '目標值是 0 時還想再切:後面的 0 只能全部併進同一段(下一段要 −1 不存在)'],
  check: {
    kind: 'fn',
    fn: 'splitString',
    cases: [
      { args: ['1234'], out: false },
      { args: [S], out: true },
      { args: ['9080701'], out: false },
      { args: ['10009998'], out: true },
      { args: ['10'], out: true },
      { args: ['1'], out: false },
      { args: ['200100'], out: true },
      { args: ['99999999999999999999'], out: false },
      { args: ['4771447713'], out: true },
    ],
  },
}
