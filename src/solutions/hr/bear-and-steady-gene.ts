import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

function firstFig(): FigStep[] {
  const gene = 'GAAATAAA', total = { A: 6, C: 0, G: 1, T: 1 }, out: FigStep[] = []
  let answer = gene.length
  for (let left = 0; left < gene.length; left++) {
    const outside = { ...total }
    for (let right = left; right < gene.length; right++) {
      outside[gene[right] as keyof typeof outside]--
      const good = Object.values(outside).every(x => x <= 2)
      if (good) answer = Math.min(answer, right - left + 1)
      if (left < 2 || good) out.push({ note: `試 [${left}, ${right}]；外面 A/C/G/T = ${Object.values(outside).join('/')}，${good ? `皆不超過 2，最佳長度 ${answer}` : '仍有字母超過 2'}。`, views: [arr(gene.split(''), { label: '基因', highlight: Array.from({ length: right - left + 1 }, (_, k) => left + k) }), arr(Object.values(outside), { label: '視窗外 A、C、G、T 次數' }), arr([answer], { label: '目前最短長度' })] })
      if (good) break
    }
  }
  return out
}

function secondFig(): FigStep[] {
  const gene = 'GAAATAAA', outside = { A: 6, C: 0, G: 1, T: 1 }, out: FigStep[] = []
  let left = 0, answer = gene.length
  for (let right = 0; right < gene.length; right++) {
    outside[gene[right] as keyof typeof outside]--
    while (Object.values(outside).every(x => x <= 2)) {
      answer = Math.min(answer, right - left + 1)
      out.push({ note: `視窗 [${left}, ${right}] 可行；外部 A/C/G/T = ${Object.values(outside).join('/')}，更新最短為 ${answer}，再嘗試縮左界。`, views: [arr(gene.split(''), { label: '可替換視窗', highlight: Array.from({ length: right - left + 1 }, (_, k) => left + k) }), arr(Object.values(outside), { label: '視窗外計數' }), arr([answer], { label: '最佳長度' })] })
      outside[gene[left] as keyof typeof outside]++
      left++
    }
    out.push({ note: `右界讀到 ${right} 的 ${gene[right]}；目前外部 A/C/G/T = ${Object.values(outside).join('/')}，左界 ${left}，最佳 ${answer}。`, views: [arr(gene.split(''), { label: '基因', highlight: [right] }), arr(Object.values(outside), { label: '外部計數' }), arr([left, answer], { label: '左界、最佳' })] })
  }
  return out
}

export const hrBearAndSteadyGene: HrSolution = {
  slug: "bear-and-steady-gene",
  plain: "像只准重寫基因紙帶上的一小段；找最短的重寫範圍，讓四種字母最後各占四分之一。",
  statement: "基因字串長度為 4 的倍數，可將一段連續子字串任意替換成同長度字串。求讓四種字母出現次數都等於 n/4 所需替換的最短長度。原本已平衡則回傳 0。",
  examples: [
    { input: "gene = \"GAAATAAA\"", output: "5", note: "A 過多，必須用一段涵蓋足夠 A 的窗口。" },
    { input: "gene = \"ACTG\"", output: "0", note: "四種字母各一個，本來就穩定。" },
  ],
  constraints: [
    "基因長度最多 5×10^5 → 枚舉所有窗口會超時，需要線性滑動視窗。",
    "只有四種字母且長度為 4 的倍數 → 各種字母的目標次數都是 n/4。",
  ],
  insight: [
    "換掉某一段之後，段內可以自由填字；真正不能改的是窗口外的字母。",
    "因此一個窗口可行，等價於窗口外每種字母數都不超過 n/4；不足的都能在窗口內補足。",
    "直覺可枚舉所有窗口；因窗口擴大只會讓外部數量減少，可用 [[p:sliding-window]] 找最短可行段。這和 LeetCode 1234 的平衡概念相近。",
  ],
  approaches: [
    {
      name: "枚舉起點和終點",
      idea: "試每個連續窗口，重新計算窗口外是否能保留。",
      steps: ["先計算整條基因的四種字母數。","對每個左端，複製總數作為窗口外的計數。","右端逐步向右，每納入一個字元就從外部計數扣掉。","若四種外部計數都不大於 n/4，更新最短長度。"],
      figure: { title: "gene = \"GAAATAAA\"", steps: firstFig() },
      complexity: {
        time: "O(n²)",
        space: "O(1)",
        why: "有 O(n²) 個候選窗口；四種字母的計數陣列大小固定。",
      },
      verdict: "可作小輸入的對照解；大基因需要避免重複檢查所有窗口。",
      code: {
        python: `def steadyGene(gene):
    n = len(gene)
    target = n // 4
    index = {'A': 0, 'C': 1, 'G': 2, 'T': 3}
    total = [0] * 4
    for ch in gene:
        total[index[ch]] += 1
    answer = n
    if all(x <= target for x in total):
        return 0
    for left in range(n):
        outside = total.copy()
        for right in range(left, n):
            outside[index[gene[right]]] -= 1  # 窗口內字元不再算外部
            if all(x <= target for x in outside):
                answer = min(answer, right - left + 1)
                break
    return answer`,
        c: `int steadyGene(char* gene) {
    int n = strlen(gene), target = n / 4, total[128] = {0};
    for (int i = 0; i < n; i++) total[(int)gene[i]]++;
    if (total['A'] <= target && total['C'] <= target &&
        total['G'] <= target && total['T'] <= target) return 0;
    int answer = n;
    for (int left = 0; left < n; left++) {
        int outside[128] = {0};
        outside['A'] = total['A'];
        outside['C'] = total['C'];
        outside['G'] = total['G'];
        outside['T'] = total['T'];
        for (int right = left; right < n; right++) {
            outside[(int)gene[right]]--;
            if (outside['A'] <= target && outside['C'] <= target &&
                outside['G'] <= target && outside['T'] <= target) {
                if (right - left + 1 < answer) answer = right - left + 1;
                break;
            }
        }
    }
    return answer;
}`,
        cpp: `int steadyGene(string gene) {
    int n = gene.size(), target = n / 4;
    vector<int> total(128);
    for (char ch : gene) total[ch]++;
    if (total['A'] <= target && total['C'] <= target &&
        total['G'] <= target && total['T'] <= target) return 0;
    int answer = n;
    for (int left = 0; left < n; left++) {
        vector<int> outside = total;
        for (int right = left; right < n; right++) {
            outside[gene[right]]--;
            if (outside['A'] <= target && outside['C'] <= target &&
                outside['G'] <= target && outside['T'] <= target) {
                answer = min(answer, right - left + 1);
                break;
            }
        }
    }
    return answer;
}`,
        java: `public static int steadyGene(String gene) {
    int n = gene.length(), target = n / 4;
    int[] total = new int[128];
    for (char ch : gene.toCharArray()) total[ch]++;
    if (total['A'] <= target && total['C'] <= target &&
        total['G'] <= target && total['T'] <= target) return 0;
    int answer = n;
    for (int left = 0; left < n; left++) {
        int[] outside = total.clone();
        for (int right = left; right < n; right++) {
            outside[gene.charAt(right)]--;
            if (outside['A'] <= target && outside['C'] <= target &&
                outside['G'] <= target && outside['T'] <= target) {
                answer = Math.min(answer, right - left + 1);
                break;
            }
        }
    }
    return answer;
}`,
        javascript: `function steadyGene(gene) {
  const n = gene.length;
  const target = n / 4;
  const total = { A: 0, C: 0, G: 0, T: 0 };
  for (const ch of gene) total[ch]++;
  if (Object.values(total).every(x => x <= target)) return 0;
  let answer = n;
  for (let left = 0; left < n; left++) {
    const outside = { ...total };
    for (let right = left; right < n; right++) {
      outside[gene[right]]--;
      if (Object.values(outside).every(x => x <= target)) {
        answer = Math.min(answer, right - left + 1);
        break;
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: "滑動視窗維持外部數量",
      idea: "右端擴大直到外部數量都合格，再縮左端找目前最短窗口。",
      steps: ["計算四種字母總數，並作為窗口外的初始數量。","逐步把右端字元納入窗口，外部對應數量減一。","只要外部四種字母都不超過 n/4，就更新答案。","將左端字元放回外部，左端右移；若仍可行就繼續縮。","處理完所有右端後回傳最短長度。"],
      figure: { title: "gene = \"GAAATAAA\"", steps: secondFig() },
      complexity: {
        time: "O(n)",
        space: "O(1)",
        why: "左右端各最多移動 n 次；只保存四種字母的外部計數。",
      },
      verdict: "能處理最大輸入；判斷「窗口外」避免猜測窗口內應填哪些字母。",
      code: {
        python: `def steadyGene(gene):
    n = len(gene)
    target = n // 4
    outside = {ch: gene.count(ch) for ch in 'ACGT'}
    if all(x <= target for x in outside.values()):
        return 0
    answer = n
    left = 0
    for right, ch in enumerate(gene):
        outside[ch] -= 1  # 右端進入待替換窗口
        while all(x <= target for x in outside.values()):
            answer = min(answer, right - left + 1)
            outside[gene[left]] += 1  # 嘗試縮短窗口
            left += 1
    return answer`,
        c: `int steadyGene(char* gene) {
    int n = strlen(gene), target = n / 4;
    int outside[128] = {0};
    for (int i = 0; i < n; i++) outside[(int)gene[i]]++;
    if (outside['A'] <= target && outside['C'] <= target &&
        outside['G'] <= target && outside['T'] <= target) return 0;
    int answer = n, left = 0;
    for (int right = 0; right < n; right++) {
        outside[(int)gene[right]]--;
        while (outside['A'] <= target && outside['C'] <= target &&
               outside['G'] <= target && outside['T'] <= target) {
            if (right - left + 1 < answer) answer = right - left + 1;
            outside[(int)gene[left++]]++;
        }
    }
    return answer;
}`,
        cpp: `int steadyGene(string gene) {
    int n = gene.size(), target = n / 4;
    vector<int> outside(128);
    for (char ch : gene) outside[ch]++;
    auto valid = [&]() {
        return outside['A'] <= target && outside['C'] <= target &&
               outside['G'] <= target && outside['T'] <= target;
    };
    if (valid()) return 0;
    int answer = n, left = 0;
    for (int right = 0; right < n; right++) {
        outside[gene[right]]--;
        while (valid()) {
            answer = min(answer, right - left + 1);
            outside[gene[left++]]++;
        }
    }
    return answer;
}`,
        java: `public static int steadyGene(String gene) {
    int n = gene.length(), target = n / 4;
    int[] outside = new int[128];
    for (char ch : gene.toCharArray()) outside[ch]++;
    if (outside['A'] <= target && outside['C'] <= target &&
        outside['G'] <= target && outside['T'] <= target) return 0;
    int answer = n, left = 0;
    for (int right = 0; right < n; right++) {
        outside[gene.charAt(right)]--;
        while (outside['A'] <= target && outside['C'] <= target &&
               outside['G'] <= target && outside['T'] <= target) {
            answer = Math.min(answer, right - left + 1);
            outside[gene.charAt(left++)]++;
        }
    }
    return answer;
}`,
        javascript: `function steadyGene(gene) {
  const n = gene.length;
  const target = n / 4;
  const outside = { A: 0, C: 0, G: 0, T: 0 };
  for (const ch of gene) outside[ch]++;
  const valid = () => Object.values(outside).every(x => x <= target);
  if (valid()) return 0;
  let answer = n;
  let left = 0;
  for (let right = 0; right < n; right++) {
    outside[gene[right]]--;
    while (valid()) {
      answer = Math.min(answer, right - left + 1);
      outside[gene[left++]]++;
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: [
    "原本已平衡時答案是 0，需先檢查空窗口。",
    "判斷窗口可行看的是外部各字母不超過目標，不要求窗口內已有正確比例。",
    "縮左端時要把移出的字母加回外部計數。",
  ],
  check: {
    kind: 'fn',
    fn: "steadyGene",
    cases: [
      { args: ["GAAATAAA"], out: 5 },
      { args: ["ACTG"], out: 0 },
      { args: ["AAAA"], out: 3 },
      { args: ["AAAAAAAA"], out: 6 },
      { args: ["AACT"], out: 1 },
      { args: ["ACGTACGT"], out: 0 },
    ],
  },
}
