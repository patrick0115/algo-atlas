import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 227. Basic Calculator II
const S = '3+2*2'

export const q0227: Solution = {
  id: 227,
  plain: '算一個只有加減乘除的算式。乘除必須先做，除法的小數部分直接截掉。',
  statement: '給只含非負整數、空白與 +、−、*、/ 的合法字串 s，按照一般乘除優先於加減的規則求值；整數除法向 0 截斷。',
  examples: [
    { input: 's = "3+2*2"', output: '7' },
    { input: 's = " 3/2 "', output: '1' },
    { input: 's = " 3+5 / 2 "', output: '5' },
  ],
  constraints: ['1 ≤ s.length ≤ 3×10⁵；算式合法，中間計算結果都可放入 32 位元有號整數。'],
  insight: ['掃到一個新運算子時，前一個數字才讀完整，應執行前一個運算子。', '乘除只影響最近的一個加減項；可以用堆疊保存項目，也可以只保存目前這一項。'],
  approaches: [
    {
      name: '項目堆疊',
      idea: '遇到 +、− 就把帶正負號的數放入堆疊；遇到 *、/ 就改寫堆疊頂端。',
      steps: ['累積當前數字 num；跳過空白。', '遇到運算子或字串結束，按照上一個運算子處理 num。', '+、− 推入正負 num；*、/ 取出並計算堆疊頂端。', '最後把堆疊裡的項目相加。'],
      figure: { title: 's = 3+2*2', steps: [
        { note: '先讀到 3；遇到 + 時完成第一項，推入 3。', views: [arr([3], { label: '項目堆疊', done: [0] })] },
        { note: '讀到 2；遇到 * 時按上一個 + 處理，推入 2。', views: [arr([3, 2], { label: '項目堆疊', highlight: [1] })] },
        { note: '最後讀到 2；按 * 把頂端 2 改成 2×2 = 4。', views: [arr([3, 4], { label: '項目堆疊', highlight: [1] })] },
        { note: '堆疊項目相加，3+4 = 7；乘法已先完成。', views: [arr([3, 4], { label: '相加得到 7', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個字元掃一次；最多保存 O(n) 個加減項。' },
      verdict: '清楚呈現乘除先合併、加減最後相加的優先順序。',
      code: {
        python: `def calculate(s):
    stack = []
    num = 0
    op = '+'
    for i, ch in enumerate(s):
        if ch.isdigit():
            num = num * 10 + int(ch)
        if ch in '+-*/' or i == len(s) - 1:
            if op == '+':
                stack.append(num)
            elif op == '-':
                stack.append(-num)
            elif op == '*':
                stack.append(stack.pop() * num)  # 乘除立即併入上一項
            else:
                last = stack.pop()
                stack.append((1 if last >= 0 else -1) * (abs(last) // num))
            op, num = ch, 0
    return sum(stack)`,
        c: `int calculate(char *s) {
    int n = strlen(s);
    int *stack = malloc((n + 1) * sizeof(int));
    int top = 0;
    int num = 0;
    char op = '+';
    for (int i = 0; i <= n; i++) {
        char ch = i == n ? '+' : s[i];
        if (ch >= '0' && ch <= '9') {
            num = num * 10 + ch - '0';
        }
        if (ch == '+' || ch == '-' || ch == '*' || ch == '/') {
            if (op == '+') {
                stack[top++] = num;
            } else if (op == '-') {
                stack[top++] = -num;
            } else if (op == '*') {
                stack[top - 1] *= num;
            } else {
                stack[top - 1] /= num;
            }
            op = ch;
            num = 0;
        }
    }
    int answer = 0;
    for (int i = 0; i < top; i++) {
        answer += stack[i];
    }
    free(stack);
    return answer;
}`,
        cpp: `int calculate(string s) {
    vector<int> stack;
    int num = 0;
    char op = '+';
    for (int i = 0; i <= (int)s.size(); i++) {
        char ch = i == (int)s.size() ? '+' : s[i];
        if (isdigit(ch)) {
            num = num * 10 + ch - '0';
        }
        if (ch == '+' || ch == '-' || ch == '*' || ch == '/') {
            if (op == '+') {
                stack.push_back(num);
            } else if (op == '-') {
                stack.push_back(-num);
            } else if (op == '*') {
                stack.back() *= num;
            } else {
                stack.back() /= num;
            }
            op = ch;
            num = 0;
        }
    }
    return accumulate(stack.begin(), stack.end(), 0);
}`,
        java: `int calculate(String s) {
    Deque<Integer> stack = new ArrayDeque<>();
    int num = 0;
    char op = '+';
    for (int i = 0; i <= s.length(); i++) {
        char ch = i == s.length() ? '+' : s.charAt(i);
        if (Character.isDigit(ch)) {
            num = num * 10 + ch - '0';
        }
        if (ch == '+' || ch == '-' || ch == '*' || ch == '/') {
            if (op == '+') {
                stack.push(num);
            } else if (op == '-') {
                stack.push(-num);
            } else if (op == '*') {
                stack.push(stack.pop() * num);
            } else {
                stack.push(stack.pop() / num);
            }
            op = ch;
            num = 0;
        }
    }
    int answer = 0;
    for (int value : stack) {
        answer += value;
    }
    return answer;
}`,
        javascript: `function calculate(s) {
  const stack = [];
  let num = 0;
  let op = '+';
  for (let i = 0; i <= s.length; i++) {
    const ch = i === s.length ? '+' : s[i];
    if (ch >= '0' && ch <= '9') {
      num = num * 10 + Number(ch);
    }
    if ('+-*/'.includes(ch)) {
      if (op === '+') {
        stack.push(num);
      } else if (op === '-') {
        stack.push(-num);
      } else if (op === '*') {
        stack.push(stack.pop() * num);
      } else {
        stack.push(Math.trunc(stack.pop() / num));
      }
      op = ch;
      num = 0;
    }
  }
  return stack.reduce((sum, value) => sum + value, 0);
}`,
      },
    },
    {
      name: '只保存上一項',
      idea: '保留已完成項目的總和 total 與還可能被乘除改寫的 last；遇到加減才把 last 結算。',
      steps: ['讀數字時累積 num。', '依前一個運算子更新 last；若是 + 或 −，先把舊 last 加入 total。', '字串讀完，把最後的 last 加到 total。'],
      figure: { title: 's = 3+2*2', steps: [
        { note: '讀完 3，按最初的 + 處理：total = 0、last = 3。', views: [arr([0, 3], { label: 'total / last', highlight: [1] })] },
        { note: '讀完 2，按 + 處理：把 3 結算進 total，新 last = 2。', views: [arr([3, 2], { label: 'total / last', highlight: [0, 1] })] },
        { note: '最後的 2 按 * 處理：last = 2×2 = 4，total 仍是 3。', views: [arr([3, 4], { label: 'total / last', highlight: [1] })] },
        { note: '把尚未結算的 last 加上去，3+4 = 7。', views: [arr([7], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只保存數字、運算子、總和與上一項。' },
      verdict: '把堆疊壓縮為一個尚未結算的項目。',
      code: {
        python: `def calculate(s):
    total = last = num = 0
    op = '+'
    for i, ch in enumerate(s):
        if ch.isdigit():
            num = num * 10 + int(ch)
        if ch in '+-*/' or i == len(s) - 1:
            if op == '+':
                total, last = total + last, num  # 舊項結算
            elif op == '-':
                total, last = total + last, -num
            elif op == '*':
                last *= num
            else:
                last = (1 if last >= 0 else -1) * (abs(last) // num)
            op, num = ch, 0
    return total + last`,
        c: `int calculate(char *s) {
    int n = strlen(s);
    int total = 0;
    int last = 0;
    int num = 0;
    char op = '+';
    for (int i = 0; i <= n; i++) {
        char ch = i == n ? '+' : s[i];
        if (ch >= '0' && ch <= '9') {
            num = num * 10 + ch - '0';
        }
        if (ch == '+' || ch == '-' || ch == '*' || ch == '/') {
            if (op == '+' || op == '-') {
                total += last;
                last = op == '+' ? num : -num;
            } else if (op == '*') {
                last *= num;
            } else {
                last /= num;
            }
            op = ch;
            num = 0;
        }
    }
    return total + last;
}`,
        cpp: `int calculate(string s) {
    int total = 0;
    int last = 0;
    int num = 0;
    char op = '+';
    for (int i = 0; i <= (int)s.size(); i++) {
        char ch = i == (int)s.size() ? '+' : s[i];
        if (isdigit(ch)) {
            num = num * 10 + ch - '0';
        }
        if (ch == '+' || ch == '-' || ch == '*' || ch == '/') {
            if (op == '+' || op == '-') {
                total += last;
                last = op == '+' ? num : -num;
            } else if (op == '*') {
                last *= num;
            } else {
                last /= num;
            }
            op = ch;
            num = 0;
        }
    }
    return total + last;
}`,
        java: `int calculate(String s) {
    int total = 0;
    int last = 0;
    int num = 0;
    char op = '+';
    for (int i = 0; i <= s.length(); i++) {
        char ch = i == s.length() ? '+' : s.charAt(i);
        if (Character.isDigit(ch)) {
            num = num * 10 + ch - '0';
        }
        if (ch == '+' || ch == '-' || ch == '*' || ch == '/') {
            if (op == '+' || op == '-') {
                total += last;
                last = op == '+' ? num : -num;
            } else if (op == '*') {
                last *= num;
            } else {
                last /= num;
            }
            op = ch;
            num = 0;
        }
    }
    return total + last;
}`,
        javascript: `function calculate(s) {
  let total = 0;
  let last = 0;
  let num = 0;
  let op = '+';
  for (let i = 0; i <= s.length; i++) {
    const ch = i === s.length ? '+' : s[i];
    if (ch >= '0' && ch <= '9') {
      num = num * 10 + Number(ch);
    }
    if ('+-*/'.includes(ch)) {
      if (op === '+' || op === '-') {
        total += last;
        last = op === '+' ? num : -num;
      } else if (op === '*') {
        last *= num;
      } else {
        last = Math.trunc(last / num);
      }
      op = ch;
      num = 0;
    }
  }
  return total + last;
}`,
      },
    },
  ],
  pitfalls: ['掃到目前運算子時，要處理的是前一個運算子與剛讀完的數。', '負數除法要向 0 截斷，例如 −3/2 = −1；Python 的 // 會向下取整，不能直接用。', '尾端可能是空白，仍要結算最後一個數字。'],
  check: { kind: 'fn', fn: 'calculate', cases: [
    { args: [S], out: 7 },
    { args: [' 3/2 '], out: 1 },
    { args: [' 3+5 / 2 '], out: 5 },
    { args: ['14-3/2'], out: 13 },
  ] },
}
