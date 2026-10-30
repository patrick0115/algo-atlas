import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const a = [3, 5, 7], b = [3, 6], c = [4, 6, 9]

function bruteFig(): FigStep[] {
  const out: FigStep[] = []
  const seen = new Set<string>()
  for (const q of b) {
    for (const p of a) {
      for (const r of c) {
        const good = p <= q && r <= q
        if (good) seen.add(`${p},${q},${r}`)
        out.push({ note: `試 (${p}, ${q}, ${r})：${p} ≤ ${q} 且 ${r} ≤ ${q} ${good ? '成立' : '不成立'}；不同三元組目前 ${seen.size} 個。`, views: [arr(a, { label: 'a', highlight: [a.indexOf(p)] }), arr(b, { label: 'b：q', highlight: [b.indexOf(q)] }), arr(c, { label: 'c', highlight: [c.indexOf(r)] }), arr([seen.size], { label: '累計' })] })
      }
    }
  }
  return out
}

function sortedFig(): FigStep[] {
  const out: FigStep[] = []
  const aa = [...new Set(a)].sort((x, y) => x - y)
  const bb = [...new Set(b)].sort((x, y) => x - y)
  const cc = [...new Set(c)].sort((x, y) => x - y)
  let i = 0, j = 0, answer = 0
  for (const q of bb) {
    while (i < aa.length && aa[i] <= q) {
      i++
      out.push({ note: `q=${q}，a 的 ${aa[i - 1]} 不大於 q；左指標前進到 ${i}，代表已有 ${i} 種 p。`, views: [arr(aa, { label: '去重排序 a', done: Array.from({ length: i }, (_, k) => k) }), arr(cc, { label: '去重排序 c', done: Array.from({ length: j }, (_, k) => k) }), arr([i, j, answer], { label: 'a 個數、c 個數、答案' })] })
    }
    while (j < cc.length && cc[j] <= q) {
      j++
      out.push({ note: `q=${q}，c 的 ${cc[j - 1]} 不大於 q；右指標前進到 ${j}，代表已有 ${j} 種 r。`, views: [arr(aa, { label: '去重排序 a', done: Array.from({ length: i }, (_, k) => k) }), arr(cc, { label: '去重排序 c', done: Array.from({ length: j }, (_, k) => k) }), arr([i, j, answer], { label: 'a 個數、c 個數、答案' })] })
    }
    answer += i * j
    out.push({ note: `中間值 q=${q}；a 中有 ${i} 個、c 中有 ${j} 個不大於它，新增 ${i}×${j}=${i * j}，累計 ${answer}。`, views: [arr(aa, { label: '去重排序 a', done: Array.from({ length: i }, (_, k) => k) }), arr(bb, { label: 'q', highlight: [bb.indexOf(q)] }), arr(cc, { label: '去重排序 c', done: Array.from({ length: j }, (_, k) => k) }), arr([i, j, answer], { label: 'a 個數、c 個數、答案' })] })
  }
  return out
}

export const hrTripleSum: HrSolution = {
  slug: 'triple-sum',
  plain: '像從三個籃子各挑一個數，中間籃子的數必須不小於左右兩邊；重複數字不算新組合。',
  statement: '輸入三個整數陣列 a、b、c。選 p∈a、q∈b、r∈c，且 p≤q、r≤q。計算數值三元組 (p,q,r) 的不同組數；同一數字即使在陣列重複出現，也只算一次。',
  examples: [
    { input: 'a = [3,5,7], b = [3,6], c = [4,6,9]', output: '4', note: '只有 q=6 能配對，左右各有 2 種選擇。' },
    { input: 'a = [1,1], b = [1,2], c = [1,2]', output: '3', note: 'q=1 有 1 組，q=2 有 2 組；重複的 1 不重算。' },
  ],
  constraints: [
    '三個陣列各可達 10^5 筆 → 三層迴圈最多 10^15 次，必須避免逐組測試。',
    '數值可達 10^8 → 不能依數值大小建立計數陣列。',
    '答案最多接近 10^15 → C、C++、Java 須使用 64 位元整數。',
  ],
  insight: [
    '先枚舉所有 (p,q,r) 最容易理解，但重複值要去掉且組合數過大。',
    '固定 q 後，左右互不影響：可選 p 的數量乘可選 r 的數量，就是這個 q 的新組數。',
    '先去重、排序，再由小到大掃描 q；兩個指標只往前走，和 [[p:two-pointers]] 的單調性相同。若分別二分也可得 O(n log n)。',
  ],
  approaches: [
    {
      name: '逐組枚舉與去重',
      idea: '測試每個三元組，合法時把數值組合放進集合。',
      steps: ['建立空集合記錄不同的 (p,q,r)。', '三層迴圈分別取 q、p、r。', '若 p≤q 且 r≤q，把三個數組成鍵加入集合。', '回傳集合大小。'],
      figure: { title: 'a=[3,5,7], b=[3,6], c=[4,6,9]', steps: bruteFig() },
      complexity: { time: 'O(|a||b||c|)', space: 'O(K)', why: '測試所有組合；集合最多保存 K 個不同的合法三元組。C 版沒有集合，靠往回掃前面有沒有同值來去重，最壞會到四次方；C++ 的 set 每次插入另有 log 成本。' },
      verdict: '適合小陣列作參照，大資料時三層枚舉無法完成。',
      code: {
        python: `def triplets(a, b, c):
    seen = set()
    for q in b:
        for p in a:
            for r in c:
                if p <= q and r <= q:
                    seen.add((p, q, r))  # 數值相同的組合只算一次
    return len(seen)`,
        c: `long long triplets(int a_count, int* a, int b_count, int* b, int c_count, int* c) {
    long long answer = 0;
    for (int j = 0; j < b_count; j++) {
        int duplicateQ = 0;
        for (int t = 0; t < j; t++) if (b[t] == b[j]) duplicateQ = 1;
        if (duplicateQ) continue;
        for (int i = 0; i < a_count; i++) {
            if (a[i] > b[j]) continue;
            int duplicateP = 0;
            for (int t = 0; t < i; t++) if (a[t] == a[i]) duplicateP = 1;
            if (duplicateP) continue;
            for (int k = 0; k < c_count; k++) {
                if (c[k] > b[j]) continue;
                int duplicateR = 0;
                for (int t = 0; t < k; t++) if (c[t] == c[k]) duplicateR = 1;
                if (!duplicateR) answer++;
            }
        }
    }
    return answer;
}`,
        cpp: `long long triplets(vector<int> a, vector<int> b, vector<int> c) {
    set<tuple<int, int, int>> seen;
    for (int q : b) {
        for (int p : a) {
            for (int r : c) {
                if (p <= q && r <= q) seen.insert({p, q, r});
            }
        }
    }
    return seen.size();
}`,
        java: `public static long triplets(List<Integer> a, List<Integer> b, List<Integer> c) {
    return triplets(a.stream().mapToInt(Integer::intValue).toArray(), b.stream().mapToInt(Integer::intValue).toArray(), c.stream().mapToInt(Integer::intValue).toArray());
}
public static long triplets(int[] a, int[] b, int[] c) {
    java.util.Set<String> seen = new java.util.HashSet<>();
    for (int q : b) {
        for (int p : a) {
            for (int r : c) {
                if (p <= q && r <= q) seen.add(p + "," + q + "," + r);
            }
        }
    }
    return seen.size();
}`,
        javascript: `function triplets(a, b, c) {
  const seen = new Set();
  for (const q of b) {
    for (const p of a) {
      for (const r of c) {
        if (p <= q && r <= q) seen.add([p, q, r].join(','));
      }
    }
  }
  return seen.size;
}`,
      },
    },
    {
      name: '去重排序與雙指標',
      idea: '固定每個不同的 q，累計左右兩側不大於 q 的不同數值個數之乘積。',
      steps: ['三個陣列分別去重並升序排序。', '設定兩個指標 i、j，指向 a、c 中第一個尚未被計入的數。', '依序走訪每個 q；指標向右越過所有 ≤q 的數。', '把 i×j 加到答案，最後回傳答案。'],
      figure: { title: 'a=[3,5,7], b=[3,6], c=[4,6,9]', steps: sortedFig() },
      complexity: { time: 'O(N log N)', space: 'O(N)', why: '排序主導時間；排序後指標各自最多前進陣列長度次，去重陣列佔線性空間。' },
      verdict: '能在大輸入內完成；乘積與總和要用 64 位元。',
      code: {
        python: `def triplets(a, b, c):
    a, b, c = sorted(set(a)), sorted(set(b)), sorted(set(c))
    left = right = answer = 0
    for q in b:
        while left < len(a) and a[left] <= q:
            left += 1
        while right < len(c) and c[right] <= q:
            right += 1
        answer += left * right  # 左右選法獨立，數量相乘
    return answer`,
        c: `int compareInt(const void* x, const void* y) {
    int a = *(const int*)x, b = *(const int*)y;
    return (a > b) - (a < b);
}
long long triplets(int a_count, int* a, int b_count, int* b, int c_count, int* c) {
    qsort(a, a_count, sizeof(int), compareInt);
    qsort(b, b_count, sizeof(int), compareInt);
    qsort(c, c_count, sizeof(int), compareInt);
    int na = 0, nb = 0, nc = 0;
    for (int i = 0; i < a_count; i++) if (!i || a[i] != a[i - 1]) a[na++] = a[i];
    for (int i = 0; i < b_count; i++) if (!i || b[i] != b[i - 1]) b[nb++] = b[i];
    for (int i = 0; i < c_count; i++) if (!i || c[i] != c[i - 1]) c[nc++] = c[i];
    int left = 0, right = 0;
    long long answer = 0;
    for (int k = 0; k < nb; k++) {
        while (left < na && a[left] <= b[k]) left++;
        while (right < nc && c[right] <= b[k]) right++;
        answer += (long long)left * right;
    }
    return answer;
}`,
        cpp: `long long triplets(vector<int> a, vector<int> b, vector<int> c) {
    auto uniqueSort = [](vector<int>& v) {
        sort(v.begin(), v.end());
        v.erase(unique(v.begin(), v.end()), v.end());
    };
    uniqueSort(a);
    uniqueSort(b);
    uniqueSort(c);
    int left = 0, right = 0;
    long long answer = 0;
    for (int q : b) {
        while (left < (int)a.size() && a[left] <= q) left++;
        while (right < (int)c.size() && c[right] <= q) right++;
        answer += 1LL * left * right;
    }
    return answer;
}`,
        java: `public static long triplets(List<Integer> a, List<Integer> b, List<Integer> c) {
    return triplets(a.stream().mapToInt(Integer::intValue).toArray(), b.stream().mapToInt(Integer::intValue).toArray(), c.stream().mapToInt(Integer::intValue).toArray());
}
public static long triplets(int[] a, int[] b, int[] c) {
    java.util.TreeSet<Integer> aa = new java.util.TreeSet<>();
    java.util.TreeSet<Integer> bb = new java.util.TreeSet<>();
    java.util.TreeSet<Integer> cc = new java.util.TreeSet<>();
    for (int x : a) aa.add(x);
    for (int x : b) bb.add(x);
    for (int x : c) cc.add(x);
    int[] left = aa.stream().mapToInt(Integer::intValue).toArray();
    int[] right = cc.stream().mapToInt(Integer::intValue).toArray();
    int i = 0, j = 0;
    long answer = 0;
    for (int q : bb) {
        while (i < left.length && left[i] <= q) i++;
        while (j < right.length && right[j] <= q) j++;
        answer += (long)i * j;
    }
    return answer;
}`,
        javascript: `function triplets(a, b, c) {
  const sorted = xs => [...new Set(xs)].sort((x, y) => x - y);
  a = sorted(a);
  b = sorted(b);
  c = sorted(c);
  let left = 0;
  let right = 0;
  let answer = 0;
  for (const q of b) {
    while (left < a.length && a[left] <= q) left++;
    while (right < c.length && c[right] <= q) right++;
    answer += left * right;
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '題目算不同數值三元組，重複元素不能讓計數倍增。',
    '左右條件都是 ≤q；不必要求 p≤r。',
    'JavaScript 數值在本題答案範圍仍可精確表示；C 類語言的乘積須先轉 64 位元。',
  ],
  check: {
    kind: 'fn', fn: 'triplets', cases: [
      { args: [[3, 5, 7], [3, 6], [4, 6, 9]], out: 4 },
      { args: [[1, 1], [1, 2], [1, 2]], out: 3 },
      { args: [[1], [1], [1]], out: 1 },
      { args: [[5], [1], [5]], out: 0 },
      { args: [[1, 2], [2], [1, 2]], out: 4 },
      { args: [[1, 1, 1], [1, 1], [1, 1]], out: 1 },
    ],
  },
}
