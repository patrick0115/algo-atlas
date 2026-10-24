import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 126. Word Ladder II
const WORDS = ['hot', 'dot', 'dog', 'lot', 'log', 'cog']
const F = [
  { note: '第 0 層只有 hit；每步必須恰好換一個字母。', views: [arr(['hit'], { label: '第 0 層' })] },
  { note: '從 hit 只能走到 hot；兩字只有第二個字母不同。', views: [arr(['hit', 'hot'], { label: '第 1 層路徑', done: [0, 1] })] },
  { note: '從 hot 同時可走到 dot 與 lot，兩條路徑都要留下。', views: [arr(['hit→hot→dot', 'hit→hot→lot'], { label: '第 2 層' })] },
  { note: '再走到 dog 與 log；同層內不能提早把 cog 排除，兩條路都可抵達終點。', views: [arr(['hit→hot→dot→dog', 'hit→hot→lot→log'], { label: '第 3 層' })] },
  { note: '第 4 層抵達 cog，收集這一層的全部路徑後停止。', views: [arr(['hit→hot→dot→dog→cog', 'hit→hot→lot→log→cog'], { label: '全部最短路徑', done: [0, 1] })] },
]
const G = [
  { note: '先做 BFS 距離：hit 的距離 0，hot 的距離 1。', views: [arr([0, 1], { label: 'hit、hot 的距離' })] },
  { note: 'dot 與 lot 都是距離 2；dog 與 log 都是距離 3。', views: [arr([2, 2, 3, 3], { label: 'dot、lot、dog、log 的距離' })] },
  { note: 'cog 的距離是 4；只允許 DFS 從距離 d 走到 d+1。', views: [arr([4], { label: 'cog 距離', highlight: [0] })] },
  { note: '沿遞增距離回溯，得到經 dog 和經 log 的兩條最短路徑。', views: [arr(['hit→hot→dot→dog→cog', 'hit→hot→lot→log→cog'], { label: '結果', done: [0, 1] })] },
]
const CHECK = {
  python: `

def ladderCheck(beginWord, endWord, wordList):
    paths = findLadders(beginWord, endWord, wordList)
    return '|'.join(sorted('>'.join(path) for path in paths))`,
  c: `

static int cmpPath126(const void *a, const void *b) {
    return strcmp(*(char **)a, *(char **)b);
}

char *ladderCheck(char *beginWord, char *endWord, char **wordList, int wordListSize) {
    int count = 0;
    int *sizes = NULL;
    char ***paths = findLadders(beginWord, endWord, wordList, wordListSize, &count, &sizes);
    char **parts = malloc((count ? count : 1) * sizeof(char *));
    int total = 1;
    for (int i = 0; i < count; i++) {
        int size = 1;
        for (int j = 0; j < sizes[i]; j++) size += strlen(paths[i][j]) + (j > 0);
        parts[i] = malloc(size);
        parts[i][0] = '\\0';
        for (int j = 0; j < sizes[i]; j++) {
            if (j) strcat(parts[i], ">");
            strcat(parts[i], paths[i][j]);
        }
        total += size;
    }
    qsort(parts, count, sizeof(char *), cmpPath126);
    char *out = malloc(total);
    out[0] = '\\0';
    for (int i = 0; i < count; i++) {
        if (i) strcat(out, "|");
        strcat(out, parts[i]);
        free(parts[i]);
    }
    free(parts);
    return out;
}`,
  cpp: `

string ladderCheck(string beginWord, string endWord, vector<string> wordList) {
    vector<vector<string>> paths = findLadders(beginWord, endWord, wordList);
    vector<string> parts;
    for (const auto& path : paths) {
        string text;
        for (const string& word : path) {
            if (!text.empty()) text += ">";
            text += word;
        }
        parts.push_back(text);
    }
    sort(parts.begin(), parts.end());
    string out;
    for (const string& part : parts) {
        if (!out.empty()) out += "|";
        out += part;
    }
    return out;
}`,
  java: `

String ladderCheck(String beginWord, String endWord, List<String> wordList) {
    List<List<String>> paths = findLadders(beginWord, endWord, wordList);
    List<String> parts = new ArrayList<>();
    for (List<String> path : paths) parts.add(String.join(">", path));
    Collections.sort(parts);
    return String.join("|", parts);
}`,
  javascript: `

function ladderCheck(beginWord, endWord, wordList) {
  return findLadders(beginWord, endWord, wordList)
    .map((path) => path.join('>'))
    .sort()
    .join('|');
}`,
}

export const q0126: Solution = {
  id: 126,
  plain: '一次只換一個字母，從起始字變到目標字；列出所有步數最少的變字路線。',
  statement: '每一步改恰好一個字母，改出的字必須在 `wordList` 裡。回傳從 `beginWord` 到 `endWord` 的所有最短轉換序列；若無法到達就回傳空陣列。',
  examples: [{ input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '[["hit","hot","dot","dog","cog"],["hit","hot","lot","log","cog"]]' }, { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '[]' }],
  constraints: ['單字等長，清單內無重複；只接受最短路徑，可能有多條。'],
  insight: ['[[p:graph-traversal]] 的 BFS 依步數分層，首次到達終點的層就是最短長度。', '同一層的多條路徑可匯合到同一字，因此不能在產生第一條時就把字永久排除。'],
  approaches: [
    {
      name: 'BFS 直接攜帶整條路徑',
      idea: '佇列裡放完整路徑；整層走完後才把該層用過的字標成已訪問。',
      steps: ['若終點不在字典，直接回傳空。', '起始層只有 `[beginWord]`。', '對每條路徑枚舉只差一字的下一個字，同層容許多條路徑到同一字。', '首次出現終點時，收集整層答案並停止。'],
      figure: { title: 'hit → cog', steps: F },
      complexity: { time: 'O(路徑數 · 字典大小 · 字長)', space: 'O(路徑數 · 路徑長)', why: '佇列保存完整路徑，最壞可能有大量候選。' },
      verdict: '容易理解「全部最短」；大量分岔時會複製許多路徑。',
      code: {
        python: `def findLadders(beginWord, endWord, wordList):
    words = set(wordList)
    if endWord not in words:
        return []
    level = [[beginWord]]
    used = {beginWord}
    while level:
        answer = [path for path in level if path[-1] == endWord]
        if answer:
            return answer           # 收集整層後才停止
        next_level = []
        used_here = set()
        for path in level:
            word = path[-1]
            for i in range(len(word)):
                for ch in 'abcdefghijklmnopqrstuvwxyz':
                    candidate = word[:i] + ch + word[i + 1:]
                    if candidate in words and candidate not in used:
                        next_level.append(path + [candidate])
                        used_here.add(candidate)
        used |= used_here            # 同層可有多個前驅
        level = next_level
    return []${CHECK.python}`,
        c: `typedef struct { int *ids; int length; } Path126;

static bool near126(const char *a, const char *b) {
    int diff = 0;
    for (int i = 0; a[i]; i++) diff += a[i] != b[i];
    return diff == 1;
}

char ***findLadders(char *beginWord, char *endWord, char **wordList, int wordListSize, int *returnSize, int **returnColumnSizes) {
    int end = -1, n = wordListSize + 1;
    char **words = malloc(n * sizeof(char *));
    words[0] = beginWord;
    for (int i = 0; i < wordListSize; i++) {
        words[i + 1] = wordList[i];
        if (strcmp(wordList[i], endWord) == 0) end = i + 1;
    }
    *returnSize = 0;
    *returnColumnSizes = NULL;
    if (end < 0) {
        free(words);
        return NULL;
    }
    int cap = 32, count = 1;
    Path126 *level = malloc(cap * sizeof(Path126));
    level[0].ids = malloc(sizeof(int));
    level[0].ids[0] = 0;
    level[0].length = 1;
    bool *used = calloc(n, sizeof(bool));
    used[0] = true;
    while (count) {
        int found = 0;
        for (int i = 0; i < count; i++) found += level[i].ids[level[i].length - 1] == end;
        if (found) {
            char ***answer = malloc(found * sizeof(char **));
            *returnColumnSizes = malloc(found * sizeof(int));
            for (int i = 0; i < count; i++) {
                if (level[i].ids[level[i].length - 1] != end) continue;
                int at = (*returnSize)++;
                int length = level[i].length;
                answer[at] = malloc(length * sizeof(char *));
                (*returnColumnSizes)[at] = length;
                for (int j = 0; j < length; j++) answer[at][j] = words[level[i].ids[j]];
            }
            for (int i = 0; i < count; i++) free(level[i].ids);
            free(level);
            free(used);
            free(words);
            return answer;
        }
        int nextCap = cap, nextCount = 0;
        Path126 *next = malloc(nextCap * sizeof(Path126));
        bool *usedHere = calloc(n, sizeof(bool));
        for (int i = 0; i < count; i++) {
            int last = level[i].ids[level[i].length - 1];
            for (int j = 1; j < n; j++) {
                if (used[j] || !near126(words[last], words[j])) continue;
                if (nextCount == nextCap) {
                    nextCap *= 2;
                    next = realloc(next, nextCap * sizeof(Path126));
                }
                next[nextCount].length = level[i].length + 1;
                next[nextCount].ids = malloc(next[nextCount].length * sizeof(int));
                memcpy(next[nextCount].ids, level[i].ids, level[i].length * sizeof(int));
                next[nextCount].ids[level[i].length] = j;
                nextCount++;
                usedHere[j] = true;
            }
            free(level[i].ids);
        }
        for (int j = 0; j < n; j++) if (usedHere[j]) used[j] = true;
        free(usedHere);
        free(level);
        level = next;
        count = nextCount;
    }
    free(level);
    free(used);
    free(words);
    return NULL;
}${CHECK.c}`,
        cpp: `vector<vector<string>> findLadders(string beginWord, string endWord, vector<string>& wordList) {
    unordered_set<string> words(wordList.begin(), wordList.end());
    if (!words.count(endWord)) return {};
    vector<vector<string>> level{{beginWord}};
    unordered_set<string> used{beginWord};
    while (!level.empty()) {
        vector<vector<string>> answer;
        for (const auto& path : level) if (path.back() == endWord) answer.push_back(path);
        if (!answer.empty()) return answer;
        vector<vector<string>> next;
        unordered_set<string> usedHere;
        for (const auto& path : level) {
            string candidate = path.back();
            for (int i = 0; i < (int)candidate.size(); i++) {
                char old = candidate[i];
                for (char ch = 'a'; ch <= 'z'; ch++) {
                    candidate[i] = ch;
                    if (words.count(candidate) && !used.count(candidate)) {
                        auto longer = path;
                        longer.push_back(candidate);
                        next.push_back(move(longer));
                        usedHere.insert(candidate);
                    }
                }
                candidate[i] = old;
            }
        }
        used.insert(usedHere.begin(), usedHere.end());
        level = move(next);
    }
    return {};
}${CHECK.cpp}`,
        java: `List<List<String>> findLadders(String beginWord, String endWord, List<String> wordList) {
    Set<String> words = new HashSet<>(wordList);
    if (!words.contains(endWord)) return new ArrayList<>();
    List<List<String>> level = new ArrayList<>();
    level.add(new ArrayList<>(List.of(beginWord)));
    Set<String> used = new HashSet<>();
    used.add(beginWord);
    while (!level.isEmpty()) {
        List<List<String>> answer = new ArrayList<>();
        for (List<String> path : level) {
            if (path.get(path.size() - 1).equals(endWord)) answer.add(path);
        }
        if (!answer.isEmpty()) return answer;
        List<List<String>> next = new ArrayList<>();
        Set<String> usedHere = new HashSet<>();
        for (List<String> path : level) {
            char[] chars = path.get(path.size() - 1).toCharArray();
            for (int i = 0; i < chars.length; i++) {
                char old = chars[i];
                for (char ch = 'a'; ch <= 'z'; ch++) {
                    chars[i] = ch;
                    String candidate = new String(chars);
                    if (words.contains(candidate) && !used.contains(candidate)) {
                        List<String> longer = new ArrayList<>(path);
                        longer.add(candidate);
                        next.add(longer);
                        usedHere.add(candidate);
                    }
                }
                chars[i] = old;
            }
        }
        used.addAll(usedHere);
        level = next;
    }
    return new ArrayList<>();
}${CHECK.java}`,
        javascript: `function findLadders(beginWord, endWord, wordList) {
  const words = new Set(wordList);
  if (!words.has(endWord)) return [];
  let level = [[beginWord]];
  const used = new Set([beginWord]);
  while (level.length) {
    const answer = level.filter((path) => path[path.length - 1] === endWord);
    if (answer.length) return answer;
    const next = [];
    const usedHere = new Set();
    for (const path of level) {
      const word = path[path.length - 1];
      for (let i = 0; i < word.length; i++) {
        for (let code = 97; code <= 122; code++) {
          const candidate = word.slice(0, i) + String.fromCharCode(code) + word.slice(i + 1);
          if (words.has(candidate) && !used.has(candidate)) {
            next.push([...path, candidate]);
            usedHere.add(candidate);
          }
        }
      }
    }
    for (const word of usedHere) used.add(word);
    level = next;
  }
  return [];
}${CHECK.javascript}`,
      },
    },
    {
      name: 'BFS 距離後沿最短路 DFS',
      idea: '先求每個字距起點幾步；再只走距離每次增加一的邊。',
      steps: ['BFS 算出每個字的最短距離。', '若終點不可達，回傳空。', '從起點 DFS，只能走到距離恰好多一的相鄰字。', '到終點時複製目前路徑。'],
      figure: { title: 'hit → cog 的分層距離', steps: G },
      complexity: { time: 'O(n² · 字長 + 輸出長度)', space: 'O(n + 輸出長度)', why: '兩字是否相鄰可逐對比較，DFS 必須產生所有最短答案。' },
      verdict: '不在 BFS 佇列複製路徑；距離保證 DFS 不會走回頭路。',
      code: {
        python: `from collections import deque

def findLadders(beginWord, endWord, wordList):
    words = [beginWord] + [word for word in wordList if word != beginWord]
    if endWord not in words:
        return []
    n = len(words)
    graph = [[] for _ in range(n)]
    for i in range(n):
        for j in range(i + 1, n):
            if sum(a != b for a, b in zip(words[i], words[j])) == 1:
                graph[i].append(j)
                graph[j].append(i)
    distance = [-1] * n
    distance[0] = 0
    queue = deque([0])
    while queue:
        i = queue.popleft()
        for j in graph[i]:
            if distance[j] == -1:
                distance[j] = distance[i] + 1  # BFS 最短距離
                queue.append(j)
    end = words.index(endWord)
    answer = []
    path = [beginWord]

    def dfs(i):
        if i == end:
            answer.append(path[:])
            return
        for j in graph[i]:
            if distance[j] == distance[i] + 1:
                path.append(words[j])
                dfs(j)
                path.pop()

    if distance[end] != -1:
        dfs(0)
    return answer${CHECK.python}`,
        c: `static char **words126;
static int count126, end126;
static int *distance126, *path126;
static char ***result126;
static int *sizes126, resultCount126, resultCap126;

static bool near126(const char *a, const char *b) {
    int diff = 0;
    for (int i = 0; a[i]; i++) diff += a[i] != b[i];
    return diff == 1;
}

static void dfs126(int at, int length) {
    if (at == end126) {
        if (resultCount126 == resultCap126) {
            resultCap126 *= 2;
            result126 = realloc(result126, resultCap126 * sizeof(char **));
            sizes126 = realloc(sizes126, resultCap126 * sizeof(int));
        }
        int k = resultCount126++;
        sizes126[k] = length;
        result126[k] = malloc(length * sizeof(char *));
        for (int i = 0; i < length; i++) result126[k][i] = words126[path126[i]];
        return;
    }
    for (int j = 0; j < count126; j++) {
        if (distance126[j] == distance126[at] + 1 && near126(words126[at], words126[j])) {
            path126[length] = j;
            dfs126(j, length + 1);
        }
    }
}

char ***findLadders(char *beginWord, char *endWord, char **wordList, int wordListSize, int *returnSize, int **returnColumnSizes) {
    count126 = wordListSize + 1;
    words126 = malloc(count126 * sizeof(char *));
    words126[0] = beginWord;
    end126 = -1;
    for (int i = 0; i < wordListSize; i++) {
        words126[i + 1] = wordList[i];
        if (strcmp(wordList[i], endWord) == 0) end126 = i + 1;
    }
    *returnSize = 0;
    *returnColumnSizes = NULL;
    if (end126 < 0) {
        free(words126);
        return NULL;
    }
    distance126 = malloc(count126 * sizeof(int));
    int *queue = malloc(count126 * sizeof(int));
    for (int i = 0; i < count126; i++) distance126[i] = -1;
    distance126[0] = 0;
    int head = 0, tail = 0;
    queue[tail++] = 0;
    while (head < tail) {
        int at = queue[head++];
        for (int j = 0; j < count126; j++) {
            if (distance126[j] == -1 && near126(words126[at], words126[j])) {
                distance126[j] = distance126[at] + 1;
                queue[tail++] = j;
            }
        }
    }
    resultCap126 = 16;
    resultCount126 = 0;
    result126 = malloc(resultCap126 * sizeof(char **));
    sizes126 = malloc(resultCap126 * sizeof(int));
    path126 = malloc(count126 * sizeof(int));
    path126[0] = 0;
    if (distance126[end126] >= 0) dfs126(0, 1);
    free(queue);
    free(distance126);
    free(path126);
    free(words126);
    *returnSize = resultCount126;
    *returnColumnSizes = sizes126;
    return result126;
}${CHECK.c}`,
        cpp: `vector<vector<string>> findLadders(string beginWord, string endWord, vector<string>& wordList) {
    vector<string> words{beginWord};
    for (const string& word : wordList) if (word != beginWord) words.push_back(word);
    auto it = find(words.begin(), words.end(), endWord);
    if (it == words.end()) return {};
    int n = words.size(), end = it - words.begin();
    vector<vector<int>> graph(n);
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int diff = 0;
            for (int k = 0; k < (int)words[i].size(); k++) diff += words[i][k] != words[j][k];
            if (diff == 1) {
                graph[i].push_back(j);
                graph[j].push_back(i);
            }
        }
    }
    vector<int> distance(n, -1);
    queue<int> q;
    q.push(0);
    distance[0] = 0;
    while (!q.empty()) {
        int at = q.front();
        q.pop();
        for (int next : graph[at]) {
            if (distance[next] == -1) {
                distance[next] = distance[at] + 1;
                q.push(next);
            }
        }
    }
    vector<vector<string>> answer;
    vector<string> path{beginWord};
    function<void(int)> dfs = [&](int at) {
        if (at == end) {
            answer.push_back(path);
            return;
        }
        for (int next : graph[at]) {
            if (distance[next] != distance[at] + 1) continue;
            path.push_back(words[next]);
            dfs(next);
            path.pop_back();
        }
    };
    if (distance[end] != -1) dfs(0);
    return answer;
}${CHECK.cpp}`,
        java: `List<List<String>> findLadders(String beginWord, String endWord, List<String> wordList) {
    List<String> words = new ArrayList<>();
    words.add(beginWord);
    for (String word : wordList) if (!word.equals(beginWord)) words.add(word);
    int end = words.indexOf(endWord);
    if (end < 0) return new ArrayList<>();
    int n = words.size();
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int diff = 0;
            for (int k = 0; k < words.get(i).length(); k++) {
                if (words.get(i).charAt(k) != words.get(j).charAt(k)) diff++;
            }
            if (diff == 1) {
                graph.get(i).add(j);
                graph.get(j).add(i);
            }
        }
    }
    int[] distance = new int[n];
    Arrays.fill(distance, -1);
    ArrayDeque<Integer> queue = new ArrayDeque<>();
    queue.offer(0);
    distance[0] = 0;
    while (!queue.isEmpty()) {
        int at = queue.poll();
        for (int next : graph.get(at)) {
            if (distance[next] == -1) {
                distance[next] = distance[at] + 1;
                queue.offer(next);
            }
        }
    }
    List<List<String>> answer = new ArrayList<>();
    if (distance[end] != -1) dfs126(0, end, words, graph, distance, new ArrayList<>(List.of(beginWord)), answer);
    return answer;
}

void dfs126(int at, int end, List<String> words, List<List<Integer>> graph, int[] distance, List<String> path, List<List<String>> answer) {
    if (at == end) {
        answer.add(new ArrayList<>(path));
        return;
    }
    for (int next : graph.get(at)) {
        if (distance[next] != distance[at] + 1) continue;
        path.add(words.get(next));
        dfs126(next, end, words, graph, distance, path, answer);
        path.remove(path.size() - 1);
    }
}${CHECK.java}`,
        javascript: `function findLadders(beginWord, endWord, wordList) {
  const words = [beginWord, ...wordList.filter((word) => word !== beginWord)];
  const end = words.indexOf(endWord);
  if (end < 0) return [];
  const n = words.length;
  const graph = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let diff = 0;
      for (let k = 0; k < words[i].length; k++) diff += +(words[i][k] !== words[j][k]);
      if (diff === 1) {
        graph[i].push(j);
        graph[j].push(i);
      }
    }
  }
  const distance = new Array(n).fill(-1);
  distance[0] = 0;
  const queue = [0];
  for (let head = 0; head < queue.length; head++) {
    const at = queue[head];
    for (const next of graph[at]) {
      if (distance[next] === -1) {
        distance[next] = distance[at] + 1;
        queue.push(next);
      }
    }
  }
  const answer = [];
  function dfs(at, path) {
    if (at === end) {
      answer.push([...path]);
      return;
    }
    for (const next of graph[at]) {
      if (distance[next] === distance[at] + 1) dfs(next, [...path, words[next]]);
    }
  }
  if (distance[end] !== -1) dfs(0, [beginWord]);
  return answer;
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['BFS 同一層可能有不同最短路徑到同一字，不能過早排除。', '找到終點後還需收集同一層的全部路徑。', '若 endWord 不在字典，沒有答案。'],
  check: { kind: 'fn', fn: 'ladderCheck', cases: [
    { args: ['hit', 'cog', WORDS], out: 'hit>hot>dot>dog>cog|hit>hot>lot>log>cog' },
    { args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']], out: '' },
    { args: ['a', 'c', ['a', 'b', 'c']], out: 'a>c' },
  ] },
}
