import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

function triplesFig(): FigStep[] {
  const a = [1, 4, 16, 64], r = 4, out: FigStep[] = []
  let answer = 0
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      for (let k = j + 1; k < a.length; k++) {
        const match = a[j] === a[i] * r && a[k] === a[j] * r
        if (match) answer++
        out.push({ note: `試索引 (${i},${j},${k})，值 (${a[i]},${a[j]},${a[k]})：${match ? `連續乘 ${r}，累計 ${answer} 組` : '比例不符，捨棄'}。`, views: [arr(a, { label: '數列', highlight: [i, j, k] }), arr([answer], { label: '目前組數' })] })
      }
    }
  }
  return out
}

function middleFig(): FigStep[] {
  const a = [1, 4, 16, 64], r = 4, left = new Map<number, number>(), right = new Map<number, number>(), out: FigStep[] = []
  for (const x of a) right.set(x, (right.get(x) ?? 0) + 1)
  let answer = 0
  for (let j = 0; j < a.length; j++) {
    const x = a[j]
    right.set(x, (right.get(x) ?? 0) - 1)
    const before = x % r === 0 ? left.get(x / r) ?? 0 : 0
    const after = right.get(x * r) ?? 0
    answer += before * after
    out.push({ note: `把 ${x} 當中間項：左側 ${x / r} 有 ${before} 個，右側 ${x * r} 有 ${after} 個，新增 ${before}×${after} = ${before * after} 組；總共 ${answer}。`, views: [arr(a, { label: '目前中間項', highlight: [j] }), kv(left, '左側次數'), kv(right, '右側次數'), arr([before, after, answer], { label: '左選法 / 右選法 / 總數' })] })
    left.set(x, (left.get(x) ?? 0) + 1)
  }
  return out
}

export const hrCountTriplets1: HrSolution = {
  slug: 'count-triplets-1',
  plain: '像在時間軸上挑三張數字卡：第一張乘 r 得第二張，第二張再乘 r 得第三張；相同數字若在不同位置，也算不同挑法。',
  statement: '輸入整數陣列 arr 與公比 r。選三個索引 i<j<k，使 arr[j]=arr[i]×r 且 arr[k]=arr[j]×r。回傳符合的索引三元組總數。',
  examples: [
    { input: 'arr = [1,4,16,64], r = 4', output: '2', note: '可選索引 (0,1,2) 與 (1,2,3)。' },
    { input: 'arr = [1,3,9,9,27,81], r = 3', output: '6', note: '兩個 9 是不同位置，因此各自能參與不同組合。' },
  ],
  constraints: [
    '3 ≤ n ≤ 10^5 → 三層迴圈 O(n³) 不可行。',
    'r ≥ 1、數值為正整數 → 中間項的前項可用整除檢查；r=1 時重複值仍須逐位置計數。',
    '答案可能達 C(n,3) → 要用 64 位整數計數，C/C++/Java 的 long long/long。',
  ],
  insight: [
    '先按定義枚舉 i、j、k，檢查兩次乘法，容易確認答案。',
    '固定中間索引 j 後，左右選法互相獨立：左邊有多少 `x/r`，右邊有多少 `x*r`，兩數相乘即可。',
    '隨 j 向右移，左邊增加目前值、右邊減少目前值；用兩張 [[p:hash-map]] 次數表維持。',
  ],
  approaches: [
    {
      name: '三層迴圈逐組檢查',
      idea: '枚舉每組 i<j<k，直接檢查等比條件。',
      steps: ['從左到右選第一項 i。', '在 i 後選第二項 j，再在 j 後選第三項 k。', '兩個等比等式都成立就把答案加一。'],
      figure: { title: 'arr = [1,4,16,64]，r = 4', steps: triplesFig() },
      complexity: { time: 'O(n³)', space: 'O(1)', why: '有 C(n,3) 個索引組合；只需答案變數。' },
      verdict: '可用於小陣列驗證，但不能處理題目上限。',
      code: {
        python: `def countTriplets(arr, r):
    answer = 0
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            for k in range(j + 1, len(arr)):
                if arr[j] == arr[i] * r and arr[k] == arr[j] * r:
                    answer += 1  # 每組索引都算一次
    return answer`,
        c: `long long countTriplets(int arr_count, long long* arr, long long r) {
    long long answer = 0;
    for (int i = 0; i < arr_count; i++) {
        for (int j = i + 1; j < arr_count; j++) {
            for (int k = j + 1; k < arr_count; k++) {
                if (arr[j] == arr[i] * r && arr[k] == arr[j] * r) answer++;
            }
        }
    }
    return answer;
}`,
        cpp: `long long countTriplets(vector<long long> arr, long long r) {
    long long answer = 0;
    for (int i = 0; i < (int)arr.size(); i++) {
        for (int j = i + 1; j < (int)arr.size(); j++) {
            for (int k = j + 1; k < (int)arr.size(); k++) {
                if (arr[j] == arr[i] * r && arr[k] == arr[j] * r) answer++;
            }
        }
    }
    return answer;
}`,
        java: `public static long countTriplets(List<Long> arr, long r) {
    long answer = 0;
    for (int i = 0; i < arr.size(); i++) {
        for (int j = i + 1; j < arr.size(); j++) {
            for (int k = j + 1; k < arr.size(); k++) {
                if (arr.get(j) == arr.get(i) * r && arr.get(k) == arr.get(j) * r) answer++;
            }
        }
    }
    return answer;
}`,
        javascript: `function countTriplets(arr, r) {
  let answer = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      for (let k = j + 1; k < arr.length; k++) {
        if (arr[j] === arr[i] * r && arr[k] === arr[j] * r) answer++;
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '固定中間項，左右次數相乘',
      idea: '每個值 x 當中間項時，前後可選的位置數相乘就是新增組數。',
      steps: ['先把全部值計入 right 次數表；left 為空。', '逐個取 x，先從 right 扣掉目前位置，確保右邊只剩 j 後的位置。', '若 x 能被 r 整除，取 left[x/r] 與 right[x*r]，乘積加入答案。', '最後把 x 加入 left，供後續中間項使用。'],
      figure: { title: 'arr = [1,4,16,64]，r = 4', steps: middleFig() },
      complexity: { time: '平均 O(n)', space: 'O(u)', why: '每個位置只更新與查詢固定次數的雜湊表;u 為不同值數。C 版手寫的開放定址表容量依 n 配置,所以是 O(n)。' },
      verdict: '同值多次出現也能正確計入組合數。',
      code: {
        python: `def countTriplets(arr, r):
    left = {}
    right = {}
    for x in arr:
        right[x] = right.get(x, 0) + 1
    answer = 0
    for x in arr:
        right[x] -= 1  # 目前位置不屬於右側
        if x % r == 0:
            answer += left.get(x // r, 0) * right.get(x * r, 0)
        left[x] = left.get(x, 0) + 1
    return answer`,
        c: `typedef struct { long long key, count; int used; } CountSlot;

CountSlot* findSlot(CountSlot* table, int capacity, long long key) {
    unsigned long long h = (unsigned long long)key * 11400714819323198485ULL;
    int pos = (int)(h & (capacity - 1));
    while (table[pos].used && table[pos].key != key) pos = (pos + 1) & (capacity - 1);
    table[pos].used = 1;
    table[pos].key = key;
    return &table[pos];
}

long long countTriplets(int arr_count, long long* arr, long long r) {
    int capacity = 1;
    while (capacity < arr_count * 4) capacity <<= 1;
    CountSlot* left = calloc(capacity, sizeof(CountSlot));
    CountSlot* right = calloc(capacity, sizeof(CountSlot));
    for (int i = 0; i < arr_count; i++) findSlot(right, capacity, arr[i])->count++;
    long long answer = 0;
    for (int i = 0; i < arr_count; i++) {
        long long x = arr[i];
        findSlot(right, capacity, x)->count--;
        if (x % r == 0) {
            long long before = findSlot(left, capacity, x / r)->count;
            long long after = findSlot(right, capacity, x * r)->count;
            answer += before * after;
        }
        findSlot(left, capacity, x)->count++;
    }
    free(left);
    free(right);
    return answer;
}`,
        cpp: `long long countTriplets(vector<long long> arr, long long r) {
    unordered_map<long long, long long> left, right;
    for (long long x : arr) right[x]++;
    long long answer = 0;
    for (long long x : arr) {
        right[x]--;
        if (x % r == 0) answer += left[x / r] * right[x * r];
        left[x]++;
    }
    return answer;
}`,
        java: `public static long countTriplets(List<Long> arr, long r) {
    Map<Long, Long> left = new HashMap<>(), right = new HashMap<>();
    for (long x : arr) right.put(x, right.getOrDefault(x, 0L) + 1);
    long answer = 0;
    for (long x : arr) {
        right.put(x, right.get(x) - 1);
        if (x % r == 0) {
            answer += left.getOrDefault(x / r, 0L) * right.getOrDefault(x * r, 0L);
        }
        left.put(x, left.getOrDefault(x, 0L) + 1);
    }
    return answer;
}`,
        javascript: `function countTriplets(arr, r) {
  const left = new Map();
  const right = new Map();
  for (const x of arr) right.set(x, (right.get(x) || 0) + 1);
  let answer = 0;
  for (const x of arr) {
    right.set(x, right.get(x) - 1);
    if (x % r === 0) answer += (left.get(x / r) || 0) * (right.get(x * r) || 0);
    left.set(x, (left.get(x) || 0) + 1);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '先從 right 扣掉中間項，再計算；否則 r=1 會把同一索引當成第三項。',
    '只在 x 能被 r 整除時查前項；公比為 1 時仍須把不同索引分開。',
    '答案是索引組數，重複值不能去重；大答案應使用 64 位整數。',
  ],
  check: {
    kind: 'fn', fn: 'countTriplets',
    cases: [
      { args: [[1, 4, 16, 64], 4], out: 2 },
      { args: [[1, 3, 9, 9, 27, 81], 3], out: 6 },
      { args: [[1, 1, 1, 1], 1], out: 4 },
      { args: [[1, 2, 3], 2], out: 0 },
      { args: [[1, 2, 4], 2], out: 1 },
      { args: [[5, 5, 5, 5, 5], 1], out: 10 },
    ],
  },
}
