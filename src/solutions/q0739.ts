import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 739. Daily Temperatures

const T = [73, 74, 75, 71, 69, 72, 76, 73]

function bruteFig(): FigStep[] {
  const ans: (number | string)[] = T.map(() => '?')
  const out: FigStep[] = [{ note: '對每一天,往後一天一天找,第一個比今天熱的那天,距離就是答案', views: [arr(T, { label: '溫度', mode: 'bars' }), arr(ans, { label: '答案' })] }]
  for (let i = 0; i < T.length; i++) {
    let j = i + 1
    while (j < T.length && T[j] <= T[i]) j++
    ans[i] = j < T.length ? j - i : 0
    out.push({ note: `第 ${i} 天 ${T[i]}°:${j < T.length ? `往後找到第 ${j} 天 ${T[j]}° 比較熱 → 等 ${j - i} 天` : '後面沒有更熱的 → 0'}`, views: [arr(T, { label: '溫度', mode: 'bars', highlight: [i], compare: range(i + 1, Math.min(j, T.length - 1)) }), arr(ans, { label: '答案', highlight: [i] })] })
  }
  return out
}

function stackFig(): FigStep[] {
  const ans: number[] = T.map(() => 0)
  const st: number[] = []
  const out: FigStep[] = [{ note: '單調堆疊:堆疊裡放「還在等更熱天氣」的日子(索引),由底到頂溫度是**遞減**的。新的一天比堆疊頂端熱 → 頂端那天等到了', views: [arr(T, { label: '溫度', mode: 'bars' }), arr([], { label: '堆疊(還在等的日子)' })] }]
  for (let i = 0; i < T.length; i++) {
    const solved: number[] = []
    while (st.length && T[st[st.length - 1]] < T[i]) {
      const j = st.pop()!
      ans[j] = i - j
      solved.push(j)
    }
    st.push(i)
    out.push({
      note: `第 ${i} 天 ${T[i]}°:${solved.length ? `比堆疊裡的 ${solved.map((j) => `第 ${j} 天(${T[j]}°)`).join('、')} 熱 → 它們等到了,彈出並寫答案;` : '沒有比堆疊頂端熱;'}把第 ${i} 天放進堆疊`,
      views: [arr(T, { label: '溫度', mode: 'bars', highlight: [i], done: solved, dim: range(0, i - 1).filter((k) => !st.includes(k) && !solved.includes(k)) }), arr(st.map((k) => `${k}:${T[k]}°`), { label: '堆疊(索引:溫度)' }), arr(ans, { label: '答案', highlight: solved })],
    })
  }
  out.push({ note: '走完了,堆疊裡剩下的日子後面都沒有更熱的,答案維持 0', views: [arr(ans, { label: '答案' })] })
  return out
}

function backFig(): FigStep[] {
  const n = T.length
  const ans = Array(n).fill(0)
  const out: FigStep[] = [{ note: '從最後一天往前算。找第 i 天的答案時,可以利用後面已經算好的答案「跳著找」:如果第 j 天不夠熱,下一個候選就是 j + ans[j](比 j 熱的第一天)', views: [arr(T, { label: '溫度', mode: 'bars' })] }]
  for (let i = n - 2; i >= 0; i--) {
    let j = i + 1
    const jumps = [j]
    while (j < n && T[j] <= T[i]) {
      if (ans[j] === 0) {
        j = n
        break
      }
      j += ans[j]
      jumps.push(j)
    }
    ans[i] = j < n ? j - i : 0
    out.push({ note: `第 ${i} 天 ${T[i]}°:候選依序是 ${jumps.filter((x) => x < n).join(' → ')}${j < n ? `,第 ${j} 天 ${T[j]}° 比較熱 → ${j - i}` : ',都不夠熱 → 0'}`, views: [arr(T, { label: '溫度', mode: 'bars', highlight: [i], compare: jumps.filter((x) => x < n) }), arr(ans, { label: '答案', highlight: [i], dim: range(0, i - 1) })] })
  }
  return out
}

export const q0739: Solution = {
  id: 739,
  plain: '給你接下來每天的氣溫,對每一天回答:「還要等幾天,才會遇到比今天更熱的日子?」等不到就寫 0。',
  statement: '`temperatures[i]` 是第 i 天的溫度。回傳陣列 `answer`,`answer[i]` 是從第 i 天起,要再過幾天才會出現**更高**的溫度;之後都沒有就是 0。',
  examples: [
    { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' },
    { input: 'temperatures = [30,40,50,60]', output: '[1,1,1,0]' },
    { input: 'temperatures = [30,60,90]', output: '[1,1,0]' },
  ],
  constraints: ['`1 ≤ n ≤ 10⁵` → O(n²) 是 100 億,太慢', '溫度在 30~100 之間'],
  insight: [
    '暴力:每天往後掃到第一個更熱的 → O(n²),一路下降的輸入會很慢',
    '換個角度想:不是「每天去找未來」,而是「每來一個新的一天,看它能讓哪些還在等的日子結束等待」',
    '還在等的日子有個特性:它們的溫度一定是**由舊到新遞減**的(如果後面有比較熱的,前面那天早就等到了)。這種「保持遞減」的堆疊叫**單調堆疊**',
    '新的一天比堆疊頂端熱 → 頂端那天等到了,彈出、寫答案;一直彈到頂端不比它冷,再把它放進去',
  ],
  approaches: [
    {
      name: '暴力:每天往後找',
      idea: '對每個 i,j 從 i+1 往後找第一個 `T[j] > T[i]`。',
      steps: ['對每個 `i`:`j = i + 1`', '`while j < n and T[j] <= T[i]`:`j++`', '`answer[i] = j − i`(找不到就是 0)'],
      figure: { title: `temperatures = [${T.join(',')}]`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '最壞(溫度一路下降)每天都要掃到底。' },
      verdict: 'n = 10⁵ 會超時。用來確認題意。',
      code: {
        python: `def dailyTemperatures(temperatures):
    n = len(temperatures)
    ans = [0] * n
    for i in range(n):
        for j in range(i + 1, n):
            if temperatures[j] > temperatures[i]:
                ans[i] = j - i
                break
    return ans`,
        c: `int *dailyTemperatures(int *t, int n, int *returnSize) {
    int *ans = calloc(n, sizeof(int));
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (t[j] > t[i]) { ans[i] = j - i; break; }
    *returnSize = n;
    return ans;
}`,
        cpp: `vector<int> dailyTemperatures(vector<int>& t) {
    int n = t.size();
    vector<int> ans(n, 0);
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (t[j] > t[i]) { ans[i] = j - i; break; }
    return ans;
}`,
        java: `int[] dailyTemperatures(int[] t) {
    int n = t.length;
    int[] ans = new int[n];
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (t[j] > t[i]) { ans[i] = j - i; break; }
    return ans;
}`,
        javascript: `function dailyTemperatures(t) {
  const n = t.length, ans = new Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (t[j] > t[i]) { ans[i] = j - i; break; }
  return ans;
}`,
      },
    },
    {
      name: '單調遞減堆疊',
      idea: '堆疊存「還沒等到更熱天氣」的索引。新的一天 i:只要比堆疊頂端那天熱,頂端就等到了(`ans[頂端] = i − 頂端`),彈出;最後把 i 放進去。',
      steps: ['`st = []`', '對每個 `i`:`while st and T[st[-1]] < T[i]`:`j = st.pop()`、`ans[j] = i − j`', '`st.append(i)`', '剩在堆疊裡的答案是 0'],
      figure: { title: `temperatures = [${T.join(',')}]`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個索引最多進堆疊一次、出堆疊一次。' },
      verdict: '標準解,[[p:monotonic-stack]]的代表題。「找下一個更大 / 更小的元素」都是這招:496、503、901、84。',
      code: {
        python: `def dailyTemperatures(temperatures):
    ans = [0] * len(temperatures)
    st = []                               # 還在等的日子(索引),溫度由底到頂遞減
    for i, t in enumerate(temperatures):
        while st and temperatures[st[-1]] < t:
            j = st.pop()                  # 第 j 天等到了
            ans[j] = i - j
        st.append(i)
    return ans`,
        c: `int *dailyTemperatures(int *t, int n, int *returnSize) {
    int *ans = calloc(n, sizeof(int)), *st = malloc(n * sizeof(int)), top = 0;
    for (int i = 0; i < n; i++) {
        while (top && t[st[top - 1]] < t[i]) {
            int j = st[--top];
            ans[j] = i - j;
        }
        st[top++] = i;
    }
    free(st);
    *returnSize = n;
    return ans;
}`,
        cpp: `vector<int> dailyTemperatures(vector<int>& t) {
    vector<int> ans(t.size(), 0), st;
    for (int i = 0; i < (int)t.size(); i++) {
        while (!st.empty() && t[st.back()] < t[i]) {
            ans[st.back()] = i - st.back();
            st.pop_back();
        }
        st.push_back(i);
    }
    return ans;
}`,
        java: `int[] dailyTemperatures(int[] t) {
    int n = t.length;
    int[] ans = new int[n], st = new int[n];
    int top = 0;
    for (int i = 0; i < n; i++) {
        while (top > 0 && t[st[top - 1]] < t[i]) {
            int j = st[--top];
            ans[j] = i - j;
        }
        st[top++] = i;
    }
    return ans;
}`,
        javascript: `function dailyTemperatures(t) {
  const ans = new Array(t.length).fill(0), st = [];
  for (let i = 0; i < t.length; i++) {
    while (st.length && t[st[st.length - 1]] < t[i]) {
      const j = st.pop();
      ans[j] = i - j;
    }
    st.push(i);
  }
  return ans;
}`,
      },
    },
    {
      name: '從後往前 + 利用已算好的答案跳躍',
      idea: '從最後一天往前算。找第 i 天時,從 j = i+1 開始;如果 `T[j]` 不夠熱,下一個值得看的就是「比 j 熱的第一天」= `j + ans[j]`,直接跳過去。',
      steps: ['`ans[n−1] = 0`', '`i` 從 n−2 往前:`j = i + 1`', '`while T[j] <= T[i]`:`ans[j] == 0` → 沒有更熱的,`ans[i] = 0` 結束;否則 `j += ans[j]`', '`ans[i] = j − i`'],
      figure: { title: `temperatures = [${T.join(',')}]`, steps: backFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '可以證明跳躍的總次數是 O(n);除了答案陣列不用額外空間。' },
      verdict: '不用堆疊,空間 O(1)(不算答案)。想法類似 KMP 的失配函數:利用已知資訊跳過不可能的位置。',
      code: {
        python: `def dailyTemperatures(temperatures):
    t = temperatures
    n = len(t)
    ans = [0] * n
    for i in range(n - 2, -1, -1):
        j = i + 1
        while t[j] <= t[i]:
            if ans[j] == 0:               # j 之後都沒有比 j 熱的,當然也沒有比 i 熱的
                j = -1
                break
            j += ans[j]                   # 跳到比 j 熱的第一天
        ans[i] = j - i if j != -1 else 0
    return ans`,
        c: `int *dailyTemperatures(int *t, int n, int *returnSize) {
    int *ans = calloc(n, sizeof(int));
    for (int i = n - 2; i >= 0; i--) {
        int j = i + 1;
        while (t[j] <= t[i]) {
            if (ans[j] == 0) { j = -1; break; }
            j += ans[j];
        }
        ans[i] = j == -1 ? 0 : j - i;
    }
    *returnSize = n;
    return ans;
}`,
        cpp: `vector<int> dailyTemperatures(vector<int>& t) {
    int n = t.size();
    vector<int> ans(n, 0);
    for (int i = n - 2; i >= 0; i--) {
        int j = i + 1;
        while (t[j] <= t[i]) {
            if (ans[j] == 0) { j = -1; break; }
            j += ans[j];
        }
        ans[i] = j == -1 ? 0 : j - i;
    }
    return ans;
}`,
        java: `int[] dailyTemperatures(int[] t) {
    int n = t.length;
    int[] ans = new int[n];
    for (int i = n - 2; i >= 0; i--) {
        int j = i + 1;
        while (t[j] <= t[i]) {
            if (ans[j] == 0) { j = -1; break; }
            j += ans[j];
        }
        ans[i] = j == -1 ? 0 : j - i;
    }
    return ans;
}`,
        javascript: `function dailyTemperatures(t) {
  const n = t.length, ans = new Array(n).fill(0);
  for (let i = n - 2; i >= 0; i--) {
    let j = i + 1;
    while (t[j] <= t[i]) {
      if (ans[j] === 0) { j = -1; break; }
      j += ans[j];
    }
    ans[i] = j === -1 ? 0 : j - i;
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: [
    '堆疊裡存溫度而不是索引:要算「隔幾天」需要索引',
    '比較用 `<=`:一樣熱不算「更熱」,彈出條件是頂端 **嚴格小於** 今天',
    '忘了剩在堆疊裡的日子答案是 0(陣列一開始就填 0 就不用特別處理)',
  ],
  followUp: [
    { q: '溫度是環狀的(最後一天之後接回第一天)?', a: '503. Next Greater Element II:把陣列走兩圈(索引取 mod n),一樣用單調堆疊。' },
    { q: '還有哪些題用單調堆疊?', a: '[84. Largest Rectangle in Histogram](#/p/monotonic-stack)(找左右第一個更矮的)、901. Online Stock Span、42. Trapping Rain Water。' },
  ],
  check: {
    kind: 'fn',
    fn: 'dailyTemperatures',
    cases: [
      { args: [T], out: [1, 1, 4, 2, 1, 1, 0, 0] },
      { args: [[30, 40, 50, 60]], out: [1, 1, 1, 0] },
      { args: [[30, 60, 90]], out: [1, 1, 0] },
      { args: [[90, 80, 70]], out: [0, 0, 0] },
      { args: [[50, 50, 60]], out: [2, 1, 0] },
    ],
  },
}
