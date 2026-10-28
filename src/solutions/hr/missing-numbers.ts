import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const SHORT = [7, 2, 5, 3, 5, 3]
const FULL = [7, 2, 5, 4, 6, 3, 5, 3]

function recountFig(): FigStep[] {
  const steps: FigStep[] = []
  for (const x of [...new Set(FULL)].sort((a, b) => a - b)) {
    let full = 0
    let short = 0
    for (let i = 0; i < FULL.length; i++) {
      if (FULL[i] === x) full++
      steps.push({ note: `檢查候選值 ${x}：原始陣列掃到 ${FULL[i]}，目前找到 ${full} 次。`, views: [arr(FULL, { label: '完整紀錄', highlight: [i] }), kv([[x, full]], '原始次數')] })
    }
    for (let i = 0; i < SHORT.length; i++) {
      if (SHORT[i] === x) short++
      steps.push({ note: `檢查候選值 ${x}：短陣列掃到 ${SHORT[i]}，目前找到 ${short} 次；原始有 ${full} 次。`, views: [arr(SHORT, { label: '短陣列', highlight: [i] }), kv([[x, short]], '短陣列次數')] })
    }
    steps.push({ note: `${x} 在原始陣列 ${full} 次、短陣列 ${short} 次，${full > short ? '應列入答案' : '不缺少'}。`, views: [kv([['原始次數', full], ['短陣列次數', short]], `數值 ${x}`)] })
  }
  return steps
}

function countFig(): FigStep[] {
  const steps: FigStep[] = []
  const delta = new Map<number, number>()
  for (let i = 0; i < FULL.length; i++) {
    const x = FULL[i]
    delta.set(x, (delta.get(x) ?? 0) + 1)
    steps.push({ note: `完整紀錄讀到 ${x}，差額表的 ${x} 加一，變成 ${delta.get(x)}。`, views: [arr(FULL, { label: '完整紀錄', highlight: [i] }), kv([...delta].sort((a, b) => a[0] - b[0]), '次數差額', [x])] })
  }
  for (let i = 0; i < SHORT.length; i++) {
    const x = SHORT[i]
    delta.set(x, (delta.get(x) ?? 0) - 1)
    steps.push({ note: `短陣列讀到 ${x}，差額表的 ${x} 減一，剩 ${delta.get(x)}；正數代表仍缺。`, views: [arr(SHORT, { label: '短陣列', highlight: [i] }), kv([...delta].sort((a, b) => a[0] - b[0]), '次數差額', [x])] })
  }
  return steps
}

export const hrMissingNumbers: HrSolution = {
  slug: 'missing-numbers',
  plain: '像核對出貨清單與收貨清單：某商品收到的件數少於出貨件數，就把商品編號列出來。',
  statement: 'brr 是完整的整數多重集合，arr 是少了若干元素後的集合。找出所有在 brr 中出現次數比 arr 多的數值，去重後以升冪回傳；不是逐件重複輸出。',
  examples: [
    { input: 'arr = [7,2,5,3,5,3], brr = [7,2,5,4,6,3,5,3]', output: '[4,6]', note: '4 與 6 在完整紀錄中各多出一次。' },
    { input: 'arr = [1,1], brr = [1,1,1,2]', output: '[1,2]', note: '1 雖仍在短陣列中，但少了一次，也要列入。' },
  ],
  constraints: [
    '數值可能重複 → 只比較是否存在會漏掉出現次數變少的值。',
    'brr 的最大值與最小值相距不超過 100 → 可用固定範圍的計數陣列。',
    '結果需升冪 → 從最小值往上掃計數表即可自然排序。',
  ],
  insight: [
    '先針對完整陣列的每個不同數值，分別重掃兩個陣列算次數，能直接對應題意。',
    '重掃很浪費；改為掃 brr 時加一、掃 arr 時減一，差額就是少掉的件數。',
    '因數值跨度很小，用 [[p:counting-sort]] 的計數陣列直接存差額，再按索引順序輸出正數項。',
  ],
  approaches: [
    {
      name: '每個數值重新計數',
      idea: '對完整陣列的每個不同數值，分別計算它在兩陣列中出現幾次。',
      steps: ['取 brr 的不同數值並排序。', '對每個 x 重掃 brr 和 arr，求各自出現次數。', '若 brr 的次數較大，把 x 加進結果。'],
      figure: { title: '逐值核對 [7,2,5,4,6,3,5,3]', steps: recountFig() },
      complexity: { time: 'O(u(n+m)+u log u)', space: 'O(u)', why: 'u 是不同數值個數，每個值都要重掃兩陣列。' },
      verdict: '容易理解重複次數的要求，但大量資料會做重複工作。',
      code: {
        python: `def missingNumbers(arr, brr):
    answer = []
    for x in sorted(set(brr)):
        in_full = brr.count(x)
        in_short = arr.count(x)
        # 比較的是次數，不只是有沒有出現
        if in_full > in_short:
            answer.append(x)
    return answer`,
        c: `int compareInt(const void* a, const void* b) {
    int x = *(const int*)a;
    int y = *(const int*)b;
    return (x > y) - (x < y);
}

int* missingNumbers(int arr_count, int* arr, int brr_count, int* brr, int* result_count) {
    qsort(brr, brr_count, sizeof(int), compareInt);
    int* result = malloc(sizeof(int) * brr_count);
    *result_count = 0;
    for (int i = 0; i < brr_count; i++) {
        if (i > 0 && brr[i] == brr[i - 1]) continue;
        int full = 0;
        int shortCount = 0;
        for (int j = 0; j < brr_count; j++) if (brr[j] == brr[i]) full++;
        for (int j = 0; j < arr_count; j++) if (arr[j] == brr[i]) shortCount++;
        if (full > shortCount) result[(*result_count)++] = brr[i];
    }
    return result;
}`,
        cpp: `vector<int> missingNumbers(vector<int> arr, vector<int> brr) {
    sort(brr.begin(), brr.end());
    vector<int> answer;
    for (int i = 0; i < (int)brr.size(); i++) {
        int x = brr[i];
        if (i > 0 && brr[i] == brr[i - 1]) continue;  // 同一個值只數一次
        int full = count(brr.begin(), brr.end(), x);
        int shortCount = count(arr.begin(), arr.end(), x);
        if (full > shortCount) answer.push_back(x);
    }
    return answer;
}`,
        java: `public static List<Integer> missingNumbers(List<Integer> arr, List<Integer> brr) {
    List<Integer> sorted = new ArrayList<>(brr);
    Collections.sort(sorted);
    List<Integer> answer = new ArrayList<>();
    Integer previous = null;
    for (int x : sorted) {
        if (previous != null && previous == x) continue;
        if (Collections.frequency(brr, x) > Collections.frequency(arr, x)) answer.add(x);
        previous = x;
    }
    return answer;
}`,
        javascript: `function missingNumbers(arr, brr) {
  const values = [...new Set(brr)].sort((a, b) => a - b);
  const answer = [];
  for (const x of values) {
    const full = brr.filter(v => v === x).length;
    const short = arr.filter(v => v === x).length;
    if (full > short) answer.push(x);
  }
  return answer;
}`,
      },
    },
    {
      name: '固定範圍差額表',
      idea: '對完整資料加一、短資料減一，差額為正的值就是缺的數字。',
      steps: ['找出 brr 最小值 base，建立可涵蓋數值跨度的計數陣列。', '掃 brr，對 count[x-base] 加一；掃 arr 時減一。', '由小到大掃 count，正數位置的 base+i 放進答案。'],
      figure: { title: '一次統計兩份紀錄', steps: countFig() },
      complexity: { time: 'O(n+m+R)', space: 'O(R)', why: '兩陣列各掃一次，再掃最多 101 個數值格；R 是數值跨度。' },
      verdict: '利用題目有限的數值跨度，不需額外排序。',
      code: {
        python: `def missingNumbers(arr, brr):
    base = min(brr)
    count = [0] * (max(brr) - base + 1)
    for x in brr:
        count[x - base] += 1
    for x in arr:
        count[x - base] -= 1  # 剩餘正數代表缺少
    return [base + i for i, value in enumerate(count) if value > 0]`,
        c: `int* missingNumbers(int arr_count, int* arr, int brr_count, int* brr, int* result_count) {
    int base = brr[0], top = brr[0];
    for (int i = 1; i < brr_count; i++) {
        if (brr[i] < base) base = brr[i];
        if (brr[i] > top) top = brr[i];
    }
    int range = top - base + 1;
    int* count = calloc(range, sizeof(int));
    int* result = malloc(sizeof(int) * range);
    for (int i = 0; i < brr_count; i++) count[brr[i] - base]++;
    for (int i = 0; i < arr_count; i++) count[arr[i] - base]--;
    *result_count = 0;
    for (int i = 0; i < range; i++) {
        if (count[i] > 0) result[(*result_count)++] = base + i;
    }
    free(count);
    return result;
}`,
        cpp: `vector<int> missingNumbers(vector<int> arr, vector<int> brr) {
    int base = *min_element(brr.begin(), brr.end());
    int top = *max_element(brr.begin(), brr.end());
    vector<int> count(top - base + 1, 0);
    for (int x : brr) count[x - base]++;
    for (int x : arr) count[x - base]--;
    vector<int> answer;
    for (int i = 0; i < (int)count.size(); i++) {
        if (count[i] > 0) answer.push_back(base + i);
    }
    return answer;
}`,
        java: `public static List<Integer> missingNumbers(List<Integer> arr, List<Integer> brr) {
    int base = Collections.min(brr);
    int top = Collections.max(brr);
    int[] count = new int[top - base + 1];
    for (int x : brr) count[x - base]++;
    for (int x : arr) count[x - base]--;
    List<Integer> answer = new ArrayList<>();
    for (int i = 0; i < count.length; i++) {
        if (count[i] > 0) answer.add(base + i);
    }
    return answer;
}`,
        javascript: `function missingNumbers(arr, brr) {
  const base = Math.min(...brr);
  const top = Math.max(...brr);
  const count = new Array(top - base + 1).fill(0);
  for (const x of brr) count[x - base]++;
  for (const x of arr) count[x - base]--;
  const answer = [];
  for (let i = 0; i < count.length; i++) {
    if (count[i] > 0) answer.push(base + i);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '某值在兩份資料都出現，仍可能少了幾次；不能只看集合差。',
    '一個值即使缺少多份，答案也只列這個值一次。',
    '結果須升冪；遍歷 hash map 時不一定有順序。',
  ],
  check: {
    kind: 'fn',
    fn: 'missingNumbers',
    cases: [
      { args: [[7, 2, 5, 3, 5, 3], [7, 2, 5, 4, 6, 3, 5, 3]], out: [4, 6] },
      { args: [[1, 1], [1, 1, 1, 2]], out: [1, 2] },
      { args: [[], [5]], out: [5] },
      { args: [[2], [2, 2]], out: [2] },
      { args: [[1, 2], [1, 2, 3]], out: [3] },
      { args: [[5, 5], [5, 5, 5, 5]], out: [5] },
    ],
  },
}
