import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 735. Asteroid Collision

const A = [5, 10, -5, -12, 3]

function stackFig(): FigStep[] {
  const st: number[] = []
  const out: FigStep[] = [{ note: '正數往右飛、負數往左飛。只有「左邊往右、右邊往左」(→ ←)才會相撞。由左往右處理,堆疊裡放「目前還活著的」', views: [arr(A, { label: 'asteroids' }), arr([], { label: '堆疊' })] }]
  for (let i = 0; i < A.length; i++) {
    const a = A[i]
    let alive = true
    const notes: string[] = []
    while (alive && a < 0 && st.length && st[st.length - 1] > 0) {
      const top = st[st.length - 1]
      if (top < -a) {
        st.pop()
        notes.push(`${top} 比較小,爆炸`)
      } else {
        if (top === -a) {
          st.pop()
          notes.push(`${top} 和 ${a} 一樣大,同歸於盡`)
        } else notes.push(`${top} 比較大,${a} 爆炸`)
        alive = false
      }
    }
    if (alive) st.push(a)
    out.push({ note: `${a}${a > 0 ? '(往右)→ 不會撞前面的,push' : notes.length ? `(往左)撞上堆疊頂:${notes.join(';')}${alive ? ';撞完還活著,push' : ''}` : '(往左)前面沒有往右的,push'}`, views: [arr(A, { label: 'asteroids', highlight: [i], done: Array.from({ length: i }, (_, k) => k) }), arr([...st], { label: '堆疊(活著的)' })] })
  }
  return out
}

function inplaceFig(): FigStep[] {
  return [
    { note: '不額外開堆疊:直接用原陣列的前段當堆疊(寫入指標 top),和 [2390](#/q/2390) 同一招', views: [arr(A, { label: 'asteroids', range: [0, 1] })] },
    { note: '處理到 -12 時把 10、5 都撞掉(top 退回 0),再把 -12 寫到 [0];最後前 top 個就是答案', views: [arr([-12, 3], { label: '前 top 個', done: [0, 1] })] },
  ]
}

export const q0735: Solution = {
  id: 735,
  plain: '一排小行星排成一列,正數往右飛、負數往左飛,絕對值是大小。兩顆相撞時小的爆炸、一樣大就一起爆炸;同方向的永遠不會撞到。最後剩下哪些?',
  statement: '給整數陣列 `asteroids`,絕對值為大小、正負號為方向(正 → 右、負 → 左),速度都相同。兩顆相遇時較小的爆炸,一樣大則都爆炸。回傳所有碰撞結束後剩下的小行星(保持原順序)。',
  examples: [
    { input: 'asteroids = [5,10,-5]', output: '[5,10]' },
    { input: 'asteroids = [8,-8]', output: '[]' },
    { input: 'asteroids = [10,2,-5]', output: '[10]' },
    { input: 'asteroids = [-2,-1,1,2]', output: '[-2,-1,1,2]', note: '← ← → →,背對背不會撞' },
  ],
  constraints: ['n ≤ 10⁴,值不為 0'],
  insight: ['只有「左邊是正、右邊是負」會撞', '新來的負數會一路往左撞,直到被擋下或撞穿 → 和「最近的」比 → 堆疊', '負數撞穿了所有往右的,就留下來(左邊不會再有東西撞它)'],
  approaches: [
    {
      name: '堆疊模擬',
      idea: '正數直接 push;負數 a:`while 堆疊頂 > 0 且 < |a|` → pop;一樣大 → 一起消失;比較大 → a 消失;最後還活著就 push。',
      steps: ['`st = []`', '`for a in asteroids`:`alive = True`', '`while alive and a < 0 and st and st[-1] > 0`:比大小決定 pop / 同歸於盡 / a 爆炸', '`alive` → push'],
      figure: { title: `asteroids = [${A}]`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每顆最多進出堆疊一次。' },
      verdict: '最推薦。[[p:stack]]處理「新來的和最近的互動,可能連鎖」的典型題。',
      code: {
        python: `def asteroidCollision(asteroids):
    st = []
    for a in asteroids:
        alive = True
        while alive and a < 0 and st and st[-1] > 0:   # → ← 才會撞
            if st[-1] < -a:
                st.pop()                      # 前面的比較小,爆炸,繼續撞下一個
                continue
            if st[-1] == -a:
                st.pop()                      # 一樣大,同歸於盡
            alive = False                     # a 爆炸(或同歸於盡)
        if alive:
            st.append(a)
    return st`,
        c: `int *asteroidCollision(int *asteroids, int asteroidsSize, int *returnSize) {
    int *st = malloc(asteroidsSize * sizeof(int)), top = 0;
    for (int i = 0; i < asteroidsSize; i++) {
        int a = asteroids[i];
        bool alive = true;
        while (alive && a < 0 && top && st[top - 1] > 0) {
            if (st[top - 1] < -a) { top--; continue; }
            if (st[top - 1] == -a) top--;
            alive = false;
        }
        if (alive) st[top++] = a;
    }
    *returnSize = top;
    return st;
}`,
        cpp: `vector<int> asteroidCollision(vector<int>& asteroids) {
    vector<int> st;
    for (int a : asteroids) {
        bool alive = true;
        while (alive && a < 0 && !st.empty() && st.back() > 0) {
            if (st.back() < -a) { st.pop_back(); continue; }
            if (st.back() == -a) st.pop_back();
            alive = false;
        }
        if (alive) st.push_back(a);
    }
    return st;
}`,
        java: `int[] asteroidCollision(int[] asteroids) {
    Deque<Integer> st = new ArrayDeque<>();
    for (int a : asteroids) {
        boolean alive = true;
        while (alive && a < 0 && !st.isEmpty() && st.peekLast() > 0) {
            if (st.peekLast() < -a) { st.pollLast(); continue; }
            if (st.peekLast() == -a) st.pollLast();
            alive = false;
        }
        if (alive) st.addLast(a);
    }
    return st.stream().mapToInt(Integer::intValue).toArray();
}`,
        javascript: `function asteroidCollision(asteroids) {
  const st = [];
  for (const a of asteroids) {
    let alive = true;
    while (alive && a < 0 && st.length && st[st.length - 1] > 0) {
      const top = st[st.length - 1];
      if (top < -a) {
        st.pop();
        continue;
      }
      if (top === -a) st.pop();
      alive = false;
    }
    if (alive) st.push(a);
  }
  return st;
}`,
      },
    },
    {
      name: '原陣列當堆疊',
      idea: '同樣的邏輯,`top` 指標直接在 asteroids 上寫入,最後回傳前 top 個。',
      steps: ['`top = 0`', '每顆 a:同樣的碰撞迴圈,只是 pop = `top -= 1`', '活著 → `asteroids[top] = a`、`top += 1`', '回傳 `asteroids[:top]`'],
      figure: { title: `asteroids = [${A}]`, steps: inplaceFig() },
      complexity: { time: 'O(n)', space: 'O(1)(不算輸出)', why: '覆寫原陣列的前段。' },
      verdict: '省下堆疊的空間。讀到第 i 個時 top ≤ i,不會蓋到還沒處理的。',
      code: {
        python: `def asteroidCollision(asteroids):
    top = 0
    for a in asteroids:
        alive = True
        while alive and a < 0 and top and asteroids[top - 1] > 0:
            if asteroids[top - 1] < -a:
                top -= 1
                continue
            if asteroids[top - 1] == -a:
                top -= 1
            alive = False
        if alive:
            asteroids[top] = a                # top ≤ 目前讀到的位置
            top += 1
    return asteroids[:top]`,
        c: `int *asteroidCollision(int *asteroids, int asteroidsSize, int *returnSize) {
    int top = 0;
    for (int i = 0; i < asteroidsSize; i++) {
        int a = asteroids[i];
        bool alive = true;
        while (alive && a < 0 && top && asteroids[top - 1] > 0) {
            if (asteroids[top - 1] < -a) { top--; continue; }
            if (asteroids[top - 1] == -a) top--;
            alive = false;
        }
        if (alive) asteroids[top++] = a;
    }
    int *res = malloc((top + 1) * sizeof(int));
    memcpy(res, asteroids, top * sizeof(int));
    *returnSize = top;
    return res;
}`,
        cpp: `vector<int> asteroidCollision(vector<int>& asteroids) {
    int top = 0;
    for (int a : asteroids) {
        bool alive = true;
        while (alive && a < 0 && top && asteroids[top - 1] > 0) {
            if (asteroids[top - 1] < -a) { top--; continue; }
            if (asteroids[top - 1] == -a) top--;
            alive = false;
        }
        if (alive) asteroids[top++] = a;
    }
    asteroids.resize(top);
    return asteroids;
}`,
        java: `int[] asteroidCollision(int[] asteroids) {
    int top = 0;
    for (int i = 0; i < asteroids.length; i++) {
        int a = asteroids[i];
        boolean alive = true;
        while (alive && a < 0 && top > 0 && asteroids[top - 1] > 0) {
            if (asteroids[top - 1] < -a) { top--; continue; }
            if (asteroids[top - 1] == -a) top--;
            alive = false;
        }
        if (alive) asteroids[top++] = a;
    }
    return Arrays.copyOf(asteroids, top);
}`,
        javascript: `function asteroidCollision(asteroids) {
  let top = 0;
  for (let i = 0; i < asteroids.length; i++) {
    const a = asteroids[i];
    let alive = true;
    while (alive && a < 0 && top && asteroids[top - 1] > 0) {
      if (asteroids[top - 1] < -a) {
        top--;
        continue;
      }
      if (asteroids[top - 1] === -a) top--;
      alive = false;
    }
    if (alive) asteroids[top++] = a;
  }
  return asteroids.slice(0, top);
}`,
      },
    },
  ],
  pitfalls: ['以為 ← → 也會撞:[-2, 2] 背對背,兩顆都留下', '一次只撞一顆:負數可能連續撞穿好幾顆,要用 while', '一樣大時只消掉其中一顆'],
  check: {
    kind: 'fn',
    fn: 'asteroidCollision',
    cases: [
      { args: [[5, 10, -5]], out: [5, 10] },
      { args: [[8, -8]], out: [] },
      { args: [[10, 2, -5]], out: [10] },
      { args: [[-2, -1, 1, 2]], out: [-2, -1, 1, 2] },
      { args: [A], out: [-12, 3] },
      { args: [[1, -2, -2, -2]], out: [-2, -2, -2] },
    ],
  },
}
