import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const SAMPLE = [1, 2, 3, 4, 3, 2, 1]

function countingFig(): FigStep[] {
  const counts = new Map<number, number>()
  const out: FigStep[] = []
  for (let i = 0; i < SAMPLE.length; i++) {
    const x = SAMPLE[i]
    counts.set(x, (counts.get(x) ?? 0) + 1)
    out.push({
      note: `讀到第 ${i + 1} 個數 ${x}，它目前出現 ${counts.get(x)} 次；最後找次數為 1 的鍵。`,
      views: [arr(SAMPLE, { label: '輸入', highlight: [i] }), kv(counts, '數值 → 次數', [x])],
    })
  }
  return out
}

function xorFig(): FigStep[] {
  const out: FigStep[] = []
  let value = 0
  for (let i = 0; i < SAMPLE.length; i++) {
    const before = value
    value ^= SAMPLE[i]
    out.push({
      note: `累計值 ${before} XOR ${SAMPLE[i]} = ${value}；成對的數第二次出現時會互相抵消。`,
      views: [arr(SAMPLE, { label: '依序讀取', highlight: [i], dim: Array.from({ length: i }, (_, j) => j) }), kv([['之前', before], ['目前數', SAMPLE[i]], ['XOR 結果', value]], '運算狀態')],
    })
  }
  return out
}

export const hrLonelyInteger: HrSolution = {
  slug: 'lonely-integer',
  plain: '一排襪子都能配成雙，只有一隻落單；找出那隻襪子的編號。',
  statement: '給一個整數陣列，恰有一個值只出現一次，其餘值都各出現兩次。回傳只出現一次的值。',
  examples: [
    { input: 'a = [1, 2, 3, 4, 3, 2, 1]', output: '4', note: '1、2、3 各成對，4 沒有同伴。' },
    { input: 'a = [7]', output: '7', note: '只有一個值，它就是答案。' },
  ],
  constraints: [
    '陣列長度為奇數且至少 1 → 必定至少留下那個單獨值。',
    '其他值恰好各出現兩次 → XOR 可以把每一對消成 0。',
    '值落在 0 到 100，長度小於 100 → C 可用固定 101 格計數陣列。',
    '陣列長度為奇數 → 不可能讓所有元素都兩兩配對，保證至少有一個落單值。',
  ],
  insight: [
    '最直接是為每個值數出現次數，找次數等於 1 的值；這需要一張計數表。',
    '題目特別保證其他數都成對，所以不必保留完整次數，只要讓同值互相抵消。',
    '`x XOR x = 0`、`0 XOR x = x`，而 XOR 的順序不影響結果；一路 XOR 最後只剩落單值。這是 [[p:bit-manipulation]] 的常見技巧，也見 [136](#/q/136)。',
  ],
  approaches: [
    {
      name: '計數表',
      idea: '記錄每個值出現幾次，再挑出次數為 1 的值。',
      steps: ['建立空的值到次數對照表。', '逐一讀取陣列，將對應次數加一。', '再走訪對照表，找到次數為 1 的鍵並回傳。'],
      figure: { title: 'a = [1, 2, 3, 4, 3, 2, 1]', steps: countingFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '掃過輸入及計數表各一次；不同數值最多有 n 個。' },
      verdict: '直觀，且可處理更一般的出現次數問題；需要額外計數表。',
      code: {
        python: `def lonelyinteger(a):
    counts = {}
    for x in a:
        counts[x] = counts.get(x, 0) + 1  # 記錄每個值的次數
    for x, count in counts.items():
        if count == 1:
            return x`,
        c: `int lonelyinteger(int a_count, int* a) {
    int counts[101] = {0};
    for (int i = 0; i < a_count; i++) {
        counts[a[i]]++;
    }
    for (int value = 0; value <= 100; value++) {
        if (counts[value] == 1) return value;
    }
    return -1;
}`,
        cpp: `int lonelyinteger(vector<int> a) {
    unordered_map<int, int> counts;
    for (int x : a) counts[x]++;
    for (auto [x, count] : counts) {
        if (count == 1) return x;
    }
    return -1;
}`,
        java: `public static int lonelyinteger(List<Integer> a) {
    Map<Integer, Integer> counts = new HashMap<>();
    for (int x : a) counts.put(x, counts.getOrDefault(x, 0) + 1);
    for (Map.Entry<Integer, Integer> entry : counts.entrySet()) {
        if (entry.getValue() == 1) return entry.getKey();
    }
    return -1;
}`,
        javascript: `function lonelyinteger(a) {
    const counts = new Map();
    for (const x of a) counts.set(x, (counts.get(x) ?? 0) + 1);
    for (const [x, count] of counts) {
        if (count === 1) return x;
    }
    return -1;
}`,
      },
    },
    {
      name: '逐一 XOR',
      idea: '每個成對的值都會抵消，最後的累計值就是答案。',
      steps: ['把累計值設為 0。', '對每個輸入值，以 XOR 更新累計值。', '掃描結束後回傳累計值。'],
      figure: { title: 'a = [1, 2, 3, 4, 3, 2, 1]', steps: xorFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個元素只做一次固定時間的 XOR，僅保存一個整數。' },
      verdict: '在題目「其餘數值都成對」的保證下，這是最省空間的解法。',
      code: {
        python: `def lonelyinteger(a):
    answer = 0
    for x in a:
        answer ^= x  # 相同的數 XOR 兩次會抵消
    return answer`,
        c: `int lonelyinteger(int a_count, int* a) {
    int answer = 0;
    for (int i = 0; i < a_count; i++) {
        answer ^= a[i];
    }
    return answer;
}`,
        cpp: `int lonelyinteger(vector<int> a) {
    int answer = 0;
    for (int x : a) answer ^= x;
    return answer;
}`,
        java: `public static int lonelyinteger(List<Integer> a) {
    int answer = 0;
    for (int x : a) answer ^= x;
    return answer;
}`,
        javascript: `function lonelyinteger(a) {
    let answer = 0;
    for (const x of a) answer ^= x;
    return answer;
}`,
      },
    },
  ],
  pitfalls: [
    'XOR 的方法依賴「只有一個單獨值，其他都恰好兩次」；任意次數不能照搬。',
    '初始值要用 0，因為 0 XOR x 才等於 x。',
    'JavaScript 位元運算會轉為 32 位整數；本題值在安全的整數範圍內。',
    '計數法中若某數值為 0，也要當作有效的鍵，不能用真偽值判斷它是否存在。',
    '回傳的是落單的數值，不是它在陣列裡的索引。',
    '只有一個元素時，迴圈仍應正確回傳該元素。',
  ],
  followUp: [
    {
      q: '如果其他值都出現三次，仍能直接 XOR 嗎？',
      a: '不能。同值 XOR 三次會留下原值；可改用逐位計數並對 3 取餘數。',
    },
    {
      q: '如果有兩個值各只出現一次，怎麼找出兩者？',
      a: '先 XOR 得到兩個答案的 XOR。找出其中一個為 1 的位元，依該位把輸入分成兩組；每組再各自 XOR。',
    },
    {
      q: '若數值範圍不再受限，計數法如何寫？',
      a: '使用雜湊表，以數值為鍵紀錄出現次數；空間會隨不同數值的數量增長。',
    },
    {
      q: 'XOR 為什麼不需要先把相同數排序到一起？',
      a: 'XOR 具有交換律與結合律；不論兩個相同值相隔多遠，最後都能互相抵消。',
    },
  ],
  check: {
    kind: 'fn', fn: 'lonelyinteger',
    cases: [
      { args: [[1, 2, 3, 4, 3, 2, 1]], out: 4 },
      { args: [[7]], out: 7 },
      { args: [[0, 1, 0]], out: 1 },
      { args: [[5, 5, 9]], out: 9 },
      { args: [[8, 3, 8, 3, 12]], out: 12 },
      { args: [[2, 6, 2, 10, 6]], out: 10 },
    ],
  },
}
