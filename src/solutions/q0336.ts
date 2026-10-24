import { arr } from '../engine/helpers'
import type { Solution } from './types'

const W = ['abcd', 'dcba', 'lls', 's', 'sssll']

const PAIR_CHECK = {
  python: `

def pairCheck(words):
    pairs = palindromePairs(words)
    return ';'.join(f'{a},{b}' for a, b in sorted(map(tuple, pairs)))`,
  c: `

static int comparePair336(const void *a, const void *b) {
    const int *x = *(const int **)a;
    const int *y = *(const int **)b;
    if (x[0] != y[0]) {
        return x[0] - y[0];
    }
    return x[1] - y[1];
}

char *pairCheck(char **words, int wordsSize) {
    int count = 0;
    int *columns = NULL;
    int **pairs = palindromePairs(words, wordsSize, &count, &columns);
    qsort(pairs, count, sizeof(int *), comparePair336);
    char *result = malloc((count * 24 + 1) * sizeof(char));
    int used = 0;
    for (int i = 0; i < count; i++) {
        used += sprintf(result + used, "%s%d,%d", i ? ";" : "", pairs[i][0], pairs[i][1]);
        free(pairs[i]);
    }
    result[used] = '\\0';
    free(pairs);
    free(columns);
    return result;
}`,
  cpp: `

string pairCheck(vector<string> words) {
    vector<vector<int>> pairs = palindromePairs(words);
    sort(pairs.begin(), pairs.end());
    string result;
    for (const auto& pair : pairs) {
        if (!result.empty()) {
            result += ";";
        }
        result += to_string(pair[0]) + "," + to_string(pair[1]);
    }
    return result;
}`,
  java: `

String pairCheck(String[] words) {
    List<List<Integer>> pairs = palindromePairs(words);
    pairs.sort((a, b) -> {
        int first = Integer.compare(a.get(0), b.get(0));
        return first != 0 ? first : Integer.compare(a.get(1), b.get(1));
    });
    StringBuilder result = new StringBuilder();
    for (List<Integer> pair : pairs) {
        if (result.length() > 0) {
            result.append(';');
        }
        result.append(pair.get(0)).append(',').append(pair.get(1));
    }
    return result.toString();
}`,
  javascript: `

function pairCheck(words) {
  const pairs = palindromePairs(words);
  pairs.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return pairs.map(([a, b]) => a + ',' + b).join(';');
}`,
}

export const q0336: Solution = {
  id: 336,
  plain: '把兩個不同的單字接起來，找出所有接完後左右讀都相同的順序。',
  statement: '給互不重複的字串陣列 words，找出所有 i ≠ j，且 words[i] + words[j] 是回文的有序索引配對。配對順序不限；測試用 pairCheck 排序後比較。',
  examples: [{ input: 'words = ["abcd","dcba","lls","s","sssll"]', output: '[[0,1],[1,0],[3,2],[2,4]]' }, { input: 'words = ["bat","tab","cat"]', output: '[[0,1],[1,0]]' }],
  constraints: ['words 長度最多 5000；單字長度最多 300；單字互不重複，空字串可能出現。'],
  insight: ['若左半段已是回文，另一個單字只需等於右半段的反轉。', '反之若右半段已是回文，另一個單字只需等於左半段的反轉。', '用雜湊表快速找反轉單字，避免每對都直接串起來。'],
  approaches: [
    {
      name: '切分單字與反轉查表',
      idea: '對每個切點分成左、右；檢查哪一側自身是回文，另一側反轉後能否在 words 找到。',
      steps: ['建立「單字 → 索引」表', '逐一切分每個單字為 left、right', 'left 是回文時，找 reverse(right)，形成 [找到的索引,i]', 'right 是回文且不是空尾段時，找 reverse(left)，形成 [i,找到的索引]'],
      figure: { title: 'words = [abcd, dcba, lls, s, sssll]', steps: [
        { note: '查表得知 abcd 的反轉 dcba 存在，因此 [0,1] 與 [1,0] 都成立。', views: [arr(W, { label: 'words', highlight: [0, 1] })] },
        { note: '看 lls，切成回文左段 ll 與右段 s；reverse(s) 也是 s，得 [3,2]。', views: [arr(W, { label: 'words', highlight: [2, 3] })] },
        { note: '看 sssll，切成回文左段 ss 與右段 sll。', views: [arr(W, { label: 'words', highlight: [4] })] },
        { note: 'reverse(sll) = lls，表中索引為 2；所以 [2,4] 成立，串起來是 llssssll。', views: [arr(['0,1', '1,0', '3,2', '2,4'], { label: '找到的配對' })] },
      ] },
      complexity: { time: 'O(nL²)', space: 'O(nL + 答案)', why: '每個單字最多 L 個切點，每次檢查或反轉最多 L 字元。' },
      verdict: '適合資料量大的正式解法；切點包含兩端，才能處理整字反轉與空字串。',
      code: {
        python: `def palindromePairs(words):
    position = {word: i for i, word in enumerate(words)}
    answer = []
    for i, word in enumerate(words):
        for cut in range(len(word) + 1):
            left, right = word[:cut], word[cut:]
            if left == left[::-1]:
                j = position.get(right[::-1], -1)
                if j >= 0 and j != i:
                    answer.append([j, i])  # 反轉右段放前面
            if cut < len(word) and right == right[::-1]:
                j = position.get(left[::-1], -1)
                if j >= 0 and j != i:
                    answer.append([i, j])  # 反轉左段放後面
    return answer${PAIR_CHECK.python}`,
        c: `static bool pal336(const char *word, int left, int right) {
    while (left < right) {
        if (word[left++] != word[right--]) {
            return false;
        }
    }
    return true;
}

static unsigned long hash336(const char *s) {
    unsigned long hash = 5381;
    while (*s) {
        hash = hash * 33 + (unsigned char)*s++;
    }
    return hash;
}

static int find336(char **words, int *table, int capacity, const char *key) {
    unsigned long slot = hash336(key) % capacity;
    while (table[slot] != -1) {
        int index = table[slot];
        if (strcmp(words[index], key) == 0) {
            return index;
        }
        slot = (slot + 1) % capacity;
    }
    return -1;
}

int **palindromePairs(char **words, int wordsSize, int *returnSize, int **returnColumnSizes) {
    int capacity = wordsSize * 4 + 1;
    int *table = malloc(capacity * sizeof(int));
    for (int i = 0; i < capacity; i++) {
        table[i] = -1;
    }
    for (int i = 0; i < wordsSize; i++) {
        unsigned long slot = hash336(words[i]) % capacity;
        while (table[slot] != -1) {
            slot = (slot + 1) % capacity;
        }
        table[slot] = i;
    }
    int limit = 16;
    int **answer = malloc(limit * sizeof(int *));
    *returnColumnSizes = malloc(limit * sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < wordsSize; i++) {
        int length = strlen(words[i]);
        for (int cut = 0; cut <= length; cut++) {
            char reversed[301];
            int j = -1;
            int a = -1;
            int b = -1;
            if (pal336(words[i], 0, cut - 1)) {
                for (int t = cut; t < length; t++) {
                    reversed[t - cut] = words[i][length - 1 - (t - cut)];
                }
                reversed[length - cut] = '\\0';
                j = find336(words, table, capacity, reversed);
                if (j >= 0 && j != i) {
                    a = j;
                    b = i;
                }
            }
            if (a >= 0) {
                if (*returnSize == limit) {
                    limit *= 2;
                    answer = realloc(answer, limit * sizeof(int *));
                    *returnColumnSizes = realloc(*returnColumnSizes, limit * sizeof(int));
                }
                answer[*returnSize] = malloc(2 * sizeof(int));
                answer[*returnSize][0] = a;
                answer[*returnSize][1] = b;
                (*returnColumnSizes)[(*returnSize)++] = 2;
            }
            if (cut < length && pal336(words[i], cut, length - 1)) {
                for (int t = 0; t < cut; t++) {
                    reversed[t] = words[i][cut - 1 - t];
                }
                reversed[cut] = '\\0';
                j = find336(words, table, capacity, reversed);
                if (j >= 0 && j != i) {
                    if (*returnSize == limit) {
                        limit *= 2;
                        answer = realloc(answer, limit * sizeof(int *));
                        *returnColumnSizes = realloc(*returnColumnSizes, limit * sizeof(int));
                    }
                    answer[*returnSize] = malloc(2 * sizeof(int));
                    answer[*returnSize][0] = i;
                    answer[*returnSize][1] = j;
                    (*returnColumnSizes)[(*returnSize)++] = 2;
                }
            }
        }
    }
    free(table);
    return answer;
}${PAIR_CHECK.c}`,
        cpp: `vector<vector<int>> palindromePairs(vector<string>& words) {
    unordered_map<string, int> position;
    for (int i = 0; i < (int)words.size(); i++) {
        position[words[i]] = i;
    }
    vector<vector<int>> answer;
    for (int i = 0; i < (int)words.size(); i++) {
        const string& word = words[i];
        for (int cut = 0; cut <= (int)word.size(); cut++) {
            string left = word.substr(0, cut);
            string right = word.substr(cut);
            string reversedLeft = left;
            string reversedRight = right;
            reverse(reversedLeft.begin(), reversedLeft.end());
            reverse(reversedRight.begin(), reversedRight.end());
            if (left == reversedLeft) {
                auto found = position.find(reversedRight);
                if (found != position.end() && found->second != i) {
                    answer.push_back({found->second, i});
                }
            }
            if (cut < (int)word.size() && right == reversedRight) {
                auto found = position.find(reversedLeft);
                if (found != position.end() && found->second != i) {
                    answer.push_back({i, found->second});
                }
            }
        }
    }
    return answer;
}${PAIR_CHECK.cpp}`,
        java: `List<List<Integer>> palindromePairs(String[] words) {
    Map<String, Integer> position = new HashMap<>();
    for (int i = 0; i < words.length; i++) {
        position.put(words[i], i);
    }
    List<List<Integer>> answer = new ArrayList<>();
    for (int i = 0; i < words.length; i++) {
        String word = words[i];
        for (int cut = 0; cut <= word.length(); cut++) {
            String left = word.substring(0, cut);
            String right = word.substring(cut);
            String reversedLeft = new StringBuilder(left).reverse().toString();
            String reversedRight = new StringBuilder(right).reverse().toString();
            if (left.equals(reversedLeft)) {
                Integer j = position.get(reversedRight);
                if (j != null && j != i) {
                    answer.add(Arrays.asList(j, i));
                }
            }
            if (cut < word.length() && right.equals(reversedRight)) {
                Integer j = position.get(reversedLeft);
                if (j != null && j != i) {
                    answer.add(Arrays.asList(i, j));
                }
            }
        }
    }
    return answer;
}${PAIR_CHECK.java}`,
        javascript: `function palindromePairs(words) {
  const position = new Map(words.map((word, i) => [word, i]));
  const answer = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let cut = 0; cut <= word.length; cut++) {
      const left = word.slice(0, cut);
      const right = word.slice(cut);
      const reversedLeft = [...left].reverse().join('');
      const reversedRight = [...right].reverse().join('');
      if (left === reversedLeft) {
        const j = position.get(reversedRight);
        if (j !== undefined && j !== i) {
          answer.push([j, i]);
        }
      }
      if (cut < word.length && right === reversedRight) {
        const j = position.get(reversedLeft);
        if (j !== undefined && j !== i) {
          answer.push([i, j]);
        }
      }
    }
  }
  return answer;
}${PAIR_CHECK.javascript}`,
      },
    },
    {
      name: '逐對檢查',
      idea: '列舉所有不同索引 i、j，直接檢查串接後是否回文。',
      steps: ['列舉 i', '列舉與 i 不同的 j', '用雙指標比對 words[i]+words[j] 的頭尾', '回文就記錄 [i,j]'],
      figure: { title: 'words = [abcd, dcba, lls, s, sssll]', steps: [
        { note: '先試 abcd + dcba，頭尾相同，逐步往中央檢查也都相同。', views: [arr(W, { label: 'words', highlight: [0, 1] })] },
        { note: '反過來 dcba + abcd 也成立；有序配對要分別記錄。', views: [arr(['0,1', '1,0'], { label: '目前答案' })] },
        { note: 's + lls 得 slls，兩端相同、內側 ll 相同。', views: [arr(W, { label: 'words', highlight: [3, 2] })] },
        { note: 'lls + sssll 也回文，總共四組。', views: [arr(['0,1', '1,0', '3,2', '2,4'], { label: '答案' })] },
      ] },
      complexity: { time: 'O(n²L)', space: 'O(答案)', why: '逐對檢查 n(n−1) 種順序，每次最多看 2L 個字元。' },
      verdict: '概念最簡單，但單字很多時會太慢；可作為小型輸入的對照。',
      code: {
        python: `def palindromePairs(words):
    answer = []
    for i in range(len(words)):
        for j in range(len(words)):
            if i == j:
                continue
            joined = words[i] + words[j]
            if joined == joined[::-1]:  # 從兩端讀都相同
                answer.append([i, j])
    return answer${PAIR_CHECK.python}`,
        c: `static bool joinedPalindrome336(const char *a, const char *b) {
    int first = strlen(a);
    int second = strlen(b);
    int left = 0;
    int right = first + second - 1;
    while (left < right) {
        char x = left < first ? a[left] : b[left - first];
        char y = right < first ? a[right] : b[right - first];
        if (x != y) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}

int **palindromePairs(char **words, int wordsSize, int *returnSize, int **returnColumnSizes) {
    int limit = 16;
    int **answer = malloc(limit * sizeof(int *));
    *returnColumnSizes = malloc(limit * sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < wordsSize; i++) {
        for (int j = 0; j < wordsSize; j++) {
            if (i == j || !joinedPalindrome336(words[i], words[j])) {
                continue;
            }
            if (*returnSize == limit) {
                limit *= 2;
                answer = realloc(answer, limit * sizeof(int *));
                *returnColumnSizes = realloc(*returnColumnSizes, limit * sizeof(int));
            }
            answer[*returnSize] = malloc(2 * sizeof(int));
            answer[*returnSize][0] = i;
            answer[*returnSize][1] = j;
            (*returnColumnSizes)[(*returnSize)++] = 2;
        }
    }
    return answer;
}${PAIR_CHECK.c}`,
        cpp: `vector<vector<int>> palindromePairs(vector<string>& words) {
    vector<vector<int>> answer;
    for (int i = 0; i < (int)words.size(); i++) {
        for (int j = 0; j < (int)words.size(); j++) {
            if (i == j) {
                continue;
            }
            string joined = words[i] + words[j];
            string reversed = joined;
            reverse(reversed.begin(), reversed.end());
            if (joined == reversed) {
                answer.push_back({i, j});
            }
        }
    }
    return answer;
}${PAIR_CHECK.cpp}`,
        java: `List<List<Integer>> palindromePairs(String[] words) {
    List<List<Integer>> answer = new ArrayList<>();
    for (int i = 0; i < words.length; i++) {
        for (int j = 0; j < words.length; j++) {
            if (i == j) {
                continue;
            }
            String joined = words[i] + words[j];
            String reversed = new StringBuilder(joined).reverse().toString();
            if (joined.equals(reversed)) {
                answer.add(Arrays.asList(i, j));
            }
        }
    }
    return answer;
}${PAIR_CHECK.java}`,
        javascript: `function palindromePairs(words) {
  const answer = [];
  for (let i = 0; i < words.length; i++) {
    for (let j = 0; j < words.length; j++) {
      if (i === j) {
        continue;
      }
      const joined = words[i] + words[j];
      if (joined === [...joined].reverse().join('')) {
        answer.push([i, j]);
      }
    }
  }
  return answer;
}${PAIR_CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['[i,j] 和 [j,i] 是不同答案，不能只檢查一個方向。', '空字串可與每個回文單字組成兩個方向的配對。', '切分法右段為空時不再跑第二種情況，避免重複答案。'],
  check: { kind: 'fn', fn: 'pairCheck', cases: [
    { args: [W], out: '0,1;1,0;2,4;3,2' },
    { args: [['bat', 'tab', 'cat']], out: '0,1;1,0' },
    { args: [['a', '']], out: '0,1;1,0' },
    { args: [[]], out: '' },
  ] },
}
