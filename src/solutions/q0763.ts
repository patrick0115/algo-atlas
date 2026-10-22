import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 763. Partition Labels

const S = 'ababcbacadefegdehijhklij'

function greedyFig(): FigStep[] {
  const chars = [...S]
  const last = new Map<string, number>()
  chars.forEach((c, i) => last.set(c, i))
  const out: FigStep[] = [
    { note: '同一個字母只能出現在同一段 → 一段至少要延伸到「裡面每個字母最後出現的位置」。先記下每個字母最後出現在哪', views: [arr(chars, { label: 's' }), kv([...last], 'last(字母 → 最後出現的位置)')] },
  ]
  let start = 0
  let end = 0
  const sizes: number[] = []
  for (let i = 0; i < chars.length; i++) {
    end = Math.max(end, last.get(chars[i])!)
    if (i === end) {
      sizes.push(end - start + 1)
      out.push({ note: `走到 ${i},剛好等於這一段需要延伸到的 end = ${end} → 這段裡的字母後面都不會再出現,在這裡切一刀!長度 ${end - start + 1}`, views: [arr(chars, { label: 's', range: [start, end], done: Array.from({ length: start }, (_, k) => k) }), arr(sizes, { label: '每段長度' })] })
      start = i + 1
    } else if (last.get(chars[i])! >= end && i % 3 === 0) {
      out.push({ note: `${chars[i]} 最後出現在 ${last.get(chars[i])},這一段至少要延伸到 ${end}`, views: [arr(chars, { label: 's', range: [start, end], highlight: [i] })] })
    }
  }
  return out
}

function intervalFig(): FigStep[] {
  const letters = [...new Set(S)]
  const first = new Map<string, number>()
  const last = new Map<string, number>()
  ;[...S].forEach((c, i) => {
    if (!first.has(c)) first.set(c, i)
    last.set(c, i)
  })
  const view = (upto: number, cuts: number[]): GridViewData => ({
    kind: 'grid',
    label: '每個字母一列:灰底是它從第一次到最後一次出現的區間',
    cells: letters.slice(0, upto + 1).map((c) => [...S].map((ch) => (ch === c ? c : ''))),
    rowLabels: letters.slice(0, upto + 1),
    marks: {
      path: letters.slice(0, upto + 1).flatMap((c, r) => Array.from({ length: last.get(c)! - first.get(c)! + 1 }, (_, k) => [r, first.get(c)! + k] as [number, number])),
      hl: cuts.flatMap((x) => letters.slice(0, upto + 1).map((_, r) => [r, x] as [number, number])),
    },
  })
  const out: FigStep[] = []
  let end = -1
  let start = 0
  const cuts: number[] = []
  letters.forEach((c, k) => {
    const a = first.get(c)!
    const b = last.get(c)!
    let note = `字母 ${c} 的區間是 [${a}, ${b}]`
    if (a > end && end >= 0) {
      cuts.push(end)
      note += `,和前面的區間不重疊 → 前一段 [${start}, ${end}] 結束`
      start = a
    }
    end = Math.max(end, b)
    out.push({ note, views: [view(k, [...cuts])] })
  })
  cuts.push(end)
  out.push({ note: `最後一段 [${start}, ${end}]。黃色的直線就是切點`, views: [view(letters.length - 1, cuts)] })
  return out
}

export const q0763: Solution = {
  id: 763,
  plain: '把一個字串切成盡量多段,條件是**每個字母只能出現在其中一段**。訣竅:先記每個字母最後出現在哪,一段至少要延伸到裡面所有字母的「最後位置」,走到那裡就能切。',
  statement: '把字串 `s` 切成盡量多段,使每個字母**最多只出現在一段**裡。回傳每一段的長度。',
  examples: [
    { input: 's = "ababcbacadefegdehijhklij"', output: '[9,7,8]', note: '"ababcbaca"、"defegde"、"hijhklij"' },
    { input: 's = "eccbbbbdec"', output: '[10]' },
  ],
  constraints: ['`1 ≤ s.length ≤ 500`,只有小寫字母'],
  insight: [
    '一段裡出現了字母 c,那 c 的**每一次**出現都必須在這一段 → 這一段至少要延伸到 c 最後出現的位置',
    '從左往右走,維護「目前這一段至少要延伸到哪」(end)。每看到一個字母,就用它的最後位置更新 end',
    '走到 i == end:這一段裡所有字母的最後位置都 ≤ i,後面不會再出現 → 切一刀,而且越早切段數越多(貪心)',
    '這其實是區間合併:每個字母是一個區間 [第一次, 最後一次],重疊的區間要合在一起',
  ],
  approaches: [
    {
      name: '貪心:記每個字母最後出現的位置',
      idea: '先算 `last[c]`。走過字串,`end = max(end, last[s[i]])`;`i == end` 就切一段。',
      steps: ['`last = {c: i}`(後面的會覆蓋前面的)', '`start = end = 0`', '`end = max(end, last[s[i]])`', '`i == end` → 答案加上 `end − start + 1`,`start = i + 1`'],
      figure: { title: `s = "${S}"`, steps: greedyFig() },
      complexity: { time: 'O(n)', space: 'O(26)', why: '兩次掃描;last 最多 26 格。' },
      verdict: '標準解,[[p:interval-scheduling]] / [[p:greedy]] 的經典題。',
      code: {
        python: `def partitionLabels(s):
    last = {c: i for i, c in enumerate(s)}   # 每個字母最後出現的位置
    res = []
    start = end = 0
    for i, c in enumerate(s):
        end = max(end, last[c])           # 這一段至少要延伸到這裡
        if i == end:                      # 段內的字母都不會再出現 → 切
            res.append(end - start + 1)
            start = i + 1
    return res`,
        c: `int *partitionLabels(char *s, int *returnSize) {
    int last[26], n = strlen(s);
    for (int i = 0; i < n; i++) last[s[i] - 'a'] = i;
    int *res = malloc(n * sizeof(int)), cnt = 0, start = 0, end = 0;
    for (int i = 0; i < n; i++) {
        if (last[s[i] - 'a'] > end) end = last[s[i] - 'a'];
        if (i == end) { res[cnt++] = end - start + 1; start = i + 1; }
    }
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<int> partitionLabels(string s) {
    int last[26];
    for (int i = 0; i < (int)s.size(); i++) last[s[i] - 'a'] = i;
    vector<int> res;
    int start = 0, end = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        end = max(end, last[s[i] - 'a']);
        if (i == end) { res.push_back(end - start + 1); start = i + 1; }
    }
    return res;
}`,
        java: `List<Integer> partitionLabels(String s) {
    int[] last = new int[26];
    for (int i = 0; i < s.length(); i++) last[s.charAt(i) - 'a'] = i;
    List<Integer> res = new ArrayList<>();
    int start = 0, end = 0;
    for (int i = 0; i < s.length(); i++) {
        end = Math.max(end, last[s.charAt(i) - 'a']);
        if (i == end) { res.add(end - start + 1); start = i + 1; }
    }
    return res;
}`,
        javascript: `function partitionLabels(s) {
  const last = {};
  for (let i = 0; i < s.length; i++) last[s[i]] = i;
  const res = [];
  let start = 0, end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last[s[i]]);
    if (i === end) {
      res.push(end - start + 1);
      start = i + 1;
    }
  }
  return res;
}`,
      },
    },
    {
      name: '轉成區間合併',
      idea: '每個字母對應一個區間 [第一次出現, 最後一次出現]。依起點排序後合併重疊的區間,每個合併後的大區間就是一段。',
      steps: ['算每個字母的 `[first, last]`', '依 first 排序', '合併:下一個區間的 first ≤ 目前的 end → 延伸 end;否則切出一段', '回傳每段長度'],
      figure: { title: `s = "${S}"`, steps: intervalFig() },
      complexity: { time: 'O(n + 26 log 26)', space: 'O(26)', why: '最多 26 個區間。' },
      verdict: '把題目轉成 [56. Merge Intervals](#/q/56),理解為什麼方法一是對的:它其實就是在按順序合併區間。',
      code: {
        python: `def partitionLabels(s):
    first, last = {}, {}
    for i, c in enumerate(s):
        first.setdefault(c, i)
        last[c] = i
    intervals = sorted((first[c], last[c]) for c in first)
    res = []
    start, end = intervals[0]
    for a, b in intervals[1:]:
        if a <= end:                      # 重疊 → 合併
            end = max(end, b)
        else:
            res.append(end - start + 1)
            start, end = a, b
    res.append(end - start + 1)
    return res`,
        c: `int *partitionLabels(char *s, int *returnSize) {
    int first[26], last[26], n = strlen(s);
    for (int c = 0; c < 26; c++) first[c] = -1;
    for (int i = 0; i < n; i++) { int c = s[i] - 'a'; if (first[c] < 0) first[c] = i; last[c] = i; }
    int *res = malloc(26 * sizeof(int)), cnt = 0, start = -1, end = -1;
    // 依 first 的順序 = 依字串中第一次出現的順序走
    for (int i = 0; i < n; i++) {
        int c = s[i] - 'a';
        if (first[c] != i) continue;
        if (start < 0) { start = first[c]; end = last[c]; }
        else if (first[c] <= end) { if (last[c] > end) end = last[c]; }
        else { res[cnt++] = end - start + 1; start = first[c]; end = last[c]; }
    }
    res[cnt++] = end - start + 1;
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<int> partitionLabels(string s) {
    map<char, pair<int, int>> range;      // 字母 -> (第一次, 最後一次)
    for (int i = 0; i < (int)s.size(); i++) {
        if (!range.count(s[i])) range[s[i]] = {i, i};
        range[s[i]].second = i;
    }
    vector<pair<int, int>> iv;
    for (auto& [c, p] : range) iv.push_back(p);
    sort(iv.begin(), iv.end());
    vector<int> res;
    int start = iv[0].first, end = iv[0].second;
    for (size_t k = 1; k < iv.size(); k++) {
        if (iv[k].first <= end) end = max(end, iv[k].second);
        else { res.push_back(end - start + 1); start = iv[k].first; end = iv[k].second; }
    }
    res.push_back(end - start + 1);
    return res;
}`,
        java: `List<Integer> partitionLabels(String s) {
    int[] first = new int[26], last = new int[26];
    Arrays.fill(first, -1);
    for (int i = 0; i < s.length(); i++) {
        int c = s.charAt(i) - 'a';
        if (first[c] < 0) first[c] = i;
        last[c] = i;
    }
    List<int[]> iv = new ArrayList<>();
    for (int c = 0; c < 26; c++) if (first[c] >= 0) iv.add(new int[]{first[c], last[c]});
    iv.sort((a, b) -> a[0] - b[0]);
    List<Integer> res = new ArrayList<>();
    int start = iv.get(0)[0], end = iv.get(0)[1];
    for (int k = 1; k < iv.size(); k++) {
        if (iv.get(k)[0] <= end) end = Math.max(end, iv.get(k)[1]);
        else { res.add(end - start + 1); start = iv.get(k)[0]; end = iv.get(k)[1]; }
    }
    res.add(end - start + 1);
    return res;
}`,
        javascript: `function partitionLabels(s) {
  const first = {}, last = {};
  for (let i = 0; i < s.length; i++) {
    if (!(s[i] in first)) first[s[i]] = i;
    last[s[i]] = i;
  }
  const iv = Object.keys(first).map((c) => [first[c], last[c]]).sort((a, b) => a[0] - b[0]);
  const res = [];
  let [start, end] = iv[0];
  for (let k = 1; k < iv.length; k++) {
    if (iv[k][0] <= end) end = Math.max(end, iv[k][1]);
    else {
      res.push(end - start + 1);
      [start, end] = iv[k];
    }
  }
  res.push(end - start + 1);
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '回傳的是每段的**長度**,不是切點位置',
    '只看目前字母的最後位置就切:要看「這一段裡所有字母」的最後位置的最大值',
    'last 的 map 用第一次出現覆蓋:要記**最後**一次,所以後面的要覆蓋前面的',
  ],
  followUp: [{ q: '同類型的區間題?', a: '[56. Merge Intervals](#/q/56)、[435. Non-overlapping Intervals](#/q/435)、452. Minimum Number of Arrows。' }],
  check: {
    kind: 'fn',
    fn: 'partitionLabels',
    cases: [
      { args: [S], out: [9, 7, 8] },
      { args: ['eccbbbbdec'], out: [10] },
      { args: ['abc'], out: [1, 1, 1] },
      { args: ['a'], out: [1] },
      { args: ['abac'], out: [3, 1] },
    ],
  },
}
