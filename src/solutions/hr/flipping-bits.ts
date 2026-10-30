import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const INPUT = 9

function bitFig(): FigStep[] {
  const out: FigStep[] = []
  let answer = 0
  for (let bit = 31; bit >= 0; bit--) {
    const old = Math.floor(INPUT / 2 ** bit) % 2
    const flipped = 1 - old
    answer = answer * 2 + flipped
    if (bit >= 29 || bit <= 4) out.push({
      note: `第 ${bit} 位原本是 ${old}，翻成 ${flipped}；已處理前綴的十進位值為 ${answer}。${bit > 4 ? '中間的高位也依相同規則逐一處理。' : ''}`,
      views: [arr([31, 30, 29, 4, 3, 2, 1, 0], { label: '顯示的位序', highlight: [bit >= 29 ? 31 - bit : 7 - bit] }), kv([['原位', old], ['反轉後', flipped], ['已累積', answer]], '逐位狀態')],
    })
  }
  return out
}

function subtractionFig(): FigStep[] {
  const out: FigStep[] = []
  let mask = 0
  for (let bit = 0; bit < 32; bit++) {
    mask += 2 ** bit
    if (bit < 4 || bit >= 30) out.push({
      note: `加入第 ${bit} 位的值 ${2 ** bit}，目前全 1 遮罩為 ${mask}；最後用遮罩減去 ${INPUT}，得到 ${mask - INPUT}。`,
      views: [kv([['位序', bit], ['遮罩', mask], ['遮罩減輸入', mask - INPUT]], '計算狀態'), arr([INPUT, mask, mask - INPUT], { label: '輸入、遮罩、暫時差值', highlight: [1] })],
    })
  }
  return out
}

export const hrFlippingBits: HrSolution = {
  slug: 'flipping-bits',
  plain: '把一排 32 個開關全部切到相反方向，再讀出它代表的數字。',
  statement: '每次給一個介於 0 與 2³²−1 的整數，把它視為固定 32 位的無號二進位數，將每一位 0/1 對調，回傳新數字的十進位值。即使原數很小，前面的 0 也要翻轉。',
  examples: [
    { input: 'n = 9', output: '4294967286', note: '9 的低四位是 1001，翻轉 32 位後末四位是 0110。' },
    { input: 'n = 0', output: '4294967295', note: '32 個 0 全變成 1。' },
  ],
  constraints: [
    '0 ≤ n < 2³² → 輸入可大於有號 32 位上限，JavaScript 有號位元運算要特別處理。',
    '每個數都固定為 32 位 → 可以逐位處理，也可以直接利用固定遮罩 2³²−1。',
    '最多有 100 筆查詢 → 每筆 32 步或常數時間都足夠。',
    '結果也可能接近 2³²−1 → 在 C/C++/Java 裡不能用有號 32 位整數承接。',
  ],
  insight: [
    '先想最直接的做法：從最高位到最低位看每一位，再把 0 換 1、1 換 0。',
    '固定 32 位的全 1 數是 2³²−1；每個位置的 1 減去原本位元，正好等於反轉後位元。',
    '因此整個結果就是 `2³²−1−n`；這比逐位組合更短，也避開 JavaScript 位元運算的有號轉換。屬於 [[p:bit-manipulation]]。',
  ],
  approaches: [
    {
      name: '逐位翻轉',
      idea: '依序讀出 32 個位元，翻轉後接到結果尾端。',
      steps: ['令結果為 0。', '從第 31 位走到第 0 位，用除以 2 的冪取出該位。', '將結果乘 2，接上翻轉後的位元。', '處理滿 32 位後回傳。'],
      figure: { title: 'n = 9；顯示高三位及低五位', steps: bitFig() },
      complexity: { time: 'O(32) = O(1)', space: 'O(1)', why: '固定處理 32 個位元，只保存累計值與當前位元。' },
      verdict: '能清楚看見翻轉定義，適合先理解固定寬度。',
      code: {
        python: `def flippingBits(n):
    answer = 0
    for bit in range(31, -1, -1):
        old = (n >> bit) & 1
        answer = (answer << 1) | (1 - old)  # 接上反轉後的位元
    return answer`,
        c: `long long flippingBits(long long n) {
    long long answer = 0;
    for (int bit = 31; bit >= 0; bit--) {
        long long old = (n >> bit) & 1LL;
        answer = (answer << 1) | (1LL - old);
    }
    return answer;
}`,
        cpp: `long long flippingBits(long long n) {
    long long answer = 0;
    for (int bit = 31; bit >= 0; bit--) {
        long long old = (n >> bit) & 1LL;
        answer = (answer << 1) | (1LL - old);
    }
    return answer;
}`,
        java: `public static long flippingBits(long n) {
    long answer = 0;
    for (int bit = 31; bit >= 0; bit--) {
        long old = (n >> bit) & 1L;
        answer = (answer << 1) | (1L - old);
    }
    return answer;
}`,
        javascript: `function flippingBits(n) {
    let answer = 0;
    for (let bit = 31; bit >= 0; bit--) {
        const old = Math.floor(n / 2 ** bit) % 2;
        answer = answer * 2 + (1 - old);
    }
    return answer;
}`,
      },
    },
    {
      name: '全 1 遮罩減去原數',
      idea: '利用每位上的 1 減去原位元，直接得到全部翻轉的結果。',
      steps: ['固定 32 位全 1 遮罩為 2³²−1。', '用遮罩減去輸入 n。', '以能容納 2³²−1 的型別回傳。'],
      figure: { title: 'n = 9；逐步建立遮罩', steps: subtractionFig() },
      complexity: { time: 'O(1)', space: 'O(1)', why: '只用一次固定寬度的減法，不隨查詢值改變步數。' },
      verdict: '最簡潔；關鍵是不能忘記 32 位寬度與回傳型別。',
      code: {
        python: `def flippingBits(n):
    mask = (1 << 32) - 1  # 32 位全為 1
    return mask - n`,
        c: `long long flippingBits(long long n) {
    const long long mask = (1LL << 32) - 1;
    return mask - n;
}`,
        cpp: `long long flippingBits(long long n) {
    const long long mask = (1LL << 32) - 1;
    return mask - n;
}`,
        java: `public static long flippingBits(long n) {
    long mask = (1L << 32) - 1;
    return mask - n;
}`,
        javascript: `function flippingBits(n) {
    const mask = 2 ** 32 - 1;
    return mask - n;
}`,
      },
    },
  ],
  pitfalls: [
    '不要只翻轉數字實際使用的位元；前面的 0 也是 32 位的一部分。',
    '答案可達 4294967295，C/C++ 用 64 位整數承接。',
    'JavaScript 的 `~n` 產生有號 32 位值，直接回傳可能變負數。',
    '當 n = 2³²−1 時，全部位元翻轉後是 0；此邊界可檢查遮罩是否寫對。',
    '若用逐位法，必須恰好走 32 次；多走一位會得到錯誤的高位。',
  ],
  followUp: [
    {
      q: '如果改成固定 8 位，要怎麼調整？',
      a: '把遮罩改為 2⁸−1，也就是 255；逐位法則只走第 7 位到第 0 位。',
    },
    {
      q: '為什麼直接用 `~n` 在 JavaScript 可能出現負數？',
      a: '位元運算會把運算元轉為有號 32 位整數；最高位為 1 時，結果會按負數解讀。',
    },
    {
      q: '若必須用位元運算，JavaScript 如何轉回無號 32 位？',
      a: '可以使用 `(~n) >>> 0`，右移零位的無號轉換會把結果讀成 0 到 2³²−1。',
    },
    {
      q: '公式為何能直接做減法，不會跨位借錯？',
      a: '每個遮罩位都是 1，減去原位的 0 或 1 不需借位，該位恰為反轉值。',
    },
    {
      q: '逐位法為什麼從最高位開始？',
      a: '每一步先把結果乘 2 再接一位；照高位到低位走，最後自然得到正確的二進位整數。',
    },
    {
      q: '若只翻轉最低的有效位，答案會一樣嗎？',
      a: '不會。例如 n=0 在固定 32 位的答案是 4294967295，省略前導零會漏掉全部位元。',
    },
    {
      q: '輸入 n=9 時，最低四位翻轉後是多少？',
      a: '1001 變成 0110，也就是 6；另外 28 個前導零也變成 1，因此總答案遠大於 6。',
    },
  ],
  check: {
    kind: 'fn', fn: 'flippingBits',
    cases: [
      { args: [9], out: 4294967286 },
      { args: [0], out: 4294967295 },
      { args: [4294967295], out: 0 },
      { args: [1], out: 4294967294 },
      { args: [2147483648], out: 2147483647 },
      { args: [123456789], out: 4171510506 },
    ],
  },
}
