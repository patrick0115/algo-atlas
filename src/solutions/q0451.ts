import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

const S = 'tree'

const CHECK = {
  python: `

def frequencySortCheck(s):
    result = frequencySort(s)
    if sorted(result) != sorted(s):
        return 0
    groups = []
    for ch in result:
        if not groups or groups[-1][0] != ch:
            groups.append([ch, 0])
        groups[-1][1] += 1
    return int(all(groups[i][1] >= groups[i + 1][1] for i in range(len(groups) - 1))
               and len(groups) == len(set(s)))`,
  c: `

int frequencySortCheck(char *s) {
    char *result = frequencySort(s);
    int before[128] = {0};
    int after[128] = {0};
    int n = strlen(s);
    if ((int)strlen(result) != n) {
        free(result);
        return 0;
    }
    for (int i = 0; i < n; i++) {
        before[(unsigned char)s[i]]++;
        after[(unsigned char)result[i]]++;
    }
    int ok = 1;
    for (int ch = 0; ch < 128; ch++) {
        if (before[ch] != after[ch]) {
            ok = 0;
        }
    }
    int previous = n + 1;
    for (int i = 0; i < n;) {
        int j = i + 1;
        while (j < n && result[j] == result[i]) {
            j++;
        }
        if (j - i > previous || j - i != before[(unsigned char)result[i]]) {
            ok = 0;
        }
        previous = j - i;
        i = j;
    }
    free(result);
    return ok;
}`,
  cpp: `

int frequencySortCheck(string s) {
    string result = frequencySort(s);
    string a = s;
    string b = result;
    sort(a.begin(), a.end());
    sort(b.begin(), b.end());
    if (a != b) {
        return 0;
    }
    unordered_map<char, int> counts;
    for (char ch : s) {
        counts[ch]++;
    }
    int previous = s.size() + 1;
    for (int i = 0; i < (int)result.size();) {
        int j = i + 1;
        while (j < (int)result.size() && result[j] == result[i]) {
            j++;
        }
        if (j - i > previous || j - i != counts[result[i]]) {
            return 0;
        }
        previous = j - i;
        i = j;
    }
    return 1;
}`,
  java: `

int frequencySortCheck(String s) {
    String result = frequencySort(s);
    if (result.length() != s.length()) {
        return 0;
    }
    int[] before = new int[128];
    int[] after = new int[128];
    for (int i = 0; i < s.length(); i++) {
        before[s.charAt(i)]++;
        after[result.charAt(i)]++;
    }
    if (!Arrays.equals(before, after)) {
        return 0;
    }
    int previous = s.length() + 1;
    for (int i = 0; i < result.length();) {
        int j = i + 1;
        while (j < result.length() && result.charAt(j) == result.charAt(i)) {
            j++;
        }
        if (j - i > previous || j - i != before[result.charAt(i)]) {
            return 0;
        }
        previous = j - i;
        i = j;
    }
    return 1;
}`,
  javascript: `

function frequencySortCheck(s) {
  const result = frequencySort(s);
  if ([...result].sort().join('') !== [...s].sort().join('')) {
    return 0;
  }
  const counts = new Map();
  for (const ch of s) {
    counts.set(ch, (counts.get(ch) || 0) + 1);
  }
  let previous = s.length + 1;
  for (let i = 0; i < result.length;) {
    let j = i + 1;
    while (j < result.length && result[j] === result[i]) {
      j++;
    }
    if (j - i > previous || j - i !== counts.get(result[i])) {
      return 0;
    }
    previous = j - i;
    i = j;
  }
  return 1;
}`,
}

function sortedFig(): FigStep[] {
  return [
    { note: '掃過 tree，得到 t:1、r:1、e:2。排序的單位是字元種類，不是原字串位置。', views: [kv([['t', 1], ['r', 1], ['e', 2]], '出現次數')] },
    { note: '依次數遞減排列，e:2 先於兩個次數為 1 的字元。', views: [kv([['e', 2], ['t', 1], ['r', 1]], '排序後')] },
    { note: '先寫入兩個 e，形成 ee；不能只寫一個 e。', views: [arr(['e', 'e'], { label: '輸出', done: [0, 1] })] },
    { note: '再接上 t、r，得到 eetr；同頻字元交換順序也正確。', views: [arr(['e', 'e', 't', 'r'], { label: '輸出', done: [0, 1, 2, 3] })] },
  ]
}

function bucketFig(): FigStep[] {
  return [
    { note: '先統計 tree：e 出現 2 次，t、r 各 1 次。', views: [kv([['e', 2], ['t', 1], ['r', 1]], '次數')] },
    { note: '把 e 放到第 2 號桶；t、r 放到第 1 號桶。桶號就是出現次數。', views: [kv([[2, 'e'], [1, 't,r']], '次數桶')] },
    { note: '從最大的桶往下讀。第 2 號桶的 e 重複寫 2 次，先得到 ee。', views: [arr(['e', 'e'], { label: '輸出', done: [0, 1] })] },
    { note: '第 1 號桶每字元各寫一次，得到 eetr。', views: [arr(['e', 'e', 't', 'r'], { label: '輸出', done: [0, 1, 2, 3] })] },
  ]
}

export const q0451: Solution = {
  id: 451,
  plain: '把字串裡出現最多次的字元排在前面；同一種字元要連在一起。',
  statement: '給字串 s，依字元出現次數由高到低重新排列。相同次數的字元順序不限，回傳任一有效字串。',
  examples: [{ input: 's = "tree"', output: '"eetr"', note: '"eert" 也可以。' }, { input: 's = "cccaaa"', output: '"cccaaa"', note: '"aaaccc" 也可以。' }, { input: 's = "Aabb"', output: '"bbAa"' }],
  constraints: ['`1 ≤ s.length ≤ 5 × 10⁵`', '字元為英文字母或數字；大小寫不同。'],
  insight: ['先做 [[p:hash-map]] 計數；後續只要排列「不同字元」即可。', '因為答案不唯一，驗證時檢查字元數量與相鄰群組的頻率順序。'],
  approaches: [
    {
      name: '計數後排序字元',
      idea: '把每種字元按出現次數遞減排序，再按次數重複輸出。',
      steps: ['統計每個字元的次數。', '依次數把不同字元排序。', '每個字元重複輸出對應次數。'],
      figure: { title: 's = "tree"', steps: sortedFig() },
      complexity: { time: 'O(n + k log k)', space: 'O(n + k)', why: 'n 是字串長度，k 是不同字元數；輸出本身有 n 個字元。' },
      verdict: '最容易理解；本題 k 最多 62，排序成本很小。',
      code: {
        python: `from collections import Counter

def frequencySort(s):
    counts = Counter(s)
    chars = sorted(counts, key=lambda ch: -counts[ch])  # 高頻先輸出
    parts = []
    for ch in chars:
        parts.append(ch * counts[ch])  # 同字元連續放入
    return ''.join(parts)${CHECK.python}`,
        c: `typedef struct {
    unsigned char ch;
    int count;
} Freq;

int compareFreq(const void *a, const void *b) {
    const Freq *x = a;
    const Freq *y = b;
    return y->count - x->count;
}

char *frequencySort(char *s) {
    int counts[128] = {0};
    int n = strlen(s);
    for (int i = 0; i < n; i++) {
        counts[(unsigned char)s[i]]++;
    }
    Freq items[128];
    int size = 0;
    for (int ch = 0; ch < 128; ch++) {
        if (counts[ch]) {
            items[size++] = (Freq){(unsigned char)ch, counts[ch]};
        }
    }
    qsort(items, size, sizeof(Freq), compareFreq);
    char *answer = malloc(n + 1);
    int pos = 0;
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < items[i].count; j++) {
            answer[pos++] = items[i].ch;
        }
    }
    answer[pos] = '\\0';
    return answer;
}${CHECK.c}`,
        cpp: `string frequencySort(string s) {
    unordered_map<char, int> counts;
    for (char ch : s) {
        counts[ch]++;
    }
    vector<pair<char, int>> items(counts.begin(), counts.end());
    sort(items.begin(), items.end(), [](const auto& a, const auto& b) {
        return a.second > b.second;
    });
    string answer;
    for (const auto& item : items) {
        answer.append(item.second, item.first);
    }
    return answer;
}${CHECK.cpp}`,
        java: `String frequencySort(String s) {
    int[] counts = new int[128];
    for (char ch : s.toCharArray()) {
        counts[ch]++;
    }
    List<Character> chars = new ArrayList<>();
    for (int ch = 0; ch < 128; ch++) {
        if (counts[ch] > 0) {
            chars.add((char) ch);
        }
    }
    chars.sort((a, b) -> Integer.compare(counts[b], counts[a]));
    StringBuilder answer = new StringBuilder();
    for (char ch : chars) {
        for (int i = 0; i < counts[ch]; i++) {
            answer.append(ch);
        }
    }
    return answer.toString();
}${CHECK.java}`,
        javascript: `function frequencySort(s) {
  const counts = new Map();
  for (const ch of s) {
    counts.set(ch, (counts.get(ch) || 0) + 1);
  }
  const chars = [...counts.keys()];
  chars.sort((a, b) => counts.get(b) - counts.get(a));
  const parts = [];
  for (const ch of chars) {
    parts.push(ch.repeat(counts.get(ch)));
  }
  return parts.join('');
}${CHECK.javascript}`,
      },
    },
    {
      name: '依頻率分桶',
      idea: '字元最多出現 n 次，把字元放入對應次數的桶，再從高頻桶往低頻桶讀。',
      steps: ['統計各字元次數。', '把每個字元放入 `bucket[count]`。', '從 n 號桶往 1 號桶，每個字元重複 count 次輸出。'],
      figure: { title: 's = "tree"', steps: bucketFig() },
      complexity: { time: 'O(n + k)', space: 'O(n + k)', why: '掃描 n 個桶與輸出 n 個字元；每種字元只入桶一次。C 版沒有建桶，改成對每個頻率掃 128 種字元，時間 O(128·n)。' },
      verdict: '省去排序，適合想練習 [[p:counting-sort]] 分桶的情境。',
      code: {
        python: `from collections import Counter

def frequencySort(s):
    counts = Counter(s)
    buckets = [[] for _ in range(len(s) + 1)]
    for ch, count in counts.items():
        buckets[count].append(ch)  # 桶號就是頻率
    parts = []
    for count in range(len(s), 0, -1):
        for ch in buckets[count]:
            parts.append(ch * count)
    return ''.join(parts)${CHECK.python}`,
        c: `char *frequencySort(char *s) {
    int n = strlen(s);
    int counts[128] = {0};
    for (int i = 0; i < n; i++) {
        counts[(unsigned char)s[i]]++;
    }
    char *answer = malloc(n + 1);
    int pos = 0;
    for (int freq = n; freq >= 1; freq--) {
        for (int ch = 0; ch < 128; ch++) {
            if (counts[ch] == freq) {
                for (int i = 0; i < freq; i++) {
                    answer[pos++] = (char)ch;
                }
            }
        }
    }
    answer[pos] = '\\0';
    return answer;
}${CHECK.c}`,
        cpp: `string frequencySort(string s) {
    unordered_map<char, int> counts;
    for (char ch : s) {
        counts[ch]++;
    }
    vector<vector<char>> buckets(s.size() + 1);
    for (const auto& item : counts) {
        buckets[item.second].push_back(item.first);
    }
    string answer;
    for (int freq = s.size(); freq >= 1; freq--) {
        for (char ch : buckets[freq]) {
            answer.append(freq, ch);
        }
    }
    return answer;
}${CHECK.cpp}`,
        java: `String frequencySort(String s) {
    int[] counts = new int[128];
    for (char ch : s.toCharArray()) {
        counts[ch]++;
    }
    List<List<Character>> buckets = new ArrayList<>();
    for (int i = 0; i <= s.length(); i++) {
        buckets.add(new ArrayList<>());
    }
    for (int ch = 0; ch < 128; ch++) {
        if (counts[ch] > 0) {
            buckets.get(counts[ch]).add((char) ch);
        }
    }
    StringBuilder answer = new StringBuilder();
    for (int freq = s.length(); freq >= 1; freq--) {
        for (char ch : buckets.get(freq)) {
            for (int i = 0; i < freq; i++) {
                answer.append(ch);
            }
        }
    }
    return answer.toString();
}${CHECK.java}`,
        javascript: `function frequencySort(s) {
  const counts = new Map();
  for (const ch of s) {
    counts.set(ch, (counts.get(ch) || 0) + 1);
  }
  const buckets = Array.from({ length: s.length + 1 }, () => []);
  for (const [ch, count] of counts) {
    buckets[count].push(ch);
  }
  const parts = [];
  for (let count = s.length; count >= 1; count--) {
    for (const ch of buckets[count]) {
      parts.push(ch.repeat(count));
    }
  }
  return parts.join('');
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['大寫與小寫是不同字元。', '同頻順序任意；不能把某一種字元拆成多段，或只輸出一次。'],
  check: { kind: 'fn', fn: 'frequencySortCheck', cases: [{ args: [S], out: 1 }, { args: ['cccaaa'], out: 1 }, { args: ['Aabb'], out: 1 }, { args: ['a'], out: 1 }] },
}
