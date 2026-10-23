import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 2306. Naming a Company

const IDEAS = ['coffee', 'donuts', 'time', 'toffee']

function groupFig(): FigStep[] {
  const groups = new Map<string, string[]>()
  for (const w of IDEAS) groups.set(w[0], [...(groups.get(w[0]) ?? []), w.slice(1)])
  return [
    { note: '交換兩個名字的首字母:"coffee" + "donuts" → "doffee" + "conuts",兩個新名字都不能是原本就有的。依**首字母**分組,只看剩下的「後綴」', views: [arr(IDEAS, { label: 'ideas' }), kv([...groups.entries()].map(([k, v]) => [k, v.join(', ')]), '首字母 → 後綴')] },
    { note: '同一組裡的兩個名字交換首字母等於沒換(會撞到自己),所以只看**不同組**。組 c 和組 t:後綴 "offee" 兩組都有 → 它一換就會撞名,不能用', views: [kv([['c', 'offee'], ['t', 'ime, offee']], '組 c vs 組 t', ['c', 't'])] },
    { note: '組 a 能選的 = |A| − 共同後綴數,組 b 同理;兩組能配出 (|A| − 共) × (|B| − 共) 對,順序不同算兩個 → ×2。c×t:(1 − 1)×(2 − 1) = 0;c×d:1×1 = 1 → 2 個;d×t:1×2 = 2 → 4 個。總共 6', views: [arr(['c×d: 2', 'c×t: 0', 'd×t: 4'], { label: '每對首字母', done: [0, 2] })] },
  ]
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:每對 (i, j) 都真的交換首字母,檢查兩個新名字是否都不在原清單裡', views: [arr(['doffee', 'conuts'], { label: 'coffee × donuts', done: [0, 1] })] },
    { note: '"coffee" × "toffee" → "toffee" 和 "coffee":都在原清單裡 → 不行。n = 5·10⁴ 時 n² 對太多', views: [arr(['toffee', 'coffee'], { label: 'coffee × toffee', dim: [0, 1] })] },
  ]
}

export const q2306: Solution = {
  id: 2306,
  plain: '從一堆候選名字裡挑兩個,把它們的**第一個字母**互換,如果換完後的兩個新名字都不在原本的清單裡,就把兩個新名字接起來當公司名。有幾種不同的公司名?',
  statement: '給字串陣列 `ideas`(互不相同)。選兩個不同的 ideaA、ideaB,交換它們的首字母;若兩個新字串都不在 ideas 中,則 `"新A 新B"` 是一個有效名稱。回傳不同有效名稱的數量(A、B 順序不同算不同)。',
  examples: [
    { input: 'ideas = ["coffee","donuts","time","toffee"]', output: '6' },
    { input: 'ideas = ["lack","back"]', output: '0' },
  ],
  constraints: ['n ≤ 5·10⁴ → 兩兩配對 O(n²) 太慢', '只有小寫字母 → 首字母最多 26 組'],
  insight: ['同首字母的兩個名字交換首字母等於沒換 → 只配不同組', '組 A 的後綴 x 和組 B 配對時,只要 x 也出現在組 B 的後綴裡,換過去就會撞名', '所以每對組 (A, B):能用的是「不在對方組裡」的後綴 → `(|A| − 共同) × (|B| − 共同) × 2`', '26 × 26 對組,每對算一次交集'],
  approaches: [
    {
      name: '依首字母分組 + 數交集',
      idea: '`groups[c]` = 首字母 c 的後綴集合;對每對 a < b:`common = |groups[a] ∩ groups[b]|`,`ans += 2 × (|A| − common) × (|B| − common)`。',
      steps: ['分組:`groups[w[0]].add(w[1:])`', '`for a < b`(26 × 26):算共同後綴數', '`ans += 2 * (len(A) − common) * (len(B) − common)`'],
      figure: { title: `ideas = [${IDEAS.join(', ')}]`, steps: groupFig() },
      complexity: { time: 'O(26 · n)', space: 'O(n)', why: '每個字母 a 和其他 25 組比交集,總共每個後綴被看約 26 次。' },
      verdict: '最推薦。把「n² 對名字」降成「26² 對組」,是「依某個屬性分組再數」的典型招式。',
      code: {
        python: `def distinctNames(ideas):
    groups = [set() for _ in range(26)]
    for w in ideas:
        groups[ord(w[0]) - 97].add(w[1:])     # 首字母 → 後綴集合
    ans = 0
    for a in range(26):
        for b in range(a + 1, 26):
            common = len(groups[a] & groups[b])   # 換過去會撞名的後綴
            ans += 2 * (len(groups[a]) - common) * (len(groups[b]) - common)
    return ans`,
        c: `// 每個後綴配一個 26 位元的遮罩:第 c 位 = 「c + 後綴」在清單裡
typedef struct { char *key; int mask; UT_hash_handle hh; } Entry;

long long distinctNames(char **ideas, int ideasSize) {
    Entry *tab = NULL, *e, *tmp;
    for (int i = 0; i < ideasSize; i++) {
        char *suf = ideas[i] + 1;
        HASH_FIND_STR(tab, suf, e);
        if (!e) { e = malloc(sizeof(Entry)); e->key = suf; e->mask = 0; HASH_ADD_KEYPTR(hh, tab, e->key, strlen(e->key), e); }
        e->mask |= 1 << (ideas[i][0] - 'a');
    }
    long long cnt[26] = {0}, common[26][26] = {{0}};
    HASH_ITER(hh, tab, e, tmp) {
        for (int a = 0; a < 26; a++) {
            if (!(e->mask >> a & 1)) continue;
            cnt[a]++;
            for (int b = 0; b < 26; b++) if (e->mask >> b & 1) common[a][b]++;
        }
    }
    long long ans = 0;
    for (int a = 0; a < 26; a++)
        for (int b = a + 1; b < 26; b++)
            ans += 2 * (cnt[a] - common[a][b]) * (cnt[b] - common[a][b]);
    HASH_ITER(hh, tab, e, tmp) { HASH_DEL(tab, e); free(e); }
    return ans;
}`,
        cpp: `long long distinctNames(vector<string>& ideas) {
    vector<unordered_set<string>> groups(26);
    for (auto &w : ideas) groups[w[0] - 'a'].insert(w.substr(1));
    long long ans = 0;
    for (int a = 0; a < 26; a++)
        for (int b = a + 1; b < 26; b++) {
            long long common = 0;
            for (auto &s : groups[a]) common += groups[b].count(s);
            ans += 2 * ((long long)groups[a].size() - common) * ((long long)groups[b].size() - common);
        }
    return ans;
}`,
        java: `long distinctNames(String[] ideas) {
    List<Set<String>> groups = new ArrayList<>();
    for (int i = 0; i < 26; i++) groups.add(new HashSet<>());
    for (String w : ideas) groups.get(w.charAt(0) - 'a').add(w.substring(1));
    long ans = 0;
    for (int a = 0; a < 26; a++)
        for (int b = a + 1; b < 26; b++) {
            long common = 0;
            for (String s : groups.get(a)) if (groups.get(b).contains(s)) common++;
            ans += 2 * (groups.get(a).size() - common) * (groups.get(b).size() - common);
        }
    return ans;
}`,
        javascript: `function distinctNames(ideas) {
  const groups = Array.from({ length: 26 }, () => new Set());
  for (const w of ideas) groups[w.charCodeAt(0) - 97].add(w.slice(1));
  let ans = 0;
  for (let a = 0; a < 26; a++)
    for (let b = a + 1; b < 26; b++) {
      let common = 0;
      for (const s of groups[a]) if (groups[b].has(s)) common++;
      ans += 2 * (groups[a].size - common) * (groups[b].size - common);
    }
  return ans;
}`,
      },
    },
    {
      name: '暴力兩兩交換',
      idea: '每對 (i, j) 交換首字母,兩個新名字都不在集合裡就計數。',
      steps: ['`s = set(ideas)`', '`for i, j`(i ≠ j):`x = b[0] + a[1:]`、`y = a[0] + b[1:]`', '`x not in s and y not in s` → `ans += 1`'],
      figure: { title: `ideas = [${IDEAS.join(', ')}]`, steps: bruteFig() },
      complexity: { time: 'O(n² · L)', space: 'O(n · L)', why: 'n² 對,每對建兩個字串。' },
      verdict: '直接照題意,拿來確認分組公式。n 大時跑不完。',
      code: {
        python: `def distinctNames(ideas):
    s = set(ideas)
    ans = 0
    for a in ideas:
        for b in ideas:
            if a[0] != b[0] and b[0] + a[1:] not in s and a[0] + b[1:] not in s:
                ans += 1                      # (a, b) 和 (b, a) 會各算一次
    return ans`,
        c: `static int cmpS(const void *a, const void *b) { return strcmp(*(char **)a, *(char **)b); }

static bool has(char **sorted, int n, char *w) {
    return bsearch(&w, sorted, n, sizeof(char *), cmpS) != NULL;
}

long long distinctNames(char **ideas, int ideasSize) {
    char **sorted = malloc(ideasSize * sizeof(char *));
    memcpy(sorted, ideas, ideasSize * sizeof(char *));
    qsort(sorted, ideasSize, sizeof(char *), cmpS);
    long long ans = 0;
    char x[16], y[16];
    for (int i = 0; i < ideasSize; i++)
        for (int j = 0; j < ideasSize; j++) {
            if (ideas[i][0] == ideas[j][0]) continue;
            strcpy(x, ideas[i]); x[0] = ideas[j][0];
            strcpy(y, ideas[j]); y[0] = ideas[i][0];
            if (!has(sorted, ideasSize, x) && !has(sorted, ideasSize, y)) ans++;
        }
    free(sorted);
    return ans;
}`,
        cpp: `long long distinctNames(vector<string>& ideas) {
    unordered_set<string> s(ideas.begin(), ideas.end());
    long long ans = 0;
    for (auto &a : ideas)
        for (auto &b : ideas) {
            if (a[0] == b[0]) continue;
            string x = b[0] + a.substr(1), y = a[0] + b.substr(1);
            if (!s.count(x) && !s.count(y)) ans++;
        }
    return ans;
}`,
        java: `long distinctNames(String[] ideas) {
    Set<String> s = new HashSet<>(Arrays.asList(ideas));
    long ans = 0;
    for (String a : ideas)
        for (String b : ideas) {
            if (a.charAt(0) == b.charAt(0)) continue;
            if (!s.contains(b.charAt(0) + a.substring(1)) && !s.contains(a.charAt(0) + b.substring(1))) ans++;
        }
    return ans;
}`,
        javascript: `function distinctNames(ideas) {
  const s = new Set(ideas);
  let ans = 0;
  for (const a of ideas)
    for (const b of ideas)
      if (a[0] !== b[0] && !s.has(b[0] + a.slice(1)) && !s.has(a[0] + b.slice(1))) ans++;
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['忘了 ×2:("coffee", "donuts") 和 ("donuts", "coffee") 產生的名稱不同', '答案超過 int:最多約 (5·10⁴)² = 2.5·10⁹', '同組也拿來配:同首字母交換等於沒換,一定撞名'],
  check: {
    kind: 'fn',
    fn: 'distinctNames',
    cases: [
      { args: [IDEAS], out: 6 },
      { args: [['lack', 'back']], out: 0 },
      { args: [['aaa', 'baa', 'caa', 'bbb', 'cbb', 'dbb']], out: 2 },
      { args: [['ab', 'cd']], out: 2 },
    ],
  },
}
