import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const S = '()))(('
const countFig: FigStep[] = [
  { note: 'balance 是尚未配對的左括號數，missing 是必須補的左括號數；起初都是 0。', views: [arr([...S], { label: 's' }), arr([0, 0], { label: 'balance / missing' })] },
  { note: '先讀到 (、)，一開一關成功配對，balance 回到 0。', views: [arr([...S], { label: 's', done: [0, 1] }), arr([0, 0], { label: 'balance / missing' })] },
  { note: '接下來兩個 ) 都沒有可用的左括號，missing 依序變 1、2。', views: [arr([...S], { label: 's', done: [0, 1], highlight: [2, 3] }), arr([0, 2], { label: 'balance / missing' })] },
  { note: '最後兩個 ( 沒有右括號，balance 變 2；需補 2 個左括號加 2 個右括號，答案 4。', views: [arr([...S], { label: 's', highlight: [4, 5] }), arr([4], { label: '答案', done: [0] })] },
]
const stackFig: FigStep[] = [
  { note: '堆疊只保存尚未配對的括號，初始為空。', views: [arr([...S], { label: 's' }), arr([], { label: '堆疊' })] },
  { note: '讀到前兩格 (、)：右括號把棧頂的左括號配掉，堆疊回到空。', views: [arr([...S], { label: 's', done: [0, 1] }), arr([], { label: '堆疊' })] },
  { note: '接著兩個 ) 沒有左括號可配，依序入棧。', views: [arr([...S], { label: 's', highlight: [2, 3] }), arr([')', ')'], { label: '堆疊' })] },
  { note: '最後兩個 ( 也入棧；剩下 4 個未配對符號，每個都要補一個，答案為 4。', views: [arr([')', ')', '(', '('], { label: '未配對', done: [0, 1, 2, 3] })] },
]

export const q0921: Solution = {
  id: 921,
  plain: '只准插入括號，要讓字串變成有效括號序列，最少插入幾個？',
  statement: '給定只含 ( 與 ) 的字串 s。可在任意位置插入一個括號；回傳使所有括號正確配對的最少插入次數。',
  examples: [{ input: 's = "())"', output: '1' }, { input: 's = "((("', output: '3' }, { input: 's = "()))(("', output: '4' }],
  constraints: ['1 ≤ s.length ≤ 1000'],
  insight: ['沒有左括號可配的右括號，只能在它前面補左括號。', '掃完仍未配對的左括號，只能在後面補右括號。', '答案就是這兩類未配對括號的總數。'],
  approaches: [
    {
      name: '兩個計數器',
      idea: 'balance 記未配對左括號；遇到無法配對的右括號就增加 missing，最後回傳兩者之和。',
      steps: ['balance=missing=0', '讀到 ( 就增加 balance', '讀到 )：若 balance>0 就扣一，否則 missing 加一', '回傳 balance+missing'],
      figure: { title: 's = "()))(("', steps: countFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只掃一次，保留兩個整數。' },
      verdict: '最簡潔的 [[p:greedy]] 做法。',
      code: {
        python: `def minAddToMakeValid(s):
    balance = missing = 0
    for ch in s:
        if ch == '(':
            balance += 1                 # 尚未配到右括號
        elif balance:
            balance -= 1                 # 配掉一個左括號
        else:
            missing += 1                 # 必須補左括號
    return missing + balance             # 再補右括號`,
        c: `int minAddToMakeValid(char *s) {
    int balance = 0;
    int missing = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (s[i] == '(') {
            balance++;
        } else if (balance > 0) {
            balance--;
        } else {
            missing++;
        }
    }
    return missing + balance;
}`,
        cpp: `int minAddToMakeValid(string s) {
    int balance = 0;
    int missing = 0;
    for (char ch : s) {
        if (ch == '(') {
            balance++;
        } else if (balance > 0) {
            balance--;
        } else {
            missing++;
        }
    }
    return missing + balance;
}`,
        java: `int minAddToMakeValid(String s) {
    int balance = 0;
    int missing = 0;
    for (char ch : s.toCharArray()) {
        if (ch == '(') {
            balance++;
        } else if (balance > 0) {
            balance--;
        } else {
            missing++;
        }
    }
    return missing + balance;
}`,
        javascript: `function minAddToMakeValid(s) {
  let balance = 0;
  let missing = 0;
  for (const ch of s) {
    if (ch === '(') {
      balance++;
    } else if (balance > 0) {
      balance--;
    } else {
      missing++;
    }
  }
  return missing + balance;
}`,
      },
    },
    {
      name: '堆疊保存未配對括號',
      idea: '讀到右括號且棧頂是左括號就彈出；其他情況把目前括號入棧，最後棧長即答案。',
      steps: ['準備空堆疊', '讀到可與棧頂配對的 ) 時彈出 (', '其他括號一律入棧', '堆疊剩餘個數就是最少插入數'],
      figure: { title: 's = "()))(("', steps: stackFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個括號最多入棧及出棧一次。' },
      verdict: '較直觀地展示 [[p:stack]] 配對；計數器是它的空間優化。',
      code: {
        python: `def minAddToMakeValid(s):
    stack = []
    for ch in s:
        if ch == ')' and stack and stack[-1] == '(':
            stack.pop()                  # 配對成功
        else:
            stack.append(ch)            # 尚未配對
    return len(stack)`,
        c: `int minAddToMakeValid(char *s) {
    int n = strlen(s);
    char *stack = malloc(n + 1);
    int top = 0;
    for (int i = 0; i < n; i++) {
        if (s[i] == ')' && top > 0 && stack[top - 1] == '(') {
            top--;
        } else {
            stack[top++] = s[i];
        }
    }
    free(stack);
    return top;
}`,
        cpp: `int minAddToMakeValid(string s) {
    string stack;
    for (char ch : s) {
        if (ch == ')' && !stack.empty() && stack.back() == '(') {
            stack.pop_back();
        } else {
            stack.push_back(ch);
        }
    }
    return stack.size();
}`,
        java: `int minAddToMakeValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char ch : s.toCharArray()) {
        if (ch == ')' && !stack.isEmpty() && stack.peekLast() == '(') {
            stack.removeLast();
        } else {
            stack.addLast(ch);
        }
    }
    return stack.size();
}`,
        javascript: `function minAddToMakeValid(s) {
  const stack = [];
  for (const ch of s) {
    if (ch === ')' && stack.length && stack[stack.length - 1] === '(') {
      stack.pop();
    } else {
      stack.push(ch);
    }
  }
  return stack.length;
}`,
      },
    },
  ],
  pitfalls: ['遇到沒有可配左括號的 ) 時，補的是左括號。', '掃完留下的 ( 要補右括號。', '有效括號序列的任意前綴都不能有右括號多於左括號。'],
  check: { kind: 'fn', fn: 'minAddToMakeValid', cases: [
    { args: ['())'], out: 1 },
    { args: ['((('], out: 3 },
    { args: [S], out: 4 },
    { args: ['()'], out: 0 },
    { args: [')('], out: 2 },
  ] },
}
