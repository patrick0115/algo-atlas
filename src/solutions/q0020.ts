import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 20. Valid Parentheses

const S = '{[()()]}('

function replaceFig(): FigStep[] {
  let s = S
  const out: FigStep[] = [{ note: '合法的括號字串裡,一定有一對「緊鄰」的 ()、[] 或 {}。把它刪掉,剩下的還是合法的', views: [arr([...s], { label: 's' })] }]
  for (let round = 1; ; round++) {
    const next = s.replace(/\(\)|\[\]|\{\}/g, '')
    if (next === s) break
    const hits: number[] = []
    for (const m of s.matchAll(/\(\)|\[\]|\{\}/g)) hits.push(m.index!, m.index! + 1)
    out.push({ note: `第 ${round} 輪:找到緊鄰的配對(黃色),全部刪掉`, views: [arr([...s], { label: 's', highlight: hits })] })
    s = next
    out.push({ note: `刪完剩下 "${s}"`, views: [arr(s ? [...s] : ['(空)'], { label: 's' })] })
  }
  out.push({ note: s ? `再也找不到緊鄰的配對,但還剩 "${s}" → 不合法` : '刪到變成空字串 → 合法', views: [arr(s ? [...s] : ['(空)'], { label: 's', highlight: s ? range(0, s.length - 1) : [] })] })
  return out
}

function stackFig(): FigStep[] {
  const pair: Record<string, string> = { ')': '(', ']': '[', '}': '{' }
  const st: string[] = []
  const chars = [...S]
  const view = (i: number, opt: Parameters<typeof arr>[1] = {}) => [arr(chars, { label: 's', highlight: [i], dim: range(0, i - 1), ...opt }), arr(st, { label: '堆疊(右邊是頂端)', highlight: st.length ? [st.length - 1] : [] })]
  const out: FigStep[] = [{ note: '左括號放進堆疊;右括號要和堆疊**頂端**(最近一個還沒配對的左括號)配對', views: [arr(chars, { label: 's' }), arr([], { label: '堆疊' })] }]
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    if (!pair[c]) {
      st.push(c)
      out.push({ note: `${c} 是左括號 → push`, views: view(i) })
      continue
    }
    const top = st.at(-1)
    if (top !== pair[c]) {
      out.push({ note: `${c} 是右括號,但頂端是 ${top ?? '(空)'},配不起來 → false`, views: view(i) })
      return out
    }
    st.pop()
    out.push({ note: `${c} 和頂端的 ${top} 配對成功 → pop`, views: view(i) })
  }
  out.push({ note: st.length ? `字串走完了,堆疊裡還剩 ${st.join('')} 沒有被配對 → false` : '字串走完、堆疊是空的 → true', views: [arr(chars, { label: 's', dim: range(0, chars.length - 1) }), arr(st, { label: '堆疊', highlight: range(0, st.length - 1) })] })
  return out
}

export const q0020: Solution = {
  id: 20,
  statement: '給一個只含 `()[]{}` 的字串 `s`,判斷括號是否正確配對:每個左括號都要被**同種類**的右括號關閉,而且關閉的順序要正確(後開的先關)。',
  examples: [
    { input: 's = "()[]{}"', output: 'true' },
    { input: 's = "(]"', output: 'false', note: '種類不同' },
    { input: 's = "([)]"', output: 'false', note: '數量對,但順序錯:[ 還沒關,) 就要關 (' },
    { input: 's = "{[]}"', output: 'true' },
  ],
  constraints: ['`1 ≤ s.length ≤ 10⁴` → O(n²) 是 1 億,勉強;O(n) 最好', '只有六種字元 → 長度是奇數一定不合法,可以先擋'],
  insight: [
    '只數左右括號的數量不夠:`"([)]"` 數量都對,但順序錯',
    '「後開的要先關」——遇到右括號時,它必須配對**最近一個還沒關的左括號**。「最近的」= 最後放進去的 → **堆疊**(後進先出)',
    '另一個角度:合法字串裡一定有一對緊鄰的配對(最內層),刪掉它不影響合法性。一直刪,最後變空就合法 —— 但每輪都要重掃字串,O(n²)',
  ],
  approaches: [
    {
      name: '反覆刪除緊鄰的配對',
      idea: '一直把 `()`、`[]`、`{}` 刪掉,直到刪不動。最後是空字串就合法。',
      steps: ['重複:把字串裡所有 `()`、`[]`、`{}` 刪掉', '一輪下來字串沒變 → 停止', '回傳字串是否為空'],
      figure: { title: `s = "${S}"`, steps: replaceFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每輪至少刪掉 2 個字元,最多 n/2 輪;每輪掃一次字串 O(n)。最壞像 `"((((…))))"` 每輪只刪一對。' },
      verdict: '直覺好懂,也是「最內層一定緊鄰」的證明。但比堆疊慢,面試只當想法提一下。',
      code: {
        python: `def isValid(s):
    prev = None
    while s != prev:
        prev = s
        s = s.replace('()', '').replace('[]', '').replace('{}', '')
    return s == ''`,
        c: `bool isValid(char *s) {
    int n = strlen(s);
    char *t = malloc(n + 1);
    strcpy(t, s);
    bool changed = true;
    while (changed) {
        changed = false;
        int w = 0;
        for (int i = 0; t[i]; i++) {
            char a = t[i], b = t[i + 1];
            if ((a == '(' && b == ')') || (a == '[' && b == ']') || (a == '{' && b == '}')) {
                i++;                      // 這一對不寫回去 = 刪掉
                changed = true;
            } else {
                t[w++] = a;
            }
        }
        t[w] = '\\0';
    }
    bool ok = t[0] == '\\0';
    free(t);
    return ok;
}`,
        cpp: `bool isValid(string s) {
    string prev;
    while (s != prev) {
        prev = s;
        for (string p : {"()", "[]", "{}"})
            for (size_t k; (k = s.find(p)) != string::npos;) s.erase(k, 2);
    }
    return s.empty();
}`,
        java: `boolean isValid(String s) {
    String prev = null;
    while (!s.equals(prev)) {
        prev = s;
        s = s.replace("()", "").replace("[]", "").replace("{}", "");
    }
    return s.isEmpty();
}`,
        javascript: `function isValid(s) {
  let prev = null;
  while (s !== prev) {
    prev = s;
    s = s.replace(/\\(\\)|\\[\\]|\\{\\}/g, '');
  }
  return s === '';
}`,
      },
    },
    {
      name: '堆疊',
      idea: '左括號 push;右括號時,堆疊頂端必須是對應的左括號,是就 pop,不是就不合法。最後堆疊要是空的。',
      steps: ['`pair = {")": "(", "]": "[", "}": "{"}`', '左括號 → push', '右括號 → 堆疊空或頂端不是 `pair[c]` → `false`;否則 pop', '走完 → 回傳堆疊是否為空'],
      figure: { title: `s = "${S}"`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個字元 push 或 pop 一次。最壞全是左括號,堆疊存 n 個。' },
      verdict: '標準解,[[p:stack]]的代表題。「配對最近一個未完成的東西」就是堆疊的訊號:HTML 標籤、運算式、資料夾路徑都是同一招。',
      code: {
        python: `def isValid(s):
    pair = {')': '(', ']': '[', '}': '{'}
    st = []
    for c in s:
        if c not in pair:
            st.append(c)                  # 左括號
        elif not st or st[-1] != pair[c]:
            return False                  # 沒有可以配的,或種類不對
        else:
            st.pop()
    return not st                         # 不能有剩下沒關的左括號`,
        c: `bool isValid(char *s) {
    int n = strlen(s), top = 0;
    if (n % 2) return false;              // 奇數長度不可能全部配對
    char *st = malloc(n);
    bool ok = true;
    for (int i = 0; i < n && ok; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            st[top++] = c;
        } else {
            char want = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (top == 0 || st[top - 1] != want) ok = false;
            else top--;
        }
    }
    free(st);
    return ok && top == 0;
}`,
        cpp: `bool isValid(string s) {
    unordered_map<char, char> pair{{')', '('}, {']', '['}, {'}', '{'}};
    stack<char> st;
    for (char c : s) {
        if (!pair.count(c)) st.push(c);
        else if (st.empty() || st.top() != pair[c]) return false;
        else st.pop();
    }
    return st.empty();
}`,
        java: `boolean isValid(String s) {
    Map<Character, Character> pair = Map.of(')', '(', ']', '[', '}', '{');
    Deque<Character> st = new ArrayDeque<>();     // Java 建議用 ArrayDeque 當堆疊,不要用 Stack
    for (char c : s.toCharArray()) {
        if (!pair.containsKey(c)) st.push(c);
        else if (st.isEmpty() || st.peek() != pair.get(c)) return false;
        else st.pop();
    }
    return st.isEmpty();
}`,
        javascript: `function isValid(s) {
  const pair = { ')': '(', ']': '[', '}': '{' };
  const st = [];
  for (const c of s) {
    if (!(c in pair)) st.push(c);
    else if (st.length === 0 || st[st.length - 1] !== pair[c]) return false;
    else st.pop();
  }
  return st.length === 0;
}`,
      },
    },
  ],
  pitfalls: [
    '走完字串忘了檢查堆疊是否為空:`"(("` 一路都沒出錯,但答案是 false',
    '遇到右括號時沒先檢查堆疊是不是空的:`")"` 會對空堆疊取頂端(Python 噴錯、C 越界)',
    '只用計數器:三種括號各一個計數器處理不了 `"([)]"` 這種交錯的情況',
    'Java 的 `st.peek() != pair.get(c)` 比的是 `Character` 物件;這裡能用是因為 ASCII 字元有快取,保險的寫法是用 `.equals` 或改存 `char` 陣列',
  ],
  followUp: [
    { q: '只有一種括號 `()` 時呢?', a: '不需要堆疊,一個計數器就夠:`(` 加一、`)` 減一,過程中不能變負、最後要是 0。' },
    { q: '要讓字串變合法,最少刪幾個?', a: '1249. Minimum Remove to Make Valid Parentheses:堆疊存左括號的位置,沒被配到的(還留在堆疊的、以及沒有對象的右括號)就是要刪的。' },
  ],
  check: {
    kind: 'fn',
    fn: 'isValid',
    cases: [
      { args: ['()[]{}'], out: true },
      { args: ['(]'], out: false },
      { args: ['([)]'], out: false },
      { args: ['{[]}'], out: true },
      { args: ['(('], out: false },
      { args: [')'], out: false },
      { args: [S], out: false },
      { args: ['{[()()]}'], out: true },
    ],
  },
}
