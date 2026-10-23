import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1405. Longest Happy String

function heapFig(): FigStep[] {
  return [
    { note: 'a = 1、b = 1、c = 7。貪心:每次放「剩最多」的字母;但如果它已經連續放了兩個,就改放剩第二多的(先墊一個別的字母)', views: [arr(['a:1', 'b:1', 'c:7'], { label: '剩下的數量' })] },
    { note: 'c c → 已經兩個 c 了,改放 a → c c a → 再 c c → 改放 b → c c a c c b → c c', views: [arr('ccaccbcc'.split(''), { label: '結果' })] },
    { note: '剩 c 一個,但前面已經是 "cc",而且沒有別的字母可以墊 → 停下。長度 8', views: [arr('ccaccbcc'.split(''), { label: '最長的快樂字串', done: [0, 1, 2, 3, 4, 5, 6, 7] })] },
  ]
}

function recFig(): FigStep[] {
  return [
    { note: '另一種寫法:每一輪看「目前最多的字母 x」能不能一次放兩個(數量比第二多的多很多時),再放一個第二多的當隔板', views: [arr(['x x', 'y'], { label: '一輪放的東西' })] },
    { note: '本質一樣:最多的字母要盡量多用,但每兩個要用別的字母隔開。隔板用完就結束', views: [arr('ccaccbcc'.split(''), { label: '結果', done: [0, 1, 3, 4, 6, 7] })] },
  ]
}

const CHECK = {
  python: `

def happyCheck(a, b, c):                      # 測試用:檢查答案合法,回傳長度(不合法回傳 -1)
    s = longestDiverseString(a, b, c)
    ok = 'aaa' not in s and 'bbb' not in s and 'ccc' not in s \\
        and s.count('a') <= a and s.count('b') <= b and s.count('c') <= c
    return len(s) if ok else -1`,
  c: `

int happyCheck(int a, int b, int c) {
    char *s = longestDiverseString(a, b, c);
    int cnt[3] = {0}, n = strlen(s);
    for (int i = 0; i < n; i++) {
        cnt[s[i] - 'a']++;
        if (i >= 2 && s[i] == s[i - 1] && s[i] == s[i - 2]) return -1;
    }
    if (cnt[0] > a || cnt[1] > b || cnt[2] > c) return -1;
    return n;
}`,
  cpp: `

int happyCheck(int a, int b, int c) {
    string s = longestDiverseString(a, b, c);
    if (s.find("aaa") != string::npos || s.find("bbb") != string::npos || s.find("ccc") != string::npos) return -1;
    if (count(s.begin(), s.end(), 'a') > a || count(s.begin(), s.end(), 'b') > b || count(s.begin(), s.end(), 'c') > c) return -1;
    return s.size();
}`,
  java: `

int happyCheck(int a, int b, int c) {
    String s = longestDiverseString(a, b, c);
    if (s.contains("aaa") || s.contains("bbb") || s.contains("ccc")) return -1;
    int[] cnt = new int[3];
    for (char ch : s.toCharArray()) cnt[ch - 'a']++;
    if (cnt[0] > a || cnt[1] > b || cnt[2] > c) return -1;
    return s.length();
}`,
  javascript: `

function happyCheck(a, b, c) {
  const s = longestDiverseString(a, b, c);
  if (/aaa|bbb|ccc/.test(s)) return -1;
  const cnt = (ch) => s.split(ch).length - 1;
  if (cnt('a') > a || cnt('b') > b || cnt('c') > c) return -1;
  return s.length;
}`,
}

export const q1405: Solution = {
  id: 1405,
  plain: '用最多 a 個 "a"、b 個 "b"、c 個 "c" 排出一個字串,規則是不能有三個一樣的字母連在一起。能排出的最長字串是什麼?(答案可能不只一種,給任一種最長的都可以)',
  statement: '「快樂字串」不含 "aaa"、"bbb"、"ccc" 作為子字串,且 a、b、c 的使用次數分別不超過給定的 a、b、c。回傳任一個最長的快樂字串;不存在則回傳 ""。(答案不唯一,這裡用 `happyCheck(a, b, c)` 檢查答案合法並回傳長度。)',
  examples: [
    { input: 'a = 1, b = 1, c = 7', output: '"ccaccbcc"(或 "ccbccacc")' },
    { input: 'a = 7, b = 1, c = 0', output: '"aabaa"' },
  ],
  constraints: ['a, b, c ≤ 100'],
  insight: ['數量最多的字母最容易用不完 → 盡量優先放它', '但同一個字母最多連放兩個;已經連續兩個時,換放剩第二多的當「隔板」', '沒有別的字母可以當隔板時,就只能停'],
  approaches: [
    {
      name: '貪心:每次放剩最多的(必要時換第二多)',
      idea: '每一步依剩餘數量排序;最多的那個如果不會造成三連就放它,否則放第二多的;都不能放就結束。',
      steps: ['`cnt = [[a,"a"], [b,"b"], [c,"c"]]`', '每一步依數量由多到少排序', '最多的那個:結尾已經是兩個它 → 改試第二多的;數量是 0 就結束', '放進去、數量 −1'],
      figure: { title: 'a = 1,b = 1,c = 7', steps: heapFig() },
      complexity: { time: 'O(a + b + c)', space: 'O(1)', why: '每一步放一個字,只排序 3 個數。' },
      verdict: '最推薦。只有 3 種字母,「堆積」直接用排序 3 個數代替。',
      code: {
        python: `def longestDiverseString(a, b, c):
    cnt = [[a, 'a'], [b, 'b'], [c, 'c']]
    res = []
    while True:
        cnt.sort(reverse=True)                # 剩最多的排前面
        placed = False
        for k in range(3):
            n, ch = cnt[k]
            if n == 0:
                break
            if len(res) >= 2 and res[-1] == res[-2] == ch:
                continue                      # 會變三連,換下一個
            res.append(ch)
            cnt[k][0] -= 1
            placed = True
            break
        if not placed:
            return ''.join(res)${CHECK.python}`,
        c: `char *longestDiverseString(int a, int b, int c) {
    int cnt[3] = {a, b, c}, len = 0;
    char *res = malloc(a + b + c + 1);
    for (;;) {
        int order[3] = {0, 1, 2};
        for (int i = 0; i < 3; i++)           // 依剩餘數量由多到少排
            for (int j = i + 1; j < 3; j++)
                if (cnt[order[j]] > cnt[order[i]]) { int t = order[i]; order[i] = order[j]; order[j] = t; }
        int placed = 0;
        for (int k = 0; k < 3 && !placed; k++) {
            int x = order[k];
            if (cnt[x] == 0) break;
            if (len >= 2 && res[len - 1] == 'a' + x && res[len - 2] == 'a' + x) continue;
            res[len++] = 'a' + x;
            cnt[x]--;
            placed = 1;
        }
        if (!placed) break;
    }
    res[len] = '\\0';
    return res;
}${CHECK.c}`,
        cpp: `string longestDiverseString(int a, int b, int c) {
    vector<pair<int, char>> cnt{{a, 'a'}, {b, 'b'}, {c, 'c'}};
    string res;
    for (;;) {
        sort(cnt.rbegin(), cnt.rend());
        bool placed = false;
        for (auto &[n, ch] : cnt) {
            if (n == 0) break;
            int L = res.size();
            if (L >= 2 && res[L - 1] == ch && res[L - 2] == ch) continue;
            res += ch;
            n--;
            placed = true;
            break;
        }
        if (!placed) return res;
    }
}${CHECK.cpp}`,
        java: `String longestDiverseString(int a, int b, int c) {
    int[][] cnt = {{a, 'a'}, {b, 'b'}, {c, 'c'}};
    StringBuilder res = new StringBuilder();
    while (true) {
        Arrays.sort(cnt, (x, y) -> y[0] - x[0]);
        boolean placed = false;
        for (int[] e : cnt) {
            if (e[0] == 0) break;
            int L = res.length();
            if (L >= 2 && res.charAt(L - 1) == e[1] && res.charAt(L - 2) == e[1]) continue;
            res.append((char) e[1]);
            e[0]--;
            placed = true;
            break;
        }
        if (!placed) return res.toString();
    }
}${CHECK.java}`,
        javascript: `function longestDiverseString(a, b, c) {
  const cnt = [[a, 'a'], [b, 'b'], [c, 'c']];
  let res = '';
  for (;;) {
    cnt.sort((x, y) => y[0] - x[0]);
    let placed = false;
    for (const e of cnt) {
      if (e[0] === 0) break;
      const L = res.length;
      if (L >= 2 && res[L - 1] === e[1] && res[L - 2] === e[1]) continue;
      res += e[1];
      e[0]--;
      placed = true;
      break;
    }
    if (!placed) return res;
  }
}${CHECK.javascript}`,
      },
    },
    {
      name: '遞迴:最多的放兩個,第二多的放一個當隔板',
      idea: '`gen(x, y, z)`(依數量 x ≥ y ≥ z):y == 0 → 回傳 min(2, x) 個 X;否則放 min(2, x) 個 X(x 比 y 多很多時才放兩個),再放一個 Y,剩下遞迴。',
      steps: ['把三種依數量排序成 (x, X) ≥ (y, Y) ≥ (z, Z)', '`y == 0` → 回傳 `X * min(2, x)`', '`use = min(2, x)`;`x − use < y` 時只用 1 個(把機會留給更長的字串)', '回傳 `X * use + Y + gen(x − use, y − 1, z)`(重新排序)'],
      figure: { title: 'a = 1,b = 1,c = 7', steps: recFig() },
      complexity: { time: 'O(a + b + c)', space: 'O(a + b + c)', why: '每層至少消耗一個字母;遞迴深度同級。' },
      verdict: '一次放一組「XX Y」,步數比較少;要小心「x 不夠多時只放一個」的判斷。',
      code: {
        python: `def longestDiverseString(a, b, c):
    def gen(items):
        items.sort(reverse=True)              # [(數量, 字母)] 由多到少
        (x, X), (y, Y), z = items
        if y == 0:
            return X * min(2, x)
        use = 2 if x - 2 >= y else 1          # 最多的明顯比較多時才放兩個
        return X * use + Y + gen([(x - use, X), (y - 1, Y), z])
    return gen([(a, 'a'), (b, 'b'), (c, 'c')])${CHECK.python}`,
        c: `static void gen(int *cnt, char *out, int *len) {
    int o[3] = {0, 1, 2};
    for (int i = 0; i < 3; i++)
        for (int j = i + 1; j < 3; j++)
            if (cnt[o[j]] > cnt[o[i]]) { int t = o[i]; o[i] = o[j]; o[j] = t; }
    int x = o[0], y = o[1];
    if (cnt[y] == 0) {
        for (int k = 0; k < 2 && cnt[x] > 0; k++) { out[(*len)++] = 'a' + x; cnt[x]--; }
        return;
    }
    int use = cnt[x] - 2 >= cnt[y] ? 2 : 1;
    for (int k = 0; k < use; k++) out[(*len)++] = 'a' + x;
    cnt[x] -= use;
    out[(*len)++] = 'a' + y;
    cnt[y]--;
    gen(cnt, out, len);
}

char *longestDiverseString(int a, int b, int c) {
    int cnt[3] = {a, b, c}, len = 0;
    char *res = malloc(a + b + c + 1);
    gen(cnt, res, &len);
    res[len] = '\\0';
    return res;
}${CHECK.c}`,
        cpp: `string gen(vector<pair<int, char>> v) {
    sort(v.rbegin(), v.rend());
    auto [x, X] = v[0];
    auto [y, Y] = v[1];
    if (y == 0) return string(min(2, x), X);
    int use = x - 2 >= y ? 2 : 1;
    return string(use, X) + Y + gen({{x - use, X}, {y - 1, Y}, v[2]});
}

string longestDiverseString(int a, int b, int c) { return gen({{a, 'a'}, {b, 'b'}, {c, 'c'}}); }${CHECK.cpp}`,
        java: `String longestDiverseString(int a, int b, int c) {
    return gen(new int[][]{{a, 'a'}, {b, 'b'}, {c, 'c'}});
}

private String gen(int[][] v) {
    Arrays.sort(v, (p, q) -> q[0] - p[0]);
    int x = v[0][0], y = v[1][0];
    char X = (char) v[0][1], Y = (char) v[1][1];
    if (y == 0) return String.valueOf(X).repeat(Math.min(2, x));
    int use = x - 2 >= y ? 2 : 1;
    return String.valueOf(X).repeat(use) + Y + gen(new int[][]{{x - use, X}, {y - 1, Y}, v[2]});
}${CHECK.java}`,
        javascript: `function longestDiverseString(a, b, c) {
  const gen = (v) => {
    v.sort((p, q) => q[0] - p[0]);
    const [[x, X], [y, Y], z] = v;
    if (y === 0) return X.repeat(Math.min(2, x));
    const use = x - 2 >= y ? 2 : 1;
    return X.repeat(use) + Y + gen([[x - use, X], [y - 1, Y], z]);
  };
  return gen([[a, 'a'], [b, 'b'], [c, 'c']]);
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['只看「剩最多」而不檢查結尾是否已經兩連:會產生 "ccc"', '最多的字母沒有優先使用:最後會剩一大堆用不掉,字串變短'],
  check: {
    kind: 'fn',
    fn: 'happyCheck',
    cases: [
      { args: [1, 1, 7], out: 8 },
      { args: [7, 1, 0], out: 5 },
      { args: [2, 2, 1], out: 5 },
      { args: [0, 0, 0], out: 0 },
      { args: [0, 8, 11], out: 19 },
      { args: [4, 42, 7], out: 35 },
    ],
  },
}
