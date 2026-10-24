import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 12. Integer to Roman

const N = 1994
const VALS = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
const SYMS = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']

function greedyFig(): FigStep[] {
  let n = N
  let res = ''
  const out: FigStep[] = [{ note: '把 6 個減法組合(CM、CD、XC、XL、IX、IV)也當成「符號」,13 個由大到小排好。每次用**能用的最大符號**,用到不能用為止', views: [arr(SYMS, { label: '符號' }), arr(VALS, { label: '數值' })] }]
  VALS.forEach((v, i) => {
    let used = 0
    while (n >= v) {
      n -= v
      res += SYMS[i]
      used++
    }
    if (used) out.push({ note: `用 ${SYMS[i]}(${v})× ${used} → 結果 "${res}",剩 ${n}`, views: [arr(SYMS, { label: '符號', highlight: [i], dim: Array.from({ length: i }, (_, k) => k) }), arr(res.split(''), { label: '目前結果' })] })
  })
  return out
}

function digitFig(): FigStep[] {
  return [
    { note: '另一種:每一位數字(千、百、十、個)各自查表。例如百位的 0..9 對應 "", C, CC, CCC, CD, D, DC, DCC, DCCC, CM', views: [arr(['1', '9', '9', '4'], { label: '1994 的每一位' })] },
    { note: '千位 1 → M;百位 9 → CM;十位 9 → XC;個位 4 → IV → 接起來 "MCMXCIV"', views: [arr(['M', 'CM', 'XC', 'IV'], { label: '每位查表', done: [0, 1, 2, 3] })] },
  ]
}

export const q0012: Solution = {
  id: 12,
  plain: '把一般的數字(1 到 3999)寫成羅馬數字。I=1、V=5、X=10、L=50、C=100、D=500、M=1000;4、9、40、90、400、900 要用「小的放在大的左邊」表示:IV、IX、XL、XC、CD、CM。',
  statement: '給整數 `num`(1 ≤ num ≤ 3999),回傳它的羅馬數字表示。',
  examples: [
    { input: 'num = 3749', output: '"MMMDCCXLIX"' },
    { input: 'num = 58', output: '"LVIII"' },
    { input: 'num = 1994', output: '"MCMXCIV"' },
  ],
  constraints: ['1 ≤ num ≤ 3999 → 結果最多 15 個字'],
  insight: ['把 6 種減法組合也當成獨立的符號,總共 13 個', '由大到小貪心:能減就減,這樣自動產生正確的寫法', '或者每一位數字獨立查表(千、百、十、個各一張表)'],
  approaches: [
    {
      name: '13 個符號貪心',
      idea: '由大到小走過 13 個 (值, 符號),`while num >= 值`:接上符號、`num −= 值`。',
      steps: ['`vals = [1000, 900, 500, 400, …, 4, 1]`、`syms = ["M", "CM", "D", "CD", …, "IV", "I"]`', '`for v, s`:`while num >= v`:`res += s`、`num -= v`', '回傳 res'],
      figure: { title: `num = ${N}`, steps: greedyFig() },
      complexity: { time: 'O(1)', space: 'O(1)', why: '13 個符號,輸出最多 15 個字。' },
      verdict: '最推薦。關鍵是把減法組合也放進表裡,貪心才會對。',
      code: {
        python: `def intToRoman(num):
    vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
    res = []
    for v, s in zip(vals, syms):
        while num >= v:                       # 能用多大就用多大
            res.append(s)
            num -= v
    return ''.join(res)`,
        c: `char *intToRoman(int num) {
    const int vals[] = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
    const char *syms[] = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
    char *res = malloc(20);
    res[0] = '\\0';
    for (int i = 0; i < 13; i++)
        while (num >= vals[i]) { strcat(res, syms[i]); num -= vals[i]; }
    return res;
}`,
        cpp: `string intToRoman(int num) {
    const int vals[] = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
    const string syms[] = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
    string res;
    for (int i = 0; i < 13; i++)
        while (num >= vals[i]) { res += syms[i]; num -= vals[i]; }
    return res;
}`,
        java: `String intToRoman(int num) {
    int[] vals = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
    String[] syms = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
    StringBuilder res = new StringBuilder();
    for (int i = 0; i < 13; i++)
        while (num >= vals[i]) { res.append(syms[i]); num -= vals[i]; }
    return res.toString();
}`,
        javascript: `function intToRoman(num) {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let res = '';
  vals.forEach((v, i) => {
    while (num >= v) {
      res += syms[i];
      num -= v;
    }
  });
  return res;
}`,
      },
    },
    {
      name: '每一位查表',
      idea: '千、百、十、個位各一張 0..9 的表,`M[num/1000] + C[(num%1000)/100] + X[(num%100)/10] + I[num%10]`。',
      steps: ['準備四張表(千位只需要 0..3)', '拆出每一位數字', '查表接起來'],
      figure: { title: `num = ${N}`, steps: digitFig() },
      complexity: { time: 'O(1)', space: 'O(1)', why: '四次查表。' },
      verdict: '完全沒有迴圈,但要手寫 34 個字串;寫錯一個就錯。',
      code: {
        python: `def intToRoman(num):
    M = ['', 'M', 'MM', 'MMM']
    C = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM']
    X = ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC']
    I = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']
    return M[num // 1000] + C[num % 1000 // 100] + X[num % 100 // 10] + I[num % 10]`,
        c: `char *intToRoman(int num) {
    const char *M[] = {"", "M", "MM", "MMM"};
    const char *C[] = {"", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"};
    const char *X[] = {"", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"};
    const char *I[] = {"", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"};
    char *res = malloc(20);
    sprintf(res, "%s%s%s%s", M[num / 1000], C[num % 1000 / 100], X[num % 100 / 10], I[num % 10]);
    return res;
}`,
        cpp: `string intToRoman(int num) {
    const string M[] = {"", "M", "MM", "MMM"};
    const string C[] = {"", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"};
    const string X[] = {"", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"};
    const string I[] = {"", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"};
    return M[num / 1000] + C[num % 1000 / 100] + X[num % 100 / 10] + I[num % 10];
}`,
        java: `String intToRoman(int num) {
    String[] M = {"", "M", "MM", "MMM"};
    String[] C = {"", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"};
    String[] X = {"", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"};
    String[] I = {"", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"};
    return M[num / 1000] + C[num % 1000 / 100] + X[num % 100 / 10] + I[num % 10];
}`,
        javascript: `function intToRoman(num) {
  const M = ['', 'M', 'MM', 'MMM'];
  const C = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'];
  const X = ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'];
  const I = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  return M[Math.floor(num / 1000)] + C[Math.floor((num % 1000) / 100)] + X[Math.floor((num % 100) / 10)] + I[num % 10];
}`,
      },
    },
  ],
  pitfalls: ['表裡只放 7 個基本符號:4 會變成 IIII,要把減法組合也放進去', '表沒有由大到小排:貪心會出錯'],
  check: {
    kind: 'fn',
    fn: 'intToRoman',
    cases: [
      { args: [3749], out: 'MMMDCCXLIX' },
      { args: [58], out: 'LVIII' },
      { args: [N], out: 'MCMXCIV' },
      { args: [4], out: 'IV' },
      { args: [3999], out: 'MMMCMXCIX' },
      { args: [1], out: 'I' },
    ],
  },
}
