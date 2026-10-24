import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { recLayout, recView, type RNode } from './fig'

// 91. Decode Ways

const S = '2263'

function treeFig(): FigStep[] {
  const nodes: RNode[] = []
  const go = (i: number, parent: number, label: string) => {
    const done = i === S.length
    nodes.push({ parent, label, sub: done ? '' : `剩 "${S.slice(i)}"`, kind: done ? 'ok' : undefined })
    if (done) return
    const id = nodes.length - 1
    if (S[i] !== '0') go(i + 1, id, `${S[i]}→${String.fromCharCode(64 + Number(S[i]))}`)
    if (i + 1 < S.length && (S[i] === '1' || (S[i] === '2' && S[i + 1] <= '6'))) go(i + 2, id, `${S.slice(i, i + 2)}→${String.fromCharCode(64 + Number(S.slice(i, i + 2)))}`)
  }
  go(0, -1, '開始')
  const pos = recLayout(nodes)
  const ok = nodes.filter((n) => n.kind === 'ok').length
  return [
    { note: '每一步可以吃 1 個數字(1~9)或 2 個數字(10~26),各自對應一個字母。所有走到底的路就是所有解碼方式', views: [recView(nodes, pos, 0, '決策樹')] },
    { note: `共 ${ok} 種(走到底的節點)。注意同一個「剩下的字串」會出現好幾次 —— 它的解碼數只和剩下多少有關,可以重複利用`, views: [recView(nodes, pos, nodes.length - 1, '決策樹')] },
  ]
}

function dpFig(): FigStep[] {
  const n = S.length
  const dp: (number | string)[] = Array(n + 1).fill('?')
  dp[0] = 1
  const out: FigStep[] = [{ note: 'dp[i] = 前 i 個數字有幾種解碼方式,dp[0] = 1(空字串一種)。最後一個字母可能用掉 1 個數字或 2 個數字', views: [arr([...S], { label: 's' }), arr(dp, { label: 'dp' })] }]
  for (let i = 1; i <= n; i++) {
    let v = 0
    const parts: string[] = []
    if (S[i - 1] !== '0') {
      v += dp[i - 1] as number
      parts.push(`單獨用 "${S[i - 1]}" → +dp[${i - 1}] = ${dp[i - 1]}`)
    } else parts.push('"0" 不能單獨解碼')
    if (i >= 2) {
      const two = Number(S.slice(i - 2, i))
      if (S[i - 2] !== '0' && two <= 26) {
        v += dp[i - 2] as number
        parts.push(`"${S.slice(i - 2, i)}" 兩位一起 → +dp[${i - 2}] = ${dp[i - 2]}`)
      } else parts.push(`"${S.slice(i - 2, i)}" 不能當一個字母`)
    }
    dp[i] = v
    out.push({ note: `dp[${i}]:${parts.join(';')} → ${v}`, views: [arr([...S], { label: 's', highlight: [i - 1], compare: i >= 2 ? [i - 2] : [], dim: range(i, n - 1) }), arr(dp, { label: 'dp', highlight: [i] })] })
  }
  out.push({ note: `答案 dp[${n}] = ${dp[n]}`, views: [arr(dp, { label: 'dp', done: [n] })] })
  return out
}

export const q0091: Solution = {
  id: 91,
  plain: '把字母編成數字:A = 1、B = 2 … Z = 26。給一串數字,問有幾種方式把它翻譯回字母。例如 "12" 可以是 AB(1,2)或 L(12)。要小心 0:它不能單獨翻譯。',
  statement: '字母 A~Z 對應到 "1"~"26"。給一個只含數字的字串 s,回傳解碼方式的數量。"06" 這種有前導 0 的不能當成 6。',
  examples: [
    { input: 's = "12"', output: '2', note: 'AB 或 L' },
    { input: 's = "226"', output: '3', note: 'BZ、VF、BBF' },
    { input: 's = "06"', output: '0' },
  ],
  constraints: ['`1 ≤ s.length ≤ 100` → 列舉所有方式是指數級', '答案在 32 位元整數內'],
  insight: [
    '每一步只有兩種選擇:吃 1 個數字(不能是 0),或吃 2 個數字(10 ~ 26)→ 很像爬樓梯([70](#/q/70)),只是有條件',
    '`dp[i]` = 前 i 個數字的解碼數。`dp[i] = (s[i−1] 能單獨解碼 ? dp[i−1] : 0) + (s[i−2..i−1] 是 10~26 ? dp[i−2] : 0)`',
    '0 是最大的陷阱:"0" 單獨不行;"10"、"20" 可以;"30"、"00" 都不行',
  ],
  approaches: [
    {
      name: '遞迴 + 記憶化',
      idea: '`f(i)` = 從第 i 個數字開始到結尾的解碼數。`s[i] == "0"` → 0;否則 `f(i+1)` +(兩位數 ≤ 26 時)`f(i+2)`。',
      steps: ['`f(n) = 1`', '`s[i] == "0"` → 0', '`res = f(i + 1)`;`i + 1 < n` 且 `10 ≤ int(s[i:i+2]) ≤ 26` → `res += f(i + 2)`', '記憶化'],
      figure: { title: `s = "${S}"`, steps: treeFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個 f(i) 算一次。' },
      verdict: '直接照「吃一個或吃兩個」寫,最容易確認邏輯。',
      code: {
        python: `from functools import lru_cache

def numDecodings(s):
    n = len(s)

    @lru_cache(maxsize=None)
    def f(i):
        if i == n:
            return 1
        if s[i] == '0':
            return 0                      # 0 不能當開頭
        res = f(i + 1)                    # 吃一個數字
        if i + 1 < n and int(s[i:i + 2]) <= 26:
            res += f(i + 2)               # 吃兩個數字(10 ~ 26)
        return res

    return f(0)`,
        c: `static int memo[101], N_;
static char *S_;

static int f(int i) {
    if (i == N_) return 1;
    if (S_[i] == '0') return 0;
    if (memo[i] >= 0) return memo[i];
    int res = f(i + 1);
    if (i + 1 < N_ && (S_[i] - '0') * 10 + (S_[i + 1] - '0') <= 26) res += f(i + 2);
    return memo[i] = res;
}

int numDecodings(char *s) {
    S_ = s; N_ = strlen(s);
    for (int i = 0; i < N_; i++) memo[i] = -1;
    return f(0);
}`,
        cpp: `int numDecodings(string s) {
    int n = s.size();
    vector<int> memo(n, -1);
    function<int(int)> f = [&](int i) -> int {
        if (i == n) return 1;
        if (s[i] == '0') return 0;
        if (memo[i] >= 0) return memo[i];
        int res = f(i + 1);
        if (i + 1 < n && stoi(s.substr(i, 2)) <= 26) res += f(i + 2);
        return memo[i] = res;
    };
    return f(0);
}`,
        java: `private int[] memo;
private String s;

int numDecodings(String s) {
    this.s = s;
    memo = new int[s.length()];
    Arrays.fill(memo, -1);
    return f(0);
}

private int f(int i) {
    if (i == s.length()) return 1;
    if (s.charAt(i) == '0') return 0;
    if (memo[i] >= 0) return memo[i];
    int res = f(i + 1);
    if (i + 1 < s.length() && Integer.parseInt(s.substring(i, i + 2)) <= 26) res += f(i + 2);
    return memo[i] = res;
}`,
        javascript: `function numDecodings(s) {
  const n = s.length, memo = new Array(n).fill(-1);
  const f = (i) => {
    if (i === n) return 1;
    if (s[i] === '0') return 0;
    if (memo[i] >= 0) return memo[i];
    let res = f(i + 1);
    if (i + 1 < n && Number(s.slice(i, i + 2)) <= 26) res += f(i + 2);
    return (memo[i] = res);
  };
  return f(0);
}`,
      },
    },
    {
      name: '由前往後填表',
      idea: '`dp[0] = 1`。`dp[i] = (s[i−1] != "0" ? dp[i−1] : 0) + (10 ≤ s[i−2..i−1] ≤ 26 ? dp[i−2] : 0)`。',
      steps: ['`dp = [1] + [0] * n`', '`s[i−1] != "0"` → `dp[i] += dp[i−1]`', '`i ≥ 2` 且 `10 ≤ int(s[i−2:i]) ≤ 26` → `dp[i] += dp[i−2]`', '回傳 `dp[n]`'],
      figure: { title: `s = "${S}"`, steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '填 n + 1 格。' },
      verdict: '標準解。只用到前兩格,可以再壓成兩個變數,O(1) 空間。',
      code: {
        python: `def numDecodings(s):
    n = len(s)
    dp = [1] + [0] * n                    # dp[i]:前 i 個數字的解碼數
    for i in range(1, n + 1):
        if s[i - 1] != '0':
            dp[i] += dp[i - 1]            # 最後一個字母用 1 個數字
        if i >= 2 and 10 <= int(s[i - 2:i]) <= 26:
            dp[i] += dp[i - 2]            # 最後一個字母用 2 個數字
    return dp[n]`,
        c: `int numDecodings(char *s) {
    int n = strlen(s), dp[101] = {0};
    dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        if (s[i - 1] != '0') dp[i] += dp[i - 1];
        if (i >= 2) {
            int two = (s[i - 2] - '0') * 10 + (s[i - 1] - '0');
            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
        }
    }
    return dp[n];
}`,
        cpp: `int numDecodings(string s) {
    int n = s.size();
    vector<int> dp(n + 1, 0);
    dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        if (s[i - 1] != '0') dp[i] += dp[i - 1];
        if (i >= 2) {
            int two = (s[i - 2] - '0') * 10 + (s[i - 1] - '0');
            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
        }
    }
    return dp[n];
}`,
        java: `int numDecodings(String s) {
    int n = s.length();
    int[] dp = new int[n + 1];
    dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        if (s.charAt(i - 1) != '0') dp[i] += dp[i - 1];
        if (i >= 2) {
            int two = (s.charAt(i - 2) - '0') * 10 + (s.charAt(i - 1) - '0');
            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
        }
    }
    return dp[n];
}`,
        javascript: `function numDecodings(s) {
  const n = s.length, dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    if (s[i - 1] !== '0') dp[i] += dp[i - 1];
    if (i >= 2) {
      const two = Number(s.slice(i - 2, i));
      if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
    }
  }
  return dp[n];
}`,
      },
    },
  ],
  pitfalls: [
    '兩位數只檢查 ≤ 26,沒檢查 ≥ 10:"06" 會被當成 6',
    '"0" 單獨不能解碼:s 的開頭是 0 時答案直接是 0',
    '"100":1|00 不行、10|0 不行 → 0;每一步都要同時檢查兩種情況',
  ],
  followUp: [{ q: '如果有萬用字元 `*`(代表 1~9)?', a: '639. Decode Ways II:同樣的 DP,只是每種情況的方法數要乘上 `*` 能代表的數字個數,並取 mod。' }],
  check: {
    kind: 'fn',
    fn: 'numDecodings',
    cases: [
      { args: ['12'], out: 2 },
      { args: ['226'], out: 3 },
      { args: ['06'], out: 0 },
      { args: [S], out: 3 },
      { args: ['100'], out: 0 },
      { args: ['2101'], out: 1 },
      { args: ['11106'], out: 2 },
    ],
  },
}
