import type { Concept } from './types'

// 單元四:各語言工具箱 —— C 的函式簽名與記憶體、C++ STL、五種語言的容器與 API 對照。

const cLang: Concept = {
  id: 'c-lang',
  name: '用 C 寫 LeetCode',
  level: 2,
  prereq: ['pointers'],
  lead:
    'C 沒有內建的動態陣列、Hash 表和字串型別,LeetCode 的 C 函式簽名也是五種語言裡最複雜的:陣列要另外傳長度、回傳陣列要自己 `malloc`、' +
    '二維陣列還要回報每一列的長度。這章把規則一次講清楚,再補上排序、Hash 表、堆疊佇列在 C 裡的做法。',
  sections: [
    {
      title: '讀懂函式簽名',
      blocks: [
        {
          t: 'table',
          cols: ['參數', '意思', '你要做什麼'],
          rows: [
            ['`int* nums, int numsSize`', '陣列 + 它的長度', '用 `numsSize` 當迴圈上限(陣列本身不知道自己多長)'],
            ['`int** grid, int gridSize, int* gridColSize`', '二維陣列:`gridSize` 列,第 i 列有 `gridColSize[i]` 個', '通常每列一樣長,用 `gridColSize[0]`'],
            ['`char* s`', '以 `\\0` 結尾的字串', '長度用 `strlen(s)` 算一次存起來'],
            ['`int* returnSize`', '回傳陣列的長度要寫在這裡', '`*returnSize = 長度;`(忘了寫,判題機會讀到 0 或垃圾值)'],
            ['`int** returnColumnSizes`', '回傳二維陣列時,每一列的長度', '`malloc` 一個長度陣列,把它的位址寫進 `*returnColumnSizes`'],
            ['`struct ListNode* head`', '串列的頭(可能是 `NULL`)', '回傳新的頭'],
          ],
          note: 'LeetCode 的 C 環境已經引入常用標頭(`stdio.h`、`stdlib.h`、`string.h`、`stdbool.h`、`limits.h` 等),也內建 uthash,不用自己 `#include`。',
        },
      ],
    },
    {
      title: '回傳一維陣列',
      blocks: [
        {
          t: 'code',
          title: 'Two Sum:回傳兩個索引',
          code: {
            c: `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    int *ans = malloc(2 * sizeof(int));   // 回傳的陣列一定要 malloc:區域陣列在函式結束後就失效
    for (int i = 0; i < numsSize; i++)
        for (int j = i + 1; j < numsSize; j++)
            if (nums[i] + nums[j] == target) {
                ans[0] = i;
                ans[1] = j;
                *returnSize = 2;          // 告訴判題機回傳陣列有幾個元素
                return ans;
            }
    *returnSize = 0;                      // 找不到:長度 0
    return ans;
}`,
          },
        },
        {
          t: 'note',
          kind: 'warn',
          title: '不能回傳區域陣列',
          text: '`int ans[2]; ... return ans;` 編譯也許會過,但 `ans` 在堆疊上,函式一回傳那塊記憶體就可能被覆蓋,判題機讀到的是垃圾。回傳的東西一律用 `malloc`。',
        },
        {
          t: 'p',
          text: '不知道最後會有幾個元素時,可以先配「最多可能的大小」,或用 `realloc` 每次滿了就擴成兩倍(和動態陣列的原理一樣):',
        },
        {
          t: 'code',
          title: '自己做一個動態陣列',
          code: {
            c: `int cap = 16, len = 0;
int *arr = malloc(cap * sizeof(int));

// push x
if (len == cap) {
    cap *= 2;
    arr = realloc(arr, cap * sizeof(int));   // 擴容:攤銷 O(1)
}
arr[len++] = x;

*returnSize = len;
return arr;`,
          },
        },
      ],
    },
    {
      title: '回傳二維陣列:returnColumnSizes',
      blocks: [
        {
          t: 'p',
          text: '二維的回傳值是「一排指標,每個指向一列」。因為每列長度可能不同,判題機還需要一個陣列告訴它每列多長 —— 這就是 `returnColumnSizes`。它是 `int**`,因為你要**改掉呼叫端的一個 `int*`**(讓它指向你配的長度陣列),見 [[c:pointers]] 的「指標的指標」。',
        },
        {
          t: 'code',
          title: "Pascal's Triangle(118)",
          code: {
            c: `int** generate(int numRows, int* returnSize, int** returnColumnSizes) {
    int **res = malloc(numRows * sizeof(int *));          // 外層:numRows 個列指標
    *returnColumnSizes = malloc(numRows * sizeof(int));   // 每列長度的陣列
    for (int i = 0; i < numRows; i++) {
        res[i] = malloc((i + 1) * sizeof(int));           // 第 i 列有 i+1 個數
        (*returnColumnSizes)[i] = i + 1;                  // 括號不能省:先解參考,再取第 i 個
        res[i][0] = res[i][i] = 1;
        for (int j = 1; j < i; j++)
            res[i][j] = res[i - 1][j - 1] + res[i - 1][j];
    }
    *returnSize = numRows;
    return res;
}`,
          },
        },
        {
          t: 'list',
          items: [
            '`*returnColumnSizes[i]` 和 `(*returnColumnSizes)[i]` 不一樣:`[]` 優先順序比 `*` 高,沒括號會變成 `*(returnColumnSizes[i])`,存取錯位置。',
            '回溯題(子集、組合)在 C 裡最麻煩:答案個數事先不知道,通常先算出上限(例如子集最多 2ⁿ 個)一次配好。',
          ],
        },
      ],
    },
    {
      title: '記憶體配置',
      blocks: [
        {
          t: 'table',
          cols: ['函式', '做什麼', '注意'],
          rows: [
            ['`malloc(bytes)`', '配一塊記憶體,內容是垃圾值', '大小要乘 `sizeof(型別)`'],
            ['`calloc(n, size)`', '配 n 個元素並全部設 0', '要 0 初始化時最方便'],
            ['`realloc(p, bytes)`', '把 p 擴大(可能搬家)', '要用回傳值:`p = realloc(p, ...)`'],
            ['`free(p)`', '歸還記憶體', 'LeetCode 上不 free 通常也能過,但面試時要提'],
            ['`memset(p, v, bytes)`', '把每個 **byte** 設成 v', '只有 0 和 −1 對 `int` 有意義;`memset(a, 1, ...)` 得到的是 16843009'],
          ],
          note: '小陣列可以直接宣告在堆疊上(`int cnt[26] = {0};`);大陣列(例如 10⁶ 個)放堆疊可能溢位,改用 `malloc` 或宣告成全域。用全域變數時記得**每次呼叫都重設**,判題機會連續呼叫你的函式。',
        },
      ],
    },
    {
      title: '字串',
      blocks: [
        {
          t: 'code',
          title: '常用字串操作',
          code: {
            c: `int n = strlen(s);                 // O(n):算一次存起來,不要放在迴圈條件裡
if (strcmp(a, b) == 0) { ... }     // 比較內容;a == b 比的是位址
strcpy(dst, src);                  // 複製(dst 要夠大)
int x = atoi("123");               // 字串轉整數
sprintf(buf, "%d", x);             // 整數轉字串

// 回傳一個新字串:長度 n 要配 n + 1(最後放 '\\0')
char *res = malloc(n + 1);
for (int i = 0; i < n; i++) res[i] = s[n - 1 - i];   // 例如反轉
res[n] = '\\0';
return res;`,
          },
        },
      ],
    },
    {
      title: '排序:qsort',
      blocks: [
        {
          t: 'code',
          title: '排序整數陣列與二維陣列',
          code: {
            c: `// 一維:比較函式拿到的是「指向元素的指標」
int cmpInt(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);      // 不寫 x - y:-2³¹ 減正數會溢位
}
qsort(nums, numsSize, sizeof(int), cmpInt);

// 二維(例如區間 int** intervals):元素是 int*,所以參數是 int**
int cmpStart(const void *a, const void *b) {
    const int *x = *(const int **)a, *y = *(const int **)b;
    return (x[0] > y[0]) - (x[0] < y[0]);
}
qsort(intervals, intervalsSize, sizeof(int *), cmpStart);`,
          },
        },
      ],
    },
    {
      title: 'Hash 表:uthash 或陣列',
      blocks: [
        {
          t: 'p',
          text: 'C 沒有內建 Hash 表。三個選擇,依優先順序:**值域小就直接開陣列**(例如字母計數、值在 0~10⁵);**能排序就排序**後用雙指標或二分;真的需要 Hash 時用 LeetCode 內建的 **uthash**:',
        },
        {
          t: 'code',
          title: 'Two Sum 的 O(n) 版:uthash',
          code: {
            c: `typedef struct {
    int key;              // 數值
    int idx;              // 它的索引
    UT_hash_handle hh;    // 讓 uthash 把這些結構串起來(名字必須叫 hh)
} Entry;

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    Entry *map = NULL, *e;               // map 一定要初始化成 NULL
    int *ans = malloc(2 * sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < numsSize; i++) {
        int want = target - nums[i];
        HASH_FIND_INT(map, &want, e);    // 找 key == want 的項目,結果放進 e
        if (e) {
            ans[0] = e->idx; ans[1] = i; *returnSize = 2;
            break;
        }
        HASH_FIND_INT(map, &nums[i], e);
        if (!e) {
            e = malloc(sizeof(Entry));
            e->key = nums[i]; e->idx = i;
            HASH_ADD_INT(map, key, e);   // 第二個參數是「鍵的欄位名稱」
        }
    }
    Entry *cur, *tmp;
    HASH_ITER(hh, map, cur, tmp) { HASH_DEL(map, cur); free(cur); }   // 釋放
    return ans;
}`,
          },
        },
        {
          t: 'p',
          text: '字串當鍵用 `HASH_FIND_STR` / `HASH_ADD_STR`(鍵欄位是 `char` 陣列),其他型別用通用的 `HASH_FIND` / `HASH_ADD`。',
        },
      ],
    },
    {
      title: '堆疊與佇列:陣列 + 索引',
      blocks: [
        {
          t: 'code',
          title: '最簡單的堆疊與佇列',
          code: {
            c: `// 堆疊
int st[10000], top = 0;
st[top++] = x;          // push
int y = st[--top];      // pop
int peek = st[top - 1]; // 看頂端
bool empty = (top == 0);

// 佇列(BFS 用):head 出、tail 進
int q[10000], head = 0, tail = 0;
q[tail++] = x;          // 入列
int z = q[head++];      // 出列
bool qempty = (head == tail);`,
          },
        },
        {
          t: 'p',
          text: 'Heap(優先佇列)在 C 裡也要自己寫,見 [[c:lang-compare]] 的 heap 範例。',
        },
      ],
    },
  ],
  pitfalls: [
    '忘了設定 `*returnSize`,判題機以為你回傳了 0 個元素。',
    '回傳區域陣列(在堆疊上)而不是 `malloc` 出來的。',
    '`*returnColumnSizes[i]` 少了括號。',
    '`malloc` 沒乘 `sizeof`:`malloc(n)` 只有 n 個 byte,放不下 n 個 int。',
    '`memset(a, 1, sizeof(a))` 以為每個 int 變成 1。',
    '用全域陣列或 `static` 變數存狀態,沒有在每次呼叫時重設。',
    '比較函式 `return x - y` 溢位。',
  ],
  quiz: [
    {
      q: '函式簽名有 `int* returnSize`,回傳長度 3 的陣列時要寫?',
      options: ['`returnSize = 3;`', '`*returnSize = 3;`', '`return 3;`'],
      a: 1,
      why: '`returnSize` 是指向呼叫端變數的指標,要透過 `*` 寫進那個變數。`returnSize = 3` 只改了區域指標。',
    },
    {
      q: '為什麼回傳的陣列要用 `malloc`,不能用 `int ans[3];`?',
      options: ['`malloc` 比較快', '區域陣列在函式回傳後就失效', 'C 不允許回傳陣列'],
      a: 1,
      why: '區域陣列放在堆疊框裡,函式結束框就被回收。`malloc` 出來的在 heap 上,直到 `free` 都有效。',
    },
    {
      q: '`int a[5]; memset(a, 0, sizeof(a));` 和 `memset(a, -1, sizeof(a))` 分別讓每個元素變成?',
      options: ['0 和 −1', '0 和 255', '0 和不確定'],
      a: 0,
      why: '0 的每個 byte 是 0x00,−1 的每個 byte 是 0xFF,四個 byte 拼起來剛好還是 0 和 −1。其他值就不行了。',
    },
    {
      q: 'C 裡要統計小寫字母出現次數,最好的做法是?',
      options: ['uthash', '`int cnt[26]`', '排序後數'],
      a: 1,
      why: '值域只有 26 種,直接開陣列最快也最簡單。Hash 表留給值域大的情況。',
    },
  ],
  next: [],
}

const cppStl: Concept = {
  id: 'cpp-stl',
  name: 'C++ 與 STL',
  level: 2,
  prereq: ['pointers', 'classes'],
  lead:
    'C++ 寫題的優勢是 STL(標準樣板函式庫):動態陣列、Hash 表、紅黑樹、heap、各種演算法都內建,而且執行速度快。' +
    '這章是速查表:每個容器什麼時候用、操作的複雜度,以及 C++ 特有的幾個陷阱(無號的 `size()`、`map[]` 會插入、`priority_queue` 的比較方向)。',
  sections: [
    {
      title: '容器速查',
      blocks: [
        {
          t: 'table',
          cols: ['容器', '是什麼', '常用操作與複雜度'],
          rows: [
            ['`vector<T>`', '動態陣列', '`push_back` / `pop_back` 攤銷 O(1);`v[i]` O(1);`insert` / `erase` 中間 O(n)'],
            ['`string`', '可變字串', '`s += c` 攤銷 O(1);`substr(i, len)` O(len);`s.find(t)`'],
            ['`unordered_map<K,V>`', 'Hash 表', '`m[k]`、`count`、`find`、`erase` 平均 O(1)'],
            ['`unordered_set<T>`', 'Hash 集合', '`insert`、`count`、`erase` 平均 O(1)'],
            ['`map<K,V>` / `set<T>`', '紅黑樹(有序)', '所有操作 O(log n);依鍵排序走訪;`lower_bound` 找前驅後繼'],
            ['`multiset<T>`', '可重複的有序集合', '同上;`erase(ms.find(x))` 只刪一個'],
            ['`priority_queue<T>`', 'Heap,**預設最大堆積**', '`push` / `pop` O(log n);`top` O(1)'],
            ['`deque<T>`', '雙端佇列', '兩端 `push` / `pop` O(1);`dq[i]` O(1)'],
            ['`stack<T>` / `queue<T>`', '堆疊 / 佇列', '`push`、`pop`、`top` / `front` O(1);`pop` 不回傳值'],
            ['`pair<A,B>` / `tuple`', '一組值', '可以直接比較(先比 first 再比 second),可以放進 set / map / pq'],
          ],
        },
      ],
    },
    {
      title: '各容器怎麼操作',
      blocks: [
        {
          t: 'p',
          text: '每個容器都照同一個順序列:建立 → 加入 → 查詢 → 刪除 → 走訪 → 大小。查「在不在」有兩種寫法:`count(x)` 回傳 1 或 0;`find(x)` 回傳指向那個元素的**迭代器**(iterator,可以想成指標),找不到時等於 `end()`。只要知道在不在用 `count`;找到之後還要用那個元素,用 `find`。',
        },
        {
          t: 'code',
          title: 'vector:動態陣列',
          code: {
            cpp: `vector<int> v;                                  // 空的
vector<int> v2(n, 0);                           // n 個 0
vector<vector<int>> g(m, vector<int>(n, 0));    // m × n 的二維陣列
v.push_back(x);  v.pop_back();                  // 尾端加 / 刪,O(1)
v[i];  v.front();  v.back();                    // O(1);空的時候呼叫 front / back 是未定義行為
v.insert(v.begin() + i, x);                     // 在位置 i 插入,O(n)
v.erase(v.begin() + i);                         // 刪掉位置 i,O(n)
find(v.begin(), v.end(), x) != v.end();         // 線性找,O(n);常找就改用 unordered_set
for (int x : v) { ... }                         // 走訪
v.size();  v.empty();  v.clear();  v.assign(n, -1);   // 大小、是否為空、清空、重設成 n 個 -1`,
          },
        },
        {
          t: 'code',
          title: 'string:可變字串',
          code: {
            cpp: `string s = "abc";
string t(n, 'a');                               // n 個 'a'
s += 'd';  s += "ef";  s.push_back('g');  s.pop_back();
s[i];                                           // 第 i 個字元(char)
s.substr(i, len);                               // 從 i 起取 len 個,O(len);len 省略就取到結尾
s.find("bc");                                   // 第一次出現的位置;找不到回傳 string::npos
s.find("bc") != string::npos;                   // 「有沒有出現」的寫法
to_string(42);  stoi("42");  stoll("10000000000");   // 數字 ↔ 字串
s.size();  s.empty();`,
          },
        },
        {
          t: 'code',
          title: 'unordered_set:Hash 集合(去重、查在不在)',
          code: {
            cpp: `unordered_set<int> seen;
unordered_set<int> seen2(v.begin(), v.end());   // 從 vector 建,順便去重
seen.insert(x);                                 // 已經存在就什麼都不做,平均 O(1)
auto [it, added] = seen.insert(x);              // added == true 代表這次是新加入的
seen.count(x);                                  // 在就是 1,不在就是 0,平均 O(1)
seen.find(x) != seen.end();                     // 同上;find 回傳迭代器,*it 就是那個元素
seen.contains(x);                               // C++20 起才有,意思和 count 一樣
seen.erase(x);                                  // 回傳刪掉幾個(0 或 1);不存在也不會出錯
for (int x : seen) { ... }                      // 走訪順序不固定,不要依賴它
seen.size();  seen.empty();  seen.clear();
seen.reserve(n);                                // 先預留 n 個位置,減少 rehash(重新配置)`,
          },
        },
        {
          t: 'code',
          title: 'unordered_map:Hash 表(計數、對照)',
          code: {
            cpp: `unordered_map<string, int> m;
m["a"] = 1;                                     // 新增或覆蓋
m["b"]++;                                       // 不存在會先建立成 0,再加 1
m.insert({"c", 3});                             // 已經存在就不覆蓋
m.count("a");                                   // 只查不建立:1 或 0
auto it = m.find("a");                          // 查一次就拿到值,不必再查一次 m["a"]
if (it != m.end()) { it->first; it->second; }   // 鍵、值
m.erase("a");                                   // 用鍵刪除
for (auto& [k, val] : m) { ... }                // 走訪(順序不固定);要改值記得用 &
m.size();  m.empty();  m.clear();`,
          },
        },
        {
          t: 'code',
          title: 'set / map / multiset:有序(紅黑樹,全部 O(log n))',
          code: {
            cpp: `set<int> s = {5, 1, 9};
s.insert(x);  s.erase(x);  s.count(x);  s.find(x);   // 用法和 unordered_set 一樣,但是 O(log n)
*s.begin();  *s.rbegin();                       // 最小、最大
auto it = s.lower_bound(x);                     // 第一個 >= x;沒有就是 s.end()
auto jt = s.upper_bound(x);                     // 第一個 > x
// 要用成員函式 s.lower_bound(x);寫成 lower_bound(s.begin(), s.end(), x) 在 set 上是 O(n)
for (int x : s) { ... }                         // 由小到大走訪

map<int, int> mp;                               // 操作同 unordered_map,但依鍵由小到大走訪
mp.begin()->first;                              // 最小的鍵

multiset<int> ms = {3, 3, 5};                   // 可以重複
ms.erase(ms.find(3));                           // 只刪一個 3
ms.erase(3);                                    // 把所有 3 都刪掉`,
          },
        },
        {
          t: 'code',
          title: 'stack / queue / deque / priority_queue',
          code: {
            cpp: `stack<int> stk;   stk.push(x);  stk.top();  stk.pop();       // pop 不回傳值:先 top 再 pop
queue<int> q;     q.push(x);    q.front();  q.pop();
deque<int> dq;    dq.push_back(x);  dq.push_front(x);  dq.pop_back();  dq.pop_front();
                  dq.front();  dq.back();  dq[i];                     // 兩端都是 O(1)
priority_queue<int> pq;  pq.push(x);  pq.top();  pq.pop();            // 最大堆積,push / pop O(log n)
// 這四種都有 size()、empty();但不能走訪,也沒有 find:只能看頂端或兩端
// 空的時候呼叫 top / front / pop 是未定義行為,先檢查 empty()`,
          },
        },
      ],
    },
    {
      title: '最常用的寫法',
      blocks: [
        {
          t: 'code',
          title: 'Hash、排序、二分、heap、有序集合',
          code: {
            cpp: `// Hash 計數
unordered_map<int, int> cnt;
for (int x : nums) cnt[x]++;              // 不存在的鍵會自動建立成 0
if (cnt.count(k)) { ... }                 // 只查不建立:用 count 或 find
for (auto& [key, val] : cnt) { ... }      // C++17 結構化綁定

// 排序
sort(v.begin(), v.end());                 // 由小到大
sort(v.rbegin(), v.rend());               // 由大到小
sort(v.begin(), v.end(), [](int a, int b) { return abs(a) < abs(b); });

// 二分(v 已排序)
int i = lower_bound(v.begin(), v.end(), x) - v.begin();   // 第一個 >= x 的位置
int j = upper_bound(v.begin(), v.end(), x) - v.begin();   // 第一個 > x 的位置
int count_x = j - i;

// Heap
priority_queue<int> maxh;                                  // 最大堆積
priority_queue<int, vector<int>, greater<int>> minh;       // 最小堆積
priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;   // (距離, 節點) 最小的先出:Dijkstra
pq.push({0, src});
auto [d, u] = pq.top(); pq.pop();

// 有序集合:找前驅與後繼
set<int> s = {1, 4, 9};
auto it = s.lower_bound(5);               // 指向 9(第一個 >= 5)
int pred = it != s.begin() ? *prev(it) : -1;   // 4(< 5 的最大值;沒有就 -1)
int mn = *s.begin(), mx = *s.rbegin();

// 其他
reverse(v.begin(), v.end());
int big = *max_element(v.begin(), v.end());
long long sum = accumulate(v.begin(), v.end(), 0LL);   // 0LL:用 long long 累加
iota(idx.begin(), idx.end(), 0);          // 0, 1, 2, ...
swap(a, b);`,
          },
        },
      ],
    },
    {
      title: 'priority_queue 的比較方向',
      blocks: [
        {
          t: 'p',
          text: '`priority_queue` 的比較函式意思是「a 的優先度比 b **低**」,`top()` 是「最不低」的那個。所以預設的 `less`(a < b)產生**最大**堆積,傳 `greater` 反而是**最小**堆積 —— 和 `sort` 的直覺相反。自訂規則時,記得「回傳 true 代表 a 會排在 b 後面出來」:',
        },
        {
          t: 'code',
          title: '自訂優先度:second 小的先出',
          code: {
            cpp: `auto cmp = [](const pair<int,int>& a, const pair<int,int>& b) {
    return a.second > b.second;   // a.second 比較大 → a 優先度比較低 → second 小的先出
};
priority_queue<pair<int,int>, vector<pair<int,int>>, decltype(cmp)> pq(cmp);`,
          },
        },
      ],
    },
    {
      title: 'C++ 特有的陷阱',
      blocks: [
        {
          t: 'table',
          cols: ['陷阱', '例子', '修正'],
          rows: [
            ['`size()` 是無號整數', '`for (int i = 0; i < v.size() - 1; i++)`:v 空的時候 `0 - 1` 變成超大的數', '先存 `int n = v.size();` 再運算'],
            ['`m[k]` 會插入', '`if (m[k] > 0)` 查詢時順手把 k 加進 map,走訪時多出一堆 0', '查存在用 `count` / `find`'],
            ['傳值複製', '`void dfs(vector<int> path)` 每層都複製一份', '`vector<int>& path`,唯讀加 `const`'],
            ['range-for 複製', '`for (auto x : grid)` 每次複製一整列', '`for (auto& row : grid)`'],
            ['`int` 溢位', '`accumulate(..., 0)`、`a * b`', '`0LL`、`1LL * a * b`,見 [[c:integers]]'],
            ['走訪時刪除', '`for (auto it = m.begin(); ...) m.erase(it);` 迭代器失效', '`it = m.erase(it);`'],
            ['`multiset.erase(x)` 刪光', '想刪一個 x,結果全部刪掉', '`ms.erase(ms.find(x))`'],
            ['`unordered_map` 鍵是 pair', '編譯錯誤:沒有預設的 hash', '用 `map`,或把兩個數壓成一個 `long long`'],
          ],
        },
      ],
    },
    {
      title: '指標與節點',
      blocks: [
        {
          t: 'p',
          text: '串列和樹的題目全部用指標:`ListNode*`、`TreeNode*`,建立用 `new`,空值是 `nullptr`(可以直接當 false:`if (!root)`)。LeetCode 上一般不需要 `delete`。回溯與 DFS 中要累積的狀態用參考傳遞,遞迴回來時撤銷:',
        },
        {
          t: 'code',
          title: '回溯:參考傳遞 + 撤銷',
          code: {
            cpp: `void dfs(int i, vector<int>& nums, vector<int>& path, vector<vector<int>>& res) {
    if (i == nums.size()) { res.push_back(path); return; }   // push_back 會複製 path
    dfs(i + 1, nums, path, res);           // 不選 nums[i]
    path.push_back(nums[i]);               // 選
    dfs(i + 1, nums, path, res);
    path.pop_back();                       // 撤銷
}`,
          },
        },
      ],
    },
  ],
  pitfalls: [
    '`v.size() - 1` 在空陣列時變成很大的無號數,迴圈跑出界。',
    '用 `m[k]` 查詢,不知不覺插入了新鍵。',
    '`priority_queue` 預設是最大堆積;要最小堆積要寫 `greater`。',
    '遞迴函式的 `vector` 參數沒加 `&`,時間和記憶體都多乘 n。',
    '`accumulate` 的起始值寫 `0`,總和超過 `int` 就溢位。',
    '`sort` 的比較函式用 `<=`。',
  ],
  quiz: [
    {
      q: '`priority_queue<int> pq;` 依序 push 3、1、5,`pq.top()` 是?',
      options: ['1', '3', '5'],
      a: 2,
      why: 'C++ 的 `priority_queue` 預設是最大堆積。要最小值在頂端,寫 `priority_queue<int, vector<int>, greater<int>>`。',
    },
    {
      q: '`unordered_map<int,int> m;` 之後寫 `if (m[7] == 0) {}`,m 的大小變成?',
      options: ['0', '1'],
      a: 1,
      why: '`operator[]` 找不到鍵時會插入一個預設值 0。只想查詢要用 `m.count(7)` 或 `m.find(7)`。',
    },
    {
      q: '排好序的 `vector` v,要找「第一個 >= x 的位置」用?',
      options: ['`find`', '`lower_bound`', '`upper_bound`'],
      a: 1,
      why: '`lower_bound` 是第一個 >= x,`upper_bound` 是第一個 > x,兩者都是 O(log n)。',
    },
    {
      q: '`vector<int> v;`(空的)執行 `for (int i = 0; i < v.size() - 1; i++)` 會?',
      options: ['不進迴圈', '跑非常多次而越界', '編譯錯誤'],
      a: 1,
      why: '`v.size()` 是無號的 0,減 1 變成 2⁶⁴ − 1。比較時 `i` 也被轉成無號,條件一直成立。',
    },
  ],
  next: ['heap', 'hash-map', 'binary-search', 'dijkstra'],
}

const langCompare: Concept = {
  id: 'lang-compare',
  name: '五種語言對照表',
  level: 1,
  prereq: ['arrays-strings', 'classes'],
  lead:
    '同一個想法,五種語言寫法不同。這頁是速查表:要一個 Hash 表、一個 heap、一個佇列時,各語言該用什麼、有什麼坑。' +
    '還沒決定用哪種語言的話:Python 最短、最好讀;C++ 最快、STL 最完整;Java 是面試常見語言;C 最能練底層,但寫題最費工。',
  sections: [
    {
      title: '容器對照',
      blocks: [
        {
          t: 'table',
          cols: ['需求', 'Python', 'C++', 'Java', 'JavaScript', 'C'],
          rows: [
            ['動態陣列', '`list`', '`vector`', '`ArrayList` / `int[]`', '`Array`', '`malloc` + `realloc`'],
            ['Hash 表', '`dict`、`defaultdict`、`Counter`', '`unordered_map`', '`HashMap`', '`Map`', 'uthash / 陣列'],
            ['Hash 集合', '`set`', '`unordered_set`', '`HashSet`', '`Set`', 'uthash / 陣列'],
            ['有序 map / set', '`sortedcontainers`(LeetCode 有裝)', '`map` / `set`', '`TreeMap` / `TreeSet`', '無,自己寫或換做法', '無'],
            ['Heap', '`heapq`(**最小**堆積)', '`priority_queue`(**最大**)', '`PriorityQueue`(**最小**)', '自己寫(下面有範例)', '自己寫'],
            ['堆疊', '`list` 的 `append` / `pop`', '`stack` / `vector`', '`ArrayDeque` 的 `push` / `pop`', '`Array` 的 `push` / `pop`', '陣列 + top'],
            ['佇列', '`collections.deque`', '`queue` / `deque`', '`ArrayDeque` 的 `offer` / `poll`', '陣列 + 頭索引', '陣列 + head / tail'],
            ['排序', '`sorted()` / `.sort()`(穩定)', '`sort`(不穩定)/ `stable_sort`', '`Arrays.sort` / `Collections.sort`', '`.sort((a, b) => a - b)`', '`qsort`'],
            ['二分', '`bisect_left` / `bisect_right`', '`lower_bound` / `upper_bound`', '`Arrays.binarySearch`(重複值不保證找到第一個)', '自己寫', '自己寫'],
            ['組字串', '`"".join(parts)`', '`s += c`', '`StringBuilder`', '`parts.join("")`', '`char` 陣列'],
          ],
          note: 'Java 的 `Stack` 類別和 JS 的 `arr.shift()` 都不建議用:前者是舊設計(同步、慢),後者是 O(n)。',
        },
      ],
    },
    {
      title: 'Hash 集合 / Hash 表的常用操作',
      blocks: [
        {
          t: 'table',
          cols: ['操作', 'Python', 'C++', 'Java', 'JavaScript', 'C'],
          rows: [
            ['建立集合', '`s = set()`', '`unordered_set<int> s;`', '`Set<Integer> s = new HashSet<>();`', '`const s = new Set();`', '值域小:`bool seen[N] = {0};`'],
            ['加入', '`s.add(x)`', '`s.insert(x)`', '`s.add(x)`(回傳是否新加入)', '`s.add(x)`', '`seen[x] = 1;`'],
            ['在不在', '`x in s`', '`s.count(x)` / `s.find(x) != s.end()`', '`s.contains(x)`', '`s.has(x)`', '`seen[x]`'],
            ['刪除', '`s.discard(x)`(不在也不報錯);`s.remove(x)` 不在會報錯', '`s.erase(x)`', '`s.remove(x)`', '`s.delete(x)`', '`seen[x] = 0;`'],
            ['個數', '`len(s)`', '`s.size()`', '`s.size()`', '`s.size`(屬性,不加括號)', '自己記'],
            ['表:設定值', '`d[k] = v`', '`m[k] = v`', '`m.put(k, v)`', '`m.set(k, v)`', 'uthash `HASH_ADD_INT`'],
            ['表:取值,不在給 0', '`d.get(k, 0)`', '`m.count(k) ? m[k] : 0`(`m[k]` 會順手插入 0)', '`m.getOrDefault(k, 0)`', '`m.get(k) ?? 0`', 'uthash `HASH_FIND_INT`'],
            ['表:計數 +1', '`d[k] = d.get(k, 0) + 1` 或 `Counter`', '`m[k]++`', '`m.merge(k, 1, Integer::sum)`', '`m.set(k, (m.get(k) ?? 0) + 1)`', '值域小:`cnt[x]++`'],
            ['表:走訪', '`for k, v in d.items():`', '`for (auto& [k, v] : m)`', '`for (var e : m.entrySet())`', '`for (const [k, v] of m)`', 'uthash `HASH_ITER`'],
          ],
          note: '走訪順序:Python `dict`、JS `Map` / `Set` 保留插入順序;C++ `unordered_*`、Java `HashMap` / `HashSet` 不保證順序。各操作平均 O(1)。C++ 的完整寫法見 [[c:cpp-stl]] 的「各容器怎麼操作」。',
        },
      ],
    },
    {
      title: '常數與小工具',
      blocks: [
        {
          t: 'table',
          cols: ['東西', 'Python', 'C++', 'Java', 'JavaScript', 'C'],
          rows: [
            ['無限大', '`float("inf")`', '`INT_MAX` / `LLONG_MAX`', '`Integer.MAX_VALUE`', '`Infinity`', '`INT_MAX`'],
            ['空值', '`None`', '`nullptr`', '`null`', '`null`', '`NULL`'],
            ['整數除法', '`a // b`(向下)', '`a / b`(向零)', '`a / b`(向零)', '`Math.trunc(a / b)`', '`a / b`(向零)'],
            ['最大 / 最小', '`max(a, b)`', '`max(a, b)`', '`Math.max(a, b)`', '`Math.max(a, b)`', '自己寫或三元運算子'],
            ['交換', '`a, b = b, a`', '`swap(a, b)`', '暫存變數', '`[a, b] = [b, a]`', '暫存變數'],
            ['長度', '`len(x)`', '`x.size()`', '`arr.length` / `list.size()` / `s.length()`', '`x.length` / `m.size`', '另外傳'],
          ],
          note: '用 `INT_MAX` 當無限大時,`INT_MAX + 1` 會溢位。最短路徑這類會「無限大 + 權重」的地方,改用 `INT_MAX / 2` 或 `1e9`。',
        },
      ],
    },
    {
      title: '同一題五種寫法:找出現最多次的數',
      blocks: [
        {
          t: 'code',
          title: 'Hash 計數',
          code: {
            python: `from collections import Counter

def most_frequent(nums):
    cnt = Counter(nums)                    # 或 defaultdict(int)
    return max(cnt, key=cnt.get)`,
            c: `// C 沒有內建 Hash:排序後相同的數會相鄰,數「最長的一段」
int cmp(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}
int mostFrequent(int *nums, int n) {
    qsort(nums, n, sizeof(int), cmp);
    int best = nums[0], bestLen = 0;
    for (int i = 0; i < n; ) {
        int j = i;
        while (j < n && nums[j] == nums[i]) j++;
        if (j - i > bestLen) { bestLen = j - i; best = nums[i]; }
        i = j;
    }
    return best;
}`,
            cpp: `int mostFrequent(vector<int>& nums) {
    unordered_map<int, int> cnt;
    for (int x : nums) cnt[x]++;
    int best = nums[0];
    for (auto& [x, c] : cnt) if (c > cnt[best]) best = x;
    return best;
}`,
            java: `int mostFrequent(int[] nums) {
    Map<Integer, Integer> cnt = new HashMap<>();
    for (int x : nums) cnt.merge(x, 1, Integer::sum);   // 或 cnt.put(x, cnt.getOrDefault(x, 0) + 1)
    int best = nums[0];
    for (var e : cnt.entrySet()) if (e.getValue() > cnt.get(best)) best = e.getKey();
    return best;
}`,
            javascript: `function mostFrequent(nums) {
  const cnt = new Map();
  for (const x of nums) cnt.set(x, (cnt.get(x) || 0) + 1);
  let best = nums[0];
  for (const [x, c] of cnt) if (c > cnt.get(best)) best = x;
  return best;
}`,
          },
        },
      ],
    },
    {
      title: 'Heap 怎麼用(或怎麼自己寫)',
      blocks: [
        {
          t: 'p',
          text: 'Python、C++、Java 有內建 heap,直接用;C 和 JavaScript 要自己寫。自己寫的版本就是 [[c:ds-overview]] 講的「放入時往上浮、取出時往下沉」,用陣列存、`(i − 1) / 2` 找爸爸、`2i + 1` 和 `2i + 2` 找孩子:',
        },
        {
          t: 'code',
          title: '最小堆積:放入、看最小、取出',
          code: {
            python: `import heapq
h = []
heapq.heappush(h, 5)
heapq.heappush(h, 1)
smallest = h[0]                # 看最小值,O(1)
x = heapq.heappop(h)           # 取出最小值,O(log n)
heapq.heapify(arr)             # 把現有串列原地變成 heap,O(n)

heapq.heappush(h, -x)          # 最大堆積:存負數,取出時再取負
heapq.heappush(h, (dist, node))  # 依優先度:放 tuple,先比第一項`,
            c: `// 最小堆積(全域陣列:每次呼叫解題函式時記得把 hs 設回 0)
int heap[100005], hs = 0;

void hpush(int x) {
    int i = hs++;
    while (i > 0 && heap[(i - 1) / 2] > x) {   // 比父節點小就往上換
        heap[i] = heap[(i - 1) / 2];
        i = (i - 1) / 2;
    }
    heap[i] = x;
}

int hpop(void) {
    int top = heap[0], x = heap[--hs], i = 0;   // 把最後一個拿到根,往下沉
    while (2 * i + 1 < hs) {
        int c = 2 * i + 1;
        if (c + 1 < hs && heap[c + 1] < heap[c]) c++;   // 挑較小的孩子
        if (heap[c] >= x) break;
        heap[i] = heap[c];
        i = c;
    }
    heap[i] = x;
    return top;
}`,
            cpp: `priority_queue<int, vector<int>, greater<int>> h;   // 最小堆積
h.push(5); h.push(1);
int smallest = h.top();
h.pop();                       // pop 不回傳值,要先 top`,
            java: `PriorityQueue<Integer> h = new PriorityQueue<>();                 // 最小堆積
PriorityQueue<Integer> maxh = new PriorityQueue<>(Collections.reverseOrder());
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
h.offer(5); h.offer(1);
int smallest = h.peek();
int x = h.poll();`,
            javascript: `// LeetCode 的 JS 環境內建 @datastructures-js/priority-queue,但各版本 API 不同;
// 自己寫一個最保險(less 決定誰先出來)
class Heap {
  constructor(less = (a, b) => a < b) { this.a = []; this.less = less; }
  size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(a[i], a[p])) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && this.less(a[l], a[m])) m = l;
        if (r < a.length && this.less(a[r], a[m])) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}
const h = new Heap((a, b) => a[0] < b[0]);   // 依第一項由小到大`,
          },
        },
      ],
    },
    {
      title: '各語言最常踩的坑',
      blocks: [
        {
          t: 'table',
          cols: ['語言', '坑'],
          rows: [
            ['Python', '`[[0]*n]*m` 共用列;`list.pop(0)` 是 O(n);遞迴上限約 1000;預設參數 `def f(a=[])` 只建一次;純迴圈比 C++ 慢一到兩個數量級'],
            ['C', '`*returnSize` 忘了設;回傳區域陣列;`malloc` 沒乘 `sizeof`;`memset` 只適用 0 / −1;全域變數沒重設'],
            ['C++', '`size()` 無號;`m[k]` 會插入;`priority_queue` 預設最大;傳值複製;`int` 溢位'],
            ['Java', '`Integer` / `String` 用 `==` 比;`int[]` 不能用比較函式排序;`a - b` 比較溢位;`HashMap` 的值是 `Integer`,`get` 不到時是 `null` 不是 0'],
            ['JavaScript', '`sort()` 預設字典序;`/` 是浮點除法;超過 2⁵³ 失準;`shift()` 是 O(n);陣列 / 物件當 `Map` 鍵比參考;`fill` 放同一個陣列'],
          ],
        },
      ],
    },
  ],
  pitfalls: [
    '以為每種語言的 heap 都是最小堆積:C++ 的 `priority_queue` 是最大堆積。',
    '用 JS 的 `arr.shift()` 或 Python 的 `list.pop(0)` 當佇列,BFS 變慢一個數量級。',
    '用 `INT_MAX` 當無限大,再加上權重就溢位。',
    'Java 從 `HashMap` 取值直接拆箱成 `int`,鍵不存在時拿到 `null` 而丟出 NullPointerException。',
  ],
  quiz: [
    {
      q: '下列哪個語言的內建 heap 預設是「最大」堆積?',
      options: ['Python heapq', 'Java PriorityQueue', 'C++ priority_queue'],
      a: 2,
      why: 'Python `heapq` 和 Java `PriorityQueue` 都是最小堆積,只有 C++ 是最大堆積。',
    },
    {
      q: 'JavaScript 做 BFS 時,用什麼當佇列最好?',
      options: ['`arr.shift()` 取出', '陣列 + 一個頭索引 `head++`', '`arr.pop()`'],
      a: 1,
      why: '`shift()` 每次要把所有元素往前挪,是 O(n)。用索引記住佇列頭,取出就是 O(1)。`pop()` 取的是尾端,那是堆疊不是佇列。',
    },
    {
      q: 'Python 沒有內建的有序 map(像 Java 的 TreeMap),在 LeetCode 上可以用?',
      options: ['`collections.OrderedDict`', '`sortedcontainers.SortedList` / `SortedDict`', '`heapq`'],
      a: 1,
      why: '`OrderedDict` 記的是插入順序,不是鍵的大小順序。LeetCode 的 Python 環境有裝 `sortedcontainers`。',
    },
  ],
  next: ['heap', 'hash-map', 'stack', 'graph-traversal'],
}

export const TOOLBOX: Concept[] = [cLang, cppStl, langCompare]
