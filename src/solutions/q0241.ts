import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 241. Different Ways to Add Parentheses
const E = '2*3-4*5'
const F = [
  { note: '只看運算子：最外層若選第一個 *，左邊是 2，右邊是 3−4*5。', views: [arr(['2', '*', '3', '-', '4', '*', '5'], { label: 'expression', highlight: [1] })] },
  { note: '右半部仍能選不同的最外層運算子，所以同一切法會產生多個數值。', views: [arr([-17, -5], { label: '3−4*5 的結果' })] },
  { note: '若選中間的 −，左半 2*3 得 6，右半 4*5 得 20，產生 6−20=−14。', views: [arr([6, 20, -14], { label: '左值 / 右值 / 合併', highlight: [2] })] },
  { note: '列出每個運算子切法的所有左右組合，得到五個結果，重複值也要保留。', views: [arr([-34, -14, -10, -10, 10], { label: '所有結果', done: [0, 1, 2, 3, 4] })] },
]
const G = [
  { note: '把式子拆成數字 [2,3,4,5] 與運算子 [*,−,*]。', views: [arr([2, 3, 4, 5], { label: '數字' })] },
  { note: '長度 1 的區間各只有原本的一個數值。', views: [arr([2, 3, 4, 5], { label: '單數字結果' })] },
  { note: '長度 2 的區間依序得到 6、−1、20。', views: [arr([6, -1, 20], { label: '兩數區間結果' })] },
  { note: '逐漸擴大區間，枚舉切點並做笛卡兒積；整段最後得到五個結果。', views: [arr([-34, -14, -10, -10, 10], { label: '整段結果', done: [0, 1, 2, 3, 4] })] },
]

export const q0241: Solution = {
  id: 241,
  plain: '同一個算式換不同加括號方式，算出所有可能結果；即使數值重複也要留下。',
  statement: '字串只含非負整數、`+`、`-`、`*`。改變運算先後順序（等同各種括號安排），回傳所有可能的計算結果，順序不限。',
  examples: [{ input: 'expression = "2-1-1"', output: '[0,2]' }, { input: 'expression = "2*3-4*5"', output: '[-34,-14,-10,-10,10]' }],
  constraints: ['運算子數量最多約 10；結果可能重複，不能用集合去重。'],
  insight: ['每種括號安排都有一個最外層最後計算的運算子。以它切成左右式，再組合左右所有結果。', '同一子式會重複出現，適合 [[p:interval-dp]] 或記憶化。'],
  approaches: [
    {
      name: '遞迴枚舉最外層運算子',
      idea: '每個運算子當切點；左右各遞迴出所有數值，再兩兩合併。',
      steps: ['若子式沒有運算子，就回傳該數字。', '枚舉每個運算子，切成左右子式。', '把所有左值與右值依該運算子合併，保留重複結果。'],
      figure: { title: 'expression = "2*3-4*5"', steps: F },
      complexity: { time: '指數級', space: '指數級', why: '括號安排數量為 Catalan 數，且子式重複計算。' },
      verdict: '最貼近題意；式子更長時用區間 DP 避免重算。',
      code: {
        python: `def diffWaysToCompute(expression):
    answer = []
    for i, op in enumerate(expression):
        if op not in '+-*':
            continue
        left = diffWaysToCompute(expression[:i])
        right = diffWaysToCompute(expression[i + 1:])
        for a in left:
            for b in right:
                answer.append(a + b if op == '+' else a - b if op == '-' else a * b)  # 各種括號
    return answer if answer else [int(expression)]`,
        c: `typedef struct { int *data; int size; int cap; } Vec241;

static void add241(Vec241 *v, int x) {
    if (v->size == v->cap) {
        v->cap = v->cap ? v->cap * 2 : 8;
        v->data = realloc(v->data, v->cap * sizeof(int));
    }
    v->data[v->size++] = x;
}

static Vec241 solve241(char *s, int left, int right) {
    Vec241 result = {NULL, 0, 0};
    for (int i = left; i < right; i++) {
        char op = s[i];
        if (op != '+' && op != '-' && op != '*') continue;
        Vec241 a = solve241(s, left, i);
        Vec241 b = solve241(s, i + 1, right);
        for (int x = 0; x < a.size; x++) {
            for (int y = 0; y < b.size; y++) {
                int value = op == '+' ? a.data[x] + b.data[y] : op == '-' ? a.data[x] - b.data[y] : a.data[x] * b.data[y];
                add241(&result, value);
            }
        }
        free(a.data);
        free(b.data);
    }
    if (!result.size) add241(&result, atoi(s + left));
    return result;
}

int *diffWaysToCompute(char *expression, int *returnSize) {
    Vec241 result = solve241(expression, 0, strlen(expression));
    *returnSize = result.size;
    return result.data;
}`,
        cpp: `vector<int> diffWaysToCompute(string expression) {
    vector<int> answer;
    for (int i = 0; i < (int)expression.size(); i++) {
        char op = expression[i];
        if (op != '+' && op != '-' && op != '*') continue;
        vector<int> left = diffWaysToCompute(expression.substr(0, i));
        vector<int> right = diffWaysToCompute(expression.substr(i + 1));
        for (int a : left) {
            for (int b : right) {
                answer.push_back(op == '+' ? a + b : op == '-' ? a - b : a * b);
            }
        }
    }
    if (answer.empty()) answer.push_back(stoi(expression));
    return answer;
}`,
        java: `List<Integer> diffWaysToCompute(String expression) {
    List<Integer> answer = new ArrayList<>();
    for (int i = 0; i < expression.length(); i++) {
        char op = expression.charAt(i);
        if (op != '+' && op != '-' && op != '*') continue;
        List<Integer> left = diffWaysToCompute(expression.substring(0, i));
        List<Integer> right = diffWaysToCompute(expression.substring(i + 1));
        for (int a : left) {
            for (int b : right) answer.add(op == '+' ? a + b : op == '-' ? a - b : a * b);
        }
    }
    if (answer.isEmpty()) answer.add(Integer.parseInt(expression));
    return answer;
}`,
        javascript: `function diffWaysToCompute(expression) {
  const answer = [];
  for (let i = 0; i < expression.length; i++) {
    const op = expression[i];
    if (!'+-*'.includes(op)) continue;
    const left = diffWaysToCompute(expression.slice(0, i));
    const right = diffWaysToCompute(expression.slice(i + 1));
    for (const a of left) {
      for (const b of right) answer.push(op === '+' ? a + b : op === '-' ? a - b : a * b);
    }
  }
  return answer.length ? answer : [Number(expression)];
}`,
      },
    },
    {
      name: '區間 DP 共用子式結果',
      idea: '先算短子式，長子式的每個切點組合已算好的左右結果。',
      steps: ['拆出數字與運算子。', '單一數字區間只有一個結果。', '區間長度由 2 增加到全部長度。', '枚舉切點，合併左右每個結果。'],
      figure: { title: 'expression = "2*3-4*5"', steps: G },
      complexity: { time: 'O(n³ + 輸出組合數)', space: 'O(n² + 輸出數)', why: '每個區間與切點處理一次，但必須產生所有結果。' },
      verdict: '避免同一子式重算；輸出本身仍可能是指數級。',
      code: {
        python: `def diffWaysToCompute(expression):
    import re
    numbers = list(map(int, re.split(r'[+*-]', expression)))
    ops = re.findall(r'[+*-]', expression)
    n = len(numbers)
    dp = [[[] for _ in range(n)] for _ in range(n)]
    for i, value in enumerate(numbers):
        dp[i][i] = [value]
    for length in range(2, n + 1):
        for left in range(n - length + 1):
            right = left + length - 1
            for mid in range(left, right):
                for a in dp[left][mid]:
                    for b in dp[mid + 1][right]:
                        op = ops[mid]
                        dp[left][right].append(a + b if op == '+' else a - b if op == '-' else a * b)  # 左右組合
    return dp[0][n - 1]`,
        c: `typedef struct { int *data; int size; int cap; } Vec241;

static void add241(Vec241 *v, int x) {
    if (v->size == v->cap) {
        v->cap = v->cap ? v->cap * 2 : 8;
        v->data = realloc(v->data, v->cap * sizeof(int));
    }
    v->data[v->size++] = x;
}

int *diffWaysToCompute(char *expression, int *returnSize) {
    int numbers[16], n = 0;
    char ops[16];
    for (int i = 0; expression[i]; ) {
        numbers[n++] = atoi(expression + i);
        while (expression[i] >= '0' && expression[i] <= '9') i++;
        if (expression[i]) ops[n - 1] = expression[i++];
    }
    Vec241 **dp = malloc(n * sizeof(Vec241 *));
    for (int i = 0; i < n; i++) dp[i] = calloc(n, sizeof(Vec241));
    for (int i = 0; i < n; i++) add241(&dp[i][i], numbers[i]);
    for (int length = 2; length <= n; length++) {
        for (int left = 0; left + length <= n; left++) {
            int right = left + length - 1;
            for (int mid = left; mid < right; mid++) {
                Vec241 a = dp[left][mid], b = dp[mid + 1][right];
                for (int x = 0; x < a.size; x++) {
                    for (int y = 0; y < b.size; y++) {
                        char op = ops[mid];
                        int value = op == '+' ? a.data[x] + b.data[y] : op == '-' ? a.data[x] - b.data[y] : a.data[x] * b.data[y];
                        add241(&dp[left][right], value);
                    }
                }
            }
        }
    }
    Vec241 answer = dp[0][n - 1];
    for (int i = 0; i < n; i++) {
        for (int j = i; j < n; j++) {
            if (i != 0 || j != n - 1) free(dp[i][j].data);
        }
        free(dp[i]);
    }
    free(dp);
    *returnSize = answer.size;
    return answer.data;
}`,
        cpp: `vector<int> diffWaysToCompute(string expression) {
    vector<int> numbers;
    vector<char> ops;
    for (int i = 0; i < (int)expression.size(); ) {
        int value = 0;
        while (i < (int)expression.size() && isdigit(expression[i])) value = value * 10 + expression[i++] - '0';
        numbers.push_back(value);
        if (i < (int)expression.size()) ops.push_back(expression[i++]);
    }
    int n = numbers.size();
    vector<vector<vector<int>>> dp(n, vector<vector<int>>(n));
    for (int i = 0; i < n; i++) dp[i][i].push_back(numbers[i]);
    for (int length = 2; length <= n; length++) {
        for (int left = 0; left + length <= n; left++) {
            int right = left + length - 1;
            for (int mid = left; mid < right; mid++) {
                for (int a : dp[left][mid]) {
                    for (int b : dp[mid + 1][right]) {
                        char op = ops[mid];
                        dp[left][right].push_back(op == '+' ? a + b : op == '-' ? a - b : a * b);
                    }
                }
            }
        }
    }
    return dp[0][n - 1];
}`,
        java: `List<Integer> diffWaysToCompute(String expression) {
    List<Integer> numbers = new ArrayList<>();
    List<Character> ops = new ArrayList<>();
    for (int i = 0; i < expression.length(); ) {
        int value = 0;
        while (i < expression.length() && Character.isDigit(expression.charAt(i))) {
            value = value * 10 + expression.charAt(i++) - '0';
        }
        numbers.add(value);
        if (i < expression.length()) ops.add(expression.charAt(i++));
    }
    int n = numbers.size();
    List<Integer>[][] dp = new ArrayList[n][n];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) dp[i][j] = new ArrayList<>();
        dp[i][i].add(numbers.get(i));
    }
    for (int length = 2; length <= n; length++) {
        for (int left = 0; left + length <= n; left++) {
            int right = left + length - 1;
            for (int mid = left; mid < right; mid++) {
                for (int a : dp[left][mid]) {
                    for (int b : dp[mid + 1][right]) {
                        char op = ops.get(mid);
                        dp[left][right].add(op == '+' ? a + b : op == '-' ? a - b : a * b);
                    }
                }
            }
        }
    }
    return dp[0][n - 1];
}`,
        javascript: `function diffWaysToCompute(expression) {
  const numbers = expression.split(/[+*-]/).map(Number);
  const ops = expression.match(/[+*-]/g) || [];
  const n = numbers.length;
  const dp = Array.from({ length: n }, () => Array.from({ length: n }, () => []));
  for (let i = 0; i < n; i++) dp[i][i].push(numbers[i]);
  for (let length = 2; length <= n; length++) {
    for (let left = 0; left + length <= n; left++) {
      const right = left + length - 1;
      for (let mid = left; mid < right; mid++) {
        for (const a of dp[left][mid]) {
          for (const b of dp[mid + 1][right]) {
            const op = ops[mid];
            dp[left][right].push(op === '+' ? a + b : op === '-' ? a - b : a * b);
          }
        }
      }
    }
  }
  return dp[0][n - 1];
}`,
      },
    },
  ],
  pitfalls: ['相同數值可由不同括號方式產生，不能去重。', '多位數要完整解析，不能把每個字元都當成一個數字。'],
  check: { kind: 'fn', fn: 'diffWaysToCompute', compare: 'sorted', cases: [
    { args: [E], out: [-34, -14, -10, -10, 10] }, { args: ['2-1-1'], out: [0, 2] },
    { args: ['11'], out: [11] },
  ] },
}
