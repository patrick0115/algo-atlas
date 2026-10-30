import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const BIRDS = [1, 4, 4, 4, 5, 3]

function repeatedFig(): FigStep[] {
  const steps: FigStep[] = []
  let best = 0
  let winner = 0
  for (let id = 1; id <= 5; id++) {
    let count = 0
    for (let i = 0; i < BIRDS.length; i++) {
      if (BIRDS[i] === id) count++
      steps.push({
        note: `正在統計鳥種 ${id}；讀到第 ${i + 1} 筆 ${BIRDS[i]}，目前共 ${count} 隻。`,
        views: [arr(BIRDS, { label: '觀察紀錄', highlight: [i] }), kv([['目前鳥種', id], ['數量', count], ['暫時最多', best]], '重掃狀態')],
      })
    }
    const better = count > best
    if (better) {
      best = count
      winner = id
    }
    steps.push({ note: `鳥種 ${id} 有 ${count} 隻；${better ? '更新' : '比較後'}目前勝出編號 ${winner}，最多 ${best} 隻。`, views: [kv([['勝出編號', winner], ['最多隻數', best]], '比較結果')] })
  }
  return steps
}

function countFig(): FigStep[] {
  const steps: FigStep[] = []
  const counts = [0, 0, 0, 0, 0, 0]
  for (let i = 0; i < BIRDS.length; i++) {
    const id = BIRDS[i]
    counts[id]++
    steps.push({ note: `第 ${i + 1} 筆是鳥種 ${id}，把它的格子加一，現在有 ${counts[id]} 隻。`, views: [arr(BIRDS, { label: '目前讀到', highlight: [i] }), kv(counts.slice(1).map((v, j) => [j + 1, v]), '各鳥種隻數', [id])] })
  }
  let winner = 1
  for (let id = 2; id <= 5; id++) {
    if (counts[id] > counts[winner]) winner = id
    steps.push({ note: `比到鳥種 ${id}：${counts[id]} 隻；目前最多是 ${winner} 號的 ${counts[winner]} 隻。相同數量保留較小編號。`, views: [kv(counts.slice(1).map((v, j) => [j + 1, v]), '各鳥種隻數', [id, winner])] })
  }
  return steps
}

export const hrMigratoryBirds: HrSolution = {
  slug: 'migratory-birds',
  plain: '像記錄公園裡每種鳥出現幾次；選最多的鳥種，平手就選編號小的。',
  statement: '輸入觀察紀錄 arr，每個數字是鳥種編號 1 到 5。回傳出現次數最多的鳥種編號；若多個鳥種並列第一，回傳其中最小的編號。',
  examples: [
    { input: 'arr = [1,4,4,4,5,3]', output: '4', note: '4 號出現三次，其他都只出現一次。' },
    { input: 'arr = [1,2,2,3,3]', output: '2', note: '2 與 3 都出現兩次，選較小的 2。' },
  ],
  constraints: [
    '鳥種編號固定是 1 到 5 → 可用長度 6 的陣列直接以編號索引。',
    '紀錄可能很長 → 掃一次並記頻率比反覆為每個候選做一般搜尋更清楚。',
  ],
  insight: [
    '最直接的方法是逐一選鳥種，重掃全部紀錄算數量。',
    '每次重掃其實只是在回答同一件事：某編號出現了幾次；可以在第一次掃描時一起累加。',
    '最後依編號由小到大掃 [[p:hash-map]] 計數表；只在「嚴格更多」時改答案，平手自然保留小編號。',
  ],
  approaches: [
    {
      name: '逐個鳥種重掃',
      idea: '對每個可能編號都完整掃一次紀錄。',
      steps: ['答案隻數設為 0。', '編號由 1 到 5，各自掃 arr 算出出現次數。', '只有新次數更大才改答案；平手保持原編號。'],
      figure: { title: '逐種重掃 [1,4,4,4,5,3]', steps: repeatedFig() },
      complexity: { time: 'O(5n) = O(n)', space: 'O(1)', why: '固定五種鳥，各掃 n 筆；除了計數和答案沒有額外儲存。' },
      verdict: '鳥種只有五種時也能通過；若種類變多，重掃次數會跟著增加。',
      code: {
        python: `def migratoryBirds(arr):
    winner = 1
    best = 0
    for bird in range(1, 6):
        count = 0
        for x in arr:
            if x == bird:
                count += 1
        # 嚴格超過才換，平手保留小編號
        if count > best:
            best = count
            winner = bird
    return winner`,
        c: `int migratoryBirds(int arr_count, int* arr) {
    int winner = 1;
    int best = 0;
    for (int bird = 1; bird <= 5; bird++) {
        int count = 0;
        for (int i = 0; i < arr_count; i++) {
            if (arr[i] == bird) count++;
        }
        if (count > best) {
            best = count;
            winner = bird;
        }
    }
    return winner;
}`,
        cpp: `int migratoryBirds(vector<int> arr) {
    int winner = 1;
    int best = 0;
    for (int bird = 1; bird <= 5; bird++) {
        int count = 0;
        for (int x : arr) {
            if (x == bird) count++;
        }
        if (count > best) {
            best = count;
            winner = bird;
        }
    }
    return winner;
}`,
        java: `public static int migratoryBirds(List<Integer> arr) {
    int winner = 1;
    int best = 0;
    for (int bird = 1; bird <= 5; bird++) {
        int count = 0;
        for (int x : arr) {
            if (x == bird) count++;
        }
        if (count > best) {
            best = count;
            winner = bird;
        }
    }
    return winner;
}`,
        javascript: `function migratoryBirds(arr) {
  let winner = 1;
  let best = 0;
  for (let bird = 1; bird <= 5; bird++) {
    let count = 0;
    for (const x of arr) {
      if (x === bird) count++;
    }
    if (count > best) {
      best = count;
      winner = bird;
    }
  }
  return winner;
}`,
      },
    },
    {
      name: '一次計數，再依編號比較',
      idea: '先把每種鳥的出現次數存進五格表，再挑最大者。',
      steps: ['開六格計數陣列，索引 0 不用。', '讀到編號 id，就把 count[id] 加一。', '從 1 掃到 5，只有 count[id] 嚴格大於目前勝者才替換。'],
      figure: { title: '一遍記頻率', steps: countFig() },
      complexity: { time: 'O(n + 5) = O(n)', space: 'O(1)', why: '每筆紀錄只讀一次；計數表固定六格。' },
      verdict: '明確分開計數與決定平手規則，是最不易出錯的寫法。',
      code: {
        python: `def migratoryBirds(arr):
    count = [0] * 6
    for bird in arr:
        count[bird] += 1  # 編號直接當索引
    winner = 1
    for bird in range(2, 6):
        if count[bird] > count[winner]:
            winner = bird
    return winner`,
        c: `int migratoryBirds(int arr_count, int* arr) {
    int count[6] = {0};
    for (int i = 0; i < arr_count; i++) {
        count[arr[i]]++;
    }
    int winner = 1;
    for (int bird = 2; bird <= 5; bird++) {
        if (count[bird] > count[winner]) winner = bird;
    }
    return winner;
}`,
        cpp: `int migratoryBirds(vector<int> arr) {
    int count[6] = {0};
    for (int bird : arr) count[bird]++;
    int winner = 1;
    for (int bird = 2; bird <= 5; bird++) {
        if (count[bird] > count[winner]) winner = bird;
    }
    return winner;
}`,
        java: `public static int migratoryBirds(List<Integer> arr) {
    int[] count = new int[6];
    for (int bird : arr) count[bird]++;
    int winner = 1;
    for (int bird = 2; bird <= 5; bird++) {
        if (count[bird] > count[winner]) winner = bird;
    }
    return winner;
}`,
        javascript: `function migratoryBirds(arr) {
  const count = new Array(6).fill(0);
  for (const bird of arr) count[bird]++;
  let winner = 1;
  for (let bird = 2; bird <= 5; bird++) {
    if (count[bird] > count[winner]) winner = bird;
  }
  return winner;
}`,
      },
    },
  ],
  pitfalls: [
    '平手若使用 >= 更新，最後會留下較大編號；應只在 > 時替換。',
    '計數陣列從 1 用到 5，開五格會讓編號 5 越界。',
    '回傳的是鳥種編號，不是最多出現的次數。',
  ],
  check: {
    kind: 'fn',
    fn: 'migratoryBirds',
    cases: [
      { args: [[1, 4, 4, 4, 5, 3]], out: 4 },
      { args: [[1, 2, 2, 3, 3]], out: 2 },
      { args: [[5]], out: 5 },
      { args: [[1, 1, 1]], out: 1 },
      { args: [[5, 4, 3, 2, 1]], out: 1 },
      { args: [[5, 5, 2, 2, 2]], out: 2 },
    ],
  },
}
