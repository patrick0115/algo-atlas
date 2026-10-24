import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [1, 3, 5]
const bitFig: FigStep[] = [
  { note: '建構時記住原陣列 [1,3,5]，樹狀陣列的 1 起始索引內容為 [1,4,5]。', views: [arr(A, { label: 'nums' }), arr([1, 4, 5], { label: 'BIT 索引 1..3' })] },
  { note: 'sumRange(0,2) = prefix(3)−prefix(0) = 9；prefix 從索引 3 取 5，再跳索引 2 取 4。', views: [arr([1, 4, 5], { label: 'BIT', highlight: [1, 2] }), arr([9], { label: '區間和' })] },
  { note: 'update(1,2) 把 3 改成 2，差值 −1；從 BIT 索引 2 開始更新，4 變成 3。', views: [arr([1, 2, 5], { label: '更新後 nums', highlight: [1] }), arr([1, 3, 5], { label: '更新後 BIT', highlight: [1] })] },
  { note: '再次 sumRange(0,2)，prefix(3)=5+3=8，答案變成 8。', views: [arr([8], { label: '新區間和', done: [0] })] },
]
const segFig: FigStep[] = [
  { note: '將 [1,3,5] 放在線段樹葉節點，父節點存孩子總和；整段的根節點值為 9。', views: [arr(A, { label: '葉節點' }), arr([9], { label: '總和' })] },
  { note: '查詢 [0,2] 時，沿樹向上收集完全落在區間內的節點，得到 9。', views: [arr(A, { label: '查詢範圍', done: [0, 1, 2] }), arr([9], { label: '查詢結果' })] },
  { note: '把索引 1 的葉節點從 3 改成 2，沿途重新計算父節點。', views: [arr([1, 2, 5], { label: '更新後葉節點', highlight: [1] }), arr([8], { label: '新根節點值' })] },
  { note: '查詢 [0,2] 現在得到 8；其他不含索引 1 的區間仍不受影響。', views: [arr([1, 2, 5], { label: '查詢範圍', done: [0, 1, 2] }), arr([8], { label: '答案', done: [0] })] },
]

export const q0307: Solution = {
  id: 307,
  plain: '陣列的值會改，還要反覆查詢任意一段的總和。',
  statement: '設計 NumArray：建構時接收 nums；update(index,val) 改變指定元素；sumRange(left,right) 回傳含兩端的區間總和。',
  examples: [{ input: 'NumArray([1,3,5]); sumRange(0,2); update(1,2); sumRange(0,2)', output: '9, 8' }],
  constraints: ['1 ≤ nums.length ≤ 3·10⁴', '−100 ≤ nums[i], val ≤ 100', 'update 與 sumRange 最多各呼叫 3·10⁴ 次'],
  insight: ['[303](#/q/303) 的前綴和讓查詢很快，但每次更新可能要重算整段後綴。', '樹狀陣列以位元最低位決定涵蓋範圍，更新與前綴查詢都是對數時間。', '線段樹將區間分層合併，也能在對數時間更新與查詢。'],
  approaches: [
    {
      name: '樹狀陣列 Fenwick Tree',
      idea: 'BIT 存多個區塊的和；更新時加入差值，區間和用兩個前綴和相減。',
      steps: ['保留 nums 的複本與長度 n+1 的 BIT', '建構時逐值呼叫 add', 'update 算出 val−舊值，沿 i+=i&−i 更新', 'sumRange 回傳 prefix(right+1)−prefix(left)'],
      figure: { title: 'nums = [1,3,5]；更新索引 1 為 2', steps: bitFig },
      complexity: { time: '建構 O(n log n)，更新 O(log n)，查詢 O(log n)', space: 'O(n)', why: 'BIT 每次沿位元決定的祖先走對數步。' },
      verdict: '程式較短，是 [[p:segment-tree]] 類別中處理「單點更新、區間和」的常用選擇。',
      code: {
        python: `class NumArray:
    def __init__(self, nums):
        self.values = nums[:]
        self.bit = [0] * (len(nums) + 1)
        for i, value in enumerate(nums):
            self.add(i + 1, value)       # 建立 BIT

    def add(self, index, delta):
        while index < len(self.bit):
            self.bit[index] += delta
            index += index & -index

    def prefix(self, index):
        total = 0
        while index:
            total += self.bit[index]
            index -= index & -index
        return total

    def update(self, index, val):
        delta = val - self.values[index]
        self.values[index] = val
        self.add(index + 1, delta)

    def sumRange(self, left, right):
        return self.prefix(right + 1) - self.prefix(left)`,
        c: `typedef struct {
    int n;
    int *values;
    int *bit;
} NumArray;

static void add(NumArray *obj, int index, int delta) {
    while (index <= obj->n) {
        obj->bit[index] += delta;
        index += index & -index;
    }
}

static int prefix(NumArray *obj, int index) {
    int total = 0;
    while (index > 0) {
        total += obj->bit[index];
        index -= index & -index;
    }
    return total;
}

NumArray *numArrayCreate(int *nums, int numsSize) {
    NumArray *obj = malloc(sizeof(NumArray));
    obj->n = numsSize;
    obj->values = malloc(numsSize * sizeof(int));
    obj->bit = calloc(numsSize + 1, sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        obj->values[i] = nums[i];
        add(obj, i + 1, nums[i]);
    }
    return obj;
}

void numArrayUpdate(NumArray *obj, int index, int val) {
    int delta = val - obj->values[index];
    obj->values[index] = val;
    add(obj, index + 1, delta);
}

int numArraySumRange(NumArray *obj, int left, int right) {
    return prefix(obj, right + 1) - prefix(obj, left);
}

void numArrayFree(NumArray *obj) {
    free(obj->values);
    free(obj->bit);
    free(obj);
}`,
        cpp: `class NumArray {
    vector<int> values;
    vector<int> bit;

    void add(int index, int delta) {
        while (index < (int)bit.size()) {
            bit[index] += delta;
            index += index & -index;
        }
    }

    int prefix(int index) {
        int total = 0;
        while (index > 0) {
            total += bit[index];
            index -= index & -index;
        }
        return total;
    }

public:
    NumArray(vector<int>& nums) : values(nums), bit(nums.size() + 1) {
        for (int i = 0; i < (int)nums.size(); i++) {
            add(i + 1, nums[i]);
        }
    }

    void update(int index, int val) {
        int delta = val - values[index];
        values[index] = val;
        add(index + 1, delta);
    }

    int sumRange(int left, int right) {
        return prefix(right + 1) - prefix(left);
    }
};`,
        java: `class NumArray {
    private int[] values;
    private int[] bit;

    public NumArray(int[] nums) {
        values = nums.clone();
        bit = new int[nums.length + 1];
        for (int i = 0; i < nums.length; i++) {
            add(i + 1, nums[i]);
        }
    }

    private void add(int index, int delta) {
        while (index < bit.length) {
            bit[index] += delta;
            index += index & -index;
        }
    }

    private int prefix(int index) {
        int total = 0;
        while (index > 0) {
            total += bit[index];
            index -= index & -index;
        }
        return total;
    }

    public void update(int index, int val) {
        int delta = val - values[index];
        values[index] = val;
        add(index + 1, delta);
    }

    public int sumRange(int left, int right) {
        return prefix(right + 1) - prefix(left);
    }
}`,
        javascript: `class NumArray {
  constructor(nums) {
    this.values = [...nums];
    this.bit = Array(nums.length + 1).fill(0);
    for (let i = 0; i < nums.length; i++) {
      this.add(i + 1, nums[i]);
    }
  }

  add(index, delta) {
    while (index < this.bit.length) {
      this.bit[index] += delta;
      index += index & -index;
    }
  }

  prefix(index) {
    let total = 0;
    while (index > 0) {
      total += this.bit[index];
      index -= index & -index;
    }
    return total;
  }

  update(index, val) {
    const delta = val - this.values[index];
    this.values[index] = val;
    this.add(index + 1, delta);
  }

  sumRange(left, right) {
    return this.prefix(right + 1) - this.prefix(left);
  }
}`,
      },
    },
    {
      name: '迭代式線段樹',
      idea: '葉節點存各元素，父節點存兩孩子的和；更新葉節點後重算祖先，查詢時收集完整落在範圍內的節點。',
      steps: ['配置長度 2n 的樹陣列，把 nums 放在後半葉節點', '由下往上建立父節點總和', 'update 改葉節點並重算沿途祖先', 'sumRange 用左右指標往上收集區間和'],
      figure: { title: 'nums = [1,3,5]；更新索引 1 為 2', steps: segFig },
      complexity: { time: '建構 O(n)，更新 O(log n)，查詢 O(log n)', space: 'O(n)', why: '迭代線段樹有 2n 格，每次操作只走樹高。' },
      verdict: '結構較通用；日後若區間要存最大值或其他可合併資訊，可沿用 [[p:segment-tree]]。',
      code: {
        python: `class NumArray:
    def __init__(self, nums):
        self.n = len(nums)
        self.tree = [0] * (2 * self.n)
        self.tree[self.n:] = nums[:]     # 葉節點
        for i in range(self.n - 1, 0, -1):
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def update(self, index, val):
        pos = index + self.n
        self.tree[pos] = val
        while pos > 1:
            pos //= 2
            self.tree[pos] = self.tree[2 * pos] + self.tree[2 * pos + 1]

    def sumRange(self, left, right):
        left += self.n
        right += self.n
        total = 0
        while left <= right:
            if left % 2:
                total += self.tree[left]
                left += 1
            if not right % 2:
                total += self.tree[right]
                right -= 1
            left //= 2
            right //= 2
        return total`,
        c: `typedef struct {
    int n;
    int *tree;
} NumArray;

NumArray *numArrayCreate(int *nums, int numsSize) {
    NumArray *obj = malloc(sizeof(NumArray));
    obj->n = numsSize;
    obj->tree = calloc(2 * numsSize, sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        obj->tree[numsSize + i] = nums[i];
    }
    for (int i = numsSize - 1; i > 0; i--) {
        obj->tree[i] = obj->tree[2 * i] + obj->tree[2 * i + 1];
    }
    return obj;
}

void numArrayUpdate(NumArray *obj, int index, int val) {
    int pos = index + obj->n;
    obj->tree[pos] = val;
    while (pos > 1) {
        pos /= 2;
        obj->tree[pos] = obj->tree[2 * pos] + obj->tree[2 * pos + 1];
    }
}

int numArraySumRange(NumArray *obj, int left, int right) {
    left += obj->n;
    right += obj->n;
    int total = 0;
    while (left <= right) {
        if (left % 2 == 1) {
            total += obj->tree[left++];
        }
        if (right % 2 == 0) {
            total += obj->tree[right--];
        }
        left /= 2;
        right /= 2;
    }
    return total;
}

void numArrayFree(NumArray *obj) {
    free(obj->tree);
    free(obj);
}`,
        cpp: `class NumArray {
    int n;
    vector<int> tree;

public:
    NumArray(vector<int>& nums) : n(nums.size()), tree(2 * nums.size()) {
        for (int i = 0; i < n; i++) {
            tree[n + i] = nums[i];
        }
        for (int i = n - 1; i > 0; i--) {
            tree[i] = tree[2 * i] + tree[2 * i + 1];
        }
    }

    void update(int index, int val) {
        int pos = index + n;
        tree[pos] = val;
        while (pos > 1) {
            pos /= 2;
            tree[pos] = tree[2 * pos] + tree[2 * pos + 1];
        }
    }

    int sumRange(int left, int right) {
        left += n;
        right += n;
        int total = 0;
        while (left <= right) {
            if (left % 2 == 1) {
                total += tree[left++];
            }
            if (right % 2 == 0) {
                total += tree[right--];
            }
            left /= 2;
            right /= 2;
        }
        return total;
    }
};`,
        java: `class NumArray {
    private int n;
    private int[] tree;

    public NumArray(int[] nums) {
        n = nums.length;
        tree = new int[2 * n];
        for (int i = 0; i < n; i++) {
            tree[n + i] = nums[i];
        }
        for (int i = n - 1; i > 0; i--) {
            tree[i] = tree[2 * i] + tree[2 * i + 1];
        }
    }

    public void update(int index, int val) {
        int pos = index + n;
        tree[pos] = val;
        while (pos > 1) {
            pos /= 2;
            tree[pos] = tree[2 * pos] + tree[2 * pos + 1];
        }
    }

    public int sumRange(int left, int right) {
        left += n;
        right += n;
        int total = 0;
        while (left <= right) {
            if (left % 2 == 1) {
                total += tree[left++];
            }
            if (right % 2 == 0) {
                total += tree[right--];
            }
            left /= 2;
            right /= 2;
        }
        return total;
    }
}`,
        javascript: `class NumArray {
  constructor(nums) {
    this.n = nums.length;
    this.tree = Array(2 * this.n).fill(0);
    for (let i = 0; i < this.n; i++) {
      this.tree[this.n + i] = nums[i];
    }
    for (let i = this.n - 1; i > 0; i--) {
      this.tree[i] = this.tree[2 * i] + this.tree[2 * i + 1];
    }
  }

  update(index, val) {
    let pos = index + this.n;
    this.tree[pos] = val;
    while (pos > 1) {
      pos = Math.floor(pos / 2);
      this.tree[pos] = this.tree[2 * pos] + this.tree[2 * pos + 1];
    }
  }

  sumRange(left, right) {
    left += this.n;
    right += this.n;
    let total = 0;
    while (left <= right) {
      if (left % 2 === 1) {
        total += this.tree[left++];
      }
      if (right % 2 === 0) {
        total += this.tree[right--];
      }
      left = Math.floor(left / 2);
      right = Math.floor(right / 2);
    }
    return total;
  }
}`,
      },
    },
  ],
  pitfalls: ['更新傳入的是新值，要先算與舊值的差，不能直接把新值加進 BIT。', 'sumRange 的兩端都包含在內，BIT 公式為 prefix(right+1)−prefix(left)。', '線段樹葉節點索引從 n 起算，不能把原陣列索引直接當樹索引。'],
  check: { kind: 'class', cls: 'NumArray', cases: [
    { ops: ['NumArray', 'sumRange', 'update', 'sumRange'], args: [[A], [0, 2], [1, 2], [0, 2]], out: [null, 9, null, 8] },
    { ops: ['NumArray', 'sumRange', 'update', 'sumRange', 'sumRange'], args: [[[7]], [0, 0], [0, -3], [0, 0], [0, 0]], out: [null, 7, null, -3, -3] },
    { ops: ['NumArray', 'sumRange', 'update', 'sumRange'], args: [[[1, 2, 3, 4]], [1, 2], [0, 5], [0, 3]], out: [null, 5, null, 14] },
  ] },
}
