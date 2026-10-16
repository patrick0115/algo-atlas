// 分類的「總結章」:讀完一整個分類後,把各演算法放在一起比、教怎麼選。
// key 是 data/categories.ts 的分類 id;頁面在 #/s/<分類 id>,排在該分類最後一章之後。
// 文字欄位可用和觀念章相同的行內標記(`程式碼`、**粗體**、[[c:id]]、[[p:id]])。

import type { Lang } from '../types'

export interface Summary {
  /** 一段話總結整個分類 */
  lead: string
  /** 總表:每列一個演算法,cells 和 cols 一一對應 */
  table: { cols: string[]; rows: { id: string; cells: string[] }[]; note: string }
  /** 動畫比較:同一份輸入讓每個演算法並排跑;presets 是可一鍵切換的情境 */
  race?: { intro: string; presets: { label: string; values: Record<string, string> }[] }
  /** 怎麼選:由上往下問,第一個答「是」的就用它;id 為 null 表示沒有對應的演算法,顯示 fallback */
  decide: { q: string; id: string | null; why: string }[]
  /** decide 最後一步(id 為 null)顯示的文字 */
  fallback: string
  /** 家族:哪幾個其實是同一個想法(可以跨分類) */
  families: { name: string; ids: string[]; desc: string }[]
  /** 讀完整個分類才看得到的觀念 */
  insights: { title: string; body: string }[]
  /** 各語言內建的做法;有的分類沒有對應的內建函式就省略 */
  builtins?: { title: string; items: { lang: Lang; api: string; algo: string; note: string }[] }
  /** 內建函式 + 自訂規則的範例,五種語言 */
  example?: { title: string; code: Record<Lang, string> }
  /** LeetCode 上怎麼考:每種考法配幾題代表題 */
  uses: { title: string; desc: string; problems: number[] }[]
  /** 自我測驗:情境 → 該選哪個演算法 */
  quiz: { q: string; a: string; why: string }[]
  interview: string[]
}

export const SUMMARIES: Record<string, Summary> = {
  sorting: {
    lead:
      '七種排序學完,真正要帶走的不是七段程式碼,而是一張表和一個判斷順序:題目要什麼(全排?只要第 k 個?要穩定?值域多大?),就決定用哪一種。' +
      '而在 LeetCode 上,九成的時候答案是「直接呼叫內建 sort,把心力放在比較規則和排完之後要做什麼」。',
    table: {
      cols: ['最好', '平均', '最壞', '額外空間', '穩定', '一句話'],
      rows: [
        { id: 'bubble-sort', cells: ['O(n)', 'O(n²)', 'O(n²)', 'O(1)', '穩定', '教學用;交換次數恰好 = 逆序對數'] },
        { id: 'selection-sort', cells: ['O(n²)', 'O(n²)', 'O(n²)', 'O(1)', '不穩定', '交換最少,只要 n−1 次'] },
        { id: 'insertion-sort', cells: ['O(n)', 'O(n²)', 'O(n²)', 'O(1)', '穩定', '很小或幾乎排好時最快,內建排序的零件'] },
        { id: 'merge-sort', cells: ['O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', '穩定', '最壞也保證,能邊合併邊計數'] },
        { id: 'quick-sort', cells: ['O(n log n)', 'O(n log n)', 'O(n²)', 'O(log n)', '不穩定', '實務常數最小;partition 可做快速選擇'] },
        { id: 'heap-sort', cells: ['O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)', '不穩定', '最壞保證又原地,但快取不友善'] },
        { id: 'counting-sort', cells: ['O(n + k)', 'O(n + k)', 'O(n + k)', 'O(n + k)', '穩定*', '不比較;k 是值域大小'] },
      ],
      note: '* 計數排序要用「前綴和 + 從右往左放」的版本才穩定;只輸出數字的簡易版不涉及穩定性。快速排序的 O(log n) 是遞迴深度,前提是隨機 pivot。',
    },
    race: {
      intro:
        '同一組數字,七種排序一起跑。先看「一般」,再切到「已排好」和「反序」:氣泡、插入在已排好時幾步就結束,反序時卻掉到最後面;' +
        '快速排序反過來,已排好時最慢(pivot 每次都選到極端值,切不開);堆積排序不管輸入長怎樣步數都差不多;計數排序不比較,一直最快。',
      presets: [
        { label: '一般', values: { nums: '5,1,4,2,8,3,9,6' } },
        { label: '已排好', values: { nums: '1,2,3,4,5,6,7,8' } },
        { label: '反序', values: { nums: '8,7,6,5,4,3,2,1' } },
        { label: '很多重複', values: { nums: '3,1,3,2,1,3,2,1' } },
      ],
    },
    decide: [
      { q: '不用全部排好,只要第 k 大 / 前 k 個?', id: 'quick-sort', why: '快速選擇平均 O(n);資料是串流或 k 很小時改用大小 k 的 heap,O(n log k)。' },
      { q: '值是小範圍的整數(字母、分數 0..100、頻率 ≤ n)?', id: 'counting-sort', why: '值域 k 不大於 n 的量級時 O(n + k),比任何比較排序都快。' },
      { q: '排的是鏈結串列?', id: 'merge-sort', why: '串列不能隨機存取,快排和堆積都吃虧;合併只需要改指標。' },
      { q: '要在排序的過程中「數」東西(逆序對、右邊比我小的有幾個)?', id: 'merge-sort', why: '合併的那一刻,左右兩半的大小關係全部攤在眼前,順手就能累加。' },
      { q: '資料很少(十幾個)或幾乎已經排好?', id: 'insertion-sort', why: '移動次數 = 逆序對數,幾乎排好時接近 O(n),而且常數極小。' },
      { q: '只能用 O(1) 額外空間,又不能接受最壞 O(n²)?', id: 'heap-sort', why: '七種裡唯一同時做到「原地」和「最壞 O(n log n)」的。' },
      { q: '以上都不是', id: null, why: '直接用語言內建的 sort,把力氣花在 key / 比較函式上(見下方「內建排序」)。' },
    ],
    fallback: '語言內建 sort',
    families: [
      {
        name: '每輪選出一個極值',
        ids: ['selection-sort', 'heap-sort'],
        desc: '兩者都是「從未排序區挑出最大 / 最小,放到定位」。差別只在怎麼挑:線性掃描 O(n),或用 heap O(log n)。堆積排序 = 用 heap 加速的選擇排序。',
      },
      {
        name: '把有序的部分越做越大',
        ids: ['insertion-sort', 'merge-sort'],
        desc: '插入排序一次併進一個元素,合併排序一次併進一整段。Python / Java 的 Timsort 就是兩者合體:短段用插入排序,再一路合併。',
      },
      {
        name: '相鄰交換與逆序對',
        ids: ['bubble-sort', 'merge-sort'],
        desc: '氣泡排序的交換次數恰好等於逆序對數。所以題目問「最少要幾次相鄰交換」,其實是在數逆序對 —— n 大時用合併排序在 O(n log n) 數完。',
      },
      {
        name: '切分(partition)',
        ids: ['quick-sort'],
        desc: '選一個 pivot,把陣列切成「比它小 / 比它大」。只遞迴一邊是快速選擇;切成三段是荷蘭國旗;用條件取代 pivot 就是奇偶分組、把 0 移到後面。',
      },
      {
        name: '不比較,直接放',
        ids: ['counting-sort'],
        desc: '計數、桶、基數排序都靠「值本身就是位置」來跳過比較。代價是依賴值域:值域太大或不是整數就用不了。',
      },
    ],
    insights: [
      {
        title: '為什麼比較排序最快只到 n log n',
        body: 'n 個數有 n! 種排列,每做一次比較最多把可能性砍一半,所以至少要比 log₂(n!) ≈ n log n 次。合併、快排、堆積都已經碰到這個下界;想更快只能像計數排序一樣「不比較」。',
      },
      {
        title: '穩定性什麼時候重要',
        body: '要依多個條件排序、又想分好幾次排的時候:先依次要條件排,再用穩定排序依主要條件排,次要條件的順序就會保留下來。在 LeetCode 上通常直接用 tuple 或比較函式一次比完,就不必依賴穩定性。',
      },
      {
        title: 'O(n²) 的排序不是沒用',
        body: 'n 很小時常數比漸近複雜度重要。Timsort 和 C++ 的 introsort 都在小區段改用插入排序;選擇排序的「寫入最少」在寫入很貴的媒體上仍有價值。',
      },
      {
        title: '排序最常見的角色是「前處理」',
        body: '排完之後才能用雙指標、貪心、二分搜尋、合併區間。這時排序的 O(n log n) 往往就是整題的瓶頸:n ≤ 10⁵ 時放心排,n 到 10⁷ 以上或要求 O(n) 時才考慮計數 / 桶。',
      },
    ],
    builtins: {
      title: '內建排序',
      items: [
        { lang: 'python', api: 'a.sort(key=...) / sorted(a, key=...)', algo: 'Timsort(合併 + 插入)', note: '穩定。用 key 回傳 tuple 做多條件,要反向就對數字取負號或 reverse=True。' },
        { lang: 'c', api: 'qsort(a, n, sizeof a[0], cmp)', algo: '標準沒規定', note: '不保證穩定。比較函式回傳負 / 0 / 正;別寫 return x - y,大數相減會溢位。' },
        { lang: 'cpp', api: 'sort(a.begin(), a.end(), cmp)', algo: 'Introsort(快排 + 堆積 + 插入)', note: '不穩定;要穩定用 stable_sort。cmp 必須是嚴格小於,寫成 <= 可能當掉。' },
        { lang: 'java', api: 'Arrays.sort / Collections.sort', algo: 'int[] 用雙軸快排;物件用 TimSort', note: 'int[] 不穩定,而且不能傳比較器,要先轉 Integer[]。比較 Integer 要用 equals 或先拆箱,不能用 ==。' },
        { lang: 'javascript', api: 'a.sort((x, y) => x - y)', algo: 'V8 用 Timsort', note: 'ES2019 起規定穩定。不傳比較函式會把數字當字串比:[10, 9, 1].sort() 得到 [1, 10, 9]。' },
      ],
    },
    example: {
      title: '依出現次數由少到多,次數相同時數字大的在前(LeetCode 1636)',
      code: {
        python: `from collections import Counter

cnt = Counter(nums)
nums.sort(key=lambda x: (cnt[x], -x))   # tuple:先比次數,再比 -x`,
        c: `static int cnt[201];                    // 值域 -100..100,位移 100

int cmp(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    if (cnt[x + 100] != cnt[y + 100])
        return cnt[x + 100] < cnt[y + 100] ? -1 : 1;
    return x > y ? -1 : (x < y);       // 次數相同:大的在前
}

for (int i = 0; i < n; i++) cnt[nums[i] + 100]++;
qsort(nums, n, sizeof(int), cmp);`,
        cpp: `unordered_map<int, int> cnt;
for (int x : nums) cnt[x]++;
sort(nums.begin(), nums.end(), [&](int a, int b) {
    if (cnt[a] != cnt[b]) return cnt[a] < cnt[b];
    return a > b;                       // 嚴格比較,不能寫 >=
});`,
        java: `Map<Integer, Integer> cnt = new HashMap<>();
for (int x : nums) cnt.merge(x, 1, Integer::sum);
Integer[] a = Arrays.stream(nums).boxed().toArray(Integer[]::new);
Arrays.sort(a, (x, y) -> {
    int cx = cnt.get(x), cy = cnt.get(y);    // 先拆箱再比
    return cx != cy ? Integer.compare(cx, cy) : Integer.compare(y, x);
});`,
        javascript: `const cnt = new Map();
for (const x of nums) cnt.set(x, (cnt.get(x) ?? 0) + 1);
nums.sort((a, b) => cnt.get(a) - cnt.get(b) || b - a);`,
      },
    },
    uses: [
      { title: '直接考手寫排序', desc: '禁止內建時要能寫出 O(n log n):快排記得隨機 pivot,串列用合併。', problems: [912, 148, 147] },
      { title: '只要第 k 個 / 前 k 個', desc: '不必全排:快速選擇、大小 k 的 heap,或依頻率分桶。', problems: [215, 973, 347] },
      { title: '值域很小 → 計數', desc: '三種顏色、26 個字母、值 ≤ 1000、引用數截到 n。', problems: [75, 1122, 274, 451] },
      { title: '邊合併邊計數', desc: '「右邊比我小的有幾個」「i < j 且 a[i] > 2a[j]」都是合併排序的副產品。', problems: [315, 493, 327] },
      { title: '自訂比較規則', desc: '難點不在排序,在於比較函式:必須有遞移性,才能保證排得出來。', problems: [179, 1636] },
      { title: '排序當前處理', desc: '排完才能雙指標、貪心或合併。題目沒說「保持原順序」時,先問自己排序後會不會變簡單。', problems: [15, 56, 435] },
    ],
    quiz: [
      { q: '一百萬筆考試分數(0~100 的整數),要由小到大排好。', a: 'counting-sort', why: '值域只有 101,O(n + k) 一趟搞定,比任何 n log n 都快。' },
      { q: '把一條鏈結串列排好,要求 O(n log n)。', a: 'merge-sort', why: '串列找中點用快慢指標,合併只改指標,不需要隨機存取。' },
      { q: '在未排序陣列中找第 k 大的數,希望平均 O(n)。', a: 'quick-sort', why: '快速選擇:partition 後只往第 k 個所在的那一半遞迴。' },
      { q: '一份原本排好的名單,只有零星幾筆被改過、位置跑掉了。', a: 'insertion-sort', why: '移動次數 = 逆序對數,幾乎排好時接近 O(n)。' },
      { q: '嵌入式裝置,幾乎沒有額外記憶體,而且絕對不能出現 O(n²)。', a: 'heap-sort', why: '唯一同時做到原地 O(1) 和最壞 O(n log n)。' },
      { q: '十萬筆已依姓名排好的學生,要改依班級排,同班的人仍照姓名順序。', a: 'merge-sort', why: '需要穩定、又要 O(n log n) —— 合併排序(或內建的 Timsort)。' },
      { q: 'n ≤ 10⁵,問最少要做幾次「相鄰交換」才能把陣列排好。', a: 'merge-sort', why: '相鄰交換次數 = 逆序對數;氣泡排序直接模擬是 O(n²) 會超時,改用合併排序數逆序對。' },
      { q: '資料存在寫入次數有限的快閃記憶體上,想讓寫入次數越少越好。', a: 'selection-sort', why: '只做 n−1 次交換,是七種裡寫入最少的。' },
      { q: '只能交換「相鄰且二進位 1 的個數相同」的兩個數,問能不能排好(LeetCode 3011)。', a: 'bubble-sort', why: '規則本身就是氣泡排序的相鄰交換:同組的數能任意互換,只要每組的最大值 ≤ 下一組的最小值。' },
    ],
    interview: [
      '把總表的「平均、最壞、空間、穩定」四欄背起來,被問到任何一種都能立刻答。',
      '被問「哪個排序最快」:沒有唯一答案 —— 平均常數快排最小但最壞 O(n²),要穩定用合併,值域小用計數。',
      '說得出自己慣用語言的內建排序是什麼、穩不穩定(Python Timsort 穩定;C++ sort 不穩定)。',
      '比較排序下界一句話:n! 種排列,每次比較最多砍一半,所以 Ω(n log n)。',
      '寫比較函式要嚴格(< 而不是 <=)、不要用相減(溢位),並確保有遞移性。',
    ],
  },
  array: {
    lead:
      '這一章的五個工具處理的都是「一排資料」:[[p:two-pointers]] 和 [[p:sliding-window]] 用幾個位置變數一次掃完,[[p:prefix-sum]] 和 [[p:difference-array]] 先把累積量算好,' +
      '[[p:simulation]] 則是照規則小心地走索引。共同目標都是把暴力的 O(n²) 壓成 O(n)。而「指標」這個想法不只出現在這章 —— 串列的快慢指標、合併排序的合併、二分搜尋的 lo / hi 都是同一家人,下面的「家族」會把它們放在一起。' +
      '還不熟 C / C++ 的指標或「指標」這兩個字的兩層意思,先讀 [[c:pointers]]。',
    table: {
      cols: ['時間', '額外空間', '前提', '一句話'],
      rows: [
        { id: 'two-pointers', cells: ['O(n)(要先排序就 O(n log n))', 'O(1)', '已排序,或左右兩端有單調關係', '每一步排除一個不可能的答案'] },
        { id: 'sliding-window', cells: ['O(n)', 'O(1) ~ O(字元種類)', '條件有單調性(例如全是正數)', '連續區間的最長 / 最短 / 個數'] },
        { id: 'prefix-sum', cells: ['建表 O(n),每次查詢 O(1)', 'O(n)', '陣列建好後不再修改', '任意區間和 = 兩個前綴相減'] },
        { id: 'difference-array', cells: ['O(n + 修改次數)', 'O(n)', '修改全部做完才查詢', '區間加值只要改兩格'] },
        { id: 'simulation', cells: ['O(格子數)', 'O(1) ~ O(n)', '無', '照規則走;難在邊界與方向'] },
      ],
      note: '前綴和配上 Hash 表(「和為 k 的子陣列」)時,額外空間是 O(n) 的 Hash 表;滑動視窗遇到負數失效時就是改用這招。',
    },
    decide: [
      { q: '資料有序(或可以先排序),要找一對 / 三個數滿足某個條件?', id: 'two-pointers', why: '對撞指標每一步排除一個不可能的元素,O(n)。沒排序、又要回傳原本的索引時,改用 [[p:hash-map]]。' },
      { q: '要原地刪除、去重、把某類元素移到一邊?', id: 'two-pointers', why: '同向讀寫指標:讀的每步走,寫的只在保留元素時走,O(1) 空間。' },
      { q: '找「連續」子陣列 / 子字串的最長、最短或個數,而且條件有單調性(例如全是正數)?', id: 'sliding-window', why: '右邊擴張、不合法時左邊收縮,兩個指標都只往前,O(n)。' },
      { q: '要反覆問區間和,或「和為 k 的子陣列」(可能有負數)?', id: 'prefix-sum', why: '區間和變成兩個前綴相減;配 Hash 表查「之前出現過幾次 prefix − k」,有負數也成立。' },
      { q: '有很多次「把一段區間都加上 v」,最後才問結果?(或:很多個時段重疊,問同時最多幾個)', id: 'difference-array', why: '每次修改只動兩格,最後做一次前綴和還原,O(n + q)。掃描線也是同一招。' },
      { q: '題目把規則講得很清楚(螺旋走訪、旋轉矩陣、遊戲規則)?', id: 'simulation', why: '沒有巧妙的演算法,重點是用邊界變數或方向陣列,讓每一格恰好處理一次。' },
      { q: '以上都不是', id: null, why: '寫出暴力解,找出它在重複做什麼,再對照 [[c:optimization]] 的工具表。' },
    ],
    fallback: '從暴力解找瓶頸',
    families: [
      {
        name: '對撞:一頭一尾往中間',
        ids: ['two-pointers', 'binary-search'],
        desc: '兩者都維護一個「答案只可能在這裡」的區間 [lo, hi],每一步縮小它。差別在縮多少:對撞指標每步丟掉一個元素(O(n)),二分搜尋每步丟掉一半(O(log n),但需要能直接比中間)。',
      },
      {
        name: '同向:一快一慢',
        ids: ['two-pointers', 'sliding-window', 'fast-slow'],
        desc: '讀寫指標是最簡單的同向指標;當兩個指標**中間那一段**本身就是要維護的狀態,它就叫滑動視窗;把同一個想法搬到鏈結串列上、讓兩個指標速度不同,就是快慢指標(找中點、找環)。',
      },
      {
        name: '兩個序列各一個指標',
        ids: ['two-pointers', 'merge-sort'],
        desc: '兩個有序序列各放一個指標,每次比較後讓較小的那個前進 —— 這就是 [[p:merge-sort]] 的合併步驟。Merge Sorted Array(88)、Interval List Intersections(986)、判斷子序列(392)都是它。',
      },
      {
        name: '累積量:前綴與差分',
        ids: ['prefix-sum', 'difference-array'],
        desc: '差分陣列做一次前綴和就還原成原陣列,兩者互為逆運算。前綴和讓「區間查詢」便宜,差分讓「區間修改」便宜;兩種都要頻繁出現時,升級成 [[p:segment-tree]]。',
      },
      {
        name: '連續區間的三種解法',
        ids: ['sliding-window', 'prefix-sum', 'hash-map'],
        desc: '全是正數:滑動視窗 O(1) 空間。有負數:前綴和 + Hash 表,查「之前出現過的 prefix − k」。只要固定長度:視窗每步加一個、減一個。',
      },
    ],
    insights: [
      {
        title: '「指標」有兩層意思',
        body: 'C / C++ 的指標是「存位址的變數」(`int *p`);演算法裡的指標是「記住位置的變數」,在陣列上就是**索引**,在串列上是**節點參考**。這章的所有技巧在 Python、Java、JS 裡都只是幾個整數變數。兩層意思的對照見 [[c:pointers]]。',
      },
      {
        title: '為什麼 for 裡面套 while 還是 O(n)',
        body: '雙指標和滑動視窗的指標**只往前、不回頭**。整個程式跑完,左指標總共最多走 n 步、右指標也是,所以總工作量是 O(n),不是每一輪 O(n)。這叫攤銷分析,見 [[c:complexity-analysis]]。',
      },
      {
        title: '單調性是共同的前提',
        body: '對撞指標能丟掉元素,是因為「和太小時,左邊這個數配誰都太小」;滑動視窗能收縮,是因為「視窗變大,和只會變大」。前提一消失(沒排序、有負數),這些技巧就會給出錯誤答案 —— 這時改用 Hash 表或前綴和。',
      },
      {
        title: '統一用半開區間,off-by-one 少一半',
        body: '前綴和開 n + 1 格(`pre[0] = 0`),區間 [l, r] 的和就是 `pre[r + 1] − pre[l]`;差分陣列也開 n + 1 格,`diff[r + 1]` 才不會越界。視窗長度是 `r − l + 1`(閉區間)還是 `r − l`(半開),整份程式只選一種。',
      },
    ],
    uses: [
      { title: '對撞雙指標', desc: '有序陣列找配對、回文判斷、夾擠出最大面積。', problems: [167, 15, 11, 125, 42] },
      { title: '同向讀寫指標', desc: '原地去重、移除、分區;寫指標永遠指向「下一個要放的位置」。', problems: [26, 27, 283, 75] },
      { title: '滑動視窗', desc: '最長不重複、最短覆蓋、固定長度的計數比對。', problems: [3, 209, 76, 424, 438] },
      { title: '前綴和(+ Hash)', desc: '區間和查詢、和為 k 的子陣列、左右前綴積。', problems: [303, 238, 560, 525, 974] },
      { title: '差分 / 掃描線', desc: '大量區間加值、同時在場人數、會議室。', problems: [1109, 1094, 253] },
      { title: '模擬', desc: '螺旋、旋轉、原地標記;先想清楚邊界再寫。', problems: [54, 48, 73, 289] },
    ],
    quiz: [
      { q: '已排序的陣列,找兩個數加起來等於 target,要求 O(1) 額外空間。', a: 'two-pointers', why: '有序 → 和太小移左、太大移右,每步排除一個數。' },
      { q: '找字串中「不含重複字元」的最長子字串。', a: 'sliding-window', why: '連續 + 最長 + 「出現重複就縮左邊」有單調性。' },
      { q: '陣列有正有負,數有幾個連續子陣列的和剛好是 k。', a: 'prefix-sum', why: '有負數 → 視窗失去單調性;前綴和 + Hash 表查 prefix − k 出現過幾次。' },
      { q: '有 10⁴ 筆航班預訂,每筆把第 l 到 r 班加上 s 個座位,最後輸出每班的座位數。', a: 'difference-array', why: '每筆只改 diff[l] 和 diff[r + 1],最後一次前綴和。' },
      { q: '把 m×n 矩陣依順時針螺旋順序輸出。', a: 'simulation', why: '用上下左右四條邊界描述還沒走的矩形,走完一條就內縮。' },
      { q: '原地把所有 0 移到陣列尾端,其他元素保持原本的相對順序。', a: 'two-pointers', why: '同向讀寫指標:非零元素依序寫到寫指標的位置,最後補 0。' },
      { q: '全是正整數的陣列,找總和 ≥ target 的最短連續子陣列長度。', a: 'sliding-window', why: '正數保證「視窗變大和變大」,一旦 ≥ target 就縮左邊找更短的。' },
      { q: '一個不會被修改的陣列,有 10⁴ 次「問 [l, r] 的總和」。', a: 'prefix-sum', why: '建一次前綴和,之後每次查詢 O(1)。' },
      { q: '一堆會議的開始與結束時間,問同一時刻最多有幾場會議。', a: 'difference-array', why: '開始 +1、結束 −1,依時間掃描取前綴和的最大值(掃描線)。也可以排序後用 heap。' },
    ],
    interview: [
      '用雙指標時一定要說出「為什麼可以丟掉這個元素」—— 那就是正確性證明。',
      '被問複雜度時用攤銷說明:兩個指標各自最多走 n 步,所以 O(n)。',
      '先問清楚:陣列有排序嗎?有負數嗎?可以修改原陣列嗎?這三個答案決定了用哪個工具。',
      '前綴和的 Hash 版本記得先放 `{0: 1}`(空前綴),不然會漏掉從頭開始的子陣列。',
      '滑動視窗遇到「恰好 K 個」不單調時,拆成「最多 K 個 − 最多 K−1 個」。',
    ],
  },
}
