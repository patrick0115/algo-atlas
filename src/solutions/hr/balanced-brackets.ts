import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const sample = '{[()]}'
const mate: Record<string, string> = { ')': '(', ']': '[', '}': '{' }

function reductionFig(): FigStep[] {
  const out: FigStep[] = []
  let s = sample
  while (true) {
    const next = s.replace('()', '').replace('[]', '').replace('{}', '')
    out.push({ note: `這輪從「${s}」刪去相鄰且配對的括號，剩下「${next || '空'}」；${next === s ? '無法再刪，檢查是否為空。' : '繼續找內層配對。'}`, views: [arr(s.split(''), { label: '刪除前' }), arr(next.split(''), { label: '刪除後' })] })
    if (next === s) break
    s = next
  }
  return out
}

function stackFig(): FigStep[] {
  const out: FigStep[] = []
  const stack: string[] = []
  for (let i = 0; i < sample.length; i++) {
    const ch = sample[i]
    if ('([{'.includes(ch)) stack.push(ch)
    else stack.pop()
    out.push({ note: `讀到位置 ${i} 的 ${ch}；${mate[ch] ? `應與 ${mate[ch]} 配對，彈出後` : '開括號入堆疊後'}剩下 ${stack.join('') || '空'}。`, views: [arr(sample.split(''), { label: '括號', highlight: [i], dim: Array.from({ length: i }, (_, k) => k) }), arr(stack, { label: '尚未配對的開括號' })] })
  }
  return out
}

export const hrBalancedBrackets: HrSolution = {
  slug: 'balanced-brackets',
  plain: '像把一疊盒子依序打開；關盒時只能先關最後打開的那一個，種類也必須相同。',
  statement: '輸入一串只含三種開、閉括號的字串。每個閉括號必須對應最近一個尚未關閉、且種類相同的開括號；最後不能留下未關閉括號。符合則輸出 YES，否則 NO。每筆字串獨立判斷。',
  examples: [
    { input: 's = "{[()]}"', output: 'YES', note: '先配對小括號，再配中括號，最後配大括號。' },
    { input: 's = "{[(])}"', output: 'NO', note: '遇到 ] 時，最近尚未關閉的是 (，種類不合。' },
  ],
  constraints: [
    '字串只由 ()、[]、{} 組成 → 不必處理其他符號。',
    '字串可很長且要處理多筆 → 逐字線性掃描比反覆重建字串合適。',
  ],
  insight: [
    '先想最內層：相鄰的 ()、[]、{} 可以直接刪掉；若最後能刪空就合法。',
    '反覆刪除會一直掃描並建立新字串；真正重要的是還沒配對的開括號。',
    '閉括號一定配最近的開括號，正好是 [[p:stack]] 的後進先出順序；遇到種類不合可立刻回傳 NO。',
  ],
  approaches: [
    {
      name: '反覆刪除相鄰配對',
      idea: '持續消掉最內層配對，直到字串不再變短。',
      steps: ['將目前字串中的 ()、[]、{} 刪除。', '若這輪有刪除，就再掃描一次。', '若無法再刪，字串為空才回傳 YES。'],
      figure: { title: 's = "{[()]}"', steps: reductionFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每輪掃描 O(n)，巢狀括號可能只消掉一層，共 O(n) 輪；替換會建立新字串。' },
      verdict: '容易觀察最內層，但深度大時反覆掃描昂貴。',
      code: {
        python: `def isBalanced(s):
    while True:
        next_s = s.replace('()', '').replace('[]', '').replace('{}', '')
        if next_s == s:
            return 'YES' if not s else 'NO'
        s = next_s  # 每輪刪去已配對的最內層`,
        c: `char* isBalanced(char* s) {
    int n = strlen(s);
    char* work = malloc(n + 1);
    strcpy(work, s);
    while (1) {
        int len = 0, changed = 0;
        for (int i = 0; i < n; i++) {
            char a = work[i];
            char b = i + 1 < n ? work[i + 1] : 0;
            if ((a == '(' && b == ')') || (a == '[' && b == ']') || (a == '{' && b == '}')) {
                i++;
                changed = 1;
            } else {
                work[len++] = a;
            }
        }
        n = len;
        work[n] = 0;
        if (!changed) {
            char* answer = n == 0 ? "YES" : "NO";
            free(work);
            return answer;
        }
    }
}`,
        cpp: `string isBalanced(string s) {
    while (true) {
        string next;
        for (size_t i = 0; i < s.size(); i++) {
            char a = s[i];
            char b = i + 1 < s.size() ? s[i + 1] : 0;
            if ((a == '(' && b == ')') || (a == '[' && b == ']') || (a == '{' && b == '}')) i++;
            else next.push_back(a);
        }
        if (next == s) return s.empty() ? "YES" : "NO";
        s = next;
    }
}`,
        java: `public static String isBalanced(String s) {
    while (true) {
        String next = s.replace("()", "").replace("[]", "").replace("{}", "");
        if (next.equals(s)) return s.isEmpty() ? "YES" : "NO";
        s = next;
    }
}`,
        javascript: `function isBalanced(s) {
  while (true) {
    const next = s.replaceAll('()', '').replaceAll('[]', '').replaceAll('{}', '');
    if (next === s) return s.length === 0 ? 'YES' : 'NO';
    s = next;
  }
}`,
      },
    },
    {
      name: '開括號堆疊',
      idea: '只保留尚未配對的開括號，閉括號必須吻合堆疊頂端。',
      steps: ['建立空堆疊與閉括號到開括號的對照。', '開括號直接入堆疊。', '閉括號時彈出頂端；若為空或種類不合，立即回傳 NO。', '走完後堆疊為空才回傳 YES。'],
      figure: { title: 's = "{[()]}"', steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個括號最多入堆疊與出堆疊各一次；最壞全是開括號。' },
      verdict: '一次掃描即可，並能在第一個錯誤處提早停止。',
      code: {
        python: `def isBalanced(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif not stack or stack.pop() != pairs[ch]:
            return 'NO'  # 閉括號必須配最近的開括號
    return 'YES' if not stack else 'NO'`,
        c: `char* isBalanced(char* s) {
    int n = strlen(s), top = 0;
    char* stack = malloc(n + 1);
    for (int i = 0; i < n; i++) {
        char ch = s[i];
        if (ch == '(' || ch == '[' || ch == '{') {
            stack[top++] = ch;
        } else {
            if (!top) {
                free(stack);
                return "NO";
            }
            char open = stack[--top];
            if (!((open == '(' && ch == ')') || (open == '[' && ch == ']') ||
                  (open == '{' && ch == '}'))) {
                free(stack);
                return "NO";
            }
        }
    }
    free(stack);
    return top == 0 ? "YES" : "NO";
}`,
        cpp: `string isBalanced(string s) {
    string stack;
    for (char ch : s) {
        if (ch == '(' || ch == '[' || ch == '{') stack.push_back(ch);
        else {
            if (stack.empty()) return "NO";
            char open = stack.back();
            stack.pop_back();
            if (!((open == '(' && ch == ')') || (open == '[' && ch == ']') ||
                  (open == '{' && ch == '}'))) return "NO";
        }
    }
    return stack.empty() ? "YES" : "NO";
}`,
        java: `public static String isBalanced(String s) {
    java.util.ArrayDeque<Character> stack = new java.util.ArrayDeque<>();
    for (char ch : s.toCharArray()) {
        if (ch == '(' || ch == '[' || ch == '{') stack.push(ch);
        else {
            if (stack.isEmpty()) return "NO";
            char open = stack.pop();
            if (!((open == '(' && ch == ')') || (open == '[' && ch == ']') ||
                  (open == '{' && ch == '}'))) return "NO";
        }
    }
    return stack.isEmpty() ? "YES" : "NO";
}`,
        javascript: `function isBalanced(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if ('([{'.includes(ch)) stack.push(ch);
    else if (stack.pop() !== pairs[ch]) return 'NO';
  }
  return stack.length === 0 ? 'YES' : 'NO';
}`,
      },
    },
  ],
  pitfalls: [
    '只計算開、閉數量會把 ([)] 誤判合法；必須確認巢狀順序。',
    '遇到閉括號時堆疊可能已空，不能直接讀頂端。',
    '掃描結束仍有開括號，也必須回傳 NO。',
  ],
  check: {
    kind: 'fn', fn: 'isBalanced', cases: [
      { args: ['{[()]}'], out: 'YES' },
      { args: ['{[(])}'], out: 'NO' },
      { args: ['()'], out: 'YES' },
      { args: [')('], out: 'NO' },
      { args: ['((('], out: 'NO' },
      { args: ['[]{}()'], out: 'YES' },
    ],
  },
}
