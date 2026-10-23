import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 179. Largest Number

const A = [3, 30, 34, 5, 9]

function cmpFig(): FigStep[] {
  return [
    { note: '要把數字接起來變最大。直覺「字典序大的放前面」不完全對:3 和 30 → "330" 比 "303" 大,但 "30" 的字典序比 "3" 大', views: [arr(A.map(String), { label: 'nums' })] },
    { note: '正確的比較:a 要排在 b 前面 ⇔ `a + b > b + a`(字串接起來比)。"3" + "30" = "330" > "303" → 3 在前', views: [arr(['330', '303'], { label: '"3"+"30" vs "30"+"3"', highlight: [0] })] },
    { note: '用這個規則排序:9、5、34、3、30。這個比較有遞移性,所以可以拿來排序', views: [arr(['9', '5', '34', '3', '30'], { label: '排序後', done: [0, 1, 2, 3, 4] })] },
    { note: '接起來 "9534330"。特例:全是 0 時要回傳 "0" 而不是 "000"', views: [arr(['9534330'], { label: '答案', done: [0] })] },
  ]
}

function keyFig(): FigStep[] {
  return [
    { note: '另一個角度:比較 a、b 等於比較「a 無限重複」和「b 無限重複」的字典序。只要看前 len(a) + len(b) 個字元就分得出來', views: [arr(['333333…', '303030…'], { label: '3 vs 30', highlight: [0] })] },
    { note: '數字最多 10 位 → 把每個數重複到長度 20 當作排序的 key,用一般的字串排序(由大到小)即可', views: [arr(['99999…', '55555…', '34343…', '33333…', '30303…'], { label: 'key 由大到小' })] },
  ]
}

export const q0179: Solution = {
  id: 179,
  plain: '給一堆非負整數,把它們頭尾接起來組成一個大數字(順序自己決定)。怎麼排會最大?用字串回傳。',
  statement: '給非負整數陣列 `nums`,重新排列每個數的順序(數本身不拆開)使其串接成最大的整數,以字串形式回傳。',
  examples: [
    { input: 'nums = [10,2]', output: '"210"' },
    { input: 'nums = [3,30,34,5,9]', output: '"9534330"' },
  ],
  constraints: ['n ≤ 100,0 ≤ nums[i] ≤ 10⁹'],
  insight: ['相鄰交換的觀點:a 在 b 前面更好 ⇔ a + b > b + a', '這個比較具有遞移性 → 可以直接當排序規則([[p:greedy]])', '全 0 的特例'],
  approaches: [
    {
      name: '自訂比較排序',
      idea: '轉成字串,用 `a + b > b + a` 決定 a 在前;串接;開頭是 "0" 就回傳 "0"。',
      steps: ['`s = list(map(str, nums))`', '排序規則:`a + b > b + a` → a 在前', '`res = "".join(s)`', '`res[0] == "0"` → 回傳 "0"'],
      figure: { title: `nums = [${A}]`, steps: cmpFig() },
      complexity: { time: 'O(n log n · L)', space: 'O(n · L)', why: 'L ≤ 10 是位數;每次比較 O(L)。' },
      verdict: '最推薦,面試標準解;重點是說得出比較規則為什麼對。',
      code: {
        python: `from functools import cmp_to_key

def largestNumber(nums):
    s = list(map(str, nums))
    s.sort(key=cmp_to_key(lambda a, b: -1 if a + b > b + a else (1 if a + b < b + a else 0)))
    res = ''.join(s)
    return '0' if res[0] == '0' else res      # 全是 0`,
        c: `static int cmp(const void *x, const void *y) {
    char ab[24], ba[24];
    const char *a = *(const char **)x, *b = *(const char **)y;
    sprintf(ab, "%s%s", a, b);
    sprintf(ba, "%s%s", b, a);
    return strcmp(ba, ab);                     // ab 較大時 a 排前面
}

char *largestNumber(int *nums, int numsSize) {
    char **s = malloc(numsSize * sizeof(char *));
    for (int i = 0; i < numsSize; i++) { s[i] = malloc(12); sprintf(s[i], "%d", nums[i]); }
    qsort(s, numsSize, sizeof(char *), cmp);
    char *res = malloc(numsSize * 11 + 1);
    res[0] = '\\0';
    if (s[0][0] == '0') strcpy(res, "0");
    else for (int i = 0; i < numsSize; i++) strcat(res, s[i]);
    for (int i = 0; i < numsSize; i++) free(s[i]);
    free(s);
    return res;
}`,
        cpp: `string largestNumber(vector<int>& nums) {
    vector<string> s;
    for (int x : nums) s.push_back(to_string(x));
    sort(s.begin(), s.end(), [](const string &a, const string &b) { return a + b > b + a; });
    if (s[0] == "0") return "0";
    string res;
    for (auto &t : s) res += t;
    return res;
}`,
        java: `String largestNumber(int[] nums) {
    String[] s = new String[nums.length];
    for (int i = 0; i < nums.length; i++) s[i] = String.valueOf(nums[i]);
    Arrays.sort(s, (a, b) -> (b + a).compareTo(a + b));
    if (s[0].equals("0")) return "0";
    return String.join("", s);
}`,
        javascript: `function largestNumber(nums) {
  const s = nums.map(String).sort((a, b) => (b + a).localeCompare(a + b));
  return s[0] === '0' ? '0' : s.join('');
}`,
      },
    },
    {
      name: '重複到固定長度當 key',
      idea: '每個數字串重複到長度 20 作為 key,依 key 由大到小排序,再串接。',
      steps: ['`key(s) = (s * 20)[:20]`', '`s.sort(key=key, reverse=True)`', '串接、處理全 0'],
      figure: { title: `nums = [${A}]`, steps: keyFig() },
      complexity: { time: 'O(n log n · L)', space: 'O(n · L)', why: '每個 key 長 20;排序時直接比字串。' },
      verdict: '不需要自訂比較函式,在只支援 key 排序的語言裡很方便。',
      code: {
        python: `def largestNumber(nums):
    s = list(map(str, nums))
    s.sort(key=lambda t: (t * 20)[:20], reverse=True)   # 無限重複的前 20 個字元
    res = ''.join(s)
    return '0' if res[0] == '0' else res`,
        c: `typedef struct { char key[21], s[12]; } Item;

static int cmpKey(const void *x, const void *y) { return strcmp(((Item *)y)->key, ((Item *)x)->key); }

char *largestNumber(int *nums, int numsSize) {
    Item *it = malloc(numsSize * sizeof(Item));
    for (int i = 0; i < numsSize; i++) {
        sprintf(it[i].s, "%d", nums[i]);
        int L = strlen(it[i].s);
        for (int k = 0; k < 20; k++) it[i].key[k] = it[i].s[k % L];
        it[i].key[20] = '\\0';
    }
    qsort(it, numsSize, sizeof(Item), cmpKey);
    char *res = malloc(numsSize * 11 + 1);
    res[0] = '\\0';
    if (it[0].s[0] == '0') strcpy(res, "0");
    else for (int i = 0; i < numsSize; i++) strcat(res, it[i].s);
    free(it);
    return res;
}`,
        cpp: `string largestNumber(vector<int>& nums) {
    vector<pair<string, string>> v;
    for (int x : nums) {
        string s = to_string(x), key;
        while (key.size() < 20) key += s;
        v.push_back({key.substr(0, 20), s});
    }
    sort(v.begin(), v.end(), [](auto &a, auto &b) { return a.first > b.first; });
    if (v[0].second == "0") return "0";
    string res;
    for (auto &p : v) res += p.second;
    return res;
}`,
        java: `String largestNumber(int[] nums) {
    String[] s = new String[nums.length];
    for (int i = 0; i < nums.length; i++) s[i] = String.valueOf(nums[i]);
    Arrays.sort(s, (a, b) -> key(b).compareTo(key(a)));
    if (s[0].equals("0")) return "0";
    return String.join("", s);
}

String key(String t) {
    StringBuilder k = new StringBuilder();
    while (k.length() < 20) k.append(t);
    return k.substring(0, 20);
}`,
        javascript: `function largestNumber(nums) {
  const key = (t) => t.repeat(20).slice(0, 20);
  const s = nums.map(String).sort((a, b) => (key(b) > key(a) ? 1 : key(b) < key(a) ? -1 : 0));
  return s[0] === '0' ? '0' : s.join('');
}`,
      },
    },
  ],
  pitfalls: ['直接按字典序或數值排序:3 和 30 的順序會錯', '全是 0 時回傳 "000"', '用 `a + b` 的數值比較:可能超過 64 位元,要比字串'],
  check: {
    kind: 'fn',
    fn: 'largestNumber',
    cases: [
      { args: [[10, 2]], out: '210' },
      { args: [A], out: '9534330' },
      { args: [[0, 0]], out: '0' },
      { args: [[1]], out: '1' },
      { args: [[824, 938, 1399, 5607, 6973, 5703, 9609, 4398, 8247]], out: '9609938824824769735703560743981399' },
      { args: [[1000000000, 999999999]], out: '9999999991000000000' },
    ],
  },
}
