// 分類的「總結章」:讀完一整個分類後,把各演算法放在一起比、教怎麼選。
// key 是 data/categories.ts 的分類 id;頁面在 #/s/<分類 id>,排在該分類最後一章之後。

import type { Lang } from '../types'

export interface Summary {
  /** 一段話總結整個分類 */
  lead: string
  /** 總表:每列一個演算法,cells 和 cols 一一對應 */
  table: { cols: string[]; rows: { id: string; cells: string[] }[]; note: string }
  /** 動畫比較:同一份輸入讓每個演算法並排跑;presets 是可一鍵切換的情境 */
  race?: { intro: string; presets: { label: string; values: Record<string, string> }[] }
  /** 怎麼選:由上往下問,第一個答「是」的就用它;id 為 null 表示不必手寫 */
  decide: { q: string; id: string | null; why: string }[]
  /** 家族:哪幾個其實是同一個想法 */
  families: { name: string; ids: string[]; desc: string }[]
  /** 讀完整個分類才看得到的觀念 */
  insights: { title: string; body: string }[]
  /** 各語言內建的做法 */
  builtins: { lang: Lang; api: string; algo: string; note: string }[]
  /** 內建排序 + 自訂比較的範例,五種語言 */
  example: { title: string; code: Record<Lang, string> }
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
    builtins: [
      { lang: 'python', api: 'a.sort(key=...) / sorted(a, key=...)', algo: 'Timsort(合併 + 插入)', note: '穩定。用 key 回傳 tuple 做多條件,要反向就對數字取負號或 reverse=True。' },
      { lang: 'c', api: 'qsort(a, n, sizeof a[0], cmp)', algo: '標準沒規定', note: '不保證穩定。比較函式回傳負 / 0 / 正;別寫 return x - y,大數相減會溢位。' },
      { lang: 'cpp', api: 'sort(a.begin(), a.end(), cmp)', algo: 'Introsort(快排 + 堆積 + 插入)', note: '不穩定;要穩定用 stable_sort。cmp 必須是嚴格小於,寫成 <= 可能當掉。' },
      { lang: 'java', api: 'Arrays.sort / Collections.sort', algo: 'int[] 用雙軸快排;物件用 TimSort', note: 'int[] 不穩定,而且不能傳比較器,要先轉 Integer[]。比較 Integer 要用 equals 或先拆箱,不能用 ==。' },
      { lang: 'javascript', api: 'a.sort((x, y) => x - y)', algo: 'V8 用 Timsort', note: 'ES2019 起規定穩定。不傳比較函式會把數字當字串比:[10, 9, 1].sort() 得到 [1, 10, 9]。' },
    ],
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
}
