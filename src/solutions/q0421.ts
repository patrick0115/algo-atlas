import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 421. Maximum XOR of Two Numbers in an Array
const A = [3, 10, 5, 25, 2, 8]

export const q0421: Solution = {
  id: 421,
  plain: '從陣列選兩個數，逐位比較它們的二進位數字；不同的位會讓 XOR 那一位變成 1。求最大的 XOR 值。',
  statement: '給非負整數陣列 nums，求其中兩個數執行 XOR 後的最大值；只有一個數時答案為 0。',
  examples: [
    { input: 'nums = [3,10,5,25,2,8]', output: '28', note: '5 XOR 25 = 28。' },
    { input: 'nums = [0]', output: '0' },
    { input: 'nums = [2,4]', output: '6' },
  ],
  constraints: ['1 ≤ nums.length ≤ 2×10⁵；0 ≤ nums[i] < 2³¹。'],
  insight: ['XOR 的高位比低位重要：高位若能不同，就應優先讓這一位成為 1。', '把所有數的位元放進二元 Trie；查詢一個數時，每層優先走相反位元。'],
  approaches: [
    {
      name: '列舉所有數字對',
      idea: '直接計算每對 nums[i] XOR nums[j] 並取最大。',
      steps: ['答案從 0 開始。', '對每個 i，讓 j 從 i+1 開始。', '計算 XOR 並更新最大值。'],
      figure: { title: 'nums = [3,10,5,25,2,8]', steps: [
        { note: '先比較 3 與右邊各數；3 XOR 25 = 26，暫時最好。', views: [arr(A, { highlight: [0], compare: [3] }), arr([26], { label: '目前最大值' })] },
        { note: '接著固定 10；10 XOR 25 = 19，沒有超過 26。', views: [arr(A, { highlight: [1], compare: [3] }), arr([26], { label: '目前最大值' })] },
        { note: '固定 5，與 25 做 XOR 得 28，刷新答案。', views: [arr(A, { highlight: [2], compare: [3] }), arr([28], { label: '目前最大值', done: [0] })] },
        { note: '之後的數字對都不超過 28，最後回傳 28。', views: [arr(A, { done: [0, 1, 2, 3, 4, 5] }), arr([28], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '檢查所有不同位置的配對。' },
      verdict: '適合小資料驗算；n 很大時不可行。',
      code: {
        python: `def findMaximumXOR(nums):
    answer = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            answer = max(answer, nums[i] ^ nums[j])  # 逐對比較
    return answer`,
        c: `int findMaximumXOR(int *nums, int numsSize) {
    int answer = 0;
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            int value = nums[i] ^ nums[j];
            if (value > answer) {
                answer = value;
            }
        }
    }
    return answer;
}`,
        cpp: `int findMaximumXOR(vector<int>& nums) {
    int answer = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        for (int j = i + 1; j < (int)nums.size(); j++) {
            answer = max(answer, nums[i] ^ nums[j]);
        }
    }
    return answer;
}`,
        java: `int findMaximumXOR(int[] nums) {
    int answer = 0;
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            answer = Math.max(answer, nums[i] ^ nums[j]);
        }
    }
    return answer;
}`,
        javascript: `function findMaximumXOR(nums) {
  let answer = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      answer = Math.max(answer, nums[i] ^ nums[j]);
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '二進位 Trie 貪心配對',
      idea: 'Trie 每層表示一個位元；查詢 x 時優先走相反位，讓當前 XOR 高位成為 1。',
      steps: ['由第 30 位到第 0 位，把每個數插入二元 Trie。', '對每個 x 從最高位查詢；若相反位分支存在就走過去並把結果該位設為 1。', '將所有查詢的 XOR 結果取最大。'],
      figure: { title: 'nums = [3,10,5,25,2,8]', steps: [
        { note: '把每個數由高位到低位放入 Trie；例如 5 的低五位是 00101。', views: [arr([0, 0, 1, 0, 1], { label: '5 的低五位' })] },
        { note: '查 5 時，最高有用位希望找 1；Trie 中 25 的低五位 11001 可提供。', views: [arr([1, 1, 0, 0, 1], { label: '25 的低五位', highlight: [0, 1, 2] })] },
        { note: '逐位優先走相反分支，5 XOR 25 的低五位為 11100。', views: [arr([1, 1, 1, 0, 0], { label: 'XOR 結果的低五位', done: [0, 1, 2] })] },
        { note: '二進位 11100 是十進位 28；其他查詢沒有更大值。', views: [arr([5, 25, 28], { label: '配對與結果', done: [2] })] },
      ] },
      complexity: { time: 'O(31n)', space: 'O(31n)', why: '每個數插入及查詢各走 31 層。' },
      verdict: '資料量大時使用；優先讓高位 XOR 為 1 是關鍵貪心。',
      code: {
        python: `def findMaximumXOR(nums):
    root = {}
    for x in nums:
        node = root
        for bit in range(30, -1, -1):
            b = (x >> bit) & 1
            node = node.setdefault(b, {})  # 依位元插入 Trie
    answer = 0
    for x in nums:
        node = root
        value = 0
        for bit in range(30, -1, -1):
            b = (x >> bit) & 1
            wanted = 1 - b
            if wanted in node:
                value |= 1 << bit  # 相反位可讓 XOR 此位為 1
                node = node[wanted]
            else:
                node = node[b]
        answer = max(answer, value)
    return answer`,
        c: `int findMaximumXOR(int *nums, int numsSize) {
    int capacity = numsSize * 31 + 1;
    int (*child)[2] = calloc(capacity, sizeof(*child));
    int nodes = 1;
    for (int i = 0; i < numsSize; i++) {
        int node = 0;
        for (int bit = 30; bit >= 0; bit--) {
            int b = (nums[i] >> bit) & 1;
            if (child[node][b] == 0) {
                child[node][b] = nodes++;
            }
            node = child[node][b];
        }
    }
    int answer = 0;
    for (int i = 0; i < numsSize; i++) {
        int node = 0;
        int value = 0;
        for (int bit = 30; bit >= 0; bit--) {
            int b = (nums[i] >> bit) & 1;
            if (child[node][1 - b] != 0) {
                value |= 1 << bit;
                node = child[node][1 - b];
            } else {
                node = child[node][b];
            }
        }
        if (value > answer) {
            answer = value;
        }
    }
    free(child);
    return answer;
}`,
        cpp: `int findMaximumXOR(vector<int>& nums) {
    vector<array<int, 2>> child(1, {0, 0});
    for (int x : nums) {
        int node = 0;
        for (int bit = 30; bit >= 0; bit--) {
            int b = (x >> bit) & 1;
            if (child[node][b] == 0) {
                child[node][b] = child.size();
                child.push_back({0, 0});
            }
            node = child[node][b];
        }
    }
    int answer = 0;
    for (int x : nums) {
        int node = 0;
        int value = 0;
        for (int bit = 30; bit >= 0; bit--) {
            int b = (x >> bit) & 1;
            if (child[node][1 - b] != 0) {
                value |= 1 << bit;
                node = child[node][1 - b];
            } else {
                node = child[node][b];
            }
        }
        answer = max(answer, value);
    }
    return answer;
}`,
        java: `private static class TrieNode {
    TrieNode[] child = new TrieNode[2];
}

int findMaximumXOR(int[] nums) {
    TrieNode root = new TrieNode();
    for (int x : nums) {
        TrieNode node = root;
        for (int bit = 30; bit >= 0; bit--) {
            int b = (x >> bit) & 1;
            if (node.child[b] == null) {
                node.child[b] = new TrieNode();
            }
            node = node.child[b];
        }
    }
    int answer = 0;
    for (int x : nums) {
        TrieNode node = root;
        int value = 0;
        for (int bit = 30; bit >= 0; bit--) {
            int b = (x >> bit) & 1;
            if (node.child[1 - b] != null) {
                value |= 1 << bit;
                node = node.child[1 - b];
            } else {
                node = node.child[b];
            }
        }
        answer = Math.max(answer, value);
    }
    return answer;
}`,
        javascript: `function findMaximumXOR(nums) {
  const root = [null, null];
  for (const x of nums) {
    let node = root;
    for (let bit = 30; bit >= 0; bit--) {
      const b = (x >> bit) & 1;
      if (!node[b]) {
        node[b] = [null, null];
      }
      node = node[b];
    }
  }
  let answer = 0;
  for (const x of nums) {
    let node = root;
    let value = 0;
    for (let bit = 30; bit >= 0; bit--) {
      const b = (x >> bit) & 1;
      if (node[1 - b]) {
        value |= 1 << bit;
        node = node[1 - b];
      } else {
        node = node[b];
      }
    }
    answer = Math.max(answer, value);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['高位優先，從第 30 位往第 0 位走；數值非負且小於 2³¹。', '即使 Trie 含查詢的數本身，也不會把答案高估；若只有一個數，與自己 XOR 為 0。', 'C++ 插入新節點時先寫子索引，再擴充 vector，避免保留失效的參考。'],
  check: { kind: 'fn', fn: 'findMaximumXOR', cases: [
    { args: [A], out: 28 },
    { args: [[0]], out: 0 },
    { args: [[2, 4]], out: 6 },
    { args: [[8, 10, 2]], out: 10 },
  ] },
}
