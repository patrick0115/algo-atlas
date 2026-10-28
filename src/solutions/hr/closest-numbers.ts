import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

function pairFig(): FigStep[] {
  const a = [5, 2, 3, 4, 1], out: FigStep[] = []
  let best = Infinity, answer: number[] = []
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      const d = Math.abs(a[i] - a[j]), low = Math.min(a[i], a[j]), high = Math.max(a[i], a[j])
      if (d < best) { best = d; answer = [low, high] }
      else if (d === best) answer.push(low, high)
      out.push({ note: `比較 ${a[i]}、${a[j]}：差 ${d}；目前最小差 ${best}，留下 ${answer.length / 2} 對。`, views: [arr(a, { label: '原陣列', highlight: [i, j] }), arr([best, answer.length / 2], { label: '最小差 / 配對數' })] })
    }
  }
  return out
}

function sortedFig(): FigStep[] {
  const a = [5, 2, 3, 4, 1].sort((x, y) => x - y), out: FigStep[] = []
  let best = Infinity, answer: number[] = []
  for (let i = 1; i < a.length; i++) {
    const d = a[i] - a[i - 1]
    if (d < best) { best = d; answer = [a[i - 1], a[i]] }
    else if (d === best) answer.push(a[i - 1], a[i])
    out.push({ note: `相鄰 ${a[i - 1]}、${a[i]} 差 ${d}；最小差 ${best}，目前答案 ${answer.join(', ')}。`, views: [arr(a, { label: '排序後', highlight: [i - 1, i] }), arr(answer, { label: '目前答案' }), arr([best], { label: '最小差' })] })
  }
  return out
}

export const hrClosestNumbers: HrSolution = {
  slug: 'closest-numbers',
  plain: '像把身高排成一列找最接近的兩人：若兩人中間還站著一個人，他們不可能比相鄰者更接近。',
  statement: '給未排序整數陣列，找出絕對差最小的所有數字配對。每對較小值先列出，所有配對依數值由小到大排列，最後攤平成一維陣列回傳；配對允許共用同一數字。',
  examples: [
    { input: 'arr = [5,2,3,4,1]', output: '[1,2,2,3,3,4,4,5]', note: '排序後每組相鄰數都差 1，共四對。' },
    { input: 'arr = [4,2,1,3]', output: '[1,2,2,3,3,4]', note: '三組相鄰配對同為最小差 1。' },
  ],
  constraints: [
    '2 ≤ n ≤ 2×10^5 → 不能比較全部 O(n²) 數字對。',
    '數值可為負且大小可達 10^7 → 差值計算要先排序或取絕對值，不能只比原陣列相鄰項。',
    '數字互不重複 → 最小差大於 0，排序後的相鄰配對可直接輸出。',
  ],
  insight: [
    '最直覺是兩層迴圈比較所有配對，維持最小差與候選。',
    '排序後若 x < y 且中間有 z，則 z−x ≤ y−x，故非相鄰的 x、y 無需考慮。',
    '只掃排序後相鄰差，遇更小差就清空答案，遇相同差就追加；屬於排序後的 [[p:greedy]] 觀察。',
  ],
  approaches: [
    {
      name: '比較所有配對',
      idea: '把每兩個數都配成一組，維持目前最小差。',
      steps: ['對每個 i，比較所有 j>i。', '算兩數絕對差；小於目前最小差就重設答案，等於則追加。', '最後把配對依第一個數排序並攤平。'],
      figure: { title: 'arr = [5,2,3,4,1]', steps: pairFig() },
      complexity: { time: 'O(n² + p log p)', space: 'O(p)', why: '有 n(n−1)/2 組配對；至多保留 p 對並排序。' },
      verdict: '能作為小資料的對照，但大量資料無法及時完成。',
      code: {
        python: `def closestNumbers(arr):
    best = float('inf')
    pairs = []
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            gap = abs(arr[i] - arr[j])
            pair = (min(arr[i], arr[j]), max(arr[i], arr[j]))
            if gap < best:
                best = gap
                pairs = [pair]  # 更小差，舊配對全部丟掉
            elif gap == best:
                pairs.append(pair)
    pairs.sort()
    return [value for pair in pairs for value in pair]`,
        c: `int* closestNumbers(int arr_count, int* arr, int* result_count) {
    long long best = LLONG_MAX;
    int* result = malloc(sizeof(int) * arr_count * 2);
    *result_count = 0;
    for (int i = 0; i < arr_count; i++) {
        for (int j = i + 1; j < arr_count; j++) {
            long long gap = llabs((long long)arr[i] - arr[j]);
            if (gap > best) continue;
            if (gap < best) {
                best = gap;
                *result_count = 0;
            }
            int low = arr[i] < arr[j] ? arr[i] : arr[j];
            int high = arr[i] > arr[j] ? arr[i] : arr[j];
            int pos = *result_count;
            while (pos >= 2 && result[pos - 2] > low) {
                result[pos] = result[pos - 2];
                result[pos + 1] = result[pos - 1];
                pos -= 2;
            }
            result[pos] = low;
            result[pos + 1] = high;
            *result_count += 2;
        }
    }
    return result;
}`,
        cpp: `vector<int> closestNumbers(vector<int> arr) {
    long long best = LLONG_MAX;
    vector<pair<int, int>> pairs;
    for (int i = 0; i < (int)arr.size(); i++) {
        for (int j = i + 1; j < (int)arr.size(); j++) {
            long long gap = llabs((long long)arr[i] - arr[j]);
            if (gap < best) {
                best = gap;
                pairs.clear();
            }
            if (gap == best) pairs.push_back(minmax(arr[i], arr[j]));
        }
    }
    sort(pairs.begin(), pairs.end());
    vector<int> answer;
    for (auto [a, b] : pairs) { answer.push_back(a); answer.push_back(b); }
    return answer;
}`,
        java: `public static List<Integer> closestNumbers(List<Integer> arr) {
    long best = Long.MAX_VALUE;
    List<int[]> pairs = new ArrayList<>();
    for (int i = 0; i < arr.size(); i++) {
        for (int j = i + 1; j < arr.size(); j++) {
            long gap = Math.abs((long) arr.get(i) - arr.get(j));
            if (gap < best) {
                best = gap;
                pairs.clear();
            }
            if (gap == best) pairs.add(new int[]{Math.min(arr.get(i), arr.get(j)), Math.max(arr.get(i), arr.get(j))});
        }
    }
    pairs.sort((a, b) -> Integer.compare(a[0], b[0]));
    List<Integer> answer = new ArrayList<>();
    for (int[] pair : pairs) { answer.add(pair[0]); answer.add(pair[1]); }
    return answer;
}`,
        javascript: `function closestNumbers(arr) {
  let best = Infinity;
  let pairs = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      const gap = Math.abs(arr[i] - arr[j]);
      if (gap < best) { best = gap; pairs = []; }
      if (gap === best) pairs.push([Math.min(arr[i], arr[j]), Math.max(arr[i], arr[j])]);
    }
  }
  pairs.sort((a, b) => a[0] - b[0]);
  return pairs.flat();
}`,
      },
    },
    {
      name: '排序後只看相鄰數',
      idea: '全域最小差一定出現在排序後相鄰的兩數。',
      steps: ['將 arr 由小到大排序。', '由第二個數起，計算與前一數的差。', '差更小就清空並加入該對；差相同就直接追加。', '依掃描順序所得配對已排序，直接回傳。'],
      figure: { title: 'arr = [5,2,3,4,1]', steps: sortedFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序主導時間；答案最壞有 n−1 對，需 O(n) 空間。' },
      verdict: '只比較必要配對，適合題目上限。',
      code: {
        python: `def closestNumbers(arr):
    arr.sort()
    best = float('inf')
    answer = []
    for i in range(1, len(arr)):
        gap = arr[i] - arr[i - 1]  # 排序後只需看鄰居
        if gap < best:
            best = gap
            answer = [arr[i - 1], arr[i]]
        elif gap == best:
            answer.extend([arr[i - 1], arr[i]])
    return answer`,
        c: `int compareInts(const void* a, const void* b) {
    int x = *(const int*)a, y = *(const int*)b;
    return (x > y) - (x < y);
}

int* closestNumbers(int arr_count, int* arr, int* result_count) {
    qsort(arr, arr_count, sizeof(int), compareInts);
    int* answer = malloc(sizeof(int) * 2 * (arr_count - 1));
    long long best = LLONG_MAX;
    *result_count = 0;
    for (int i = 1; i < arr_count; i++) {
        long long gap = (long long)arr[i] - arr[i - 1];
        if (gap < best) { best = gap; *result_count = 0; }
        if (gap == best) {
            answer[(*result_count)++] = arr[i - 1];
            answer[(*result_count)++] = arr[i];
        }
    }
    return answer;
}`,
        cpp: `vector<int> closestNumbers(vector<int> arr) {
    sort(arr.begin(), arr.end());
    long long best = LLONG_MAX;
    vector<int> answer;
    for (int i = 1; i < (int)arr.size(); i++) {
        long long gap = (long long)arr[i] - arr[i - 1];
        if (gap < best) { best = gap; answer.clear(); }
        if (gap == best) { answer.push_back(arr[i - 1]); answer.push_back(arr[i]); }
    }
    return answer;
}`,
        java: `public static List<Integer> closestNumbers(List<Integer> arr) {
    Collections.sort(arr);
    long best = Long.MAX_VALUE;
    List<Integer> answer = new ArrayList<>();
    for (int i = 1; i < arr.size(); i++) {
        long gap = (long) arr.get(i) - arr.get(i - 1);
        if (gap < best) { best = gap; answer.clear(); }
        if (gap == best) { answer.add(arr.get(i - 1)); answer.add(arr.get(i)); }
    }
    return answer;
}`,
        javascript: `function closestNumbers(arr) {
  arr.sort((a, b) => a - b);
  let best = Infinity;
  let answer = [];
  for (let i = 1; i < arr.length; i++) {
    const gap = arr[i] - arr[i - 1];
    if (gap < best) { best = gap; answer = []; }
    if (gap === best) answer.push(arr[i - 1], arr[i]);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '回傳所有最小差配對，不只第一對。',
    '配對可以重疊，例如 [1,2] 與 [2,3] 都要保留。',
    'JavaScript 排序必須用數值比較；負數差也需正確處理。',
  ],
  check: {
    kind: 'fn', fn: 'closestNumbers',
    cases: [
      { args: [[5, 2, 3, 4, 1]], out: [1, 2, 2, 3, 3, 4, 4, 5] },
      { args: [[4, 2, 1, 3]], out: [1, 2, 2, 3, 3, 4] },
      { args: [[10, 20]], out: [10, 20] },
      { args: [[-4, -1, 5]], out: [-4, -1] },
      { args: [[1, 4, 8, 11]], out: [1, 4, 8, 11] },
      { args: [[-2, -1, 0]], out: [-2, -1, -1, 0] },
    ],
  },
}
