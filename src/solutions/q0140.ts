import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 140. Word Break II
const S = 'catsanddog'
const D = ['cat', 'cats', 'and', 'sand', 'dog']

const CHECK = {
  python: `\n\ndef sentencesCheck(s, wordDict):
    sentences = wordBreak(s, wordDict)
    ways = [0] * (len(s) + 1)
    ways[len(s)] = 1
    for i in range(len(s) - 1, -1, -1):
        ways[i] = sum(ways[i + len(w)] for w in wordDict if s.startswith(w, i))
    dictionary = set(wordDict)
    valid = all(all(w in dictionary for w in line.split(' ')) and line.replace(' ', '') == s for line in sentences)
    return int(valid and len(sentences) == len(set(sentences)) == ways[0])`,
  c: `\n\nstatic int compare140(const void *a, const void *b) {
    return strcmp(*(char *const *)a, *(char *const *)b);
}

int sentencesCheck(char *s, char **wordDict, int wordDictSize) {
    int count = 0;
    char **sentences = wordBreak(s, wordDict, wordDictSize, &count);
    int n = strlen(s);
    int *ways = calloc(n + 1, sizeof(int));
    ways[n] = 1;
    for (int i = n - 1; i >= 0; i--) {
        for (int j = 0; j < wordDictSize; j++) {
            int length = strlen(wordDict[j]);
            if (i + length <= n && strncmp(s + i, wordDict[j], length) == 0) {
                ways[i] += ways[i + length];
            }
        }
    }
    int valid = count == ways[0];
    qsort(sentences, count, sizeof(char *), compare140);
    for (int i = 0; i < count; i++) {
        if (i > 0 && strcmp(sentences[i - 1], sentences[i]) == 0) {
            valid = 0;
        }
        int position = 0;
        char *line = sentences[i];
        for (int at = 0; line[at];) {
            int end = at;
            while (line[end] && line[end] != ' ') {
                end++;
            }
            int length = end - at;
            int known = 0;
            for (int j = 0; j < wordDictSize; j++) {
                if ((int)strlen(wordDict[j]) == length && strncmp(line + at, wordDict[j], length) == 0) {
                    known = 1;
                }
            }
            if (!known || position + length > n || strncmp(s + position, line + at, length) != 0) {
                valid = 0;
            }
            position += length;
            at = line[end] ? end + 1 : end;
        }
        if (position != n) {
            valid = 0;
        }
    }
    for (int i = 0; i < count; i++) {
        free(sentences[i]);
    }
    free(sentences);
    free(ways);
    return valid;
}`,
  cpp: `\n\nint sentencesCheck(string s, vector<string>& wordDict) {
    vector<string> sentences = wordBreak(s, wordDict);
    vector<int> ways(s.size() + 1);
    ways[s.size()] = 1;
    for (int i = (int)s.size() - 1; i >= 0; i--) {
        for (const string& word : wordDict) {
            if (s.compare(i, word.size(), word) == 0) {
                ways[i] += ways[i + word.size()];
            }
        }
    }
    set<string> unique(sentences.begin(), sentences.end());
    set<string> dictionary(wordDict.begin(), wordDict.end());
    for (const string& line : sentences) {
        istringstream input(line);
        string word;
        string joined;
        while (input >> word) {
            if (!dictionary.count(word)) {
                return 0;
            }
            joined += word;
        }
        if (joined != s) {
            return 0;
        }
    }
    return (int)sentences.size() == (int)unique.size() && (int)sentences.size() == ways[0];
}`,
  java: `\n\nint sentencesCheck(String s, List<String> wordDict) {
    List<String> sentences = wordBreak(s, wordDict);
    int[] ways = new int[s.length() + 1];
    ways[s.length()] = 1;
    for (int i = s.length() - 1; i >= 0; i--) {
        for (String word : wordDict) {
            if (s.startsWith(word, i)) {
                ways[i] += ways[i + word.length()];
            }
        }
    }
    Set<String> unique = new HashSet<>(sentences);
    Set<String> dictionary = new HashSet<>(wordDict);
    for (String line : sentences) {
        StringBuilder joined = new StringBuilder();
        for (String word : line.split(" ")) {
            if (!dictionary.contains(word)) {
                return 0;
            }
            joined.append(word);
        }
        if (!joined.toString().equals(s)) {
            return 0;
        }
    }
    return sentences.size() == unique.size() && sentences.size() == ways[0] ? 1 : 0;
}`,
  javascript: `\n\nfunction sentencesCheck(s, wordDict) {
  const sentences = wordBreak(s, wordDict);
  const ways = new Array(s.length + 1).fill(0);
  ways[s.length] = 1;
  for (let i = s.length - 1; i >= 0; i--) {
    for (const word of wordDict) {
      if (s.startsWith(word, i)) {
        ways[i] += ways[i + word.length];
      }
    }
  }
  const dictionary = new Set(wordDict);
  for (const line of sentences) {
    const words = line.split(' ');
    if (!words.every(word => dictionary.has(word)) || words.join('') !== s) {
      return 0;
    }
  }
  return sentences.length === new Set(sentences).size && sentences.length === ways[0] ? 1 : 0;
}`,
}

export const q0140: Solution = {
  id: 140,
  plain: '把一整串字母切成字典裡的單字，列出所有能切成完整句子的方式。',
  statement: '給字串 s 和字典 wordDict。把 s 切成一個以上字典單字，單字間加入空格，回傳所有可能句子；同一字可重複使用。',
  examples: [{ input: 's = "catsanddog", wordDict = ["cat","cats","and","sand","dog"]', output: '["cat sand dog","cats and dog"]' }, { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: '[]' }],
  constraints: ['1 ≤ s.length ≤ 20；字典單字互不相同。', '答案數可能呈指數成長，列舉時必須容許多條路徑。'],
  insight: ['在每個字串位置，嘗試所有能匹配的字典單字。', '匹配一字後遞迴切剩餘字串，到末尾就產生一句話。', '可先用 [[p:dp-1d]] 標出哪些後綴可切，讓 [[p:backtracking]] 避開死路。'],
  approaches: [
    {
      name: 'DFS 回溯所有切法',
      idea: '目前位置逐個嘗試字典單字；能匹配就加入句子，遞迴到下一位置。',
      steps: ['從位置 0、空單字清單開始。', '對每個可匹配的字，加入後遞迴。', '到 s 末尾時，以空格連接並存入答案；返回時撤銷最後單字。'],
      figure: { title: 's = catsanddog', steps: [
        { note: '從位置 0 試字典；cat 與開頭相符，先走 cat 分支。', views: [arr([...S], { label: '已取 cat', highlight: [0, 1, 2] }), arr(['cat'], { label: '句子單字' })] },
        { note: '剩下 sanddog，sand 相符，句子暫為 cat sand。', views: [arr([...S], { label: '已取 sand', highlight: [3, 4, 5, 6] }), arr(['cat', 'sand'], { label: '句子單字' })] },
        { note: '剩下 dog，取完到達末尾，得到「cat sand dog」。', views: [arr(['cat', 'sand', 'dog'], { label: '第一句', done: [0, 1, 2] })] },
        { note: '退回開頭改選 cats，接 and、dog，得到第二句。', views: [arr(['cats', 'and', 'dog'], { label: '第二句', done: [0, 1, 2] })] },
      ] },
      complexity: { time: 'O(分支數 × n × 字典大小)', space: 'O(n + 輸出大小)', why: '每條可行切法都會走訪，並輸出相應句子。' },
      verdict: '直接反映「列出所有」；無解後綴反覆出現時會重複搜尋。',
      code: {
        python: `def wordBreak(s, wordDict):
    answer = []
    chosen = []
    def dfs(index):
        if index == len(s):
            answer.append(' '.join(chosen))  # 完整切到末尾才輸出
            return
        for word in wordDict:
            if s.startswith(word, index):
                chosen.append(word)
                dfs(index + len(word))
                chosen.pop()             # 回到分岔點
    dfs(0)
    return answer${CHECK.python}`,
        c: `typedef struct {
    char *s;
    char **dict;
    int dictSize;
    int n;
    char *sentence;
    char **answer;
    int count;
    int capacity;
    bool *possible;
} Context140;

static void dfs140(Context140 *ctx, int index, int used) {
    if (index == ctx->n) {
        if (ctx->count == ctx->capacity) {
            ctx->capacity *= 2;
            ctx->answer = realloc(ctx->answer, ctx->capacity * sizeof(char *));
        }
        int length = used > 0 ? used - 1 : 0;
        char *copy = malloc(length + 1);
        memcpy(copy, ctx->sentence, length);
        copy[length] = 0;
        ctx->answer[ctx->count++] = copy;
        return;
    }
    for (int i = 0; i < ctx->dictSize; i++) {
        int length = strlen(ctx->dict[i]);
        int next = index + length;
        if (next > ctx->n || strncmp(ctx->s + index, ctx->dict[i], length) != 0) {
            continue;
        }
        if (ctx->possible && !ctx->possible[next]) {
            continue;
        }
        memcpy(ctx->sentence + used, ctx->dict[i], length);
        ctx->sentence[used + length] = ' ';
        dfs140(ctx, next, used + length + 1);
    }
}

char **wordBreak(char *s, char **wordDict, int wordDictSize, int *returnSize) {
    Context140 ctx;
    ctx.s = s;
    ctx.dict = wordDict;
    ctx.dictSize = wordDictSize;
    ctx.n = strlen(s);
    ctx.sentence = malloc(2 * ctx.n + 1);
    ctx.capacity = 16;
    ctx.answer = malloc(ctx.capacity * sizeof(char *));
    ctx.count = 0;
    ctx.possible = NULL;
    dfs140(&ctx, 0, 0);
    free(ctx.sentence);
    *returnSize = ctx.count;
    return ctx.answer;
}${CHECK.c}`,
        cpp: `vector<string> wordBreak(string s, vector<string>& wordDict) {
    vector<string> answer;
    vector<string> chosen;
    function<void(int)> dfs = [&](int index) {
        if (index == (int)s.size()) {
            string sentence;
            for (const string& word : chosen) {
                if (!sentence.empty()) {
                    sentence += ' ';
                }
                sentence += word;
            }
            answer.push_back(sentence);
            return;
        }
        for (const string& word : wordDict) {
            if (s.compare(index, word.size(), word) == 0) {
                chosen.push_back(word);
                dfs(index + word.size());
                chosen.pop_back();
            }
        }
    };
    dfs(0);
    return answer;
}${CHECK.cpp}`,
        java: `List<String> wordBreak(String s, List<String> wordDict) {
    List<String> answer = new ArrayList<>();
    List<String> chosen = new ArrayList<>();
    dfs140(s, wordDict, 0, chosen, answer);
    return answer;
}

void dfs140(String s, List<String> dict, int index, List<String> chosen, List<String> answer) {
    if (index == s.length()) {
        answer.add(String.join(" ", chosen));
        return;
    }
    for (String word : dict) {
        if (s.startsWith(word, index)) {
            chosen.add(word);
            dfs140(s, dict, index + word.length(), chosen, answer);
            chosen.remove(chosen.size() - 1);
        }
    }
}${CHECK.java}`,
        javascript: `function wordBreak(s, wordDict) {
  const answer = [];
  const chosen = [];
  function dfs(index) {
    if (index === s.length) {
      answer.push(chosen.join(' '));
      return;
    }
    for (const word of wordDict) {
      if (s.startsWith(word, index)) {
        chosen.push(word);
        dfs(index + word.length);
        chosen.pop();
      }
    }
  }
  dfs(0);
  return answer;
}${CHECK.javascript}`,
      },
    },
    {
      name: '先標可切後綴再回溯',
      idea: '由右往左先算哪些位置能切到終點；DFS 遇到無解的後綴就不走。',
      steps: ['possible[n]=true。', '從右往左計算 possible[i]：若某字匹配且 possible[下一位置]，就設 true。', 'DFS 只延伸至 possible[下一位置] 為 true 的分支。'],
      figure: { title: 's = catsanddog', steps: [
        { note: '末尾位置 10 可切完；dog 從位置 7 接到末尾，所以位置 7 可切。', views: [arr([...S], { label: 'dog 可到終點', highlight: [7, 8, 9] })] },
        { note: 'and 從位置 4 接到 7，sand 從位置 3 接到 7；兩個位置都可切。', views: [arr([...S], { label: '可切後綴', highlight: [3, 4, 7] })] },
        { note: 'cat 可接位置 3，cats 可接位置 4；起點 0 有兩條可走分支。', views: [arr(['cat→sand→dog', 'cats→and→dog'], { label: '可行分支' })] },
        { note: 'DFS 只走這兩條分支；任何接到不可切後綴的分支直接略過。', views: [arr(['cat sand dog', 'cats and dog'], { label: '答案', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n × 字典大小 × L + 輸出路徑工作量)', space: 'O(n + 輸出大小)', why: '後綴 DP 先標出死路；有效路徑仍需完整列舉。' },
      verdict: '對有許多無解後綴的輸入更省時間。',
      code: {
        python: `def wordBreak(s, wordDict):
    n = len(s)
    possible = [False] * (n + 1)
    possible[n] = True
    for i in range(n - 1, -1, -1):
        possible[i] = any(s.startswith(w, i) and possible[i + len(w)] for w in wordDict)
    answer = []
    chosen = []
    def dfs(index):
        if index == n:
            answer.append(' '.join(chosen))
            return
        for word in wordDict:
            nxt = index + len(word)
            if s.startswith(word, index) and possible[nxt]:
                chosen.append(word)      # 只走能完成的後綴
                dfs(nxt)
                chosen.pop()
    if possible[0]:
        dfs(0)
    return answer${CHECK.python}`,
        c: `typedef struct {
    char *s;
    char **dict;
    int dictSize;
    int n;
    char *sentence;
    char **answer;
    int count;
    int capacity;
    bool *possible;
} Context140;

static void dfs140(Context140 *ctx, int index, int used) {
    if (index == ctx->n) {
        if (ctx->count == ctx->capacity) {
            ctx->capacity *= 2;
            ctx->answer = realloc(ctx->answer, ctx->capacity * sizeof(char *));
        }
        int length = used > 0 ? used - 1 : 0;
        char *copy = malloc(length + 1);
        memcpy(copy, ctx->sentence, length);
        copy[length] = 0;
        ctx->answer[ctx->count++] = copy;
        return;
    }
    for (int i = 0; i < ctx->dictSize; i++) {
        int length = strlen(ctx->dict[i]);
        int next = index + length;
        if (next > ctx->n || !ctx->possible[next]) {
            continue;
        }
        if (strncmp(ctx->s + index, ctx->dict[i], length) != 0) {
            continue;
        }
        memcpy(ctx->sentence + used, ctx->dict[i], length);
        ctx->sentence[used + length] = ' ';
        dfs140(ctx, next, used + length + 1);
    }
}

char **wordBreak(char *s, char **wordDict, int wordDictSize, int *returnSize) {
    Context140 ctx;
    ctx.s = s;
    ctx.dict = wordDict;
    ctx.dictSize = wordDictSize;
    ctx.n = strlen(s);
    ctx.sentence = malloc(2 * ctx.n + 1);
    ctx.capacity = 16;
    ctx.answer = malloc(ctx.capacity * sizeof(char *));
    ctx.count = 0;
    ctx.possible = calloc(ctx.n + 1, sizeof(bool));
    ctx.possible[ctx.n] = true;
    for (int i = ctx.n - 1; i >= 0; i--) {
        for (int j = 0; j < wordDictSize; j++) {
            int length = strlen(wordDict[j]);
            if (i + length <= ctx.n && ctx.possible[i + length] && strncmp(s + i, wordDict[j], length) == 0) {
                ctx.possible[i] = true;
                break;
            }
        }
    }
    if (ctx.possible[0]) {
        dfs140(&ctx, 0, 0);
    }
    free(ctx.possible);
    free(ctx.sentence);
    *returnSize = ctx.count;
    return ctx.answer;
}${CHECK.c}`,
        cpp: `vector<string> wordBreak(string s, vector<string>& wordDict) {
    int n = s.size();
    vector<bool> possible(n + 1);
    possible[n] = true;
    for (int i = n - 1; i >= 0; i--) {
        for (const string& word : wordDict) {
            int next = i + word.size();
            if (next <= n && possible[next] && s.compare(i, word.size(), word) == 0) {
                possible[i] = true;
                break;
            }
        }
    }
    vector<string> answer;
    vector<string> chosen;
    function<void(int)> dfs = [&](int index) {
        if (index == n) {
            string sentence;
            for (const string& word : chosen) {
                if (!sentence.empty()) {
                    sentence += ' ';
                }
                sentence += word;
            }
            answer.push_back(sentence);
            return;
        }
        for (const string& word : wordDict) {
            int next = index + word.size();
            if (next <= n && possible[next] && s.compare(index, word.size(), word) == 0) {
                chosen.push_back(word);
                dfs(next);
                chosen.pop_back();
            }
        }
    };
    if (possible[0]) {
        dfs(0);
    }
    return answer;
}${CHECK.cpp}`,
        java: `List<String> wordBreak(String s, List<String> wordDict) {
    int n = s.length();
    boolean[] possible = new boolean[n + 1];
    possible[n] = true;
    for (int i = n - 1; i >= 0; i--) {
        for (String word : wordDict) {
            int next = i + word.length();
            if (next <= n && possible[next] && s.startsWith(word, i)) {
                possible[i] = true;
                break;
            }
        }
    }
    List<String> answer = new ArrayList<>();
    if (possible[0]) {
        dfs140(s, wordDict, 0, possible, new ArrayList<>(), answer);
    }
    return answer;
}

void dfs140(String s, List<String> dict, int index, boolean[] possible, List<String> chosen, List<String> answer) {
    if (index == s.length()) {
        answer.add(String.join(" ", chosen));
        return;
    }
    for (String word : dict) {
        int next = index + word.length();
        if (next <= s.length() && possible[next] && s.startsWith(word, index)) {
            chosen.add(word);
            dfs140(s, dict, next, possible, chosen, answer);
            chosen.remove(chosen.size() - 1);
        }
    }
}${CHECK.java}`,
        javascript: `function wordBreak(s, wordDict) {
  const possible = new Array(s.length + 1).fill(false);
  possible[s.length] = true;
  for (let i = s.length - 1; i >= 0; i--) {
    for (const word of wordDict) {
      const next = i + word.length;
      if (next <= s.length && possible[next] && s.startsWith(word, i)) {
        possible[i] = true;
        break;
      }
    }
  }
  const answer = [];
  const chosen = [];
  function dfs(index) {
    if (index === s.length) {
      answer.push(chosen.join(' '));
      return;
    }
    for (const word of wordDict) {
      const next = index + word.length;
      if (next <= s.length && possible[next] && s.startsWith(word, index)) {
        chosen.push(word);
        dfs(next);
        chosen.pop();
      }
    }
  }
  if (possible[0]) {
    dfs(0);
  }
  return answer;
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['必須剛好切到 s 末尾才輸出句子。', '選擇下一字時不可修改原 s；回溯須撤銷最後單字。', '答案順序不限，測試依排序比較。'],
  check: { kind: 'fn', fn: 'sentencesCheck', cases: [
    { args: [S, D], out: 1 }, { args: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], out: 1 }, { args: ['aaaa', ['a', 'aa']], out: 1 },
  ] },
}
