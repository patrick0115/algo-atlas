import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const operations = ['1 97', '2', '1 20', '2', '1 26', '1 20', '3', '1 91', '3']

function scanFig(): FigStep[] {
  const out: FigStep[] = [], stack: number[] = [], answers: number[] = []
  for (let i = 0; i < operations.length; i++) {
    const [type, value] = operations[i].split(' ').map(Number)
    if (type === 1) stack.push(value)
    if (type === 2) stack.pop()
    if (type === 3) answers.push(Math.max(...stack))
    out.push({ note: `操作 ${i + 1}「${operations[i]}」：堆疊 ${stack.join('、') || '空'}${type === 3 ? `，重新掃描得最大 ${answers[answers.length - 1]}` : ''}；已輸出 ${answers.join('、') || '無'}。`, views: [arr(operations, { label: '操作', highlight: [i] }), arr([...stack], { label: '數值堆疊' }), arr([...answers], { label: '查詢答案' })] })
  }
  return out
}

function maximaFig(): FigStep[] {
  const out: FigStep[] = [], stack: number[] = [], maxima: number[] = [], answers: number[] = []
  for (let i = 0; i < operations.length; i++) {
    const [type, value] = operations[i].split(' ').map(Number)
    if (type === 1) { stack.push(value); maxima.push(Math.max(value, maxima.at(-1) ?? -Infinity)) }
    if (type === 2) { stack.pop(); maxima.pop() }
    if (type === 3) answers.push(maxima[maxima.length - 1])
    out.push({ note: `操作 ${i + 1}「${operations[i]}」：最大值堆疊頂 ${maxima.at(-1) ?? '空'}${type === 3 ? '，直接輸出此值' : ''}。`, views: [arr(operations, { label: '操作', highlight: [i] }), arr([...stack], { label: '數值堆疊' }), arr([...maxima], { label: '各深度最大值' }), arr([...answers], { label: '答案' })] })
  }
  return out
}

export const hrMaximumElement: HrSolution = {
  slug: 'maximum-element',
  plain: '像一疊盤子，只能在頂端放或拿；有人隨時問目前最大的盤子編號。',
  statement: '初始為空堆疊。輸入操作字串陣列：`1 x` 把 x 推入頂端、`2` 移除頂端、`3` 查詢目前最大值。依查詢發生順序回傳所有最大值；題目保證移除與查詢時堆疊有效。',
  examples: [
    { input: 'operations = ["1 97","2","1 20","2","1 26","1 20","3","1 91","3"]', output: '[26,91]', note: '兩次查詢時，堆疊最大值依序為 26、91。' },
    { input: 'operations = ["1 5","1 5","2","3"]', output: '[5]', note: '拿掉一個 5，另一個仍在堆疊。' },
  ],
  constraints: [
    '操作數最多 10^5 → 每次查詢掃描整個堆疊可能達 O(n²)。',
    'x 最多 10^9 → 32 位元可保存單一值，不需按值建立陣列。',
    '每次只動頂端 → 可同步維護另一個深度相同的最大值堆疊。',
  ],
  insight: [
    '直覺做法用普通堆疊，查詢時掃描找最大；若查詢很多會重複掃描。',
    '放入一個數後，新最大值只可能是舊最大與新數的較大者。',
    '每層同時記下當時最大值；彈出兩個堆疊的頂端即可恢復舊最大。這是 [[p:stack]] 儲存歷史狀態的用法，可參考 [155](#/q/155)。',
  ],
  approaches: [
    {
      name: '查詢時掃描',
      idea: '照操作維護普通堆疊，遇到查詢就從頭找最大值。',
      steps: ['建立空數值堆疊與答案陣列。', '遇到 1 x 就放入 x；遇到 2 就彈出。', '遇到 3 時掃描全部元素取得最大值，加入答案。', '回傳答案陣列。'],
      figure: { title: '範例操作', steps: scanFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '最多 n 次查詢，每次可掃描 n 個值；堆疊與答案佔線性空間。' },
      verdict: '容易驗算，但查詢頻繁時太慢。',
      code: {
        python: `def getMax(operations):
    stack = []
    answers = []
    for op in operations:
        parts = op.split()
        if parts[0] == '1':
            stack.append(int(parts[1]))
        elif parts[0] == '2':
            stack.pop()
        else:
            answers.append(max(stack))  # 每次查詢重新掃描
    return answers`,
        c: `int* getMax(int operations_count, char** operations, int* result_count) {
    int* stack = malloc(sizeof(int) * operations_count);
    int* answer = malloc(sizeof(int) * operations_count);
    int top = 0;
    *result_count = 0;
    for (int i = 0; i < operations_count; i++) {
        int type, value;
        sscanf(operations[i], "%d %d", &type, &value);
        if (type == 1) stack[top++] = value;
        else if (type == 2) top--;
        else {
            int best = stack[0];
            for (int j = 1; j < top; j++) if (stack[j] > best) best = stack[j];
            answer[(*result_count)++] = best;
        }
    }
    free(stack);
    return answer;
}`,
        cpp: `vector<int> getMax(vector<string> operations) {
    vector<int> stack, answer;
    for (const string& op : operations) {
        int type = stoi(op);
        if (type == 1) stack.push_back(stoi(op.substr(2)));
        else if (type == 2) stack.pop_back();
        else answer.push_back(*max_element(stack.begin(), stack.end()));
    }
    return answer;
}`,
        java: `public static List<Integer> getMax(List<String> operations) {
    List<Integer> stack = new java.util.ArrayList<>();
    List<Integer> answer = new java.util.ArrayList<>();
    for (String op : operations) {
        String[] parts = op.split(" ");
        int type = Integer.parseInt(parts[0]);
        if (type == 1) stack.add(Integer.parseInt(parts[1]));
        else if (type == 2) stack.remove(stack.size() - 1);
        else answer.add(java.util.Collections.max(stack));
    }
    return answer;
}`,
        javascript: `function getMax(operations) {
  const stack = [];
  const answer = [];
  for (const op of operations) {
    const [type, value] = op.split(' ').map(Number);
    if (type === 1) stack.push(value);
    else if (type === 2) stack.pop();
    else answer.push(Math.max(...stack));
  }
  return answer;
}`,
      },
    },
    {
      name: '同步最大值堆疊',
      idea: '另一個堆疊記錄每個深度的最大值，查詢只需看頂端。',
      steps: ['建立數值堆疊、最大值堆疊和答案陣列。', '推入 x 時，同時推入 max(x, 舊最大值)。', '移除時兩個堆疊一起彈出。', '查詢時把最大值堆疊頂端加入答案。'],
      figure: { title: '範例操作', steps: maximaFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每項操作只做常數次堆疊動作；兩個堆疊各最多 n 個元素。' },
      verdict: '推入、移除、查詢都是 O(1)，適合大量操作。',
      code: {
        python: `def getMax(operations):
    stack = []
    maxima = []
    answers = []
    for op in operations:
        parts = op.split()
        if parts[0] == '1':
            value = int(parts[1])
            stack.append(value)
            maxima.append(max(value, maxima[-1] if maxima else value))  # 此深度最大值
        elif parts[0] == '2':
            stack.pop()
            maxima.pop()
        else:
            answers.append(maxima[-1])
    return answers`,
        c: `int* getMax(int operations_count, char** operations, int* result_count) {
    int* stack = malloc(sizeof(int) * operations_count);
    int* maxima = malloc(sizeof(int) * operations_count);
    int* answer = malloc(sizeof(int) * operations_count);
    int top = 0;
    *result_count = 0;
    for (int i = 0; i < operations_count; i++) {
        int type, value;
        sscanf(operations[i], "%d %d", &type, &value);
        if (type == 1) {
            stack[top] = value;
            maxima[top] = top && maxima[top - 1] > value ? maxima[top - 1] : value;
            top++;
        } else if (type == 2) top--;
        else answer[(*result_count)++] = maxima[top - 1];
    }
    free(stack);
    free(maxima);
    return answer;
}`,
        cpp: `vector<int> getMax(vector<string> operations) {
    vector<int> stack, maxima, answer;
    for (const string& op : operations) {
        int type = stoi(op);
        if (type == 1) {
            int value = stoi(op.substr(2));
            stack.push_back(value);
            maxima.push_back(max(value, maxima.empty() ? value : maxima.back()));
        } else if (type == 2) {
            stack.pop_back();
            maxima.pop_back();
        } else answer.push_back(maxima.back());
    }
    return answer;
}`,
        java: `public static List<Integer> getMax(List<String> operations) {
    List<Integer> stack = new java.util.ArrayList<>();
    List<Integer> maxima = new java.util.ArrayList<>();
    List<Integer> answer = new java.util.ArrayList<>();
    for (String op : operations) {
        String[] parts = op.split(" ");
        int type = Integer.parseInt(parts[0]);
        if (type == 1) {
            int value = Integer.parseInt(parts[1]);
            stack.add(value);
            maxima.add(Math.max(value, maxima.isEmpty() ? value : maxima.get(maxima.size() - 1)));
        } else if (type == 2) {
            stack.remove(stack.size() - 1);
            maxima.remove(maxima.size() - 1);
        } else answer.add(maxima.get(maxima.size() - 1));
    }
    return answer;
}`,
        javascript: `function getMax(operations) {
  const stack = [];
  const maxima = [];
  const answer = [];
  for (const op of operations) {
    const [type, value] = op.split(' ').map(Number);
    if (type === 1) {
      stack.push(value);
      maxima.push(Math.max(value, maxima.length ? maxima[maxima.length - 1] : value));
    } else if (type === 2) {
      stack.pop();
      maxima.pop();
    } else answer.push(maxima[maxima.length - 1]);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '刪掉最大值後，不能用單一變數恢復之前的最大值。',
    '相同最大值可能出現多次；每層保存最大值可正確處理重複。',
    '只有查詢操作才加入回傳陣列，推入和移除沒有輸出。',
  ],
  check: {
    kind: 'fn', fn: 'getMax', cases: [
      { args: [operations], out: [26, 91] },
      { args: [['1 5', '1 5', '2', '3']], out: [5] },
      { args: [['1 1', '3']], out: [1] },
      { args: [['1 2', '1 1', '3', '2', '3']], out: [2, 2] },
      { args: [['1 9', '1 3', '2', '2', '1 4', '3']], out: [4] },
      { args: [['1 7', '1 8', '3', '2', '3']], out: [8, 7] },
    ],
  },
}
