import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 7. Reverse Integer

function popFig(): FigStep[] {
  let x = 1234
  let res = 0
  const out: FigStep[] = [{ note: '用 % 10 拿最後一位、用 / 10 把最後一位丟掉。每拿到一位,就 res = res × 10 + 這一位', views: [arr([x, res], { label: '[x, res]' })] }]
  while (x !== 0) {
    const d = x % 10
    x = Math.trunc(x / 10)
    res = res * 10 + d
    out.push({ note: `拿出 ${d} → x = ${x},res = ${res}`, views: [arr([x, res], { label: '[x, res]', highlight: [1] })] })
  }
  return out
}

function overflowFig(): FigStep[] {
  return [
    { note: '32 位元有號整數最大是 2147483647。反轉 1534236469 會得到 9646324351,超過了 → 回傳 0', views: [arr(['2147483647', '9646324351'], { label: '[上限, 反轉後]', compare: [1] })] },
    { note: '環境只能存 32 位元時,要在「乘 10 之前」先檢查:res > 214748364 → 乘 10 一定爆;res == 214748364 時看最後一位是不是 > 7', views: [arr(['res > MAX / 10', 'res == MAX / 10 且 d > 7'], { label: '會溢位的條件(正數)' })] },
  ]
}

export const q0007: Solution = {
  id: 7,
  plain: '把一個整數的數字**倒過來**,例如 123 → 321、−123 → −321、120 → 21。但如果倒過來之後超過 32 位元整數能存的範圍,就回傳 0。',
  statement: '給 32 位元有號整數 `x`,回傳數字反轉後的結果。若反轉後超出 `[−2³¹, 2³¹ − 1]`,回傳 0。假設環境不能儲存 64 位元整數。',
  examples: [
    { input: 'x = 123', output: '321' },
    { input: 'x = -123', output: '-321' },
    { input: 'x = 120', output: '21' },
    { input: 'x = 1534236469', output: '0', note: '反轉後 9646324351 超出範圍' },
  ],
  constraints: ['`−2³¹ ≤ x ≤ 2³¹ − 1`'],
  insight: [
    '「拿最後一位」是 `x % 10`,「去掉最後一位」是 `x / 10`。每拿一位就接到答案後面:`res = res × 10 + d`',
    '負數:C/Java/C++ 的 `%` 和 `/` 會保留正負號(−123 % 10 = −3),所以同一套迴圈就能處理。Python 的 `%` 不一樣,要先取絕對值',
    '溢位:題目假設不能用 64 位元,所以要在乘 10 **之前**判斷會不會爆',
  ],
  approaches: [
    {
      name: '轉成字串反轉',
      idea: '取絕對值轉字串、反轉、轉回整數、補上負號,最後檢查範圍。',
      steps: ['`s = str(abs(x))[::-1]`', '`res = int(s)`,x < 0 就加負號', '超出範圍 → 0'],
      figure: { title: '溢位判斷', steps: overflowFig() },
      complexity: { time: 'O(log |x|)', space: 'O(log |x|)', why: '位數是 log₁₀|x|,最多 10 位。' },
      verdict: '最好寫,但違反「不能用 64 位元」的精神(轉回整數那一步需要更大的型別)。',
      code: {
        python: `def reverse(x):
    sign = -1 if x < 0 else 1
    res = sign * int(str(abs(x))[::-1])
    return res if -2**31 <= res <= 2**31 - 1 else 0`,
        c: `int reverse(int x) {
    char buf[16];
    long long v = x;
    int neg = v < 0;
    if (neg) v = -v;
    int len = sprintf(buf, "%lld", v);
    long long res = 0;
    for (int i = len - 1; i >= 0; i--) res = res * 10 + (buf[i] - '0');
    if (neg) res = -res;
    return (res < INT_MIN || res > INT_MAX) ? 0 : (int)res;
}`,
        cpp: `int reverse(int x) {
    string s = to_string(llabs((long long)x));
    std::reverse(s.begin(), s.end());
    long long res = stoll(s);
    if (x < 0) res = -res;
    return (res < INT_MIN || res > INT_MAX) ? 0 : (int)res;
}`,
        java: `int reverse(int x) {
    String s = new StringBuilder(Long.toString(Math.abs((long) x))).reverse().toString();
    long res = Long.parseLong(s);
    if (x < 0) res = -res;
    return (res < Integer.MIN_VALUE || res > Integer.MAX_VALUE) ? 0 : (int) res;
}`,
        javascript: `function reverse(x) {
  const res = Math.sign(x) * Number(String(Math.abs(x)).split('').reverse().join(''));
  return res < -(2 ** 31) || res > 2 ** 31 - 1 ? 0 : res;
}`,
      },
    },
    {
      name: '逐位取出 + 乘 10 前檢查溢位',
      idea: '`d = x % 10`、`x /= 10`。在 `res = res × 10 + d` 之前,先檢查 `res` 是否超過 `MAX / 10`(或低於 `MIN / 10`)。',
      steps: ['`while x != 0`:`d = x % 10`、`x /= 10`', '`res > MAX/10` 或 `res == MAX/10 且 d > 7` → 0', '`res < MIN/10` 或 `res == MIN/10 且 d < −8` → 0', '`res = res × 10 + d`'],
      figure: { title: 'x = 1234', steps: popFig() },
      complexity: { time: 'O(log |x|)', space: 'O(1)', why: '最多 10 位。' },
      verdict: '最推薦,符合題目限制。Python 沒有溢位問題,用絕對值處理即可。',
      code: {
        python: `def reverse(x):
    MAX = 2**31 - 1
    sign = -1 if x < 0 else 1
    x, res = abs(x), 0                        # Python 的 % 對負數不同,先取絕對值
    while x:
        d = x % 10
        x //= 10
        if res > (MAX - d) // 10:             # res * 10 + d > MAX?
            return 0
        res = res * 10 + d
    if sign == 1:
        return res
    return -res if res <= MAX + 1 else 0`,
        c: `int reverse(int x) {
    int res = 0;
    while (x != 0) {
        int d = x % 10;                       // 負數時 d 也是負的
        x /= 10;
        if (res > INT_MAX / 10 || (res == INT_MAX / 10 && d > 7)) return 0;
        if (res < INT_MIN / 10 || (res == INT_MIN / 10 && d < -8)) return 0;
        res = res * 10 + d;
    }
    return res;
}`,
        cpp: `int reverse(int x) {
    int res = 0;
    while (x != 0) {
        int d = x % 10;
        x /= 10;
        if (res > INT_MAX / 10 || (res == INT_MAX / 10 && d > 7)) return 0;
        if (res < INT_MIN / 10 || (res == INT_MIN / 10 && d < -8)) return 0;
        res = res * 10 + d;
    }
    return res;
}`,
        java: `int reverse(int x) {
    int res = 0;
    while (x != 0) {
        int d = x % 10;
        x /= 10;
        if (res > Integer.MAX_VALUE / 10 || (res == Integer.MAX_VALUE / 10 && d > 7)) return 0;
        if (res < Integer.MIN_VALUE / 10 || (res == Integer.MIN_VALUE / 10 && d < -8)) return 0;
        res = res * 10 + d;
    }
    return res;
}`,
        javascript: `function reverse(x) {
  const MAX = 2 ** 31 - 1, MIN = -(2 ** 31);
  let res = 0;
  while (x !== 0) {
    const d = x % 10;                         // JS 的 % 也保留正負號
    x = Math.trunc(x / 10);
    if (res > Math.trunc(MAX / 10) || (res === Math.trunc(MAX / 10) && d > 7)) return 0;
    if (res < Math.trunc(MIN / 10) || (res === Math.trunc(MIN / 10) && d < -8)) return 0;
    res = res * 10 + d;
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '先算 `res × 10 + d` 再檢查:在 C/Java 裡已經溢位,值是錯的(而且有號溢位在 C 是未定義行為)',
    'Python 對負數用 `%`:`−123 % 10 = 7`,不是 −3',
    '`abs(−2³¹)` 在 32 位元會溢位:C/Java 的字串版本要先轉成 64 位元',
  ],
  check: {
    kind: 'fn',
    fn: 'reverse',
    cases: [
      { args: [123], out: 321 },
      { args: [-123], out: -321 },
      { args: [120], out: 21 },
      { args: [0], out: 0 },
      { args: [1534236469], out: 0 },
      { args: [-2147483648], out: 0 },
      { args: [-2147483412], out: -2143847412 },
      { args: [1463847412], out: 2147483641 },
    ],
  },
}
