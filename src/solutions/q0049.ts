import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { count26, idx, kv } from './fig'

// 49. Group Anagrams

const STRS = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat']

function groupFig(keyOf: (w: string) => string, keyName: string): FigStep[] {
  const groups = new Map<string, string[]>()
  const view = (hl: string[] = []) => kv([...groups].map(([k, ws]) => [k, ws.join(', ')]), `groups(${keyName} → 這組的字串)`, hl)
  const out: FigStep[] = [{ note: '準備一個 Hash Map:同一組異位詞會算出同一個 key,就丟進同一個桶', views: [arr(STRS, { label: 'strs' }), view()] }]
  STRS.forEach((w, i) => {
    const k = keyOf(w)
    const isNew = !groups.has(k)
    if (isNew) groups.set(k, [])
    groups.get(k)!.push(w)
    out.push({
      note: `"${w}" 的 key 是 ${k}${isNew ? ',還沒有這個桶 → 開新的一組' : `,已經有這個桶 → 放進去和 ${groups.get(k)!.slice(0, -1).join('、')} 同一組`}`,
      views: [arr(STRS, { label: 'strs', highlight: [i], dim: range(0, i - 1) }), view([k])],
    })
  })
  out.push({ note: `走完了,map 的每個 value 就是一組答案:共 ${groups.size} 組`, views: [view()] })
  return out
}

function countKeyFig(): FigStep[] {
  const steps = groupFig(countKey, '計數 key')
  // 在第一個字前面插入一步,示範 26 格計數怎麼變成 key
  const cnt = Array(26).fill(0)
  for (const ch of 'eat') cnt[idx(ch)]++
  steps.splice(1, 0, {
    note: '怎麼算 key:數 "eat" 每個字母出現幾次 → a=1, e=1, t=1。把 26 格的次數串起來就是 key(下圖只寫出非 0 的格子:a1e1t1)',
    views: [count26(cnt, '"eat" 的 26 格計數', [idx('a'), idx('e'), idx('t')])],
  })
  return steps
}

/** 圖示用的簡寫:只列出非 0 的字母和次數 */
function countKey(w: string): string {
  const cnt = Array(26).fill(0)
  for (const ch of w) cnt[idx(ch)]++
  return cnt.map((c, i) => (c ? `${String.fromCharCode(97 + i)}${c}` : '')).join('')
}

export const q0049: Solution = {
  id: 49,
  statement: '給一個字串陣列 `strs`,把**互為字母異位詞**的字串分到同一組(用的字母和次數完全相同,只是順序不同)。回傳所有組,組的順序、組內的順序都不限。',
  examples: [
    { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
    { input: 'strs = [""]', output: '[[""]]', note: '空字串自己一組' },
    { input: 'strs = ["a"]', output: '[["a"]]' },
  ],
  constraints: [
    '`1 ≤ strs.length ≤ 10⁴`,`0 ≤ strs[i].length ≤ 100` → 兩兩比較是 n² = 10⁸ 次比較,每次還要比字串,太慢',
    '只有小寫字母 → 可以用 26 格計數當「指紋」',
    '字串可能是空的 → key 也要能表示「什麼都沒有」',
  ],
  insight: [
    '先會 [242. Valid Anagram](#/q/242):判斷兩個字串是不是異位詞,用排序或 26 格計數',
    '暴力分組:每個字串去和每一組的代表比 → O(n² · k),太慢',
    '關鍵轉念:與其「兩兩比較」,不如幫每個字串算一個**標準形式(key)**,讓同一組的字串 key 完全相同、不同組 key 一定不同。然後用 Hash Map 以 key 分桶,一次遍歷搞定',
    '標準形式有兩種選法:**排序後的字串**(`"eat"` → `"aet"`),或 **26 格計數**(`a1 e1 t1`)',
  ],
  approaches: [
    {
      name: '排序後的字串當 key',
      idea: '異位詞排序後完全一樣,所以 `sorted(s)` 就是天然的分組 key。',
      steps: ['`groups = {}`(key → 字串清單)', '對每個字串 `s`:`key = 把 s 的字母排序`', '`groups[key].append(s)`', '回傳 `groups` 所有的 value'],
      figure: { title: 'strs = ["eat","tea","tan","ate","nat","bat"]', steps: groupFig((w) => [...w].sort().join(''), '排序後的字串') },
      complexity: { time: 'O(n · k log k)', space: 'O(n · k)', why: 'n 個字串、每個長度最多 k,各排序一次 O(k log k)。map 要存所有字串和 key,總共 O(n·k)。' },
      verdict: '最好寫,面試首選。k 最多 100,log k 很小,實際上和計數法差不多快。',
      code: {
        python: `from collections import defaultdict

def groupAnagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))       # "eat" -> "aet"
        groups[key].append(s)
    return list(groups.values())`,
        c: `// C 沒有內建 Hash Map,這裡用 uthash(LeetCode 環境內建),字串當 key
typedef struct {
    char *key;              // 排序後的字串
    int *idx, cnt, cap;     // 這組有哪些字串(在 strs 的索引)
    UT_hash_handle hh;
} Group;

int cmpChar(const void *a, const void *b) {
    return *(const char *)a - *(const char *)b;
}

char ***groupAnagrams(char **strs, int strsSize, int *returnSize, int **returnColumnSizes) {
    Group *groups = NULL, *g, *tmp;
    for (int i = 0; i < strsSize; i++) {
        char *key = strdup(strs[i]);
        qsort(key, strlen(key), sizeof(char), cmpChar);
        HASH_FIND_STR(groups, key, g);
        if (!g) {
            g = malloc(sizeof(Group));
            g->key = key; g->cnt = 0; g->cap = 4;
            g->idx = malloc(g->cap * sizeof(int));
            HASH_ADD_KEYPTR(hh, groups, g->key, strlen(g->key), g);
        } else {
            free(key);
        }
        if (g->cnt == g->cap) g->idx = realloc(g->idx, (g->cap *= 2) * sizeof(int));
        g->idx[g->cnt++] = i;
    }
    int n = HASH_COUNT(groups), k = 0;
    char ***res = malloc(n * sizeof(char **));
    *returnColumnSizes = malloc(n * sizeof(int));
    HASH_ITER(hh, groups, g, tmp) {
        res[k] = malloc(g->cnt * sizeof(char *));
        for (int j = 0; j < g->cnt; j++) res[k][j] = strs[g->idx[j]];
        (*returnColumnSizes)[k++] = g->cnt;
        HASH_DEL(groups, g);
        free(g->key); free(g->idx); free(g);
    }
    *returnSize = n;
    return res;
}`,
        cpp: `vector<vector<string>> groupAnagrams(vector<string>& strs) {
    unordered_map<string, vector<string>> groups;
    for (const string& s : strs) {
        string key = s;
        sort(key.begin(), key.end());   // "eat" -> "aet"
        groups[key].push_back(s);
    }
    vector<vector<string>> res;
    for (auto& [key, g] : groups) res.push_back(move(g));
    return res;
}`,
        java: `List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> groups = new HashMap<>();
    for (String s : strs) {
        char[] c = s.toCharArray();
        Arrays.sort(c);
        String key = new String(c);     // "eat" -> "aet"
        groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
    }
    return new ArrayList<>(groups.values());
}`,
        javascript: `function groupAnagrams(strs) {
  const groups = new Map();
  for (const s of strs) {
    const key = [...s].sort().join('');   // "eat" -> "aet"
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.values()];
}`,
      },
    },
    {
      name: '26 格計數當 key',
      idea: '數每個字母出現幾次,26 個次數本身就是異位詞的「指紋」,不用排序。',
      steps: ['對每個字串 `s`:`count = [0] * 26`,數每個字母', '把 `count` 變成可以當 key 的形式(Python 用 tuple、其他語言串成字串)', '`groups[key].append(s)`', '回傳所有 value'],
      figure: { title: 'strs = ["eat","tea","tan","ate","nat","bat"](key 只寫出非 0 的字母)', steps: countKeyFig() },
      complexity: { time: 'O(n · k)', space: 'O(n · k)', why: '每個字串數一次字母 O(k),再花 O(26) 組 key。比排序少一個 log k。' },
      verdict: '理論上更快,也是面試官追問「能不能不排序」時的答案。key 的組法要小心:次數之間要有分隔符號,不然 `[1,11]` 和 `[11,1]` 會撞在一起。',
      code: {
        python: `from collections import defaultdict

def groupAnagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        count = [0] * 26
        for c in s:
            count[ord(c) - ord('a')] += 1
        groups[tuple(count)].append(s)   # list 不能當 key,要轉成 tuple
    return list(groups.values())`,
        c: `// key 是 26 個次數用 # 串起來的字串,例如 "#1#0#0#0#1..."
typedef struct {
    char *key;
    int *idx, cnt, cap;
    UT_hash_handle hh;
} Group;

char ***groupAnagrams(char **strs, int strsSize, int *returnSize, int **returnColumnSizes) {
    Group *groups = NULL, *g, *tmp;
    for (int i = 0; i < strsSize; i++) {
        int count[26] = {0};
        for (char *p = strs[i]; *p; p++) count[*p - 'a']++;
        char *key = malloc(26 * 4 + 1), *w = key;   // 每格最多 "#100"
        for (int c = 0; c < 26; c++) w += sprintf(w, "#%d", count[c]);
        HASH_FIND_STR(groups, key, g);
        if (!g) {
            g = malloc(sizeof(Group));
            g->key = key; g->cnt = 0; g->cap = 4;
            g->idx = malloc(g->cap * sizeof(int));
            HASH_ADD_KEYPTR(hh, groups, g->key, strlen(g->key), g);
        } else {
            free(key);
        }
        if (g->cnt == g->cap) g->idx = realloc(g->idx, (g->cap *= 2) * sizeof(int));
        g->idx[g->cnt++] = i;
    }
    int n = HASH_COUNT(groups), k = 0;
    char ***res = malloc(n * sizeof(char **));
    *returnColumnSizes = malloc(n * sizeof(int));
    HASH_ITER(hh, groups, g, tmp) {
        res[k] = malloc(g->cnt * sizeof(char *));
        for (int j = 0; j < g->cnt; j++) res[k][j] = strs[g->idx[j]];
        (*returnColumnSizes)[k++] = g->cnt;
        HASH_DEL(groups, g);
        free(g->key); free(g->idx); free(g);
    }
    *returnSize = n;
    return res;
}`,
        cpp: `vector<vector<string>> groupAnagrams(vector<string>& strs) {
    unordered_map<string, vector<string>> groups;
    for (const string& s : strs) {
        string key(26, '\\0');           // 每一格是一個字母的次數(長度 ≤ 100,char 放得下)
        for (char c : s) key[c - 'a']++;
        groups[key].push_back(s);
    }
    vector<vector<string>> res;
    for (auto& [key, g] : groups) res.push_back(move(g));
    return res;
}`,
        java: `List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> groups = new HashMap<>();
    for (String s : strs) {
        int[] count = new int[26];
        for (char c : s.toCharArray()) count[c - 'a']++;
        String key = Arrays.toString(count);   // "[1, 0, 0, 0, 1, ...]",有逗號分隔不會撞
        groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
    }
    return new ArrayList<>(groups.values());
}`,
        javascript: `function groupAnagrams(strs) {
  const groups = new Map();
  for (const s of strs) {
    const count = new Array(26).fill(0);
    for (let i = 0; i < s.length; i++) count[s.charCodeAt(i) - 97]++;
    const key = count.join('#');           // 一定要有分隔符號
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.values()];
}`,
      },
    },
  ],
  pitfalls: [
    'Python 的 `list` 不能當 dict 的 key(可變的東西不能 hash),要轉成 `tuple`',
    '計數 key 沒有分隔符號:`count.join("")` 會讓「a 出現 1 次、b 出現 11 次」和「a 出現 11 次、b 出現 1 次」都變成 `"111..."`',
    '空字串 `""` 也要分組:排序後還是 `""`,計數全 0,兩種 key 都能正確處理',
    'JavaScript 用物件 `{}` 當 map 也行,但 key 會被轉成字串、還可能撞到 `__proto__` 這類內建屬性,用 `Map` 比較安全',
  ],
  followUp: [
    { q: '有沒有 O(n·k) 又不用組字串的 key?', a: '可以把 26 個字母對應到 26 個質數,key = 所有字母質數的乘積(算術基本定理保證唯一)。但長字串的乘積會溢位,實務上不如計數 key。' },
    { q: '相關的題目?', a: '[242. Valid Anagram](#/q/242) 是這題的前置;438. Find All Anagrams in a String 把 26 格計數放進[[p:sliding-window]]。' },
  ],
  check: {
    kind: 'fn',
    fn: 'groupAnagrams',
    compare: 'groups',
    cases: [
      { args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], out: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']] },
      { args: [['']], out: [['']] },
      { args: [['a']], out: [['a']] },
      { args: [['b', 'bbbbbbbbbbbba', 'abbbbbbbbbbbb', 'ab']], out: [['b'], ['bbbbbbbbbbbba', 'abbbbbbbbbbbb'], ['ab']] },
      { args: [['', 'b', '']], out: [['', ''], ['b']] },
    ],
  },
}
