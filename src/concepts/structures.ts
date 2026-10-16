import type { Concept } from './types'

// 單元五:資料結構總覽 —— 各結構擅長什麼、雜湊表原理、樹與圖的術語與表示法。

const dsOverview: Concept = {
  id: 'ds-overview',
  name: '資料結構總覽',
  level: 1,
  prereq: ['arrays-strings', 'complexity-analysis'],
  lead:
    '資料結構決定了「哪些操作很快」。陣列擅長用位置取值、Hash 表擅長查「有沒有」、heap 擅長不斷拿最小值、堆疊擅長處理「最近的那一個」。' +
    '很多題目選對資料結構,演算法就自然出來了;選錯,怎麼優化都卡在某個 O(n) 的操作上。',
  analogy:
    '像整理東西的方式:書照編號排在書架上(陣列,知道編號馬上拿到);名片用索引卡依名字分格(Hash 表,知道名字馬上找到);待辦事項依急迫程度疊(heap,永遠先處理最急的);盤子一個疊一個(堆疊,只能拿最上面那個)。',
  sections: [
    {
      title: '一張表看完:每個操作多快',
      blocks: [
        {
          t: 'table',
          cols: ['結構', '用位置取值', '查找某值', '加入', '刪除', '擅長'],
          rows: [
            ['陣列 / 動態陣列', 'O(1)', 'O(n);排序後 O(log n)', '尾端攤銷 O(1);中間 O(n)', '尾端 O(1);中間 O(n)', '用索引存取、連續區間'],
            ['鏈結串列', 'O(n)', 'O(n)', '已知位置 O(1)', '已知前一個 O(1)', '頻繁在中間插入 / 刪除'],
            ['堆疊', '只看頂端 O(1)', '—', 'push O(1)', 'pop O(1)', '後進先出:括號、最近的、DFS'],
            ['佇列 / deque', '只看兩端 O(1)', '—', 'O(1)', 'O(1)', '先進先出:BFS、排程、滑動視窗'],
            ['Hash 表', '—', '平均 O(1)', '平均 O(1)', '平均 O(1)', '有沒有、出現幾次、對應關係'],
            ['平衡 BST(TreeMap)', '—', 'O(log n)', 'O(log n)', 'O(log n)', '有序、找前驅後繼、範圍查詢'],
            ['Heap', '只看最小 O(1)', 'O(n)', 'O(log n)', '取最小 O(log n)', '不斷拿最小 / 最大、Top-K'],
            ['Trie', '—', 'O(字串長)', 'O(字串長)', 'O(字串長)', '前綴查詢、字典'],
            ['並查集', '—', '找代表 ≈ O(1)', '合併 ≈ O(1)', '不支援', '動態連通性、分群'],
            ['線段樹 / BIT', 'O(log n)', '—', '單點更新 O(log n)', '—', '區間和 / 最大值 + 修改'],
          ],
          note: '「≈ O(1)」是嚴格來說 O(α(n)),α 是成長極慢的函數,實務上當常數。',
        },
      ],
    },
    {
      title: '陣列 vs 鏈結串列',
      blocks: [
        {
          t: 'pre',
          text: `陣列(連續):     [ 3 ][ 7 ][ 1 ][ 9 ]       a[2] 直接算位址 → O(1)
                 0x00 0x04 0x08 0x0C

串列(散落各處): [3|•]──→[7|•]──→[1|•]──→[9|∅]   找第 3 個要從頭走 → O(n)
                                               在 7 後面插入只要改兩個箭頭 → O(1)`,
          caption: '陣列靠「連續」換到 O(1) 存取;串列靠「指標」換到 O(1) 插入,但失去隨機存取。',
        },
        {
          t: 'p',
          text: '實務上陣列幾乎總是比較快(連續記憶體對 CPU 快取友善)。LeetCode 的串列題主要是在考你能不能正確地操作指標:改接之前先存好下一個、用 dummy 頭節點處理邊界、用快慢指標找中點。這些在 [[c:pointers]] 和 [[p:linked-list]] 都有。',
        },
      ],
    },
    {
      title: '堆疊、佇列、雙端佇列',
      blocks: [
        {
          t: 'table',
          cols: ['結構', '規則', '刷題用在哪'],
          rows: [
            ['堆疊(stack)', '後進先出(LIFO):只能動最上面', '括號配對、運算式求值、[[p:monotonic-stack]](下一個更大的數)、遞迴改迭代的 DFS、復原操作'],
            ['佇列(queue)', '先進先出(FIFO):後端進、前端出', '[[p:graph-traversal]] 的 BFS、[[p:tree-bfs]] 層序走訪、[[p:topological-sort]]'],
            ['雙端佇列(deque)', '兩端都能進出', '[[p:monotonic-queue]](滑動視窗最大值)、0-1 BFS'],
          ],
        },
        {
          t: 'note',
          kind: 'key',
          title: '堆疊 = DFS,佇列 = BFS',
          text: '同樣的圖走訪程式碼,把「待處理清單」換成堆疊就是深度優先(一路走到底),換成佇列就是廣度優先(一層一層擴散)。BFS 因為是一層一層,所以第一次到達某點時走的就是最少步數。',
        },
      ],
    },
    {
      title: '怎麼選',
      blocks: [
        {
          t: 'p',
          text: '問自己「我在迴圈裡最常做的那個操作是什麼」,然後挑讓它最快的結構:',
        },
        {
          t: 'table',
          cols: ['最常做的操作', '用', '本站章節'],
          rows: [
            ['用位置取值、處理連續區間', '陣列', '[[p:prefix-sum]]、[[p:sliding-window]]'],
            ['這個值出現過嗎?出現幾次?', 'Hash 集合 / Hash 表', '[[p:hash-map]]'],
            ['找比 x 大的最小值(前驅後繼)、有序走訪', '平衡 BST:TreeMap、`set`、SortedList', '[[p:bst]]'],
            ['不斷拿出目前最小 / 最大', 'Heap', '[[p:heap]]、[[p:two-heaps]]'],
            ['最近加入的那個、配對最近的', '堆疊', '[[p:stack]]'],
            ['先來先處理、一層一層擴散', '佇列', '[[p:graph-traversal]]'],
            ['以某個前綴開頭的單字', 'Trie', '[[p:trie]]'],
            ['兩個點是否連通、動態合併群組', '並查集', '[[p:union-find]]'],
            ['區間和 / 區間最大值,而且陣列會被修改', '線段樹 / BIT', '[[p:segment-tree]]'],
          ],
        },
      ],
    },
  ],
  pitfalls: [
    '用陣列(串列)做「有沒有出現過」的查詢:每次 O(n),整體變 O(n²)。',
    '用陣列頭部當佇列(`pop(0)`、`shift()`),每次出列 O(n)。',
    '需要「有序 + 快速插入刪除」時用排序陣列,每次插入都要 O(n) 挪動。',
    '需要不斷取最小值時每次都 `min()` 掃一遍,而不是用 heap。',
  ],
  quiz: [
    {
      q: '要反覆查詢「這個數字之前有沒有出現過」,該用?',
      options: ['陣列', 'Hash 集合', 'Heap', '堆疊'],
      a: 1,
      why: 'Hash 集合的查詢平均 O(1);陣列要 O(n) 掃一遍。',
    },
    {
      q: '一直有新任務進來,每次都要處理「目前優先度最高」的那個,該用?',
      options: ['佇列', 'Heap', 'Hash 表', '鏈結串列'],
      a: 1,
      why: 'Heap 加入和取出最大(最小)都是 O(log n),正是為這種情況設計的。',
    },
    {
      q: '要找「比 x 大的數裡最小的那個」,而且資料會一直新增刪除,該用?',
      options: ['Hash 表', '平衡 BST(TreeMap / set / SortedList)', '堆疊'],
      a: 1,
      why: 'Hash 表沒有順序;排序陣列插入太慢。平衡 BST 的插入、刪除、找後繼都是 O(log n)。',
    },
    {
      q: '圖上求「最少步數」(每一步代價相同),待處理清單用什麼?',
      options: ['堆疊(DFS)', '佇列(BFS)'],
      a: 1,
      why: 'BFS 一層一層擴散,第一次碰到目標時的層數就是最少步數。DFS 第一次找到的不一定最短。',
    },
  ],
  next: ['stack', 'heap', 'hash-map', 'linked-list', 'trie', 'union-find'],
}

const hashing: Concept = {
  id: 'hashing',
  name: '雜湊表原理',
  level: 2,
  prereq: ['ds-overview'],
  lead:
    'Hash 表是刷題最常用的資料結構,它讓「查找」從 O(n) 變成平均 O(1)。原理是:用一個**雜湊函數**把鍵算成陣列的索引,直接跳過去找。' +
    '懂了原理,就知道它為什麼是「平均」O(1)、什麼東西可以當鍵、以及什麼時候用陣列取代它更好。',
  analogy:
    '像圖書館用書名第一個字分櫃:要找《演算法》就直接去「演」字櫃,不用從第一櫃翻起。如果很多書都是「演」開頭(碰撞),那一櫃就要多翻幾本。',
  sections: [
    {
      title: '雜湊函數:把鍵變成索引',
      blocks: [
        {
          t: 'p',
          text: 'Hash 表底層是一個陣列(每格叫一個「桶」)。要存鍵 k,先算 `hash(k) % 桶數` 得到索引,放進那一格;查詢時算同樣的索引,只看那一格。只要雜湊函數把鍵分得夠平均,每一格只有寥寥幾個元素,查找就是 O(1)。',
        },
        {
          t: 'pre',
          text: `桶數 = 8,hash(k) = k

放入 12 → 12 % 8 = 4      桶 0: []
放入 7  →  7 % 8 = 7      桶 1: [17]
放入 17 → 17 % 8 = 1      桶 2: []
放入 20 → 20 % 8 = 4      桶 3: []
                          桶 4: [12, 20]   ← 碰撞:兩個鍵算到同一格
查 20:算出 4,只看桶 4   桶 5: []
                          桶 6: []
                          桶 7: [7]`,
          caption: '這種「每個桶放一串」的做法叫**鏈結法**(chaining);另一種是碰撞時往旁邊找空格,叫**開放定址法**。',
        },
      ],
    },
    {
      title: '為什麼是「平均」O(1)',
      blocks: [
        {
          t: 'list',
          items: [
            '**碰撞**:不同的鍵算出同一個索引。只要元素數量和桶數的比例(**負載因子**)維持在常數以下,每個桶平均只有常數個元素。',
            '**擴容**:元素多到負載因子超過門檻(例如 0.75)時,桶數加倍、所有元素重新放一次。這一次是 O(n),但和動態陣列一樣,攤銷下來每次插入仍是 O(1)。',
            '**最壞情況**:所有鍵都撞到同一格,退化成 O(n)。正常的鍵幾乎不會發生;但有人故意構造資料時(競賽的「卡 hash」)會發生。LeetCode 上一般不用擔心。',
          ],
        },
        {
          t: 'code',
          title: '一個最小的 Hash 表(鏈結法),看懂它在做什麼',
          code: {
            python: `class MyHashMap:
    def __init__(self, buckets=1024):
        self.b = [[] for _ in range(buckets)]   # 每個桶是一串 (鍵, 值)

    def _slot(self, key):
        return self.b[hash(key) % len(self.b)]

    def put(self, key, val):
        slot = self._slot(key)
        for pair in slot:
            if pair[0] == key:      # 已經有了:更新
                pair[1] = val
                return
        slot.append([key, val])

    def get(self, key):
        for k, v in self._slot(key):
            if k == key:
                return v
        return -1`,
          },
        },
      ],
    },
    {
      title: '什麼可以當鍵',
      blocks: [
        {
          t: 'p',
          text: '鍵必須能算出**穩定的** hash 值:放進去之後不能再變,否則下次算出來的索引不同,就找不到了。這就是 Python 的 `list` 不能當鍵、`tuple` 可以的原因。',
        },
        {
          t: 'table',
          cols: ['想用來當鍵', 'Python', 'Java', 'JavaScript', 'C++'],
          rows: [
            ['整數、字串', '✓', '✓', '✓', '✓'],
            ['一組數字(座標)', '`tuple`', '壓成 `long` 或字串;或自訂 `equals` + `hashCode`', '字串 `"r,c"`', '`map` 可用 `pair`;`unordered_map` 要壓成 `long long`'],
            ['陣列 / 串列', '✗ 轉 `tuple`', '✗(`int[]` 比參考)用 `List` 或字串', '✗(比參考)用字串', '`map<vector<int>, ...>` 可以'],
            ['排序後的字串(分組)', '`"".join(sorted(s))`', '`char[]` 排序後 `new String`', '`[...s].sort().join("")`', '`sort` 後的 `string`'],
          ],
          note: '「分組」題(Group Anagrams 49)的關鍵就是設計一個鍵:同一組的元素算出相同的鍵。除了排序後的字串,也可以用 26 個字母的計數當鍵。',
        },
      ],
    },
    {
      title: '刷題的五種 Hash 用法',
      blocks: [
        {
          t: 'table',
          cols: ['用法', '存什麼', '代表題'],
          rows: [
            ['看過沒有', 'set 存看過的值', 'Contains Duplicate(217)'],
            ['找配對', '值 → 索引,查 `target - x` 在不在', 'Two Sum(1)'],
            ['計數', '值 → 出現次數', 'Valid Anagram(242)、Top K Frequent(347)'],
            ['分組', '特徵鍵 → 一組元素', 'Group Anagrams(49)'],
            ['前綴和 + Hash', '前綴和 → 出現次數 / 最早位置', 'Subarray Sum Equals K(560),見 [[p:prefix-sum]]'],
          ],
        },
        {
          t: 'note',
          kind: 'tip',
          title: '值域小就用陣列',
          text: '鍵是小寫字母(26 種)或範圍很小的整數時,直接開陣列 `cnt[x]` 當 Hash 表用:不用算 hash、沒有碰撞、常數小很多。C 語言更是首選。',
        },
      ],
    },
    {
      title: 'Hash 表 vs 有序表',
      blocks: [
        {
          t: 'table',
          cols: ['', 'Hash 表', '有序表(平衡 BST)'],
          rows: [
            ['查找 / 插入 / 刪除', '平均 O(1)', 'O(log n)'],
            ['依鍵的順序走訪', '✗ 順序不固定', '✓'],
            ['找比 x 大的最小鍵', '✗ 要掃全部', '✓ O(log n)'],
            ['各語言', '`dict`、`unordered_map`、`HashMap`、`Map`', '`SortedDict`、`map`、`TreeMap`'],
          ],
          note: '需要「順序」或「最接近的鍵」時才用有序表,其他時候用 Hash 表。',
        },
      ],
    },
  ],
  pitfalls: [
    '把可變的東西(Python list、Java `int[]`、JS 陣列)當鍵。',
    '以為 Hash 表會保持某種順序:Python `dict` 和 JS `Map` 保留插入順序,但 Java `HashMap`、C++ `unordered_map` 沒有任何保證。',
    '走訪 Hash 表的同時新增或刪除鍵(Python 會丟 RuntimeError、Java 會丟 ConcurrentModificationException)。',
    '值域很小(例如只有字母)卻用 Hash 表,常數大了好幾倍。',
  ],
  quiz: [
    {
      q: 'Hash 表查找「平均」O(1) 的前提是?',
      options: ['鍵已經排序', '鍵被雜湊函數分得夠平均,負載因子維持在常數以下', '鍵都是整數'],
      a: 1,
      why: '每個桶平均只有常數個元素,查找才是 O(1)。所有鍵都撞同一格時退化成 O(n)。',
    },
    {
      q: 'Group Anagrams:要把 "eat"、"tea"、"ate" 分到同一組,Hash 的鍵用什麼?',
      options: ['字串本身', '排序後的字串 "aet"', '字串長度'],
      a: 1,
      why: '字母異位詞排序後完全相同,所以排序後的字串是好的分組鍵。',
    },
    {
      q: 'Python 想用座標 (r, c) 當 dict 的鍵,寫法是?',
      options: ['`d[[r, c]]`', '`d[(r, c)]`', '`d[r][c]`'],
      a: 1,
      why: 'tuple 不可變、可以 hash;list 可變、不能當鍵。',
    },
  ],
  next: ['hash-map', 'prefix-sum', 'trie'],
}

const treeGraphBasics: Concept = {
  id: 'tree-graph-basics',
  name: '樹與圖:術語與表示法',
  level: 1,
  prereq: ['ds-overview', 'recursion'],
  lead:
    '樹和圖的題目佔 LeetCode 很大一部分。開始學演算法之前,先把術語(根、葉、深度、高度、有向、權重、連通分量)和表示法弄清楚:' +
    '題目怎麼把一棵樹寫成 `[3,9,20,null,null,15,7]`、怎麼把一張圖寫成邊的清單,而你要把它轉成什麼樣子才好走訪。',
  sections: [
    {
      title: '樹的術語',
      blocks: [
        {
          t: 'pre',
          text: `        3          ← 根(root),深度 0
       / \\
      9   20       ← 9 是葉(沒有孩子);20 的孩子是 15 和 7
         /  \\
        15   7     ← 深度 2;這棵樹的高度是 2(根到最深葉的邊數)`,
          caption: '深度從根往下數,高度從葉往上數。也有人把「層數」當高度(這棵是 3 層),題目會說清楚。',
        },
        {
          t: 'table',
          cols: ['術語', '意思'],
          rows: [
            ['二元樹', '每個節點最多兩個孩子(左、右)'],
            ['二元搜尋樹(BST)', '左子樹全部 < 節點 < 右子樹全部;中序走訪是排序好的,見 [[p:bst]]'],
            ['完全二元樹', '除了最後一層都填滿,最後一層從左邊填;heap 就是這種形狀,可以用陣列存'],
            ['平衡樹', '每個節點左右子樹高度差不多;高度是 O(log n),所有操作都快'],
            ['子樹', '某個節點和它所有的後代;樹的遞迴就是「對子樹做同樣的事」'],
            ['祖先 / 後代', '往根走會經過的 / 往下走會到的;[[p:lca]] 找兩個節點最近的共同祖先'],
          ],
        },
      ],
    },
    {
      title: 'LeetCode 怎麼寫一棵樹',
      blocks: [
        {
          t: 'p',
          text: '題目裡的 `root = [3,9,20,null,null,15,7]` 是**層序**(一層一層、由左到右)列出節點,`null` 代表那個位置沒有節點。空位的孩子不會再列出來。傳進函式的是建好的 `TreeNode`(根節點),不是這個陣列。',
        },
        {
          t: 'pre',
          text: `[1, null, 2, 3]

  1          1 的左孩子是 null、右孩子是 2
   \\
    2        2 的左孩子是 3(2 的右孩子沒列出來,就是 null)
   /
  3`,
        },
        {
          t: 'table',
          cols: ['走訪順序', '規則', '上面那棵 3/9/20/15/7 的結果'],
          rows: [
            ['前序(preorder)', '根 → 左 → 右', '3, 9, 20, 15, 7'],
            ['中序(inorder)', '左 → 根 → 右', '9, 3, 15, 20, 7'],
            ['後序(postorder)', '左 → 右 → 根', '9, 15, 7, 20, 3'],
            ['層序(level order)', '一層一層', '[3], [9, 20], [15, 7]'],
          ],
          note: '前中後序用 DFS([[p:tree-dfs]]),層序用 BFS([[p:tree-bfs]])。「需要子樹的結果才能算自己」的題目(高度、直徑、平衡)用後序。',
        },
      ],
    },
    {
      title: '圖的術語',
      blocks: [
        {
          t: 'table',
          cols: ['術語', '意思', '題目裡的樣子'],
          rows: [
            ['頂點(vertex / node)與邊(edge)', '點和連線', '城市與道路、課程與先修關係'],
            ['有向 / 無向', '邊有沒有方向', '「a 是 b 的先修」有向;「a 和 b 是朋友」無向'],
            ['權重', '邊上的數字(距離、時間、成本)', '有權重的最短路徑用 [[p:dijkstra]],沒權重用 BFS'],
            ['度數', '連到一個點的邊數;有向圖分入度、出度', '[[p:topological-sort]] 從入度 0 的點開始'],
            ['環', '能走回自己的路徑', '先修關係有環 → 課修不完'],
            ['連通分量', '彼此走得到的一群點', '島嶼數量、朋友圈數量'],
            ['DAG', '有向無環圖', '可以拓撲排序;DAG 上可以做 DP'],
          ],
          note: '**樹是一種特別的圖**:n 個點、n − 1 條邊、連通、沒有環。所以圖的演算法都能用在樹上,只是樹不需要 visited(不會繞回去,只要不走回父節點)。',
        },
      ],
    },
    {
      title: '圖的表示法',
      blocks: [
        {
          t: 'table',
          cols: ['表示法', '長什麼樣', '空間', '什麼時候用'],
          rows: [
            ['邊的清單', '`[[0,1],[1,2],[2,0]]`', 'O(E)', '題目通常這樣給;[[p:union-find]]、[[p:mst]] 的 Kruskal 直接用'],
            ['鄰接串列', '`adj[0] = [1, 2]`:每個點列出鄰居', 'O(V + E)', '**最常用**:BFS、DFS、拓撲排序、Dijkstra'],
            ['鄰接矩陣', '`g[u][v] = 1` 表示有邊', 'O(V²)', '點很少(幾百個)、需要 O(1) 查兩點有沒有邊'],
            ['網格(隱式圖)', '每一格是一個點,上下左右是鄰居', '不必另外存', '島嶼、迷宮、最短路徑網格題'],
          ],
        },
        {
          t: 'code',
          title: '從邊的清單建出鄰接串列(無向圖)',
          code: {
            python: `from collections import defaultdict
adj = defaultdict(list)        # 或 [[] for _ in range(n)]
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)           # 有向圖就只加這一行的上一行`,
            c: `// 先數每個點的度數,再配置(或直接用 n×n 矩陣,n 小時最簡單)
int *deg = calloc(n, sizeof(int));
for (int i = 0; i < edgesSize; i++) { deg[edges[i][0]]++; deg[edges[i][1]]++; }
int **adj = malloc(n * sizeof(int *));
int *len = calloc(n, sizeof(int));
for (int i = 0; i < n; i++) adj[i] = malloc(deg[i] * sizeof(int));
for (int i = 0; i < edgesSize; i++) {
    int u = edges[i][0], v = edges[i][1];
    adj[u][len[u]++] = v;
    adj[v][len[v]++] = u;
}`,
            cpp: `vector<vector<int>> adj(n);
for (auto& e : edges) {
    adj[e[0]].push_back(e[1]);
    adj[e[1]].push_back(e[0]);
}`,
            java: `List<List<Integer>> adj = new ArrayList<>();
for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
for (int[] e : edges) {
    adj.get(e[0]).add(e[1]);
    adj.get(e[1]).add(e[0]);
}`,
            javascript: `const adj = Array.from({ length: n }, () => []);
for (const [u, v] of edges) {
  adj[u].push(v);
  adj[v].push(u);
}`,
          },
        },
        {
          t: 'p',
          text: '有權重時每個鄰居存成一對 `(鄰居, 權重)`。圖可能有環,所以走訪時一定要有 `visited` 記錄走過的點,否則會無限繞圈 —— 這是圖和樹最大的差別。',
        },
      ],
    },
  ],
  pitfalls: [
    '把 `[3,9,20,null,null,15,7]` 當成「索引 i 的孩子在 2i+1、2i+2」:LeetCode 的格式會省略空位的孩子,只有完全二元樹才符合這個公式。',
    '圖的走訪忘了 `visited`,遇到環就無限迴圈。',
    '無向圖建鄰接串列只加了一個方向。',
    '點的編號從 1 開始(題目常見),陣列卻只開 n 格。',
    '深度和高度搞混,或「邊數」和「層數」差一。',
  ],
  quiz: [
    {
      q: '一棵有 n 個節點的樹,有幾條邊?',
      options: ['n', 'n − 1', 'n + 1', '不一定'],
      a: 1,
      why: '除了根,每個節點都恰好有一條邊連到父節點。',
    },
    {
      q: '中序走訪(左 → 根 → 右)一棵二元搜尋樹,得到的順序是?',
      options: ['隨機', '由小到大排序', '由大到小排序'],
      a: 1,
      why: 'BST 的定義就是左 < 根 < 右,中序剛好照這個順序輸出。',
    },
    {
      q: '圖有 10⁵ 個點、2×10⁵ 條邊,該用哪種表示法?',
      options: ['鄰接矩陣', '鄰接串列'],
      a: 1,
      why: '鄰接矩陣要 10¹⁰ 格,放不下;鄰接串列只要 O(V + E)。',
    },
    {
      q: '在圖上做 DFS 一定要有 visited,在樹上為什麼通常不用?',
      options: ['樹比較小', '樹沒有環,只要不走回父節點就不會重複', '樹不能做 DFS'],
      a: 1,
      why: '樹從根往下走,每個節點只會被它的父節點走到一次。',
    },
  ],
  next: ['tree-dfs', 'tree-bfs', 'bst', 'graph-traversal', 'topological-sort'],
}

export const STRUCTURES: Concept[] = [dsOverview, hashing, treeGraphBasics]
