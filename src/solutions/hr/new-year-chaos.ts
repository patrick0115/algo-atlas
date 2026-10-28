import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const LINE = [2, 1, 5, 3, 4]

function allPairsFig(): FigStep[] {
  const q = LINE, out: FigStep[] = []
  let count = 0
  for (let i = 0; i < q.length; i++) {
    if (q[i] - (i + 1) > 2) break
    for (let j = i + 1; j < q.length; j++) {
      const inverted = q[i] > q[j]
      if (inverted) count++
      out.push({ note: `比較位置 ${i + 1} 的 ${q[i]} 與位置 ${j + 1} 的 ${q[j]}：${inverted ? '編號較大者在前，是一次超車' : '順序正常'}；目前 ${count} 次。`, views: [arr(q, { label: '目前隊伍', highlight: [i, j] }), arr([count], { label: '逆序對數' })] })
    }
  }
  return out
}

function narrowFig(): FigStep[] {
  const q = LINE, out: FigStep[] = []
  let count = 0
  for (let i = 0; i < q.length; i++) {
    const start = Math.max(0, q[i] - 2)
    for (let j = start; j < i; j++) {
      const passed = q[j] > q[i]
      if (passed) count++
      out.push({ note: `看 ${q[i]}：賄賂者最多前移兩格，只查索引 ${start} 到 ${i - 1}；${q[j]} ${passed ? '比它大，曾超過它' : '比它小，沒有超過它'}，累計 ${count}。`, views: [arr(q, { label: '隊伍', highlight: [i, j], dim: Array.from({ length: start }, (_, k) => k) }), arr([start, i, count], { label: '查找起點 / 目前位置 / 次數' })] })
    }
    if (start === i) out.push({ note: `看 ${q[i]}：可疑範圍為空，這人前面沒有需要計入的賄賂者；累計 ${count}。`, views: [arr(q, { label: '隊伍', highlight: [i] }), arr([start, i, count], { label: '起點 / 位置 / 次數' })] })
  }
  return out
}

export const hrNewYearChaos: HrSolution = {
  slug: 'new-year-chaos',
  plain: '像排隊買票時，每人最多花錢超過前面兩人。看最後隊伍，算一共發生幾次「後面編號跑到前面」，若有人前進超過兩格就判違規。',
  statement: '原本編號 1 到 n 的人依序排隊。一次賄賂只能與正前方交換，每人最多賄賂兩次。輸入最後順序 q；輸出最少交換次數，若任一人至少需賄賂三次則印出 Too chaotic。',
  examples: [
    { input: 'q = [2,1,5,3,4]', output: '3', note: '2 超過 1；5 超過 3、4，共三次。' },
    { input: 'q = [2,5,1,3,4]', output: 'Too chaotic', note: '5 從第 5 位到第 2 位，前進三格，不可能只賄賂兩人。' },
  ],
  constraints: [
    'q 為 1 到 n 的排列 → 每個人的原始位置就是其編號，不需另外記錄。',
    'n 可達 10^5 → 比較所有 O(n²) 人對可能太慢。',
    '每人最多前進兩格 → 若 q[i]−(i+1)>2 可立刻判違規；計數時只需從 q[i]−2 起查。',
  ],
  insight: [
    '每次與前方交換，恰好把一對編號順序顛倒，所以**最少**賄賂次數就是逆序對數。',
    '先檢查有沒有人比自己編號應在的位置往前移超過兩格；若有，無須再數。',
    '直覺枚舉全部人對；再利用賄賂上限：每個人最多往前 2 格,所以比 x 大的人(編號 y > x)現在最前只能站在 y − 3 ≥ x − 2 的索引,掃描範圍縮至 `max(0, x−2)` 起。',
  ],
  approaches: [
    {
      name: '檢查位移後數全部逆序對',
      idea: '違規先排除，再把每對前後順序顛倒的人算一次。',
      steps: ['掃每個位置 i，若 q[i]−(i+1)>2 回傳 −1。', '對每個 i 與後方 j 比較。', '若 q[i]>q[j]，逆序對加一。', '回傳逆序對數，印出函式把 −1 轉成 Too chaotic。'],
      figure: { title: 'q = [2,1,5,3,4]', steps: allPairsFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '最多比較 n(n−1)/2 對；只用計數器。' },
      verdict: '逆序對觀念直接，但大隊伍太慢。',
      code: {
        python: `def bribes(q):
    for i, person in enumerate(q):
        if person - (i + 1) > 2:  # 前進超過兩格
            return -1
    total = 0
    for i in range(len(q)):
        for j in range(i + 1, len(q)):
            if q[i] > q[j]:
                total += 1
    return total

def minimumBribes(q):
    answer = bribes(q)
    print('Too chaotic' if answer < 0 else answer)`,
        c: `int bribes(int q_count, int* q) {
    for (int i = 0; i < q_count; i++) {
        if (q[i] - i - 1 > 2) return -1;
    }
    int total = 0;
    for (int i = 0; i < q_count; i++) {
        for (int j = i + 1; j < q_count; j++) {
            if (q[i] > q[j]) total++;
        }
    }
    return total;
}

void minimumBribes(int q_count, int* q) {
    int answer = bribes(q_count, q);
    if (answer < 0) printf("Too chaotic\\n");
    else printf("%d\\n", answer);
}`,
        cpp: `int bribes(vector<int> q) {
    for (int i = 0; i < (int)q.size(); i++) {
        if (q[i] - i - 1 > 2) return -1;
    }
    int total = 0;
    for (int i = 0; i < (int)q.size(); i++) {
        for (int j = i + 1; j < (int)q.size(); j++) {
            if (q[i] > q[j]) total++;
        }
    }
    return total;
}

void minimumBribes(vector<int> q) {
    int answer = bribes(q);
    if (answer < 0) cout << "Too chaotic\\n";
    else cout << answer << '\\n';
}`,
        java: `public static int bribes(List<Integer> q) {
    for (int i = 0; i < q.size(); i++) {
        if (q.get(i) - i - 1 > 2) return -1;
    }
    int total = 0;
    for (int i = 0; i < q.size(); i++) {
        for (int j = i + 1; j < q.size(); j++) {
            if (q.get(i) > q.get(j)) total++;
        }
    }
    return total;
}

public static void minimumBribes(List<Integer> q) {
    int answer = bribes(q);
    System.out.println(answer < 0 ? "Too chaotic" : answer);
}`,
        javascript: `function bribes(q) {
  for (let i = 0; i < q.length; i++) {
    if (q[i] - i - 1 > 2) return -1;
  }
  let total = 0;
  for (let i = 0; i < q.length; i++) {
    for (let j = i + 1; j < q.length; j++) {
      if (q[i] > q[j]) total++;
    }
  }
  return total;
}

function minimumBribes(q) {
  const answer = bribes(q);
  console.log(answer < 0 ? 'Too chaotic' : answer);
}`,
      },
    },
    {
      name: '利用最多前進兩格縮小比較範圍',
      idea: '對當前人，只查可能從其後方超到前面的候選人。',
      steps: ['先掃 q；有人前進超過兩格即回傳 −1。', '對位置 i 的人 x，從索引 max(0,x−2) 掃到 i−1。', '若前方人的編號大於 x，就代表它賄賂超過 x，計數加一。', '印出總數或 Too chaotic。'],
      figure: { title: 'q = [2,1,5,3,4]', steps: narrowFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '對每個人 x,只要從索引 max(0, x−2) 掃到它目前的位置;因為每人最多往前 2 格,這段最多約 3 格,總檢查次數是線性的。' },
      verdict: '利用賄賂上限把計數縮到線性；可參考 [minimum-swaps-2](#/h/minimum-swaps-2) 的交換觀察。',
      code: {
        python: `def bribes(q):
    total = 0
    for i, person in enumerate(q):
        if person - (i + 1) > 2:  # 這人至少賄賂三次
            return -1
        for j in range(max(0, person - 2), i):
            if q[j] > person:  # 前方較大編號曾超過他
                total += 1
    return total

def minimumBribes(q):
    answer = bribes(q)
    print('Too chaotic' if answer < 0 else answer)`,
        c: `int bribes(int q_count, int* q) {
    int total = 0;
    for (int i = 0; i < q_count; i++) {
        int person = q[i];
        if (person - i - 1 > 2) return -1;
        int start = person - 2 > 0 ? person - 2 : 0;
        for (int j = start; j < i; j++) {
            if (q[j] > person) total++;
        }
    }
    return total;
}

void minimumBribes(int q_count, int* q) {
    int answer = bribes(q_count, q);
    if (answer < 0) printf("Too chaotic\\n");
    else printf("%d\\n", answer);
}`,
        cpp: `int bribes(vector<int> q) {
    int total = 0;
    for (int i = 0; i < (int)q.size(); i++) {
        int person = q[i];
        if (person - i - 1 > 2) return -1;
        for (int j = max(0, person - 2); j < i; j++) {
            if (q[j] > person) total++;
        }
    }
    return total;
}

void minimumBribes(vector<int> q) {
    int answer = bribes(q);
    if (answer < 0) cout << "Too chaotic\\n";
    else cout << answer << '\\n';
}`,
        java: `public static int bribes(List<Integer> q) {
    int total = 0;
    for (int i = 0; i < q.size(); i++) {
        int person = q.get(i);
        if (person - i - 1 > 2) return -1;
        for (int j = Math.max(0, person - 2); j < i; j++) {
            if (q.get(j) > person) total++;
        }
    }
    return total;
}

public static void minimumBribes(List<Integer> q) {
    int answer = bribes(q);
    System.out.println(answer < 0 ? "Too chaotic" : answer);
}`,
        javascript: `function bribes(q) {
  let total = 0;
  for (let i = 0; i < q.length; i++) {
    const person = q[i];
    if (person - i - 1 > 2) return -1;
    for (let j = Math.max(0, person - 2); j < i; j++) {
      if (q[j] > person) total++;
    }
  }
  return total;
}

function minimumBribes(q) {
  const answer = bribes(q);
  console.log(answer < 0 ? 'Too chaotic' : answer);
}`,
      },
    },
  ],
  pitfalls: [
    '判違規用 `q[i]−(i+1)>2`，不能用向後移動量；被超越者可後退很多格。',
    '輸出函式照樣板印答案，供測試的 bribes 則回傳 −1 表示違規。',
    '逆序對只算較大編號站在較小編號前方；合法隊伍可能有多種實際賄賂順序(甚至可以來回賄賂),題目問的是**最少**次數,那就是逆序對數。',
  ],
  check: {
    kind: 'fn', fn: 'bribes',
    cases: [
      { args: [[2, 1, 5, 3, 4]], out: 3 },
      { args: [[2, 5, 1, 3, 4]], out: -1 },
      { args: [[1]], out: 0 },
      { args: [[1, 2, 3]], out: 0 },
      { args: [[3, 1, 2]], out: 2 },
      { args: [[1, 2, 3, 5, 4]], out: 1 },
    ],
  },
}
