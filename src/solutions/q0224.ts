import { arr } from '../engine/helpers'
import type { Solution } from './types'

const S = '1 + (2 - (3 - 4))'

export const q0224: Solution = {
  id: 224,
  plain: '計算包含整數、加減號、空白與括號的算式；括號裡可能還有括號。',
  statement: '給有效字串 s，包含非負整數、`+`、`-`、空白與圓括號，回傳計算結果。減號可以充當一元負號，不能使用 eval。',
  examples: [{ input: 's = "1 + 1"', output: '2' }, { input: 's = " 2-1 + 2 "', output: '3' }, { input: 's = "1 + (2 - (3 - 4))"', output: '4' }],
  constraints: ['字串最長 3×10⁵；括號可以巢狀，最後結果保證符合 32 位元整數。'],
  insight: ['加減同優先級；一層括號內可由左到右累積 `sign × number`。', '遇到左括號，先算裡面再當一個數加入外層。', '也可把括號前的累計值與符號存進 [[p:stack]]，關括號時還原。'],
  approaches: [
    {
      name: '遞迴解析每層括號',
      idea: '解析函式讀到右括號就回傳該層結果；外層將它當數字。',
      steps: ['維持目前層 result、sign 與讀取位置', '數字讀完就乘 sign 加入 result', '左括號遞迴求值並加入', '右括號回傳目前層結果'],
      figure: { title: `s = ${S}`, steps: [
        { note: '外層先讀 1，result=1；遇到 + 後準備加入下一項。', views: [arr([1], { label: '外層累計' })] },
        { note: '進入第一層括號，讀 2，接著看到減號與第二層括號。', views: [arr([1, 2], { label: '外層 / 第一層' })] },
        { note: '第二層算出 3−4=−1，回傳給第一層。', views: [arr([3, -4, -1], { label: '第二層計算', done: [2] })] },
        { note: '第一層算 2−(−1)=3，再回到外層得 1+3=4。', views: [arr([1, 3, 4], { label: '外層計算', done: [2] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(d)', why: '每字元讀一次，d 是括號最大巢狀深度。' },
      verdict: '直接呈現括號的語意；深度極大時要留意遞迴堆疊。',
      code: {
        python: `def calculate(s):
    i = 0

    def parse():
        nonlocal i
        result, sign = 0, 1
        while i < len(s) and s[i] != ')':
            ch = s[i]
            if ch == '+':
                sign = 1
                i += 1
            elif ch == '-':
                sign = -1
                i += 1
            elif ch == '(':
                i += 1
                result += sign * parse()  # 內層結果當一個數
            elif ch.isdigit():
                value = 0
                while i < len(s) and s[i].isdigit():
                    value = value * 10 + int(s[i])
                    i += 1
                result += sign * value
            else:
                i += 1
        if i < len(s) and s[i] == ')':
            i += 1
        return result

    return parse()`,
        c: `static int parse224(const char *s, int *i) {
    int result = 0, sign = 1;
    while (s[*i] && s[*i] != ')') {
        char ch = s[*i];
        if (ch == '+') {
            sign = 1;
            (*i)++;
        } else if (ch == '-') {
            sign = -1;
            (*i)++;
        } else if (ch == '(') {
            (*i)++;
            result += sign * parse224(s, i);
        } else if (ch >= '0' && ch <= '9') {
            int value = 0;
            while (s[*i] >= '0' && s[*i] <= '9') value = value * 10 + s[(*i)++] - '0';
            result += sign * value;
        } else {
            (*i)++;
        }
    }
    if (s[*i] == ')') (*i)++;
    return result;
}

int calculate(char *s) {
    int i = 0;
    return parse224(s, &i);
}`,
        cpp: `int calculate(string s) {
    int i = 0;
    function<int()> parse = [&]() {
        int result = 0, sign = 1;
        while (i < (int)s.size() && s[i] != ')') {
            if (s[i] == '+') {
                sign = 1;
                i++;
            } else if (s[i] == '-') {
                sign = -1;
                i++;
            } else if (s[i] == '(') {
                i++;
                result += sign * parse();
            } else if (isdigit(s[i])) {
                int value = 0;
                while (i < (int)s.size() && isdigit(s[i])) value = value * 10 + s[i++] - '0';
                result += sign * value;
            } else {
                i++;
            }
        }
        if (i < (int)s.size() && s[i] == ')') i++;
        return result;
    };
    return parse();
}`,
        java: `int calculate(String s) {
    int[] i = {0};
    return parse224(s, i);
}

int parse224(String s, int[] i) {
    int result = 0, sign = 1;
    while (i[0] < s.length() && s.charAt(i[0]) != ')') {
        char ch = s.charAt(i[0]);
        if (ch == '+') {
            sign = 1;
            i[0]++;
        } else if (ch == '-') {
            sign = -1;
            i[0]++;
        } else if (ch == '(') {
            i[0]++;
            result += sign * parse224(s, i);
        } else if (Character.isDigit(ch)) {
            int value = 0;
            while (i[0] < s.length() && Character.isDigit(s.charAt(i[0]))) {
                value = value * 10 + s.charAt(i[0]++) - '0';
            }
            result += sign * value;
        } else {
            i[0]++;
        }
    }
    if (i[0] < s.length() && s.charAt(i[0]) == ')') i[0]++;
    return result;
}`,
        javascript: `function calculate(s) {
  let i = 0;
  function parse() {
    let result = 0, sign = 1;
    while (i < s.length && s[i] !== ')') {
      if (s[i] === '+') {
        sign = 1;
        i++;
      } else if (s[i] === '-') {
        sign = -1;
        i++;
      } else if (s[i] === '(') {
        i++;
        result += sign * parse();
      } else if (s[i] >= '0' && s[i] <= '9') {
        let value = 0;
        while (i < s.length && s[i] >= '0' && s[i] <= '9') value = value * 10 + Number(s[i++]);
        result += sign * value;
      } else {
        i++;
      }
    }
    if (i < s.length && s[i] === ')') i++;
    return result;
  }
  return parse();
}`,
      },
    },
    {
      name: '堆疊儲存括號外狀態',
      idea: '左括號前保存外層累計值與運算符號；右括號時合併。',
      steps: ['讀數字時組成多位數', '遇到 + 或 − 時把上一個數加入目前層結果', '遇到左括號時保存外層 result、sign 並清零', '遇到右括號時結算內層，再和外層合併'],
      figure: { title: `s = ${S}`, steps: [
        { note: '讀完 1+ 後，外層累計為 1，下一項符號為正。', views: [arr([1, 1], { label: '外層值 / 符號' })] },
        { note: '遇第一個 (，把外層 (1,+) 壓棧；在新層讀到 2−。', views: [arr(['(1,+)'], { label: '堆疊' }), arr([2, -1], { label: '目前值 / 符號' })] },
        { note: '再入一層，算出 3−4=−1；彈出 (2,−) 得 2−(−1)=3。', views: [arr(['(1,+)'], { label: '堆疊' }), arr([3], { label: '內層結果' })] },
        { note: '再彈出 (1,+)，合併 1+3=4。', views: [arr([4], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(d)', why: '每字元處理一次，堆疊存每層括號狀態。' },
      verdict: '推薦；能處理很深的括號，不依賴函式呼叫深度。',
      code: {
        python: `def calculate(s):
    result, number, sign = 0, 0, 1
    stack = []
    for ch in s:
        if ch.isdigit():
            number = number * 10 + int(ch)
        elif ch in '+-':
            result += sign * number
            number = 0
            sign = 1 if ch == '+' else -1
        elif ch == '(':
            stack.extend([result, sign])  # 保存括號外的值與符號
            result, number, sign = 0, 0, 1
        elif ch == ')':
            result += sign * number
            number = 0
            outer_sign = stack.pop()
            outer_result = stack.pop()
            result = outer_result + outer_sign * result
    return result + sign * number`,
        c: `int calculate(char *s) {
    int n = strlen(s);
    int *stack = malloc((2 * n + 2) * sizeof(int));
    int top = 0, result = 0, number = 0, sign = 1;
    for (int i = 0; i < n; i++) {
        char ch = s[i];
        if (ch >= '0' && ch <= '9') {
            number = number * 10 + ch - '0';
        } else if (ch == '+' || ch == '-') {
            result += sign * number;
            number = 0;
            sign = ch == '+' ? 1 : -1;
        } else if (ch == '(') {
            stack[top++] = result;
            stack[top++] = sign;
            result = number = 0;
            sign = 1;
        } else if (ch == ')') {
            result += sign * number;
            number = 0;
            int outerSign = stack[--top];
            int outerResult = stack[--top];
            result = outerResult + outerSign * result;
        }
    }
    int ans = result + sign * number;
    free(stack);
    return ans;
}`,
        cpp: `int calculate(string s) {
    vector<int> stack;
    int result = 0, number = 0, sign = 1;
    for (char ch : s) {
        if (isdigit(ch)) {
            number = number * 10 + ch - '0';
        } else if (ch == '+' || ch == '-') {
            result += sign * number;
            number = 0;
            sign = ch == '+' ? 1 : -1;
        } else if (ch == '(') {
            stack.push_back(result);
            stack.push_back(sign);
            result = number = 0;
            sign = 1;
        } else if (ch == ')') {
            result += sign * number;
            number = 0;
            int outerSign = stack.back();
            stack.pop_back();
            int outerResult = stack.back();
            stack.pop_back();
            result = outerResult + outerSign * result;
        }
    }
    return result + sign * number;
}`,
        java: `int calculate(String s) {
    Deque<Integer> stack = new ArrayDeque<>();
    int result = 0, number = 0, sign = 1;
    for (char ch : s.toCharArray()) {
        if (Character.isDigit(ch)) {
            number = number * 10 + ch - '0';
        } else if (ch == '+' || ch == '-') {
            result += sign * number;
            number = 0;
            sign = ch == '+' ? 1 : -1;
        } else if (ch == '(') {
            stack.push(result);
            stack.push(sign);
            result = number = 0;
            sign = 1;
        } else if (ch == ')') {
            result += sign * number;
            number = 0;
            int outerSign = stack.pop();
            int outerResult = stack.pop();
            result = outerResult + outerSign * result;
        }
    }
    return result + sign * number;
}`,
        javascript: `function calculate(s) {
  const stack = [];
  let result = 0, number = 0, sign = 1;
  for (const ch of s) {
    if (ch >= '0' && ch <= '9') {
      number = number * 10 + Number(ch);
    } else if (ch === '+' || ch === '-') {
      result += sign * number;
      number = 0;
      sign = ch === '+' ? 1 : -1;
    } else if (ch === '(') {
      stack.push(result, sign);
      result = number = 0;
      sign = 1;
    } else if (ch === ')') {
      result += sign * number;
      number = 0;
      const outerSign = stack.pop(), outerResult = stack.pop();
      result = outerResult + outerSign * result;
    }
  }
  return result + sign * number;
}`,
      },
    },
  ],
  pitfalls: ['數字可有多位，不能逐字元直接相加。', '一元負號如 `-(2+3)` 須視作 0 減去括號結果。', '右括號時先結算內層尚未加入的數字，再和外層狀態合併。'],
  check: { kind: 'fn', fn: 'calculate', cases: [
    { args: ['1 + 1'], out: 2 },
    { args: [' 2-1 + 2 '], out: 3 },
    { args: [S], out: 4 },
    { args: ['-(2+3)'], out: -5 },
    { args: ['1-(-2)'], out: 3 },
  ] },
}
