import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const A = [1, 2, 3, 4, 5], D = 4

function repeatedFig(): FigStep[] {
  const out: FigStep[] = []
  const current = [...A]
  for (let turn = 1; turn <= D; turn++) {
    const first = current.shift()!
    current.push(first)
    out.push({ note: `第 ${turn} 次左移：把最前面的 ${first} 搬到尾端，陣列變成 [${current.join(', ')}]。`, views: [arr(A, { label: '原陣列' }), arr(current, { label: `左移 ${turn} 次`, highlight: [current.length - 1] })] })
  }
  return out
}

function indexFig(): FigStep[] {
  const out: FigStep[] = []
  const result = Array<number | string>(A.length).fill('·')
  for (let i = 0; i < A.length; i++) {
    const source = (i + D) % A.length
    result[i] = A[source]
    out.push({ note: `答案位置 ${i} 應取原位置 (${i}+${D}) mod ${A.length}=${source}，填入 ${A[source]}。`, views: [arr(A, { label: '原陣列', highlight: [source] }), arr(result, { label: '答案', highlight: [i] })] })
  }
  return out
}

export const hrCtciArrayLeftRotation: HrSolution = {
  slug: 'ctci-array-left-rotation',
  plain: '像隊伍向左輪位：最前面的人移到隊尾，做 d 次後列出新順序。',
  statement: '給整數陣列 a 和非負整數 d。每次左旋轉會將第一個元素放到最後，其他元素往左移一格。回傳完成 d 次旋轉後的新陣列。',
  examples: [
    { input: 'a = [1,2,3,4,5], d = 4', output: '[5,1,2,3,4]', note: '輪轉四次後，原本最後的 5 來到最前。' },
    { input: 'a = [1,2,3], d = 3', output: '[1,2,3]', note: '剛好旋轉一整圈，順序不變。' },
  ],
  constraints: [
    'a 長度至少 1 → 取模 n 時不會除以零。',
    'a 長度最多 10^5 → 每次搬動整列的 O(nd) 可能太慢。',
    'd 可與陣列長度相同或更大 → 先取 d mod n，完整圈數不影響結果。',
  ],
  insight: [
    '先照操作描述做：取出第一個元素、其餘往前、元素放尾端，重複 d 次。',
    '觀察旋轉後答案位置 0 來自原位置 d，位置 1 來自 d+1；超過尾端就繞回。',
    '因此答案位置 i 直接取 a[(i+d) mod n]，是 [[p:simulation]] 加上環狀索引的寫法；也可參考 [189](#/q/189)。',
  ],
  approaches: [
    {
      name: '逐次搬動第一個元素',
      idea: '真的做 d 次「前面取出、後面放入」。',
      steps: ['複製輸入陣列，避免改動原值。', '先把 d 化為 d mod n，省掉完整圈。', '每次保存首元素，將後面元素全往左移一格。', '把保存值放到最後，重複所需次數後回傳。'],
      figure: { title: '[1,2,3,4,5] 左旋四次', steps: repeatedFig() },
      complexity: { time: 'O(n + n×(d mod n))', space: 'O(n)', why: '每次輪轉要移動 n 個值，共 d mod n 次；就算 d mod n = 0 也要先複製陣列(n 格)。' },
      verdict: '符合題目動作，適合先理解旋轉；大 d 時會重複搬動。',
      code: {
        python: `def rotLeft(a, d):
    result = a[:]
    for _ in range(d % len(a)):
        first = result.pop(0)
        result.append(first)  # 頭搬到尾
    return result`,
        c: `int* rotLeft(int a_count, int* a, int d, int* result_count) {
    int* result = malloc(sizeof(int) * a_count);
    *result_count = a_count;
    for (int i = 0; i < a_count; i++) result[i] = a[i];
    for (int turn = 0; turn < d % a_count; turn++) {
        int first = result[0];
        for (int i = 1; i < a_count; i++) result[i - 1] = result[i];
        result[a_count - 1] = first;
    }
    return result;
}`,
        cpp: `vector<int> rotLeft(vector<int> a, int d) {
    int n = a.size();
    for (int turn = 0; turn < d % n; turn++) {
        int first = a[0];
        for (int i = 1; i < n; i++) a[i - 1] = a[i];
        a[n - 1] = first;
    }
    return a;
}`,
        java: `public static List<Integer> rotLeft(List<Integer> a, int d) {
    List<Integer> result = new ArrayList<>(a);
    int n = result.size();
    for (int turn = 0; turn < d % n; turn++) {
        int first = result.get(0);
        for (int i = 1; i < n; i++) result.set(i - 1, result.get(i));
        result.set(n - 1, first);
    }
    return result;
}`,
        javascript: `function rotLeft(a, d) {
  const result = [...a];
  for (let turn = 0; turn < d % a.length; turn++) {
    const first = result.shift();
    result.push(first);
  }
  return result;
}`,
      },
    },
    {
      name: '直接計算來源索引',
      idea: '答案位置 i 的值直接來自原陣列的 (i+d) mod n。',
      steps: ['先記下陣列長度 n，建立同長度的答案陣列。', '對每個答案位置 i，計算來源 source=(i+d) mod n。', '將 a[source] 放進答案位置 i。', '填完 n 格即回傳。'],
      figure: { title: '[1,2,3,4,5] 的來源索引', steps: indexFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個答案位置填一次；新的陣列有 n 格。' },
      verdict: '最佳解；無論 d 多大，都只填一遍答案。',
      code: {
        python: `def rotLeft(a, d):
    n = len(a)
    result = [0] * n
    for i in range(n):
        result[i] = a[(i + d) % n]  # 答案位置對應的來源
    return result`,
        c: `int* rotLeft(int a_count, int* a, int d, int* result_count) {
    int* result = malloc(sizeof(int) * a_count);
    *result_count = a_count;
    for (int i = 0; i < a_count; i++) {
        result[i] = a[(i + d) % a_count];
    }
    return result;
}`,
        cpp: `vector<int> rotLeft(vector<int> a, int d) {
    int n = a.size();
    vector<int> result(n);
    for (int i = 0; i < n; i++) {
        result[i] = a[(i + d) % n];
    }
    return result;
}`,
        java: `public static List<Integer> rotLeft(List<Integer> a, int d) {
    int n = a.size();
    List<Integer> result = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        result.add(a.get((i + d) % n));
    }
    return result;
}`,
        javascript: `function rotLeft(a, d) {
  const n = a.length;
  const result = Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = a[(i + d) % n];
  }
  return result;
}`,
      },
    },
  ],
  pitfalls: [
    '左旋轉時答案第一格是原本索引 d，不是 n-d。',
    '旋轉 n 次會回到原樣；d 大於 n 時要繞圈。',
    '若用 C 回傳新陣列，必須設定 result_count。',
  ],
  followUp: [
    {
      q: '如果要原地旋轉，不能建立新陣列呢？',
      a: '先反轉前 d 個元素，再反轉後 n-d 個元素，最後反轉整個陣列。三次反轉都是原地操作，時間 O(n)、額外空間 O(1)。',
    },
    {
      q: '右旋轉 d 次如何沿用來源索引？',
      a: '右旋轉等於左旋轉 n-(d mod n) 次。也可讓答案位置 i 讀取原位置 ((i-d) mod n+n) mod n，第二個加 n 用來避免負餘數。',
    },
    {
      q: '為什麼輸出位置 i 要看原位置 i+d？',
      a: '左旋時，原位置 d 的元素會移到最前面。答案往右走一格，來源也往右走一格；碰到尾端就用取模回到開頭。',
    },
  ],
  check: {
    kind: 'fn',
    fn: 'rotLeft',
    cases: [
      { args: [[1, 2, 3, 4, 5], 4], out: [5, 1, 2, 3, 4] },
      { args: [[1, 2, 3], 3], out: [1, 2, 3] },
      { args: [[9], 100], out: [9] },
      { args: [[1, 2], 1], out: [2, 1] },
      { args: [[1, 2, 3], 0], out: [1, 2, 3] },
      { args: [[1, 2, 3], 7], out: [2, 3, 1] },
    ],
  },
}
