import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 204. Count Primes
export const q0204: Solution = {
  id: 204,
  plain: '數出小於 n 的質數有幾個；質數只能被 1 和自己整除。',
  statement: '給非負整數 n，回傳所有小於 n 的質數數量。n 本身不計入。',
  examples: [{ input: 'n = 10', output: '4', note: '2、3、5、7。' }, { input: 'n = 2', output: '0' }],
  constraints: ['0 ≤ n ≤ 5×10⁶；大 n 需要比逐個試除更快的方法。'],
  insight: ['如果 i 是質數，其倍數都不是質數。', '從 i² 開始篩，較小的倍數已被更小的質因數處理過。', '這是 [[p:math]] 中的埃拉托斯特尼篩法。'],
  approaches: [
    {
      name: '埃氏篩',
      idea: '先假設 2..n−1 都是質數，再把每個質數的倍數劃掉。',
      steps: ['建立 isPrime，先設 2..n−1 為 true。', '對 i²<n 的每個未劃掉 i，從 i² 開始劃掉倍數。', '統計仍為 true 的數。'],
      figure: { title: 'n = 10', steps: [
        { note: '候選數是 2..9；0、1 不是質數。', views: [arr([2, 3, 4, 5, 6, 7, 8, 9], { label: '候選數' })] },
        { note: '2 是質數；劃掉 4、6、8。', views: [arr([2, 3, 4, 5, 6, 7, 8, 9], { label: '篩 2', dim: [2, 4, 6], highlight: [0] })] },
        { note: '3 是質數；從 3²=9 開始劃掉 9。6 已被 2 劃掉。', views: [arr([2, 3, 4, 5, 6, 7, 8, 9], { label: '篩 3', dim: [2, 4, 6, 7], highlight: [1] })] },
        { note: '剩下 2、3、5、7，共 4 個質數。', views: [arr([2, 3, 5, 7], { label: '質數', done: [0, 1, 2, 3] })] },
      ] },
      complexity: { time: 'O(n log log n)', space: 'O(n)', why: '每個質數標記其倍數；需要 n 個旗標。' },
      verdict: '本題資料範圍的標準解。',
      code: {
        python: `def countPrimes(n):
    prime = [True] * n
    if n > 0:
        prime[0] = False
    if n > 1:
        prime[1] = False
    p = 2
    while p * p < n:
        if prime[p]:
            for multiple in range(p * p, n, p):
                prime[multiple] = False   # 劃掉質數的倍數
        p += 1
    return sum(prime)`,
        c: `int countPrimes(int n) {
    if (n < 3) {
        return 0;
    }
    bool *prime = malloc(n * sizeof(bool));
    memset(prime, 1, n * sizeof(bool));
    prime[0] = false;
    prime[1] = false;
    for (int p = 2; p <= (n - 1) / p; p++) {
        if (!prime[p]) {
            continue;
        }
        for (int multiple = p * p; multiple < n; multiple += p) {
            prime[multiple] = false;
        }
    }
    int answer = 0;
    for (int i = 2; i < n; i++) {
        answer += prime[i];
    }
    free(prime);
    return answer;
}`,
        cpp: `int countPrimes(int n) {
    vector<bool> prime(n, true);
    for (int p = 2; p <= (n - 1) / p; p++) {
        if (!prime[p]) {
            continue;
        }
        for (int multiple = p * p; multiple < n; multiple += p) {
            prime[multiple] = false;
        }
    }
    int answer = 0;
    for (int i = 2; i < n; i++) {
        answer += prime[i];
    }
    return answer;
}`,
        java: `int countPrimes(int n) {
    boolean[] composite = new boolean[n];
    for (int p = 2; p <= (n - 1) / p; p++) {
        if (composite[p]) {
            continue;
        }
        for (int multiple = p * p; multiple < n; multiple += p) {
            composite[multiple] = true;
        }
    }
    int answer = 0;
    for (int i = 2; i < n; i++) {
        if (!composite[i]) {
            answer++;
        }
    }
    return answer;
}`,
        javascript: `function countPrimes(n) {
  const composite = new Uint8Array(n);
  for (let p = 2; p * p < n; p++) {
    if (composite[p]) {
      continue;
    }
    for (let multiple = p * p; multiple < n; multiple += p) {
      composite[multiple] = 1;
    }
  }
  let answer = 0;
  for (let i = 2; i < n; i++) {
    if (!composite[i]) {
      answer++;
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '逐個試除',
      idea: '對每個小於 n 的整數，試除到平方根，沒有因數就是質數。',
      steps: ['從 2 到 n−1 逐個檢查。', '對 x 試除 2..√x。', '若沒有整除的因數，答案加一。'],
      figure: { title: 'n = 10', steps: [
        { note: '2、3 找不到非自身因數，先計 2 個。', views: [arr([2, 3], { label: '已找到', done: [0, 1] })] },
        { note: '4 可被 2 整除，捨棄；5 無因數，計數變 3。', views: [arr([2, 3, 4, 5], { label: '逐個檢查', dim: [2], highlight: [3] })] },
        { note: '6 有因數 2；7 沒有因數，計數變 4。', views: [arr([6, 7], { label: '逐個檢查', dim: [0], highlight: [1] })] },
        { note: '8、9 各有因數，最後答案仍是 4。', views: [arr([4], { label: '質數數量', done: [0] })] },
      ] },
      complexity: { time: 'O(n√n)', space: 'O(1)', why: '每個 x 最多試除到 √x。' },
      verdict: '小 n 容易理解；最大測資會太慢。',
      code: {
        python: `def countPrimes(n):
    answer = 0
    for value in range(2, n):
        prime = True
        divisor = 2
        while divisor * divisor <= value:
            if value % divisor == 0:
                prime = False           # 找到非自身因數
                break
            divisor += 1
        if prime:
            answer += 1
    return answer`,
        c: `int countPrimes(int n) {
    int answer = 0;
    for (int value = 2; value < n; value++) {
        bool prime = true;
        for (int d = 2; d <= value / d; d++) {
            if (value % d == 0) {
                prime = false;
                break;
            }
        }
        if (prime) {
            answer++;
        }
    }
    return answer;
}`,
        cpp: `int countPrimes(int n) {
    int answer = 0;
    for (int value = 2; value < n; value++) {
        bool prime = true;
        for (int d = 2; d <= value / d; d++) {
            if (value % d == 0) {
                prime = false;
                break;
            }
        }
        if (prime) {
            answer++;
        }
    }
    return answer;
}`,
        java: `int countPrimes(int n) {
    int answer = 0;
    for (int value = 2; value < n; value++) {
        boolean prime = true;
        for (int d = 2; d <= value / d; d++) {
            if (value % d == 0) {
                prime = false;
                break;
            }
        }
        if (prime) {
            answer++;
        }
    }
    return answer;
}`,
        javascript: `function countPrimes(n) {
  let answer = 0;
  for (let value = 2; value < n; value++) {
    let prime = true;
    for (let d = 2; d * d <= value; d++) {
      if (value % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) {
      answer++;
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['題目是小於 n；不要把 n 算進去。', '0 與 1 都不是質數。', '篩倍數從 p² 開始即可。'],
  check: { kind: 'fn', fn: 'countPrimes', cases: [
    { args: [10], out: 4 }, { args: [0], out: 0 }, { args: [2], out: 0 }, { args: [20], out: 8 },
  ] },
}
