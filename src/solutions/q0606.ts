import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 606. Construct String from Binary Tree

const T = [1, 2, 3, null, 4]

function recFig(): FigStep[] {
  return [
    { note: '前序走訪,每個子樹用括號包起來:根(左子樹)(右子樹)。但要省掉不必要的空括號', views: [tree(T)] },
    { note: '規則:右子樹是空的 → 省略 "()";左子樹是空的但右子樹不空 → 左邊必須留 "()",不然分不出是左還是右', views: [tree(T, { cls: { 1: 'hl' }, subs: { 1: '左空右有 → "2()(4)"' } })] },
    { note: '組起來:1 + "(2()(4))" + "(3)" = "1(2()(4))(3)"', views: [arr(['1', '(2()(4))', '(3)'], { label: '組合', done: [0, 1, 2] })] },
  ]
}

function stackFig(): FigStep[] {
  return [
    { note: '迭代版:用堆疊模擬前序走訪。第一次碰到節點時寫 "(" + 值;第二次(孩子都處理完)時寫 ")"。用一個 visited 集合分辨第一次還是第二次', views: [tree(T, { cls: { 0: 'hl' } })] },
    { note: '只有左孩子空、右孩子不空時,額外補一個 "()"。最後去掉最外層的一對括號', views: [arr(['(1(2()(4))(3))', '→ 1(2()(4))(3)'], { label: '去掉最外層' })] },
  ]
}

export const q0606: Solution = {
  id: 606,
  plain: '把一棵二元樹寫成一行文字:每個節點寫成「值(左子樹)(右子樹)」,而且把不影響理解的空括號省掉。',
  statement: '給二元樹的根 `root`,依**前序**把它轉成由整數與括號組成的字串,省略所有不影響「字串與樹一一對應」的空括號對。',
  examples: [
    { input: 'root = [1,2,3,4]', output: '"1(2(4))(3)"' },
    { input: 'root = [1,2,3,null,4]', output: '"1(2()(4))(3)"', note: '2 的左邊是空的,要留 "()" 才知道 4 是右孩子' },
  ],
  constraints: ['節點數 ≤ 10⁴', '值在 −1000 ~ 1000'],
  insight: ['結構就是前序:先寫自己,再寫左、右子樹(各自包在括號裡)', '右子樹空 → 不寫', '左子樹空、右子樹不空 → 左邊要寫 "()" 佔位'],
  approaches: [
    {
      name: '遞迴',
      idea: '`s(node)`:葉子 → 值;只有左 → `值(左)`;有右 → `值(左)(右)`(左空也要寫 `()`)。',
      steps: ['空 → ""', '`res = str(val)`', '有左或有右 → `res += "(" + s(left) + ")"`', '有右 → `res += "(" + s(right) + ")"`'],
      figure: { title: `root = [${T}]`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點處理一次(用串接要注意字串複製的成本,可改成收集到 list 再 join)。' },
      verdict: '最推薦,把兩條省略規則寫成兩個 if 就完成。',
      code: {
        python: `def tree2str(root):
    out = []
    def go(n):
        out.append(str(n.val))
        if n.left or n.right:                 # 有右孩子時,左邊即使是空的也要寫 ()
            out.append('(')
            if n.left:
                go(n.left)
            out.append(')')
        if n.right:
            out.append('(')
            go(n.right)
            out.append(')')
    go(root)
    return ''.join(out)`,
        c: `static void go(struct TreeNode *n, char *out, int *k) {
    *k += sprintf(out + *k, "%d", n->val);
    if (n->left || n->right) {
        out[(*k)++] = '(';
        if (n->left) go(n->left, out, k);
        out[(*k)++] = ')';
    }
    if (n->right) {
        out[(*k)++] = '(';
        go(n->right, out, k);
        out[(*k)++] = ')';
    }
}

char *tree2str(struct TreeNode *root) {
    char *out = malloc(10 * 10005);           // 每個節點最多 5 個字元的數字 + 4 個括號
    int k = 0;
    go(root, out, &k);
    out[k] = '\\0';
    return out;
}`,
        cpp: `void go(TreeNode *n, string &out) {
    out += to_string(n->val);
    if (n->left || n->right) {
        out += '(';
        if (n->left) go(n->left, out);
        out += ')';
    }
    if (n->right) { out += '('; go(n->right, out); out += ')'; }
}

string tree2str(TreeNode* root) {
    string out;
    go(root, out);
    return out;
}`,
        java: `String tree2str(TreeNode root) {
    StringBuilder sb = new StringBuilder();
    go(root, sb);
    return sb.toString();
}

private void go(TreeNode n, StringBuilder sb) {
    sb.append(n.val);
    if (n.left != null || n.right != null) {
        sb.append('(');
        if (n.left != null) go(n.left, sb);
        sb.append(')');
    }
    if (n.right != null) { sb.append('('); go(n.right, sb); sb.append(')'); }
}`,
        javascript: `function tree2str(root) {
  const out = [];
  const go = (n) => {
    out.push(n.val);
    if (n.left || n.right) {
      out.push('(');
      if (n.left) go(n.left);
      out.push(')');
    }
    if (n.right) {
      out.push('(');
      go(n.right);
      out.push(')');
    }
  };
  go(root);
  return out.join('');
}`,
      },
    },
    {
      name: '堆疊 + 拜訪標記',
      idea: '堆疊模擬前序;節點第一次被看到時輸出 "(" + 值 並把孩子放進去,第二次看到(孩子都完成)時輸出 ")"。最後去掉頭尾的括號。',
      steps: ['`st = [root]`、`seen = set()`', '看堆疊頂 n:在 seen 裡 → pop、輸出 ")"', '否則加入 seen、輸出 "(" + 值;左空右不空 → 輸出 "()"', '依序 push 右、左孩子(有的話);最後回傳 `s[1:-1]`'],
      figure: { title: `root = [${T}]`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '堆疊和 seen 集合。' },
      verdict: '不用遞迴;「第一次 / 第二次看到」的技巧也能用來做迭代版的後序走訪。',
      code: {
        python: `def tree2str(root):
    out, st, seen = [], [root], set()
    while st:
        n = st[-1]
        if n in seen:
            st.pop()
            out.append(')')                   # 第二次看到:子樹結束
            continue
        seen.add(n)
        out.append('(' + str(n.val))
        if not n.left and n.right:
            out.append('()')                  # 左空右有:佔位
        if n.right:
            st.append(n.right)
        if n.left:
            st.append(n.left)
    return ''.join(out)[1:-1]                 # 去掉最外層的括號`,
        c: `char *tree2str(struct TreeNode *root) {
    struct TreeNode **st = malloc(10005 * sizeof *st);
    char *second = malloc(10005), *out = malloc(10 * 10005);   // second[i]:堆疊第 i 格是不是第二次看到
    int top = 0, k = 0;
    st[top] = root; second[top++] = 0;
    while (top) {
        struct TreeNode *n = st[top - 1];
        if (second[top - 1]) { top--; out[k++] = ')'; continue; }
        second[top - 1] = 1;
        k += sprintf(out + k, "(%d", n->val);
        if (!n->left && n->right) { out[k++] = '('; out[k++] = ')'; }
        if (n->right) { st[top] = n->right; second[top++] = 0; }
        if (n->left) { st[top] = n->left; second[top++] = 0; }
    }
    out[k - 1] = '\\0';                       // 去掉最後的 ')'
    memmove(out, out + 1, k - 1);             // 去掉最前面的 '('(連同結尾的 \\0 一起搬)
    free(st); free(second);
    return out;
}`,
        cpp: `string tree2str(TreeNode* root) {
    string out;
    vector<TreeNode*> st{root};
    unordered_set<TreeNode*> seen;
    while (!st.empty()) {
        TreeNode *n = st.back();
        if (seen.count(n)) { st.pop_back(); out += ')'; continue; }
        seen.insert(n);
        out += '(' + to_string(n->val);
        if (!n->left && n->right) out += "()";
        if (n->right) st.push_back(n->right);
        if (n->left) st.push_back(n->left);
    }
    return out.substr(1, out.size() - 2);
}`,
        java: `String tree2str(TreeNode root) {
    StringBuilder out = new StringBuilder();
    Deque<TreeNode> st = new ArrayDeque<>();
    Set<TreeNode> seen = new HashSet<>();
    st.push(root);
    while (!st.isEmpty()) {
        TreeNode n = st.peek();
        if (seen.contains(n)) { st.pop(); out.append(')'); continue; }
        seen.add(n);
        out.append('(').append(n.val);
        if (n.left == null && n.right != null) out.append("()");
        if (n.right != null) st.push(n.right);
        if (n.left != null) st.push(n.left);
    }
    return out.substring(1, out.length() - 1);
}`,
        javascript: `function tree2str(root) {
  let out = '';
  const st = [root], seen = new Set();
  while (st.length) {
    const n = st[st.length - 1];
    if (seen.has(n)) {
      st.pop();
      out += ')';
      continue;
    }
    seen.add(n);
    out += '(' + n.val;
    if (!n.left && n.right) out += '()';
    if (n.right) st.push(n.right);
    if (n.left) st.push(n.left);
  }
  return out.slice(1, -1);
}`,
      },
    },
  ],
  pitfalls: ['左空右有時省略了 "()":"1(2(4))" 會被誤解成 4 是左孩子', '右空時還寫 "()":多餘的括號,和答案不符', '負數直接轉字串即可,不要額外處理負號'],
  check: {
    kind: 'fn',
    fn: 'tree2str',
    argKinds: ['tree'],
    cases: [
      { args: [[1, 2, 3, 4]], out: '1(2(4))(3)' },
      { args: [T], out: '1(2()(4))(3)' },
      { args: [[1]], out: '1' },
      { args: [[-1, null, -2]], out: '-1()(-2)' },
    ],
  },
}
