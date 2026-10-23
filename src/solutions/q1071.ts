import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1071. Greatest Common Divisor of Strings

const S1 = 'ABABAB'
const S2 = 'ABAB'

function gcdFig(): FigStep[] {
  const g = (a: number, b: number): number => (b ? g(b, a % b) : a)
  const k = g(S1.length, S2.length)
  return [
    { note: `關鍵檢查:如果兩個字串都是同一個 x 重複出來的,那 str1 + str2 和 str2 + str1 一定一樣(都是 x 重複很多次)。"${S1}" + "${S2}" 和 "${S2}" + "${S1}" 一樣嗎?`, views: [arr((S1 + S2).split(''), { label: 'str1 + str2' }), arr((S2 + S1).split(''), { label: 'str2 + str1' })] },
    { note: `一樣 → 一定有解。最長的 x 長度是 gcd(${S1.length}, ${S2.length}) = ${k}`, views: [arr(S1.split(''), { label: 'str1', highlight: Array.from({ length: k }, (_, i) => i) }), arr(S2.split(''), { label: 'str2', highlight: Array.from({ length: k }, (_, i) => i) })] },
    { note: `答案 "${S1.slice(0, k)}"。如果兩種接法不一樣(像 "LEET" 和 "CODE"),就回傳空字串`, views: [arr(S1.slice(0, k).split(''), { label: '答案', done: Array.from({ length: k }, (_, i) => i) })] },
  ]
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:候選 x 一定是 str1 的前綴,長度要同時整除兩個字串的長度。從最長的試起', views: [arr(S2.split(''), { label: '試長度 4("ABAB"):6 不能被 4 整除,跳過' })] },
    { note: '試長度 3:4 不能被 3 整除。試長度 2("AB"):str1 = AB×3 ✓、str2 = AB×2 ✓ → 答案 "AB"', views: [arr(['A', 'B'], { label: '長度 2 可以', done: [0, 1] })] },
  ]
}

export const q1071: Solution = {
  id: 1071,
  plain: '如果字串 t 重複幾次剛好等於 s,就說 t「整除」s(像 "AB" 重複 3 次是 "ABABAB")。找最長的字串 x,同時整除兩個字串。',
  statement: '若 `s = t + t + … + t`(t 接上自己一次或多次),稱 t 整除 s。給 `str1`、`str2`,回傳同時整除兩者的**最長**字串 x;沒有就回傳空字串。',
  examples: [
    { input: 'str1 = "ABCABC", str2 = "ABC"', output: '"ABC"' },
    { input: 'str1 = "ABABAB", str2 = "ABAB"', output: '"AB"' },
    { input: 'str1 = "LEET", str2 = "CODE"', output: '""' },
  ],
  constraints: ['長度 ≤ 1000,只有大寫字母'],
  insight: ['有解 ⇔ `str1 + str2 == str2 + str1`(兩個都是同一個 x 堆出來的)', '有解時,最長的 x 長度 = gcd(兩個長度),就像整數的最大公因數', '也可以暴力:x 一定是前綴、長度整除兩邊,從長到短試'],
  approaches: [
    {
      name: '交換相接 + 長度 gcd',
      idea: '`str1 + str2 != str2 + str1` → ""; 否則回傳 `str1[:gcd(len1, len2)]`。',
      steps: ['`str1 + str2 != str2 + str1` → 回傳 ""', '`k = gcd(len(str1), len(str2))`', '回傳 `str1[:k]`'],
      figure: { title: `str1 = "${S1}",str2 = "${S2}"`, steps: gcdFig() },
      complexity: { time: 'O(m + n)', space: 'O(m + n)', why: '接字串、比較都是線性;gcd 是 log。' },
      verdict: '最推薦,三行寫完。理由:兩個都是 x 的重複時,接起來的順序不影響結果;反過來也成立。',
      code: {
        python: `from math import gcd

def gcdOfStrings(str1, str2):
    if str1 + str2 != str2 + str1:            # 不是同一個「零件」堆出來的
        return ''
    return str1[:gcd(len(str1), len(str2))]`,
        c: `static int gcd(int a, int b) { return b ? gcd(b, a % b) : a; }

char *gcdOfStrings(char *str1, char *str2) {
    int m = strlen(str1), n = strlen(str2);
    char *ab = malloc(m + n + 1), *ba = malloc(m + n + 1);
    strcpy(ab, str1); strcat(ab, str2);
    strcpy(ba, str2); strcat(ba, str1);
    int same = !strcmp(ab, ba), k = same ? gcd(m, n) : 0;
    free(ab); free(ba);
    char *res = malloc(k + 1);
    memcpy(res, str1, k);
    res[k] = '\\0';
    return res;
}`,
        cpp: `string gcdOfStrings(string str1, string str2) {
    if (str1 + str2 != str2 + str1) return "";
    return str1.substr(0, gcd(str1.size(), str2.size()));
}`,
        java: `String gcdOfStrings(String str1, String str2) {
    if (!(str1 + str2).equals(str2 + str1)) return "";
    return str1.substring(0, gcd(str1.length(), str2.length()));
}

private int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }`,
        javascript: `function gcdOfStrings(str1, str2) {
  if (str1 + str2 !== str2 + str1) return '';
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  return str1.slice(0, gcd(str1.length, str2.length));
}`,
      },
    },
    {
      name: '從最長的前綴往下試',
      idea: '長度 k 從 min(m, n) 往下:k 同時整除 m 和 n,而且 `str1[:k]` 重複後等於兩個字串 → 回傳。',
      steps: ['`for k in min(m, n)..1`', '`m % k == 0 and n % k == 0`', '`x = str1[:k]`;`x * (m // k) == str1 and x * (n // k) == str2` → 回傳 x', '都不行 → ""'],
      figure: { title: `str1 = "${S1}",str2 = "${S2}"`, steps: bruteFig() },
      complexity: { time: 'O(min(m, n) · (m + n))', space: 'O(m + n)', why: '每個候選長度都要建字串比較。' },
      verdict: '照定義直接試,好懂。長度只有 1000 也夠快。',
      code: {
        python: `def gcdOfStrings(str1, str2):
    m, n = len(str1), len(str2)
    for k in range(min(m, n), 0, -1):
        if m % k == 0 and n % k == 0:
            x = str1[:k]
            if x * (m // k) == str1 and x * (n // k) == str2:
                return x
    return ''`,
        c: `// 檢查 s 是不是由 s 的前 k 個字重複組成,而且 t 也是由同樣的 k 個字重複組成
static bool divides(char *x, int k, char *s, int len) {
    for (int i = 0; i < len; i++) if (s[i] != x[i % k]) return false;
    return true;
}

char *gcdOfStrings(char *str1, char *str2) {
    int m = strlen(str1), n = strlen(str2);
    for (int k = m < n ? m : n; k >= 1; k--) {
        if (m % k || n % k) continue;
        if (divides(str1, k, str1, m) && divides(str1, k, str2, n)) {
            char *res = malloc(k + 1);
            memcpy(res, str1, k);
            res[k] = '\\0';
            return res;
        }
    }
    char *res = malloc(1);
    res[0] = '\\0';
    return res;
}`,
        cpp: `string gcdOfStrings(string str1, string str2) {
    int m = str1.size(), n = str2.size();
    auto divides = [](const string &x, const string &s) {
        for (size_t i = 0; i < s.size(); i++) if (s[i] != x[i % x.size()]) return false;
        return true;
    };
    for (int k = min(m, n); k >= 1; k--) {
        if (m % k || n % k) continue;
        string x = str1.substr(0, k);
        if (divides(x, str1) && divides(x, str2)) return x;
    }
    return "";
}`,
        java: `String gcdOfStrings(String str1, String str2) {
    int m = str1.length(), n = str2.length();
    for (int k = Math.min(m, n); k >= 1; k--) {
        if (m % k != 0 || n % k != 0) continue;
        String x = str1.substring(0, k);
        if (x.repeat(m / k).equals(str1) && x.repeat(n / k).equals(str2)) return x;
    }
    return "";
}`,
        javascript: `function gcdOfStrings(str1, str2) {
  const m = str1.length, n = str2.length;
  for (let k = Math.min(m, n); k >= 1; k--) {
    if (m % k || n % k) continue;
    const x = str1.slice(0, k);
    if (x.repeat(m / k) === str1 && x.repeat(n / k) === str2) return x;
  }
  return '';
}`,
      },
    },
  ],
  pitfalls: ['以為答案是「最長公共前綴」:"ABAB" 和 "ABABAB" 的公共前綴是 "ABAB",但它整除不了 "ABABAB"', '長度互質不代表無解:"A" 和 "AAA" 的答案是 "A"'],
  check: {
    kind: 'fn',
    fn: 'gcdOfStrings',
    cases: [
      { args: ['ABCABC', 'ABC'], out: 'ABC' },
      { args: [S1, S2], out: 'AB' },
      { args: ['LEET', 'CODE'], out: '' },
      { args: ['AAAAAA', 'AAA'], out: 'AAA' },
      { args: ['A', 'AAA'], out: 'A' },
      { args: ['ABAB', 'ABA'], out: '' },
    ],
  },
}
