import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 32. Longest Valid Parentheses
const S = ')()())'
const fig = [
  { note: '先放入邊界索引 −1。掃到索引 0 的右括號時無法配對，改用 0 作新的左邊界。', views: [arr([0], { label: '索引堆疊', highlight: [0] }), arr(S.split(''), { label: 's', highlight: [0] })] },
  { note: '字串 )()()) 的開頭右括號不能配對；從下一格開始有連續四格 ()()。', views: [arr(S.split(''), { label: 's', dim: [0,5], highlight: [1,2,3,4] })] },
  { note: '掃到索引 3 時，索引 1、2 已配成 ()，堆疊留下邊界 0，並放入新的開括號索引 3。', views: [arr([0,3], { label: '索引堆疊', highlight: [1] })] },
  { note: '索引 1 的 ( 與索引 2 的 ) 配成第一段 ()，目前有效長度是 2；索引 3 又把新開括號入堆疊。', views: [arr(S.split(''), { label: '第一段配對', done: [1, 2], highlight: [3] })] },
  { note: '掃到第 4 格時，右括號配上第 3 格開括號，和前面的 () 連成長度 4。', views: [arr(S.split(''), { label: '長度 4', done: [1,2,3,4], dim: [0,5] })] },
]

export const q0032: Solution = {
  id: 32,
  plain: '在括號字串中，找一段連在一起、每個括號都正確配對的最長片段。',
  statement: '給只含 ( 與 ) 的字串 s，回傳最長有效括號子字串的長度。',
  examples: [{ input: 's = "(()"', output: '2' }, { input: 's = ")()())"', output: '4' }, { input: 's = ""', output: '0' }],
  constraints: ['0 ≤ s.length ≤ 3 × 10⁴。', '必須連續，不能只挑出部分括號。'],
  insight: ['只要出現無法配對的右括號，它之前的片段就不能再和後面連成一段。', '堆疊保存未配對的開括號索引與最近的邊界。', '也可用 DP：若 s[i] 是右括號，試著與前一段有效片段左側的開括號配對。'],
  approaches: [
    { name: '索引堆疊', idea: '堆疊頂端當作當前有效段的左邊界。', steps: ['堆疊先放 -1。邊界或 dp 初值代表尚未形成有效括號片段。', '遇 ( 就放入索引；遇 ) 就彈出。每讀一個括號，就根據它能否配對更新目前片段。', '彈空則放入當前索引作新邊界；否則用 i - stack.top 更新答案。只有連續且完整配對的長度，才可以用來更新最佳答案。'], figure: { title: `s = "${S}"`, steps: fig }, complexity: { time: 'O(n)', space: 'O(n)', why: '每個索引最多進出堆疊一次。' }, verdict: '最直觀，特別適合追蹤有效段邊界。', code: {
      python: `def longestValidParentheses(s):
    stack = [-1]
    best = 0
    for i, ch in enumerate(s):  # 逐個括號更新目前的配對狀態。
        if ch == '(':  # 依括號種類決定入堆疊或計算有效長度。
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)
            else:
                best = max(best, i - stack[-1])
    return best`,
      c: `int longestValidParentheses(char *s) {
    int n = strlen(s), *a = malloc((n + 1) * sizeof(int)), top = 0, best = 0;
    a[0] = -1;
    for (int i = 0; i < n; i++) {
        if (s[i] == '(')a[++ top] = i;
        else {
            top--;
            if (top < 0)
                a[++ top] = i;
            else if (i - a[top] > best)best = i - a[top];
        }
    }
    free(a);
    return best;
}`,
      cpp: `int longestValidParentheses(string s) {
    vector<int> a {-1};
    int best = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        if (s[i] == '(')a.push_back(i);
        else {
            a.pop_back();
            if (a.empty())
                a.push_back(i);
            else
                best = max(best, i - a.back());
        }
    }
    return best;
}`,
      java: `int longestValidParentheses(String s) {
    Deque<Integer> a = new ArrayDeque<>();
    a.push(-1);
    int best = 0;
    for (int i = 0; i < s.length(); i++) {
        if (s.charAt(i) == '(')a.push(i);
        else {
            a.pop();
            if (a.isEmpty())
                a.push(i);
            else
                best = Math.max(best, i - a.peek());
        }
    }
    return best;
}`,
      javascript: `function longestValidParentheses(s) {
    const a = [-1];
    let best = 0;
    for (let i = 0; i < s.length; i++) {
        if (s[i] === '(')a.push(i);
        else {
            a.pop();
            if (!a.length)
                a.push(i);
            else
                best = Math.max(best, i - a[a.length - 1]);
        }
    }
    return best;
}`,
    } },
    { name: '動態規劃', idea: 'dp[i] 表示恰好在 i 結尾的有效段長度；尋找能配對當前 ) 的左括號。', steps: ['遇 ( 時 dp[i] = 0。邊界或 dp 初值代表尚未形成有效括號片段。', '遇 ) 時令 j = i - 1 - dp[i-1]。每讀一個括號，就根據它能否配對更新目前片段。', '若 j ≥ 0 且 s[j] 是 (，dp[i] = dp[i-1] + 2 + dp[j-1]。只有連續且完整配對的長度，才可以用來更新最佳答案。'], figure: { title: `s = "${S}"`, steps: [fig[0], { note: '索引 2 的 ) 與索引 1 的 ( 配對，所以 dp[2]=2。', views: [arr([0,0,2,0,0,0], { label: 'dp[i]', highlight: [2] })] }, { note: 'i=4 時，索引 3、4 先配成 ()，再接上前一段，所以 dp[4]=4。', views: [arr([0,0,2,0,4,0], { label: 'dp[i]', highlight: [4] })] }] }, complexity: { time: 'O(n)', space: 'O(n)', why: '每個位置只計算一次，保存 dp 陣列。' }, verdict: '能練習「以 i 結尾」的 DP 定義；索引邊界較易寫錯。', code: {
      python: `def longestValidParentheses(s):
    dp = [0] * len(s)
    best = 0
    for i in range(1, len(s)):  # 逐個括號更新目前的配對狀態。
        if s[i] == ')':  # 依括號種類決定入堆疊或計算有效長度。
            j = i - 1 - dp[i - 1]
            if j >= 0 and s[j] == '(':
                dp[i] = dp[i - 1] + 2 + (dp[j - 1] if j else 0)
                best = max(best, dp[i])
    return best`,
      c: `int longestValidParentheses(char *s) {
    int n = strlen(s), *dp = calloc(n + 1, sizeof(int)), best = 0;
    for (int i = 1; i < n; i++)
        if (s[i] == ')') {
            int j = i - 1 - dp[i - 1];
            if (j >= 0 && s[j] == '(') {
                dp[i] = dp[i - 1] + 2 + (j ? dp[j - 1] : 0);
                if (dp[i] > best)
                    best = dp[i];
            }
        }
    free(dp);
    return best;
}`,
      cpp: `int longestValidParentheses(string s) {
    vector<int> dp(s.size());
    int best = 0;
    for (int i = 1; i < (int)s.size(); i++)
        if (s[i] == ')') {
            int j = i - 1 - dp[i - 1];
            if (j >= 0 && s[j] == '(') {
                dp[i] = dp[i - 1] + 2 + (j ? dp[j - 1] : 0);
                best = max(best, dp[i]);
            }
        }
    return best;
}`,
      java: `int longestValidParentheses(String s) {
    int[] dp = new int[s.length()];
    int best = 0;
    for (int i = 1; i < s.length(); i++)
        if (s.charAt(i) == ')') {
            int j = i - 1 - dp[i - 1];
            if (j >= 0 && s.charAt(j) == '(') {
                dp[i] = dp[i - 1] + 2 + (j > 0 ? dp[j - 1] : 0);
                best = Math.max(best, dp[i]);
            }
        }
    return best;
}`,
      javascript: `function longestValidParentheses(s) {
    const dp = Array(s.length).fill(0);
    let best = 0;
    for (let i = 1; i < s.length; i++)
        if (s[i] === ')') {
            const j = i - 1 - dp[i - 1];
            if (j >= 0 && s[j] === '(') {
                dp[i] = dp[i - 1] + 2 + (j ? dp[j - 1] : 0);
                best = Math.max(best, dp[i]);
            }
        }
    return best;
}`,
    } },
  ],
  pitfalls: ['堆疊空了，當前右括號要成為新邊界。', 'DP 的 j 可能小於 0，不可直接讀 s[j]。', '配對成功時別忘了加上 j 前面緊鄰的有效段。'],
  check: { kind: 'fn', fn: 'longestValidParentheses', cases: [{ args: ['(()'], out: 2 }, { args: [S], out: 4 }, { args: [''], out: 0 }, { args: ['()(())'], out: 6 }] },
}
