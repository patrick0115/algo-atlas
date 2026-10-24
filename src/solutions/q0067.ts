import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 67. Add Binary

const A = '1011'
const B = '111'

function carryFig(): FigStep[] {
  let i = A.length - 1
  let j = B.length - 1
  let carry = 0
  const res: string[] = []
  const out: FigStep[] = [{ note: '和直式加法一樣:從最右邊(最低位)開始,每一位相加再加上進位。二進位逢 2 進 1', views: [arr(A.split(''), { label: 'a' }), arr(B.split(''), { label: 'b' })] }]
  while (i >= 0 || j >= 0 || carry) {
    const x = i >= 0 ? +A[i] : 0
    const y = j >= 0 ? +B[j] : 0
    const s = x + y + carry
    res.push(String(s % 2))
    out.push({ note: `${x} + ${y} + 進位 ${carry} = ${s} → 這一位寫 ${s % 2},進位 ${s >> 1}`, views: [arr(A.split(''), { label: 'a', highlight: i >= 0 ? [i] : [] }), arr(B.split(''), { label: 'b', highlight: j >= 0 ? [j] : [] }), arr([...res].reverse(), { label: '結果(由右往左長)', highlight: [0] })] })
    carry = s >> 1
    i--
    j--
  }
  return out
}

function bitFig(): FigStep[] {
  const n = Math.max(A.length, B.length)
  return [
    { note: '把兩個字串左邊補 0 到一樣長,每一位用「全加器」的規則:和 = x ⊕ y ⊕ c,進位 = 多數決(三個裡至少兩個是 1)', views: [arr(A.padStart(n, '0').split(''), { label: 'a(補 0)' }), arr(B.padStart(n, '0').split(''), { label: 'b(補 0)' })] },
    { note: '從右到左算完,最後還有進位就在最前面補 1 → "10010"(11 + 7 = 18)', views: [arr('10010'.split(''), { label: '結果', done: [0, 1, 2, 3, 4] })] },
  ]
}

export const q0067: Solution = {
  id: 67,
  plain: '兩個用 0 和 1 寫成的二進位數字(字串),把它們加起來,結果也用二進位字串表示。就像小學的直式加法,只是滿 2 就進位。',
  statement: '給兩個二進位字串 `a`、`b`(沒有前導零,除了 "0" 本身),回傳它們的和(二進位字串)。',
  examples: [
    { input: 'a = "11", b = "1"', output: '"100"' },
    { input: 'a = "1010", b = "1011"', output: '"10101"' },
  ],
  constraints: ['長度 ≤ 10⁴ → 不能轉成 int / long 再加(會溢位)'],
  insight: ['字串可能有一萬位,不能直接轉整數', '模擬直式加法:兩個指標從尾巴往前,帶著進位', '兩個都走完但還有進位時,要多寫一個 1'],
  approaches: [
    {
      name: '從尾巴模擬直式加法',
      idea: '`i`、`j` 從尾巴往前,`s = a[i] + b[j] + carry`,寫下 `s % 2`,`carry = s // 2`;最後反轉。',
      steps: ['`i, j = len(a) − 1, len(b) − 1`、`carry = 0`', '`while i >= 0 or j >= 0 or carry`:', '`s = carry + (a[i] if i >= 0) + (b[j] if j >= 0)`', '寫下 `s % 2`,`carry = s // 2`,`i -= 1`、`j -= 1`', '結果反轉'],
      figure: { title: `a = "${A}",b = "${B}"`, steps: carryFig() },
      complexity: { time: 'O(max(m, n))', space: 'O(max(m, n))', why: '每一位處理一次;輸出長度最多 max + 1。' },
      verdict: '最推薦。「大數加法」的模板,[2. Add Two Numbers](#/q/2)、415. Add Strings 都是同一套。',
      code: {
        python: `def addBinary(a, b):
    i, j, carry = len(a) - 1, len(b) - 1, 0
    res = []
    while i >= 0 or j >= 0 or carry:          # 最後的進位也要寫出來
        s = carry
        if i >= 0:
            s += int(a[i]); i -= 1
        if j >= 0:
            s += int(b[j]); j -= 1
        res.append(str(s % 2))
        carry = s // 2
    return ''.join(reversed(res))`,
        c: `char *addBinary(char *a, char *b) {
    int i = strlen(a) - 1, j = strlen(b) - 1, n = (i > j ? i : j) + 2, k = n, carry = 0;
    char *res = malloc(n + 1);
    res[n] = '\\0';
    while (i >= 0 || j >= 0 || carry) {
        int s = carry;
        if (i >= 0) s += a[i--] - '0';
        if (j >= 0) s += b[j--] - '0';
        res[--k] = '0' + s % 2;               // 從後面往前填,就不用反轉
        carry = s / 2;
    }
    memmove(res, res + k, n - k + 1);         // 前面沒用到的格子拿掉
    return res;
}`,
        cpp: `string addBinary(string a, string b) {
    int i = a.size() - 1, j = b.size() - 1, carry = 0;
    string res;
    while (i >= 0 || j >= 0 || carry) {
        int s = carry;
        if (i >= 0) s += a[i--] - '0';
        if (j >= 0) s += b[j--] - '0';
        res += char('0' + s % 2);
        carry = s / 2;
    }
    reverse(res.begin(), res.end());
    return res;
}`,
        java: `String addBinary(String a, String b) {
    int i = a.length() - 1, j = b.length() - 1, carry = 0;
    StringBuilder res = new StringBuilder();
    while (i >= 0 || j >= 0 || carry > 0) {
        int s = carry;
        if (i >= 0) s += a.charAt(i--) - '0';
        if (j >= 0) s += b.charAt(j--) - '0';
        res.append(s % 2);
        carry = s / 2;
    }
    return res.reverse().toString();
}`,
        javascript: `function addBinary(a, b) {
  let i = a.length - 1, j = b.length - 1, carry = 0;
  const res = [];
  while (i >= 0 || j >= 0 || carry) {
    let s = carry;
    if (i >= 0) s += +a[i--];
    if (j >= 0) s += +b[j--];
    res.push(s % 2);
    carry = s >> 1;
  }
  return res.reverse().join('');
}`,
      },
    },
    {
      name: '補零對齊 + 全加器位元運算',
      idea: '左邊補 0 到等長;每位 `sum = x ^ y ^ c`、`c = (x & y) | (c & (x ^ y))`。',
      steps: ['`n = max(len)`,兩個都 `zfill(n)`', '`for k in n−1..0`:`x, y` 取這一位', '`res[k] = x ^ y ^ c`;`c = (x & y) | (c & (x ^ y))`', '`c` 還是 1 → 前面補 "1"'],
      figure: { title: `a = "${A}",b = "${B}"`, steps: bitFig() },
      complexity: { time: 'O(max(m, n))', space: 'O(max(m, n))', why: '同上。' },
      verdict: '用[[p:bit-manipulation]]的方式表達加法,和硬體電路的全加器一模一樣。補零後迴圈裡不用判斷越界。',
      code: {
        python: `def addBinary(a, b):
    n = max(len(a), len(b))
    a, b = a.zfill(n), b.zfill(n)             # 左邊補 0 對齊
    res, c = [''] * n, 0
    for k in range(n - 1, -1, -1):
        x, y = int(a[k]), int(b[k])
        res[k] = str(x ^ y ^ c)               # 和:三個做 XOR
        c = (x & y) | (c & (x ^ y))           # 進位:至少兩個是 1
    return ('1' if c else '') + ''.join(res)`,
        c: `char *addBinary(char *a, char *b) {
    int la = strlen(a), lb = strlen(b), n = la > lb ? la : lb, c = 0;
    char *res = malloc(n + 2);
    res[n + 1] = '\\0';
    for (int k = n - 1; k >= 0; k--) {
        int x = k - (n - la) >= 0 ? a[k - (n - la)] - '0' : 0;   // 等於左邊補 0
        int y = k - (n - lb) >= 0 ? b[k - (n - lb)] - '0' : 0;
        res[k + 1] = '0' + (x ^ y ^ c);
        c = (x & y) | (c & (x ^ y));
    }
    if (c) { res[0] = '1'; return res; }
    memmove(res, res + 1, n + 1);
    return res;
}`,
        cpp: `string addBinary(string a, string b) {
    int n = max(a.size(), b.size()), c = 0;
    a.insert(0, n - a.size(), '0');
    b.insert(0, n - b.size(), '0');
    string res(n, '0');
    for (int k = n - 1; k >= 0; k--) {
        int x = a[k] - '0', y = b[k] - '0';
        res[k] = '0' + (x ^ y ^ c);
        c = (x & y) | (c & (x ^ y));
    }
    return c ? "1" + res : res;
}`,
        java: `String addBinary(String a, String b) {
    int n = Math.max(a.length(), b.length()), c = 0;
    a = "0".repeat(n - a.length()) + a;
    b = "0".repeat(n - b.length()) + b;
    char[] res = new char[n];
    for (int k = n - 1; k >= 0; k--) {
        int x = a.charAt(k) - '0', y = b.charAt(k) - '0';
        res[k] = (char) ('0' + (x ^ y ^ c));
        c = (x & y) | (c & (x ^ y));
    }
    return (c == 1 ? "1" : "") + new String(res);
}`,
        javascript: `function addBinary(a, b) {
  const n = Math.max(a.length, b.length);
  a = a.padStart(n, '0');
  b = b.padStart(n, '0');
  const res = new Array(n);
  let c = 0;
  for (let k = n - 1; k >= 0; k--) {
    const x = +a[k], y = +b[k];
    res[k] = x ^ y ^ c;
    c = (x & y) | (c & (x ^ y));
  }
  return (c ? '1' : '') + res.join('');
}`,
      },
    },
  ],
  pitfalls: ['轉成整數再相加:一萬位遠超過 64 位元', '迴圈條件漏了 `or carry`:"1" + "1" 會得到 "0" 而不是 "10"'],
  check: {
    kind: 'fn',
    fn: 'addBinary',
    cases: [
      { args: ['11', '1'], out: '100' },
      { args: ['1010', '1011'], out: '10101' },
      { args: [A, B], out: '10010' },
      { args: ['0', '0'], out: '0' },
      { args: ['1', '111'], out: '1000' },
    ],
  },
}
