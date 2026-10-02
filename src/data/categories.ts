// 演算法地圖 + 官方標籤 → 演算法的自動歸類規則。
// 有動畫的演算法登記在 patterns/index.ts;這裡只管名稱與分類。

export interface PatternStub {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
  patterns: PatternStub[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'sorting',
    name: '排序',
    patterns: [
      { id: 'bubble-sort', name: '氣泡排序' },
      { id: 'selection-sort', name: '選擇排序' },
      { id: 'insertion-sort', name: '插入排序' },
      { id: 'merge-sort', name: '合併排序' },
      { id: 'quick-sort', name: '快速排序 / 快速選擇' },
      { id: 'heap-sort', name: '堆積排序' },
      { id: 'counting-sort', name: '計數 / 桶排序' },
    ],
  },
  {
    id: 'array',
    name: '陣列與指標',
    patterns: [
      { id: 'two-pointers', name: '雙指標' },
      { id: 'sliding-window', name: '滑動視窗' },
      { id: 'prefix-sum', name: '前綴和' },
      { id: 'difference-array', name: '差分陣列' },
      { id: 'simulation', name: '模擬 / 陣列操作' },
    ],
  },
  {
    id: 'search',
    name: '搜尋',
    patterns: [
      { id: 'binary-search', name: '二分搜尋' },
      { id: 'binary-search-answer', name: '對答案二分' },
    ],
  },
  {
    id: 'hash',
    name: '雜湊',
    patterns: [{ id: 'hash-map', name: 'Hash Map 查找 / 計數' }],
  },
  {
    id: 'stack-queue',
    name: '堆疊與佇列',
    patterns: [
      { id: 'stack', name: '堆疊' },
      { id: 'monotonic-stack', name: '單調堆疊' },
      { id: 'monotonic-queue', name: '單調佇列' },
    ],
  },
  {
    id: 'linked-list',
    name: '鏈結串列',
    patterns: [
      { id: 'linked-list', name: '反轉與操作' },
      { id: 'fast-slow', name: '快慢指標' },
    ],
  },
  {
    id: 'tree',
    name: '樹',
    patterns: [
      { id: 'tree-dfs', name: 'DFS 遍歷' },
      { id: 'tree-bfs', name: 'BFS 層序' },
      { id: 'bst', name: '二元搜尋樹' },
      { id: 'lca', name: '最近公共祖先' },
    ],
  },
  {
    id: 'graph',
    name: '圖',
    patterns: [
      { id: 'graph-traversal', name: 'BFS / DFS' },
      { id: 'topological-sort', name: '拓撲排序' },
      { id: 'union-find', name: '並查集' },
      { id: 'dijkstra', name: '最短路徑 Dijkstra' },
      { id: 'mst', name: '最小生成樹' },
    ],
  },
  {
    id: 'backtracking',
    name: '回溯',
    patterns: [{ id: 'backtracking', name: '子集 / 排列 / 組合' }],
  },
  {
    id: 'dp',
    name: '動態規劃',
    patterns: [
      { id: 'dp-general', name: 'DP 入門 / 其他' },
      { id: 'dp-1d', name: '一維 DP' },
      { id: 'dp-grid', name: '網格 DP' },
      { id: 'knapsack', name: '背包' },
      { id: 'lis', name: '最長遞增子序列' },
      { id: 'lcs', name: 'LCS / 編輯距離' },
      { id: 'interval-dp', name: '區間 DP' },
      { id: 'state-machine-dp', name: '狀態機 DP' },
      { id: 'bitmask-dp', name: '位元 DP' },
    ],
  },
  {
    id: 'greedy',
    name: '貪心',
    patterns: [
      { id: 'interval-scheduling', name: '區間問題' },
      { id: 'greedy', name: '貪心(其他)' },
    ],
  },
  {
    id: 'heap',
    name: 'Heap',
    patterns: [
      { id: 'heap', name: 'Heap / Top-K' },
      { id: 'two-heaps', name: '雙堆' },
    ],
  },
  {
    id: 'string',
    name: '字串',
    patterns: [
      { id: 'kmp', name: 'KMP 字串匹配' },
      { id: 'string-ops', name: '字串處理' },
    ],
  },
  {
    id: 'advanced',
    name: '進階',
    patterns: [
      { id: 'trie', name: 'Trie 字典樹' },
      { id: 'segment-tree', name: '線段樹 / BIT' },
      { id: 'bit-manipulation', name: '位元運算' },
      { id: 'math', name: '數學' },
    ],
  },
]

export function findStub(id: string): { cat: Category; stub: PatternStub } | undefined {
  for (const cat of CATEGORIES) {
    const stub = cat.patterns.find((p) => p.id === id)
    if (stub) return { cat, stub }
  }
}

/** 沒有人工精標的題目,用 LeetCode 官方標籤自動歸類 */
export function autoPatterns(tags: string[]): string[] {
  const has = (...t: string[]) => t.some((x) => tags.includes(x))
  const out: string[] = []
  const add = (cond: boolean, id: string) => cond && !out.includes(id) && out.push(id)

  add(has('two-pointers'), 'two-pointers')
  add(has('sliding-window'), 'sliding-window')
  add(has('prefix-sum'), 'prefix-sum')
  add(has('binary-search') && !has('binary-search-tree'), 'binary-search')
  add(has('monotonic-stack'), 'monotonic-stack')
  add(has('monotonic-queue'), 'monotonic-queue')
  add(has('stack') && !has('monotonic-stack'), 'stack')
  add(has('linked-list'), 'linked-list')
  add(has('merge-sort'), 'merge-sort')
  add(has('quickselect'), 'quick-sort')
  add(has('counting-sort', 'bucket-sort', 'radix-sort'), 'counting-sort')
  add(has('heap-priority-queue'), 'heap')

  const tree = has('tree', 'binary-tree')
  add(has('binary-search-tree'), 'bst')
  add(tree && (has('depth-first-search') || !has('breadth-first-search')), 'tree-dfs')
  add(tree && has('breadth-first-search'), 'tree-bfs')

  add(!tree && has('breadth-first-search', 'depth-first-search', 'graph'), 'graph-traversal')
  add(has('topological-sort'), 'topological-sort')
  add(has('union-find'), 'union-find')
  add(has('shortest-path'), 'dijkstra')
  add(has('minimum-spanning-tree'), 'mst')
  add(has('backtracking'), 'backtracking')

  const dp = has('dynamic-programming', 'memoization')
  add(dp && has('bitmask'), 'bitmask-dp')
  add(dp && has('matrix') && !has('bitmask'), 'dp-grid')
  add(dp && !has('matrix', 'bitmask'), 'dp-general')
  add(has('greedy'), 'greedy')

  add(has('trie'), 'trie')
  add(has('segment-tree', 'binary-indexed-tree'), 'segment-tree')
  add(has('string-matching'), 'kmp')
  add(has('string') && out.length === 0 && !dp, 'string-ops')
  add(has('bit-manipulation', 'bitmask') && !dp, 'bit-manipulation')

  // 太寬的標籤只在沒有更精確歸類時使用
  if (out.length === 0) {
    add(has('hash-table', 'counting'), 'hash-map')
    add(has('math', 'number-theory', 'combinatorics', 'geometry'), 'math')
  }
  if (out.length === 0) add(has('simulation', 'array', 'matrix', 'sorting', 'enumeration', 'design', 'brainteaser', 'game-theory', 'interactive', 'randomized', 'iterator', 'data-stream'), 'simulation')
  return out
}

/** 非演算法題(SQL / Shell / 多執行緒 / 無標籤的 JS 練習),不列入涵蓋率 */
export function isNonAlgo(tags: string[]): boolean {
  return tags.length === 0 || tags.some((t) => t === 'database' || t === 'shell' || t === 'concurrency')
}
