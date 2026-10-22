import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 297. Serialize and Deserialize Binary Tree

const T = [1, 2, 3, null, null, 4, 5]

function preFig(): FigStep[] {
  const order: (number | string)[] = []
  const visit: Record<number, string> = {}
  const out: FigStep[] = [{ note: '序列化:前序遍歷(根 → 左 → 右),遇到空的孩子也要寫下來(用 #)。有了 # 才知道哪裡結束,樹的形狀才能唯一還原', views: [tree(T)] }]
  const idxOf = [0, 1, 2, -1, -1, 5, 6]
  const walk = (i: number) => {
    if (i >= T.length || T[i] === null) {
      order.push('#')
      return
    }
    order.push(T[i]!)
    visit[idxOf[i]] = 'done'
    if (order.length <= 7) out.push({ note: `拜訪 ${T[i]},寫下它`, views: [tree(T, { cls: { ...visit, [i]: 'hl' } }), arr([...order], { label: '字串' })] })
    walk(2 * i + 1)
    walk(2 * i + 2)
  }
  walk(0)
  out.push({ note: `完整的字串:"${order.join(',')}"`, views: [arr(order, { label: 'serialize 的結果', done: order.flatMap((v, i) => (v === '#' ? [] : [i])) })] })
  out.push({ note: '反序列化:用同樣的前序順序讀回來。讀到數字就建節點,再遞迴建左子樹、右子樹;讀到 # 就回傳 null', views: [arr(order, { label: '依序讀', highlight: [0] }), tree(T, { cls: { 0: 'hl' } })] })
  return out
}

function bfsFig(): FigStep[] {
  return [
    { note: '層序(BFS)版本:一層一層寫下來,空的寫 null。這就是 LeetCode 題目輸入的格式', views: [tree(T), arr([1, 2, 3, 'null', 'null', 4, 5, 'null', 'null', 'null', 'null'], { label: '層序' })] },
    { note: '還原時用佇列:每從佇列拿出一個節點,就從字串依序讀兩個值當它的左、右孩子', views: [arr([1, 2, 3, 'null', 'null', 4, 5], { label: '讀到這裡', highlight: [5, 6] }), tree(T, { cls: { 2: 'hl', 5: 'done', 6: 'done' } })] },
  ]
}

const HARNESS = '// 測試用:LeetCode 會這樣呼叫 —— 先序列化,再把字串還原成樹'

export const q0297: Solution = {
  id: 297,
  plain: '設計兩個函式:一個把二元樹變成一串文字(序列化),另一個把文字還原成**一模一樣**的樹(反序列化)。就像把一棵樹「打包」寄出去,對方要能拆開組回原樣。',
  statement: '設計 `Codec` 類別:`serialize(root)` 把二元樹轉成字串,`deserialize(data)` 把字串還原成二元樹。格式自訂,只要 `deserialize(serialize(root))` 還原出原本的樹即可。',
  examples: [
    { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]' },
    { input: 'root = []', output: '[]' },
  ],
  constraints: ['節點數 ≤ 10⁴,值在 −1000..1000'],
  insight: [
    '只有前序(或只有中序)無法唯一決定樹的形狀 —— 但如果**把空的孩子也記下來**,單一個前序就夠了',
    '前序 + 空標記:`1,2,#,#,3,4,#,#,5,#,#`。還原時照同樣的順序遞迴讀',
    '也可以用層序(BFS),和 LeetCode 的輸入格式一樣',
    '值可能是負數或多位數,所以用逗號分隔',
  ],
  approaches: [
    {
      name: '前序 DFS + 空標記',
      idea: 'serialize:前序遍歷,空節點寫 `#`,用逗號接起來。deserialize:把字串切開成佇列,遞迴:讀一個值,`#` → None,否則建節點、遞迴建左、遞迴建右。',
      steps: ['serialize:`dfs(n)`:None → "#";否則 `val`、`dfs(left)`、`dfs(right)`', 'deserialize:`vals = data.split(",")`,用索引依序讀', '`build()`:讀到 "#" → None;否則建節點,`left = build()`、`right = build()`'],
      figure: { title: `root = [${T.map((v) => v ?? 'null')}]`, steps: preFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點(和每個空孩子)寫一次、讀一次;遞迴深度是樹高。' },
      verdict: '最推薦,程式最短。前序遞迴的「建構」和「拆解」順序完全對稱。',
      code: {
        python: `class Codec:
    def serialize(self, root):
        out = []
        def dfs(n):
            if not n:
                out.append('#')               # 空的也要記
                return
            out.append(str(n.val))
            dfs(n.left)
            dfs(n.right)
        dfs(root)
        return ','.join(out)

    def deserialize(self, data):
        vals = iter(data.split(','))
        def build():
            v = next(vals)
            if v == '#':
                return None
            n = TreeNode(int(v))
            n.left = build()                  # 和前序一樣的順序讀回來
            n.right = build()
            return n
        return build()

${HARNESS.replace('//', '#')}
def roundTrip(root):
    return Codec().deserialize(Codec().serialize(root))`,
        c: `static void ser(struct TreeNode *n, char *buf, int *len) {
    if (!n) { *len += sprintf(buf + *len, "#,"); return; }
    *len += sprintf(buf + *len, "%d,", n->val);
    ser(n->left, buf, len);
    ser(n->right, buf, len);
}

char *serialize(struct TreeNode *root) {
    char *buf = malloc(200000);
    int len = 0;
    ser(root, buf, &len);
    buf[len] = '\\0';
    return buf;
}

static struct TreeNode *build(char **p) {
    if (**p == '#') { *p += 2; return NULL; }
    struct TreeNode *n = malloc(sizeof(struct TreeNode));
    n->val = (int)strtol(*p, p, 10);
    (*p)++;                                   // 跳過逗號
    n->left = build(p);
    n->right = build(p);
    return n;
}

struct TreeNode *deserialize(char *data) {
    char *p = data;
    return build(&p);
}

${HARNESS}
struct TreeNode *roundTrip(struct TreeNode *root) { return deserialize(serialize(root)); }`,
        cpp: `class Codec {
public:
    string serialize(TreeNode* root) {
        string out;
        function<void(TreeNode*)> dfs = [&](TreeNode* n) {
            if (!n) { out += "#,"; return; }
            out += to_string(n->val) + ",";
            dfs(n->left);
            dfs(n->right);
        };
        dfs(root);
        return out;
    }

    TreeNode* deserialize(string data) {
        stringstream ss(data);
        function<TreeNode*()> build = [&]() -> TreeNode* {
            string v;
            getline(ss, v, ',');
            if (v == "#") return nullptr;
            TreeNode* n = new TreeNode(stoi(v));
            n->left = build();
            n->right = build();
            return n;
        };
        return build();
    }
};

${HARNESS}
TreeNode* roundTrip(TreeNode* root) { Codec c; return c.deserialize(c.serialize(root)); }`,
        java: `class Codec {
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        ser(root, sb);
        return sb.toString();
    }

    private void ser(TreeNode n, StringBuilder sb) {
        if (n == null) { sb.append("#,"); return; }
        sb.append(n.val).append(',');
        ser(n.left, sb);
        ser(n.right, sb);
    }

    private String[] vals;
    private int pos;

    public TreeNode deserialize(String data) {
        vals = data.split(",");
        pos = 0;
        return build();
    }

    private TreeNode build() {
        String v = vals[pos++];
        if (v.equals("#")) return null;
        TreeNode n = new TreeNode(Integer.parseInt(v));
        n.left = build();
        n.right = build();
        return n;
    }
}

${HARNESS}
TreeNode roundTrip(TreeNode root) { return new Codec().deserialize(new Codec().serialize(root)); }`,
        javascript: `class Codec {
  serialize(root) {
    const out = [];
    const dfs = (n) => {
      if (!n) return void out.push('#');
      out.push(n.val);
      dfs(n.left);
      dfs(n.right);
    };
    dfs(root);
    return out.join(',');
  }

  deserialize(data) {
    const vals = data.split(',');
    let i = 0;
    const build = () => {
      const v = vals[i++];
      if (v === '#') return null;
      const n = new TreeNode(Number(v));
      n.left = build();
      n.right = build();
      return n;
    };
    return build();
  }
}

${HARNESS}
function roundTrip(root) { return new Codec().deserialize(new Codec().serialize(root)); }`,
      },
    },
    {
      name: '層序 BFS',
      idea: 'serialize:BFS,每個出佇列的節點寫下值(空的寫 `null`),非空就把兩個孩子放進佇列。deserialize:第一個值建根,用佇列依序替每個節點讀兩個值當孩子。',
      steps: ['serialize:佇列從 root 開始;None 寫 "null",否則寫值並放入左右孩子', 'deserialize:空字串或 "null" 開頭 → None', '佇列從根開始;每拿出一個節點,讀接下來兩個值當左、右孩子(非 null 就放進佇列)'],
      figure: { title: `root = [${T.map((v) => v ?? 'null')}]`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點進出佇列一次。' },
      verdict: '和 LeetCode 的格式相同,而且不用遞迴(很深的斜樹也不會爆堆疊)。',
      code: {
        python: `from collections import deque

class Codec:
    def serialize(self, root):
        out, q = [], deque([root])
        while q:
            n = q.popleft()
            if n:
                out.append(str(n.val))
                q.append(n.left)
                q.append(n.right)
            else:
                out.append('null')
        return ','.join(out)

    def deserialize(self, data):
        vals = data.split(',')
        if vals[0] == 'null':
            return None
        root = TreeNode(int(vals[0]))
        q, i = deque([root]), 1
        while q:
            n = q.popleft()
            for side in ('left', 'right'):    # 依序替它讀兩個孩子
                if vals[i] != 'null':
                    child = TreeNode(int(vals[i]))
                    setattr(n, side, child)
                    q.append(child)
                i += 1
        return root

${HARNESS.replace('//', '#')}
def roundTrip(root):
    return Codec().deserialize(Codec().serialize(root))`,
        c: `char *serialize(struct TreeNode *root) {
    struct TreeNode **q = malloc(30000 * sizeof(struct TreeNode *));
    char *buf = malloc(300000);
    int h = 0, t = 0, len = 0;
    q[t++] = root;
    while (h < t) {
        struct TreeNode *n = q[h++];
        if (n) {
            len += sprintf(buf + len, "%d,", n->val);
            q[t++] = n->left;
            q[t++] = n->right;
        } else len += sprintf(buf + len, "null,");
    }
    buf[len] = '\\0';
    free(q);
    return buf;
}

static struct TreeNode *readNode(char **p) {
    if (**p == 'n') { *p += 5; return NULL; }  // "null,"
    struct TreeNode *n = malloc(sizeof(struct TreeNode));
    n->val = (int)strtol(*p, p, 10);
    n->left = n->right = NULL;
    (*p)++;
    return n;
}

struct TreeNode *deserialize(char *data) {
    char *p = data;
    struct TreeNode *root = readNode(&p);
    if (!root) return NULL;
    struct TreeNode **q = malloc(30000 * sizeof(struct TreeNode *));
    int h = 0, t = 0;
    q[t++] = root;
    while (h < t) {
        struct TreeNode *n = q[h++];
        if ((n->left = readNode(&p))) q[t++] = n->left;
        if ((n->right = readNode(&p))) q[t++] = n->right;
    }
    free(q);
    return root;
}

${HARNESS}
struct TreeNode *roundTrip(struct TreeNode *root) { return deserialize(serialize(root)); }`,
        cpp: `class Codec {
public:
    string serialize(TreeNode* root) {
        string out;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            TreeNode* n = q.front(); q.pop();
            if (n) { out += to_string(n->val) + ","; q.push(n->left); q.push(n->right); }
            else out += "null,";
        }
        return out;
    }

    TreeNode* deserialize(string data) {
        stringstream ss(data);
        string v;
        auto read = [&]() -> TreeNode* {
            getline(ss, v, ',');
            return v == "null" ? nullptr : new TreeNode(stoi(v));
        };
        TreeNode* root = read();
        if (!root) return nullptr;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            TreeNode* n = q.front(); q.pop();
            if ((n->left = read())) q.push(n->left);
            if ((n->right = read())) q.push(n->right);
        }
        return root;
    }
};

${HARNESS}
TreeNode* roundTrip(TreeNode* root) { Codec c; return c.deserialize(c.serialize(root)); }`,
        java: `class Codec {
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        Deque<TreeNode> q = new LinkedList<>();   // LinkedList 才能放 null
        q.add(root);
        while (!q.isEmpty()) {
            TreeNode n = q.poll();
            if (n != null) { sb.append(n.val).append(','); q.add(n.left); q.add(n.right); }
            else sb.append("null,");
        }
        return sb.toString();
    }

    public TreeNode deserialize(String data) {
        String[] vals = data.split(",");
        if (vals[0].equals("null")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(vals[0]));
        Deque<TreeNode> q = new ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty()) {
            TreeNode n = q.poll();
            if (!vals[i].equals("null")) { n.left = new TreeNode(Integer.parseInt(vals[i])); q.add(n.left); }
            i++;
            if (!vals[i].equals("null")) { n.right = new TreeNode(Integer.parseInt(vals[i])); q.add(n.right); }
            i++;
        }
        return root;
    }
}

${HARNESS}
TreeNode roundTrip(TreeNode root) { return new Codec().deserialize(new Codec().serialize(root)); }`,
        javascript: `class Codec {
  serialize(root) {
    const out = [], q = [root];
    for (let h = 0; h < q.length; h++) {
      const n = q[h];
      if (n) { out.push(n.val); q.push(n.left, n.right); }
      else out.push('null');
    }
    return out.join(',');
  }

  deserialize(data) {
    const vals = data.split(',');
    if (vals[0] === 'null') return null;
    const root = new TreeNode(Number(vals[0])), q = [root];
    let i = 1;
    for (let h = 0; h < q.length; h++) {
      const n = q[h];
      if (vals[i] !== 'null') q.push((n.left = new TreeNode(Number(vals[i]))));
      i++;
      if (vals[i] !== 'null') q.push((n.right = new TreeNode(Number(vals[i]))));
      i++;
    }
    return root;
  }
}

${HARNESS}
function roundTrip(root) { return new Codec().deserialize(new Codec().serialize(root)); }`,
      },
    },
  ],
  pitfalls: [
    '沒有記錄空節點:`[1,2]` 和 `[1,null,2]` 的前序都是 `1,2`,無法分辨',
    '用單一字元表示值:負數和多位數(例如 −12)會被切壞 → 用分隔符號',
    'Java 用 ArrayDeque 放 null:會丟 NullPointerException,要用 LinkedList',
  ],
  followUp: [{ q: '如果是二元**搜尋**樹(449 題)?', a: 'BST 只要前序就能唯一還原(不用空標記):依「值的上下界」遞迴建樹,字串更短。' }],
  check: {
    kind: 'fn',
    fn: 'roundTrip',
    argKinds: ['tree'],
    ret: 'tree',
    cases: [
      { args: [T], out: T },
      { args: [[]], out: [] },
      { args: [[1]], out: [1] },
      { args: [[-12, null, 345, -6]], out: [-12, null, 345, -6] },
      { args: [[1, 2, null, 3, null, 4]], out: [1, 2, null, 3, null, 4] },
    ],
  },
}
