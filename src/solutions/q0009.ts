import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 9. Palindrome Number
const halfFig: FigStep[] = [
  { note: '12321 從左右讀都一樣。負數有負號,不會是回文;正數若結尾是 0,開頭不可能也是 0。', views: [arr([1, 2, 3, 2, 1], { label: '12321 的各位數', compare: [0, 4] })] },
  { note: '只反轉右半邊:12321 → 左 1232、右 1 → 左 123、右 12 → 左 12、右 123。奇數位時丟掉中間的 3。', views: [arr([12, 123], { label: '剩餘左半 / 反轉右半' }), arr([12, 12], { label: '右半去中位後', done: [0, 1] })] },
]
const stringFig: FigStep[] = [
  { note: '轉成字串後,兩端字元往中間比較。全部相同就是回文。', views: [arr([...('12321')], { label: '字元', compare: [0, 4] })] },
  { note: '比較 1=1、2=2,到中間結束。', views: [arr(['true'], { label: '答案', done: [0] })] },
]

export const q0009: Solution = {
  id: 9,
  plain: '一個數字如果倒過來讀還是一樣,就是回文數。比如 12321 是,123 不是。',
  statement: '給整數 x,判斷它的十進位數字從左往右和從右往左是否相同。',
  examples: [{ input: 'x = 121', output: 'true' }, { input: 'x = -121', output: 'false' }, { input: 'x = 10', output: 'false' }],
  constraints: ['x 為 32 位元帶符號整數', '進階:不用把整數轉成字串'],
  insight: ['負數的負號只出現在左端;結尾是 0 的正數開頭不會有 0。', '只反轉後半部的數字,避免完整反轉可能溢位。', '偶數位比較兩半;奇數位先捨棄反轉半部的中間位。'],
  approaches: [
    {
      name: '只反轉後半數字',
      idea: '持續把 x 的末位搬進 reversed,直到 reversed 不小於剩下的 x。',
      steps: ['負數或非零且尾數為 0 → false', 'reversed 從 0 開始,重複搬走 x 的末位', '偶數位比較 x 與 reversed', '奇數位比較 x 與 reversed/10'],
      figure: { title: 'x = 12321', steps: halfFig },
      complexity: { time: 'O(log x)', space: 'O(1)', why: '只處理一半的十進位數字。' },
      verdict: '符合不用字串的進階要求,也避免反轉整數的溢位問題。',
      code: {
        python: `def isPalindrome(x):
    if x < 0 or (x % 10 == 0 and x != 0):
        return False
    rev = 0
    while x > rev:
        rev = rev * 10 + x % 10
        x //= 10
    return x == rev or x == rev // 10`,
        c: `bool isPalindrome(int x) {
    if (x < 0 || (x % 10 == 0 && x != 0)) return false;
    int rev = 0;
    while (x > rev) {
        rev = rev * 10 + x % 10;
        x /= 10;
    }
    return x == rev || x == rev / 10;
}`,
        cpp: `bool isPalindrome(int x) {
    if (x < 0 || (x % 10 == 0 && x != 0)) return false;
    int rev = 0;
    while (x > rev) {
        rev = rev * 10 + x % 10;
        x /= 10;
    }
    return x == rev || x == rev / 10;
}`,
        java: `boolean isPalindrome(int x) {
    if (x < 0 || (x % 10 == 0 && x != 0)) return false;
    int rev = 0;
    while (x > rev) {
        rev = rev * 10 + x % 10;
        x /= 10;
    }
    return x == rev || x == rev / 10;
}`,
        javascript: `function isPalindrome(x) {
  if (x < 0 || (x % 10 === 0 && x !== 0)) return false;
  let rev = 0;
  while (x > rev) {
    rev = rev * 10 + x % 10;
    x = Math.floor(x / 10);
  }
  return x === rev || x === Math.floor(rev / 10);
}`,
      },
    },
    {
      name: '字串雙指標',
      idea: '把數字變成字串,左右指標同時向中間走,逐位比較。',
      steps: ['把 x 轉成字串 s', 'l = 0,r = len(s)−1', '只要 l < r:不同就回傳 false,相同就往內移', '全部相同回傳 true'],
      figure: { title: '比較兩端字元', steps: stringFig },
      complexity: { time: 'O(log x)', space: 'O(log x)', why: '字串長度等於十進位位數。' },
      verdict: '最容易寫;若面試要求不用字串,改用反轉半邊。',
      code: {
        python: `def isPalindrome(x):
    s = str(x)
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True`,
        c: `bool isPalindrome(int x) {
    char s[16];
    sprintf(s, "%d", x);
    int left = 0, right = strlen(s) - 1;
    while (left < right) {
        if (s[left] != s[right]) return false;
        left++; right--;
    }
    return true;
}`,
        cpp: `bool isPalindrome(int x) {
    string s = to_string(x);
    for (int l = 0, r = s.size() - 1; l < r; l++, r--)
        if (s[l] != s[r]) return false;
    return true;
}`,
        java: `boolean isPalindrome(int x) {
    String s = String.valueOf(x);
    for (int l = 0, r = s.length() - 1; l < r; l++, r--)
        if (s.charAt(l) != s.charAt(r)) return false;
    return true;
}`,
        javascript: `function isPalindrome(x) {
  const s = String(x);
  for (let l = 0, r = s.length - 1; l < r; l++, r--)
    if (s[l] !== s[r]) return false;
  return true;
}`,
      },
    },
  ],
  pitfalls: ['0 本身是回文,不能因為尾數為 0 就一律回傳 false。', '負數不是回文,因為負號不會出現在右邊。', '只反轉一半,不用擔心完整反轉超出 32 位元整數範圍。'],
  check: { kind: 'fn', fn: 'isPalindrome', cases: [
    { args: [121], out: true }, { args: [-121], out: false }, { args: [10], out: false },
    { args: [0], out: true }, { args: [12321], out: true }, { args: [123321], out: true },
  ] },
}
