import type { Concept } from './types'

// 單元二:複雜度 —— Big O、怎麼數、空間、從 Constraints 反推。

const bigO: Concept = {
  id: 'big-o',
  name: 'Big O 是什麼',
  level: 1,
  prereq: ['solving-process'],
  lead:
    'Big O 描述的是「資料量變大時,執行時間(或記憶體)成長得多快」。它不管實際跑幾毫秒,只管 n 從一千變成一百萬時,' +
    '時間會變成一千倍、一百萬倍,還是一兆倍。刷題時判斷一個解法「夠不夠快」,用的就是它。',
  analogy:
    '搬家公司報價:A 公司「固定 3000 元」是 O(1);B 公司「每箱 100 元」是 O(n);C 公司「每兩箱之間都要互相確認一次」是 O(n²)。東西少的時候三家差不多,東西一多,C 公司會貴到離譜。',
  sections: [
    {
      title: '為什麼不用秒數',
      blocks: [
        {
          t: 'p',
          text: '同一份程式碼,換一台電腦、換一種語言、換一組測資,秒數都不一樣。Big O 把這些拿掉,只留下「跟 n 的關係」。比較下面兩個函式:一個掃一遍找最大值,一個兩兩比較檢查有沒有重複。',
        },
        {
          t: 'code',
          title: 'O(n) 與 O(n²)',
          code: {
            python: `def find_max(a):              # O(n):每個元素看一次
    best = a[0]
    for x in a:
        best = max(best, x)
    return best

def has_duplicate(a):          # O(n²):每一對都比一次
    n = len(a)
    for i in range(n):
        for j in range(i + 1, n):
            if a[i] == a[j]:
                return True
    return False`,
            c: `int find_max(int *a, int n) {          // O(n)
    int best = a[0];
    for (int i = 0; i < n; i++)
        if (a[i] > best) best = a[i];
    return best;
}

bool has_duplicate(int *a, int n) {     // O(n²)
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (a[i] == a[j]) return true;
    return false;
}`,
            cpp: `int findMax(const vector<int>& a) {     // O(n)
    int best = a[0];
    for (int x : a) best = max(best, x);
    return best;
}

bool hasDuplicate(const vector<int>& a) { // O(n²)
    int n = a.size();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (a[i] == a[j]) return true;
    return false;
}`,
            java: `int findMax(int[] a) {                  // O(n)
    int best = a[0];
    for (int x : a) best = Math.max(best, x);
    return best;
}

boolean hasDuplicate(int[] a) {         // O(n²)
    for (int i = 0; i < a.length; i++)
        for (int j = i + 1; j < a.length; j++)
            if (a[i] == a[j]) return true;
    return false;
}`,
            javascript: `function findMax(a) {                   // O(n)
  let best = a[0];
  for (const x of a) best = Math.max(best, x);
  return best;
}

function hasDuplicate(a) {              // O(n²)
  for (let i = 0; i < a.length; i++)
    for (let j = i + 1; j < a.length; j++)
      if (a[i] === a[j]) return true;
  return false;
}`,
          },
        },
        {
          t: 'p',
          text: 'n = 10⁵ 時,`find_max` 做 10⁵ 次比較,一眨眼就完成;`has_duplicate` 最多做約 5×10⁹ 次,在判題機上要跑好幾十秒 —— 這就是 TLE。改用 [[p:hash-map]] 記錄看過的數,可以降回 O(n)。',
        },
      ],
    },
    {
      title: '三條化簡規則',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**只留成長最快的那一項**:`n² + n` 寫成 O(n²)。n 很大時,n 和 n² 比起來可以忽略。',
            '**丟掉常數倍數**:`3n` 寫成 O(n),`n/2` 也是 O(n)。常數會影響實際秒數,但不影響「n 變 10 倍時時間變幾倍」。',
            '**不同的輸入用不同的變數**:兩個陣列長度 n 和 m,各掃一遍是 O(n + m),兩兩配對是 O(n·m)。不要都寫成 n。',
          ],
        },
        {
          t: 'table',
          cols: ['精確的次數', 'Big O', '為什麼'],
          rows: [
            ['3n² + 5n + 100', 'O(n²)', 'n² 主導,常數 3 拿掉'],
            ['n(n − 1) / 2', 'O(n²)', '展開是 n²/2 − n/2'],
            ['2n + 1000', 'O(n)', '1000 是常數,n 夠大就不重要'],
            ['n + log n', 'O(n)', 'log n 比 n 小得多'],
            ['n log n + n', 'O(n log n)', 'n log n 比 n 大'],
            ['n·m + m', 'O(n·m)', 'n·m 主導;但 n 和 m 是不同的量,不能寫成 n²'],
            ['5', 'O(1)', '不隨 n 改變'],
          ],
        },
      ],
    },
    {
      title: '常見等級:感受一下差距',
      blocks: [
        {
          t: 'p',
          text: '下面列出刷題最常見的九個等級,從快到慢。點不同的 n,看哪些等級還在 1 秒內(粗估判題機一秒跑 10⁸ 次簡單運算):',
        },
        { t: 'widget', id: 'growth' },
        {
          t: 'table',
          cols: ['等級', '名稱', '典型操作'],
          rows: [
            ['O(1)', '常數', '陣列用索引取值、Hash 表查找(平均)、堆疊 push / pop'],
            ['O(log n)', '對數', '[[p:binary-search]]、平衡二元搜尋樹的查找、[[p:heap]] 的 push / pop'],
            ['O(n)', '線性', '掃一遍、[[p:two-pointers]]、[[p:sliding-window]]、[[p:prefix-sum]]'],
            ['O(n log n)', '線性對數', '排序([[p:merge-sort]]、內建 sort)、n 次 heap 操作'],
            ['O(n²)', '平方', '雙層迴圈、二維 [[p:dp-general]]'],
            ['O(n³)', '立方', '三層迴圈、[[p:interval-dp]]、Floyd–Warshall'],
            ['O(2ⁿ)', '指數', '列舉所有子集、[[p:bitmask-dp]]'],
            ['O(n!)', '階乘', '列舉所有排列([[p:backtracking]])'],
          ],
        },
      ],
    },
    {
      title: '最好、平均、最壞',
      blocks: [
        {
          t: 'p',
          text: '同一個演算法,遇到不同的輸入,花的時間可能差很多。[[p:quick-sort]] 平均 O(n log n),但每次都選到最差的 pivot 時會退化成 O(n²);[[p:insertion-sort]] 遇到已經排好的陣列只要 O(n)。',
        },
        {
          t: 'list',
          items: [
            '**刷題與面試預設講「最壞情況」**,因為隱藏測資一定會出最壞的那組。',
            '例外是大家都有共識的「平均」:Hash 表查找講 O(1)(最壞是所有鍵撞在一起的 O(n),見 [[c:hashing]]);快速排序講 O(n log n)(隨機選 pivot 後,最壞情況機率極低)。',
            '還有一種叫「攤銷」:單次可能很慢,但平均分攤到每一次都很快。動態陣列的 append 就是,見 [[c:complexity-analysis]]。',
          ],
        },
      ],
    },
    {
      title: '正式定義(進階)',
      blocks: [
        {
          t: 'p',
          text: '`f(n) = O(g(n))` 的意思是:存在常數 c > 0 和 n₀,使得所有 n ≥ n₀ 都有 f(n) ≤ c·g(n)。白話說:n 夠大之後,f 的成長「不會比 g 快」。所以 Big O 是**上界**,嚴格來說 n 也算 O(n²)(雖然沒人這樣寫)。',
        },
        {
          t: 'table',
          cols: ['符號', '意思', '白話'],
          rows: [
            ['O(g)', '上界', '最多這麼慢'],
            ['Ω(g)', '下界', '至少這麼慢(例如「比較式排序最壞至少 Ω(n log n)」)'],
            ['Θ(g)', '同時是上界和下界', '剛好就是這個等級'],
          ],
          note: '面試和刷題口語說的「這是 O(n log n)」,其實通常是 Θ 的意思:剛好這個等級,不是寬鬆的上界。',
        },
      ],
    },
  ],
  pitfalls: [
    '寫成 O(2n) 或 O(n/2):常數要拿掉,都是 O(n)。',
    '把不同大小的輸入混成同一個 n:兩個陣列各掃一遍是 O(n + m),不是 O(2n);雙層各掃一個是 O(n·m),不是 O(n²)。',
    '以為 O(1) 永遠比 O(n) 快:n 很小時,常數很大的 O(1)(例如雜湊計算)可能比掃 5 個元素還慢。Big O 只描述 n 很大時的趨勢。',
    '忽略內建函式的成本:`x in list`、`list.pop(0)`、字串切片、C 的 `strlen` 都是 O(n),寫在迴圈裡就多一層,見 [[c:complexity-analysis]]。',
    '只看最好情況:「如果陣列已經排好就是 O(n)」—— 但測資一定會給你沒排好的。',
  ],
  quiz: [
    {
      q: '某段程式碼精確執行 `3n² + 100n + 5000` 次運算,它的 Big O 是?',
      options: ['O(3n²)', 'O(n²)', 'O(n² + n)', 'O(5000)'],
      a: 1,
      why: '只留成長最快的 n²,常數 3 拿掉。',
    },
    {
      q: '兩個「各自獨立」的迴圈,先跑 n 次、再跑 n 次。複雜度是?',
      options: ['O(n²)', 'O(2n)', 'O(n)', 'O(log n)'],
      a: 2,
      why: '前後接續的迴圈是相加:n + n = 2n,常數拿掉是 O(n)。巢狀(一個在另一個裡面)才是相乘。',
    },
    {
      q: '一個 O(n²) 的演算法,n 從 1000 變成 2000,時間大約變成幾倍?',
      options: ['2 倍', '4 倍', '1000 倍', '不變'],
      a: 1,
      why: '(2n)² = 4n²,所以約 4 倍。O(n) 會變 2 倍,O(n³) 會變 8 倍。',
    },
    {
      q: '外層迴圈跑過陣列 A(長度 n),內層跑過陣列 B(長度 m)。最精確的寫法是?',
      options: ['O(n²)', 'O(n + m)', 'O(n·m)', 'O(max(n, m))'],
      a: 2,
      why: '巢狀是相乘。n 和 m 是不同的量,寫成 n² 會在 m 遠小於 n 時高估。',
    },
  ],
  next: [],
}

const complexityAnalysis: Concept = {
  id: 'complexity-analysis',
  name: '怎麼算時間複雜度',
  level: 1,
  prereq: ['big-o'],
  lead:
    '實務上不必寫證明,只要會「數」:每一行會被執行幾次?迴圈套了幾層?每一輪範圍縮小多少?遞迴分成幾支、每支多大?' +
    '這一章把最常見的形狀都列出來,看過一次就能套用。',
  sections: [
    {
      title: '迴圈的形狀',
      blocks: [
        {
          t: 'code',
          title: '五種最常見的迴圈',
          code: {
            python: `# 1. 單層:O(n)
for i in range(n): ...

# 2. 兩層,都跑滿:O(n²)
for i in range(n):
    for j in range(n): ...

# 3. 內層從 i 開始:還是 O(n²)  (總共 n(n-1)/2 次)
for i in range(n):
    for j in range(i + 1, n): ...

# 4. 每次乘 2(或除以 2):O(log n)
i = 1
while i < n:
    i *= 2

# 5. 外層 n 次,內層每次減半:O(n log n)
for i in range(n):
    j = n
    while j > 0:
        j //= 2`,
            c: `// 1. 單層:O(n)
for (int i = 0; i < n; i++) { ... }

// 2. 兩層都跑滿:O(n²)
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++) { ... }

// 3. 內層從 i 開始:還是 O(n²)
for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++) { ... }

// 4. 每次乘 2:O(log n)
for (int i = 1; i < n; i *= 2) { ... }

// 5. 外層 n 次 × 內層 log n:O(n log n)
for (int i = 0; i < n; i++)
    for (int j = n; j > 0; j /= 2) { ... }`,
          },
        },
        {
          t: 'table',
          cols: ['形狀', '複雜度', '怎麼數'],
          rows: [
            ['接續的兩段', '相加', 'O(n) 之後再 O(n log n) → O(n log n)(取大的)'],
            ['巢狀', '相乘', '外層次數 × 內層次數'],
            ['內層範圍隨外層變', '把每一輪加總', '1 + 2 + … + n = n(n+1)/2 → O(n²)'],
            ['每次乘 / 除一個常數', 'O(log n)', '從 1 乘到 n 要乘幾次 2? log₂ n 次'],
            ['內層總步數有上限', '看「總共」走幾步', '見下面的雙指標'],
          ],
        },
      ],
    },
    {
      title: 'log 是從哪裡來的',
      blocks: [
        {
          t: 'p',
          text: '「每一步把範圍砍半」,從 n 砍到 1 要砍幾次?答案是 log₂ n。這就是所有 O(log n) 的來源:[[p:binary-search]] 每次丟掉一半、平衡樹每往下一層節點數少一半、[[p:heap]] 的高度是 log n。',
        },
        {
          t: 'table',
          cols: ['n', 'log₂ n(大約)', '記法'],
          rows: [
            ['10³(一千)', '10', '2¹⁰ = 1024 ≈ 10³'],
            ['10⁶(一百萬)', '20', '2²⁰ ≈ 10⁶'],
            ['10⁹(十億)', '30', '2³⁰ ≈ 10⁹'],
            ['10¹⁸', '60', '2⁶⁰ ≈ 10¹⁸(`long long` 的範圍)'],
          ],
          note: '所以 O(log n) 在刷題的範圍裡幾乎就是「最多幾十次」。對十億個數二分搜尋,也只要 30 步。',
        },
        {
          t: 'note',
          kind: 'tip',
          title: '底數不重要',
          text: 'log₂ n、log₁₀ n、ln n 之間只差一個常數倍(換底公式),所以 Big O 裡直接寫 log n,不寫底數。',
        },
      ],
    },
    {
      title: '看起來是雙層,其實是 O(n)',
      blocks: [
        {
          t: 'p',
          text: '[[p:sliding-window]] 和 [[p:two-pointers]] 常有「for 裡面套 while」,很多人第一眼以為是 O(n²)。關鍵是:**while 裡的指標只會往前、不會回頭**,整個程式跑完,它總共最多走 n 步。所以總工作量是「外層 n 步 + 內層總共 n 步」= O(n)。',
        },
        {
          t: 'code',
          title: '滑動視窗:左指標總共只走 n 步',
          code: {
            python: `left = 0
for right in range(n):          # right 走 n 步
    add(a[right])
    while window_is_bad():      # left 全程最多走 n 步,不是每輪 n 步
        remove(a[left])
        left += 1`,
            cpp: `int left = 0;
for (int right = 0; right < n; right++) {   // right 走 n 步
    add(a[right]);
    while (windowIsBad()) {                  // left 全程最多走 n 步
        remove(a[left]);
        left++;
    }
}`,
          },
        },
        {
          t: 'p',
          text: '同樣的「每個元素最多進出一次」也解釋了 [[p:monotonic-stack]] 為什麼是 O(n):每個元素 push 一次、最多 pop 一次。這種「看總量、不看單次」的算法叫做**攤銷分析**。',
        },
      ],
    },
    {
      title: '遞迴:畫出遞迴樹',
      blocks: [
        {
          t: 'p',
          text: '遞迴的時間 = 「總共呼叫幾次」×「每次呼叫自己做多少事(不含子呼叫)」。畫出遞迴樹,數節點數和每層的工作量:',
        },
        {
          t: 'code',
          title: '同一題的兩種寫法:費氏數列',
          code: {
            python: `def fib(n):                 # 每次分兩支,樹有約 2ⁿ 個節點 → O(2ⁿ)
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

from functools import cache
@cache
def fib2(n):                # 每個 n 只算一次,共 n 個子問題 → O(n)
    if n < 2:
        return n
    return fib2(n - 1) + fib2(n - 2)`,
            java: `int fib(int n) {                       // O(2ⁿ)
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}

int[] memo = new int[100];              // 0 代表還沒算過
int fib2(int n) {                       // O(n):每個 n 只算一次
    if (n < 2) return n;
    if (memo[n] != 0) return memo[n];
    return memo[n] = fib2(n - 1) + fib2(n - 2);
}`,
          },
        },
        {
          t: 'table',
          cols: ['遞迴形狀', '例子', '複雜度'],
          rows: [
            ['T(n) = T(n−1) + O(1)', '遞迴走過串列、階乘', 'O(n)'],
            ['T(n) = T(n/2) + O(1)', '[[p:binary-search]] 的遞迴版', 'O(log n)'],
            ['T(n) = 2T(n/2) + O(1)', '樹的遍歷([[p:tree-dfs]])', 'O(n)'],
            ['T(n) = 2T(n/2) + O(n)', '[[p:merge-sort]]、快速排序的平均', 'O(n log n)'],
            ['T(n) = T(n−1) + O(n)', '快速排序的最壞、選擇排序', 'O(n²)'],
            ['T(n) = 2T(n−1) + O(1)', '沒有記憶化的費氏、子集列舉', 'O(2ⁿ)'],
            ['記憶化 / DP', '子問題數 × 每個子問題的轉移成本', '例如 n×m 個狀態、每個 O(1) → O(n·m)'],
          ],
          note: '`2T(n/2) + O(n)` 為什麼是 n log n:遞迴樹每一層加起來都是 O(n) 的工作,總共 log n 層。',
        },
      ],
    },
    {
      title: '攤銷:動態陣列的 append',
      blocks: [
        {
          t: 'p',
          text: 'Python 的 `list`、C++ 的 `vector`、Java 的 `ArrayList`、JS 的陣列都是「動態陣列」:容量滿了就配一塊**兩倍大**的新空間,把舊資料全部搬過去。搬家那一次是 O(n),但搬家越來越少見:放 n 個元素,搬家的總成本是 1 + 2 + 4 + … + n < 2n,平均每次 append 只要 O(1)。這就叫「攤銷 O(1)」。',
        },
        {
          t: 'note',
          kind: 'warn',
          title: '只有「尾端」便宜',
          text: '在動態陣列的**開頭或中間**插入 / 刪除,要把後面所有元素挪一格,是 O(n)。`list.pop(0)`、`list.insert(0, x)`、`vector.erase(v.begin())`、JS 的 `shift()` 都是這樣。要兩端都快,用雙端佇列(deque)。',
        },
      ],
    },
    {
      title: '藏在一行裡的 O(n)',
      blocks: [
        {
          t: 'p',
          text: '一行看起來很短的程式碼,背後可能是一個迴圈。寫在迴圈裡,複雜度就多乘一個 n:',
        },
        {
          t: 'table',
          cols: ['語言', '看起來 O(1),其實是 O(n)', '替代做法'],
          rows: [
            ['Python', '`x in list`、`list.index(x)`、`list.pop(0)`、`s[a:b]`(複製一段)、`list(a)`', '用 `set` / `dict` 查;用 `collections.deque`;用索引代替切片'],
            ['Python', '迴圈裡 `s += ch` 組字串(可能退化成 O(n²))', '先放進 list,最後 `"".join(parts)`'],
            ['C', '`for (i = 0; i < strlen(s); i++)`:每一輪都重算長度 → O(n²)', '先存 `int len = strlen(s);`'],
            ['C++', '把 `vector` 或 `string` 傳值(沒有 `&`)給遞迴函式:每次呼叫都複製一份', '傳 `const vector<int>&`'],
            ['C++', '`s = s + c`(產生新字串)', '`s += c` 或 `s.push_back(c)`(攤銷 O(1))'],
            ['Java', '迴圈裡 `str += c`(String 不可變,每次都新建)', '`StringBuilder`'],
            ['Java', '`list.contains(x)`、`list.remove(0)`(ArrayList)', '`HashSet`、`ArrayDeque`'],
            ['JavaScript', '`arr.includes(x)`、`arr.indexOf(x)`、`arr.shift()`、`[...arr]`、`arr.slice()`', '`Set` / `Map`;用索引當佇列頭'],
          ],
        },
      ],
    },
  ],
  pitfalls: [
    '看到 for 裡面有 while 就判定 O(n²):要看內層指標是不是全程只往前走,是的話總共只有 O(n)。',
    '遞迴只數「每次做什麼」,忘了乘上「總共呼叫幾次」。',
    '沒有記憶化的遞迴,重複子問題會讓複雜度爆成指數。',
    '把 `list.pop(0)` 當 O(1) 用來實作佇列,BFS 就從 O(V+E) 變成 O(V²)。',
    '排序是 O(n log n),不是 O(n):「先排序再掃一遍」整體是 O(n log n)。',
  ],
  quiz: [
    {
      q: '`i = 1; while i < n: i *= 2` 的複雜度是?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(√n)'],
      a: 1,
      why: 'i 依序是 1, 2, 4, 8, …,翻倍 log₂ n 次就超過 n。',
    },
    {
      q: '`for i in range(n): for j in range(i, n): ...` 的複雜度是?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
      a: 2,
      why: '總次數 n + (n−1) + … + 1 = n(n+1)/2,還是 O(n²)。內層從 i 開始只是砍掉一半,常數不影響 Big O。',
    },
    {
      q: '滑動視窗:外層 right 從 0 走到 n−1,內層 while 讓 left 往右移,left 永遠不回頭。總複雜度是?',
      options: ['O(n²)', 'O(n)', 'O(n log n)'],
      a: 1,
      why: 'left 全程最多走 n 步,不是每一輪走 n 步。總工作量是 right 的 n 步加上 left 的 n 步。',
    },
    {
      q: 'C 語言 `for (int i = 0; i < strlen(s); i++)`,s 長度 n。複雜度是?',
      options: ['O(n)', 'O(n²)', 'O(log n)'],
      a: 1,
      why: '`strlen` 每次都從頭數到 `\\0`,是 O(n),而迴圈條件每一輪都會重新計算。',
    },
    {
      q: '[[p:merge-sort]]:切兩半各自遞迴,再花 O(n) 合併。複雜度是?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      a: 1,
      why: '遞迴樹有 log n 層,每一層的合併工作加起來是 O(n)。',
    },
  ],
  next: ['binary-search', 'merge-sort', 'sliding-window', 'monotonic-stack'],
}

const spaceComplexity: Concept = {
  id: 'space-complexity',
  name: '空間複雜度',
  level: 1,
  prereq: ['complexity-analysis'],
  lead:
    '空間複雜度算的是「除了輸入之外,額外用了多少記憶體」,一樣用 Big O 表示。最常被忽略的是遞迴:每一層呼叫都在呼叫堆疊上佔一格,遞迴 n 層就是 O(n) 空間。',
  sections: [
    {
      title: '算什麼、不算什麼',
      blocks: [
        {
          t: 'table',
          cols: ['東西', '算不算', '說明'],
          rows: [
            ['輸入本身', '通常不算', '題目給的陣列本來就在那裡'],
            ['回傳的答案', '通常不算', '題目要你輸出 n 個東西,這部分省不掉;面試時可以說明一下'],
            ['額外開的陣列、Hash 表、堆疊、佇列', '算', '`seen = set()` 存 n 個數 → O(n)'],
            ['幾個變數(i、j、sum)', '算,O(1)', '數量不隨 n 改變'],
            ['遞迴的呼叫堆疊', '算', '最大遞迴深度 × 每層的區域變數'],
            ['修改輸入當作暫存', '技術上 O(1)', '例如把走過的格子改成 `#`;面試時要先問能不能改輸入'],
          ],
        },
      ],
    },
    {
      title: '遞迴的隱藏空間',
      blocks: [
        {
          t: 'p',
          text: '每呼叫一次函式,系統就在「呼叫堆疊」放一個框(frame),存參數、區域變數和回去的位置;函式回傳時框才拿掉。所以遞迴的空間取決於**最深**同時有幾層,而不是總共呼叫幾次。機制詳見 [[c:recursion]]。',
        },
        {
          t: 'table',
          cols: ['情況', '最大深度', '空間'],
          rows: [
            ['平衡二元樹的 DFS', 'log n', 'O(log n)'],
            ['退化成一條線的樹(像串列)', 'n', 'O(n)'],
            ['網格 DFS(m×n,最壞蛇行)', 'm·n', 'O(m·n)'],
            ['[[p:merge-sort]]', 'log n 層,但合併要 O(n) 暫存陣列', 'O(n)'],
            ['[[p:quick-sort]](平均)', 'log n', 'O(log n)'],
          ],
          note: '說「樹的 DFS 是 O(h) 空間」最精確,h 是樹高。面試時補一句「平衡時 O(log n),最壞 O(n)」。',
        },
        {
          t: 'note',
          kind: 'warn',
          title: '遞迴太深會當掉',
          text: 'Python 預設遞迴上限約 1000 層,超過就丟 `RecursionError`;C / C++ / Java 雖然沒有固定層數,但堆疊空間有限,深度到幾十萬層也會 Stack Overflow。輸入可能是一條長鏈時,考慮改成迭代(自己用堆疊)。',
        },
      ],
    },
    {
      title: '空間換時間,或時間換空間',
      blocks: [
        {
          t: 'p',
          text: '很多優化其實是在做交易。用 [[p:hash-map]] 多花 O(n) 空間,把查找從 O(n) 變 O(1);反過來,DP 如果只依賴上一列,就能把 O(n·m) 的表壓成 O(m) 的兩列,叫做**滾動陣列**:',
        },
        {
          t: 'code',
          title: '費氏數列:O(n) 空間 → O(1) 空間',
          code: {
            python: `# O(n) 空間:整張表都存起來
dp = [0] * (n + 1)
dp[1] = 1
for i in range(2, n + 1):
    dp[i] = dp[i - 1] + dp[i - 2]

# O(1) 空間:只需要前兩個
a, b = 0, 1
for _ in range(n):
    a, b = b, a + b`,
            cpp: `// O(n) 空間
vector<long long> dp(n + 1);
dp[1] = 1;
for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];

// O(1) 空間:只留前兩個
long long a = 0, b = 1;
for (int i = 0; i < n; i++) { long long c = a + b; a = b; b = c; }`,
          },
        },
      ],
    },
    {
      title: '記憶體用量的直覺',
      blocks: [
        {
          t: 'table',
          cols: ['資料', '大約大小', '可不可以'],
          rows: [
            ['10⁶ 個 `int`(C/C++/Java 陣列)', '4 MB', '完全沒問題'],
            ['10⁷ 個 `int`', '40 MB', '通常可以'],
            ['10⁸ 個 `int`', '400 MB', '多半超過上限'],
            ['n = 10⁵ 的 n×n 表', '10¹⁰ 格', '不可能 —— 要換做法'],
            ['Python 10⁶ 個整數的 list', '數十 MB', 'Python 每個整數是物件(約 28 bytes)加上 8 bytes 的參考,比 C 大好幾倍'],
          ],
          note: 'LeetCode 沒有公開每題的確切記憶體上限,經驗上是數百 MB 等級。看到 n ≥ 10⁵ 還想開 n×n 的二維陣列,就該停下來。',
        },
      ],
    },
  ],
  pitfalls: [
    '說遞迴解是 O(1) 空間:呼叫堆疊也算,深度 h 就是 O(h)。',
    'DFS 寫成遞迴,遇到 10⁵ 個節點排成一條線時 Python 直接 RecursionError。',
    'DP 開了完整的二維表,但每一列只用到上一列,浪費 O(n·m) 空間。',
    'C++ 遞迴時把 vector 傳值,每一層都多一份副本:時間和空間都多乘一個 n。',
  ],
  quiz: [
    {
      q: '對一棵 n 個節點、完全歪向一邊(像串列)的樹做遞迴 DFS,空間複雜度是?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      a: 2,
      why: '遞迴深度等於樹高,歪斜的樹高度是 n,呼叫堆疊同時有 n 層。',
    },
    {
      q: '只用了 `i`、`j`、`total` 三個變數,沒有遞迴。空間複雜度是?',
      options: ['O(1)', 'O(3)', 'O(n)'],
      a: 0,
      why: '變數數量固定,不隨 n 增加。O(3) 化簡後就是 O(1)。',
    },
    {
      q: 'DP 表 `dp[i][j]` 只依賴 `dp[i-1][...]`,怎麼省空間?',
      options: ['改用遞迴', '只保留兩列(滾動陣列)', '改用 Hash 表'],
      a: 1,
      why: '計算第 i 列只需要第 i−1 列,更早的列不會再用到,保留兩列輪流用就好,O(n·m) → O(m)。',
    },
  ],
  next: ['dp-1d', 'tree-dfs'],
}

const constraints: Concept = {
  id: 'constraints',
  name: '從資料範圍反推解法',
  level: 2,
  prereq: ['complexity-analysis'],
  lead:
    'Constraints 裡 n 的上限,幾乎就是出題者給的提示。判題機一秒大約能跑 10⁸ 次簡單運算,把 n 代進各種複雜度,' +
    '就知道哪些會超時、哪些還可以 —— 甚至能反過來猜出題者想要的解法。',
  analogy: '像看到預算決定交通工具:預算只有 50 元,就別想計程車了,一定是公車或捷運。n = 10⁵ 就是「預算只夠 O(n log n)」。',
  sections: [
    {
      title: '經典對照表',
      blocks: [
        {
          t: 'table',
          cols: ['n 的上限', '最慢可以用', '常見做法'],
          rows: [
            ['≤ 10', 'O(n!)', '列舉所有排列([[p:backtracking]])'],
            ['≤ 20', 'O(2ⁿ)、O(2ⁿ·n)', '列舉子集、[[p:bitmask-dp]]'],
            ['≤ 100', 'O(n³)~O(n⁴)', '多層迴圈'],
            ['≤ 500', 'O(n³)', '[[p:interval-dp]]、Floyd–Warshall'],
            ['≤ 5000', 'O(n²)', '雙層迴圈、二維 DP([[p:lcs]])'],
            ['≤ 10⁵ ~ 10⁶', 'O(n log n) 或 O(n)', '排序、[[p:heap]]、[[p:binary-search]]、[[p:two-pointers]]、[[p:hash-map]]'],
            ['≤ 10⁹ 以上', 'O(log n)、O(√n)、O(1)', '[[p:binary-search-answer]]、[[p:math]]'],
          ],
          note: '這張表是粗估:常數很小的 O(n²) 在 n = 10⁴ 也許過得了;Python 遇到「剛好卡邊」的情況比 C++ 容易超時。',
        },
      ],
    },
    {
      title: '時間預算計算機',
      blocks: [
        {
          t: 'p',
          text: '把題目 Constraints 裡的上限輸入進去(支援 `10^5`、`2*10^4`、`1e9` 這些寫法),看哪些複雜度在預算內:',
        },
        { t: 'widget', id: 'budget' },
      ],
    },
    {
      title: '其他 Constraints 的線索',
      blocks: [
        {
          t: 'table',
          cols: ['看到', '暗示'],
          rows: [
            ['值的範圍很小(例如 `0 <= nums[i] <= 100`)', '可以開大小為值域的陣列計數([[p:counting-sort]]),不用 Hash'],
            ['值的範圍到 10⁹,但 n 只有 10⁵', '不能用值當索引開陣列 → 用 Hash 表,或排序後做座標壓縮'],
            ['「答案可能很大,請對 10⁹ + 7 取模」', '答案是方法數 → 多半是計數型 DP,記得每一步都取模,見 [[c:integers]]'],
            ['所有元素都是正數', '前綴和嚴格遞增 → 可以用 [[p:sliding-window]] 或二分;有負數時通常要改用前綴和 + Hash'],
            ['只有小寫英文字母', '用大小 26 的陣列取代 Hash 表,更快也更省'],
            ['值在 `[-2³¹, 2³¹ − 1]`', '兩個數相加或相乘可能溢位 → 用 `long` / `long long`'],
            ['保證答案唯一 / 保證有解', '可以不處理「找不到」的情況'],
            ['陣列已排序', '[[p:binary-search]] 或 [[p:two-pointers]] 的強烈訊號'],
            ['m, n ≤ 200 的網格', 'O(m·n) 只有 4 萬格,BFS / DFS / DP 都很輕鬆;O((m·n)²) 是 16 億,不行'],
          ],
        },
      ],
    },
    {
      title: '反推的實例',
      blocks: [
        {
          t: 'list',
          items: [
            '**Two Sum,`n <= 10⁴`**:O(n²) 是 10⁸ 次比較,勉強過得了 —— 所以暴力解也會 Accepted,但 Follow-up 會問 O(n) 解法(Hash 表)。',
            '**Longest Substring Without Repeating Characters,`n <= 5×10⁴`**:暴力列舉所有子字串是 O(n²) 甚至 O(n³),要找 O(n) → [[p:sliding-window]]。',
            '**Partition to K Equal Sum Subsets,`n <= 16`**:16 這個數字幾乎是在喊「2¹⁶ 列舉子集」→ [[p:bitmask-dp]] 或回溯。',
            '**Koko Eating Bananas,`piles[i] <= 10⁹`**:答案的範圍是 10⁹,一個一個試會超時,但「速度越快越吃得完」有單調性 → [[p:binary-search-answer]]。',
          ],
        },
      ],
    },
  ],
  pitfalls: [
    '只看 n,忽略其他變數:網格題的 m 和 n、字串題的單字數和單字長度都要一起乘。',
    '忘了排序本身是 O(n log n):「先排序再雙指標」整體是 O(n log n),不是 O(n)。',
    '看到 n ≤ 20 還在想 O(n) 的聰明解法:出題者給這麼小的範圍,就是要你列舉。',
    '答案要取模卻只在最後取一次:中間結果早就溢位了。',
  ],
  quiz: [
    {
      q: 'Constraints:`1 <= n <= 10⁵`。最可能的目標複雜度是?',
      options: ['O(n²)', 'O(n log n) 或 O(n)', 'O(2ⁿ)', 'O(n³)'],
      a: 1,
      why: 'n² = 10¹⁰ 太大;n log n ≈ 1.7×10⁶ 很輕鬆。',
    },
    {
      q: 'Constraints:`1 <= n <= 15`,問「選出幾個元素...的方法數」。最可能的方向是?',
      options: ['二分搜尋', '列舉所有子集 / 位元 DP', '單調堆疊', '並查集'],
      a: 1,
      why: '2¹⁵ ≈ 3.3 萬,列舉所有子集綽綽有餘。這麼小的 n 是很強的訊號。',
    },
    {
      q: '題目說「答案可能很大,請回傳對 10⁹ + 7 取模的結果」,這通常暗示?',
      options: ['要用浮點數', '答案是方法數,多半是計數 DP', '要用字串存數字', '要排序'],
      a: 1,
      why: '方法數成長得很快(常是指數級),所以要取模;計算方法數最常用的就是 DP 或組合數學。',
    },
    {
      q: '`n <= 500`,演算法是三層迴圈 O(n³)。會超時嗎?',
      options: ['一定超時', '大約 1.25×10⁸ 次,通常過得了', '一定很快'],
      a: 1,
      why: '500³ = 1.25×10⁸,接近 10⁸ 的預算。迴圈內容簡單的話通常可以;這也是區間 DP 題常把 n 設在 500 以內的原因。',
    },
  ],
  next: ['bitmask-dp', 'backtracking', 'interval-dp', 'binary-search-answer'],
}

export const COMPLEXITY: Concept[] = [bigO, complexityAnalysis, spaceComplexity, constraints]
