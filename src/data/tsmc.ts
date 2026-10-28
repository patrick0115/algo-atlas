// 台積電 HackerRank 衝刺:照線上測驗常考比例挑的 60 題。
// 比例依網路面試心得(3 題 / 90 分鐘,難度多為 E/E/M 或 E/M/M,偏陣列與字串處理)估出來,不是官方資料。
// 題目中繼資料(英文題名、難度、成功率)在 hackerrank.json,由 scripts/fetch-hackerrank.mjs 依這份清單抓取。
// 演算法 id 見 categories.ts;lc 是 LeetCode 上解法相同或相近的題號,沒有就不寫。

import type { Difficulty } from '../types'
import hr from './hackerrank.json'

export interface TsmcTopic {
  id: string
  name: string
  /** 佔全部題數的百分比 */
  weight: number
  why: string
}

export interface TsmcEntry {
  slug: string
  topic: string
  title: string
  titleZh: string
  difficulty: Difficulty
  patterns: string[]
  key: string
  lc?: number
  /** HackerRank 成功率(%) */
  success: number
}

export const TSMC_TOPICS: TsmcTopic[] = [
  { id: 'string', name: '字串處理 / 解析', weight: 25, why: '心得裡最常出現,題目偏實務的字串清理、格式驗證' },
  { id: 'array', name: '陣列 / 排序 / 前綴和', weight: 20, why: '簡單題的主力,邊界情況多' },
  { id: 'hash', name: '雜湊表', weight: 15, why: '計數、去重、配對,很多題的最佳解都靠它' },
  { id: 'greedy', name: '貪婪 / 二分搜尋', weight: 10, why: '中等題常見' },
  { id: 'stack', name: '堆疊 / 佇列', weight: 8, why: '括號、模擬、單調堆疊' },
  { id: 'dp', name: '動態規劃', weight: 8, why: '偶爾出現在 M / H 題' },
  { id: 'graph', name: '圖 / 樹(BFS、DFS)', weight: 8, why: '偶爾出現在 M / H 題' },
  { id: 'math', name: '數學 / 位元', weight: 6, why: '零星出現' },
]

type Row = [slug: string, titleZh: string, patterns: string[], key: string, lc?: number]

const ROWS: Record<string, Row[]> = {
  string: [
    ['alternating-characters', '交替字元', ['string-ops'], '數相鄰兩字元相同的次數,就是要刪的數量'],
    ['ctci-making-anagrams', '做出變位詞', ['hash-map', 'string-ops'], '26 格計數相減,差值的絕對值加總'],
    ['sherlock-and-valid-string', '有效字串', ['hash-map'], '先數字元次數,再數「次數的次數」,只容許刪一個字元'],
    ['special-palindrome-again', '特殊字串', ['string-ops'], '壓成連續段;同字元段 n(n+1)/2,再數「aabaa」型中心'],
    ['camelcase', '駝峰字數', ['string-ops'], '數大寫字母,加 1'],
    ['pangrams', '全字母句', ['hash-map'], '轉小寫後用集合收 26 個字母', 1832],
    ['reduced-string', '超級縮減字串', ['stack', 'string-ops'], '堆疊:和頂端相同就彈出,否則推入', 1047],
    ['caesar-cipher-1', '凱薩密碼', ['string-ops'], '只動字母,大小寫各自 (c - base + k) % 26'],
    ['strong-password', '強密碼', ['string-ops'], '缺幾類字元與 6 - n,取較大的'],
    ['bear-and-steady-gene', '穩定基因', ['sliding-window', 'hash-map'], '滑動視窗:視窗外每種字母都不超過 n/4 時縮左界', 1234],
    ['hackerrank-in-a-string', '字串裡的 HackerRank', ['two-pointers'], '雙指標判斷是不是子序列', 392],
    ['palindrome-index', '回文索引', ['two-pointers'], '左右夾到第一個不同,試刪左或刪右', 680],
    ['weighted-uniform-string', '加權單一字元字串', ['hash-map'], '掃連續同字元段,把每個前綴權重放進集合'],
    ['separate-the-numbers', '拆成遞增數列', ['string-ops'], '枚舉第一個數的長度,往後接 +1 比對'],
    ['richie-rich', '最大回文數', ['greedy', 'two-pointers'], '先花最少次數變成回文,剩下的次數從外往內改成 9'],
  ],
  array: [
    ['sock-merchant', '配對襪子', ['hash-map'], '每種顏色數量 / 2 加總'],
    ['counting-valleys', '數山谷', ['simulation'], '追蹤海拔,從 -1 回到 0 就是一個山谷'],
    ['jumping-on-the-clouds', '跳雲朵', ['greedy'], '能跳 2 格就跳 2 格'],
    ['repeated-string', '重複字串', ['math', 'string-ops'], '整段次數 × 一段的 a 數,加上餘下前綴的 a 數'],
    ['2d-array', '沙漏和', ['simulation'], '枚舉 16 個沙漏的左上角,加 7 格'],
    ['ctci-array-left-rotation', '陣列左旋', ['simulation'], '新位置 i 取 a[(i + d) % n]', 189],
    ['new-year-chaos', '新年大混亂', ['simulation', 'greedy'], '往前超過 2 格就 Too chaotic;賄賂數 = 從 q[i]-2 起比它大的數'],
    ['minimum-swaps-2', '最少交換次數 2', ['simulation', 'greedy'], '每個位置把正確的數換回來,或數置換環'],
    ['crush', '陣列操作', ['difference-array', 'prefix-sum'], '差分陣列:a 加 k、b+1 減 k,前綴和取最大', 1109],
    ['mark-and-toys', '馬克買玩具', ['greedy'], '價格排序,從便宜的買到錢不夠'],
    ['fraudulent-activity-notifications', '詐騙警示', ['counting-sort', 'sliding-window'], '金額 ≤ 200:計數陣列維護視窗,掃計數找中位數'],
    ['closest-numbers', '最接近的數', ['greedy'], '排序後只要看相鄰兩數的差'],
  ],
  hash: [
    ['ctci-ransom-note', '勒索信', ['hash-map'], '雜誌單字計數,信的每個字扣一次', 383],
    ['two-strings', '兩個字串', ['hash-map'], '有沒有共同字元:26 個字母集合取交集'],
    ['sherlock-and-anagrams', '變位詞子字串', ['hash-map'], '每個子字串排序當鍵,同鍵 c 個貢獻 c(c-1)/2'],
    ['count-triplets-1', '數三元組', ['hash-map'], '兩個表:左邊有幾個 x/r、能當中間的有幾對'],
    ['frequency-queries', '頻率查詢', ['hash-map'], '值→次數、次數→有幾個值,兩張表一起改'],
    ['ctci-ice-cream-parlor', '冰淇淋店', ['hash-map'], '一次遍歷:查 money - cost 出現過沒', 1],
    ['pairs', '差為 k 的數對', ['hash-map'], '放進集合,每個 x 查 x + k', 532],
    ['missing-numbers', '遺失的數字', ['hash-map', 'counting-sort'], '兩邊計數相減,大於 0 的值由小到大輸出'],
    ['migratory-birds', '候鳥', ['hash-map'], '計數取最多,同次數取最小 id'],
  ],
  greedy: [
    ['minimum-absolute-difference-in-an-array', '最小絕對差', ['greedy'], '排序後最小差一定在相鄰兩數', 1200],
    ['luck-balance', '運氣平衡', ['greedy'], '重要比賽運氣由大到小,只輸前 k 場'],
    ['greedy-florist', '貪心花店', ['greedy'], '最貴的花先買,第 i 輪乘 (i / k + 1)'],
    ['angry-children', '最大最小差', ['sliding-window'], '排序後看長度 k 的視窗,頭尾差取最小'],
    ['minimum-time-required', '最少所需天數', ['binary-search-answer'], '二分天數 d:Σ d / machine ≥ goal 就可行'],
    ['triple-sum', '三元和', ['binary-search'], '去重排序,每個 q 用二分數 a、c 中 ≤ q 的個數相乘'],
  ],
  stack: [
    ['balanced-brackets', '括號平衡', ['stack'], '左括號推入,右括號要對上頂端', 20],
    ['ctci-queue-using-two-stacks', '兩個堆疊做佇列', ['stack'], '進棧放新的,出棧空了才整批倒過來', 232],
    ['largest-rectangle', '最大矩形', ['monotonic-stack'], '單調遞增堆疊,彈出時算以它為高的寬度', 84],
    ['maximum-element', '最大元素', ['stack'], '第二個堆疊同步記「到目前為止的最大值」', 155],
    ['castle-on-the-grid', '網格上的城堡', ['graph-traversal'], 'BFS,每一步沿一個方向一直滑到牆'],
  ],
  dp: [
    ['max-array-sum', '不相鄰最大和', ['dp-1d'], 'dp[i] = max(dp[i-1], dp[i-2] + a[i], a[i])', 198],
    ['abbr', '縮寫', ['lcs', 'dp-general'], 'dp[i][j]:a 前 i 個能否變成 b 前 j 個;小寫可刪或轉大寫'],
    ['candies', '發糖果', ['greedy', 'dp-1d'], '左掃一次、右掃一次,取兩邊的較大值', 135],
    ['coin-change', '硬幣找零方法數', ['knapsack'], '完全背包算組合數:外層硬幣、內層金額', 518],
    ['common-child', '共同子序列', ['lcs'], '最長共同子序列,滾動陣列省空間', 1143],
  ],
  graph: [
    ['torque-and-development', '道路與圖書館', ['union-find', 'graph-traversal'], '路比館便宜:每個連通塊 1 館 + (大小-1) 條路'],
    ['ctci-connected-cell-in-a-grid', '最大連通區域', ['graph-traversal'], '八方向 DFS / BFS 數每塊的大小', 695],
    ['bfsshortreach', 'BFS 最短距離', ['graph-traversal'], '無權圖 BFS,每條邊 6,到不了 -1'],
    ['journey-to-the-moon', '登月之旅', ['union-find'], '算各國人數,不同國的配對 = 累加 size × 已累計人數'],
    ['even-tree', '偶數樹', ['tree-dfs'], 'DFS 算子樹大小,偶數大小的子樹都可切一刀'],
  ],
  math: [
    ['flipping-bits', '翻轉位元', ['bit-manipulation'], '32 位元全翻 = 2^32 - 1 - n'],
    ['recursive-digit-sum', '遞迴數字和', ['math'], '數字根:先算一次位數和乘 k,再對 9 取餘'],
    ['lonely-integer', '孤單的數', ['bit-manipulation'], '全部 XOR,成對的抵消', 136],
  ],
}

const DIFF: Record<string, Difficulty> = { E: 'Easy', M: 'Medium', H: 'Hard' }
// hackerrank.json 每列:[slug, 英文題名, 難度 E/M/H, 分類, 成功率 %, 解題人數]
const META = new Map((hr.problems as [string, string, string, string, number, number][]).map((r) => [r[0], r]))

export const TSMC_DATE: string = hr.fetchedAt

export const TSMC: TsmcEntry[] = TSMC_TOPICS.flatMap((t) =>
  ROWS[t.id].map(([slug, titleZh, patterns, key, lc]) => {
    const m = META.get(slug)
    return { slug, topic: t.id, title: m?.[1] ?? slug, titleZh, difficulty: DIFF[m?.[2] ?? 'M'], patterns, key, ...(lc ? { lc } : {}), success: m?.[4] ?? 0 }
  }),
)
