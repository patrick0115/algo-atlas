import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const QUERIES = [[1, 1], [2, 2], [3, 2], [1, 1], [1, 1], [2, 1], [3, 2]]

function scanFig(): FigStep[] {
  const steps: FigStep[] = []
  const bag: number[] = []
  const answers: number[] = []
  for (let i = 0; i < QUERIES.length; i++) {
    const [op, x] = QUERIES[i]
    if (op === 1) bag.push(x)
    if (op === 2) {
      const at = bag.indexOf(x)
      if (at >= 0) bag.splice(at, 1)
    }
    if (op === 3) {
      let found = false
      for (const v of new Set(bag)) {
        const count = bag.filter(y => y === v).length
        steps.push({ note: `查頻率 ${x}：重新數值 ${v} 在袋中出現 ${count} 次，${count === x ? '符合' : '不符'}。`, views: [arr(bag, { label: '目前袋中元素' }), kv([[v, count]], '逐值重數'), arr(answers, { label: '先前查詢結果' })] })
        if (count === x) found = true
      }
      answers.push(found ? 1 : 0)
    }
    steps.push({ note: `執行第 ${i + 1} 筆 (${op},${x})；袋中為 [${bag.join(',')}]，查詢答案目前 [${answers.join(',')}]。`, views: [arr(QUERIES.map(row => `(${row[0]},${row[1]})`), { label: '操作', highlight: [i] }), arr(bag, { label: '袋中元素' }), arr(answers, { label: '查詢答案' })] })
  }
  return steps
}

function dualFig(): FigStep[] {
  const steps: FigStep[] = []
  const valueCount = new Map<number, number>()
  const freqCount = new Map<number, number>()
  const answers: number[] = []
  for (let i = 0; i < QUERIES.length; i++) {
    const [op, x] = QUERIES[i]
    const old = valueCount.get(x) ?? 0
    if (op === 1 || (op === 2 && old > 0)) {
      const next = old + (op === 1 ? 1 : -1)
      if (old > 0) freqCount.set(old, (freqCount.get(old) ?? 0) - 1)
      valueCount.set(x, next)
      if (next > 0) freqCount.set(next, (freqCount.get(next) ?? 0) + 1)
    }
    if (op === 3) answers.push((freqCount.get(x) ?? 0) > 0 ? 1 : 0)
    steps.push({ note: `操作 (${op},${x})：${op === 1 ? `${x} 的次數 ${old} → ${old + 1}` : op === 2 ? `${x} 的次數 ${old}${old > 0 ? ` → ${old - 1}` : '，不存在所以不刪'}` : `頻率 ${x} 有 ${freqCount.get(x) ?? 0} 種數值，輸出 ${answers.at(-1)}`}。`, views: [arr(QUERIES.map(row => `(${row[0]},${row[1]})`), { label: '目前操作', highlight: [i] }), kv([...valueCount].filter(([, v]) => v > 0), '數值 → 出現次數', op === 3 ? [] : [x]), kv([...freqCount].filter(([, v]) => v > 0), '頻率 → 數值個數', op === 3 ? [x] : []), arr(answers, { label: '查詢答案' })] })
  }
  return steps
}

export const hrFrequencyQueries: HrSolution = {
  slug: 'frequency-queries',
  plain: '像管理一袋號碼球：可放一顆、拿走一顆，或問「袋中有沒有某個號碼剛好出現 z 次？」',
  statement: '輸入一串 [op,x] 操作。op=1 插入一個 x；op=2 若 x 存在就刪掉其中一個；op=3 詢問是否存在任何數值恰好出現 x 次，存在輸出 1，否則輸出 0。回傳所有查詢輸出，依查詢順序排列。',
  examples: [
    { input: 'queries = [[1,1],[2,2],[3,2],[1,1],[1,1],[2,1],[3,2]]', output: '[0,1]', note: '第一次問時沒有出現兩次的值；最後 1 恰好出現兩次。' },
    { input: 'queries = [[1,3],[1,3],[3,2],[2,3],[3,2]]', output: '[1,0]', note: '刪掉一個 3 後，它的頻率從 2 降為 1。' },
  ],
  constraints: [
    '操作數可達 10^5 → 每次查詢都對每個值重數一次是 O(q²),整體 O(q³),太慢。',
    '刪除不存在的數值不能造成負頻率 → 更新前必須確認舊次數大於 0。',
    '查詢的是「有沒有數值的頻率恰好為 z」→ 可另存各頻率對應的數值個數。',
  ],
  insight: [
    '先把元素放在袋子陣列中；插入、刪除照做，查詢時逐值重數，直接符合題意。',
    '若只存「數值 → 次數」，每次查詢仍須遍歷所有不同數值。',
    '再建一張「頻率 → 有多少數值具此頻率」的 [[p:hash-map]] 表；更新一個數值時，同步移走舊頻率、加入新頻率，查詢就能直接讀表。',
  ],
  approaches: [
    {
      name: '保留整袋，查詢時重數',
      idea: '完整儲存目前所有元素，詢問時逐個不同數值計數。',
      steps: ['插入時把 x 加到袋子末端。', '刪除時找到一個 x 並移除，若找不到就不動。', '查詢時對袋中每個不同數值算次數，只要有次數等於 x 就輸出 1。'],
      figure: { title: '袋中元素與逐次查詢', steps: scanFig() },
      complexity: { time: '最壞 O(q³)', space: 'O(q)', why: '每次查詢要對袋中每個值重掃整袋,單次 O(q²);q 次查詢共 O(q³)。袋子最多有 q 個元素。' },
      verdict: '概念直接，但大量查詢會重複計數。',
      code: {
        python: `def freqQuery(queries):
    bag = []
    answer = []
    for op, x in queries:
        if op == 1:
            bag.append(x)
        elif op == 2:
            if x in bag:
                bag.remove(x)
        else:
            # 查詢時才重新統計袋內所有值
            answer.append(int(any(bag.count(v) == x for v in set(bag))))
    return answer`,
        c: `int* freqQuery(int queries_rows, int queries_columns, int** queries, int* result_count) {
    int* bag = malloc(sizeof(int) * queries_rows);
    int* answer = malloc(sizeof(int) * queries_rows);
    int size = 0;
    *result_count = 0;
    for (int i = 0; i < queries_rows; i++) {
        int op = queries[i][0], x = queries[i][1];
        if (op == 1) bag[size++] = x;
        else if (op == 2) {
            for (int j = 0; j < size; j++) {
                if (bag[j] == x) {
                    for (int h = j + 1; h < size; h++) bag[h - 1] = bag[h];
                    size--;
                    break;
                }
            }
        } else {
            int found = 0;
            for (int j = 0; j < size && !found; j++) {
                int count = 0;
                for (int h = 0; h < size; h++) if (bag[h] == bag[j]) count++;
                if (count == x) found = 1;
            }
            answer[(*result_count)++] = found;
        }
    }
    free(bag);
    return answer;
}`,
        cpp: `vector<int> freqQuery(vector<vector<int>> queries) {
    vector<int> bag, answer;
    for (auto query : queries) {
        int op = query[0], x = query[1];
        if (op == 1) bag.push_back(x);
        else if (op == 2) {
            auto it = find(bag.begin(), bag.end(), x);
            if (it != bag.end()) bag.erase(it);
        } else {
            bool found = false;
            for (int value : bag) {
                if (count(bag.begin(), bag.end(), value) == x) found = true;
            }
            answer.push_back(found ? 1 : 0);
        }
    }
    return answer;
}`,
        java: `public static List<Integer> freqQuery(List<List<Integer>> queries) {
    List<Integer> bag = new ArrayList<>();
    List<Integer> answer = new ArrayList<>();
    for (List<Integer> query : queries) {
        int op = query.get(0), x = query.get(1);
        if (op == 1) bag.add(x);
        else if (op == 2) bag.remove(Integer.valueOf(x));
        else {
            int found = 0;
            for (int value : bag) {
                if (Collections.frequency(bag, value) == x) found = 1;
            }
            answer.add(found);
        }
    }
    return answer;
}`,
        javascript: `function freqQuery(queries) {
  const bag = [];
  const answer = [];
  for (const [op, x] of queries) {
    if (op === 1) bag.push(x);
    else if (op === 2) {
      const at = bag.indexOf(x);
      if (at >= 0) bag.splice(at, 1);
    } else {
      const found = [...new Set(bag)].some(v => bag.filter(y => y === v).length === x);
      answer.push(found ? 1 : 0);
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '兩張同步頻率表',
      idea: '一張表記每個值出現幾次，另一張記每個頻率有幾個值。',
      steps: ['建立 valueCount、freqCount 兩張表。', '增刪 x 時，先從 freqCount 扣掉舊正頻率的一個值，再改 x 的次數，最後把新正頻率加一。', '詢問 z 時，只要 freqCount[z] > 0 就輸出 1。'],
      figure: { title: '兩張表同步移動頻率', steps: dualFig() },
      complexity: { time: '平均 O(q)', space: 'O(q)', why: '每筆操作只做固定次數 hash 查找；最多 q 種數值與 q 種正頻率。' },
      verdict: '更新時維持兩張表一致，查詢才真正做到平均 O(1)。',
      code: {
        python: `def freqQuery(queries):
    value_count = {}
    freq_count = {}
    answer = []
    for op, x in queries:
        if op == 3:
            answer.append(int(freq_count.get(x, 0) > 0))
            continue
        old = value_count.get(x, 0)
        if op == 2 and old == 0:
            continue
        new = old + (1 if op == 1 else -1)
        if old > 0:
            freq_count[old] -= 1  # 移走舊頻率
        value_count[x] = new
        if new > 0:
            freq_count[new] = freq_count.get(new, 0) + 1
    return answer`,
        c: `typedef struct {
    int key;
    int count;
    int used;
} FrequencySlot;

int* freqQuery(int queries_rows, int queries_columns, int** queries, int* result_count) {
    int capacity = 1;
    while (capacity < queries_rows * 4 + 1) capacity <<= 1;
    FrequencySlot* table = calloc(capacity, sizeof(FrequencySlot));
    int* frequency = calloc(queries_rows + 2, sizeof(int));
    int* answer = malloc(sizeof(int) * queries_rows);
    *result_count = 0;
    for (int i = 0; i < queries_rows; i++) {
        int op = queries[i][0], x = queries[i][1];
        if (op == 3) {
            answer[(*result_count)++] = x <= queries_rows && frequency[x] > 0;
            continue;
        }
        unsigned int at = ((unsigned int)x * 2654435761u) & (capacity - 1);
        while (table[at].used && table[at].key != x) at = (at + 1) & (capacity - 1);
        if (!table[at].used) {
            table[at].used = 1;
            table[at].key = x;
        }
        int old = table[at].count;
        if (op == 2 && old == 0) continue;
        int next = old + (op == 1 ? 1 : -1);
        if (old > 0) frequency[old]--;
        table[at].count = next;
        if (next > 0) frequency[next]++;
    }
    free(table);
    free(frequency);
    return answer;
}`,
        cpp: `vector<int> freqQuery(vector<vector<int>> queries) {
    unordered_map<int, int> valueCount, freqCount;
    vector<int> answer;
    for (auto query : queries) {
        int op = query[0], x = query[1];
        if (op == 3) {
            answer.push_back(freqCount[x] > 0 ? 1 : 0);
            continue;
        }
        int old = valueCount[x];
        if (op == 2 && old == 0) continue;
        int next = old + (op == 1 ? 1 : -1);
        if (old > 0) freqCount[old]--;
        valueCount[x] = next;
        if (next > 0) freqCount[next]++;
    }
    return answer;
}`,
        java: `public static List<Integer> freqQuery(List<List<Integer>> queries) {
    Map<Integer, Integer> valueCount = new HashMap<>();
    Map<Integer, Integer> freqCount = new HashMap<>();
    List<Integer> answer = new ArrayList<>();
    for (List<Integer> query : queries) {
        int op = query.get(0), x = query.get(1);
        if (op == 3) {
            answer.add(freqCount.getOrDefault(x, 0) > 0 ? 1 : 0);
            continue;
        }
        int old = valueCount.getOrDefault(x, 0);
        if (op == 2 && old == 0) continue;
        int next = old + (op == 1 ? 1 : -1);
        if (old > 0) freqCount.put(old, freqCount.get(old) - 1);
        valueCount.put(x, next);
        if (next > 0) freqCount.put(next, freqCount.getOrDefault(next, 0) + 1);
    }
    return answer;
}`,
        javascript: `function freqQuery(queries) {
  const valueCount = new Map();
  const freqCount = new Map();
  const answer = [];
  for (const [op, x] of queries) {
    if (op === 3) {
      answer.push((freqCount.get(x) ?? 0) > 0 ? 1 : 0);
      continue;
    }
    const old = valueCount.get(x) ?? 0;
    if (op === 2 && old === 0) continue;
    const next = old + (op === 1 ? 1 : -1);
    if (old > 0) freqCount.set(old, freqCount.get(old) - 1);
    valueCount.set(x, next);
    if (next > 0) freqCount.set(next, (freqCount.get(next) ?? 0) + 1);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '頻率 0 的數值不算「出現」，不可把它加入頻率表。',
    '刪除不存在的 x 要直接略過，否則負次數會破壞兩張表的一致性。',
    'freqCount[z] 是有多少種數值出現 z 次，不是某個數值 z 的出現次數。',
  ],
  check: {
    kind: 'fn',
    fn: 'freqQuery',
    cases: [
      { args: [[[1, 1], [2, 2], [3, 2], [1, 1], [1, 1], [2, 1], [3, 2]]], out: [0, 1] },
      { args: [[[1, 3], [1, 3], [3, 2], [2, 3], [3, 2]]], out: [1, 0] },
      { args: [[[3, 1]]], out: [0] },
      { args: [[[2, 5], [3, 1]]], out: [0] },
      { args: [[[1, 7], [3, 1]]], out: [1] },
      { args: [[[1, 1], [1, 2], [3, 1], [2, 1], [3, 1]]], out: [1, 1] },
    ],
  },
}
