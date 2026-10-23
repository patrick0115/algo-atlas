import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 682. Baseball Game

const OPS = ['5', '-2', '4', 'C', 'D', '9', '+', '+']

function stackFig(): FigStep[] {
  const st: number[] = []
  const out: FigStep[] = [{ note: '用堆疊記「目前有效的分數」。四種操作都只跟**最上面一兩個**有關,正好是堆疊擅長的', views: [arr(OPS, { label: 'operations' }), arr([], { label: '堆疊' })] }]
  OPS.forEach((op, i) => {
    let note: string
    if (op === 'C') {
      const x = st.pop()
      note = `"C":作廢上一個分數 ${x} → pop`
    } else if (op === 'D') {
      st.push(2 * st[st.length - 1])
      note = `"D":上一個的兩倍 = ${st[st.length - 1]} → push`
    } else if (op === '+') {
      st.push(st[st.length - 1] + st[st.length - 2])
      note = `"+":前兩個相加 ${st[st.length - 3]} + ${st[st.length - 2]} = ${st[st.length - 1]} → push`
    } else {
      st.push(+op)
      note = `數字 ${op} → push`
    }
    out.push({ note, views: [arr(OPS, { label: 'operations', highlight: [i], done: Array.from({ length: i }, (_, k) => k) }), arr([...st], { label: '堆疊(右邊是頂)', highlight: op === 'C' ? [] : [st.length - 1] })] })
  })
  out.push({ note: `全部加起來 = ${st.reduce((a, b) => a + b, 0)}`, views: [arr(st, { label: '最後的堆疊', done: st.map((_, i) => i) })] })
  return out
}

function arrFig(): FigStep[] {
  return [
    { note: '不用堆疊物件:開一個陣列加一個「長度」指標 top。C 就是 top − 1(舊值不用清,之後會被蓋掉)', views: [arr([5, -2, 4, '', ''], { label: '陣列', range: [0, 2], pointers: [{ name: 'top', index: 3 }] })] },
    { note: '"C" 之後 top = 2;"D" 寫到 [2] 變成 −4,top = 3。概念完全一樣,只是自己管理長度', views: [arr([5, -2, -4, '', ''], { label: '陣列', range: [0, 2], highlight: [2], pointers: [{ name: 'top', index: 3 }] })] },
  ]
}

export const q0682: Solution = {
  id: 682,
  plain: '記錄一場奇怪棒球賽的分數。每個操作可能是:一個數字(得這麼多分)、"+"(得分 = 前兩次有效得分的和)、"D"(得分 = 上一次的兩倍)、"C"(上一次的得分作廢)。最後總分是多少?',
  statement: '給字串陣列 `operations`,依序處理:整數 x 記錄新分數 x;`"+"` 記錄前兩個分數之和;`"D"` 記錄前一個分數的兩倍;`"C"` 移除前一個分數。回傳所有分數的總和。保證操作都合法。',
  examples: [
    { input: 'ops = ["5","2","C","D","+"]', output: '30', note: '[5] → [5,2] → [5] → [5,10] → [5,10,15]' },
    { input: 'ops = ["5","-2","4","C","D","9","+","+"]', output: '27' },
    { input: 'ops = ["1","C"]', output: '0' },
  ],
  constraints: ['最多 1000 個操作', '保證 "+" 前至少有兩個分數,"C"、"D" 前至少有一個'],
  insight: ['每個操作只看「最近的」一兩個分數,而且 C 要能撤銷最近的 → 堆疊(後進先出)', '最後把堆疊裡的全部加起來'],
  approaches: [
    {
      name: '堆疊',
      idea: '數字 push;"+" push 前兩個的和;"D" push 兩倍;"C" pop。最後加總。',
      steps: ['`st = []`', '依操作:`C` → pop;`D` → push `2 * st[-1]`;`+` → push `st[-1] + st[-2]`;其他 → push `int(op)`', '回傳 `sum(st)`'],
      figure: { title: `ops = [${OPS.map((o) => `"${o}"`).join(',')}]`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個操作 O(1),堆疊最多 n 個。' },
      verdict: '最推薦,[[p:stack]]的入門題。',
      code: {
        python: `def calPoints(operations):
    st = []
    for op in operations:
        if op == 'C':
            st.pop()                          # 作廢上一個
        elif op == 'D':
            st.append(2 * st[-1])
        elif op == '+':
            st.append(st[-1] + st[-2])
        else:
            st.append(int(op))
    return sum(st)`,
        c: `int calPoints(char **operations, int operationsSize) {
    int *st = malloc(operationsSize * sizeof(int)), top = 0, sum = 0;
    for (int i = 0; i < operationsSize; i++) {
        char *op = operations[i];
        if (!strcmp(op, "C")) top--;
        else if (!strcmp(op, "D")) { st[top] = 2 * st[top - 1]; top++; }
        else if (!strcmp(op, "+")) { st[top] = st[top - 1] + st[top - 2]; top++; }
        else st[top++] = atoi(op);
    }
    for (int i = 0; i < top; i++) sum += st[i];
    free(st);
    return sum;
}`,
        cpp: `int calPoints(vector<string>& operations) {
    vector<int> st;
    for (auto &op : operations) {
        if (op == "C") st.pop_back();
        else if (op == "D") st.push_back(2 * st.back());
        else if (op == "+") st.push_back(st.back() + st[st.size() - 2]);
        else st.push_back(stoi(op));
    }
    return accumulate(st.begin(), st.end(), 0);
}`,
        java: `int calPoints(String[] operations) {
    Deque<Integer> st = new ArrayDeque<>();
    for (String op : operations) {
        switch (op) {
            case "C" -> st.pop();
            case "D" -> st.push(2 * st.peek());
            case "+" -> {
                int a = st.pop(), b = st.peek();
                st.push(a);
                st.push(a + b);
            }
            default -> st.push(Integer.parseInt(op));
        }
    }
    int sum = 0;
    for (int x : st) sum += x;
    return sum;
}`,
        javascript: `function calPoints(operations) {
  const st = [];
  for (const op of operations) {
    if (op === 'C') st.pop();
    else if (op === 'D') st.push(2 * st[st.length - 1]);
    else if (op === '+') st.push(st[st.length - 1] + st[st.length - 2]);
    else st.push(Number(op));
  }
  return st.reduce((a, b) => a + b, 0);
}`,
      },
    },
    {
      name: '陣列 + top 指標(手寫堆疊)',
      idea: '固定大小的陣列配一個 `top`;C 只要 `top −= 1`,不用真的刪除。',
      steps: ['`a = [0] * n`、`top = 0`', '數字 / D / + → 寫到 `a[top]`、`top += 1`;C → `top -= 1`', '回傳 `sum(a[:top])`'],
      figure: { title: `ops = [${OPS.map((o) => `"${o}"`).join(',')}]`, steps: arrFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '同上。' },
      verdict: '堆疊的底層長這樣:陣列 + 長度。C 語言或要極致效能時這樣寫。',
      code: {
        python: `def calPoints(operations):
    a, top = [0] * len(operations), 0
    for op in operations:
        if op == 'C':
            top -= 1                          # 不用清掉,之後會被覆蓋
            continue
        if op == 'D':
            v = 2 * a[top - 1]
        elif op == '+':
            v = a[top - 1] + a[top - 2]
        else:
            v = int(op)
        a[top] = v
        top += 1
    return sum(a[:top])`,
        c: `int calPoints(char **operations, int operationsSize) {
    int a[1000], top = 0, sum = 0;
    for (int i = 0; i < operationsSize; i++) {
        char c = operations[i][0];
        if (c == 'C') { top--; continue; }
        int v = c == 'D' ? 2 * a[top - 1] : c == '+' ? a[top - 1] + a[top - 2] : atoi(operations[i]);
        a[top++] = v;
    }
    for (int i = 0; i < top; i++) sum += a[i];
    return sum;
}`,
        cpp: `int calPoints(vector<string>& operations) {
    vector<int> a(operations.size());
    int top = 0;
    for (auto &op : operations) {
        if (op == "C") { top--; continue; }
        int v = op == "D" ? 2 * a[top - 1] : op == "+" ? a[top - 1] + a[top - 2] : stoi(op);
        a[top++] = v;
    }
    return accumulate(a.begin(), a.begin() + top, 0);
}`,
        java: `int calPoints(String[] operations) {
    int[] a = new int[operations.length];
    int top = 0, sum = 0;
    for (String op : operations) {
        if (op.equals("C")) { top--; continue; }
        int v = op.equals("D") ? 2 * a[top - 1] : op.equals("+") ? a[top - 1] + a[top - 2] : Integer.parseInt(op);
        a[top++] = v;
    }
    for (int i = 0; i < top; i++) sum += a[i];
    return sum;
}`,
        javascript: `function calPoints(operations) {
  const a = new Array(operations.length);
  let top = 0;
  for (const op of operations) {
    if (op === 'C') {
      top--;
      continue;
    }
    const v = op === 'D' ? 2 * a[top - 1] : op === '+' ? a[top - 1] + a[top - 2] : Number(op);
    a[top++] = v; // 先算好再寫:a[top++] = …top… 會先把 top 加 1
  }
  let sum = 0;
  for (let i = 0; i < top; i++) sum += a[i];
  return sum;
}`,
      },
    },
  ],
  pitfalls: ['用 `op[0]` 判斷是不是數字:負數 "-2" 的第一個字是 "-"', '"+" 的時候把前兩個 pop 掉:它們還是有效分數,要留著'],
  check: {
    kind: 'fn',
    fn: 'calPoints',
    cases: [
      { args: [['5', '2', 'C', 'D', '+']], out: 30 },
      { args: [OPS], out: 27 },
      { args: [['1', 'C']], out: 0 },
      { args: [['-3', 'D', '+']], out: -18 },
    ],
  },
}
