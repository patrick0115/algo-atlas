import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 1048. Longest String Chain
const W = ['a', 'b', 'ba', 'bca', 'bda', 'bdca']

export const q1048: Solution = {
  id: 1048,
  plain: '每次只插入一個字母，把短字逐步變成長字；求最長能接出幾個字。',
  statement: '給字串陣列 words。若在短字任意位置插入恰好一個字元可得到長字，就能把兩字接在同一條鏈上。求最長字串鏈的字數。',
  examples: [{ input: 'words = ["a","b","ba","bca","bda","bdca"]', output: '4', note: 'a → ba → bda → bdca。' }, { input: 'words = ["xbc","pcxbcf","xb","cxbc","pcxbc"]', output: '5' }],
  constraints: ['1 ≤ words.length ≤ 1000；每個字長 1..16。'],
  insight: ['鏈上字長每次增加 1，所以先按長度排序。', '對每個字，刪除其中一個字母可得到所有可能的前驅。', '這是 [[p:dp-1d]]：dp[word] = 1 + 最佳前驅鏈長。'],
  approaches: [
    {
      name: '刪一個字母查前驅',
      idea: '由短字往長字處理；刪掉當前字的每個位置，尋找已算過的前驅。',
      steps: ['依字長排序 words。', '每個字預設鏈長 1。', '刪除每個位置的字元；若前驅已存在，更新鏈長。'],
      figure: { title: 'words = [a,b,ba,bca,bda,bdca]', steps: [
        { note: '長度 1 的 a、b 都只能自己成鏈，長度是 1。', views: [arr(W, { label: '按長度處理', highlight: [0, 1] })] },
        { note: 'ba 刪去 b 得 a、刪去 a 得 b；能接在任一字後，鏈長 2。', views: [arr(['a', 'ba'], { label: '鏈', done: [0, 1] })] },
        { note: 'bca、bda 都可刪出 ba，鏈長變 3。', views: [arr(['a', 'ba', 'bda'], { label: '其中一條鏈', done: [0, 1, 2] })] },
        { note: 'bdca 刪去 c 得 bda，可接成 4 個字的鏈。', views: [arr(['a', 'ba', 'bda', 'bdca'], { label: '最長鏈', done: [0, 1, 2, 3] })] },
      ] },
      complexity: { time: '雜湊版 O(n L² + n log n)；C 二分版 O(n L² log n)', space: 'O(n L)', why: '每字嘗試 L 次刪除；C 版排序後用二分查前驅。' },
      verdict: '推薦；由長字反向刪一個字元，比逐對檢查清楚。',
      code: {
        python: `def longestStrChain(words):
    words.sort(key=len)
    best = {}
    answer = 0
    for word in words:
        length = 1
        for i in range(len(word)):
            previous = word[:i] + word[i + 1:]
            length = max(length, best.get(previous, 0) + 1)  # 接前驅
        best[word] = length
        answer = max(answer, length)
    return answer`,
        c: `static int cmp1048(const void *a, const void *b) {
    const char *x = *(char *const *)a;
    const char *y = *(char *const *)b;
    int lx = strlen(x);
    int ly = strlen(y);
    if (lx != ly) {
        return lx - ly;
    }
    return strcmp(x, y);
}

int longestStrChain(char **words, int wordsSize) {
    qsort(words, wordsSize, sizeof(char *), cmp1048);
    int *dp = malloc(wordsSize * sizeof(int));
    int answer = 0;
    for (int i = 0; i < wordsSize; i++) {
        dp[i] = 1;
        int length = strlen(words[i]);
        for (int cut = 0; cut < length; cut++) {
            char previous[17];
            memcpy(previous, words[i], cut);
            strcpy(previous + cut, words[i] + cut + 1);
            char *key = previous;
            char **found = bsearch(&key, words, i, sizeof(char *), cmp1048);
            if (found) {
                int j = found - words;
                if (dp[j] + 1 > dp[i]) {
                    dp[i] = dp[j] + 1;
                }
            }
        }
        if (dp[i] > answer) {
            answer = dp[i];
        }
    }
    free(dp);
    return answer;
}`,
        cpp: `int longestStrChain(vector<string>& words) {
    sort(words.begin(), words.end(), [](const string& a, const string& b) {
        return a.size() < b.size();
    });
    unordered_map<string, int> best;
    int answer = 0;
    for (const string& word : words) {
        int length = 1;
        for (int i = 0; i < (int)word.size(); i++) {
            string previous = word.substr(0, i) + word.substr(i + 1);
            length = max(length, best[previous] + 1);
        }
        best[word] = length;
        answer = max(answer, length);
    }
    return answer;
}`,
        java: `int longestStrChain(String[] words) {
    Arrays.sort(words, Comparator.comparingInt(String::length));
    Map<String, Integer> best = new HashMap<>();
    int answer = 0;
    for (String word : words) {
        int length = 1;
        for (int i = 0; i < word.length(); i++) {
            String previous = word.substring(0, i) + word.substring(i + 1);
            length = Math.max(length, best.getOrDefault(previous, 0) + 1);
        }
        best.put(word, length);
        answer = Math.max(answer, length);
    }
    return answer;
}`,
        javascript: `function longestStrChain(words) {
  words.sort((a, b) => a.length - b.length);
  const best = new Map();
  let answer = 0;
  for (const word of words) {
    let length = 1;
    for (let i = 0; i < word.length; i++) {
      const previous = word.slice(0, i) + word.slice(i + 1);
      length = Math.max(length, (best.get(previous) || 0) + 1);
    }
    best.set(word, length);
    answer = Math.max(answer, length);
  }
  return answer;
}`,
      },
    },
    {
      name: '逐對比較前驅',
      idea: '按字長排序後，逐一比較較短的字是否能插一個字元變成當前字。',
      steps: ['按字長排序。', '對每個較早的短字，雙指標檢查它是否是當前字的前驅。', '若是，dp[目前] = max(dp[目前], dp[前驅]+1)。'],
      figure: { title: 'words = [a,b,ba,bca,bda,bdca]', steps: [
        { note: '先給每個字鏈長 1。', views: [arr([1, 1, 1, 1, 1, 1], { label: 'dp' })] },
        { note: '比較 a 與 ba：在 ba 跳過 b 後對上 a，所以 ba 鏈長 2。', views: [arr(['a', 'ba'], { label: '前驅與後繼', highlight: [0, 1] })] },
        { note: 'bda 可在 ba 插入 d，鏈長成 3。', views: [arr(['ba', 'bda'], { label: '前驅與後繼', highlight: [0, 1] })] },
        { note: 'bdca 可在 bda 插入 c，鏈長 4，為答案。', views: [arr([1, 1, 2, 3, 3, 4], { label: 'dp', done: [5] })] },
      ] },
      complexity: { time: 'O(n² L + n log n)', space: 'O(n)', why: '兩兩比較，每次最多看 L 個字元。' },
      verdict: '不需雜湊表，適合看懂「只插入一字」的判斷。',
      code: {
        python: `def longestStrChain(words):
    words.sort(key=len)
    def follows(short, long):
        if len(long) != len(short) + 1:
            return False
        i = j = 0
        while i < len(short) and j < len(long):
            if short[i] == long[j]:
                i += 1
            j += 1
        return i == len(short)           # 短字全部對上
    dp = [1] * len(words)
    for i in range(len(words)):
        for j in range(i):
            if follows(words[j], words[i]):
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
        c: `static int cmp1048(const void *a, const void *b) {
    const char *x = *(char *const *)a;
    const char *y = *(char *const *)b;
    return (int)strlen(x) - (int)strlen(y);
}

static bool follows1048(const char *small, const char *large) {
    int m = strlen(small);
    int n = strlen(large);
    if (n != m + 1) {
        return false;
    }
    int i = 0;
    for (int j = 0; j < n; j++) {
        if (i < m && small[i] == large[j]) {
            i++;
        }
    }
    return i == m;
}

int longestStrChain(char **words, int wordsSize) {
    qsort(words, wordsSize, sizeof(char *), cmp1048);
    int *dp = malloc(wordsSize * sizeof(int));
    int answer = 1;
    for (int i = 0; i < wordsSize; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++) {
            if (follows1048(words[j], words[i]) && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
            }
        }
        if (dp[i] > answer) {
            answer = dp[i];
        }
    }
    free(dp);
    return answer;
}`,
        cpp: `int longestStrChain(vector<string>& words) {
    sort(words.begin(), words.end(), [](const string& a, const string& b) {
        return a.size() < b.size();
    });
    auto follows = [](const string& small, const string& large) {
        if (large.size() != small.size() + 1) {
            return false;
        }
        int i = 0;
        for (char ch : large) {
            if (i < (int)small.size() && small[i] == ch) {
                i++;
            }
        }
        return i == (int)small.size();
    };
    vector<int> dp(words.size(), 1);
    int answer = 1;
    for (int i = 0; i < (int)words.size(); i++) {
        for (int j = 0; j < i; j++) {
            if (follows(words[j], words[i])) {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
        answer = max(answer, dp[i]);
    }
    return answer;
}`,
        java: `int longestStrChain(String[] words) {
    Arrays.sort(words, Comparator.comparingInt(String::length));
    int[] dp = new int[words.length];
    Arrays.fill(dp, 1);
    int answer = 1;
    for (int i = 0; i < words.length; i++) {
        for (int j = 0; j < i; j++) {
            if (follows1048(words[j], words[i])) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        answer = Math.max(answer, dp[i]);
    }
    return answer;
}

boolean follows1048(String small, String large) {
    if (large.length() != small.length() + 1) {
        return false;
    }
    int i = 0;
    for (int j = 0; j < large.length(); j++) {
        if (i < small.length() && small.charAt(i) == large.charAt(j)) {
            i++;
        }
    }
    return i == small.length();
}`,
        javascript: `function longestStrChain(words) {
  words.sort((a, b) => a.length - b.length);
  function follows(small, large) {
    if (large.length !== small.length + 1) {
      return false;
    }
    let i = 0;
    for (const ch of large) {
      if (i < small.length && small[i] === ch) {
        i++;
      }
    }
    return i === small.length;
  }
  const dp = new Array(words.length).fill(1);
  let answer = 1;
  for (let i = 0; i < words.length; i++) {
    for (let j = 0; j < i; j++) {
      if (follows(words[j], words[i])) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    answer = Math.max(answer, dp[i]);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['只能插入一個字元，不可重排原有字母。', '排序依字長；C 版在同長度內再按字典序排，才能二分查詢前驅。', 'C 版用二分查前驅，時間含額外的 log n 因子。'],
  check: { kind: 'fn', fn: 'longestStrChain', cases: [
    { args: [W], out: 4 }, { args: [['xbc', 'pcxbcf', 'xb', 'cxbc', 'pcxbc']], out: 5 }, { args: [['a']], out: 1 },
  ] },
}
