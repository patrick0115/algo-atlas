import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const h = [1, 2, 3, 4, 5]

function intervalFig(): FigStep[] {
  const out: FigStep[] = []
  let best = 0
  for (let left = 0; left < h.length; left++) {
    let low = Infinity
    for (let right = left; right < h.length; right++) {
      low = Math.min(low, h[right])
      const area = low * (right - left + 1)
      best = Math.max(best, area)
      out.push({ note: `區間 [${left},${right}] 最低 ${low}、寬 ${right - left + 1}，面積 ${area}；目前最大 ${best}。`, views: [arr(h, { label: '柱高', highlight: Array.from({ length: right - left + 1 }, (_, k) => left + k) }), arr([low, area, best], { label: '最低、面積、最佳' })] })
    }
  }
  return out
}

function stackFig(): FigStep[] {
  const out: FigStep[] = [], stack: number[] = []
  let best = 0
  for (let i = 0; i <= h.length; i++) {
    const current = i === h.length ? 0 : h[i]
    while (stack.length && h[stack[stack.length - 1]] > current) {
      const top = stack.pop()!
      const left = stack.length ? stack[stack.length - 1] + 1 : 0
      const area = h[top] * (i - left)
      best = Math.max(best, area)
      out.push({ note: `到 ${i} 遇高度 ${current}，彈出柱 ${top}（高 ${h[top]}）；可延伸 [${left},${i - 1}]，面積 ${area}，最佳 ${best}。`, views: [arr(h, { label: '柱高', highlight: [top] }), arr([...stack], { label: '遞增堆疊：索引' }), arr([left, i, best], { label: '左界、右界外、最佳' })] })
    }
    stack.push(i)
    out.push({ note: `索引 ${i}${i === h.length ? ' 是高度 0 的結尾哨兵' : ` 高度 ${current}`}；入堆疊後索引為 ${stack.join('、')}。`, views: [arr(h, { label: '柱高', highlight: i < h.length ? [i] : [] }), arr([...stack], { label: '遞增堆疊：索引' }), arr([best], { label: '最大面積' })] })
  }
  return out
}

export const hrLargestRectangle: HrSolution = {
  slug: 'largest-rectangle',
  plain: '像連續拆掉幾棟樓蓋一座平頂商場；商場的高度受這段最矮的樓限制，求最大占地面積。',
  statement: '輸入各相鄰柱子的高度 h，每根寬度為 1。選一段連續柱子，矩形高度不能超過這段的最小柱高，面積為最小柱高乘區間寬度。求所有連續區間中最大面積。',
  examples: [
    { input: 'h = [1,2,3,4,5]', output: '9', note: '選後三根，高度 3、寬度 3，面積 9。' },
    { input: 'h = [3,2,3]', output: '6', note: '跨三根、高度 2，面積 6。' },
  ],
  constraints: [
    '柱數最多 10^5 → 枚舉所有區間 O(n²) 太慢。',
    '柱高最多 10^6 → 面積可達 10^11，使用 64 位元。',
    '矩形必須橫跨連續柱子 → 每根柱子的最大延伸範圍由左右第一根更矮的柱子決定。',
  ],
  insight: [
    '先枚舉左、右邊界，持續維護區間最低高度即可算面積，但區間有平方個。',
    '改以每根柱子為矩形的最低高度：何時知道它的右界？遇到第一根更矮的柱子時。',
    '維持高度遞增的索引 [[p:monotonic-stack]]；彈出時目前索引是右界，彈出後的堆疊頂是左界外。最後補高度 0 哨兵結算所有柱子。另可參考 [84](#/q/84)。',
  ],
  approaches: [
    {
      name: '枚舉每段連續區間',
      idea: '固定左界，右界逐步擴張，同時維護這段最低高度。',
      steps: ['將最大面積設為 0。', '對每個左界，將最低高度設為無限大。', '右界往右走，每次更新最低高度。', '用最低高度乘區間寬度更新答案。'],
      figure: { title: 'h=[1,2,3,4,5]', steps: intervalFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '共有 O(n²) 段連續區間；最低高度可增量更新。' },
      verdict: '適合小資料核對面積定義，大資料要避免重複考察區間。',
      code: {
        python: `def largestRectangle(h):
    answer = 0
    for left in range(len(h)):
        lowest = float('inf')
        for right in range(left, len(h)):
            lowest = min(lowest, h[right])  # 延長區間時維護最矮柱
            answer = max(answer, lowest * (right - left + 1))
    return answer`,
        c: `long long largestRectangle(int h_count, int* h) {
    long long answer = 0;
    for (int left = 0; left < h_count; left++) {
        int lowest = h[left];
        for (int right = left; right < h_count; right++) {
            if (h[right] < lowest) lowest = h[right];
            long long area = (long long)lowest * (right - left + 1);
            if (area > answer) answer = area;
        }
    }
    return answer;
}`,
        cpp: `long long largestRectangle(vector<int> h) {
    long long answer = 0;
    for (int left = 0; left < (int)h.size(); left++) {
        int lowest = h[left];
        for (int right = left; right < (int)h.size(); right++) {
            lowest = min(lowest, h[right]);
            answer = max(answer, 1LL * lowest * (right - left + 1));
        }
    }
    return answer;
}`,
        java: `public static long largestRectangle(List<Integer> h) {
    long answer = 0;
    for (int left = 0; left < h.size(); left++) {
        int lowest = h.get(left);
        for (int right = left; right < h.size(); right++) {
            lowest = Math.min(lowest, h.get(right));
            answer = Math.max(answer, (long)lowest * (right - left + 1));
        }
    }
    return answer;
}`,
        javascript: `function largestRectangle(h) {
  let answer = 0;
  for (let left = 0; left < h.length; left++) {
    let lowest = Infinity;
    for (let right = left; right < h.length; right++) {
      lowest = Math.min(lowest, h[right]);
      answer = Math.max(answer, lowest * (right - left + 1));
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '遞增高度堆疊',
      idea: '遇到更矮柱時，結算所有無法再向右延伸的柱子。',
      steps: ['建立存索引的空堆疊與答案 0。', '從左到右走，最後額外處理一根高度 0 的柱子。', '當堆疊頂高度大於目前高度時，彈出頂端作矩形高度；右界是目前位置前一格，左界是新堆疊頂後一格。', '計算面積、更新最大值，再把目前索引入堆疊。'],
      figure: { title: 'h=[1,2,3,4,5]', steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每根柱子最多入堆疊、出堆疊各一次；堆疊最多 n 個索引。' },
      verdict: '線性時間；哨兵可讓最後仍在堆疊中的柱子一起結算。',
      code: {
        python: `def largestRectangle(h):
    stack = []
    answer = 0
    for i in range(len(h) + 1):
        current = h[i] if i < len(h) else 0
        while stack and h[stack[-1]] > current:
            height = h[stack.pop()]
            left = stack[-1] + 1 if stack else 0
            answer = max(answer, height * (i - left))  # 目前位置是右界外
        stack.append(i)
    return answer`,
        c: `long long largestRectangle(int h_count, int* h) {
    int* stack = malloc(sizeof(int) * (h_count + 1));
    int top = 0;
    long long answer = 0;
    for (int i = 0; i <= h_count; i++) {
        int current = i == h_count ? 0 : h[i];
        while (top && h[stack[top - 1]] > current) {
            int height = h[stack[--top]];
            int left = top ? stack[top - 1] + 1 : 0;
            long long area = (long long)height * (i - left);
            if (area > answer) answer = area;
        }
        stack[top++] = i;
    }
    free(stack);
    return answer;
}`,
        cpp: `long long largestRectangle(vector<int> h) {
    vector<int> stack;
    long long answer = 0;
    for (int i = 0; i <= (int)h.size(); i++) {
        int current = i == (int)h.size() ? 0 : h[i];
        while (!stack.empty() && h[stack.back()] > current) {
            int height = h[stack.back()];
            stack.pop_back();
            int left = stack.empty() ? 0 : stack.back() + 1;
            answer = max(answer, 1LL * height * (i - left));
        }
        stack.push_back(i);
    }
    return answer;
}`,
        java: `public static long largestRectangle(List<Integer> h) {
    java.util.ArrayDeque<Integer> stack = new java.util.ArrayDeque<>();
    long answer = 0;
    for (int i = 0; i <= h.size(); i++) {
        int current = i == h.size() ? 0 : h.get(i);
        while (!stack.isEmpty() && h.get(stack.peek()) > current) {
            int height = h.get(stack.pop());
            int left = stack.isEmpty() ? 0 : stack.peek() + 1;
            answer = Math.max(answer, (long)height * (i - left));
        }
        stack.push(i);
    }
    return answer;
}`,
        javascript: `function largestRectangle(h) {
  const stack = [];
  let answer = 0;
  for (let i = 0; i <= h.length; i++) {
    const current = i === h.length ? 0 : h[i];
    while (stack.length && h[stack[stack.length - 1]] > current) {
      const height = h[stack.pop()];
      const left = stack.length ? stack[stack.length - 1] + 1 : 0;
      answer = Math.max(answer, height * (i - left));
    }
    stack.push(i);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '面積是區間最低高度乘連續寬度，不能把各柱高相加。',
    '彈出後的堆疊頂是左邊第一根不高於目前柱的索引，寬度公式為 i−top−1。',
    '走到結尾仍未彈出的柱子需要高度 0 哨兵結算。',
  ],
  check: {
    kind: 'fn', fn: 'largestRectangle', cases: [
      { args: [[1, 2, 3, 4, 5]], out: 9 },
      { args: [[3, 2, 3]], out: 6 },
      { args: [[5]], out: 5 },
      { args: [[2, 2, 2]], out: 6 },
      { args: [[1, 1, 1]], out: 3 },
      { args: [[6, 2, 5, 4, 5, 1, 6]], out: 12 },
    ],
  },
}
