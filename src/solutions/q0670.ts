import { arr } from '../engine/helpers'
import type { Solution } from './types'

export const q0670: Solution = {
  id: 670,
  plain: '最多交換一對數字位置，讓整個整數變得最大。',
  statement: '給非負整數 num。可交換任意兩個十進位數字一次，也可以不交換。回傳可得到的最大整數。',
  examples: [{ input: 'num = 2736', output: '7236' }, { input: 'num = 9973', output: '9973' }],
  constraints: ['0 ≤ num ≤ 10⁸。'],
  insight: ['高位數字越大，整數越大，所以要優先改善最左邊能改善的位置。', '若同一個最大數字在右側出現多次，交換最右邊那個，才能留下較大的後綴。'],
  approaches: [
    {
      name: '記錄每個數字最後位置',
      idea: '從左到右看每一位；在右邊找是否有更大的數字，優先挑最大、最右邊的。',
      steps: ['轉成數字字元陣列', '記錄 0 到 9 各自最後出現的位置', '從左到右掃每個位置，從 9 向下找更大的數字', '找到右側出現的位置就交換並立即回傳'],
      figure: { title: 'num = 2736', steps: [
        { note: '數字為 2、7、3、6；記下 7 最後出現在索引 1。', views: [arr([2, 7, 3, 6], { label: '各位數' })] },
        { note: '看最左邊的 2，右側有比 2 更大的數字 7。', views: [arr([2, 7, 3, 6], { label: '待交換', highlight: [0, 1] })] },
        { note: '交換 2 與 7，得到 7、2、3、6；高位已盡量大。', views: [arr([7, 2, 3, 6], { label: '交換後', highlight: [0, 1] })] },
        { note: '組回整數 7236，立即停止，因為只允許一次交換。', views: [arr([7236], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(d×10)', space: 'O(d + 10)', why: 'd 是位數，每位至多查看十種數字。' },
      verdict: '直接保證第一個改善位置取得最大值。',
      code: {
        python: `def maximumSwap(num):
    digits = list(str(num))
    last = [-1] * 10
    for i, ch in enumerate(digits):
        last[int(ch)] = i
    for i, ch in enumerate(digits):
        for value in range(9, int(ch), -1):
            if last[value] > i:
                j = last[value]
                digits[i], digits[j] = digits[j], digits[i]  # 改善最高位
                return int(''.join(digits))
    return num`,
        c: `int maximumSwap(int num) {
    char digits[16];
    sprintf(digits, "%d", num);
    int length = strlen(digits);
    int last[10];
    for (int value = 0; value < 10; value++) {
        last[value] = -1;
    }
    for (int i = 0; i < length; i++) {
        last[digits[i] - '0'] = i;
    }
    for (int i = 0; i < length; i++) {
        for (int value = 9; value > digits[i] - '0'; value--) {
            int j = last[value];
            if (j > i) {
                char temp = digits[i];
                digits[i] = digits[j];
                digits[j] = temp;
                return atoi(digits);
            }
        }
    }
    return num;
}`,
        cpp: `int maximumSwap(int num) {
    string digits = to_string(num);
    vector<int> last(10, -1);
    for (int i = 0; i < (int)digits.size(); i++) {
        last[digits[i] - '0'] = i;
    }
    for (int i = 0; i < (int)digits.size(); i++) {
        for (int value = 9; value > digits[i] - '0'; value--) {
            int j = last[value];
            if (j > i) {
                swap(digits[i], digits[j]);
                return stoi(digits);
            }
        }
    }
    return num;
}`,
        java: `int maximumSwap(int num) {
    char[] digits = Integer.toString(num).toCharArray();
    int[] last = new int[10];
    Arrays.fill(last, -1);
    for (int i = 0; i < digits.length; i++) {
        last[digits[i] - '0'] = i;
    }
    for (int i = 0; i < digits.length; i++) {
        for (int value = 9; value > digits[i] - '0'; value--) {
            int j = last[value];
            if (j > i) {
                char temp = digits[i];
                digits[i] = digits[j];
                digits[j] = temp;
                return Integer.parseInt(new String(digits));
            }
        }
    }
    return num;
}`,
        javascript: `function maximumSwap(num) {
  const digits = String(num).split('');
  const last = new Array(10).fill(-1);
  for (let i = 0; i < digits.length; i++) {
    last[Number(digits[i])] = i;
  }
  for (let i = 0; i < digits.length; i++) {
    for (let value = 9; value > Number(digits[i]); value--) {
      const j = last[value];
      if (j > i) {
        [digits[i], digits[j]] = [digits[j], digits[i]];
        return Number(digits.join(''));
      }
    }
  }
  return num;
}`,
      },
    },
    {
      name: '枚舉所有交換位置',
      idea: '位數很少，直接試所有 i<j 的交換，保留最大的結果。',
      steps: ['將 num 轉為數字陣列', '列舉所有 i<j', '暫時交換兩位並轉回整數', '更新最大值後換回'],
      figure: { title: 'num = 2736', steps: [
        { note: '原數 2736 先作為最佳答案；尚未使用交換。', views: [arr([2, 7, 3, 6], { label: '原數' })] },
        { note: '交換前兩位，得到 7236，最佳值變成 7236。', views: [arr([7, 2, 3, 6], { label: '候選', highlight: [0, 1] })] },
        { note: '也試交換 2 與 6，得到 6732，仍比 7236 小。', views: [arr([6, 7, 3, 2], { label: '另一候選', highlight: [0, 3] })] },
        { note: '所有配對比較完，最大的仍是 7236。', views: [arr([7236], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(d³)', space: 'O(d)', why: 'O(d²) 對位置，每次組回整數需 O(d)。' },
      verdict: '位數上限小，作為直觀對照也可通過。',
      code: {
        python: `def maximumSwap(num):
    digits = list(str(num))
    best = num
    for i in range(len(digits)):
        for j in range(i + 1, len(digits)):
            digits[i], digits[j] = digits[j], digits[i]
            best = max(best, int(''.join(digits)))  # 評估這次交換
            digits[i], digits[j] = digits[j], digits[i]
    return best`,
        c: `int maximumSwap(int num) {
    char digits[16];
    sprintf(digits, "%d", num);
    int length = strlen(digits);
    int best = num;
    for (int i = 0; i < length; i++) {
        for (int j = i + 1; j < length; j++) {
            char temp = digits[i];
            digits[i] = digits[j];
            digits[j] = temp;
            int candidate = atoi(digits);
            if (candidate > best) {
                best = candidate;
            }
            temp = digits[i];
            digits[i] = digits[j];
            digits[j] = temp;
        }
    }
    return best;
}`,
        cpp: `int maximumSwap(int num) {
    string digits = to_string(num);
    int best = num;
    for (int i = 0; i < (int)digits.size(); i++) {
        for (int j = i + 1; j < (int)digits.size(); j++) {
            swap(digits[i], digits[j]);
            best = max(best, stoi(digits));
            swap(digits[i], digits[j]);
        }
    }
    return best;
}`,
        java: `int maximumSwap(int num) {
    char[] digits = Integer.toString(num).toCharArray();
    int best = num;
    for (int i = 0; i < digits.length; i++) {
        for (int j = i + 1; j < digits.length; j++) {
            char temp = digits[i];
            digits[i] = digits[j];
            digits[j] = temp;
            best = Math.max(best, Integer.parseInt(new String(digits)));
            temp = digits[i];
            digits[i] = digits[j];
            digits[j] = temp;
        }
    }
    return best;
}`,
        javascript: `function maximumSwap(num) {
  const digits = String(num).split('');
  let best = num;
  for (let i = 0; i < digits.length; i++) {
    for (let j = i + 1; j < digits.length; j++) {
      [digits[i], digits[j]] = [digits[j], digits[i]];
      best = Math.max(best, Number(digits.join('')));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: ['只交換一次；多次交換可能得到更大的數，但不合法。', '右邊有多個相同最大數字時，應選最右者。'],
  check: { kind: 'fn', fn: 'maximumSwap', cases: [
    { args: [2736], out: 7236 },
    { args: [9973], out: 9973 },
    { args: [98368], out: 98863 },
    { args: [0], out: 0 },
  ] },
}
