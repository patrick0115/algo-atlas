import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 856. Score of Parentheses
const S = '(()(()))'

export const q0856: Solution = {
  id: 856,
  plain: '括號像一層層包裝：最裡面的 () 值 1；兩段並排就相加；外面再包一層就乘 2。',
  statement: '給合法且非空的括號字串 s，依規則 () = 1、AB = A + B、(A) = 2A，計算總分。',
  examples: [
    { input: 's = "()"', output: '1' },
    { input: 's = "(())"', output: '2' },
    { input: 's = "()()"', output: '2' },
    { input: 's = "(()(()))"', output: '6' },
  ],
  constraints: ['2 ≤ s.length ≤ 50；字串保證括號配對正確。'],
  insight: ['每個最小單位 () 的貢獻由外面包了幾層決定：外層每增加一層，分數乘 2。', '若直接按文法合併，堆疊可保存尚未完成的外層分數。'],
  approaches: [
    {
      name: '只統計最小單位的深度',
      idea: '每次看見緊鄰的 ()，它位於深度 d 時，貢獻 2 的 d−1 次方。',
      steps: ['遇到 (，深度加一。', '遇到 ) 時，若前一個字元是 (，把 2^(深度−1) 加入答案。', '離開這層括號，深度減一。'],
      figure: { title: 's = (()(()))', steps: [
        { note: '第一個 ( 進入深度 1，接著第二個 ( 進入深度 2。', views: [arr(S.split(''), { done: [0], highlight: [1] })] },
        { note: '索引 1–2 是最小單位 ()，深度 2，貢獻 2；之後回到深度 1。', views: [arr(S.split(''), { done: [0, 1], highlight: [2] })] },
        { note: '索引 3 的 (、索引 4 的 ( 進到深度 3。', views: [arr(S.split(''), { done: [0, 1, 2], highlight: [3, 4] })] },
        { note: '索引 4–5 的 () 深度 3，貢獻 4，累計 6。', views: [arr(S.split(''), { done: [0, 1, 2, 3, 4], highlight: [5] })] },
        { note: '剩下兩個 ) 只關閉外層，不是緊鄰的 ()；答案保持 6。', views: [arr(S.split(''), { done: [0, 1, 2, 3, 4, 5], highlight: [6, 7] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只用深度和答案兩個變數。' },
      verdict: '程式短；必須理解每個 () 的倍數來自外層深度。',
      code: {
        python: `def scoreOfParentheses(s):
    depth = 0
    answer = 0
    for i, ch in enumerate(s):
        if ch == '(':
            depth += 1
        else:
            if s[i - 1] == '(':
                answer += 1 << (depth - 1)  # 最小 () 的外層每多一層就倍增
            depth -= 1
    return answer`,
        c: `int scoreOfParentheses(char *s) {
    int depth = 0;
    int answer = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (s[i] == '(') {
            depth++;
        } else {
            if (i > 0 && s[i - 1] == '(') {
                answer += 1 << (depth - 1);
            }
            depth--;
        }
    }
    return answer;
}`,
        cpp: `int scoreOfParentheses(string s) {
    int depth = 0;
    int answer = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        if (s[i] == '(') {
            depth++;
        } else {
            if (i > 0 && s[i - 1] == '(') {
                answer += 1 << (depth - 1);
            }
            depth--;
        }
    }
    return answer;
}`,
        java: `int scoreOfParentheses(String s) {
    int depth = 0;
    int answer = 0;
    for (int i = 0; i < s.length(); i++) {
        if (s.charAt(i) == '(') {
            depth++;
        } else {
            if (i > 0 && s.charAt(i - 1) == '(') {
                answer += 1 << (depth - 1);
            }
            depth--;
        }
    }
    return answer;
}`,
        javascript: `function scoreOfParentheses(s) {
  let depth = 0;
  let answer = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      depth++;
    } else {
      if (s[i - 1] === '(') {
        answer += 2 ** (depth - 1);
      }
      depth--;
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '堆疊記錄每一層分數',
      idea: '每遇到 ( 就開一個 0 分的新層；遇到 ) 就完成這層，再加回外層。',
      steps: ['堆疊先放總分 0。', '遇到 (，推入新層 0。', '遇到 )，取出本層 x；新分數為 max(1, 2x)，加進堆疊頂端。', '最後堆疊只剩總分。'],
      figure: { title: 's = (()(()))', steps: [
        { note: '最外層與第二層都打開，堆疊是總分 0、外層 0、內層 0。', views: [arr([0, 0, 0], { label: '分數堆疊', highlight: [2] })] },
        { note: '第一個內層 () 完成，0 分新層變成 1；外層暫得 1。', views: [arr([0, 1], { label: '分數堆疊', highlight: [1] })] },
        { note: '再打開兩層，新的最小 () 也先得到 1 分。', views: [arr([0, 1, 1], { label: '分數堆疊', highlight: [2] })] },
        { note: '包住它的一層關閉：1 乘 2 = 2，加到原本的 1，外層共有 3。', views: [arr([0, 3], { label: '分數堆疊', highlight: [1] })] },
        { note: '最外層關閉，3 乘 2 = 6，總分是 6。', views: [arr([6], { label: '分數堆疊', done: [0] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個括號入堆疊或出堆疊一次，最深可能有 n 層。' },
      verdict: '直接對應題目的「並排相加、包一層乘二」規則。',
      code: {
        python: `def scoreOfParentheses(s):
    stack = [0]
    for ch in s:
        if ch == '(':
            stack.append(0)  # 新的一層從 0 分開始
        else:
            inner = stack.pop()
            stack[-1] += max(1, 2 * inner)  # 空層 () 算 1 分
    return stack[0]`,
        c: `int scoreOfParentheses(char *s) {
    int n = strlen(s);
    int *stack = calloc(n + 1, sizeof(int));
    int top = 0;
    for (int i = 0; i < n; i++) {
        if (s[i] == '(') {
            stack[++top] = 0;
        } else {
            int inner = stack[top--];
            stack[top] += inner == 0 ? 1 : 2 * inner;
        }
    }
    int answer = stack[0];
    free(stack);
    return answer;
}`,
        cpp: `int scoreOfParentheses(string s) {
    vector<int> stack{0};
    for (char ch : s) {
        if (ch == '(') {
            stack.push_back(0);
        } else {
            int inner = stack.back();
            stack.pop_back();
            stack.back() += inner == 0 ? 1 : 2 * inner;
        }
    }
    return stack[0];
}`,
        java: `int scoreOfParentheses(String s) {
    Deque<Integer> stack = new ArrayDeque<>();
    stack.push(0);
    for (char ch : s.toCharArray()) {
        if (ch == '(') {
            stack.push(0);
        } else {
            int inner = stack.pop();
            int outer = stack.pop();
            stack.push(outer + (inner == 0 ? 1 : 2 * inner));
        }
    }
    return stack.peek();
}`,
        javascript: `function scoreOfParentheses(s) {
  const stack = [0];
  for (const ch of s) {
    if (ch === '(') {
      stack.push(0);
    } else {
      const inner = stack.pop();
      stack[stack.length - 1] += inner === 0 ? 1 : 2 * inner;
    }
  }
  return stack[0];
}`,
      },
    },
  ],
  pitfalls: ['計算 () 的貢獻時，用的是右括號出現前的深度 d，分數為 2^(d−1)。', '堆疊法在內層分數為 0 時要回傳 1，不是 0。'],
  check: { kind: 'fn', fn: 'scoreOfParentheses', cases: [
    { args: ['()'], out: 1 },
    { args: ['(())'], out: 2 },
    { args: ['()()'], out: 2 },
    { args: [S], out: 6 },
  ] },
}
