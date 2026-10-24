import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 301. Remove Invalid Parentheses
const S = '()())()'
const F = [
  { note: '原字串 ()())() 在第五個字元出現多餘的右括號，整串不合法。', views: [arr(S.split(''), { label: '原字串', highlight: [4] })] },
  { note: 'BFS 第 0 層只放原字串；不合法，就刪掉一個括號形成下一層。', views: [arr([0, 1], { label: '已嘗試的刪除數', highlight: [0] })] },
  { note: '刪一個括號後，可得到 (())() 或 ()()()，兩者都合法。', views: [arr(['(())()', '()()()'], { label: '第 1 層合法結果', done: [0, 1] })] },
  { note: '第 1 層已有答案，不再探索刪兩個括號的字串；回傳兩個結果。', views: [arr(['(())()', '()()()'], { label: '最少刪除', done: [0, 1] })] },
]
const G = [
  { note: '先掃描原字串，確認要刪 0 個左括號、1 個右括號。', views: [arr([0, 1], { label: '左刪 / 右刪' })] },
  { note: 'DFS 掃到多餘的右括號時，可以刪它，但總刪除配額只能用一次。', views: [arr(S.split(''), { label: '考慮刪除', highlight: [4] })] },
  { note: '一條路保留 (())()，另一條保留 ()()()；掃描時右括號數不可超過左括號。', views: [arr(['(())()', '()()()'], { label: '合法分支', done: [0, 1] })] },
  { note: '相同位置的重複括號只探索一次，集合去重後得到兩個答案。', views: [arr(['(())()', '()()()'], { label: '結果', done: [0, 1] })] },
]

export const q0301: Solution = {
  id: 301,
  plain: '刪掉最少的括號，讓整段文字的括號配對正確，並列出所有不同的結果。',
  statement: '字串含 `(`、`)` 與英文字母。每次可刪一個括號；求刪除次數最少時所有不同的合法字串，答案順序不限。',
  examples: [{ input: 's = "()())()"', output: '["(())()","()()()"]' }, { input: 's = "(a)())()"', output: '["(a())()","(a)()()"]' }, { input: 's = ")("', output: '[""]' }],
  constraints: ['括號最多 20 個；答案需去重。'],
  insight: ['[[p:graph-traversal]] 的 BFS 逐層刪除，第一個找到合法字串的層數就是最少刪除數。', '也能先算必須刪掉的左右括號數，再用 [[p:backtracking]] 剪枝。'],
  approaches: [
    {
      name: '逐層刪除的 BFS',
      idea: '每一層刪除數相同；第一個有合法字串的層就是答案層。',
      steps: ['佇列從原字串開始。', '檢查目前整層的所有字串並收集合法者。', '若有合法結果就停止；否則刪除每個括號，去重後放入下一層。'],
      figure: { title: 's = "()())()"', steps: F },
      complexity: { time: 'O(2^p · n)', space: 'O(2^p · n)', why: 'p 個括號有指數個刪除組合，每個字串長度最多 n。' },
      verdict: '最少刪除由 BFS 層數自然保證；要記得整層收集後才停止。',
      code: {
        python: `def removeInvalidParentheses(s):
    def valid(text):
        balance = 0
        for ch in text:
            if ch == '(':
                balance += 1
            elif ch == ')':
                balance -= 1
                if balance < 0:
                    return False
        return balance == 0

    level = {s}
    while True:
        answer = [text for text in level if valid(text)]
        if answer:
            return answer             # 整層都是同樣的最少刪除數
        level = {text[:i] + text[i + 1:]
                 for text in level for i, ch in enumerate(text) if ch in '()'}`, 
        c: `static bool valid301(const char *s) {
    int balance = 0;
    for (int i = 0; s[i]; i++) {
        if (s[i] == '(') balance++;
        if (s[i] == ')' && --balance < 0) return false;
    }
    return balance == 0;
}

static char *copy301(const char *s) {
    char *p = malloc(strlen(s) + 1);
    strcpy(p, s);
    return p;
}

static bool seen301(char **items, int count, const char *s) {
    for (int i = 0; i < count; i++) {
        if (strcmp(items[i], s) == 0) return true;
    }
    return false;
}

char **removeInvalidParentheses(char *s, int *returnSize) {
    int capacity = 32, count = 1;
    char **level = malloc(capacity * sizeof(char *));
    level[0] = copy301(s);
    while (true) {
        char **answer = malloc(count * sizeof(char *));
        int found = 0;
        for (int i = 0; i < count; i++) {
            if (valid301(level[i])) answer[found++] = copy301(level[i]);
        }
        if (found) {
            for (int i = 0; i < count; i++) free(level[i]);
            free(level);
            *returnSize = found;
            return answer;
        }
        free(answer);
        char **next = malloc(capacity * sizeof(char *));
        int nextCount = 0;
        for (int i = 0; i < count; i++) {
            int n = strlen(level[i]);
            for (int j = 0; j < n; j++) {
                if (level[i][j] != '(' && level[i][j] != ')') continue;
                char *candidate = malloc(n);
                memcpy(candidate, level[i], j);
                strcpy(candidate + j, level[i] + j + 1);
                if (seen301(next, nextCount, candidate)) {
                    free(candidate);
                    continue;
                }
                if (nextCount == capacity) {
                    capacity *= 2;
                    next = realloc(next, capacity * sizeof(char *));
                }
                next[nextCount++] = candidate;
            }
            free(level[i]);
        }
        free(level);
        level = next;
        count = nextCount;
    }
}`,
        cpp: `vector<string> removeInvalidParentheses(string s) {
    auto valid = [](const string& text) {
        int balance = 0;
        for (char ch : text) {
            if (ch == '(') balance++;
            if (ch == ')' && --balance < 0) return false;
        }
        return balance == 0;
    };
    unordered_set<string> level{s};
    while (true) {
        vector<string> answer;
        for (const string& text : level) {
            if (valid(text)) answer.push_back(text);
        }
        if (!answer.empty()) return answer;
        unordered_set<string> next;
        for (const string& text : level) {
            for (int i = 0; i < (int)text.size(); i++) {
                if (text[i] == '(' || text[i] == ')') next.insert(text.substr(0, i) + text.substr(i + 1));
            }
        }
        level = move(next);
    }
}`,
        java: `List<String> removeInvalidParentheses(String s) {
    Set<String> level = new HashSet<>();
    level.add(s);
    while (true) {
        List<String> answer = new ArrayList<>();
        for (String text : level) {
            int balance = 0;
            boolean valid = true;
            for (char ch : text.toCharArray()) {
                if (ch == '(') balance++;
                if (ch == ')' && --balance < 0) {
                    valid = false;
                    break;
                }
            }
            if (valid && balance == 0) answer.add(text);
        }
        if (!answer.isEmpty()) return answer;
        Set<String> next = new HashSet<>();
        for (String text : level) {
            for (int i = 0; i < text.length(); i++) {
                char ch = text.charAt(i);
                if (ch == '(' || ch == ')') next.add(text.substring(0, i) + text.substring(i + 1));
            }
        }
        level = next;
    }
}`,
        javascript: `function removeInvalidParentheses(s) {
  const valid = (text) => {
    let balance = 0;
    for (const ch of text) {
      if (ch === '(') balance++;
      if (ch === ')' && --balance < 0) return false;
    }
    return balance === 0;
  };
  let level = new Set([s]);
  while (true) {
    const answer = [...level].filter(valid);
    if (answer.length) return answer;
    const next = new Set();
    for (const text of level) {
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '(' || text[i] === ')') next.add(text.slice(0, i) + text.slice(i + 1));
      }
    }
    level = next;
  }
}`,
      },
    },
    {
      name: '先算刪除配額再回溯',
      idea: '只搜尋恰好刪掉必要數量括號的分支；前綴不合法立即停止。',
      steps: ['掃一遍求出多餘左括號與右括號數。', '每個括號可依剩餘配額選擇刪或留。', '保留右括號時不能讓右括號數超過左括號數。', '掃完且配額用盡、括號平衡時加入集合。'],
      figure: { title: 's = "()())()"', steps: G },
      complexity: { time: 'O(2^p · n)', space: 'O(2^p · n)', why: '最壞仍要檢查指數個括號選擇與答案。' },
      verdict: '提早剪掉多餘刪除與不合法前綴，通常比 BFS 省。',
      code: {
        python: `def removeInvalidParentheses(s):
    left_remove = right_remove = 0
    for ch in s:
        if ch == '(':
            left_remove += 1
        elif ch == ')':
            if left_remove:
                left_remove -= 1
            else:
                right_remove += 1
    answer = set()

    def dfs(i, balance, left, right, path):
        if i == len(s):
            if balance == left == right == 0:
                answer.add(''.join(path))  # 只收最少刪除且合法的結果
            return
        ch = s[i]
        if ch == '(' and left:
            dfs(i + 1, balance, left - 1, right, path)
        if ch == ')' and right:
            dfs(i + 1, balance, left, right - 1, path)
        if ch == ')' and balance == 0:
            return
        path.append(ch)
        dfs(i + 1, balance + (ch == '(') - (ch == ')'), left, right, path)
        path.pop()

    dfs(0, 0, left_remove, right_remove, [])
    return list(answer)`,
        c: `static char **result301;
static int resultCount301, resultCap301;

static void dfs301(char *s, int n, int i, int balance, int left, int right, char *path, int size) {
    if (i == n) {
        if (balance || left || right) return;
        path[size] = '\\0';
        for (int j = 0; j < resultCount301; j++) {
            if (strcmp(result301[j], path) == 0) return;
        }
        if (resultCount301 == resultCap301) {
            resultCap301 *= 2;
            result301 = realloc(result301, resultCap301 * sizeof(char *));
        }
        char *copy = malloc(size + 1);
        strcpy(copy, path);
        result301[resultCount301++] = copy;
        return;
    }
    char ch = s[i];
    if (ch == '(' && left) dfs301(s, n, i + 1, balance, left - 1, right, path, size);
    if (ch == ')' && right) dfs301(s, n, i + 1, balance, left, right - 1, path, size);
    if (ch == ')' && balance == 0) return;
    path[size] = ch;
    dfs301(s, n, i + 1, balance + (ch == '(') - (ch == ')'), left, right, path, size + 1);
}

char **removeInvalidParentheses(char *s, int *returnSize) {
    int left = 0, right = 0, n = strlen(s);
    for (int i = 0; i < n; i++) {
        if (s[i] == '(') left++;
        else if (s[i] == ')') {
            if (left) left--;
            else right++;
        }
    }
    resultCount301 = 0;
    resultCap301 = 16;
    result301 = malloc(resultCap301 * sizeof(char *));
    char *path = malloc(n + 1);
    dfs301(s, n, 0, 0, left, right, path, 0);
    free(path);
    *returnSize = resultCount301;
    return result301;
}`,
        cpp: `vector<string> removeInvalidParentheses(string s) {
    int left = 0, right = 0;
    for (char ch : s) {
        if (ch == '(') left++;
        else if (ch == ')') {
            if (left) left--;
            else right++;
        }
    }
    unordered_set<string> answer;
    string path;
    function<void(int, int, int, int)> dfs = [&](int i, int balance, int l, int r) {
        if (i == (int)s.size()) {
            if (!balance && !l && !r) answer.insert(path);
            return;
        }
        char ch = s[i];
        if (ch == '(' && l) dfs(i + 1, balance, l - 1, r);
        if (ch == ')' && r) dfs(i + 1, balance, l, r - 1);
        if (ch == ')' && !balance) return;
        path.push_back(ch);
        dfs(i + 1, balance + (ch == '(') - (ch == ')'), l, r);
        path.pop_back();
    };
    dfs(0, 0, left, right);
    return vector<string>(answer.begin(), answer.end());
}`,
        java: `Set<String> answer301;
String input301;

void dfs301(int i, int balance, int left, int right, StringBuilder path) {
    if (i == input301.length()) {
        if (balance == 0 && left == 0 && right == 0) answer301.add(path.toString());
        return;
    }
    char ch = input301.charAt(i);
    if (ch == '(' && left > 0) dfs301(i + 1, balance, left - 1, right, path);
    if (ch == ')' && right > 0) dfs301(i + 1, balance, left, right - 1, path);
    if (ch == ')' && balance == 0) return;
    path.append(ch);
    dfs301(i + 1, balance + (ch == '(' ? 1 : 0) - (ch == ')' ? 1 : 0), left, right, path);
    path.deleteCharAt(path.length() - 1);
}

List<String> removeInvalidParentheses(String s) {
    int left = 0, right = 0;
    for (char ch : s.toCharArray()) {
        if (ch == '(') left++;
        else if (ch == ')') {
            if (left > 0) left--;
            else right++;
        }
    }
    input301 = s;
    answer301 = new HashSet<>();
    dfs301(0, 0, left, right, new StringBuilder());
    return new ArrayList<>(answer301);
}`,
        javascript: `function removeInvalidParentheses(s) {
  let left = 0, right = 0;
  for (const ch of s) {
    if (ch === '(') left++;
    else if (ch === ')') {
      if (left) left--;
      else right++;
    }
  }
  const answer = new Set();
  function dfs(i, balance, l, r, path) {
    if (i === s.length) {
      if (!balance && !l && !r) answer.add(path);
      return;
    }
    const ch = s[i];
    if (ch === '(' && l) dfs(i + 1, balance, l - 1, r, path);
    if (ch === ')' && r) dfs(i + 1, balance, l, r - 1, path);
    if (ch === ')' && !balance) return;
    dfs(i + 1, balance + +(ch === '(') - +(ch === ')'), l, r, path + ch);
  }
  dfs(0, 0, left, right, '');
  return [...answer];
}`,
      },
    },
  ],
  pitfalls: ['找到一個合法結果後仍要收集同一層其他結果。', '字母不能刪；重複的括號刪法可能得到同一字串，結果要去重。'],
  check: { kind: 'fn', fn: 'removeInvalidParentheses', compare: 'sorted', cases: [
    { args: [S], out: ['(())()', '()()()'] },
    { args: ['(a)())()'], out: ['(a())()', '(a)()()'] },
    { args: [')('], out: [''] }, { args: ['n'], out: ['n'] },
  ] },
}
