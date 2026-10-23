import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 58. Length of Last Word

const S = '  fly me   to   the moon  '

function backFig(): FigStep[] {
  const a = S.split('').map((c) => (c === ' ' ? '␣' : c))
  let i = S.length - 1
  while (i >= 0 && S[i] === ' ') i--
  const end = i
  while (i >= 0 && S[i] !== ' ') i--
  return [
    { note: '從字串**尾巴**往回走。最後一個單字在最後面,不用看前面的字', views: [arr(a, { label: 's(␣ = 空白)' })] },
    { note: `先跳過尾巴的空白,停在 ${end}(最後一個單字的最後一個字)`, views: [arr(a, { label: 's', dim: Array.from({ length: S.length - 1 - end }, (_, k) => end + 1 + k), pointers: [{ name: 'end', index: end }] })] },
    { note: `再往回數到遇到空白為止:"${S.slice(i + 1, end + 1)}",長度 ${end - i}`, views: [arr(a, { label: 's', highlight: Array.from({ length: end - i }, (_, k) => i + 1 + k) })] },
  ]
}

function splitFig(): FigStep[] {
  const w = S.split(' ').filter(Boolean)
  return [
    { note: '用內建的 split 依空白切開(連續空白當成一個),得到所有單字', views: [arr(w, { label: '單字' })] },
    { note: `取最後一個 "${w[w.length - 1]}",長度 ${w[w.length - 1].length}。簡單,但會建立整個單字陣列,O(n) 空間`, views: [arr(w, { label: '單字', highlight: [w.length - 1] })] },
  ]
}

export const q0058: Solution = {
  id: 58,
  plain: '一句話裡可能有很多空白(開頭、結尾、中間連續好幾個都有可能),最後一個單字有幾個字母?',
  statement: '給由英文字母和空白組成的字串 `s`,回傳**最後一個單字**的長度。單字是由非空白字元組成的最大子字串。保證至少有一個單字。',
  examples: [
    { input: 's = "Hello World"', output: '5' },
    { input: 's = "   fly me   to   the moon  "', output: '4' },
    { input: 's = "luffy is still joyboy"', output: '6' },
  ],
  constraints: ['長度 ≤ 10⁴'],
  insight: ['最後一個單字在最後面 → 從尾巴往回走,不用看整個字串', '先跳過尾巴的空白,再數非空白的字元'],
  approaches: [
    {
      name: '從尾巴往回數',
      idea: '`i` 從最後開始:跳過空白,再數非空白的長度。',
      steps: ['`i = n − 1`', '`while s[i] == " "`:`i -= 1`', '`while i >= 0 and s[i] != " "`:`length += 1`、`i -= 1`', '回傳 length'],
      figure: { title: `s = "${S}"`, steps: backFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '最壞走過整個字串(全部是一個單字),只用一個指標。' },
      verdict: '最推薦。只看需要的部分,不產生新字串。',
      code: {
        python: `def lengthOfLastWord(s):
    i = len(s) - 1
    while s[i] == ' ':                        # 跳過尾巴的空白(保證有單字,不會越界)
        i -= 1
    length = 0
    while i >= 0 and s[i] != ' ':
        length += 1
        i -= 1
    return length`,
        c: `int lengthOfLastWord(char *s) {
    int i = strlen(s) - 1, len = 0;
    while (s[i] == ' ') i--;
    while (i >= 0 && s[i] != ' ') { len++; i--; }
    return len;
}`,
        cpp: `int lengthOfLastWord(string s) {
    int i = s.size() - 1, len = 0;
    while (s[i] == ' ') i--;
    while (i >= 0 && s[i] != ' ') { len++; i--; }
    return len;
}`,
        java: `int lengthOfLastWord(String s) {
    int i = s.length() - 1, len = 0;
    while (s.charAt(i) == ' ') i--;
    while (i >= 0 && s.charAt(i) != ' ') { len++; i--; }
    return len;
}`,
        javascript: `function lengthOfLastWord(s) {
  let i = s.length - 1, len = 0;
  while (s[i] === ' ') i--;
  while (i >= 0 && s[i] !== ' ') {
    len++;
    i--;
  }
  return len;
}`,
      },
    },
    {
      name: '切成單字取最後一個',
      idea: '`s.split()` 取最後一個的長度。',
      steps: ['用空白切開(忽略多餘的空白)', '回傳最後一個單字的長度'],
      figure: { title: `s = "${S}"`, steps: splitFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '要建出所有單字。' },
      verdict: '一行寫完,實務上很常見。注意各語言的 split 對連續空白的處理不同。',
      code: {
        python: `def lengthOfLastWord(s):
    return len(s.split()[-1])                 # split() 不帶參數會忽略連續空白`,
        c: `int lengthOfLastWord(char *s) {
    // C 用 strtok 切(會修改字串,先複製一份)
    char *buf = strdup(s), *last = NULL;
    for (char *t = strtok(buf, " "); t; t = strtok(NULL, " ")) last = t;
    int len = last ? strlen(last) : 0;
    free(buf);
    return len;
}`,
        cpp: `int lengthOfLastWord(string s) {
    istringstream in(s);
    string w, last;
    while (in >> w) last = w;                // >> 會跳過所有空白
    return last.size();
}`,
        java: `int lengthOfLastWord(String s) {
    String[] w = s.trim().split("\\\\s+");     // 先去頭尾空白,再依一個以上的空白切
    return w[w.length - 1].length();
}`,
        javascript: `function lengthOfLastWord(s) {
  const w = s.trim().split(/\\s+/);
  return w[w.length - 1].length;
}`,
      },
    },
  ],
  pitfalls: ['沒跳過尾巴的空白:"moon  " 會回傳 0', 'Java 的 `split(" ")` 遇到連續空白會產生空字串,要用 `\\s+` 並先 trim'],
  check: {
    kind: 'fn',
    fn: 'lengthOfLastWord',
    cases: [
      { args: ['Hello World'], out: 5 },
      { args: [S], out: 4 },
      { args: ['luffy is still joyboy'], out: 6 },
      { args: ['a'], out: 1 },
      { args: ['   abc'], out: 3 },
    ],
  },
}
