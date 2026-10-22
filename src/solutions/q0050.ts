import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 50. Pow(x, n)

function bitFig(): FigStep[] {
  const x = 3
  const n = 13
  const bits = n.toString(2).split('').reverse()
  const out: FigStep[] = [{ note: `${x}^${n}:把 ${n} 寫成二進位 ${n.toString(2)} = 8 + 4 + 1,所以 ${x}^${n} = ${x}^8 × ${x}^4 × ${x}^1。而 ${x}^1、${x}^2、${x}^4、${x}^8 只要一直平方就能得到`, views: [arr(bits.slice().reverse(), { label: `${n} 的二進位` })] }]
  let base = x
  let res = 1
  let k = n
  let bit = 0
  while (k > 0) {
    const on = k & 1
    if (on) res *= base
    out.push({ note: `第 ${bit} 位是 ${on}:目前的 base = ${x}^${1 << bit} = ${base}${on ? `,乘進答案 → ${res}` : ',不乘'};然後 base 平方`, views: [arr(bits.slice().reverse(), { label: `${n} 的二進位`, highlight: [bits.length - 1 - bit] }), arr([base, res], { label: '[base, res]' })] })
    base *= base
    k >>= 1
    bit++
  }
  out.push({ note: `答案 ${res}。只做了 log₂(${n}) ≈ 4 輪,而不是乘 ${n} 次`, views: [arr([res], { label: '答案', done: [0] })] })
  return out
}

function recFig(): FigStep[] {
  return [
    { note: 'x^n = (x^(n/2))²(n 偶數);x^n = (x^(n/2))² × x(n 奇數)。每次 n 減半', views: [arr(['3^13', '3^6', '3^3', '3^1', '3^0'], { label: '遞迴往下' })] },
    { note: '回來時:3^0 = 1 → 3^1 = 1²×3 = 3 → 3^3 = 3²×3 = 27 → 3^6 = 27² = 729 → 3^13 = 729²×3 = 1594323', views: [arr([1, 3, 27, 729, 1594323], { label: '回傳值', done: [4] })] },
  ]
}

export const q0050: Solution = {
  id: 50,
  plain: '自己實作「x 的 n 次方」。n 可以到二十億,一次一次乘太慢;要用「平方」的技巧,讓乘法次數只要 log n 次。n 是負數時答案是 1 / x^|n|。',
  statement: '實作 `pow(x, n)`,計算 x 的 n 次方。x 是浮點數,n 是 32 位元整數(可以是負數)。',
  examples: [
    { input: 'x = 2.0, n = 10', output: '1024.0' },
    { input: 'x = 2.1, n = 3', output: '9.261' },
    { input: 'x = 2.0, n = -2', output: '0.25', note: '2⁻² = 1/4' },
  ],
  constraints: ['`−2³¹ ≤ n ≤ 2³¹ − 1` → 不能 O(n)', '答案保證在 ±10⁴ 之內'],
  insight: [
    '一次乘一個 x 要 n 次,n 二十億會超時',
    '**快速冪**:`x^n = (x^(n/2))²`,每次把 n 砍半 → 只要 O(log n) 次乘法',
    'n 是奇數時多乘一個 x。換成迴圈:看 n 的每個二進位位元,是 1 就把對應的 x^(2^k) 乘進答案',
    'n 是負數:算 `(1/x)^(−n)`。注意 `−(−2³¹)` 在 32 位元會溢位,C/Java 要先轉成 64 位元',
  ],
  approaches: [
    {
      name: '遞迴快速冪',
      idea: '`half = pow(x, n // 2)`;n 偶數回傳 `half × half`,奇數回傳 `half × half × x`。n < 0 先換成 `1/x` 和 `−n`。',
      steps: ['n < 0 → `x = 1/x`、`n = −n`', '`f(n)`:n == 0 → 1', '`h = f(n // 2)`;偶數 `h × h`,奇數 `h × h × x`'],
      figure: { title: 'x = 3, n = 13', steps: recFig() },
      complexity: { time: 'O(log n)', space: 'O(log n)', why: '每層 n 減半;遞迴深度 log n ≈ 31。' },
      verdict: '最好理解。關鍵是 `half` 只算一次 —— 寫成 `pow(x, n/2) * pow(x, n/2)` 又會退化成 O(n)。',
      code: {
        python: `def myPow(x, n):
    if n < 0:
        x, n = 1 / x, -n

    def f(k):
        if k == 0:
            return 1.0
        half = f(k // 2)                      # 只算一次
        return half * half * (x if k % 2 else 1)

    return f(n)`,
        c: `static double f(double x, long long k) {
    if (k == 0) return 1.0;
    double half = f(x, k / 2);
    return k % 2 ? half * half * x : half * half;
}

double myPow(double x, int n) {
    long long k = n;                          // -2^31 取負號會溢位,先轉 64 位元
    if (k < 0) { x = 1 / x; k = -k; }
    return f(x, k);
}`,
        cpp: `double f(double x, long long k) {
    if (k == 0) return 1.0;
    double half = f(x, k / 2);
    return k % 2 ? half * half * x : half * half;
}

double myPow(double x, int n) {
    long long k = n;
    if (k < 0) { x = 1 / x; k = -k; }
    return f(x, k);
}`,
        java: `double myPow(double x, int n) {
    long k = n;                               // Integer.MIN_VALUE 取負號會溢位
    if (k < 0) { x = 1 / x; k = -k; }
    return f(x, k);
}

private double f(double x, long k) {
    if (k == 0) return 1.0;
    double half = f(x, k / 2);
    return k % 2 == 1 ? half * half * x : half * half;
}`,
        javascript: `function myPow(x, n) {
  if (n < 0) { x = 1 / x; n = -n; }
  const f = (k) => {
    if (k === 0) return 1;
    const half = f(Math.floor(k / 2));
    return k % 2 ? half * half * x : half * half;
  };
  return f(n);
}`,
      },
    },
    {
      name: '迭代快速冪(看二進位)',
      idea: '`res = 1`。當 n > 0:最低位是 1 → `res *= x`;`x *= x`;`n >>= 1`。',
      steps: ['n < 0 → `x = 1/x`、`n = −n`', '`while n`:`n & 1` → `res *= x`', '`x *= x`、`n >>= 1`'],
      figure: { title: 'x = 3, n = 13', steps: bitFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: 'n 有幾個二進位位元就跑幾輪。' },
      verdict: '最推薦:不用遞迴,空間 O(1)。這個寫法也用在「矩陣快速冪」、模數下的冪次。',
      code: {
        python: `def myPow(x, n):
    if n < 0:
        x, n = 1 / x, -n
    res = 1.0
    while n:
        if n & 1:                             # 這一位是 1:把目前的 x^(2^k) 乘進來
            res *= x
        x *= x                                # x^(2^k) → x^(2^(k+1))
        n >>= 1
    return res`,
        c: `double myPow(double x, int n) {
    long long k = n;
    if (k < 0) { x = 1 / x; k = -k; }
    double res = 1.0;
    while (k) {
        if (k & 1) res *= x;
        x *= x;
        k >>= 1;
    }
    return res;
}`,
        cpp: `double myPow(double x, int n) {
    long long k = n;
    if (k < 0) { x = 1 / x; k = -k; }
    double res = 1.0;
    while (k) {
        if (k & 1) res *= x;
        x *= x;
        k >>= 1;
    }
    return res;
}`,
        java: `double myPow(double x, int n) {
    long k = n;
    if (k < 0) { x = 1 / x; k = -k; }
    double res = 1.0;
    while (k > 0) {
        if ((k & 1) == 1) res *= x;
        x *= x;
        k >>= 1;
    }
    return res;
}`,
        javascript: `function myPow(x, n) {
  if (n < 0) { x = 1 / x; n = -n; }
  let res = 1;
  while (n > 0) {
    if (n % 2 === 1) res *= x;               // JS 的位元運算只有 32 位元,-(-2^31) 會出錯,用 % 和除法
    x *= x;
    n = Math.floor(n / 2);
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '`n = −n` 在 C/Java 遇到 −2³¹ 會溢位(還是 −2³¹):先轉成 long',
    '遞迴寫成 `pow(x, n/2) * pow(x, n/2)`:兩個分支,總共 O(n) 次呼叫',
    'JavaScript 用 `n >>= 1`:位元運算會把數字轉成 32 位元有號整數,2³¹ 會變成負數',
  ],
  followUp: [{ q: '算 x^n mod p(整數)?', a: '一樣的迴圈,每次乘完取 mod。這是 372 Super Pow、費氏數列矩陣快速冪的基礎。' }],
  check: {
    kind: 'fn',
    fn: 'myPow',
    compare: 'close',
    cases: [
      { args: [2.0, 10], out: 1024.0 },
      { args: [2.1, 3], out: 9.261 },
      { args: [2.0, -2], out: 0.25 },
      { args: [1.0, -2147483648], out: 1.0 },
      { args: [0.5, 0], out: 1.0 },
      { args: [-2.0, 3], out: -8.0 },
    ],
  },
}
