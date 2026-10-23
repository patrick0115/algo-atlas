import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 14. Longest Common Prefix

const S = ['flower', 'flow', 'flight']

function vertFig(): FigStep[] {
  return [
    { note: '直式比較:一欄一欄往右看,第 i 欄的字母在所有字串裡都一樣,就屬於公共前綴', views: S.map((w) => arr(w.split(''), { label: w, done: [0, 1] })) },
    { note: '第 0 欄 f、第 1 欄 l 都相同;第 2 欄 flower 是 o、flight 是 i → 停下', views: S.map((w) => arr(w.split(''), { label: w, done: [0, 1], highlight: [2] })) },
    { note: '答案 "fl"。任何一個字串用完(長度不夠)也要停', views: [arr(['f', 'l'], { label: '公共前綴', done: [0, 1] })] },
  ]
}

function sortFig(): FigStep[] {
  const s = [...S].sort()
  return [
    { note: '排序後,所有字串的公共前綴 = **第一個和最後一個**的公共前綴(字典序差最遠的兩個)', views: [arr(s, { label: '排序後' })] },
    { note: `比較 "${s[0]}" 和 "${s[s.length - 1]}":f、l 一樣,第 3 個 i ≠ o → "fl"`, views: [arr(s[0].split(''), { label: s[0], done: [0, 1], highlight: [2] }), arr(s[s.length - 1].split(''), { label: s[s.length - 1], done: [0, 1], highlight: [2] })] },
  ]
}

export const q0014: Solution = {
  id: 14,
  plain: '一堆單字,它們「開頭共同的那一段」最長是什麼?例如 flower、flow、flight 共同的開頭是 fl。沒有共同開頭就回傳空字串。',
  statement: '給字串陣列 `strs`,回傳它們的**最長公共前綴**;不存在則回傳 `""`。',
  examples: [
    { input: 'strs = ["flower","flow","flight"]', output: '"fl"' },
    { input: 'strs = ["dog","racecar","car"]', output: '""' },
  ],
  constraints: ['最多 200 個字串,每個長度 ≤ 200'],
  insight: ['逐欄比較:第 i 個字母在所有字串都一樣才算', '任何一個字串不夠長,或出現不同的字母,就停', '排序後只要比第一個和最後一個'],
  approaches: [
    {
      name: '直式逐欄比較',
      idea: '以第一個字串為準,第 i 欄只要有一個字串長度不夠或字母不同,就回傳前 i 個字。',
      steps: ['`for i, c in enumerate(strs[0])`', '`for s in strs`:`i == len(s) or s[i] != c` → 回傳 `strs[0][:i]`', '全部比完 → 回傳 `strs[0]`'],
      figure: { title: `strs = [${S.join(', ')}]`, steps: vertFig() },
      complexity: { time: 'O(S)', space: 'O(1)', why: 'S = 所有字串的字元總數(最壞每個字元都看一次)。' },
      verdict: '最推薦。遇到不同就馬上停,常常不用看完所有字元。',
      code: {
        python: `def longestCommonPrefix(strs):
    for i, c in enumerate(strs[0]):
        for s in strs:
            if i == len(s) or s[i] != c:
                return strs[0][:i]            # 第 i 欄不一致
    return strs[0]`,
        c: `char *longestCommonPrefix(char **strs, int strsSize) {
    int i = 0;
    for (;; i++) {
        char c = strs[0][i];
        if (!c) break;
        int ok = 1;
        for (int k = 1; k < strsSize; k++) if (strs[k][i] != c) { ok = 0; break; }
        if (!ok) break;
    }
    char *res = malloc(i + 1);
    memcpy(res, strs[0], i);
    res[i] = '\\0';
    return res;
}`,
        cpp: `string longestCommonPrefix(vector<string>& strs) {
    for (size_t i = 0; i < strs[0].size(); i++)
        for (auto &s : strs)
            if (i == s.size() || s[i] != strs[0][i]) return strs[0].substr(0, i);
    return strs[0];
}`,
        java: `String longestCommonPrefix(String[] strs) {
    for (int i = 0; i < strs[0].length(); i++)
        for (String s : strs)
            if (i == s.length() || s.charAt(i) != strs[0].charAt(i)) return strs[0].substring(0, i);
    return strs[0];
}`,
        javascript: `function longestCommonPrefix(strs) {
  for (let i = 0; i < strs[0].length; i++)
    for (const s of strs) if (i === s.length || s[i] !== strs[0][i]) return strs[0].slice(0, i);
  return strs[0];
}`,
      },
    },
    {
      name: '排序後比頭尾',
      idea: '排序;公共前綴 = 第一個和最後一個字串的公共前綴。',
      steps: ['排序', '`a, b = strs[0], strs[-1]`', '從頭比到不一樣為止,回傳 `a[:i]`'],
      figure: { title: `strs = [${S.join(', ')}]`, steps: sortFig() },
      complexity: { time: 'O(S log n)', space: 'O(1) ~ O(S)', why: '排序時每次比較字串最壞 O(長度)。' },
      verdict: '寫起來短,理由也漂亮:字典序最遠的兩個字串共有的開頭,其他人一定也有。',
      code: {
        python: `def longestCommonPrefix(strs):
    strs = sorted(strs)
    a, b = strs[0], strs[-1]
    i = 0
    while i < min(len(a), len(b)) and a[i] == b[i]:
        i += 1
    return a[:i]`,
        c: `static int cmp(const void *x, const void *y) { return strcmp(*(char **)x, *(char **)y); }

char *longestCommonPrefix(char **strs, int strsSize) {
    char **s = malloc(strsSize * sizeof(char *));
    memcpy(s, strs, strsSize * sizeof(char *));
    qsort(s, strsSize, sizeof(char *), cmp);
    char *a = s[0], *b = s[strsSize - 1];
    int i = 0;
    while (a[i] && a[i] == b[i]) i++;
    char *res = malloc(i + 1);
    memcpy(res, a, i);
    res[i] = '\\0';
    free(s);
    return res;
}`,
        cpp: `string longestCommonPrefix(vector<string>& strs) {
    auto [mn, mx] = minmax_element(strs.begin(), strs.end());   // 不用整個排序,只要最小和最大
    size_t i = 0;
    while (i < mn->size() && i < mx->size() && (*mn)[i] == (*mx)[i]) i++;
    return mn->substr(0, i);
}`,
        java: `String longestCommonPrefix(String[] strs) {
    String[] s = strs.clone();
    Arrays.sort(s);
    String a = s[0], b = s[s.length - 1];
    int i = 0;
    while (i < Math.min(a.length(), b.length()) && a.charAt(i) == b.charAt(i)) i++;
    return a.substring(0, i);
}`,
        javascript: `function longestCommonPrefix(strs) {
  const s = [...strs].sort(), a = s[0], b = s[s.length - 1];
  let i = 0;
  while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
  return a.slice(0, i);
}`,
      },
    },
  ],
  pitfalls: ['只比較前兩個字串', '某個字串比第一個短:要檢查長度,不然會越界', '有空字串時答案一定是 ""'],
  check: {
    kind: 'fn',
    fn: 'longestCommonPrefix',
    cases: [
      { args: [S], out: 'fl' },
      { args: [['dog', 'racecar', 'car']], out: '' },
      { args: [['a']], out: 'a' },
      { args: [['ab', 'a']], out: 'a' },
      { args: [['', 'b']], out: '' },
      { args: [['interview', 'internet', 'interval']], out: 'inter' },
    ],
  },
}
