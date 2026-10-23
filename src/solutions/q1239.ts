import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1239. Maximum Length of a Concatenated String with Unique Characters

const A = ['un', 'iq', 'ue']

function btFig(): FigStep[] {
  return [
    { note: '每個字串「選或不選」,選了之後拼起來的字母不能有重複。先把每個字串轉成 26 位元的遮罩;字串自己有重複字母(例如 "aa")直接丟掉', views: [arr(A, { label: 'arr' }), arr(['{n,u}', '{i,q}', '{e,u}'], { label: '遮罩(用到的字母)' })] },
    { note: '回溯 dfs(i, mask):跳過第 i 個,或者在 `mask & 第 i 個 == 0`(沒有共同字母)時選它', views: [arr(['un', 'iq'], { label: '選 un、iq → "uniq"', done: [0, 1] })] },
    { note: '"un" 和 "ue" 都有 u → 不能一起選。最長是 "uniq" 或 "ique",長度 4', views: [arr(['un', 'iq', 'ue'], { label: 'un 和 ue 衝突', highlight: [0, 2], dim: [1] }), arr([4], { label: '答案', done: [0] })] },
  ]
}

function setFig(): FigStep[] {
  return [
    { note: '迭代版:維護「目前所有可行的遮罩」清單,一開始只有空集合 {}', views: [arr(['{}'], { label: '可行組合' })] },
    { note: '加入 "un":每個舊組合若和 un 不衝突就產生新組合 → {}, {un};加入 "iq" → {}, {un}, {iq}, {un,iq}', views: [arr(['{}', 'un', 'iq', 'uniq'], { label: '可行組合' })] },
    { note: '加入 "ue":只能和 {}、{iq} 合 → 再多 ue、ique。最長的長度是 4', views: [arr(['{}', 'un', 'iq', 'uniq', 'ue', 'ique'], { label: '可行組合', done: [3, 5] })] },
  ]
}

export const q1239: Solution = {
  id: 1239,
  plain: '有好幾個字串,挑其中幾個接在一起,接出來的字串不能有任何字母重複。最長能接多長?',
  statement: '給字串陣列 `arr`,從中選一個子序列串接成字串 s,要求 s 的字元**互不相同**。回傳 s 可能的最大長度。',
  examples: [
    { input: 'arr = ["un","iq","ue"]', output: '4', note: '"uniq" 或 "ique"' },
    { input: 'arr = ["cha","r","act","ers"]', output: '6', note: '"chaers" 或 "acters"' },
    { input: 'arr = ["abcdefghijklmnopqrstuvwxyz"]', output: '26' },
  ],
  constraints: ['arr.length ≤ 16,每個字串長度 ≤ 26,只含小寫字母'],
  insight: ['每個字串選或不選 → 2¹⁶ 種,回溯可行', '「字母集合」用 26 位元整數表示,檢查衝突就是 `a & b`', '自己就有重複字母的字串永遠不能選,先過濾掉'],
  approaches: [
    {
      name: '回溯 + 位元遮罩',
      idea: '先轉遮罩(過濾掉自身重複的);`dfs(i, mask)`:答案更新 popcount(mask);對 j ≥ i 且不衝突的,選它遞迴。',
      steps: ['`masks`:每個字串轉遮罩,自身有重複的丟掉', '`dfs(i, mask)`:`best = max(best, popcount(mask))`', '`for j in range(i, len(masks))`:`mask & masks[j] == 0` → `dfs(j + 1, mask | masks[j])`'],
      figure: { title: `arr = [${A.map((s) => `"${s}"`).join(', ')}]`, steps: btFig() },
      complexity: { time: 'O(2ⁿ)', space: 'O(n)', why: '最多每個子集走一次;遮罩運算 O(1)。' },
      verdict: '最推薦,[[p:backtracking]] 加上 [[p:bit-manipulation]] 讓衝突檢查變成一次 AND。',
      code: {
        python: `def maxLength(arr):
    masks = []
    for w in arr:
        m = 0
        for ch in w:
            b = 1 << (ord(ch) - 97)
            if m & b:
                m = -1                        # 自己就有重複字母
                break
            m |= b
        if m != -1:
            masks.append(m)
    best = 0

    def dfs(i, mask):
        nonlocal best
        best = max(best, bin(mask).count('1'))
        for j in range(i, len(masks)):
            if mask & masks[j] == 0:          # 沒有共同字母才能接
                dfs(j + 1, mask | masks[j])

    dfs(0, 0)
    return best`,
        c: `static int masks[16], m, best;

static void dfs(int i, int mask) {
    int c = __builtin_popcount(mask);
    if (c > best) best = c;
    for (int j = i; j < m; j++)
        if (!(mask & masks[j])) dfs(j + 1, mask | masks[j]);
}

int maxLength(char **arr, int arrSize) {
    m = best = 0;
    for (int i = 0; i < arrSize; i++) {
        int x = 0, bad = 0;
        for (char *p = arr[i]; *p; p++) {
            int b = 1 << (*p - 'a');
            if (x & b) { bad = 1; break; }
            x |= b;
        }
        if (!bad) masks[m++] = x;
    }
    dfs(0, 0);
    return best;
}`,
        cpp: `int maxLength(vector<string>& arr) {
    vector<int> masks;
    for (auto &w : arr) {
        int x = 0;
        bool bad = false;
        for (char ch : w) {
            int b = 1 << (ch - 'a');
            if (x & b) { bad = true; break; }
            x |= b;
        }
        if (!bad) masks.push_back(x);
    }
    int best = 0;
    function<void(int, int)> dfs = [&](int i, int mask) {
        best = max(best, __builtin_popcount(mask));
        for (int j = i; j < (int)masks.size(); j++)
            if (!(mask & masks[j])) dfs(j + 1, mask | masks[j]);
    };
    dfs(0, 0);
    return best;
}`,
        java: `int best;

int maxLength(List<String> arr) {
    List<Integer> masks = new ArrayList<>();
    for (String w : arr) {
        int x = 0;
        boolean bad = false;
        for (char ch : w.toCharArray()) {
            int b = 1 << (ch - 'a');
            if ((x & b) != 0) { bad = true; break; }
            x |= b;
        }
        if (!bad) masks.add(x);
    }
    best = 0;
    dfs(masks, 0, 0);
    return best;
}

void dfs(List<Integer> masks, int i, int mask) {
    best = Math.max(best, Integer.bitCount(mask));
    for (int j = i; j < masks.size(); j++)
        if ((mask & masks.get(j)) == 0) dfs(masks, j + 1, mask | masks.get(j));
}`,
        javascript: `function maxLength(arr) {
  const masks = [];
  for (const w of arr) {
    let x = 0, bad = false;
    for (const ch of w) {
      const b = 1 << (ch.charCodeAt(0) - 97);
      if (x & b) {
        bad = true;
        break;
      }
      x |= b;
    }
    if (!bad) masks.push(x);
  }
  const pop = (x) => x.toString(2).split('1').length - 1;
  let best = 0;
  const dfs = (i, mask) => {
    best = Math.max(best, pop(mask));
    for (let j = i; j < masks.length; j++) if ((mask & masks[j]) === 0) dfs(j + 1, mask | masks[j]);
  };
  dfs(0, 0);
  return best;
}`,
      },
    },
    {
      name: '迭代擴充可行集合',
      idea: '`dp = [0]`(空集合);每個合法遮罩 w,對 dp 裡每個不衝突的 m 加入 `m | w`;答案是 dp 中 popcount 最大的。',
      steps: ['`dp = [0]`', '每個合法遮罩 w:`for m in dp[:]`:`m & w == 0` → `dp.append(m | w)`', '回傳 `max(popcount(m) for m in dp)`'],
      figure: { title: `arr = [${A.map((s) => `"${s}"`).join(', ')}]`, steps: setFig() },
      complexity: { time: 'O(2ⁿ)', space: 'O(2ⁿ)', why: 'dp 最多 2ⁿ 個組合。' },
      verdict: '不用遞迴,概念像「子集合」的迭代寫法 [78](#/q/78)。',
      code: {
        python: `def maxLength(arr):
    dp = [0]                                  # 目前所有可行的字母集合
    for w in arr:
        x = 0
        for ch in w:
            x |= 1 << (ord(ch) - 97)
        if bin(x).count('1') != len(w):
            continue                          # 自己有重複
        dp += [m | x for m in dp if m & x == 0]
    return max(bin(m).count('1') for m in dp)`,
        c: `int maxLength(char **arr, int arrSize) {
    int *dp = malloc((1 << 16) * sizeof(int)), sz = 1, best = 0;
    dp[0] = 0;
    for (int i = 0; i < arrSize; i++) {
        int x = 0, len = strlen(arr[i]);
        for (int k = 0; k < len; k++) x |= 1 << (arr[i][k] - 'a');
        if (__builtin_popcount(x) != len) continue;
        int cur = sz;
        for (int k = 0; k < cur; k++) if (!(dp[k] & x)) dp[sz++] = dp[k] | x;
    }
    for (int k = 0; k < sz; k++) if (__builtin_popcount(dp[k]) > best) best = __builtin_popcount(dp[k]);
    free(dp);
    return best;
}`,
        cpp: `int maxLength(vector<string>& arr) {
    vector<int> dp{0};
    for (auto &w : arr) {
        int x = 0;
        for (char ch : w) x |= 1 << (ch - 'a');
        if (__builtin_popcount(x) != (int)w.size()) continue;
        int cur = dp.size();
        for (int k = 0; k < cur; k++) if (!(dp[k] & x)) dp.push_back(dp[k] | x);
    }
    int best = 0;
    for (int m : dp) best = max(best, __builtin_popcount(m));
    return best;
}`,
        java: `int maxLength(List<String> arr) {
    List<Integer> dp = new ArrayList<>(List.of(0));
    for (String w : arr) {
        int x = 0;
        for (char ch : w.toCharArray()) x |= 1 << (ch - 'a');
        if (Integer.bitCount(x) != w.length()) continue;
        int cur = dp.size();
        for (int k = 0; k < cur; k++) if ((dp.get(k) & x) == 0) dp.add(dp.get(k) | x);
    }
    int best = 0;
    for (int m : dp) best = Math.max(best, Integer.bitCount(m));
    return best;
}`,
        javascript: `function maxLength(arr) {
  const pop = (x) => x.toString(2).split('1').length - 1;
  const dp = [0];
  for (const w of arr) {
    let x = 0;
    for (const ch of w) x |= 1 << (ch.charCodeAt(0) - 97);
    if (pop(x) !== w.length) continue;
    const cur = dp.length;
    for (let k = 0; k < cur; k++) if ((dp[k] & x) === 0) dp.push(dp[k] | x);
  }
  return Math.max(...dp.map(pop));
}`,
      },
    },
  ],
  pitfalls: ['忘了過濾自身有重複字母的字串(例如 "aa"):轉遮罩時重複的位元被吃掉,長度會算錯', '以為要保持原陣列的連續:子序列可以跳著選'],
  check: {
    kind: 'fn',
    fn: 'maxLength',
    cases: [
      { args: [A], out: 4 },
      { args: [['cha', 'r', 'act', 'ers']], out: 6 },
      { args: [['abcdefghijklmnopqrstuvwxyz']], out: 26 },
      { args: [['aa', 'bb']], out: 0 },
      { args: [['a', 'abc', 'd', 'de', 'def']], out: 6 },
    ],
  },
}
