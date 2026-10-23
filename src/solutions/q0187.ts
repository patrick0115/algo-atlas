import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 187. Repeated DNA Sequences

const S = 'AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT'

function setFig(): FigStep[] {
  return [
    { note: '用長度 10 的視窗滑過整條 DNA,每個位置切出一段 10 個字母,放進「看過的」集合', views: [arr(S.split(''), { label: 's', range: [0, 9] })] },
    { note: '如果切出來的那段已經在「看過的」集合裡,就放進「答案」集合(用集合避免同一段被加好幾次)', views: [arr(S.split(''), { label: 's', range: [10, 19], highlight: [10] }), arr(['AAAAACCCCC'], { label: '答案', done: [0] })] },
    { note: '掃完得到 AAAAACCCCC、CCCCCAAAAA 兩段', views: [arr(['AAAAACCCCC', 'CCCCCAAAAA'], { label: '答案', done: [0, 1] })] },
  ]
}

function bitFig(): FigStep[] {
  return [
    { note: 'DNA 只有 4 種字母,每個用 2 個位元表示:A = 00、C = 01、G = 10、T = 11。10 個字母剛好是 20 位元的整數', views: [arr(['A=00', 'C=01', 'G=10', 'T=11'], { label: '編碼' })] },
    { note: '視窗往右滑:`code = ((code << 2) | 新字母) & (2²⁰ − 1)`,左邊最舊的字母自動被遮罩去掉。比較整數比比較字串快,也不用一直切新字串', views: [arr(['0000000000', '0101010101'], { label: 'AAAAACCCCC 的位元(每 2 位一個字母)' })] },
  ]
}

export const q0187: Solution = {
  id: 187,
  plain: 'DNA 是一長串 A、C、G、T。找出所有「長度 10、出現超過一次」的片段。',
  statement: '給只含 `A`、`C`、`G`、`T` 的字串 `s`,回傳所有長度為 10、在 s 中出現**不只一次**的子字串(順序不限)。',
  examples: [
    { input: 's = "AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT"', output: '["AAAAACCCCC","CCCCCAAAAA"]' },
    { input: 's = "AAAAAAAAAAAAA"', output: '["AAAAAAAAAA"]' },
  ],
  constraints: ['長度 ≤ 10⁵'],
  insight: ['長度固定 10 的視窗,切出 n − 9 段', '用集合記「看過的」;第二次看到就放進答案(答案也用集合去重)', '只有 4 種字母 → 每段可以壓成 20 位元整數,滾動更新'],
  approaches: [
    {
      name: '視窗 + 字串集合',
      idea: '`seen`、`rep` 兩個集合;每段 `s[i:i+10]` 在 seen 裡就加入 rep。',
      steps: ['`seen, rep = set(), set()`', '`for i in 0..n−10`:`t = s[i : i + 10]`', '`t in seen` → `rep.add(t)`;否則 `seen.add(t)`', '回傳 `list(rep)`'],
      figure: { title: `s = "${S}"`, steps: setFig() },
      complexity: { time: 'O(10 · n)', space: 'O(10 · n)', why: '每段切出長度 10 的字串存進集合。' },
      verdict: '最好寫,10 是常數。',
      code: {
        python: `def findRepeatedDnaSequences(s):
    seen, rep = set(), set()
    for i in range(len(s) - 9):
        t = s[i:i + 10]
        if t in seen:
            rep.add(t)                        # 第二次(以上)看到
        else:
            seen.add(t)
    return list(rep)`,
        c: `// C:把每段編成 20 位元整數,用長度 2²⁰ 的陣列記出現次數
char **findRepeatedDnaSequences(char *s, int *returnSize) {
    int n = strlen(s);
    unsigned char *cnt = calloc(1 << 20, 1);
    char **res = malloc((n + 1) * sizeof(char *));
    *returnSize = 0;
    for (int i = 0; i + 10 <= n; i++) {
        int code = 0;
        for (int j = i; j < i + 10; j++) code = code << 2 | (s[j] == 'A' ? 0 : s[j] == 'C' ? 1 : s[j] == 'G' ? 2 : 3);
        if (++cnt[code] == 2) {               // 剛好第二次 → 加入答案(只加一次)
            res[*returnSize] = malloc(11);
            memcpy(res[*returnSize], s + i, 10);
            res[(*returnSize)++][10] = '\\0';
        }
        if (cnt[code] > 2) cnt[code] = 3;     // 避免 unsigned char 溢位
    }
    free(cnt);
    return res;
}`,
        cpp: `vector<string> findRepeatedDnaSequences(string s) {
    unordered_set<string> seen, rep;
    for (int i = 0; i + 10 <= (int)s.size(); i++) {
        string t = s.substr(i, 10);
        if (seen.count(t)) rep.insert(t);
        else seen.insert(t);
    }
    return vector<string>(rep.begin(), rep.end());
}`,
        java: `List<String> findRepeatedDnaSequences(String s) {
    Set<String> seen = new HashSet<>(), rep = new HashSet<>();
    for (int i = 0; i + 10 <= s.length(); i++) {
        String t = s.substring(i, i + 10);
        if (!seen.add(t)) rep.add(t);
    }
    return new ArrayList<>(rep);
}`,
        javascript: `function findRepeatedDnaSequences(s) {
  const seen = new Set(), rep = new Set();
  for (let i = 0; i + 10 <= s.length; i++) {
    const t = s.slice(i, i + 10);
    if (seen.has(t)) rep.add(t);
    else seen.add(t);
  }
  return [...rep];
}`,
      },
    },
    {
      name: '2 位元編碼 + 滾動',
      idea: '每個字母 2 位元;`code = ((code << 2) | v) & 0xFFFFF` 維護最近 10 個字母;用整數集合判斷重複。',
      steps: ['`mask = (1 << 20) − 1`', '`for i, c`:`code = ((code << 2) | v[c]) & mask`', '`i >= 9`:code 第二次出現 → 把 `s[i−9 : i+1]` 加入答案'],
      figure: { title: `s = "${S}"`, steps: bitFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每一步 O(1) 更新整數;集合存整數。' },
      verdict: '[[p:bit-manipulation]] + [[p:sliding-window]]:字母種類少時,把字串壓成整數是常見的加速技巧([1461](#/q/1461) 同一招)。',
      code: {
        python: `def findRepeatedDnaSequences(s):
    v = {'A': 0, 'C': 1, 'G': 2, 'T': 3}
    mask = (1 << 20) - 1
    seen, added, res = set(), set(), []
    code = 0
    for i, c in enumerate(s):
        code = ((code << 2) | v[c]) & mask    # 加入新字母、去掉最舊的
        if i < 9:
            continue
        if code in seen and code not in added:
            added.add(code)
            res.append(s[i - 9:i + 1])
        seen.add(code)
    return res`,
        c: `char **findRepeatedDnaSequences(char *s, int *returnSize) {
    int n = strlen(s), code = 0, mask = (1 << 20) - 1;
    unsigned char *cnt = calloc(1 << 20, 1);
    char **res = malloc((n + 1) * sizeof(char *));
    *returnSize = 0;
    for (int i = 0; i < n; i++) {
        int v = s[i] == 'A' ? 0 : s[i] == 'C' ? 1 : s[i] == 'G' ? 2 : 3;
        code = ((code << 2) | v) & mask;
        if (i < 9) continue;
        if (cnt[code] < 2 && ++cnt[code] == 2) {
            res[*returnSize] = malloc(11);
            memcpy(res[*returnSize], s + i - 9, 10);
            res[(*returnSize)++][10] = '\\0';
        }
    }
    free(cnt);
    return res;
}`,
        cpp: `vector<string> findRepeatedDnaSequences(string s) {
    auto v = [](char c) { return c == 'A' ? 0 : c == 'C' ? 1 : c == 'G' ? 2 : 3; };
    unordered_map<int, int> cnt;
    vector<string> res;
    int code = 0, mask = (1 << 20) - 1;
    for (int i = 0; i < (int)s.size(); i++) {
        code = ((code << 2) | v(s[i])) & mask;
        if (i >= 9 && ++cnt[code] == 2) res.push_back(s.substr(i - 9, 10));
    }
    return res;
}`,
        java: `List<String> findRepeatedDnaSequences(String s) {
    Map<Integer, Integer> cnt = new HashMap<>();
    List<String> res = new ArrayList<>();
    int code = 0, mask = (1 << 20) - 1;
    for (int i = 0; i < s.length(); i++) {
        char c = s.charAt(i);
        int v = c == 'A' ? 0 : c == 'C' ? 1 : c == 'G' ? 2 : 3;
        code = ((code << 2) | v) & mask;
        if (i >= 9 && cnt.merge(code, 1, Integer::sum) == 2) res.add(s.substring(i - 9, i + 1));
    }
    return res;
}`,
        javascript: `function findRepeatedDnaSequences(s) {
  const v = { A: 0, C: 1, G: 2, T: 3 }, mask = (1 << 20) - 1;
  const cnt = new Map(), res = [];
  let code = 0;
  for (let i = 0; i < s.length; i++) {
    code = ((code << 2) | v[s[i]]) & mask;
    if (i < 9) continue;
    const c = (cnt.get(code) ?? 0) + 1;
    cnt.set(code, c);
    if (c === 2) res.push(s.slice(i - 9, i + 1));
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['答案用串列直接 append:出現三次的片段會被加兩次', '長度不到 10 時迴圈範圍算錯(n − 9 可能是負的)'],
  check: {
    kind: 'fn',
    fn: 'findRepeatedDnaSequences',
    compare: 'sorted',
    cases: [
      { args: [S], out: ['AAAAACCCCC', 'CCCCCAAAAA'] },
      { args: ['AAAAAAAAAAAAA'], out: ['AAAAAAAAAA'] },
      { args: ['AAAAAAAAAA'], out: [] },
      { args: ['ACGT'], out: [] },
    ],
  },
}
