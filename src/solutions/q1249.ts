import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 1249. Minimum Remove to Make Valid Parentheses
const S = 'lee(t(c)o)de)'

const CHECK = {
  python: `\n\ndef validCheck(s):
    result = minRemoveToMakeValid(s)
    balance = 0
    for ch in result:
        if ch == '(':
            balance += 1
        elif ch == ')':
            balance -= 1
            if balance < 0:
                return 0
    count = 0
    extra = 0
    for ch in s:
        if ch == '(':
            count += 1
        elif ch == ')':
            if count:
                count -= 1
            else:
                extra += 1
    letters = lambda text: ''.join(ch for ch in text if ch not in '()')
    return int(balance == 0 and len(result) == len(s) - count - extra and letters(result) == letters(s))`,
  c: `\n\nint validCheck(char *s) {
    char *result = minRemoveToMakeValid(s);
    int balance = 0;
    int ok = 1;
    int letters = 0;
    for (int i = 0; result[i]; i++) {
        if (result[i] == '(') {
            balance++;
        } else if (result[i] == ')') {
            balance--;
        } else {
            letters++;
        }
        if (balance < 0) {
            ok = 0;
        }
    }
    int open = 0;
    int extra = 0;
    int originalLetters = 0;
    for (int i = 0; s[i]; i++) {
        if (s[i] == '(') {
            open++;
        } else if (s[i] == ')') {
            if (open) {
                open--;
            } else {
                extra++;
            }
        } else {
            originalLetters++;
        }
    }
    ok = ok && balance == 0 && letters == originalLetters;
    ok = ok && strlen(result) == strlen(s) - open - extra;
    free(result);
    return ok;
}`,
  cpp: `\n\nint validCheck(string s) {
    string result = minRemoveToMakeValid(s);
    int balance = 0;
    int letters = 0;
    for (char ch : result) {
        if (ch == '(') {
            balance++;
        } else if (ch == ')') {
            balance--;
        } else {
            letters++;
        }
        if (balance < 0) {
            return 0;
        }
    }
    int open = 0;
    int extra = 0;
    int originalLetters = 0;
    for (char ch : s) {
        if (ch == '(') {
            open++;
        } else if (ch == ')') {
            if (open) {
                open--;
            } else {
                extra++;
            }
        } else {
            originalLetters++;
        }
    }
    return balance == 0 && letters == originalLetters && result.size() == s.size() - open - extra;
}`,
  java: `\n\nint validCheck(String s) {
    String result = minRemoveToMakeValid(s);
    int balance = 0;
    int letters = 0;
    for (char ch : result.toCharArray()) {
        if (ch == '(') {
            balance++;
        } else if (ch == ')') {
            balance--;
        } else {
            letters++;
        }
        if (balance < 0) {
            return 0;
        }
    }
    int open = 0;
    int extra = 0;
    int originalLetters = 0;
    for (char ch : s.toCharArray()) {
        if (ch == '(') {
            open++;
        } else if (ch == ')') {
            if (open > 0) {
                open--;
            } else {
                extra++;
            }
        } else {
            originalLetters++;
        }
    }
    return balance == 0 && letters == originalLetters && result.length() == s.length() - open - extra ? 1 : 0;
}`,
  javascript: `\n\nfunction validCheck(s) {
  const result = minRemoveToMakeValid(s);
  let balance = 0;
  for (const ch of result) {
    if (ch === '(') {
      balance++;
    } else if (ch === ')') {
      balance--;
    }
    if (balance < 0) {
      return 0;
    }
  }
  let open = 0;
  let extra = 0;
  for (const ch of s) {
    if (ch === '(') {
      open++;
    } else if (ch === ')') {
      if (open) {
        open--;
      } else {
        extra++;
      }
    }
  }
  const letters = text => [...text].filter(ch => ch !== '(' && ch !== ')').join('');
  return balance === 0 && result.length === s.length - open - extra && letters(result) === letters(s) ? 1 : 0;
}`,
}

export const q1249: Solution = {
  id: 1249,
  plain: '句子裡有些括號配不到另一半；用最少次刪除修好括號，字母保留原順序。',
  statement: '給由小寫字母與括號組成的 s，刪除最少括號，使餘下括號全部配對。回傳任一合法結果。',
  examples: [{ input: 's = "lee(t(c)o)de)"', output: '"lee(t(c)o)de"' }, { input: 's = "a)b(c)d"', output: '"ab(c)d"' }],
  constraints: ['1 ≤ s.length ≤ 10⁵；只能刪括號。'],
  insight: ['從左往右時，無左括號可配的 ) 一定得刪。', '最後多出的 ( 也一定得刪。這可用 [[p:stack]] 記錄，或雙向掃描。'],
  approaches: [
    {
      name: '堆疊記未配對索引',
      idea: '把尚未配對的 ( 索引入堆疊；標記所有無法配對的位置，最後重建字串。',
      steps: ['掃描 s，遇 ( 入堆疊。', '遇 ) 時，有 ( 就配對；否則標記刪除。', '剩下的 ( 都標記刪除，輸出未標記字元。'],
      figure: { title: `s = ${S}`, steps: [
        { note: '第一個 ( 等待配對，記下索引 3。', views: [arr([...S], { label: '掃描', highlight: [3] })] },
        { note: '索引 5 的 ( 入堆疊；索引 7 的 ) 先配掉它。', views: [arr([...S], { label: '內層配對', highlight: [5, 7] })] },
        { note: '索引 9 的 ) 配掉索引 3 的 (。', views: [arr([...S], { label: '外層配對', highlight: [3, 9] })] },
        { note: '末尾的 ) 無法配對，標記刪除；其餘保留。', views: [arr([...S], { label: '刪除', dim: [S.length - 1] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '一次掃描加一次重建，儲存索引與標記。' },
      verdict: '每個刪除理由都很清楚。',
      code: {
        python: `def minRemoveToMakeValid(s):
    stack = []
    remove = set()
    for i, ch in enumerate(s):
        if ch == '(':
            stack.append(i)
        elif ch == ')':
            if stack:
                stack.pop()              # 配掉最近的左括號
            else:
                remove.add(i)
    remove.update(stack)
    return ''.join(ch for i, ch in enumerate(s) if i not in remove)${CHECK.python}`,
        c: `char *minRemoveToMakeValid(char *s) {
    int n = strlen(s);
    int *stack = malloc((n + 1) * sizeof(int));
    bool *remove = calloc(n + 1, sizeof(bool));
    int top = 0;
    for (int i = 0; i < n; i++) {
        if (s[i] == '(') {
            stack[top++] = i;
        } else if (s[i] == ')') {
            if (top) {
                top--;
            } else {
                remove[i] = true;
            }
        }
    }
    while (top) {
        remove[stack[--top]] = true;
    }
    char *answer = malloc(n + 1);
    int size = 0;
    for (int i = 0; i < n; i++) {
        if (!remove[i]) {
            answer[size++] = s[i];
        }
    }
    answer[size] = 0;
    free(stack);
    free(remove);
    return answer;
}${CHECK.c}`,
        cpp: `string minRemoveToMakeValid(string s) {
    vector<int> stack;
    vector<bool> remove(s.size());
    for (int i = 0; i < (int)s.size(); i++) {
        if (s[i] == '(') {
            stack.push_back(i);
        } else if (s[i] == ')') {
            if (!stack.empty()) {
                stack.pop_back();
            } else {
                remove[i] = true;
            }
        }
    }
    for (int i : stack) {
        remove[i] = true;
    }
    string answer;
    for (int i = 0; i < (int)s.size(); i++) {
        if (!remove[i]) {
            answer += s[i];
        }
    }
    return answer;
}${CHECK.cpp}`,
        java: `String minRemoveToMakeValid(String s) {
    Deque<Integer> stack = new ArrayDeque<>();
    boolean[] remove = new boolean[s.length()];
    for (int i = 0; i < s.length(); i++) {
        char ch = s.charAt(i);
        if (ch == '(') {
            stack.push(i);
        } else if (ch == ')') {
            if (!stack.isEmpty()) {
                stack.pop();
            } else {
                remove[i] = true;
            }
        }
    }
    while (!stack.isEmpty()) {
        remove[stack.pop()] = true;
    }
    StringBuilder answer = new StringBuilder();
    for (int i = 0; i < s.length(); i++) {
        if (!remove[i]) {
            answer.append(s.charAt(i));
        }
    }
    return answer.toString();
}${CHECK.java}`,
        javascript: `function minRemoveToMakeValid(s) {
  const stack = [];
  const remove = new Set();
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else if (s[i] === ')') {
      if (stack.length) {
        stack.pop();
      } else {
        remove.add(i);
      }
    }
  }
  for (const i of stack) {
    remove.add(i);
  }
  return [...s].filter((_, i) => !remove.has(i)).join('');
}${CHECK.javascript}`,
      },
    },
    {
      name: '左右各掃一次',
      idea: '正向刪多餘的 )，反向刪多餘的 (。',
      steps: ['正向略過無法配對的 )。', '反向略過無法配對的 (。', '把反向收集的字串翻回正序。'],
      figure: { title: `s = ${S}`, steps: [
        { note: '正向累積未配對的 (，內層與外層的 ) 都可配對。', views: [arr([...S], { label: '正向', highlight: [7, 9] })] },
        { note: '末尾的 ) 遇到計數 0，刪掉它。', views: [arr([...S], { label: '多餘右括號', dim: [S.length - 1] })] },
        { note: '反向掃描剩餘字串，先遇到兩個 )，可供左括號配對。', views: [arr([...S.slice(0, -1)], { label: '反向', highlight: [7, 9] })] },
        { note: '兩個 ( 都有對應的 )，最後結果是 lee(t(c)o)de。', views: [arr([...S.slice(0, -1)], { label: '結果', done: [3, 5, 7, 9] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '兩遍掃描，建立中間字串。' },
      verdict: '不需要堆疊索引，對稱性稍難理解。',
      code: {
        python: `def minRemoveToMakeValid(s):
    first = []
    open_count = 0
    for ch in s:
        if ch == '(':
            open_count += 1
        elif ch == ')':
            if open_count == 0:
                continue                 # 刪多餘右括號
            open_count -= 1
        first.append(ch)
    second = []
    close_count = 0
    for ch in reversed(first):
        if ch == ')':
            close_count += 1
        elif ch == '(':
            if close_count == 0:
                continue                 # 刪多餘左括號
            close_count -= 1
        second.append(ch)
    return ''.join(reversed(second))${CHECK.python}`,
        c: `char *minRemoveToMakeValid(char *s) {
    int n = strlen(s);
    char *first = malloc(n + 1);
    int size = 0;
    int open = 0;
    for (int i = 0; i < n; i++) {
        if (s[i] == '(') {
            open++;
        } else if (s[i] == ')') {
            if (!open) {
                continue;
            }
            open--;
        }
        first[size++] = s[i];
    }
    char *answer = malloc(n + 1);
    int used = 0;
    int close = 0;
    for (int i = size - 1; i >= 0; i--) {
        if (first[i] == ')') {
            close++;
        } else if (first[i] == '(') {
            if (!close) {
                continue;
            }
            close--;
        }
        answer[used++] = first[i];
    }
    for (int i = 0; i < used / 2; i++) {
        char temp = answer[i];
        answer[i] = answer[used - 1 - i];
        answer[used - 1 - i] = temp;
    }
    answer[used] = 0;
    free(first);
    return answer;
}${CHECK.c}`,
        cpp: `string minRemoveToMakeValid(string s) {
    string first;
    int open = 0;
    for (char ch : s) {
        if (ch == '(') {
            open++;
        } else if (ch == ')') {
            if (!open) {
                continue;
            }
            open--;
        }
        first += ch;
    }
    string second;
    int close = 0;
    for (int i = (int)first.size() - 1; i >= 0; i--) {
        char ch = first[i];
        if (ch == ')') {
            close++;
        } else if (ch == '(') {
            if (!close) {
                continue;
            }
            close--;
        }
        second += ch;
    }
    reverse(second.begin(), second.end());
    return second;
}${CHECK.cpp}`,
        java: `String minRemoveToMakeValid(String s) {
    StringBuilder first = new StringBuilder();
    int open = 0;
    for (char ch : s.toCharArray()) {
        if (ch == '(') {
            open++;
        } else if (ch == ')') {
            if (open == 0) {
                continue;
            }
            open--;
        }
        first.append(ch);
    }
    StringBuilder second = new StringBuilder();
    int close = 0;
    for (int i = first.length() - 1; i >= 0; i--) {
        char ch = first.charAt(i);
        if (ch == ')') {
            close++;
        } else if (ch == '(') {
            if (close == 0) {
                continue;
            }
            close--;
        }
        second.append(ch);
    }
    return second.reverse().toString();
}${CHECK.java}`,
        javascript: `function minRemoveToMakeValid(s) {
  const first = [];
  let open = 0;
  for (const ch of s) {
    if (ch === '(') {
      open++;
    } else if (ch === ')') {
      if (!open) {
        continue;
      }
      open--;
    }
    first.push(ch);
  }
  const second = [];
  let close = 0;
  for (let i = first.length - 1; i >= 0; i--) {
    const ch = first[i];
    if (ch === ')') {
      close++;
    } else if (ch === '(') {
      if (!close) {
        continue;
      }
      close--;
    }
    second.push(ch);
  }
  return second.reverse().join('');
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['答案不唯一，檢查需驗證括號合法、字母順序與最少刪除數。', '正向掃完仍可能剩多餘左括號。'],
  check: { kind: 'fn', fn: 'validCheck', cases: [
    { args: [S], out: 1 }, { args: ['a)b(c)d'], out: 1 }, { args: ['))(('], out: 1 }, { args: ['abc'], out: 1 },
  ] },
}
