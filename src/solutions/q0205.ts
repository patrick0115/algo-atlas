import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 205. Isomorphic Strings

const S = 'paper'
const T = 'title'
const BAD_S = 'badc'
const BAD_T = 'baba'

function twoMapFig(): FigStep[] {
  const st = new Map<string, string>()
  const ts = new Map<string, string>()
  const out: FigStep[] = [{ note: '同構 = 能找到一套「一對一」的換字規則。要檢查兩個方向:s 的同一個字永遠換成同一個 t 字,t 的同一個字也只能來自同一個 s 字', views: [arr(S.split(''), { label: 's' }), arr(T.split(''), { label: 't' })] }]
  for (let i = 0; i < S.length; i++) {
    const a = S[i]
    const b = T[i]
    const isNew = !st.has(a)
    st.set(a, b)
    ts.set(b, a)
    out.push({ note: isNew ? `${a} 第一次出現 → 記下 ${a}→${b},也記 ${b}→${a}` : `${a} 之前對應 ${st.get(a)},這次也是 ${b} ✓`, views: [arr(S.split(''), { label: 's', highlight: [i] }), arr(T.split(''), { label: 't', highlight: [i] }), kv([...st.entries()], 's → t', [a]), kv([...ts.entries()], 't → s', [b])] })
  }
  out.push({ note: `"${S}" 和 "${T}" 同構 → true`, views: [kv([...st.entries()], 's → t')] })
  out.push({ note: `反例 s = "${BAD_S}"、t = "${BAD_T}":b→b、a→a、d→b … 但 t → s 那張表裡 b 已經對應 b,現在又要對應 d → 兩個字換成同一個字,不合法 → false。只檢查一個方向會漏掉這種情況`, views: [arr(BAD_S.split(''), { label: 's', highlight: [2], compare: [0] }), arr(BAD_T.split(''), { label: 't', highlight: [2], compare: [0] }), kv([['b', 'b'], ['a', 'a']], 't → s', ['b'])] })
  return out
}

function firstSeenFig(): FigStep[] {
  const enc = (w: string) => w.split('').map((c) => w.indexOf(c))
  return [
    { note: '換個角度:把每個字換成「它第一次出現的位置」。同構的兩個字串,換完會長得一模一樣', views: [arr(S.split(''), { label: 's' }), arr(enc(S), { label: 's 每個字第一次出現在哪' })] },
    { note: `t 也一樣換:[${enc(T)}],和 s 的 [${enc(S)}] 相同 → true`, views: [arr(T.split(''), { label: 't' }), arr(enc(T), { label: 't 每個字第一次出現在哪', done: enc(T).map((_, i) => i) })] },
    { note: `反例:"${BAD_S}" → [${enc(BAD_S)}],"${BAD_T}" → [${enc(BAD_T)}],在索引 2 不一樣 → false`, views: [arr(enc(BAD_S), { label: BAD_S, highlight: [2] }), arr(enc(BAD_T), { label: BAD_T, highlight: [2] })] },
  ]
}

export const q0205: Solution = {
  id: 205,
  plain: '能不能用一套「換字密碼」把 s 變成 t?規則是:同一個字永遠換成同一個字,而且不同的字不能換成同一個字。例如 egg → add 可以(e→a、g→d),foo → bar 不行(o 一下換成 a、一下換成 r)。',
  statement: '給等長字串 `s`、`t`,判斷它們是否**同構**:s 的每個字元都能一對一替換成 t 對應位置的字元(同一字元永遠換成同一個,不同字元不能換成同一個,字元可以換成自己)。',
  examples: [
    { input: 's = "egg", t = "add"', output: 'true' },
    { input: 's = "foo", t = "bar"', output: 'false' },
    { input: 's = "paper", t = "title"', output: 'true' },
  ],
  constraints: ['長度 ≤ 5·10⁴', '字元是任意 ASCII → 對照表可以用長度 256 的陣列'],
  insight: ['「一對一」要檢查**兩個方向**:s→t 不衝突,t→s 也不衝突', '只檢查一邊會被 "badc" / "baba" 騙過(b、d 都換成 b)', '另一種想法:把字串轉成「每個字第一次出現的位置」,同構 ⇔ 轉完相同'],
  approaches: [
    {
      name: '兩張對照表',
      idea: '`st[s[i]]` 記 s 字換成什麼,`ts[t[i]]` 記 t 字來自什麼;任何一邊衝突就 false。',
      steps: ['`st = {}`、`ts = {}`', '對每個 i:`a = s[i]`、`b = t[i]`', '`a` 在 st 裡但 `st[a] != b`,或 `b` 在 ts 裡但 `ts[b] != a` → false', '記下 `st[a] = b`、`ts[b] = a`', '全部沒衝突 → true'],
      figure: { title: `s = "${S}",t = "${T}"`, steps: twoMapFig() },
      complexity: { time: 'O(n)', space: 'O(字元種類)', why: '一次掃描;表最多 256 格。' },
      verdict: '最推薦,邏輯最直接。[290. Word Pattern](#/q/290) 是同一題換成「字 ↔ 單字」。',
      code: {
        python: `def isIsomorphic(s, t):
    st, ts = {}, {}
    for a, b in zip(s, t):
        if st.get(a, b) != b or ts.get(b, a) != a:
            return False                      # 某一邊已經對應到別人了
        st[a], ts[b] = b, a
    return True`,
        c: `bool isIsomorphic(char *s, char *t) {
    int st[256] = {0}, ts[256] = {0};      // 0 表示還沒對應;存的是字元 + 1
    for (int i = 0; s[i]; i++) {
        unsigned char a = s[i], b = t[i];
        if (st[a] && st[a] != b + 1) return false;
        if (ts[b] && ts[b] != a + 1) return false;
        st[a] = b + 1; ts[b] = a + 1;
    }
    return true;
}`,
        cpp: `bool isIsomorphic(string s, string t) {
    int st[256] = {0}, ts[256] = {0};
    for (size_t i = 0; i < s.size(); i++) {
        unsigned char a = s[i], b = t[i];
        if ((st[a] && st[a] != b + 1) || (ts[b] && ts[b] != a + 1)) return false;
        st[a] = b + 1; ts[b] = a + 1;
    }
    return true;
}`,
        java: `boolean isIsomorphic(String s, String t) {
    int[] st = new int[256], ts = new int[256];
    for (int i = 0; i < s.length(); i++) {
        char a = s.charAt(i), b = t.charAt(i);
        if ((st[a] != 0 && st[a] != b + 1) || (ts[b] != 0 && ts[b] != a + 1)) return false;
        st[a] = b + 1; ts[b] = a + 1;
    }
    return true;
}`,
        javascript: `function isIsomorphic(s, t) {
  const st = new Map(), ts = new Map();
  for (let i = 0; i < s.length; i++) {
    const a = s[i], b = t[i];
    if ((st.has(a) && st.get(a) !== b) || (ts.has(b) && ts.get(b) !== a)) return false;
    st.set(a, b);
    ts.set(b, a);
  }
  return true;
}`,
      },
    },
    {
      name: '比較「第一次出現的位置」',
      idea: '兩個字串同時掃:`s[i]` 上次出現的位置和 `t[i]` 上次出現的位置必須一樣。',
      steps: ['`ps`、`pt`:每個字元最後一次出現在哪(預設 −1)', '對每個 i:`ps[s[i]] != pt[t[i]]` → false', '更新 `ps[s[i]] = pt[t[i]] = i`'],
      figure: { title: `s = "${S}",t = "${T}"`, steps: firstSeenFig() },
      complexity: { time: 'O(n)', space: 'O(字元種類)', why: '一次掃描,兩個長度 256 的表。' },
      verdict: '一條規則就同時處理兩個方向,寫起來更短。理解上要多繞一下。',
      code: {
        python: `def isIsomorphic(s, t):
    ps, pt = {}, {}
    for i, (a, b) in enumerate(zip(s, t)):
        if ps.get(a, -1) != pt.get(b, -1):
            return False                      # 兩邊上一次出現的位置不同
        ps[a] = pt[b] = i
    return True`,
        c: `bool isIsomorphic(char *s, char *t) {
    int ps[256], pt[256];
    for (int k = 0; k < 256; k++) ps[k] = pt[k] = -1;
    for (int i = 0; s[i]; i++) {
        unsigned char a = s[i], b = t[i];
        if (ps[a] != pt[b]) return false;
        ps[a] = pt[b] = i;
    }
    return true;
}`,
        cpp: `bool isIsomorphic(string s, string t) {
    vector<int> ps(256, -1), pt(256, -1);
    for (int i = 0; i < (int)s.size(); i++) {
        unsigned char a = s[i], b = t[i];
        if (ps[a] != pt[b]) return false;
        ps[a] = pt[b] = i;
    }
    return true;
}`,
        java: `boolean isIsomorphic(String s, String t) {
    int[] ps = new int[256], pt = new int[256];
    Arrays.fill(ps, -1);
    Arrays.fill(pt, -1);
    for (int i = 0; i < s.length(); i++) {
        char a = s.charAt(i), b = t.charAt(i);
        if (ps[a] != pt[b]) return false;
        ps[a] = pt[b] = i;
    }
    return true;
}`,
        javascript: `function isIsomorphic(s, t) {
  const ps = new Map(), pt = new Map();
  for (let i = 0; i < s.length; i++) {
    if ((ps.get(s[i]) ?? -1) !== (pt.get(t[i]) ?? -1)) return false;
    ps.set(s[i], i);
    pt.set(t[i], i);
  }
  return true;
}`,
      },
    },
  ],
  pitfalls: ['只檢查 s → t 一個方向:"badc" / "baba" 會誤判成 true', 'C 的 char 可能是負數,當索引前轉成 unsigned char'],
  check: {
    kind: 'fn',
    fn: 'isIsomorphic',
    cases: [
      { args: ['egg', 'add'], out: true },
      { args: ['foo', 'bar'], out: false },
      { args: [S, T], out: true },
      { args: [BAD_S, BAD_T], out: false },
      { args: ['a', 'a'], out: true },
      { args: ['ab', 'aa'], out: false },
    ],
  },
}
