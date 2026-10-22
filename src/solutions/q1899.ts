import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1899. Merge Triplets to Form Target Triplet

const TRI = [
  [2, 5, 3],
  [1, 8, 4],
  [1, 7, 5],
]
const TGT = [2, 7, 5]

function table(cls: Record<number, string>, label: string): GridViewData {
  const marks: Record<string, [number, number][]> = { dim: [], hl: [], done: [] }
  TRI.forEach((t, i) => {
    const c = cls[i]
    if (c) t.forEach((_, j) => marks[c].push([i, j]))
  })
  return { kind: 'grid', label, cells: TRI.map((t) => [...t]), rowLabels: TRI.map((_, i) => `#${i}`), colLabels: ['a', 'b', 'c'], marks }
}

function greedyFig(): FigStep[] {
  const cls: Record<number, string> = {}
  const got = [false, false, false]
  const out: FigStep[] = [{ note: `「合併」是每一維取最大值,所以**只會變大、不會變小**。任何一維超過 target 的三元組,一旦用了就再也回不去 → 不能用`, views: [table({}, '三元組'), arr(TGT, { label: 'target' })] }]
  TRI.forEach((t, i) => {
    const bad = t.some((v, j) => v > TGT[j])
    cls[i] = bad ? 'dim' : 'hl'
    if (!bad) t.forEach((v, j) => v === TGT[j] && (got[j] = true))
    out.push({ note: bad ? `#${i} [${t}]:有一維超過 target → 不能用,跳過` : `#${i} [${t}]:每一維都 ≤ target,可以放心合併。它${t.some((v, j) => v === TGT[j]) ? `讓第 ${t.flatMap((v, j) => (v === TGT[j] ? ['a', 'b', 'c'][j] : [])).join('、')} 維剛好湊到` : '沒有湊到任何一維'}`, views: [table({ ...cls }, '三元組'), arr(TGT, { label: 'target', done: got.flatMap((g, j) => (g ? [j] : [])) })] })
  })
  out.push({ note: got.every(Boolean) ? '三維都有人剛好湊到 → 把可以用的全部合併,就是 target → true' : '有一維湊不到 → false', views: [arr(TGT, { label: 'target', done: got.flatMap((g, j) => (g ? [j] : [])) })] })
  return out
}

export const q1899: Solution = {
  id: 1899,
  plain: '有很多組三個數的組合。「合併」兩組的規則是每個位置各取比較大的那個。問能不能合併出剛好等於目標的那組數。關鍵:合併只會讓數字變大,所以任何一個位置已經超過目標的組合,碰都不能碰。',
  statement:
    '給一些三元組 `triplets[i] = [a, b, c]` 和目標 `target = [x, y, z]`。每次可以挑兩個三元組 i、j,把 `triplets[j]` 更新成 `[max(aᵢ, aⱼ), max(bᵢ, bⱼ), max(cᵢ, cⱼ)]`。判斷能不能讓某個三元組變成 target。',
  examples: [
    { input: 'triplets = [[2,5,3],[1,8,4],[1,7,5]], target = [2,7,5]', output: 'true', note: '合併 [2,5,3] 和 [1,7,5]' },
    { input: 'triplets = [[3,4,5],[4,5,6]], target = [3,2,5]', output: 'false' },
    { input: 'triplets = [[2,5,3],[2,3,4],[1,2,5],[5,2,3]], target = [5,5,5]', output: 'true' },
  ],
  constraints: ['`1 ≤ triplets.length ≤ 10⁵`'],
  insight: [
    '合併取 max → 數字**只會變大**。如果某個三元組有一維大於 target,用了它那一維就永遠超過 → 這種三元組直接丟掉',
    '剩下的三元組(每一維都 ≤ target)隨便合併都不會超過,所以**全部合併**是最好的',
    '全部合併的結果 = 每一維取所有可用三元組的最大值。三維都剛好等於 target 就成功',
  ],
  approaches: [
    {
      name: '貪心:丟掉超過的,合併剩下的',
      idea: '只看「每一維都 ≤ target」的三元組,各維取最大值,最後和 target 比。',
      steps: ['`best = [0, 0, 0]`', '對每個三元組 `t`:有一維 > target → 跳過', '否則 `best[j] = max(best[j], t[j])`', '回傳 `best == target`'],
      figure: { title: `triplets = ${JSON.stringify(TRI)}, target = [${TGT}]`, steps: greedyFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個三元組看一次。' },
      verdict: '標準解,[[p:greedy]]:「能用就全部用,不能用的一開始就排除」。',
      code: {
        python: `def mergeTriplets(triplets, target):
    best = [0, 0, 0]
    for t in triplets:
        if all(t[j] <= target[j] for j in range(3)):   # 不會讓任何一維超過
            best = [max(best[j], t[j]) for j in range(3)]
    return best == target`,
        c: `bool mergeTriplets(int **triplets, int tripletsSize, int *tripletsColSize, int *target, int targetSize) {
    int best[3] = {0, 0, 0};
    for (int i = 0; i < tripletsSize; i++) {
        int *t = triplets[i];
        if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue;
        for (int j = 0; j < 3; j++) if (t[j] > best[j]) best[j] = t[j];
    }
    return best[0] == target[0] && best[1] == target[1] && best[2] == target[2];
}`,
        cpp: `bool mergeTriplets(vector<vector<int>>& triplets, vector<int>& target) {
    vector<int> best(3, 0);
    for (auto& t : triplets) {
        if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue;
        for (int j = 0; j < 3; j++) best[j] = max(best[j], t[j]);
    }
    return best == target;
}`,
        java: `boolean mergeTriplets(int[][] triplets, int[] target) {
    int[] best = new int[3];
    for (int[] t : triplets) {
        if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue;
        for (int j = 0; j < 3; j++) best[j] = Math.max(best[j], t[j]);
    }
    return Arrays.equals(best, target);
}`,
        javascript: `function mergeTriplets(triplets, target) {
  const best = [0, 0, 0];
  for (const t of triplets) {
    if (t.some((v, j) => v > target[j])) continue;
    for (let j = 0; j < 3; j++) best[j] = Math.max(best[j], t[j]);
  }
  return best.every((v, j) => v === target[j]);
}`,
      },
    },
    {
      name: '貪心:記錄哪幾維被「剛好湊到」',
      idea: '和方法一同樣的道理,換個寫法:可用的三元組只要有一維**剛好等於** target,就把那一維記成已湊到。三維都湊到就是 true(可以提早結束)。',
      steps: ['`got = set()`', '對每個可用的三元組:`t[j] == target[j]` → `got.add(j)`', '`len(got) == 3` → 提早回傳 true', '最後回傳 `len(got) == 3`'],
      figure: { title: `triplets = ${JSON.stringify(TRI)}, target = [${TGT}]`, steps: greedyFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '同上,可以提早結束。' },
      verdict: '比較好解釋:可用的三元組合併不會超過,所以只要每一維都有人「剛好等於」就夠了。',
      code: {
        python: `def mergeTriplets(triplets, target):
    got = set()
    for t in triplets:
        if t[0] > target[0] or t[1] > target[1] or t[2] > target[2]:
            continue
        for j in range(3):
            if t[j] == target[j]:
                got.add(j)
        if len(got) == 3:
            return True
    return False`,
        c: `bool mergeTriplets(int **triplets, int tripletsSize, int *tripletsColSize, int *target, int targetSize) {
    bool got[3] = {false, false, false};
    for (int i = 0; i < tripletsSize; i++) {
        int *t = triplets[i];
        if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue;
        for (int j = 0; j < 3; j++) if (t[j] == target[j]) got[j] = true;
        if (got[0] && got[1] && got[2]) return true;
    }
    return false;
}`,
        cpp: `bool mergeTriplets(vector<vector<int>>& triplets, vector<int>& target) {
    bool got[3] = {false, false, false};
    for (auto& t : triplets) {
        if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue;
        for (int j = 0; j < 3; j++) if (t[j] == target[j]) got[j] = true;
        if (got[0] && got[1] && got[2]) return true;
    }
    return false;
}`,
        java: `boolean mergeTriplets(int[][] triplets, int[] target) {
    boolean[] got = new boolean[3];
    for (int[] t : triplets) {
        if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue;
        for (int j = 0; j < 3; j++) if (t[j] == target[j]) got[j] = true;
        if (got[0] && got[1] && got[2]) return true;
    }
    return false;
}`,
        javascript: `function mergeTriplets(triplets, target) {
  const got = [false, false, false];
  for (const t of triplets) {
    if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue;
    for (let j = 0; j < 3; j++) if (t[j] === target[j]) got[j] = true;
    if (got.every(Boolean)) return true;
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: [
    '想用 DP 或嘗試所有合併順序:合併取 max 的性質讓順序完全不重要',
    '只看「有沒有一維等於 target」而沒有先排除超過的三元組:`[2,8,5]` 讓 a、c 湊到了,但 b 超過,用了它就回不去',
  ],
  followUp: [{ q: '同類型的「只會變大」貪心?', a: '很多「取 max / 取 OR」的操作都有這個性質:一旦超過就回不去,所以先排除會超過的元素。例如 2411. Smallest Subarrays With Maximum Bitwise OR。' }],
  check: {
    kind: 'fn',
    fn: 'mergeTriplets',
    cases: [
      { args: [TRI, TGT], out: true },
      { args: [[[3, 4, 5], [4, 5, 6]], [3, 2, 5]], out: false },
      { args: [[[2, 5, 3], [2, 3, 4], [1, 2, 5], [5, 2, 3]], [5, 5, 5]], out: true },
      { args: [[[1, 1, 1]], [1, 1, 1]], out: true },
      { args: [[[2, 8, 5], [1, 7, 1]], [2, 7, 5]], out: false },
    ],
  },
}
