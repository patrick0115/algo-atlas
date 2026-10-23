import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1461. Check If a String Contains All Binary Codes of Size K

const S = '00110110'
const K = 2

function setFig(): FigStep[] {
  const seen = new Set<string>()
  const out: FigStep[] = [{ note: `長度 ${K} 的二進位字串共有 2^${K} = ${1 << K} 種。用一個長度 ${K} 的視窗滑過 s,把看到的子字串放進集合`, views: [arr(S.split(''), { label: 's' })] }]
  for (let i = 0; i + K <= S.length; i++) {
    const sub = S.slice(i, i + K)
    const isNew = !seen.has(sub)
    seen.add(sub)
    out.push({ note: `視窗 [${i}, ${i + K - 1}] = "${sub}"${isNew ? ',新的!' : ',看過了'}集合大小 ${seen.size}`, views: [arr(S.split(''), { label: 's', range: [i, i + K - 1] }), arr([...seen], { label: '集合' })] })
  }
  out.push({ note: `集合大小 ${seen.size} ${seen.size === 1 << K ? '=' : '<'} ${1 << K} → ${seen.size === 1 << K}`, views: [arr([...seen], { label: '集合', done: [...seen].map((_, i) => i) })] })
  return out
}

function rollFig(): FigStep[] {
  return [
    { note: `不建子字串:把視窗當成一個 ${K} 位元的整數。往右滑一格 = 左移一位、加上新的位元、用遮罩 (1 << k) − 1 去掉最高位`, views: [arr(S.split(''), { label: 's', range: [0, 1] }), arr(['00 = 0'], { label: '視窗的值' })] },
    { note: '再用長度 2^k 的布林陣列記哪些值出現過,同時數「新出現的」有幾個,湊滿 2^k 就可以提早結束', views: [arr([1, 1, 1, 1], { label: 'seen[0..3]', done: [0, 1, 2, 3] })] },
  ]
}

export const q1461: Solution = {
  id: 1461,
  plain: '長度 k 的 0/1 字串總共有 2^k 種(k = 2 時是 00、01、10、11)。檢查字串 s 裡是不是每一種都有出現過(當作連續的一段)。',
  statement: '給二進位字串 `s` 和整數 `k`,若每一個長度為 k 的二進位字串都是 s 的**子字串**,回傳 true,否則 false。',
  examples: [
    { input: 's = "00110110", k = 2', output: 'true' },
    { input: 's = "0110", k = 1', output: 'true' },
    { input: 's = "0110", k = 2', output: 'false', note: '缺 "00"' },
  ],
  constraints: ['s 長度 ≤ 5·10⁵', 'k ≤ 20 → 2^k ≤ 約 10⁶'],
  insight: ['不用去生成 2^k 個字串一個個找;反過來,把 s 裡所有長度 k 的子字串收集起來,數有幾種', '種類數 == 2^k 就代表全都有', '長度 n 的字串只有 n − k + 1 個視窗,不夠 2^k 個時直接 false'],
  approaches: [
    {
      name: '滑動視窗 + 字串集合',
      idea: '把 `s[i:i+k]` 都放進集合,最後比較大小和 `2^k`。',
      steps: ['`seen = set()`', '`for i in 0..n−k`:`seen.add(s[i : i + k])`', '回傳 `len(seen) == 2 ** k`'],
      figure: { title: `s = "${S}",k = ${K}`, steps: setFig() },
      complexity: { time: 'O(n · k)', space: 'O(2^k · k)', why: '每個視窗切出長度 k 的字串;集合最多 2^k 個。' },
      verdict: '最好寫,一行邏輯。k 最大 20,切字串的成本還可以接受。',
      code: {
        python: `def hasAllCodes(s, k):
    seen = {s[i:i + k] for i in range(len(s) - k + 1)}
    return len(seen) == 1 << k                # 2^k 種全都出現了`,
        c: `// C 沒有字串集合:直接把視窗轉成整數當索引(和方法二相同)
bool hasAllCodes(char *s, int k) {
    int n = strlen(s), need = 1 << k;
    if (n - k + 1 < need) return false;
    char *seen = calloc(need, 1);
    int cnt = 0;
    for (int i = 0; i + k <= n; i++) {
        int v = 0;
        for (int j = i; j < i + k; j++) v = v * 2 + (s[j] - '0');   // 每個視窗重算 O(k)
        if (!seen[v]) { seen[v] = 1; cnt++; }
    }
    free(seen);
    return cnt == need;
}`,
        cpp: `bool hasAllCodes(string s, int k) {
    unordered_set<string> seen;
    for (int i = 0; i + k <= (int)s.size(); i++) seen.insert(s.substr(i, k));
    return (int)seen.size() == (1 << k);
}`,
        java: `boolean hasAllCodes(String s, int k) {
    Set<String> seen = new HashSet<>();
    for (int i = 0; i + k <= s.length(); i++) seen.add(s.substring(i, i + k));
    return seen.size() == (1 << k);
}`,
        javascript: `function hasAllCodes(s, k) {
  const seen = new Set();
  for (let i = 0; i + k <= s.length; i++) seen.add(s.slice(i, i + k));
  return seen.size === 1 << k;
}`,
      },
    },
    {
      name: '滾動位元 + 布林陣列',
      idea: '`v = ((v << 1) | bit) & mask` 維護視窗的值;`seen[v]` 第一次出現時 `cnt += 1`;`cnt == 2^k` 就 true。',
      steps: ['`need = 1 << k`、`mask = need − 1`', '`for i, c`:`v = ((v << 1) | int(c)) & mask`', '`i >= k − 1` 且 `seen[v]` 沒標過 → 標記、`cnt += 1`;`cnt == need` → true', '回傳 false'],
      figure: { title: `s = "${S}",k = ${K}`, steps: rollFig() },
      complexity: { time: 'O(n)', space: 'O(2^k)', why: '每個字元 O(1) 更新視窗的值。' },
      verdict: '最推薦(最快)。[[p:sliding-window]] + [[p:bit-manipulation]]:固定長度的 0/1 視窗可以直接當整數用。',
      code: {
        python: `def hasAllCodes(s, k):
    need = 1 << k
    mask, seen = need - 1, [False] * need
    v = cnt = 0
    for i, c in enumerate(s):
        v = ((v << 1) | (c == '1')) & mask    # 左移、加新位元、去掉超出 k 位的部分
        if i >= k - 1 and not seen[v]:
            seen[v] = True
            cnt += 1
            if cnt == need:
                return True
    return False`,
        c: `bool hasAllCodes(char *s, int k) {
    int need = 1 << k, mask = need - 1, v = 0, cnt = 0;
    char *seen = calloc(need, 1);
    bool ok = false;
    for (int i = 0; s[i] && !ok; i++) {
        v = ((v << 1) | (s[i] - '0')) & mask;
        if (i >= k - 1 && !seen[v]) {
            seen[v] = 1;
            if (++cnt == need) ok = true;
        }
    }
    free(seen);
    return ok;
}`,
        cpp: `bool hasAllCodes(string s, int k) {
    int need = 1 << k, mask = need - 1, v = 0, cnt = 0;
    vector<bool> seen(need);
    for (int i = 0; i < (int)s.size(); i++) {
        v = ((v << 1) | (s[i] - '0')) & mask;
        if (i >= k - 1 && !seen[v]) {
            seen[v] = true;
            if (++cnt == need) return true;
        }
    }
    return false;
}`,
        java: `boolean hasAllCodes(String s, int k) {
    int need = 1 << k, mask = need - 1, v = 0, cnt = 0;
    boolean[] seen = new boolean[need];
    for (int i = 0; i < s.length(); i++) {
        v = ((v << 1) | (s.charAt(i) - '0')) & mask;
        if (i >= k - 1 && !seen[v]) {
            seen[v] = true;
            if (++cnt == need) return true;
        }
    }
    return false;
}`,
        javascript: `function hasAllCodes(s, k) {
  const need = 1 << k, mask = need - 1, seen = new Uint8Array(need);
  let v = 0, cnt = 0;
  for (let i = 0; i < s.length; i++) {
    v = ((v << 1) | (s[i] === '1' ? 1 : 0)) & mask;
    if (i >= k - 1 && !seen[v]) {
      seen[v] = 1;
      if (++cnt === need) return true;
    }
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: ['真的去生成 2^k 個字串再用 `in` 找:每次找是 O(n),總共 O(2^k · n) 太慢', '視窗還沒滿 k 個字就開始記錄(i < k − 1 時的值不是完整的視窗)'],
  check: {
    kind: 'fn',
    fn: 'hasAllCodes',
    cases: [
      { args: [S, K], out: true },
      { args: ['0110', 1], out: true },
      { args: ['0110', 2], out: false },
      { args: ['0', 1], out: false },
      { args: ['0001110100', 3], out: true },
      { args: ['00010111', 3], out: false },
      { args: ['0001011100', 3], out: true },
    ],
  },
}
