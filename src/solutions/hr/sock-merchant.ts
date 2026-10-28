import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const SOCKS = [10, 20, 20, 10, 10, 30, 50, 10, 20]

function pairFig(): FigStep[] {
  const out: FigStep[] = []
  const used = new Set<number>()
  let pairs = 0
  for (let i = 0; i < SOCKS.length; i++) {
    if (used.has(i)) continue
    let mate = -1
    for (let j = i + 1; j < SOCKS.length; j++) {
      if (!used.has(j) && SOCKS[i] === SOCKS[j]) {
        mate = j
        break
      }
    }
    if (mate >= 0) {
      used.add(mate)
      pairs++
    }
    out.push({ note: `拿位置 ${i} 的顏色 ${SOCKS[i]}，${mate >= 0 ? `找到位置 ${mate} 配對` : '右邊沒有未使用的同色襪'}；目前 ${pairs} 雙。`, views: [arr(SOCKS, { label: '襪子', highlight: mate >= 0 ? [i, mate] : [i], done: [...used] }), kv([['已配對', pairs], ['目前顏色', SOCKS[i]], ['配對位置', mate]])] })
  }
  return out
}

function countFig(): FigStep[] {
  const out: FigStep[] = []
  const count = new Map<number, number>()
  let pairs = 0
  for (let i = 0; i < SOCKS.length; i++) {
    const color = SOCKS[i]
    const next = (count.get(color) ?? 0) + 1
    count.set(color, next)
    if (next % 2 === 0) pairs++
    out.push({ note: `讀到位置 ${i} 的顏色 ${color}，這色目前 ${next} 隻；${next % 2 === 0 ? `剛湊成一雙，總共 ${pairs} 雙` : `尚缺另一隻，仍是 ${pairs} 雙`}。`, views: [arr(SOCKS, { label: '掃描', highlight: [i] }), kv([...count], '各色已讀數量', [color]), kv([['雙數', pairs]])] })
  }
  return out
}

export const hrSockMerchant: HrSolution = {
  slug: 'sock-merchant',
  plain: '整理一籃散襪：同色兩隻裝成一雙，問最後能裝幾雙。',
  statement: '給襪子數量 n 和依序記錄每隻襪子顏色的整數陣列 ar。每雙只能由兩隻同色襪組成，每隻襪最多使用一次；回傳可配成的總雙數。',
  examples: [
    { input: 'n = 9, ar = [10,20,20,10,10,30,50,10,20]', output: '3', note: '顏色 10 有四隻可成兩雙，20 有三隻可成一雙。' },
    { input: 'n = 4, ar = [1,1,1,1]', output: '2', note: '四隻相同顏色正好分成兩雙。' },
  ],
  constraints: [
    'n 至少 1 → 單隻襪沒有配對，答案可為 0。',
    'n 最多 100 → 直接搜尋仍可執行，但一次計數更簡單。',
    '顏色編號介於 1 到 100 → 可用固定大小計數陣列取代雜湊表。',
  ],
  insight: [
    '先拿一隻襪子到右側尋找同色未使用者，找到就成一雙，直覺但可能重掃。',
    '同色襪子有 c 隻就有 floor(c/2) 雙；不需要知道具體是哪兩隻配成一雙。',
    '掃描時每當某色累積數量變成偶數，就新增一雙；這是 [[p:hash-map]] 計數的常見形式。',
  ],
  approaches: [
    {
      name: '逐隻尋找另一隻',
      idea: '對每隻尚未用過的襪子，在右側找第一隻未使用的同色襪。',
      steps: ['建立 used 陣列標記已被配走的襪子。', '由左至右取未用過的位置 i。', '向右搜尋未用過且同色的位置 j；若找到就標記兩者並加一雙。', '掃完全部位置後回傳雙數。'],
      figure: { title: '九隻襪子逐隻配對', steps: pairFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每隻襪子最多往右找 n 個位置；used 需要 n 格。' },
      verdict: '和實際配襪動作一致，易懂但會反覆搜尋。',
      code: {
        python: `def sockMerchant(n, ar):
    used = [False] * n
    pairs = 0
    for i in range(n):
        if used[i]:
            continue
        for j in range(i + 1, n):
            if not used[j] and ar[j] == ar[i]:
                used[i] = used[j] = True  # 兩隻襪配成一雙
                pairs += 1
                break
    return pairs`,
        c: `int sockMerchant(int n, int ar_count, int* ar) {
    int* used = calloc(ar_count, sizeof(int));
    int pairs = 0;
    for (int i = 0; i < ar_count; i++) {
        if (used[i]) continue;
        for (int j = i + 1; j < ar_count; j++) {
            if (!used[j] && ar[i] == ar[j]) {
                used[i] = used[j] = 1;
                pairs++;
                break;
            }
        }
    }
    free(used);
    return pairs;
}`,
        cpp: `int sockMerchant(int n, vector<int> ar) {
    vector<bool> used(n, false);
    int pairs = 0;
    for (int i = 0; i < n; i++) {
        if (used[i]) continue;
        for (int j = i + 1; j < n; j++) {
            if (!used[j] && ar[i] == ar[j]) {
                used[i] = used[j] = true;
                pairs++;
                break;
            }
        }
    }
    return pairs;
}`,
        java: `public static int sockMerchant(int n, List<Integer> ar) {
    boolean[] used = new boolean[n];
    int pairs = 0;
    for (int i = 0; i < n; i++) {
        if (used[i]) continue;
        for (int j = i + 1; j < n; j++) {
            if (!used[j] && ar.get(i).equals(ar.get(j))) {
                used[i] = used[j] = true;
                pairs++;
                break;
            }
        }
    }
    return pairs;
}`,
        javascript: `function sockMerchant(n, ar) {
  const used = Array(n).fill(false);
  let pairs = 0;
  for (let i = 0; i < n; i++) {
    if (used[i]) continue;
    for (let j = i + 1; j < n; j++) {
      if (!used[j] && ar[i] === ar[j]) {
        used[i] = used[j] = true;
        pairs++;
        break;
      }
    }
  }
  return pairs;
}`,
      },
    },
    {
      name: '累積顏色次數',
      idea: '每種顏色的數量每到偶數，就新增一雙。',
      steps: ['建立顏色對應數量的表，總雙數設為 0。', '逐隻讀取顏色，將該色數量加一。', '若新數量為偶數，表示這隻剛完成一雙，總雙數加一。', '處理完 n 隻後回傳總雙數。'],
      figure: { title: '九隻襪子累積次數', steps: countFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每隻只處理一次；顏色限制 1 到 100，計數表大小固定。' },
      verdict: '最佳解；若顏色範圍不固定，可改用雜湊表。',
      code: {
        python: `def sockMerchant(n, ar):
    count = [0] * 101
    pairs = 0
    for color in ar:
        count[color] += 1
        if count[color] % 2 == 0:  # 剛湊成一雙
            pairs += 1
    return pairs`,
        c: `int sockMerchant(int n, int ar_count, int* ar) {
    int count[101] = {0};
    int pairs = 0;
    for (int i = 0; i < ar_count; i++) {
        count[ar[i]]++;
        if (count[ar[i]] % 2 == 0) pairs++;
    }
    return pairs;
}`,
        cpp: `int sockMerchant(int n, vector<int> ar) {
    vector<int> count(101, 0);
    int pairs = 0;
    for (int color : ar) {
        count[color]++;
        if (count[color] % 2 == 0) pairs++;
    }
    return pairs;
}`,
        java: `public static int sockMerchant(int n, List<Integer> ar) {
    int[] count = new int[101];
    int pairs = 0;
    for (int color : ar) {
        count[color]++;
        if (count[color] % 2 == 0) pairs++;
    }
    return pairs;
}`,
        javascript: `function sockMerchant(n, ar) {
  const count = Array(101).fill(0);
  let pairs = 0;
  for (const color of ar) {
    count[color]++;
    if (count[color] % 2 === 0) pairs++;
  }
  return pairs;
}`,
      },
    },
  ],
  pitfalls: [
    '顏色有三隻只能成一雙，不能四捨五入。',
    '逐隻搜尋時，已配走的襪子不能再次使用。',
    '計數法要在數量變成 2、4、6 時加一雙，不是每遇到同色都加。',
  ],
  check: {
    kind: 'fn',
    fn: 'sockMerchant',
    cases: [
      { args: [9, [10, 20, 20, 10, 10, 30, 50, 10, 20]], out: 3 },
      { args: [4, [1, 1, 1, 1]], out: 2 },
      { args: [1, [1]], out: 0 },
      { args: [4, [1, 2, 3, 4]], out: 0 },
      { args: [3, [2, 2, 2]], out: 1 },
      { args: [6, [1, 2, 1, 2, 1, 2]], out: 2 },
    ],
  },
}
