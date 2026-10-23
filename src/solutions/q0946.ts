import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 946. Validate Stack Sequences

const PU = [1, 2, 3, 4, 5]
const PO = [4, 5, 3, 2, 1]

function simFig(): FigStep[] {
  const st: number[] = []
  let j = 0
  const out: FigStep[] = [{ note: '真的拿一個堆疊來模擬:照 pushed 的順序一個一個 push;每 push 一個,就看堆疊頂是不是 popped 下一個要彈出的,是就一直 pop', views: [arr(PU, { label: 'pushed' }), arr(PO, { label: 'popped' }), arr([], { label: '堆疊' })] }]
  PU.forEach((x, i) => {
    st.push(x)
    let popped = 0
    while (st.length && st[st.length - 1] === PO[j]) {
      st.pop()
      j++
      popped++
    }
    out.push({ note: `push ${x}${popped ? `,堆疊頂剛好是要彈的,連續 pop ${popped} 個` : ',堆疊頂不是 popped 下一個,先留著'}`, views: [arr(PU, { label: 'pushed', done: Array.from({ length: i + 1 }, (_, k) => k) }), arr(PO, { label: 'popped', done: Array.from({ length: j }, (_, k) => k), pointers: j < PO.length ? [{ name: 'j', index: j }] : [] }), arr([...st], { label: '堆疊' })] })
  })
  out.push({ note: `全部 push 完,堆疊${st.length ? '不是空的 → false' : '清空了(popped 全部對上)→ true'}`, views: [arr([...st], { label: '堆疊' })] })
  return out
}

function inplaceFig(): FigStep[] {
  return [
    { note: '不開新堆疊:pushed 陣列的前半段本身就能當堆疊用(寫入指標 top),因為讀到第 i 個時,前面的位置已經用不到了', views: [arr([1, 2, 3, 4, 5], { label: 'pushed(前 top 個 = 堆疊)', range: [0, 3] })] },
    { note: '一樣的邏輯:`pushed[top] = x`、`top += 1`;堆疊頂等於 popped[j] 就 `top −= 1`、`j += 1`。最後 top == 0 就是 true', views: [arr([1, 2, 3, 4, 5], { label: 'pushed', range: [0, -1] })] },
  ]
}

export const q0946: Solution = {
  id: 946,
  plain: '有一疊盤子,你照 pushed 的順序一個一個放上去,過程中隨時可以從頂端拿走盤子。有沒有辦法讓「拿走的順序」剛好是 popped?',
  statement: '給兩個元素互不相同、長度相同的陣列 `pushed` 和 `popped`。若對一個空堆疊依序執行 push(照 pushed 順序)與穿插的 pop 操作,能讓彈出順序恰為 popped,回傳 true。',
  examples: [
    { input: 'pushed = [1,2,3,4,5], popped = [4,5,3,2,1]', output: 'true' },
    { input: 'pushed = [1,2,3,4,5], popped = [4,3,5,1,2]', output: 'false', note: '1 壓在 2 下面,不可能先彈 1' },
  ],
  constraints: ['長度 ≤ 1000,值互不相同'],
  insight: ['直接模擬:push 之後,能 pop 就盡量 pop(堆疊頂剛好是下一個要彈的)', '為什麼「能 pop 就馬上 pop」是對的?值互不相同,堆疊頂等於下一個要彈的時候,如果先不彈、繼續 push,它就被壓住再也彈不出來', '最後堆疊空了才合法'],
  approaches: [
    {
      name: '模擬堆疊(貪心地 pop)',
      idea: '每 push 一個,`while st and st[-1] == popped[j]`:pop、`j += 1`;最後看堆疊是否為空。',
      steps: ['`st = []`、`j = 0`', '`for x in pushed`:`st.append(x)`', '`while st and st[-1] == popped[j]`:`st.pop()`、`j += 1`', '回傳 `not st`'],
      figure: { title: `pushed = [${PU}],popped = [${PO}]`, steps: simFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個元素 push、pop 各一次。' },
      verdict: '最推薦,題目怎麼說就怎麼模擬。',
      code: {
        python: `def validateStackSequences(pushed, popped):
    st, j = [], 0
    for x in pushed:
        st.append(x)
        while st and st[-1] == popped[j]:     # 能彈就彈:晚了會被壓住
            st.pop()
            j += 1
    return not st`,
        c: `bool validateStackSequences(int *pushed, int pushedSize, int *popped, int poppedSize) {
    int *st = malloc(pushedSize * sizeof(int)), top = 0, j = 0;
    for (int i = 0; i < pushedSize; i++) {
        st[top++] = pushed[i];
        while (top && st[top - 1] == popped[j]) { top--; j++; }
    }
    free(st);
    return top == 0;
}`,
        cpp: `bool validateStackSequences(vector<int>& pushed, vector<int>& popped) {
    vector<int> st;
    size_t j = 0;
    for (int x : pushed) {
        st.push_back(x);
        while (!st.empty() && st.back() == popped[j]) { st.pop_back(); j++; }
    }
    return st.empty();
}`,
        java: `boolean validateStackSequences(int[] pushed, int[] popped) {
    Deque<Integer> st = new ArrayDeque<>();
    int j = 0;
    for (int x : pushed) {
        st.push(x);
        while (!st.isEmpty() && st.peek() == popped[j]) { st.pop(); j++; }
    }
    return st.isEmpty();
}`,
        javascript: `function validateStackSequences(pushed, popped) {
  const st = [];
  let j = 0;
  for (const x of pushed) {
    st.push(x);
    while (st.length && st[st.length - 1] === popped[j]) {
      st.pop();
      j++;
    }
  }
  return st.length === 0;
}`,
      },
    },
    {
      name: '用 pushed 本身當堆疊',
      idea: '`top` 是寫入指標:`pushed[top] = x`、`top += 1`;能 pop 就 `top −= 1`。',
      steps: ['`top = j = 0`', '`for x in pushed`:`pushed[top] = x`、`top += 1`', '`while top and pushed[top − 1] == popped[j]`:`top -= 1`、`j += 1`', '回傳 `top == 0`'],
      figure: { title: `pushed = [${PU}],popped = [${PO}]`, steps: inplaceFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '覆寫 pushed 的前半段,沒有額外陣列。' },
      verdict: '省掉額外堆疊。讀到第 i 個時 top ≤ i,所以不會蓋到還沒讀的元素。',
      code: {
        python: `def validateStackSequences(pushed, popped):
    top = j = 0
    for x in pushed:
        pushed[top] = x                       # top ≤ 目前讀到的位置,安全
        top += 1
        while top and pushed[top - 1] == popped[j]:
            top -= 1
            j += 1
    return top == 0`,
        c: `bool validateStackSequences(int *pushed, int pushedSize, int *popped, int poppedSize) {
    int top = 0, j = 0;
    for (int i = 0; i < pushedSize; i++) {
        pushed[top++] = pushed[i];
        while (top && pushed[top - 1] == popped[j]) { top--; j++; }
    }
    return top == 0;
}`,
        cpp: `bool validateStackSequences(vector<int>& pushed, vector<int>& popped) {
    int top = 0, j = 0;
    for (int i = 0; i < (int)pushed.size(); i++) {
        pushed[top++] = pushed[i];
        while (top && pushed[top - 1] == popped[j]) { top--; j++; }
    }
    return top == 0;
}`,
        java: `boolean validateStackSequences(int[] pushed, int[] popped) {
    int top = 0, j = 0;
    for (int i = 0; i < pushed.length; i++) {
        pushed[top++] = pushed[i];
        while (top > 0 && pushed[top - 1] == popped[j]) { top--; j++; }
    }
    return top == 0;
}`,
        javascript: `function validateStackSequences(pushed, popped) {
  let top = 0, j = 0;
  for (let i = 0; i < pushed.length; i++) {
    pushed[top++] = pushed[i];
    while (top && pushed[top - 1] === popped[j]) {
      top--;
      j++;
    }
  }
  return top === 0;
}`,
      },
    },
  ],
  pitfalls: ['Java 的 `st.peek() == popped[j]`:Integer 和 int 比較會自動拆箱,沒問題;但兩個 Integer 互相用 == 比就會出錯', '只在全部 push 完之後才開始 pop:中途該彈的時候沒彈,就被壓住了'],
  check: {
    kind: 'fn',
    fn: 'validateStackSequences',
    cases: [
      { args: [PU, PO], out: true },
      { args: [PU, [4, 3, 5, 1, 2]], out: false },
      { args: [[1], [1]], out: true },
      { args: [[2, 1, 0], [1, 2, 0]], out: true },
      { args: [[1, 2, 3], [3, 1, 2]], out: false },
    ],
  },
}
