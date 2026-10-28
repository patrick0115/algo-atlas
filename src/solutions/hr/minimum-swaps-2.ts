import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const SAMPLE = [7, 1, 3, 2, 4, 5, 6]

function searchFig(): FigStep[] {
  const a = [...SAMPLE], out: FigStep[] = []
  let swaps = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] === i + 1) continue
    let j = i + 1
    while (a[j] !== i + 1) j++
    const old = a[i]
    ;[a[i], a[j]] = [a[j], a[i]]
    swaps++
    out.push({ note: `位置 ${i} 應放 ${i + 1}；向右找到位置 ${j}，把 ${old} 與 ${i + 1} 交換。已交換 ${swaps} 次，前 ${i + 1} 格已定位。`, views: [arr(a, { label: '交換後陣列', highlight: [i, j], done: Array.from({ length: i + 1 }, (_, k) => k) }), arr([i, j, swaps], { label: 'i / j / 次數' })] })
  }
  return out
}

function directFig(): FigStep[] {
  const a = [...SAMPLE], out: FigStep[] = []
  let swaps = 0
  for (let i = 0; i < a.length; i++) {
    while (a[i] !== i + 1) {
      const j = a[i] - 1, value = a[i]
      ;[a[i], a[j]] = [a[j], a[i]]
      swaps++
      out.push({ note: `看位置 ${i} 的 ${value}：它的家是索引 ${j}。直接換過去，至少有一個數歸位；累計 ${swaps} 次。`, views: [arr(a, { label: '就地交換', highlight: [i, j], done: a.flatMap((x, k) => x === k + 1 ? [k] : []) }), arr([i, j, swaps], { label: '目前索引 / 目的地 / 次數' })] })
    }
  }
  return out
}

export const hrMinimumSwaps2: HrSolution = {
  slug: 'minimum-swaps-2',
  plain: '像整理編號 1 到 n 的置物櫃：每次拿起放錯櫃的牌子，把它與自己編號的櫃子交換，讓至少一張牌歸位。',
  statement: '給一個長度 n 的排列，恰好包含 1 到 n 各一次。每次可交換任意兩個位置。回傳讓陣列按 1、2、…、n 排好所需的最少交換次數。',
  examples: [
    { input: 'arr = [7,1,3,2,4,5,6]', output: '5', note: '例如先把 1 換到開頭，再依序安置 2、4、5、6，共五次。' },
    { input: 'arr = [4,3,1,2]', output: '3', note: '四個值形成一個循環，打散此循環需要三次。' },
  ],
  constraints: [
    '1 ≤ n ≤ 10^5 → O(n²) 線性搜尋每個目標會超時。',
    '每個 1 到 n 的值恰好出現一次 → 值 x 的正確索引固定為 x−1，不需雜湊表。',
  ],
  insight: [
    '為了排序，先固定位置 0，再固定位置 1；已固定的位置不應被後續交換破壞。',
    '直覺解法在右側搜尋 i+1，但每次搜尋會重掃許多格。',
    '因為值就是位置的線索，可把當前值直接送往 `值−1`；每次至少讓一格正確，所以最多 O(n) 次。這與 [[p:simulation]] 的就地操作相同。',
  ],
  approaches: [
    {
      name: '逐位搜尋應放的值',
      idea: '對每個位置向右找正確數字，找到後交換。',
      steps: ['從左到右走訪索引 i。', '若 arr[i] 已等於 i+1，跳過。', '否則從 i+1 往右找 i+1，與 arr[i] 交換並計數。', '全部位置固定後回傳次數。'],
      figure: { title: 'arr = [7,1,3,2,4,5,6]', steps: searchFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '每個位置最壞要向右掃 n 格；交換在原陣列完成。' },
      verdict: '容易理解，但長排列會被重複搜尋拖慢。',
      code: {
        python: `def minimumSwaps(arr):
    swaps = 0
    for i in range(len(arr)):
        if arr[i] == i + 1:
            continue
        j = i + 1
        while arr[j] != i + 1:
            j += 1
        arr[i], arr[j] = arr[j], arr[i]  # 固定位置 i
        swaps += 1
    return swaps`,
        c: `int minimumSwaps(int arr_count, int* arr) {
    int swaps = 0;
    for (int i = 0; i < arr_count; i++) {
        if (arr[i] == i + 1) continue;
        int j = i + 1;
        while (arr[j] != i + 1) j++;
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        swaps++;
    }
    return swaps;
}`,
        cpp: `int minimumSwaps(vector<int> arr) {
    int swaps = 0;
    for (int i = 0; i < (int)arr.size(); i++) {
        if (arr[i] == i + 1) continue;
        int j = i + 1;
        while (arr[j] != i + 1) j++;
        swap(arr[i], arr[j]);
        swaps++;
    }
    return swaps;
}`,
        java: `public static int minimumSwaps(int[] arr) {
    int swaps = 0;
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == i + 1) continue;
        int j = i + 1;
        while (arr[j] != i + 1) j++;
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        swaps++;
    }
    return swaps;
}

public static int minimumSwaps(List<Integer> values) {
    int[] arr = new int[values.size()];
    for (int i = 0; i < values.size(); i++) arr[i] = values.get(i);
    return minimumSwaps(arr);
}`,
        javascript: `function minimumSwaps(arr) {
  let swaps = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === i + 1) continue;
    let j = i + 1;
    while (arr[j] !== i + 1) j++;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    swaps++;
  }
  return swaps;
}`,
      },
    },
    {
      name: '利用數值直接定位',
      idea: '數值 x 的歸位索引一定是 x−1，直接交換到那裡。',
      steps: ['由左至右處理索引 i。', '只要 arr[i] 不等於 i+1，就令 j = arr[i]−1。', '交換 arr[i] 與 arr[j]、次數加一；仍留在 i 檢查新換來的值。', 'i 處正確後才往右走。'],
      figure: { title: 'arr = [7,1,3,2,4,5,6]', steps: directFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每次交換至少使一個值歸位，因此交換至多 n−1 次；只用常數變數。' },
      verdict: '直接利用排列性質，效率最佳；同樣的循環概念可對照 [41](#/q/41)。',
      code: {
        python: `def minimumSwaps(arr):
    swaps = 0
    for i in range(len(arr)):
        while arr[i] != i + 1:
            j = arr[i] - 1  # 當前值的正確位置
            arr[i], arr[j] = arr[j], arr[i]
            swaps += 1
    return swaps`,
        c: `int minimumSwaps(int arr_count, int* arr) {
    int swaps = 0;
    for (int i = 0; i < arr_count; i++) {
        while (arr[i] != i + 1) {
            int j = arr[i] - 1;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            swaps++;
        }
    }
    return swaps;
}`,
        cpp: `int minimumSwaps(vector<int> arr) {
    int swaps = 0;
    for (int i = 0; i < (int)arr.size(); i++) {
        while (arr[i] != i + 1) {
            int j = arr[i] - 1;
            swap(arr[i], arr[j]);
            swaps++;
        }
    }
    return swaps;
}`,
        java: `public static int minimumSwaps(int[] arr) {
    int swaps = 0;
    for (int i = 0; i < arr.length; i++) {
        while (arr[i] != i + 1) {
            int j = arr[i] - 1;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            swaps++;
        }
    }
    return swaps;
}

public static int minimumSwaps(List<Integer> values) {
    int[] arr = new int[values.size()];
    for (int i = 0; i < values.size(); i++) arr[i] = values.get(i);
    return minimumSwaps(arr);
}`,
        javascript: `function minimumSwaps(arr) {
  let swaps = 0;
  for (let i = 0; i < arr.length; i++) {
    while (arr[i] !== i + 1) {
      const j = arr[i] - 1;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      swaps++;
    }
  }
  return swaps;
}`,
      },
    },
  ],
  pitfalls: [
    '值從 1 開始、索引從 0 開始，目的地是 `arr[i]−1`。',
    '一次交換後 i 位置可能仍錯，最佳解必須用 while 繼續處理。',
    '題目保證無重複；若有重複，直接定位法可能死循環。',
  ],
  check: {
    kind: 'fn', fn: 'minimumSwaps',
    cases: [
      { args: [[7, 1, 3, 2, 4, 5, 6]], out: 5 },
      { args: [[4, 3, 1, 2]], out: 3 },
      { args: [[1]], out: 0 },
      { args: [[1, 2, 3]], out: 0 },
      { args: [[2, 1]], out: 1 },
      { args: [[2, 3, 4, 1]], out: 3 },
    ],
  },
}
