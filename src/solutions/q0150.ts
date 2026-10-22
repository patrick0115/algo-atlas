import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 150. Evaluate Reverse Polish Notation

const TOK = ['4', '13', '5', '/', '+', '3', '-', '2', '*']
const OPS = new Set(['+', '-', '*', '/'])
const calc = (a: number, b: number, op: string) => (op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : Math.trunc(a / b))

function stackFig(): FigStep[] {
  const st: number[] = []
  const out: FigStep[] = [{ note: '逆波蘭表示法:運算子寫在兩個運算元**後面**。由左到右讀,數字就先放進堆疊等著', views: [arr(TOK, { label: 'tokens' }), arr([], { label: '堆疊(右邊是頂端)' })] }]
  TOK.forEach((t, i) => {
    if (!OPS.has(t)) {
      st.push(Number(t))
      out.push({ note: `${t} 是數字 → push`, views: [arr(TOK, { label: 'tokens', highlight: [i], dim: range(0, i - 1) }), arr(st, { label: '堆疊', highlight: [st.length - 1] })] })
      return
    }
    const b = st.pop()!
    const a = st.pop()!
    const r = calc(a, b, t)
    st.push(r)
    out.push({
      note: `${t} 是運算子 → 彈出兩個:先彈出的 ${b} 是**右**運算元、後彈出的 ${a} 是**左**運算元,${a} ${t} ${b} = ${r}${t === '/' ? '(往 0 截斷)' : ''},結果 push 回去`,
      views: [arr(TOK, { label: 'tokens', highlight: [i], dim: range(0, i - 1) }), arr(st, { label: '堆疊', highlight: [st.length - 1] })],
    })
  })
  out.push({ note: `讀完了,堆疊裡剩下的唯一一個數 ${st[0]} 就是答案`, views: [arr(st, { label: '堆疊', done: [0] })] })
  return out
}

function recurFig(): FigStep[] {
  // 從最後一個 token 往前遞迴:最後一個一定是整個式子的運算子
  const out: FigStep[] = [{ note: '換個角度:最後一個 token 一定是「最外層」的運算子。它的右運算元是它前面那一整段子式,左運算元再往前', views: [arr(TOK, { label: 'tokens', highlight: [TOK.length - 1] })] }]
  let pos = TOK.length - 1
  const go = (depth: number): number => {
    const i = pos--
    const t = TOK[i]
    if (!OPS.has(t)) {
      out.push({ note: `${'　'.repeat(depth)}tokens[${i}] = ${t} 是數字,直接回傳`, views: [arr(TOK, { label: 'tokens', highlight: [i], dim: range(i + 1, TOK.length - 1) })] })
      return Number(t)
    }
    out.push({ note: `${'　'.repeat(depth)}tokens[${i}] = ${t} 是運算子 → 先遞迴算它的**右**運算元,再算左運算元`, views: [arr(TOK, { label: 'tokens', highlight: [i], dim: range(i + 1, TOK.length - 1) })] })
    const b = go(depth + 1)
    const a = go(depth + 1)
    const r = calc(a, b, t)
    out.push({ note: `${'　'.repeat(depth)}回到 tokens[${i}] = ${t}:${a} ${t} ${b} = ${r}`, views: [arr(TOK, { label: 'tokens', compare: [i], dim: range(pos + 1, TOK.length - 1).filter((k) => k !== i) })] })
    return r
  }
  const ans = go(0)
  out.push({ note: `答案 = ${ans}。遞迴的呼叫堆疊扮演了方法一裡堆疊的角色`, views: [arr(TOK, { label: 'tokens', done: range(0, TOK.length - 1) })] })
  return out
}

export const q0150: Solution = {
  id: 150,
  plain: '計算一種「運算子寫在後面」的算式,例如 `3 4 +` 就是 3 + 4。讀到數字就先放著,讀到運算子就拿最近放的兩個數來算。',
  statement:
    '給一個**逆波蘭表示法**(後序式)的運算式 `tokens`,算出它的值。運算子只有 `+ - * /`,每個運算子作用在它前面的兩個運算元上;除法是整數除法,**往 0 截斷**(`-7 / 2 = -3`)。保證運算式合法、不會除以 0。',
  examples: [
    { input: 'tokens = ["2","1","+","3","*"]', output: '9', note: '(2 + 1) × 3' },
    { input: 'tokens = ["4","13","5","/","+"]', output: '6', note: '4 + 13 / 5 = 4 + 2' },
  ],
  constraints: [
    '`1 ≤ tokens.length ≤ 10⁴` → O(n) 就好',
    '數字可能是負的(`"-11"`),判斷「是不是運算子」時不能只看第一個字元是不是 `-`',
    '答案和中間結果都在 32 位元整數範圍內',
  ],
  insight: [
    '後序式不需要括號,因為「運算子出現時,它要的兩個運算元都已經算好了」',
    '「最近算好的兩個值」→ 後進先出 → **堆疊**:數字 push,運算子 pop 兩個、算完 push 回去',
    '彈出的順序要注意:先彈出的是**右**運算元。`a − b`、`a / b` 順序錯了答案就錯',
  ],
  approaches: [
    {
      name: '堆疊',
      idea: '由左到右:數字 push;運算子就 pop 出 `b`(右)、`a`(左),把 `a op b` push 回去。最後堆疊裡剩一個數。',
      steps: ['`st = []`', 'token 是數字 → push', 'token 是運算子 → `b = pop()`、`a = pop()`、push `a op b`', '回傳 `st[0]`'],
      figure: { title: 'tokens = ["4","13","5","/","+","3","-","2","*"]', steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個 token 處理一次;堆疊最多放 (n+1)/2 個數。' },
      verdict: '標準解,[[p:stack]]的經典用法。計算機類題目(224、227)都是在這個骨架上多處理括號和優先序。',
      code: {
        python: `def evalRPN(tokens):
    st = []
    for t in tokens:
        if t in '+-*/':                   # 注意 "-11" 不在 '+-*/' 裡,不會誤判
            b = st.pop()                  # 先彈出的是右運算元
            a = st.pop()
            if t == '+':
                st.append(a + b)
            elif t == '-':
                st.append(a - b)
            elif t == '*':
                st.append(a * b)
            else:
                st.append(int(a / b))     # 往 0 截斷;Python 的 // 是往下取整
        else:
            st.append(int(t))
    return st[0]`,
        c: `int evalRPN(char **tokens, int tokensSize) {
    long long *st = malloc(tokensSize * sizeof(long long));
    int top = 0;
    for (int i = 0; i < tokensSize; i++) {
        char *t = tokens[i];
        if (strlen(t) == 1 && strchr("+-*/", t[0])) {
            long long b = st[--top], a = st[--top];
            if (t[0] == '+') st[top++] = a + b;
            else if (t[0] == '-') st[top++] = a - b;
            else if (t[0] == '*') st[top++] = a * b;
            else st[top++] = a / b;           // C 的整數除法本來就往 0 截斷
        } else {
            st[top++] = atoi(t);
        }
    }
    int ans = (int)st[0];
    free(st);
    return ans;
}`,
        cpp: `int evalRPN(vector<string>& tokens) {
    stack<long long> st;
    for (const string& t : tokens) {
        if (t.size() == 1 && string("+-*/").find(t[0]) != string::npos) {
            long long b = st.top(); st.pop();
            long long a = st.top(); st.pop();
            if (t == "+") st.push(a + b);
            else if (t == "-") st.push(a - b);
            else if (t == "*") st.push(a * b);
            else st.push(a / b);
        } else {
            st.push(stoll(t));
        }
    }
    return (int)st.top();
}`,
        java: `int evalRPN(String[] tokens) {
    Deque<Integer> st = new ArrayDeque<>();
    for (String t : tokens) {
        switch (t) {
            case "+" -> st.push(st.pop() + st.pop());
            case "*" -> st.push(st.pop() * st.pop());
            case "-" -> { int b = st.pop(), a = st.pop(); st.push(a - b); }
            case "/" -> { int b = st.pop(), a = st.pop(); st.push(a / b); }
            default -> st.push(Integer.parseInt(t));
        }
    }
    return st.pop();
}`,
        javascript: `function evalRPN(tokens) {
  const st = [];
  for (const t of tokens) {
    if (t === '+' || t === '-' || t === '*' || t === '/') {
      const b = st.pop(), a = st.pop();
      if (t === '+') st.push(a + b);
      else if (t === '-') st.push(a - b);
      else if (t === '*') st.push(a * b);
      else st.push(Math.trunc(a / b));   // 往 0 截斷
    } else {
      st.push(Number(t));
    }
  }
  return st[0];
}`,
      },
    },
    {
      name: '從尾巴遞迴',
      idea: '最後一個 token 是最外層的運算子。遞迴地「從後往前」取:遇到運算子就先算右運算元、再算左運算元;遇到數字直接回傳。',
      steps: ['`pos = n − 1`', '`eval()`:取 `t = tokens[pos]`,`pos -= 1`', '`t` 是數字 → 回傳它', '`t` 是運算子 → `b = eval()`、`a = eval()`,回傳 `a op b`'],
      figure: { title: 'tokens = ["4","13","5","/","+","3","-","2","*"]', steps: recurFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個 token 被取一次。遞迴深度最壞是 n(例如一路都是運算子接數字)。' },
      verdict: '展示「後序式就是一棵運算樹的後序遍歷」:最後一個 token 是根。程式短,但遞迴深度 10⁴ 在 Python 要調高遞迴上限,實務上用堆疊比較穩。',
      code: {
        python: `import sys

def evalRPN(tokens):
    sys.setrecursionlimit(30000)
    pos = len(tokens) - 1

    def ev():
        nonlocal pos
        t = tokens[pos]
        pos -= 1
        if t not in '+-*/':
            return int(t)
        b = ev()                          # 右運算元在比較後面,先取
        a = ev()
        if t == '+':
            return a + b
        if t == '-':
            return a - b
        if t == '*':
            return a * b
        return int(a / b)

    return ev()`,
        c: `static int pos;

static long long ev(char **tokens) {
    char *t = tokens[pos--];
    if (strlen(t) == 1 && strchr("+-*/", t[0])) {
        long long b = ev(tokens);
        long long a = ev(tokens);
        switch (t[0]) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            default:  return a / b;
        }
    }
    return atoi(t);
}

int evalRPN(char **tokens, int tokensSize) {
    pos = tokensSize - 1;
    return (int)ev(tokens);
}`,
        cpp: `int evalRPN(vector<string>& tokens) {
    int pos = tokens.size() - 1;
    function<long long()> ev = [&]() -> long long {
        const string& t = tokens[pos--];
        if (t.size() == 1 && string("+-*/").find(t[0]) != string::npos) {
            long long b = ev();
            long long a = ev();
            if (t == "+") return a + b;
            if (t == "-") return a - b;
            if (t == "*") return a * b;
            return a / b;
        }
        return stoll(t);
    };
    return (int)ev();
}`,
        java: `private int pos;

int evalRPN(String[] tokens) {
    pos = tokens.length - 1;
    return ev(tokens);
}

private int ev(String[] tokens) {
    String t = tokens[pos--];
    switch (t) {
        case "+": { int b = ev(tokens), a = ev(tokens); return a + b; }
        case "-": { int b = ev(tokens), a = ev(tokens); return a - b; }
        case "*": { int b = ev(tokens), a = ev(tokens); return a * b; }
        case "/": { int b = ev(tokens), a = ev(tokens); return a / b; }
        default: return Integer.parseInt(t);
    }
}`,
        javascript: `function evalRPN(tokens) {
  let pos = tokens.length - 1;
  const ev = () => {
    const t = tokens[pos--];
    if (t !== '+' && t !== '-' && t !== '*' && t !== '/') return Number(t);
    const b = ev();
    const a = ev();
    if (t === '+') return a + b;
    if (t === '-') return a - b;
    if (t === '*') return a * b;
    return Math.trunc(a / b);
  };
  return ev();
}`,
      },
    },
  ],
  pitfalls: [
    '運算元順序弄反:先 pop 出來的是**右**運算元,`["4","2","-"]` 是 `4 − 2 = 2` 不是 `−2`',
    'Python 的 `//` 是往負無限大取整(`-7 // 2 = -4`),題目要的是往 0 截斷,要寫 `int(a / b)`',
    '用「第一個字元是不是 `-`」判斷運算子,會把負數 `"-11"` 當成減號',
    'C++ / Java 要比字串內容:Java 用 `equals` 或 `switch`,不能用 `==`',
  ],
  followUp: [
    { q: '如果給的是一般的中序式(有括號、有優先序)?', a: '224 / 227 Basic Calculator:用堆疊處理括號;或先用 Shunting-yard 演算法轉成後序式,再用這題的方法算。' },
  ],
  check: {
    kind: 'fn',
    fn: 'evalRPN',
    cases: [
      { args: [['2', '1', '+', '3', '*']], out: 9 },
      { args: [['4', '13', '5', '/', '+']], out: 6 },
      { args: [['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']], out: 22 },
      { args: [TOK], out: 6 },
      { args: [['-7', '2', '/']], out: -3 },
      { args: [['18']], out: 18 },
    ],
  },
}
