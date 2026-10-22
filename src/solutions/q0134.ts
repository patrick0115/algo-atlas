import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 134. Gas Station

const GAS = [1, 2, 3, 4, 5]
const COST = [3, 4, 5, 1, 2]
const DIFF = GAS.map((g, i) => g - COST[i])

function bruteFig(): FigStep[] {
  const n = GAS.length
  const out: FigStep[] = [{ note: '每一站「加油 − 開到下一站的耗油」= 這一段的淨收入。從某一站出發,一路加總,途中油箱不能變負', views: [arr(GAS, { label: 'gas' }), arr(COST, { label: 'cost' }), arr(DIFF, { label: 'gas − cost(淨收入)' })] }]
  for (let s = 0; s < n; s++) {
    let tank = 0
    let k = 0
    for (; k < n; k++) {
      tank += DIFF[(s + k) % n]
      if (tank < 0) break
    }
    const ok = k === n
    out.push({ note: `從第 ${s} 站出發:${ok ? '繞完一圈油箱都沒變負 → 答案是 ' + s : `走到第 ${(s + k) % n} 站時油箱變成負的 → 不行`}`, views: [arr(DIFF, { label: '淨收入', highlight: [s], compare: range(0, Math.min(k, n - 1)).map((d) => (s + d) % n) })] })
    if (ok) break
  }
  return out
}

function greedyFig(): FigStep[] {
  let total = 0
  let tank = 0
  let start = 0
  const out: FigStep[] = [{ note: '兩個觀察:① 淨收入總和 ≥ 0 就一定有解,< 0 一定無解。② 如果從 start 出發,在第 i 站油箱變負,那 start 到 i 之間的任何一站出發也都會在 i 之前卡住 → 直接從 i + 1 重新開始', views: [arr(DIFF, { label: '淨收入' })] }]
  DIFF.forEach((d, i) => {
    total += d
    tank += d
    if (tank < 0) {
      out.push({ note: `第 ${i} 站:油箱 = ${tank} < 0,從 ${start} 到 ${i} 都不能當起點 → 起點改成 ${i + 1},油箱歸零`, views: [arr(DIFF, { label: '淨收入', range: [start, i], compare: [i] })] })
      start = i + 1
      tank = 0
    } else out.push({ note: `第 ${i} 站:油箱 = ${tank} ≥ 0,繼續(起點 ${start})`, views: [arr(DIFF, { label: '淨收入', range: [start, i], highlight: [i] })] })
  })
  out.push({ note: `淨收入總和 = ${total} ${total >= 0 ? `≥ 0 → 有解,答案是最後的起點 ${start}` : '< 0 → 無解 −1'}`, views: [arr(DIFF, { label: '淨收入', highlight: total >= 0 ? [start] : [] })] })
  return out
}

export const q0134: Solution = {
  id: 134,
  plain: '一圈環狀的加油站,每站能加一些油,開到下一站要耗一些油。從哪一站出發(油箱一開始是空的),才能繞完一整圈?最多只有一個答案。',
  statement: '環狀路線上有 n 個加油站,第 i 站可以加 `gas[i]` 的油,從第 i 站開到第 i+1 站要耗 `cost[i]`。油箱一開始是空的、容量無限。回傳能順時針繞一圈的起點站;做不到就回傳 -1。答案保證唯一。',
  examples: [
    { input: 'gas = [1,2,3,4,5], cost = [3,4,5,1,2]', output: '3' },
    { input: 'gas = [2,3,4], cost = [3,4,3]', output: '-1' },
  ],
  constraints: ['`1 ≤ n ≤ 10⁵` → 每個起點都模擬一圈是 O(n²) = 10¹⁰,太慢'],
  insight: [
    '每一站的「淨收入」= `gas[i] − cost[i]`。能從 s 繞一圈 ⇔ 從 s 開始往後累加,途中都不會變負',
    '整體:淨收入總和 < 0 → 油根本不夠,一定無解;≥ 0 → 一定有解(可以證明)',
    '關鍵剪枝:從 start 出發,第一次在 i 變負。那從 start 和 i 之間的任何一站 k 出發也會在 i 卡住 —— 因為從 start 走到 k 時油箱 ≥ 0,從 k 出發只會更少。所以下一個候選直接是 i + 1',
  ],
  approaches: [
    {
      name: '暴力:每個起點模擬一圈',
      idea: '對每個起點 s,一路累加淨收入,繞完一圈都沒變負就是答案。',
      steps: ['對每個 `s`:`tank = 0`', '`k` 從 0 到 n−1:`tank += gas[(s+k)%n] − cost[(s+k)%n]`,變負就換下一個起點', '繞完一圈 → 回傳 s'],
      figure: { title: `gas = [${GAS}], cost = [${COST}]`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: 'n 個起點,每個最多走 n 步。' },
      verdict: 'n = 10⁵ 會超時。用來理解「淨收入」和「途中不能變負」。',
      code: {
        python: `def canCompleteCircuit(gas, cost):
    n = len(gas)
    for s in range(n):
        tank = 0
        for k in range(n):
            i = (s + k) % n
            tank += gas[i] - cost[i]
            if tank < 0:
                break
        else:
            return s                      # 沒有 break:繞完一圈了
    return -1`,
        c: `int canCompleteCircuit(int *gas, int gasSize, int *cost, int costSize) {
    int n = gasSize;
    for (int s = 0; s < n; s++) {
        int tank = 0, k = 0;
        for (; k < n; k++) {
            int i = (s + k) % n;
            tank += gas[i] - cost[i];
            if (tank < 0) break;
        }
        if (k == n) return s;
    }
    return -1;
}`,
        cpp: `int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
    int n = gas.size();
    for (int s = 0; s < n; s++) {
        int tank = 0, k = 0;
        for (; k < n; k++) {
            int i = (s + k) % n;
            tank += gas[i] - cost[i];
            if (tank < 0) break;
        }
        if (k == n) return s;
    }
    return -1;
}`,
        java: `int canCompleteCircuit(int[] gas, int[] cost) {
    int n = gas.length;
    for (int s = 0; s < n; s++) {
        int tank = 0, k = 0;
        for (; k < n; k++) {
            int i = (s + k) % n;
            tank += gas[i] - cost[i];
            if (tank < 0) break;
        }
        if (k == n) return s;
    }
    return -1;
}`,
        javascript: `function canCompleteCircuit(gas, cost) {
  const n = gas.length;
  for (let s = 0; s < n; s++) {
    let tank = 0, k = 0;
    for (; k < n; k++) {
      const i = (s + k) % n;
      tank += gas[i] - cost[i];
      if (tank < 0) break;
    }
    if (k === n) return s;
  }
  return -1;
}`,
      },
    },
    {
      name: '貪心:一次遍歷',
      idea: '`total` 累加所有淨收入;`tank` 是從目前起點累加的油量,變負就把起點改成下一站、tank 歸零。最後 total ≥ 0 就回傳起點。',
      steps: ['`total = tank = start = 0`', '每一站:`d = gas[i] − cost[i]`,`total += d`、`tank += d`', '`tank < 0` → `start = i + 1`、`tank = 0`', '回傳 `start if total >= 0 else −1`'],
      figure: { title: `gas = [${GAS}], cost = [${COST}]`, steps: greedyFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只走一遍。' },
      verdict: '標準解。不用繞第二圈:只要總和 ≥ 0,最後剩下的起點一定繞得回來(前面那段的虧損會被後面的盈餘補上)。',
      code: {
        python: `def canCompleteCircuit(gas, cost):
    total = tank = start = 0
    for i in range(len(gas)):
        d = gas[i] - cost[i]
        total += d
        tank += d
        if tank < 0:                      # start..i 都不能當起點
            start = i + 1
            tank = 0
    return start if total >= 0 else -1`,
        c: `int canCompleteCircuit(int *gas, int gasSize, int *cost, int costSize) {
    int total = 0, tank = 0, start = 0;
    for (int i = 0; i < gasSize; i++) {
        int d = gas[i] - cost[i];
        total += d;
        tank += d;
        if (tank < 0) { start = i + 1; tank = 0; }
    }
    return total >= 0 ? start : -1;
}`,
        cpp: `int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
    int total = 0, tank = 0, start = 0;
    for (int i = 0; i < (int)gas.size(); i++) {
        int d = gas[i] - cost[i];
        total += d;
        tank += d;
        if (tank < 0) { start = i + 1; tank = 0; }
    }
    return total >= 0 ? start : -1;
}`,
        java: `int canCompleteCircuit(int[] gas, int[] cost) {
    int total = 0, tank = 0, start = 0;
    for (int i = 0; i < gas.length; i++) {
        int d = gas[i] - cost[i];
        total += d;
        tank += d;
        if (tank < 0) { start = i + 1; tank = 0; }
    }
    return total >= 0 ? start : -1;
}`,
        javascript: `function canCompleteCircuit(gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    const d = gas[i] - cost[i];
    total += d;
    tank += d;
    if (tank < 0) {
      start = i + 1;
      tank = 0;
    }
  }
  return total >= 0 ? start : -1;
}`,
      },
    },
  ],
  pitfalls: [
    '起點改成 `start + 1` 而不是 `i + 1`:中間那些站也都不可能,直接跳到 i + 1 才是 O(n)',
    '最後沒有檢查總和:總和 < 0 時 start 可能停在某個值,但其實無解',
    '以為還要從 start 再模擬一圈確認:總和 ≥ 0 已經保證可以',
  ],
  followUp: [{ q: '為什麼總和 ≥ 0 就一定有解?', a: '把淨收入的前綴和畫成折線,從前綴和最低點的下一站出發,之後的累積和永遠不會低於 0。' }],
  check: {
    kind: 'fn',
    fn: 'canCompleteCircuit',
    cases: [
      { args: [GAS, COST], out: 3 },
      { args: [[2, 3, 4], [3, 4, 3]], out: -1 },
      { args: [[5], [4]], out: 0 },
      { args: [[3, 1, 1], [1, 2, 2]], out: 0 },
      { args: [[5, 1, 2, 3, 4], [4, 4, 1, 5, 1]], out: 4 },
    ],
  },
}
