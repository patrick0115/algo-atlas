import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 11. Container With Most Water

const H = [1, 8, 6, 2, 5, 4, 8, 3, 7]

function bruteFig(): FigStep[] {
  const out: FigStep[] = [{ note: '每兩條線都可以當容器的左右牆:水高 = 較矮的那條,寬 = 兩條的距離', views: [arr(H, { label: 'height', mode: 'bars' })] }]
  let best = 0
  let bi = 0
  let bj = 0
  for (let i = 0; i < H.length; i++) {
    for (let j = i + 1; j < H.length; j++) {
      const a = Math.min(H[i], H[j]) * (j - i)
      if (a > best) {
        best = a
        bi = i
        bj = j
        out.push({ note: `(${i}, ${j}):min(${H[i]}, ${H[j]}) × ${j - i} = ${a},目前最大`, views: [arr(H, { label: 'height', mode: 'bars', compare: [i, j], range: [i, j] })] })
      }
    }
  }
  out.push({ note: `全部 ${(H.length * (H.length - 1)) / 2} 對都試完,最大是 (${bi}, ${bj}) 的 ${best}`, views: [arr(H, { label: 'height', mode: 'bars', highlight: [bi, bj], range: [bi, bj] })] })
  return out
}

function twoPtrFig(): FigStep[] {
  let l = 0
  let r = H.length - 1
  let best = 0
  const out: FigStep[] = [{ note: '從最寬的容器開始:L 在最左、R 在最右', views: [arr(H, { label: 'height', mode: 'bars', pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] })] }]
  while (l < r) {
    const a = Math.min(H[l], H[r]) * (r - l)
    best = Math.max(best, a)
    const moveL = H[l] < H[r]
    out.push({
      note: `面積 = min(${H[l]}, ${H[r]}) × ${r - l} = ${a},最大 ${best}。${moveL ? `左邊 ${H[l]} 比較矮` : `右邊 ${H[r]} 不比左邊高`}:它配任何更近的牆,水高都不會超過它、寬度還變小 → 丟掉它,${moveL ? 'L++' : 'R--'}`,
      views: [arr(H, { label: 'height', mode: 'bars', range: [l, r], compare: [l, r], dim: [...range(0, l - 1), ...range(r + 1, H.length - 1)], pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] })],
    })
    if (moveL) l++
    else r--
  }
  out.push({ note: `L 和 R 相遇,答案 = ${best}。只看了 n − 1 個容器`, views: [arr(H, { label: 'height', mode: 'bars' })] })
  return out
}

export const q0011: Solution = {
  id: 11,
  plain: '一排高低不同的柱子,挑兩根當水桶的左右兩邊,水只能裝到**比較矮那根**的高度。挑哪兩根能裝最多水?',
  statement: '給 n 條直立的線,第 `i` 條高 `height[i]`。挑兩條線和 x 軸組成一個容器,能裝的水 = **較矮那條的高度 × 兩條線的距離**。回傳最多能裝多少水。',
  examples: [
    { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', note: '第 1 條(高 8)和第 8 條(高 7):min(8, 7) × 7 = 49' },
    { input: 'height = [1,1]', output: '1' },
  ],
  constraints: [
    '`2 ≤ n ≤ 10⁵` → O(n²) 是 50 億對,一定超時;要 O(n)',
    '`0 ≤ height[i] ≤ 10⁴` → 面積最多 10⁴ × 10⁵ = 10⁹,int 放得下',
  ],
  insight: [
    '暴力:每一對都算 → O(n²)',
    '換個角度:從**最寬**的容器(最左 + 最右)開始,之後每一步寬度都會變小,只有讓「矮的那邊」變高才有機會更好',
    '為什麼可以丟掉矮的那邊?假設 `height[L] < height[R]`。`L` 和任何 `R′ < R` 組合:寬度更小,水高 ≤ `height[L]`,面積一定不會超過現在這個。所以 `L` 已經算過它最好的情況,可以丟掉',
  ],
  approaches: [
    {
      name: '暴力:試每一對',
      idea: '兩層迴圈,算每一對 `(i, j)` 的面積,取最大。',
      steps: ['`best = 0`', '對每個 `i < j`:`best = max(best, min(h[i], h[j]) × (j − i))`'],
      figure: { title: 'height = [1,8,6,2,5,4,8,3,7](只畫出「刷新最大值」的那幾步)', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: 'n(n−1)/2 對,每對 O(1)。' },
      verdict: 'n = 10⁵ 會超時。只當起點。',
      code: {
        python: `def maxArea(height):
    n, best = len(height), 0
    for i in range(n):
        for j in range(i + 1, n):
            best = max(best, min(height[i], height[j]) * (j - i))
    return best`,
        c: `int maxArea(int *height, int heightSize) {
    int best = 0;
    for (int i = 0; i < heightSize; i++)
        for (int j = i + 1; j < heightSize; j++) {
            int h = height[i] < height[j] ? height[i] : height[j];
            if (h * (j - i) > best) best = h * (j - i);
        }
    return best;
}`,
        cpp: `int maxArea(vector<int>& height) {
    int n = height.size(), best = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            best = max(best, min(height[i], height[j]) * (j - i));
    return best;
}`,
        java: `int maxArea(int[] height) {
    int n = height.length, best = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            best = Math.max(best, Math.min(height[i], height[j]) * (j - i));
    return best;
}`,
        javascript: `function maxArea(height) {
  const n = height.length;
  let best = 0;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      best = Math.max(best, Math.min(height[i], height[j]) * (j - i));
  return best;
}`,
      },
    },
    {
      name: '左右雙指針,每次移動較矮的一邊',
      idea: '`L`、`R` 從兩端開始。算完面積後,**移動比較矮的那一邊** —— 它已經不可能組出更大的容器了。',
      steps: ['`L = 0`、`R = n − 1`、`best = 0`', '`best = max(best, min(h[L], h[R]) × (R − L))`', '`h[L] < h[R]` → `L++`,否則 `R--`', '`L < R` 時重複'],
      figure: { title: 'height = [1,8,6,2,5,4,8,3,7]', steps: twoPtrFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每一步 L 或 R 往內走一格,總共 n − 1 步。' },
      verdict: '標準解,也是[[p:greedy]]「每一步丟掉不可能的選項」的經典證明題。面試一定要能說出為什麼移矮的那邊不會漏掉答案。',
      code: {
        python: `def maxArea(height):
    l, r, best = 0, len(height) - 1, 0
    while l < r:
        best = max(best, min(height[l], height[r]) * (r - l))
        if height[l] < height[r]:
            l += 1                        # 左邊矮:它已經算過最好的情況
        else:
            r -= 1
    return best`,
        c: `int maxArea(int *height, int heightSize) {
    int l = 0, r = heightSize - 1, best = 0;
    while (l < r) {
        int h = height[l] < height[r] ? height[l] : height[r];
        if (h * (r - l) > best) best = h * (r - l);
        if (height[l] < height[r]) l++;
        else r--;
    }
    return best;
}`,
        cpp: `int maxArea(vector<int>& height) {
    int l = 0, r = (int)height.size() - 1, best = 0;
    while (l < r) {
        best = max(best, min(height[l], height[r]) * (r - l));
        if (height[l] < height[r]) l++;
        else r--;
    }
    return best;
}`,
        java: `int maxArea(int[] height) {
    int l = 0, r = height.length - 1, best = 0;
    while (l < r) {
        best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
        if (height[l] < height[r]) l++;
        else r--;
    }
    return best;
}`,
        javascript: `function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
    if (height[l] < height[r]) l++;
    else r--;
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    '移動**較高**的那邊是錯的:水高被矮的那邊卡住,移高的那邊只會讓寬度變小、高度不變或變矮',
    '面積是 `min(高) × 距離`,不是兩條線中間所有格子的總和(那是 42. Trapping Rain Water)',
    '兩邊一樣高時移哪邊都可以 —— 兩條都不可能再和更近的牆組出更大的容器',
  ],
  followUp: [
    { q: '和 42. Trapping Rain Water 有什麼不同?', a: '這題只挑兩條線、中間的線不擋水;42 是每一格都能積水,要算總和。42 也能用左右雙指針,但移動規則是「哪邊目前的最高牆比較矮就處理哪邊」。' },
  ],
  check: {
    kind: 'fn',
    fn: 'maxArea',
    cases: [
      { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], out: 49 },
      { args: [[1, 1]], out: 1 },
      { args: [[4, 3, 2, 1, 4]], out: 16 },
      { args: [[1, 2, 1]], out: 2 },
      { args: [[0, 0, 0]], out: 0 },
      { args: [[2, 3, 10, 5, 7, 8, 9]], out: 36 },
    ],
  },
}
