// 講義的「專業層」:白話與動畫之後,往面試 / 競賽程度再推一步。
// 每個演算法一筆,id 要和 data/categories.ts 一致(tests/data.test.ts 會檢查)。

export interface ProNote {
  /** 1 入門 · 2 中階 · 3 進階 */
  level: 1 | 2 | 3
  /** 建議先讀的演算法 id */
  prereq: string[]
  /** 為什麼正確:不變量或證明要點 */
  invariant: string
  /** 通用模板(Python),背起來可以直接套 */
  template: string
  /** 常見變形:名稱 + 和基本版差在哪 */
  variants: { name: string; desc: string }[]
  /** 和相近演算法的比較 */
  compare: { id: string; diff: string }[]
  /** 面試時怎麼講、常被追問什麼 */
  interview: string[]
}

export const LEVEL_NAME = { 1: '入門', 2: '中階', 3: '進階' } as const

export const PRO: Record<string, ProNote> = {
  // ===== 排序 =====
  'bubble-sort': {
    level: 1,
    prereq: [],
    invariant: '第 i 輪結束後,陣列最右邊 i 格是全體中最大的 i 個數,而且已經排好。因為每一輪「目前最大的數」在比較中一路被往右換,不會被任何數擋住。',
    template: `def bubble_sort(a):
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:   # 一輪沒交換 = 已排好
            break`,
    variants: [
      { name: '雞尾酒排序', desc: '左右來回各掃一趟,小的數也能快速往左移。' },
      { name: '最少相鄰交換次數', desc: '氣泡排序的交換次數恰好等於逆序對數,大資料改用合併排序計數。' },
    ],
    compare: [
      { id: 'insertion-sort', diff: '同樣 O(n²) 且穩定,但插入排序的「移動」比交換便宜,實務上幾乎總是比較快。' },
      { id: 'selection-sort', diff: '選擇排序每輪只交換一次,交換次數 O(n);氣泡排序最多 O(n²) 次交換。' },
    ],
    interview: ['穩定排序:相等的數只在嚴格大於時才交換,不會改變相對順序', '被問最好情況時要提「提早結束」才有 O(n)'],
  },
  'selection-sort': {
    level: 1,
    prereq: [],
    invariant: '第 i 輪結束後,前 i 格是全體最小的 i 個數並且已排好;未排序區的每個數都 >= 已排序區的最後一個。',
    template: `def selection_sort(a):
    n = len(a)
    for i in range(n - 1):
        m = i
        for j in range(i + 1, n):
            if a[j] < a[m]:
                m = j
        a[i], a[m] = a[m], a[i]`,
    variants: [
      { name: '雙向選擇', desc: '同一輪同時找最小和最大,放到兩端,輪數減半。' },
      { name: '寫入次數最少', desc: '只做 n−1 次交換,適合「寫入很貴」的儲存媒體(例如快閃記憶體)。' },
    ],
    compare: [
      { id: 'heap-sort', diff: '堆積排序就是「用 heap 加速的選擇排序」:找最小值從 O(n) 降到 O(log n)。' },
      { id: 'bubble-sort', diff: '比較次數一樣約 n²/2,但選擇排序交換少得多。' },
    ],
    interview: ['不穩定:長距離交換會打亂相等元素的順序(例 [2a, 2b, 1])', '無論輸入如何都是 Θ(n²),沒有最好情況'],
  },
  'insertion-sort': {
    level: 1,
    prereq: [],
    invariant: '處理第 i 個數之前,a[0..i−1] 已經排好(但不一定是最終位置)。把 a[i] 插進正確位置後,a[0..i] 也排好。',
    template: `def insertion_sort(a):
    for i in range(1, len(a)):
        x, j = a[i], i - 1
        while j >= 0 and a[j] > x:
            a[j + 1] = a[j]      # 往右挪,不是交換
            j -= 1
        a[j + 1] = x`,
    variants: [
      { name: '二分插入', desc: '用二分找插入點,比較降到 O(n log n),但搬移仍是 O(n²)。' },
      { name: '希爾排序', desc: '先用大間距做插入排序,再逐步縮小間距,打破 O(n²)。' },
      { name: '線上排序', desc: '資料一筆一筆來、隨時要保持有序時,插入排序最自然。' },
    ],
    compare: [
      { id: 'merge-sort', diff: 'Python 的 Timsort、Java 的物件排序都在小區段(約 32 個以下)改用插入排序,因為常數小。' },
      { id: 'bubble-sort', diff: '一樣穩定、一樣 O(n²),但移動次數 = 逆序對數,幾乎排好時接近 O(n)。' },
    ],
    interview: ['時間 = O(n + 逆序對數),這是它在「幾乎排好」時特別快的精確說法', '穩定、原地、線上 —— 三個性質要能一次說出來'],
  },
  'merge-sort': {
    level: 2,
    prereq: ['insertion-sort'],
    invariant: '合併時,兩個指標左邊的元素都已經按順序寫進輸出;因為兩半各自已排好,目前兩個指標指的數中較小的那個,一定是剩下所有數裡最小的。',
    template: `def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    L, R = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(L) and j < len(R):
        if L[i] <= R[j]:          # <= 保持穩定
            out.append(L[i]); i += 1
        else:
            out.append(R[j]); j += 1
    return out + L[i:] + R[j:]`,
    variants: [
      { name: '逆序對計數', desc: '合併時右半的數先被取出,代表它比左半剩下的 len(L) − i 個數都小,累加即可(LeetCode 493、315)。' },
      { name: '合併 k 個有序串列', desc: '兩兩合併或用 heap,O(N log k)(LeetCode 23)。' },
      { name: '鏈結串列排序', desc: '用快慢指標找中點後遞迴合併,不需要額外陣列(LeetCode 148)。' },
    ],
    compare: [
      { id: 'quick-sort', diff: '合併排序最壞也是 O(n log n) 且穩定,但需要 O(n) 額外空間;快排原地但最壞 O(n²)。' },
      { id: 'heap-sort', diff: '堆積排序 O(1) 空間但不穩定、快取不友善。' },
    ],
    interview: ['遞迴式 T(n) = 2T(n/2) + O(n),用主定理得 O(n log n)', '穩定性來自合併時相等取左邊(<=),寫成 < 就不穩定'],
  },
  'quick-sort': {
    level: 2,
    prereq: ['two-pointers'],
    invariant: 'Lomuto partition 進行中:a[lo..i−1] 都 < pivot,a[i..j−1] 都 >= pivot。掃完後把 pivot 換到 i,它左邊全部比它小、右邊全部 >= 它,所以 pivot 已經在最終位置。',
    template: `import random
def quick_sort(a, lo, hi):
    if lo >= hi:
        return
    p = random.randint(lo, hi)            # 隨機 pivot 防最壞情況
    a[p], a[hi] = a[hi], a[p]
    i = lo
    for j in range(lo, hi):
        if a[j] < a[hi]:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]
    quick_sort(a, lo, i - 1)
    quick_sort(a, i + 1, hi)`,
    variants: [
      { name: '快速選擇', desc: '只遞迴進「第 k 個所在的那一半」,平均 O(n) 找第 k 大(LeetCode 215)。' },
      { name: '三路切分', desc: '分成 < = > 三段,大量重複值時不會退化(荷蘭國旗,LeetCode 75)。' },
      { name: 'Hoare partition', desc: '左右兩個指標往中間掃,交換次數約是 Lomuto 的 1/3。' },
    ],
    compare: [
      { id: 'merge-sort', diff: '快排原地、快取友善,平均常數最小;但不穩定,最壞 O(n²)。' },
      { id: 'heap', diff: '找第 k 大:快速選擇平均 O(n) 但會改動陣列;heap 是 O(n log k) 且適合資料流。' },
    ],
    interview: ['已排序輸入 + 固定選最後一個當 pivot → 每次只切掉 1 個 → O(n²),所以要隨機化', '平均 O(n log n) 的直覺:隨機 pivot 有一半機率落在中間 50%,遞迴深度期望 O(log n)'],
  },
  'heap-sort': {
    level: 2,
    prereq: ['selection-sort', 'heap'],
    invariant: '建堆後 a[0..end] 滿足最大堆性質(父 >= 子),a[end+1..] 是已排好的最大幾個數。每次把堆頂(目前最大)換到 end,再把新堆頂下沉恢復堆性質。',
    template: `def heap_sort(a):
    n = len(a)
    def sift_down(i, size):
        while (c := 2 * i + 1) < size:
            if c + 1 < size and a[c + 1] > a[c]:
                c += 1
            if a[i] >= a[c]:
                return
            a[i], a[c] = a[c], a[i]
            i = c
    for i in range(n // 2 - 1, -1, -1):   # 由下往上建堆 O(n)
        sift_down(i, n)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        sift_down(0, end)`,
    variants: [
      { name: '部分排序', desc: '只要前 k 大時,取出 k 次就停,O(n + k log n)。' },
      { name: 'Introsort', desc: 'C++ std::sort:先快排,遞迴太深就改堆積排序,保證最壞 O(n log n)。' },
    ],
    compare: [
      { id: 'merge-sort', diff: '都保證 O(n log n),堆積排序 O(1) 空間但不穩定,實測通常較慢。' },
      { id: 'quick-sort', diff: '快排平均較快;堆積排序沒有最壞情況。' },
    ],
    interview: ['由下往上建堆為什麼是 O(n):大部分節點在底層,下沉距離很短,總和 Σ h·n/2^(h+1) = O(n)', '索引公式:左子 2i+1、右子 2i+2、父 (i−1)//2'],
  },
  'counting-sort': {
    level: 1,
    prereq: [],
    invariant: '計數陣列 cnt[v] 記錄值 v 出現幾次;由小到大依次輸出 cnt[v] 個 v,輸出必然有序,而且完全不需要比較。',
    template: `def counting_sort(a, k):          # 值域 0..k
    cnt = [0] * (k + 1)
    for x in a:
        cnt[x] += 1
    out = []
    for v in range(k + 1):
        out.extend([v] * cnt[v])
    return out`,
    variants: [
      { name: '桶排序', desc: '把值分到若干個桶,桶內再排序;資料均勻時 O(n)。也常用「依頻率分桶」做 Top-K(LeetCode 347)。' },
      { name: '基數排序', desc: '從個位到最高位,每一位做一次穩定的計數排序,O(d·(n + 10))。' },
      { name: '穩定版', desc: '對 cnt 做前綴和得到每個值的結束位置,再從右往左放,才能排「帶資料的物件」。' },
    ],
    compare: [
      { id: 'hash-map', diff: '值域大或不是整數時,用 Hash Map 計數取代陣列。' },
      { id: 'merge-sort', diff: '比較排序的下界是 Ω(n log n);計數排序不比較,所以能突破,但代價是依賴值域 k。' },
    ],
    interview: ['看到「值域很小」(例如 0..100、26 個字母)就該想到它', '要說清楚 k 是值域大小:k 遠大於 n 時反而更慢'],
  },

  // ===== 陣列與指標 =====
  'two-pointers': {
    level: 1,
    prereq: [],
    invariant: '答案如果存在,一定在 [l, r] 之內。nums[l] + nums[r] < target 時,nums[l] 配上任何 <= r 的數都更小,所以 l 可以安全丟掉;反之亦然。每一步都只排除「不可能是答案」的元素。',
    template: `def two_sum_sorted(nums, target):
    l, r = 0, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        if s == target:
            return [l, r]
        if s < target:
            l += 1
        else:
            r -= 1
    return [-1, -1]`,
    variants: [
      { name: '同向快慢指標', desc: '一個讀、一個寫,原地去重 / 移除元素(LeetCode 26、27、283)。' },
      { name: '三數之和', desc: '排序後固定一個數,剩下兩個用對撞指標,O(n²)(LeetCode 15)。' },
      { name: '盛水容器', desc: '每次移動較矮的那一邊,因為移動較高的不可能變好(LeetCode 11)。' },
      { name: '兩個陣列各一個指標', desc: '合併兩個有序陣列、判斷子序列(LeetCode 88、392)。' },
    ],
    compare: [
      { id: 'hash-map', diff: '沒排序時用 Hash Map O(n) 時間 O(n) 空間;排好序時雙指標 O(1) 空間。' },
      { id: 'sliding-window', diff: '滑動視窗是同向雙指標的特例:兩指標中間那段本身就是要維護的狀態。' },
      { id: 'binary-search', diff: '固定一個數再二分另一個是 O(n log n),雙指標 O(n)。' },
    ],
    interview: ['一定要講出「為什麼可以丟掉」的論證,這就是正確性證明', '先問:陣列有排序嗎?可以改動原陣列嗎?'],
  },
  'sliding-window': {
    level: 2,
    prereq: ['two-pointers'],
    invariant: '對每個右端點 r,l 停在「讓視窗仍合法」的最左(或最右)位置。因為條件單調:視窗 [l, r] 不合法,[l, r+1] 也不會合法(或反過來),所以 l 永遠不必往回走。',
    template: `def window(nums):
    l, state, best = 0, 初始狀態, 初始答案
    for r, x in enumerate(nums):
        加入(state, x)
        while 視窗不合法(state):     # 求最長:縮到合法為止
            移除(state, nums[l])
            l += 1
        best = 更新(best, r - l + 1)
    return best`,
    variants: [
      { name: '固定長度 k', desc: '每步加 nums[r]、減 nums[r−k],不需要 while(LeetCode 643)。' },
      { name: '字元計數視窗', desc: '用 Hash / 26 格陣列記錄視窗內字元,配合「還缺幾個」計數器(LeetCode 76、438)。' },
      { name: '恰好 K 個 = 最多 K 個 − 最多 K−1 個', desc: '「恰好」不單調時拆成兩個「最多」相減(LeetCode 992)。' },
      { name: '視窗最大值', desc: '視窗裡要找極值時,搭配單調佇列(LeetCode 239)。' },
    ],
    compare: [
      { id: 'prefix-sum', diff: '有負數時總和不單調,滑動視窗失效,改用前綴和 + Hash Map(LeetCode 560)。' },
      { id: 'monotonic-queue', diff: '視窗狀態是「最大 / 最小值」時,O(1) 更新要靠單調佇列。' },
    ],
    interview: ['複雜度用「攤銷」說明:l 和 r 各自最多走 n 步,while 不會讓它變 O(n²)', '先確認單調性:加入元素只會讓條件更滿足還是更不滿足?'],
  },
  'prefix-sum': {
    level: 1,
    prereq: [],
    invariant: 'pre[i] = nums[0] + … + nums[i−1],所以區間 [l, r] 的和 = pre[r+1] − pre[l]。多開一格 pre[0] = 0 讓「從頭開始的區間」不用特判。',
    template: `def build(nums):
    pre = [0] * (len(nums) + 1)
    for i, x in enumerate(nums):
        pre[i + 1] = pre[i] + x
    return pre

def range_sum(pre, l, r):      # 閉區間 [l, r]
    return pre[r + 1] - pre[l]`,
    variants: [
      { name: '前綴和 + Hash Map', desc: '和為 k 的子陣列個數:找有多少個先前的 pre 等於 pre − k(LeetCode 560)。有負數也能用。' },
      { name: '二維前綴和', desc: 'S[i][j] = 左上角矩形和,任意子矩形 O(1)(LeetCode 304)。' },
      { name: '前綴積 / 前綴 XOR', desc: '除了自己以外的乘積用左右前綴積(LeetCode 238);子陣列 XOR 同理。' },
      { name: '餘數前綴', desc: '子陣列和能被 k 整除 ⇔ 兩個前綴和 mod k 相同(LeetCode 974)。' },
    ],
    compare: [
      { id: 'difference-array', diff: '前綴和:多次「區間查詢」;差分:多次「區間修改」。兩者互為逆運算。' },
      { id: 'segment-tree', diff: '陣列會被修改時前綴和每次要 O(n) 重建,改用 BIT / 線段樹 O(log n)。' },
      { id: 'sliding-window', diff: '全是正數時滑動視窗 O(1) 空間;有負數時只能用前綴和。' },
    ],
    interview: ['off-by-one 是最常見的錯:統一用長度 n+1 的 pre 陣列', 'Hash Map 版本記得先放 {0: 1},代表「空前綴」'],
  },
  'difference-array': {
    level: 2,
    prereq: ['prefix-sum'],
    invariant: 'diff[i] = a[i] − a[i−1]。對區間 [l, r] 加 v 只會改變兩個相鄰差:diff[l] += v、diff[r+1] −= v。最後對 diff 做前綴和就還原出 a。',
    template: `def apply_ranges(n, ops):        # ops: (l, r, v)
    diff = [0] * (n + 1)
    for l, r, v in ops:
        diff[l] += v
        diff[r + 1] -= v
    out, run = [], 0
    for i in range(n):
        run += diff[i]
        out.append(run)
    return out`,
    variants: [
      { name: '掃描線 / 上下車', desc: '在時間點上 +1 / −1,前綴和最大值就是同時在場人數(LeetCode 1094、253)。' },
      { name: '二維差分', desc: '對子矩形加值:四個角各改一次(LeetCode 2536)。' },
      { name: '離散化差分', desc: '座標很大時只記錄有變化的點,用排序過的 map 掃描。' },
    ],
    compare: [
      { id: 'prefix-sum', diff: '差分是「修改便宜、查詢貴」,前綴和是「查詢便宜、修改貴」。' },
      { id: 'segment-tree', diff: '修改和查詢交錯出現時,用 BIT / 線段樹(懶標記)。' },
    ],
    interview: ['陣列開 n+1 格,避免 r+1 越界', '所有修改都做完才還原一次,才是 O(n + q)'],
  },
  simulation: {
    level: 1,
    prereq: [],
    invariant: '螺旋走訪用四條邊界 top / bottom / left / right 描述「還沒走的矩形」。每走完一條邊就把那條邊界往內縮一格,所以每格恰好被走一次。',
    template: `def spiral(m):
    res = []
    t, b, l, r = 0, len(m) - 1, 0, len(m[0]) - 1
    while t <= b and l <= r:
        for j in range(l, r + 1): res.append(m[t][j])
        t += 1
        for i in range(t, b + 1): res.append(m[i][r])
        r -= 1
        if t <= b:
            for j in range(r, l - 1, -1): res.append(m[b][j])
            b -= 1
        if l <= r:
            for i in range(b, t - 1, -1): res.append(m[i][l])
            l += 1
    return res`,
    variants: [
      { name: '方向陣列', desc: 'dirs = [(0,1),(1,0),(0,−1),(−1,0)],撞牆或走過就轉向,寫法更通用。' },
      { name: '原地旋轉矩陣', desc: '先轉置再左右翻轉(LeetCode 48)。' },
      { name: '原地標記', desc: '用第一列 / 第一行當標記區,O(1) 空間(LeetCode 73);生命遊戲用位元存新舊狀態(LeetCode 289)。' },
    ],
    compare: [
      { id: 'graph-traversal', diff: '網格題要「找連通 / 最短」時是圖論;只是「照規則走一遍」時是模擬。' },
    ],
    interview: ['模擬題的分數在「邊界條件」:單列、單行、空矩陣要先講', '先口頭描述規則和邊界更新順序,再寫程式'],
  },

  // ===== 搜尋 =====
  'binary-search': {
    level: 1,
    prereq: [],
    invariant: '迴圈開始時,如果 target 存在,它一定在 [lo, hi] 之內。每次看 mid:比 target 小就丟掉左半(含 mid),比較大就丟掉右半。區間變空時就證明了不存在。',
    template: `def lower_bound(a, x):     # 第一個 >= x 的位置
    lo, hi = 0, len(a)        # 半開區間 [lo, hi)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < x:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
    variants: [
      { name: 'lower / upper bound', desc: '找第一個 >= x / 第一個 > x,處理重複值(LeetCode 34)。' },
      { name: '旋轉排序陣列', desc: '比較 mid 和右端,判斷哪一半是有序的(LeetCode 33、153)。' },
      { name: '二維矩陣', desc: '把 R×C 攤平成一維索引 i → (i // C, i % C)(LeetCode 74)。' },
      { name: '峰值', desc: '不需要整體有序,只要能判斷「往哪邊一定有答案」(LeetCode 162)。' },
    ],
    compare: [
      { id: 'binary-search-answer', diff: '在「答案的範圍」上二分,而不是在陣列上二分。' },
      { id: 'bst', diff: 'BST 是把二分搜尋做成可以插入刪除的資料結構。' },
    ],
    interview: ['挑一種區間寫法([lo, hi] 或 [lo, hi))背熟,迴圈條件和更新要一致', '其他語言用 lo + (hi − lo) / 2 防溢位'],
  },
  'binary-search-answer': {
    level: 2,
    prereq: ['binary-search'],
    invariant: 'check(x) 有單調性:x 可行則所有更大的 x 也可行(或反之)。所以答案是「第一個讓 check 變 True 的 x」,就是在 True/False 序列上找分界點。',
    template: `def min_feasible(lo, hi, check):   # 答案在 [lo, hi]
    while lo < hi:
        mid = (lo + hi) // 2
        if check(mid):
            hi = mid          # mid 可行,答案 <= mid
        else:
            lo = mid + 1
    return lo`,
    variants: [
      { name: '最小化最大值', desc: '分割陣列、運送包裹:check = 「上限 x 時能不能在 k 段內完成」(LeetCode 410、1011)。' },
      { name: '最大化最小值', desc: '放置球、磁力:check 方向相反,更新改成 lo = mid、mid 要上取整(LeetCode 1552)。' },
      { name: '實數二分', desc: '固定跑 60~100 次或 hi − lo < eps 停止。' },
      { name: '第 k 小', desc: '二分答案值 x,check = 「<= x 的數有幾個 >= k」(LeetCode 378、668)。' },
    ],
    compare: [
      { id: 'binary-search', diff: '普通二分在索引上;對答案二分在值域上,每一步要花 O(n) 做 check。' },
      { id: 'greedy', diff: 'check 函式通常就是一個貪心;「二分 + 貪心」是非常常見的組合。' },
    ],
    interview: ['關鍵句:「題目問最小的 x 使得…可行,而且可行性有單調性」', '上下界要講清楚:最小可能值和一定可行的最大值'],
  },

  // ===== 雜湊 =====
  'hash-map': {
    level: 1,
    prereq: [],
    invariant: '掃到第 i 個數時,map 裡剛好裝著 nums[0..i−1] 的「值 → 索引」。需要的另一半 target − nums[i] 如果在前面出現過,一查就找到;先查再存,所以不會配到自己。',
    template: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []`,
    variants: [
      { name: '計數', desc: 'Counter 比較兩個字串的字母組成(LeetCode 242、49 用排序或計數當 key)。' },
      { name: '分組', desc: '用「正規化後的 key」把東西分到同一桶(LeetCode 49 字母異位詞)。' },
      { name: '集合找連續', desc: '只從序列的起點(x−1 不在集合中)開始往上數,O(n)(LeetCode 128)。' },
      { name: 'LRU Cache', desc: 'Hash Map + 雙向鏈結串列,get / put 都 O(1)(LeetCode 146)。' },
    ],
    compare: [
      { id: 'two-pointers', diff: '已排序時雙指標省空間;Hash Map 不需要排序。' },
      { id: 'prefix-sum', diff: '「子陣列和 = k」是把 Hash Map 用在前綴和上。' },
      { id: 'counting-sort', diff: '值域小時直接用陣列計數,常數更小。' },
    ],
    interview: ['平均 O(1)、最壞 O(n)(全部碰撞);可以順帶提到 key 必須不可變 / 可雜湊', '用空間換時間:O(n²) 暴力 → O(n) 時間 + O(n) 空間'],
  },

  // ===== 堆疊與佇列 =====
  stack: {
    level: 1,
    prereq: [],
    invariant: '堆疊裡由下到上是「還沒被配對的左括號」,順序就是它們出現的順序。遇到右括號時,唯一能和它配對的就是最近出現的那個左括號 —— 也就是堆疊頂端。',
    template: `def valid(s):
    pair = {')': '(', ']': '[', '}': '{'}
    st = []
    for c in s:
        if c in pair:
            if not st or st.pop() != pair[c]:
                return False
        else:
            st.append(c)
    return not st`,
    variants: [
      { name: '運算式求值', desc: '數字一個堆疊、運算子一個堆疊,或先轉後序(LeetCode 150、224、227)。' },
      { name: '最小堆疊', desc: '每層同時記錄「到這層為止的最小值」(LeetCode 155)。' },
      { name: '解碼字串', desc: '遇到 [ 把目前狀態壓入,遇到 ] 彈出並組合(LeetCode 394)。' },
      { name: '遞迴改迭代', desc: '任何遞迴都能用顯式堆疊模擬,避免深度過大爆堆疊。' },
    ],
    compare: [
      { id: 'monotonic-stack', diff: '單調堆疊是「pop 的條件是大小比較」的特例,用來找下一個更大 / 更小。' },
      { id: 'tree-dfs', diff: 'DFS 本身就是在用(系統的)堆疊。' },
    ],
    interview: ['看到「最近的」「配對」「巢狀」「撤銷」就想到堆疊', '結束時記得檢查堆疊是否為空'],
  },
  'monotonic-stack': {
    level: 2,
    prereq: ['stack'],
    invariant: '堆疊內的索引對應的溫度由下到上嚴格遞減,而且每個都還在「等待更熱的一天」。新的一天比堆頂熱,堆頂的答案就是今天;一直 pop 直到堆頂不比今天冷。',
    template: `def next_greater(a):
    ans = [-1] * len(a)
    st = []                      # 存索引,值由下往上遞減
    for i, x in enumerate(a):
        while st and a[st[-1]] < x:
            j = st.pop()
            ans[j] = i           # j 的下一個更大在 i
        st.append(i)
    return ans`,
    variants: [
      { name: '柱狀圖最大矩形', desc: '遞增堆疊;被 pop 時左右邊界都確定了(LeetCode 84、85)。' },
      { name: '接雨水', desc: '遞減堆疊,pop 時計算凹槽的水量(LeetCode 42)。' },
      { name: '環狀陣列', desc: '索引跑兩圈 i % n(LeetCode 503)。' },
      { name: '移掉 k 位數字', desc: '貪心 + 單調堆疊,讓前面的位數盡量小(LeetCode 402)。' },
      { name: '子陣列最小值之和', desc: '對每個數求「它當最小值的範圍」左右各一次(LeetCode 907)。' },
    ],
    compare: [
      { id: 'monotonic-queue', diff: '單調佇列多了「從前面過期」:視窗會移走舊元素時用 deque。' },
      { id: 'stack', diff: '普通堆疊按配對 pop;單調堆疊按大小 pop。' },
    ],
    interview: ['決定 4 件事:存值還是索引、遞增還是遞減、嚴格還是非嚴格、在 pop 時還是 push 時記答案', '攤銷 O(n):每個元素 push 一次 pop 一次'],
  },
  'monotonic-queue': {
    level: 3,
    prereq: ['monotonic-stack', 'sliding-window'],
    invariant: 'deque 裡的索引由前到後遞增,對應的值遞減,而且都在目前視窗內。比新元素小的舊元素以後永遠不可能當最大值(新元素更晚過期又更大),所以可以直接丟掉;隊首就是視窗最大值。',
    template: `from collections import deque
def max_window(a, k):
    dq, res = deque(), []
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x:
            dq.pop()             # 比 x 小的永遠沒機會
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()         # 過期
        if i >= k - 1:
            res.append(a[dq[0]])
    return res`,
    variants: [
      { name: '最短子陣列和 >= K(有負數)', desc: '在前綴和上用單調佇列(LeetCode 862)。' },
      { name: 'DP 優化', desc: 'dp[i] = max(dp[j]) + x,j 在長度 k 的範圍內 → 用單調佇列維護最大的 dp[j](LeetCode 1696、1425)。' },
      { name: '最大最小差 <= limit', desc: '同時維護一個遞增、一個遞減的 deque(LeetCode 1438)。' },
    ],
    compare: [
      { id: 'heap', diff: '用 heap 也能做視窗最大值,但要延遲刪除,O(n log n);單調佇列 O(n)。' },
      { id: 'monotonic-stack', diff: '單調佇列 = 單調堆疊 + 隊首過期移除。' },
    ],
    interview: ['為什麼可以丟掉:「比我早來又比我小的,在我離開前永遠贏不了我」', '存索引才能判斷過期'],
  },

  // ===== 鏈結串列 =====
  'linked-list': {
    level: 1,
    prereq: [],
    invariant: '迴圈中 prev 指向「已經反轉好的部分」的頭,cur 指向「還沒處理的部分」的頭。每一步把 cur 從後半拔下來接到 prev 前面,兩部分加起來始終是完整的串列。',
    template: `def reverse(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next      # 先記住,不然會斷掉
        cur.next = prev
        prev, cur = cur, nxt
    return prev`,
    variants: [
      { name: 'Dummy 頭節點', desc: '刪除 / 合併時頭可能改變,先放一個假頭(LeetCode 21、19)。' },
      { name: '反轉一段', desc: '找到段前節點,反轉後接回(LeetCode 92、25 每 k 個一組)。' },
      { name: '重排 / 回文', desc: '快慢指標找中點 + 反轉後半 + 合併或比較(LeetCode 143、234)。' },
      { name: '深拷貝帶隨機指標', desc: 'Hash Map 舊 → 新,或交錯插入法 O(1) 空間(LeetCode 138)。' },
    ],
    compare: [
      { id: 'fast-slow', diff: '找中點、找環、找倒數第 k 個都靠快慢指標,常和反轉一起用。' },
      { id: 'stack', diff: '用堆疊也能反轉,但要 O(n) 空間。' },
    ],
    interview: ['畫圖!面試時先畫 3 個節點的指標變化再寫', '改 next 之前一定先存下一個節點'],
  },
  'fast-slow': {
    level: 2,
    prereq: ['linked-list'],
    invariant: '有環時,進入環後快指標每步比慢指標多走 1,兩者距離每步減 1,一圈內必相遇。設起點到入口 a、入口到相遇點 b、環長 c:2(a+b) = a+b+kc ⇒ a = kc − b,所以從起點和相遇點各走 a 步會在入口碰頭。',
    template: `def cycle_entry(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            p = head
            while p is not slow:
                p, slow = p.next, slow.next
            return p
    return None`,
    variants: [
      { name: '找中點', desc: '快走兩步、慢走一步,快到底時慢在中間(LeetCode 876)。' },
      { name: '倒數第 k 個', desc: '先讓快指標走 k 步,再一起走(LeetCode 19)。' },
      { name: '陣列裡的環', desc: '把 i → nums[i] 看成鏈結,找重複數(LeetCode 287)。' },
      { name: '快樂數', desc: '數字變換序列也會進入循環,用快慢判斷(LeetCode 202)。' },
    ],
    compare: [
      { id: 'hash-map', diff: '用集合記錄走過的節點也能找環,但要 O(n) 空間;快慢指標 O(1)。' },
      { id: 'two-pointers', diff: '快慢指標是速度不同的同向雙指標。' },
    ],
    interview: ['被追問「為什麼一定會相遇」「為什麼從頭走會到入口」時,寫出 a = kc − b 這一行', '迴圈條件 fast and fast.next 防止空指標'],
  },

  // ===== 樹 =====
  'tree-dfs': {
    level: 1,
    prereq: ['stack'],
    invariant: '遞迴函式的「信任」:假設 dfs(left) 和 dfs(right) 已經正確回傳子樹的答案,只要正確地把兩者和根組合起來,整棵樹就正確(數學歸納法)。',
    template: `def dfs(node):
    if not node:
        return 基底值
    L = dfs(node.left)
    R = dfs(node.right)
    return 組合(node.val, L, R)    # 後序:先拿子樹答案

# 由上往下傳資訊:dfs(node, 狀態) 把路徑資訊往下帶`,
    variants: [
      { name: '後序收資訊', desc: '高度、直徑、是否平衡:子樹回傳值往上合併(LeetCode 104、543、110)。' },
      { name: '前序帶狀態', desc: '路徑和、好節點:把目前路徑資訊當參數往下傳(LeetCode 112、1448)。' },
      { name: '全域答案', desc: '回傳值和答案不同:回傳「單邊最大」,更新「穿過根的最大」(LeetCode 124)。' },
      { name: '序列化 / 重建', desc: '前序 + 中序唯一決定一棵樹(LeetCode 105、297)。' },
    ],
    compare: [
      { id: 'tree-bfs', diff: 'DFS 空間 O(h),適合路徑類問題;BFS 空間 O(寬度),適合「層」與「最近」。' },
      { id: 'backtracking', diff: '回溯 = 在「決策樹」上做 DFS,外加撤銷選擇。' },
    ],
    interview: ['先講清楚:這個函式回傳什麼?基底是什麼?', '樹退化成鏈時遞迴深度 n,Python 可能要調 recursionlimit 或改迭代'],
  },
  'tree-bfs': {
    level: 1,
    prereq: ['tree-dfs'],
    invariant: '每一輪開始時,佇列裡恰好是同一層的所有節點(依左到右)。先記下 len(q),只處理這麼多個,新加入的子節點就屬於下一層。',
    template: `from collections import deque
def level_order(root):
    if not root:
        return []
    q, res = deque([root]), []
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        res.append(level)
    return res`,
    variants: [
      { name: '右視圖', desc: '每層最後一個(LeetCode 199)。' },
      { name: '鋸齒形', desc: '奇數層反轉(LeetCode 103)。' },
      { name: '最小深度', desc: 'BFS 第一個遇到的葉子就是答案,不用走完整棵樹(LeetCode 111)。' },
      { name: '最大寬度', desc: '用堆積索引 2i、2i+1 記錄位置(LeetCode 662)。' },
    ],
    compare: [
      { id: 'tree-dfs', diff: '大部分題兩者都能做;題目出現「層」「最淺」「最近」時 BFS 更直接。' },
      { id: 'graph-traversal', diff: '樹沒有環不需要 visited;圖的 BFS 一定要。' },
    ],
    interview: ['Python 用 collections.deque,list.pop(0) 是 O(n)', '「for _ in range(len(q))」是分層的關鍵'],
  },
  bst: {
    level: 2,
    prereq: ['binary-search', 'tree-dfs'],
    invariant: '每個節點:左子樹所有值 < 節點值 < 右子樹所有值(不只是直接的子節點)。所以搜尋時每一步都能丟掉一整棵子樹;中序遍歷會得到遞增序列。',
    template: `def search(root, x):
    while root and root.val != x:
        root = root.left if x < root.val else root.right
    return root

def is_valid(node, lo=float('-inf'), hi=float('inf')):
    if not node:
        return True
    if not lo < node.val < hi:
        return False
    return is_valid(node.left, lo, node.val) and is_valid(node.right, node.val, hi)`,
    variants: [
      { name: '驗證 BST', desc: '帶上下界往下傳,不能只比父子(LeetCode 98)。' },
      { name: '第 k 小', desc: '中序遍歷數到第 k 個(LeetCode 230)。' },
      { name: '刪除節點', desc: '兩個子節點時,用右子樹最小值(後繼)替換(LeetCode 450)。' },
      { name: '有序陣列建平衡 BST', desc: '取中間當根遞迴(LeetCode 108)。' },
    ],
    compare: [
      { id: 'binary-search', diff: '有序陣列查詢 O(log n) 但插入 O(n);平衡 BST 都是 O(log n)。' },
      { id: 'heap', diff: 'heap 只保證「父 <= 子」,只能快速拿極值;BST 能做任意順序查詢。' },
      { id: 'lca', diff: 'BST 的 LCA 可以直接用大小關係往下走,O(h)。' },
    ],
    interview: ['不平衡時退化成鏈,O(n);實務用紅黑樹(C++ map、Java TreeMap)', '要說「整棵子樹」都滿足大小關係'],
  },
  lca: {
    level: 2,
    prereq: ['tree-dfs'],
    invariant: 'dfs(node) 回傳「這棵子樹裡找到的 p 或 q(或它們的 LCA)」。左右都回傳非空 ⇒ p、q 分在兩邊,node 就是 LCA;只有一邊非空 ⇒ 答案在那邊,往上傳。',
    template: `def lca(root, p, q):
    if not root or root is p or root is q:
        return root
    L = lca(root.left, p, q)
    R = lca(root.right, p, q)
    if L and R:
        return root
    return L or R`,
    variants: [
      { name: 'BST 的 LCA', desc: 'p、q 都比根小往左、都比根大往右,否則根就是答案(LeetCode 235)。' },
      { name: '有父指標', desc: '等同兩條鏈結串列找交點(LeetCode 1650)。' },
      { name: '多次查詢', desc: '倍增法(binary lifting)預處理 O(n log n),每次 O(log n)。' },
      { name: '樹上距離', desc: 'dist(u, v) = depth(u) + depth(v) − 2·depth(lca)。' },
    ],
    compare: [
      { id: 'bst', diff: 'BST 可以利用大小關係不必搜尋整棵樹。' },
      { id: 'union-find', diff: '離線大量 LCA 查詢可用 Tarjan 演算法(DFS + 並查集)。' },
    ],
    interview: ['要先問 p、q 是否保證存在;不保證時要另外確認兩個都找到', '回傳值的意義要講清楚,這題的難點是「回傳值有兩種意思」'],
  },

  // ===== 圖 =====
  'graph-traversal': {
    level: 2,
    prereq: ['tree-bfs', 'tree-dfs'],
    invariant: '每個點在「放進佇列 / 堆疊時」就標記 visited,所以每個點只會被處理一次。BFS 中,點出佇列的順序就是離起點的距離由近到遠(無權圖)。',
    template: `from collections import deque
def bfs(start, neighbors):
    dist = {start: 0}
    q = deque([start])
    while q:
        u = q.popleft()
        for v in neighbors(u):
            if v not in dist:          # 入隊時就標記
                dist[v] = dist[u] + 1
                q.append(v)
    return dist`,
    variants: [
      { name: '多源 BFS', desc: '所有起點一起放進佇列,一層一層往外擴(LeetCode 994 腐爛橘子、286)。' },
      { name: '從邊界反向找', desc: '從海洋邊界往內 DFS,找能流到兩邊的格子(LeetCode 417、130)。' },
      { name: '隱式圖', desc: '狀態當節點、轉換當邊:單字接龍、轉盤鎖(LeetCode 127、752)。' },
      { name: '複製圖', desc: 'Hash Map 舊節點 → 新節點,當 visited 用(LeetCode 133)。' },
      { name: '0-1 BFS', desc: '邊權只有 0 或 1 時用 deque:權重 0 放前面、1 放後面。' },
    ],
    compare: [
      { id: 'dijkstra', diff: '無權圖 BFS 就是最短路;有權重時要 Dijkstra。' },
      { id: 'union-find', diff: '只問「連不連通 / 有幾塊」時並查集也行,而且支援動態加邊。' },
      { id: 'topological-sort', diff: '有向無環圖要排出先後順序時用拓撲排序(其實是 BFS 的變形)。' },
    ],
    interview: ['在「入隊時」標記,不要等到出隊時,否則同一個點會被加入很多次', '網格題先講:四方向還是八方向?可以改原陣列當 visited 嗎?'],
  },
  'topological-sort': {
    level: 2,
    prereq: ['graph-traversal'],
    invariant: '入度為 0 的點沒有任何未完成的前置,可以安全地排在目前位置。把它拿掉後更新鄰居入度;如果最後還有點沒被拿掉,剩下的點每個都有前置 ⇒ 一定有環。',
    template: `from collections import deque
def topo(n, edges):                 # edges: (先修, 後修)
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in edges:
        adj[a].append(b)
        indeg[b] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else []   # 有環`,
    variants: [
      { name: 'DFS 版', desc: '三色標記(未訪 / 訪問中 / 完成),遇到「訪問中」就是環;後序反轉即拓撲序。' },
      { name: '字典序最小', desc: '把佇列換成最小堆。' },
      { name: '外星文字典', desc: '從相鄰單字的第一個不同字母建邊(LeetCode 269)。' },
      { name: 'DAG 上 DP', desc: '依拓撲序做 DP:最長路徑、平行課程最少學期(LeetCode 1136、2050)。' },
    ],
    compare: [
      { id: 'graph-traversal', diff: 'Kahn 演算法就是「只放入度為 0 的點」的 BFS。' },
      { id: 'dp-general', diff: 'DP 的計算順序本質上就是狀態圖的拓撲序。' },
    ],
    interview: ['邊的方向要先確認:[a, b] 是 a 依賴 b 還是 b 依賴 a', '偵測環:輸出長度 < n'],
  },
  'union-find': {
    level: 2,
    prereq: ['graph-traversal'],
    invariant: '每個集合是一棵樹,樹根是代表;find(x) 走到根。union 把一棵樹的根接到另一棵的根,不會破壞其他點的歸屬。路徑壓縮只是把點直接接到根,集合關係不變。',
    template: `class DSU:
    def __init__(self, n):
        self.p = list(range(n))
        self.size = [1] * n
    def find(self, x):
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]   # 路徑減半
            x = self.p[x]
        return x
    def union(self, a, b):
        a, b = self.find(a), self.find(b)
        if a == b:
            return False                     # 已同集合 → 這條邊成環
        if self.size[a] < self.size[b]:
            a, b = b, a
        self.p[b] = a
        self.size[a] += self.size[b]
        return True`,
    variants: [
      { name: '找多餘的邊', desc: 'union 回傳 False 的那條邊造成環(LeetCode 684)。' },
      { name: '帳號合併', desc: '把同一個 email 的帳號 union 起來(LeetCode 721)。' },
      { name: '帶權並查集', desc: '邊上記錄比值 / 差值,find 時沿路累乘(LeetCode 399)。' },
      { name: '離線反向', desc: '刪邊很難 → 把操作倒過來變成加邊(LeetCode 803)。' },
    ],
    compare: [
      { id: 'graph-traversal', diff: '靜態圖 BFS/DFS 一樣 O(V+E);邊一條一條加入、邊加邊問時並查集更好。' },
      { id: 'mst', diff: 'Kruskal 用並查集判斷「加這條邊會不會成環」。' },
    ],
    interview: ['要提兩個優化:路徑壓縮 + 按大小 / 秩合併,合起來 O(α(n))', '並查集不支援「拆開」'],
  },
  dijkstra: {
    level: 3,
    prereq: ['graph-traversal', 'heap'],
    invariant: '從堆中取出的「距離最小的未確定點」u,它的 dist 已經是最短。因為任何其他路徑都要先經過某個未確定點 v,而 dist[v] >= dist[u],邊權非負,所以不可能更短。',
    template: `import heapq
def dijkstra(n, adj, src):          # adj[u] = [(v, w), ...]
    dist = [float('inf')] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue                # 過期的資料
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(pq, (dist[v], v))
    return dist`,
    variants: [
      { name: '最小化最大邊', desc: '把「d + w」換成「max(d, w)」,一樣成立(LeetCode 778、1631)。' },
      { name: '最大機率路徑', desc: '取最大堆,乘法代替加法(LeetCode 1514)。' },
      { name: '帶狀態', desc: '節點變成 (點, 剩餘次數),例如最多 k 站轉機(LeetCode 787 用 Bellman-Ford 更直觀)。' },
      { name: '負權邊', desc: 'Dijkstra 失效,改用 Bellman-Ford O(VE) 或 SPFA。' },
    ],
    compare: [
      { id: 'graph-traversal', diff: '權重全相同時退化成 BFS,O(V+E)。' },
      { id: 'mst', diff: 'Prim 演算法和 Dijkstra 長得幾乎一樣,差在堆裡放「邊權」而不是「累積距離」。' },
    ],
    interview: ['為什麼不能有負邊:已確定的點可能被之後的負邊更新', '「過期資料跳過」是 lazy deletion,堆裡最多 E 筆'],
  },
  mst: {
    level: 3,
    prereq: ['union-find', 'greedy'],
    invariant: '切割性質:把點任意分成兩群,橫跨兩群的最輕邊一定在某棵最小生成樹裡。Kruskal 由輕到重考慮邊,只要不成環就加入 —— 每次加的都是某個切割上的最輕邊。',
    template: `def kruskal(n, edges):          # edges: (w, u, v)
    dsu = DSU(n)
    total = used = 0
    for w, u, v in sorted(edges):
        if dsu.union(u, v):
            total += w
            used += 1
            if used == n - 1:
                break
    return total if used == n - 1 else -1   # 不連通`,
    variants: [
      { name: 'Prim', desc: '從一個點出發,每次用最小堆挑連到樹外的最輕邊;稠密圖用 O(V²) 陣列版更快(LeetCode 1584)。' },
      { name: '關鍵邊 / 偽關鍵邊', desc: '強制不用或強制先用某條邊,比較 MST 權重(LeetCode 1489)。' },
      { name: '虛擬節點', desc: '「自己蓋井」的成本 = 連到虛擬 0 號點的邊(LeetCode 1168)。' },
    ],
    compare: [
      { id: 'dijkstra', diff: 'MST 讓「全部連起來的總成本」最小;最短路讓「兩點之間」最近。兩者答案不同。' },
      { id: 'greedy', diff: 'Kruskal 和 Prim 都是貪心,而且可以證明是最佳的。' },
    ],
    interview: ['V 個點的生成樹恰好 V−1 條邊,數到就可以提早停', 'Kruskal 適合稀疏圖,Prim(陣列版)適合稠密圖'],
  },

  // ===== 回溯 =====
  backtracking: {
    level: 2,
    prereq: ['tree-dfs'],
    invariant: '遞迴進入時 path 代表「目前已做的選擇」,離開時 path 恢復原狀(選 → 遞迴 → 撤銷)。所以每個分支看到的 path 都正確,而所有分支合起來恰好涵蓋全部可能。',
    template: `def backtrack(start, path):
    res.append(path[:])            # 子集:每個節點都是答案
    for i in range(start, len(nums)):
        if i > start and nums[i] == nums[i - 1]:
            continue               # 有重複時(先排序)跳過同層重複
        path.append(nums[i])       # 選
        backtrack(i + 1, path)     # 往下
        path.pop()                 # 撤銷`,
    variants: [
      { name: '排列', desc: '用 used[] 標記,每層從頭掃(LeetCode 46、47)。' },
      { name: '組合總和', desc: '可以重複選時遞迴傳 i 而不是 i+1;超過目標就剪枝(LeetCode 39、40)。' },
      { name: 'N 皇后', desc: '用集合記錄被佔用的列、兩條對角線(r−c、r+c)(LeetCode 51)。' },
      { name: '網格找單字', desc: '暫時把格子改成 # 當作 visited,回來再改回(LeetCode 79)。' },
      { name: '切割回文', desc: '每一層決定「下一刀切在哪」(LeetCode 131)。' },
    ],
    compare: [
      { id: 'dp-general', diff: '只要「數量 / 最佳值」而且子問題重疊 → DP;要「列出所有方案」→ 回溯。' },
      { id: 'bitmask-dp', diff: 'n <= 20 的子集問題,也可以直接用位元枚舉 0..2ⁿ−1。' },
    ],
    interview: ['先畫決策樹:每一層在決定什麼?有幾個分支?', '加入答案時要複製 path[:],否則之後的修改會改到它'],
  },

  // ===== 動態規劃 =====
  'dp-general': {
    level: 2,
    prereq: ['tree-dfs'],
    invariant: 'DP 成立需要兩件事:最佳子結構(大問題的答案可由子問題的答案組出)與重疊子問題(同一個子問題被問很多次)。記憶化保證每個狀態只算一次。',
    template: `from functools import cache

@cache
def f(狀態):
    if 基底:
        return 基底值
    return 最佳(f(子狀態) + 代價 for 子狀態 in 選擇)

# 由下往上:按「子狀態先算好」的順序填表,迴圈取代遞迴`,
    variants: [
      { name: '記憶化(由上往下)', desc: '直接寫遞迴 + 快取,最不容易寫錯,適合先求正確。' },
      { name: '填表(由下往上)', desc: '沒有遞迴開銷,可以做空間優化(滾動陣列)。' },
      { name: '計數 DP', desc: '把「最佳」換成「加總」:爬樓梯、解碼方式(LeetCode 70、91)。' },
      { name: '樹形 DP', desc: '在樹上後序遍歷,每個節點回傳 (選, 不選) 兩個值(LeetCode 337)。' },
    ],
    compare: [
      { id: 'backtracking', diff: 'DP = 回溯 + 記憶化,前提是子問題答案和「怎麼走到這裡」無關。' },
      { id: 'greedy', diff: '貪心只看當下最好的一步;DP 考慮所有選擇。貪心對的話更快,但要證明。' },
    ],
    interview: ['四步驟講出來:狀態定義、轉移方程、基底、計算順序 / 答案在哪', '先寫記憶化遞迴,再視需要改成迭代'],
  },
  'dp-1d': {
    level: 2,
    prereq: ['dp-general'],
    invariant: 'dp[i] = 只考慮前 i 間房子時的最大金額。第 i 間只有偷 / 不偷兩種情況:偷 ⇒ dp[i−2] + nums[i];不偷 ⇒ dp[i−1]。兩者取大就涵蓋了所有方案。',
    template: `def rob(nums):
    prev2 = prev1 = 0            # dp[i-2], dp[i-1]
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1`,
    variants: [
      { name: '環形', desc: '拆成「不含第一間」和「不含最後一間」兩次(LeetCode 213)。' },
      { name: '最大子陣列和', desc: 'dp[i] = max(nums[i], dp[i−1] + nums[i]),即 Kadane(LeetCode 53)。' },
      { name: '最大乘積子陣列', desc: '同時維護最大和最小(負負得正)(LeetCode 152)。' },
      { name: '單字拆分', desc: 'dp[i] = 前 i 個字元能否拆分,枚舉最後一個單字(LeetCode 139)。' },
      { name: '零錢兌換', desc: 'dp[x] = 湊出 x 的最少硬幣數(LeetCode 322,也是完全背包)。' },
    ],
    compare: [
      { id: 'dp-grid', diff: '狀態變成兩個座標就是網格 DP。' },
      { id: 'state-machine-dp', diff: '每一步除了位置還要記「目前狀態」時,dp[i] 擴充成 dp[i][狀態]。' },
    ],
    interview: ['空間優化:只用到前兩格就只存兩個變數', '從「最後一步做了什麼」去想轉移'],
  },
  'dp-grid': {
    level: 2,
    prereq: ['dp-1d'],
    invariant: 'dp[i][j] = 從左上到 (i, j) 的最小路徑和。只能往右或往下,所以到 (i, j) 的最後一步一定來自上方或左方,取較小者加上自己即可。',
    template: `def min_path(grid):
    R, C = len(grid), len(grid[0])
    dp = [float('inf')] * C       # 滾動成一維
    dp[0] = 0
    for i in range(R):
        for j in range(C):
            left = dp[j - 1] if j else float('inf')
            dp[j] = min(dp[j], left) + grid[i][j]
    return dp[-1]`,
    variants: [
      { name: '路徑數', desc: '把 min 換成加法(LeetCode 62、63 有障礙)。' },
      { name: '最大正方形', desc: 'dp[i][j] = min(上, 左, 左上) + 1(LeetCode 221)。' },
      { name: '三角形', desc: '由下往上算,不必處理邊界(LeetCode 120)。' },
      { name: '矩陣最長遞增路徑', desc: '可以四個方向走時沒有固定順序 → 記憶化 DFS(LeetCode 329)。' },
    ],
    compare: [
      { id: 'dijkstra', diff: '可以往四個方向走、有權重時 DP 沒有順序,要用 Dijkstra。' },
      { id: 'lcs', diff: 'LCS 的表格也是二維,但兩個維度分別是兩個字串的位置。' },
    ],
    interview: ['第一列、第一行的邊界最容易錯,可以用 inf 或多開一圈處理', '滾動陣列時 dp[j] 在更新前是「上方」,dp[j−1] 是「左方」'],
  },
  knapsack: {
    level: 2,
    prereq: ['dp-1d'],
    invariant: 'dp[i][w] = 只用前 i 個物品、容量 w 時的最大價值。第 i 個物品只有拿 / 不拿:不拿 = dp[i−1][w];拿 = dp[i−1][w − wt] + val。壓成一維時 w 要由大到小,才不會同一個物品用兩次。',
    template: `def knapsack01(items, W):         # items: (重量, 價值)
    dp = [0] * (W + 1)
    for wt, val in items:
        for w in range(W, wt - 1, -1):   # 0/1:倒著跑
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[W]

# 完全背包(可重複拿):for w in range(wt, W + 1) 正著跑`,
    variants: [
      { name: '分割等和子集', desc: '能否湊出總和 / 2 → 布林背包(LeetCode 416)。' },
      { name: '目標和', desc: '加減號 → 正數集合和 = (sum + target) / 2,計數背包(LeetCode 494)。' },
      { name: '零錢兌換 II', desc: '完全背包計數;外層物品、內層容量 = 組合數(LeetCode 518)。' },
      { name: '一和零', desc: '兩種容量 → 二維背包(LeetCode 474)。' },
    ],
    compare: [
      { id: 'greedy', diff: '分數背包(可以切)用貪心按 CP 值拿;0/1 背包貪心是錯的。' },
      { id: 'backtracking', diff: '物品少(n <= 20)但容量很大時,回溯 / 折半枚舉比 DP 好。' },
    ],
    interview: ['O(n·W) 是「偽多項式」:W 是數值不是輸入長度', '迴圈順序決定是 0/1 還是完全、是組合還是排列 —— 要能解釋為什麼'],
  },
  lis: {
    level: 2,
    prereq: ['dp-1d', 'binary-search'],
    invariant: 'O(n²) 版:dp[i] = 以 nums[i] 結尾的 LIS 長度。O(n log n) 版:tails[k] = 長度 k+1 的遞增子序列中最小的結尾;tails 永遠遞增,所以能二分找替換位置。',
    template: `from bisect import bisect_left
def lis(nums):
    tails = []
    for x in nums:
        i = bisect_left(tails, x)   # 嚴格遞增用 left
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)`,
    variants: [
      { name: '俄羅斯套娃信封', desc: '寬度遞增、同寬時高度遞減排序,再對高度做 LIS(LeetCode 354)。' },
      { name: 'LIS 個數', desc: '同時記錄長度和方法數(LeetCode 673)。' },
      { name: '最大整除子集', desc: '排序後「整除」取代「小於」,O(n²) 版本(LeetCode 368)。' },
      { name: '非嚴格遞增', desc: '把 bisect_left 換成 bisect_right。' },
    ],
    compare: [
      { id: 'lcs', diff: 'LIS(a) = LCS(a, sorted(unique(a))),但 LIS 有更快的 O(n log n)。' },
      { id: 'binary-search', diff: 'tails 版就是「對每個數做一次 lower_bound」。' },
    ],
    interview: ['tails 不是真正的 LIS,只是長度正確;要還原序列需另存前驅', '能說出「耐心排序」(patience sorting)這個名字會加分'],
  },
  lcs: {
    level: 2,
    prereq: ['dp-grid'],
    invariant: 'dp[i][j] = a 前 i 個字和 b 前 j 個字的 LCS。最後一個字相同 ⇒ 一定可以一起用,dp[i−1][j−1] + 1;不同 ⇒ 至少有一個不在 LCS 裡,取 max(dp[i−1][j], dp[i][j−1])。',
    template: `def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
    variants: [
      { name: '編輯距離', desc: '相同 → 左上;不同 → 1 + min(插入, 刪除, 替換)(LeetCode 72)。' },
      { name: '不同子序列計數', desc: 'dp[i][j] = s 前 i 個字中 t 前 j 個字出現幾次(LeetCode 115)。' },
      { name: '交錯字串', desc: 'dp[i][j] = a 前 i 個與 b 前 j 個能否組成 c 前 i+j 個(LeetCode 97)。' },
      { name: '正規表示式 / 萬用字元', desc: '* 的轉移要考慮「用 0 次」和「再用一次」(LeetCode 10、44)。' },
    ],
    compare: [
      { id: 'interval-dp', diff: 'LCS 的兩個維度屬於兩個字串;區間 DP 的兩個維度是同一個字串的左右端。' },
      { id: 'lis', diff: '單一序列的遞增子序列用 LIS 更快。' },
    ],
    interview: ['dp 開 (m+1)×(n+1),第 0 列 / 行代表空字串', '子序列(可跳)vs 子字串(要連續):子字串不同時 dp 歸 0'],
  },
  'interval-dp': {
    level: 3,
    prereq: ['lcs'],
    invariant: 'dp[i][j] 只依賴「更短的區間」。按區間長度由短到長(或 i 由大到小)計算,就能保證用到的子區間都已經算好。',
    template: `def lps(s):                       # 最長回文子序列
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]

# 枚舉切點:dp[i][j] = 最佳(dp[i][k] + dp[k+1][j] + 合併代價)`,
    variants: [
      { name: '戳氣球', desc: '枚舉「最後一個被戳的」k,左右兩邊獨立(LeetCode 312)。' },
      { name: '最長回文子字串', desc: '中心擴展 O(n²) 更簡單;dp[i][j] = s[i]==s[j] and dp[i+1][j−1](LeetCode 5)。' },
      { name: '切棍子最小成本', desc: '把切點排序後做區間 DP(LeetCode 1547)。' },
      { name: '石頭遊戲', desc: 'dp[i][j] = 先手在區間內能多拿多少(LeetCode 877)。' },
    ],
    compare: [
      { id: 'lcs', diff: 'LPS(s) = LCS(s, reverse(s)),兩種解法都可以。' },
      { id: 'dp-1d', diff: '一維 DP 從左往右;區間 DP 從短到長。' },
    ],
    interview: ['計算順序是關鍵:畫出 dp[i][j] 依賴哪些格子', '「最後一個被處理的」是常見的切點選法,讓左右子問題獨立'],
  },
  'state-machine-dp': {
    level: 3,
    prereq: ['dp-1d'],
    invariant: '每一天結束時只可能處在幾種狀態之一(持有 / 不持有 / 冷凍)。dp[狀態] = 處於該狀態的最大利潤;今天的每個狀態只能由昨天的某些狀態轉過來,把所有合法轉移取最大就涵蓋所有操作序列。',
    template: `def max_profit_cooldown(prices):
    hold, sold, rest = float('-inf'), 0, 0
    for p in prices:
        hold, sold, rest = (
            max(hold, rest - p),   # 繼續持有 / 今天買(昨天必須是休息)
            hold + p,              # 今天賣
            max(rest, sold),       # 休息
        )
    return max(sold, rest)`,
    variants: [
      { name: '不限次數', desc: '只有持有 / 不持有兩個狀態(LeetCode 122)。' },
      { name: '最多 k 次', desc: '狀態加上「已交易次數」,dp[k][持有](LeetCode 123、188)。' },
      { name: '手續費', desc: '賣出時扣 fee(LeetCode 714)。' },
      { name: '其他狀態機', desc: '粉刷房子(上一間的顏色)、字串匹配(目前匹配到哪)。' },
    ],
    compare: [
      { id: 'dp-1d', diff: '狀態機 DP = 一維 DP 再加一個「目前狀態」維度。' },
      { id: 'greedy', diff: '不限次數、無手續費時,把每段上漲都吃下的貪心也對。' },
    ],
    interview: ['先畫狀態轉移圖(節點 = 狀態,箭頭 = 操作)再寫方程', '同時更新多個變數時要用舊值,Python 用 tuple 一次賦值'],
  },
  'bitmask-dp': {
    level: 3,
    prereq: ['bit-manipulation', 'dp-general'],
    invariant: '用一個整數的第 j 位表示「第 j 個東西已經用過」。dp[mask] 只依賴「少一個 1」的 mask,而這些 mask 數值一定比較小,所以由小到大跑 mask 就是正確的計算順序。',
    template: `def min_xor_sum(a, b):
    n = len(a)
    dp = [float('inf')] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        i = bin(mask).count('1')        # a 已配到第 i 個
        if i == n:
            continue
        for j in range(n):
            if not mask >> j & 1:
                nxt = mask | 1 << j
                dp[nxt] = min(dp[nxt], dp[mask] + (a[i] ^ b[j]))
    return dp[-1]`,
    variants: [
      { name: '旅行推銷員', desc: 'dp[mask][last] = 走過 mask、停在 last 的最短距離,O(2ⁿ·n²)(LeetCode 847、943)。' },
      { name: '分組 / 分配', desc: '把工作分給工人:枚舉子集 sub = (sub − 1) & mask,總共 O(3ⁿ)(LeetCode 1723)。' },
      { name: '火柴拼正方形', desc: 'dp[mask] = 用了 mask 後目前邊的長度(LeetCode 473)。' },
    ],
    compare: [
      { id: 'backtracking', diff: '回溯走一條路徑;位元 DP 把「走過哪些」相同的路徑合併,從 n! 降到 2ⁿ·n。' },
      { id: 'knapsack', diff: '背包的狀態是「容量」,位元 DP 的狀態是「哪些已經用了」。' },
    ],
    interview: ['看到 n <= 15~20 就該想到 2ⁿ', '常用操作:mask >> j & 1(查)、mask | 1 << j(設)、mask & (mask − 1)(去掉最低位)'],
  },

  // ===== 貪心 =====
  'interval-scheduling': {
    level: 2,
    prereq: ['merge-sort'],
    invariant: '依起點排序後,和「目前合併區間」重疊的區間一定緊接在後面;一旦遇到起點 > 目前終點的區間,之後所有區間的起點只會更大,目前區間就可以定案。',
    template: `def merge(intervals):
    intervals.sort()
    res = [intervals[0]]
    for s, e in intervals[1:]:
        if s <= res[-1][1]:
            res[-1][1] = max(res[-1][1], e)
        else:
            res.append([s, e])
    return res`,
    variants: [
      { name: '最多不重疊區間', desc: '依「終點」排序,每次選最早結束的(LeetCode 435、452)。' },
      { name: '最少會議室', desc: '起點終點拆開排序掃描,或最小堆存結束時間(LeetCode 253)。' },
      { name: '插入區間', desc: '分三段:完全在左、重疊、完全在右(LeetCode 57)。' },
      { name: '區間交集', desc: '兩個列表各一個指標,終點較小的前進(LeetCode 986)。' },
    ],
    compare: [
      { id: 'difference-array', diff: '「同時最多幾個重疊」用差分 / 掃描線也可以。' },
      { id: 'greedy', diff: '區間排程是最經典、最容易證明的貪心。' },
    ],
    interview: ['合併區間依起點排序;選最多不重疊區間依終點排序 —— 要能說出為什麼', '端點相接(例 [1,2] [2,3])算不算重疊要先問'],
  },
  greedy: {
    level: 2,
    prereq: [],
    invariant: '交換論證:假設最佳解在某一步和貪心不同,把那一步換成貪心的選擇,結果不會變差。重複交換就能把最佳解變成貪心解,所以貪心也是最佳。跳躍遊戲則維護「目前能到的最遠位置」,它只增不減。',
    template: `def can_jump(nums):
    reach = 0
    for i, x in enumerate(nums):
        if i > reach:
            return False         # 這格到不了
        reach = max(reach, i + x)
    return True`,
    variants: [
      { name: '跳躍遊戲 II', desc: '當成 BFS 分層:每層的最遠距離就是下一層的邊界(LeetCode 45)。' },
      { name: '加油站', desc: '累積油量變負就從下一站重來(LeetCode 134)。' },
      { name: '分配餅乾 / 分糖果', desc: '排序後雙指標;左右各掃一次(LeetCode 455、135)。' },
      { name: '劃分字母區間', desc: '記錄每個字母最後出現的位置(LeetCode 763)。' },
    ],
    compare: [
      { id: 'dp-general', diff: '貪心是「只看一個選擇」的 DP。舉不出反例、又能做交換論證時才用貪心。' },
      { id: 'binary-search-answer', diff: '很多「最小化最大值」題是二分答案 + 貪心 check。' },
    ],
    interview: ['面試官最常問「為什麼貪心是對的」:準備交換論證或舉反例的習慣', '先想排序依據 —— 大多數貪心的第一步都是排序'],
  },

  // ===== Heap =====
  heap: {
    level: 2,
    prereq: ['tree-bfs'],
    invariant: '大小為 k 的最小堆裡永遠是「目前看過的數中最大的 k 個」。新數比堆頂(這 k 個中最小的)大,就替換掉堆頂;最後堆頂就是第 k 大。',
    template: `import heapq
def kth_largest(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)      # 丟掉最小的
    return h[0]

# 最大堆:Python 存 -x`,
    variants: [
      { name: '前 k 個高頻元素', desc: '計數後用大小 k 的堆,或桶排序 O(n)(LeetCode 347)。' },
      { name: '合併 k 個有序串列', desc: '堆裡放每條串列的目前頭(LeetCode 23)。' },
      { name: '任務排程 / 重排字串', desc: '每次取剩餘最多的,用完放冷卻佇列(LeetCode 621、767)。' },
      { name: '最近的 k 個點', desc: '用最大堆存距離,超過 k 就彈出最遠的(LeetCode 973)。' },
    ],
    compare: [
      { id: 'quick-sort', diff: '快速選擇平均 O(n),但需要全部資料;heap 適合資料流。' },
      { id: 'two-heaps', diff: '要動態中位數時用兩個堆。' },
      { id: 'bst', diff: '需要刪除任意元素或查詢第 k 小時用平衡 BST / SortedList。' },
    ],
    interview: ['找第 k「大」用「最小」堆,大小維持 k —— 方向容易講反', 'heapify 是 O(n),一次一個 push 是 O(n log n)'],
  },
  'two-heaps': {
    level: 3,
    prereq: ['heap'],
    invariant: '左邊最大堆裝較小的一半、右邊最小堆裝較大的一半,並保持:左堆頂 <= 右堆頂,且左堆大小 = 右堆或多 1。所以中位數就在堆頂。',
    template: `import heapq
class MedianFinder:
    def __init__(self):
        self.lo, self.hi = [], []      # lo 是最大堆(存負數)
    def add(self, x):
        heapq.heappush(self.lo, -x)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))
    def median(self):
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2`,
    variants: [
      { name: '滑動視窗中位數', desc: '加上延遲刪除(Hash 記錄待刪),或用 SortedList(LeetCode 480)。' },
      { name: 'IPO', desc: '一個堆存「還不能做的」(依成本),一個存「能做的」(依利潤)(LeetCode 502)。' },
    ],
    compare: [
      { id: 'heap', diff: '單一堆只能拿一端的極值;雙堆可以拿「中間」。' },
      { id: 'bst', diff: '平衡 BST / 有序容器也能做,而且支援刪除任意元素。' },
    ],
    interview: ['「先放左、把左最大移到右、再平衡」三步保證兩個不變量', '追問:資料都在 0..100 → 用計數陣列 O(100) 找中位數'],
  },

  // ===== 字串 =====
  kmp: {
    level: 3,
    prereq: ['string-ops'],
    invariant: 'lps[i] = pattern[0..i] 的「最長相等真前綴與真後綴」長度。失配時,已經比對成功的 j 個字中,後 lps[j−1] 個字恰好等於 pattern 的前 lps[j−1] 個字,所以直接從那裡繼續比,text 指標不用退。',
    template: `def kmp(text, p):
    lps, k = [0] * len(p), 0
    for i in range(1, len(p)):
        while k and p[i] != p[k]:
            k = lps[k - 1]
        if p[i] == p[k]:
            k += 1
        lps[i] = k
    j = 0
    for i, c in enumerate(text):
        while j and c != p[j]:
            j = lps[j - 1]
        if c == p[j]:
            j += 1
        if j == len(p):
            return i - j + 1
    return -1`,
    variants: [
      { name: '最短回文串', desc: '對 s + "#" + reverse(s) 求 lps,最後的值就是最長回文前綴(LeetCode 214)。' },
      { name: '重複子字串', desc: 'n % (n − lps[−1]) == 0 ⇒ 由週期重複組成(LeetCode 459)。' },
      { name: 'Z 函數', desc: 'z[i] = s 和 s[i:] 的最長共同前綴,和 KMP 能解同樣的問題。' },
      { name: 'Rabin-Karp', desc: '滾動雜湊比較,適合多模式或二維匹配(LeetCode 1044 搭配二分)。' },
    ],
    compare: [
      { id: 'trie', diff: '多個 pattern 同時匹配用 Aho-Corasick(Trie + KMP 的失配指標)。' },
      { id: 'string-ops', diff: '一般題目直接用內建 find 即可;KMP 用在需要 lps 結構本身的題目。' },
    ],
    interview: ['暴力 O(nm) 的浪費在於 text 指標回退;KMP 的重點是「不回退」', 'lps 的計算本身就是 pattern 和自己做 KMP'],
  },
  'string-ops': {
    level: 1,
    prereq: [],
    invariant: '長度前綴編碼:每個字串寫成「長度 + # + 內容」。解碼時先讀到 # 得到長度 L,再直接取 L 個字元 —— 內容裡就算有 #,也因為長度已知而不會被誤判。',
    template: `def encode(words):
    return ''.join(f'{len(w)}#{w}' for w in words)

def decode(s):
    res, i = [], 0
    while i < len(s):
        j = s.index('#', i)
        L = int(s[i:j])
        res.append(s[j + 1:j + 1 + L])
        i = j + 1 + L
    return res`,
    variants: [
      { name: '回文判斷', desc: '左右雙指標,跳過非字母數字(LeetCode 125)。' },
      { name: '中心擴展', desc: '每個位置(和兩字之間)往外擴,O(n²) 找最長回文(LeetCode 5、647)。' },
      { name: '字串建構', desc: 'Python / Java 用 list + join / StringBuilder,避免 O(n²) 串接。' },
      { name: '字元計數', desc: '26 格陣列當 key 判斷異位詞(LeetCode 242、49)。' },
    ],
    compare: [
      { id: 'kmp', diff: '子字串搜尋需要線性保證時用 KMP。' },
      { id: 'sliding-window', diff: '子字串的最長 / 最短問題通常是滑動視窗。' },
    ],
    interview: ['先問字元集:只有小寫?Unicode?大小寫敏感?', 'Python、Java 字串不可變,反覆 += 會是 O(n²)'],
  },

  // ===== 進階 =====
  trie: {
    level: 2,
    prereq: ['tree-dfs', 'hash-map'],
    invariant: '從根走到某節點的路徑字母連起來,就是一個前綴;所有共用這個前綴的單字共用這條路徑。節點上的 end 標記區分「是完整單字」還是「只是前綴」。',
    template: `class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, w):
        node = self.root
        for c in w:
            node = node.setdefault(c, {})
        node['$'] = True              # 單字結尾
    def _walk(self, s):
        node = self.root
        for c in s:
            if c not in node:
                return None
            node = node[c]
        return node
    def search(self, w):
        n = self._walk(w)
        return n is not None and '$' in n
    def starts_with(self, p):
        return self._walk(p) is not None`,
    variants: [
      { name: '萬用字元搜尋', desc: '遇到 . 就 DFS 所有子節點(LeetCode 211)。' },
      { name: '網格找多個單字', desc: '把單字建成 Trie,DFS 時同步在 Trie 上走,並剪掉找完的分支(LeetCode 212)。' },
      { name: '最大 XOR', desc: '把數字的二進位位元建成 Trie,每位盡量走相反的位(LeetCode 421)。' },
      { name: '自動完成', desc: '節點存熱門度或前 k 個建議(LeetCode 642)。' },
    ],
    compare: [
      { id: 'hash-map', diff: '只查完整單字時 Hash Set 更簡單;要「前綴」查詢時 Trie 才有優勢。' },
      { id: 'kmp', diff: 'Aho-Corasick = Trie + 失配指標,一次匹配多個 pattern。' },
    ],
    interview: ['子節點用陣列 [26] 還是 dict:陣列快但耗空間', '空間是 O(總字元數 × 字母表大小)(陣列版)'],
  },
  'segment-tree': {
    level: 3,
    prereq: ['prefix-sum', 'tree-dfs'],
    invariant: '每個節點存一段區間的彙總值(和、最大…),子節點把區間對半分。任何查詢區間都能拆成 O(log n) 個「完整落在裡面」的節點,所以查詢和單點修改都是 O(log n)。',
    template: `class BIT:                         # 樹狀陣列:單點加、前綴和
    def __init__(self, n):
        self.t = [0] * (n + 1)
    def add(self, i, v):           # i 從 1 開始
        while i < len(self.t):
            self.t[i] += v
            i += i & -i
    def sum(self, i):              # a[1..i]
        s = 0
        while i:
            s += self.t[i]
            i -= i & -i
        return s
# 區間 [l, r] 的和 = sum(r) - sum(l - 1)`,
    variants: [
      { name: '懶標記', desc: '區間修改時先記在節點上,往下走時才推給子節點,O(log n)。' },
      { name: '逆序對 / 右側較小數', desc: '從右往左掃,用 BIT 計數「已經出現的比我小的數」(LeetCode 315、493)。' },
      { name: '離散化', desc: '值域很大時先排序映射成 1..n。' },
      { name: '最大值線段樹', desc: '把「和」換成「max」,區間最大值 / 天際線(LeetCode 218、699)。' },
    ],
    compare: [
      { id: 'prefix-sum', diff: '陣列不修改時前綴和 O(1) 查詢;有修改時才需要 BIT / 線段樹。' },
      { id: 'difference-array', diff: '所有修改都在查詢之前時,差分就夠了。' },
    ],
    interview: ['BIT 程式碼短,適合「單點修改 + 前綴查詢」;線段樹更通用(區間修改、最大值)', 'i & −i 取出最低位的 1,決定節點管轄的長度'],
  },
  'bit-manipulation': {
    level: 2,
    prereq: [],
    invariant: 'XOR 滿足交換律與結合律,而且 x ^ x = 0、x ^ 0 = x。所以把全部數 XOR 起來,成對出現的互相抵消,只剩下出現一次的那個。',
    template: `def single(nums):
    x = 0
    for n in nums:
        x ^= n
    return x

# 常用:
# x & 1           奇偶
# x >> k & 1      第 k 位
# x & (x - 1)     去掉最低位的 1(數 1 的個數)
# x & -x          只留最低位的 1`,
    variants: [
      { name: '兩個只出現一次的數', desc: 'XOR 全部得 a^b,用最低位的 1 把數分成兩組(LeetCode 260)。' },
      { name: '其他出現三次', desc: '逐位統計 1 的個數 mod 3(LeetCode 137)。' },
      { name: '數 1 的個數', desc: 'dp[i] = dp[i >> 1] + (i & 1)(LeetCode 191、338)。' },
      { name: '不用加號做加法', desc: '和 = a ^ b,進位 = (a & b) << 1,重複到沒有進位(LeetCode 371)。' },
      { name: '缺失的數', desc: 'XOR 0..n 和所有數(LeetCode 268)。' },
    ],
    compare: [
      { id: 'hash-map', diff: 'Hash 計數 O(n) 空間;位元技巧 O(1) 空間。' },
      { id: 'bitmask-dp', diff: '用整數的位元表示「集合」,是位元 DP 的基礎。' },
    ],
    interview: ['Python 整數沒有位數上限,處理負數時要 & 0xFFFFFFFF 模擬 32 位元', '運算子優先順序:& 比 == 低,記得加括號(C / Java)'],
  },
  math: {
    level: 2,
    prereq: [],
    invariant: '埃氏篩:每個合數 c 都有一個 <= √c 的質因數 p,所以只要用 p <= √n 的質數往後劃,而且從 p² 開始劃就夠了(更小的倍數早被更小的質數劃過)。',
    template: `def count_primes(n):
    if n < 3:
        return 0
    is_p = [True] * n
    is_p[0] = is_p[1] = False
    p = 2
    while p * p < n:
        if is_p[p]:
            for m in range(p * p, n, p):
                is_p[m] = False
        p += 1
    return sum(is_p)

def gcd(a, b):
    while b:
        a, b = b, a % b
    return a`,
    variants: [
      { name: '快速冪', desc: '指數二進位拆開,O(log n)(LeetCode 50);常搭配取模 1e9+7。' },
      { name: '最大公因數', desc: '輾轉相除 O(log min(a, b));lcm = a / gcd · b。' },
      { name: '組合數', desc: '預處理階乘與模反元素,O(1) 算 C(n, k)。' },
      { name: '幾何 / 斜率', desc: '用 gcd 約分後的 (dy, dx) 當 key,避免浮點誤差(LeetCode 149)。' },
    ],
    compare: [
      { id: 'bit-manipulation', diff: '快速冪就是對指數做位元拆解。' },
      { id: 'dp-general', diff: '計數題答案太大時,常常是 DP + 取模。' },
    ],
    interview: ['先算數值範圍:會不會溢位?需要取模嗎?', 'O(n log log n) 的由來:Σ n/p ≈ n · ln ln n'],
  },
}
