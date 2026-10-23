import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1603. Design Parking System

const INIT = [1, 1, 0]
const CARS = [1, 2, 3, 1]
const NAMES = ['大', '中', '小']

function fig(): FigStep[] {
  const left = [...INIT]
  const out: FigStep[] = [{ note: `一開始:大車位 ${INIT[0]} 個、中車位 ${INIT[1]} 個、小車位 ${INIT[2]} 個。用一個長度 3 的陣列記「每種還剩幾格」`, views: [arr(left, { label: '剩餘車位(大 / 中 / 小)' })] }]
  for (const c of CARS) {
    const i = c - 1
    if (left[i] > 0) {
      left[i]--
      out.push({ note: `來了一台${NAMES[i]}車(carType = ${c}):${NAMES[i]}車位還有,停進去,剩 ${left[i]} 格 → true`, views: [arr(left, { label: '剩餘車位(大 / 中 / 小)', highlight: [i] })] })
    } else {
      out.push({ note: `來了一台${NAMES[i]}車(carType = ${c}):${NAMES[i]}車位是 0,停不進去 → false`, views: [arr(left, { label: '剩餘車位(大 / 中 / 小)', dim: [i] })] })
    }
  }
  return out
}

function fig3(): FigStep[] {
  return [
    { note: '也可以用三個變數 big、medium、small 各自記剩幾格,addCar 用 if / switch 判斷是哪一種', views: [arr(['big = 1', 'medium = 1', 'small = 0'], { label: '三個變數' })] },
    { note: 'carType = 3(小車):small 是 0 → false;其他兩種同理,有位子就減 1 回傳 true', views: [arr(['big = 1', 'medium = 1', 'small = 0'], { label: '三個變數', dim: [2] })] },
  ]
}

export const q1603: Solution = {
  id: 1603,
  plain: '停車場有大、中、小三種車位,每種各有幾格。每來一台車,看它那種車位還有沒有空格:有就停進去(空格少一個),沒有就停不了。只能停自己那種,不能大車停小格、也不能小車借大格。',
  statement: '設計類別 `ParkingSystem`:建構子 `ParkingSystem(big, medium, small)` 給三種車位的數量;`addCar(carType)` 中 carType 為 1 / 2 / 3 代表大 / 中 / 小車,該種車位有空就停進去回傳 `true`,否則回傳 `false`。',
  examples: [
    { input: '["ParkingSystem","addCar","addCar","addCar","addCar"]\n[[1,1,0],[1],[2],[3],[1]]', output: '[null,true,true,false,false]', note: '第二台大車來時大車位已經滿了' },
  ],
  constraints: ['每種車位 0 ~ 1000 個', 'addCar 最多呼叫 1000 次 → 每次 O(1) 就夠'],
  insight: ['只要記「每種車位還剩幾格」,三個數字而已', 'carType 是 1 / 2 / 3,減 1 就能當陣列索引,不用寫 if'],
  approaches: [
    {
      name: '長度 3 的陣列當計數器',
      idea: '`left = [big, medium, small]`;`addCar(t)`:`left[t−1] > 0` 就減 1 回傳 true,否則 false。',
      steps: ['建構子存 `left = [big, medium, small]`', '`addCar(t)`:`i = t − 1`', '`left[i] == 0` → false;否則 `left[i] -= 1`,回傳 true'],
      figure: { title: `車位 [${INIT}],依序來車 ${CARS.join(', ')}`, steps: fig() },
      complexity: { time: 'O(1)', space: 'O(1)', why: '每次只看、改一個數字。' },
      verdict: '最推薦。用陣列索引取代 if 判斷,程式短又不容易寫錯。',
      code: {
        python: `class ParkingSystem:
    def __init__(self, big, medium, small):
        self.left = [big, medium, small]      # 每種車位還剩幾格

    def addCar(self, carType):
        i = carType - 1                       # 1/2/3 → 索引 0/1/2
        if self.left[i] == 0:
            return False
        self.left[i] -= 1
        return True`,
        c: `typedef struct {
    int left[3];
} ParkingSystem;

ParkingSystem *parkingSystemCreate(int big, int medium, int small) {
    ParkingSystem *p = malloc(sizeof(ParkingSystem));
    p->left[0] = big; p->left[1] = medium; p->left[2] = small;
    return p;
}

bool parkingSystemAddCar(ParkingSystem *p, int carType) {
    int i = carType - 1;
    if (p->left[i] == 0) return false;
    p->left[i]--;
    return true;
}

void parkingSystemFree(ParkingSystem *p) { free(p); }`,
        cpp: `class ParkingSystem {
    int left[3];
public:
    ParkingSystem(int big, int medium, int small) : left{big, medium, small} {}

    bool addCar(int carType) {
        int &x = left[carType - 1];
        if (x == 0) return false;
        x--;
        return true;
    }
};`,
        java: `class ParkingSystem {
    private final int[] left;

    public ParkingSystem(int big, int medium, int small) {
        left = new int[]{big, medium, small};
    }

    public boolean addCar(int carType) {
        if (left[carType - 1] == 0) return false;
        left[carType - 1]--;
        return true;
    }
}`,
        javascript: `class ParkingSystem {
  constructor(big, medium, small) {
    this.left = [big, medium, small];
  }

  addCar(carType) {
    if (this.left[carType - 1] === 0) return false;
    this.left[carType - 1]--;
    return true;
  }
}`,
      },
    },
    {
      name: '三個變數 + 分支',
      idea: '`big`、`medium`、`small` 各存一個;`addCar` 依 carType 走不同分支。',
      steps: ['建構子存三個變數', '`addCar(t)`:依 t 選出對應的變數', '大於 0 就減 1 回傳 true,否則 false'],
      figure: { title: '同一個例子', steps: fig3() },
      complexity: { time: 'O(1)', space: 'O(1)', why: '一次判斷。' },
      verdict: '最直觀,但三段幾乎一樣的程式碼,改一處容易漏改另一處。種類變多時就該換成陣列。',
      code: {
        python: `class ParkingSystem:
    def __init__(self, big, medium, small):
        self.big, self.medium, self.small = big, medium, small

    def addCar(self, carType):
        if carType == 1:
            if self.big == 0:
                return False
            self.big -= 1
        elif carType == 2:
            if self.medium == 0:
                return False
            self.medium -= 1
        else:
            if self.small == 0:
                return False
            self.small -= 1
        return True`,
        c: `typedef struct {
    int big, medium, small;
} ParkingSystem;

ParkingSystem *parkingSystemCreate(int big, int medium, int small) {
    ParkingSystem *p = malloc(sizeof(ParkingSystem));
    p->big = big; p->medium = medium; p->small = small;
    return p;
}

bool parkingSystemAddCar(ParkingSystem *p, int carType) {
    int *x = carType == 1 ? &p->big : carType == 2 ? &p->medium : &p->small;
    if (*x == 0) return false;
    (*x)--;
    return true;
}

void parkingSystemFree(ParkingSystem *p) { free(p); }`,
        cpp: `class ParkingSystem {
    int big, medium, small;
public:
    ParkingSystem(int b, int m, int s) : big(b), medium(m), small(s) {}

    bool addCar(int carType) {
        switch (carType) {
            case 1: return big > 0 ? (big--, true) : false;
            case 2: return medium > 0 ? (medium--, true) : false;
            default: return small > 0 ? (small--, true) : false;
        }
    }
};`,
        java: `class ParkingSystem {
    private int big, medium, small;

    public ParkingSystem(int big, int medium, int small) {
        this.big = big; this.medium = medium; this.small = small;
    }

    public boolean addCar(int carType) {
        switch (carType) {
            case 1: if (big == 0) return false; big--; return true;
            case 2: if (medium == 0) return false; medium--; return true;
            default: if (small == 0) return false; small--; return true;
        }
    }
}`,
        javascript: `class ParkingSystem {
  constructor(big, medium, small) {
    this.big = big;
    this.medium = medium;
    this.small = small;
  }

  addCar(carType) {
    const key = carType === 1 ? 'big' : carType === 2 ? 'medium' : 'small';
    if (this[key] === 0) return false;
    this[key]--;
    return true;
  }
}`,
      },
    },
  ],
  pitfalls: ['carType 是 1 起算,直接拿來當索引會差一格', '停不進去時不要把計數減成負數'],
  check: {
    kind: 'class',
    cls: 'ParkingSystem',
    cases: [
      { ops: ['ParkingSystem', 'addCar', 'addCar', 'addCar', 'addCar'], args: [INIT, [1], [2], [3], [1]], out: [null, true, true, false, false] },
      { ops: ['ParkingSystem', 'addCar', 'addCar', 'addCar', 'addCar', 'addCar'], args: [[0, 0, 2], [3], [1], [3], [3], [2]], out: [null, true, false, true, false, false] },
    ],
  },
}
