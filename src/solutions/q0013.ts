import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 13. Roman to Integer

const S = 'MCMXCIV'
const VAL: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }

function scanFig(): FigStep[] {
  const v = S.split('').map((c) => VAL[c])
  let total = 0
  const out: FigStep[] = [{ note: '每個符號先換成數值。規則:通常大的在左邊、全部相加;但如果某個符號比**右邊那個小**(像 IV、CM),它要用減的', views: [arr(S.split(''), { label: 's' }), arr(v, { label: '數值' })] }]
  v.forEach((x, i) => {
    const sub = i + 1 < v.length && x < v[i + 1]
    total += sub ? -x : x
    out.push({ note: `${S[i]} = ${x}${sub ? `,比右邊的 ${S[i + 1]}(${v[i + 1]})小 → 減 ${x}` : ' → 加'}。目前 ${total}`, views: [arr(v, { label: '數值', highlight: [i], compare: i + 1 < v.length ? [i + 1] : [], done: Array.from({ length: i }, (_, k) => k) })] })
  })
  return out
}

function pairFig(): FigStep[] {
  return [
    { note: '另一種:減法組合只有 6 種(IV=4、IX=9、XL=40、XC=90、CD=400、CM=900)。從左往右,先試兩個字的組合,配到就一次吃兩個字', views: [arr(['M', 'CM', 'XC', 'IV'], { label: '切成' }), arr([1000, 900, 90, 4], { label: '數值' })] },
    { note: '1000 + 900 + 90 + 4 = 1994', views: [arr([1994], { label: '答案', done: [0] })] },
  ]
}

export const q0013: Solution = {
  id: 13,
  plain: '把羅馬數字換成一般的數字。I=1、V=5、X=10、L=50、C=100、D=500、M=1000,通常從大到小寫、全部加起來;但小的寫在大的左邊時代表「減」,例如 IV = 4、IX = 9。',
  statement: '給一個有效的羅馬數字字串 `s`(範圍 1 ~ 3999),轉換成整數。',
  examples: [
    { input: 's = "III"', output: '3' },
    { input: 's = "LVIII"', output: '58' },
    { input: 's = "MCMXCIV"', output: '1994', note: 'M=1000、CM=900、XC=90、IV=4' },
  ],
  constraints: ['長度 ≤ 15,保證是有效的羅馬數字'],
  insight: ['大部分情況是相加', '只有「左邊比右邊小」時左邊要減:IV、IX、XL、XC、CD、CM', '所以每個字只要和**右邊鄰居**比一下'],
  approaches: [
    {
      name: '和右邊比大小',
      idea: '`v[i] < v[i+1]` → 減 `v[i]`,否則加 `v[i]`。',
      steps: ['符號 → 數值的表', '`for i`:`v = val[s[i]]`', '右邊存在且 `v < val[s[i+1]]` → `total -= v`;否則 `total += v`'],
      figure: { title: `s = "${S}"`, steps: scanFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描,表是固定 7 個符號。' },
      verdict: '最推薦,一條規則就涵蓋 6 種減法組合。',
      code: {
        python: `def romanToInt(s):
    val = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    total = 0
    for i, c in enumerate(s):
        if i + 1 < len(s) and val[c] < val[s[i + 1]]:
            total -= val[c]                   # 小的在大的左邊 → 減
        else:
            total += val[c]
    return total`,
        c: `static int val(char c) {
    switch (c) {
        case 'I': return 1; case 'V': return 5; case 'X': return 10; case 'L': return 50;
        case 'C': return 100; case 'D': return 500; default: return 1000;
    }
}

int romanToInt(char *s) {
    int total = 0;
    for (int i = 0; s[i]; i++) {
        int v = val(s[i]);
        if (s[i + 1] && v < val(s[i + 1])) total -= v;
        else total += v;
    }
    return total;
}`,
        cpp: `int romanToInt(string s) {
    unordered_map<char, int> val{{'I', 1}, {'V', 5}, {'X', 10}, {'L', 50}, {'C', 100}, {'D', 500}, {'M', 1000}};
    int total = 0;
    for (size_t i = 0; i < s.size(); i++) {
        int v = val[s[i]];
        if (i + 1 < s.size() && v < val[s[i + 1]]) total -= v;
        else total += v;
    }
    return total;
}`,
        java: `int romanToInt(String s) {
    Map<Character, Integer> val = Map.of('I', 1, 'V', 5, 'X', 10, 'L', 50, 'C', 100, 'D', 500, 'M', 1000);
    int total = 0;
    for (int i = 0; i < s.length(); i++) {
        int v = val.get(s.charAt(i));
        if (i + 1 < s.length() && v < val.get(s.charAt(i + 1))) total -= v;
        else total += v;
    }
    return total;
}`,
        javascript: `function romanToInt(s) {
  const val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const v = val[s[i]];
    if (i + 1 < s.length && v < val[s[i + 1]]) total -= v;
    else total += v;
  }
  return total;
}`,
      },
    },
    {
      name: '先配兩個字的組合',
      idea: '表裡同時放 13 個符號(7 個單字 + 6 個減法組合);從左往右,能配兩個字就配兩個字。',
      steps: ['表:I V X L C D M,加上 IV IX XL XC CD CM', '`i = 0`;`s[i:i+2]` 在表裡 → 加上它,`i += 2`', '否則加上 `s[i]`,`i += 1`'],
      figure: { title: `s = "${S}"`, steps: pairFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個字最多被看一次。' },
      verdict: '把規則寫成資料,不用想「為什麼要減」。和 [12. Integer to Roman](#/q/12) 用的是同一張表。',
      code: {
        python: `def romanToInt(s):
    val = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000,
           'IV': 4, 'IX': 9, 'XL': 40, 'XC': 90, 'CD': 400, 'CM': 900}
    total, i = 0, 0
    while i < len(s):
        if s[i:i + 2] in val:                 # 先試兩個字的減法組合
            total += val[s[i:i + 2]]
            i += 2
        else:
            total += val[s[i]]
            i += 1
    return total`,
        c: `int romanToInt(char *s) {
    const char *sym[] = {"CM", "CD", "XC", "XL", "IX", "IV", "M", "D", "C", "L", "X", "V", "I"};
    const int v[] = {900, 400, 90, 40, 9, 4, 1000, 500, 100, 50, 10, 5, 1};
    int total = 0;
    while (*s) {
        for (int k = 0; k < 13; k++) {
            int len = strlen(sym[k]);
            if (!strncmp(s, sym[k], len)) { total += v[k]; s += len; break; }
        }
    }
    return total;
}`,
        cpp: `int romanToInt(string s) {
    unordered_map<string, int> val{{"I", 1}, {"V", 5}, {"X", 10}, {"L", 50}, {"C", 100}, {"D", 500}, {"M", 1000},
                                   {"IV", 4}, {"IX", 9}, {"XL", 40}, {"XC", 90}, {"CD", 400}, {"CM", 900}};
    int total = 0;
    for (size_t i = 0; i < s.size();) {
        if (i + 1 < s.size() && val.count(s.substr(i, 2))) { total += val[s.substr(i, 2)]; i += 2; }
        else { total += val[s.substr(i, 1)]; i++; }
    }
    return total;
}`,
        java: `int romanToInt(String s) {
    Map<String, Integer> val = new HashMap<>(Map.of("I", 1, "V", 5, "X", 10, "L", 50, "C", 100, "D", 500, "M", 1000));
    val.putAll(Map.of("IV", 4, "IX", 9, "XL", 40, "XC", 90, "CD", 400, "CM", 900));
    int total = 0;
    for (int i = 0; i < s.length();) {
        if (i + 1 < s.length() && val.containsKey(s.substring(i, i + 2))) { total += val.get(s.substring(i, i + 2)); i += 2; }
        else { total += val.get(s.substring(i, i + 1)); i++; }
    }
    return total;
}`,
        javascript: `function romanToInt(s) {
  const val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000, IV: 4, IX: 9, XL: 40, XC: 90, CD: 400, CM: 900 };
  let total = 0;
  for (let i = 0; i < s.length; ) {
    const two = s.slice(i, i + 2);
    if (two.length === 2 && two in val) {
      total += val[two];
      i += 2;
    } else total += val[s[i++]];
  }
  return total;
}`,
      },
    },
  ],
  pitfalls: ['和「左邊」比:應該是和右邊比,當前這個字比右邊小才減', '最後一個字沒有右邊,記得檢查邊界'],
  check: {
    kind: 'fn',
    fn: 'romanToInt',
    cases: [
      { args: ['III'], out: 3 },
      { args: ['LVIII'], out: 58 },
      { args: [S], out: 1994 },
      { args: ['IV'], out: 4 },
      { args: ['MMMCMXCIX'], out: 3999 },
      { args: ['CDXLIV'], out: 444 },
    ],
  },
}
