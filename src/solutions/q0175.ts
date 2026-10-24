import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

const PERSON = [['1', 'Allen', 'Wang'], ['2', 'Bob', 'Alice']]
const ADDRESS = [['2', 'New York', 'NY'], ['1', 'Leetcode', 'CA']]

function table(cells: string[][], label: string): GridViewData {
  return { kind: 'grid', label, cells }
}

function loopFig(): FigStep[] {
  return [
    { note: 'Person 有兩列：Allen 的 personId 是 1，Bob 的 personId 是 2。每位人物都要保留。', views: [table(PERSON, 'Person：id / firstName / lastName')] },
    { note: '先看 Allen（id 1），逐列檢查 Address；第二筆地址的 id 1 相同，找到 Leetcode、CA。', views: [table([PERSON[0]], '目前人物'), table(ADDRESS, 'Address：id / city / state')] },
    { note: '再看 Bob（id 2），找到第一筆地址 New York、NY。', views: [table([PERSON[1]], '目前人物'), table([ADDRESS[0]], '配到的地址')] },
    { note: '依 Person 原順序輸出兩列；沒有地址的人也要輸出，城市與州填 NULL。', views: [table([['Allen', 'Wang', 'Leetcode', 'CA'], ['Bob', 'Alice', 'New York', 'NY']], '合併結果')] },
  ]
}

function hashFig(): FigStep[] {
  return [
    { note: '先將 Address 依 personId 建成查找表：2 對應 New York、NY；1 對應 Leetcode、CA。', views: [table(ADDRESS, 'id → city / state')] },
    { note: '讀 Allen（id 1），直接查表得到 Leetcode、CA，不必重掃地址表。', views: [table([['Allen', 'Wang', 'Leetcode', 'CA']], '第一列結果')] },
    { note: '讀 Bob（id 2），直接查表得到 New York、NY。', views: [table([['Bob', 'Alice', 'New York', 'NY']], '第二列結果')] },
    { note: '若查不到某個 id，人物仍保留，缺少的地址欄位以 NULL 表示。', views: [table([['John', 'Doe', 'NULL', 'NULL']], '沒有地址的情況')] },
  ]
}

export const q0175: Solution = {
  id: 175,
  plain: '把人物表和地址表依 personId 對起來；即使某人沒有地址，也不能把這個人漏掉。',
  statement: '原題是 SQL 的 Combine Two Tables：從 Person 輸出 firstName、lastName，並以 personId 查找 Address 的 city、state。沒有地址時仍輸出人物，地址欄位為 NULL。此站以字串矩陣模擬兩張表，使用字面值 "NULL" 表示缺值。',
  examples: [
    { input: 'Person = [["1","Allen","Wang"],["2","Bob","Alice"]], Address = [["2","New York","NY"],["1","Leetcode","CA"]]', output: '[["Allen","Wang","Leetcode","CA"],["Bob","Alice","New York","NY"]]' },
    { input: 'Person = [["1","John","Doe"]], Address = []', output: '[["John","Doe","NULL","NULL"]]' },
  ],
  constraints: ['Person.personId 唯一；Address.personId 對應至多一筆地址。', 'SQL 原題可用 `SELECT p.firstName, p.lastName, a.city, a.state FROM Person p LEFT JOIN Address a ON p.personId = a.personId`。'],
  insight: ['必須以 Person 為主表，才能保留沒有地址的人；這是 LEFT JOIN 的作用。', '在一般程式中，可逐列搜尋地址，也可先建立 personId 到地址的查找表。'],
  approaches: [
    {
      name: '逐位人物搜尋地址',
      idea: '對每個人物掃描 Address，找到相同 personId 就配對，找不到仍輸出人物。',
      steps: ['依序讀取 Person 的每列。', '在 Address 尋找相同 personId。', '找到時輸出對應城市與州；沒有找到時輸出 NULL。'],
      figure: { title: '逐列模擬 LEFT JOIN', steps: loopFig() },
      complexity: { time: 'O(PA)', space: 'O(P)', why: 'P 位人物各掃 A 筆地址；結果表需要 P 列。' },
      verdict: '最貼近 SQL 左連接的逐列語意。',
      code: {
        python: `def combineTwoTables(person, address):
    result = []
    for person_id, first_name, last_name in person:
        city = state = 'NULL'       # 找不到地址時仍保留人物
        for address_id, current_city, current_state in address:
            if address_id == person_id:
                city, state = current_city, current_state
                break
        result.append([first_name, last_name, city, state])
    return result`,
        c: `char ***combineTwoTables(char ***person, int personSize, int *personColSize, char ***address, int addressSize, int *addressColSize, int *returnSize, int **returnColumnSizes) {
    char ***result = malloc((personSize + 1) * sizeof(char **));
    *returnColumnSizes = malloc((personSize + 1) * sizeof(int));
    *returnSize = personSize;
    for (int i = 0; i < personSize; i++) {
        char *city = "NULL", *state = "NULL";
        for (int j = 0; j < addressSize; j++) {
            if (strcmp(person[i][0], address[j][0]) == 0) {
                city = address[j][1];
                state = address[j][2];
                break;
            }
        }
        result[i] = malloc(4 * sizeof(char *));
        result[i][0] = person[i][1];
        result[i][1] = person[i][2];
        result[i][2] = city;
        result[i][3] = state;
        (*returnColumnSizes)[i] = 4;
    }
    return result;
}`,
        cpp: `vector<vector<string>> combineTwoTables(vector<vector<string>>& person, vector<vector<string>>& address) {
    vector<vector<string>> result;
    for (const auto& row : person) {
        string city = "NULL", state = "NULL";
        for (const auto& candidate : address) {
            if (candidate[0] == row[0]) {
                city = candidate[1];
                state = candidate[2];
                break;
            }
        }
        result.push_back({row[1], row[2], city, state});
    }
    return result;
}`,
        java: `String[][] combineTwoTables(String[][] person, String[][] address) {
    String[][] result = new String[person.length][4];
    for (int i = 0; i < person.length; i++) {
        String city = "NULL", state = "NULL";
        for (String[] candidate : address) {
            if (candidate[0].equals(person[i][0])) {
                city = candidate[1];
                state = candidate[2];
                break;
            }
        }
        result[i] = new String[]{person[i][1], person[i][2], city, state};
    }
    return result;
}`,
        javascript: `function combineTwoTables(person, address) {
  const result = [];
  for (const [personId, firstName, lastName] of person) {
    let city = 'NULL';
    let state = 'NULL';
    for (const [addressId, currentCity, currentState] of address) {
      if (addressId === personId) {
        city = currentCity;
        state = currentState;
        break;
      }
    }
    result.push([firstName, lastName, city, state]);
  }
  return result;
}`,
      },
    },
    {
      name: '建立 personId 查找表',
      idea: '先記錄每個地址的 personId，再用一次查詢取得人物的地址。',
      steps: ['掃描 Address，建立 personId 到 city、state 的查找表。', '依 Person 順序讀取人物，透過 personId 查表。', '找不到地址時填 NULL，並保留該人物。'],
      figure: { title: '以查找表模擬 LEFT JOIN', steps: hashFig() },
      complexity: { time: 'O(P + A)', space: 'O(P + A)', why: '建表與查詢各掃一次；查找表及結果佔線性空間。' },
      verdict: '資料量大時比每位人物都重掃地址表有效率。',
      code: {
        python: `def combineTwoTables(person, address):
    by_id = {}
    for person_id, city, state in address:
        by_id[person_id] = (city, state)  # 建立地址索引
    result = []
    for person_id, first_name, last_name in person:
        city, state = by_id.get(person_id, ('NULL', 'NULL'))
        result.append([first_name, last_name, city, state])
    return result`,
        c: `char ***combineTwoTables(char ***person, int personSize, int *personColSize, char ***address, int addressSize, int *addressColSize, int *returnSize, int **returnColumnSizes) {
    int maximum = 0;
    for (int i = 0; i < addressSize; i++) {
        int id = atoi(address[i][0]);
        if (id > maximum) {
            maximum = id;
        }
    }
    char ***byId = calloc(maximum + 1, sizeof(char **));
    for (int i = 0; i < addressSize; i++) {
        byId[atoi(address[i][0])] = address[i];
    }
    char ***result = malloc((personSize + 1) * sizeof(char **));
    *returnColumnSizes = malloc((personSize + 1) * sizeof(int));
    *returnSize = personSize;
    for (int i = 0; i < personSize; i++) {
        int id = atoi(person[i][0]);
        char **found = id >= 0 && id <= maximum ? byId[id] : NULL;
        result[i] = malloc(4 * sizeof(char *));
        result[i][0] = person[i][1];
        result[i][1] = person[i][2];
        result[i][2] = found == NULL ? "NULL" : found[1];
        result[i][3] = found == NULL ? "NULL" : found[2];
        (*returnColumnSizes)[i] = 4;
    }
    free(byId);
    return result;
}`,
        cpp: `vector<vector<string>> combineTwoTables(vector<vector<string>>& person, vector<vector<string>>& address) {
    unordered_map<string, pair<string, string>> byId;
    for (const auto& row : address) {
        byId[row[0]] = {row[1], row[2]};
    }
    vector<vector<string>> result;
    for (const auto& row : person) {
        auto found = byId.find(row[0]);
        if (found == byId.end()) {
            result.push_back({row[1], row[2], "NULL", "NULL"});
        } else {
            result.push_back({row[1], row[2], found->second.first, found->second.second});
        }
    }
    return result;
}`,
        java: `String[][] combineTwoTables(String[][] person, String[][] address) {
    Map<String, String[]> byId = new HashMap<>();
    for (String[] row : address) {
        byId.put(row[0], row);
    }
    String[][] result = new String[person.length][4];
    for (int i = 0; i < person.length; i++) {
        String[] found = byId.get(person[i][0]);
        String city = found == null ? "NULL" : found[1];
        String state = found == null ? "NULL" : found[2];
        result[i] = new String[]{person[i][1], person[i][2], city, state};
    }
    return result;
}`,
        javascript: `function combineTwoTables(person, address) {
  const byId = new Map();
  for (const [personId, city, state] of address) {
    byId.set(personId, [city, state]);
  }
  const result = [];
  for (const [personId, firstName, lastName] of person) {
    const [city, state] = byId.get(personId) ?? ['NULL', 'NULL'];
    result.push([firstName, lastName, city, state]);
  }
  return result;
}`,
      },
    },
  ],
  pitfalls: ['要保留沒有地址的 Person 列；使用內連接會漏掉這些人。', '此站以字面值 "NULL" 模擬 SQL NULL，實際 SQL 的 NULL 與字串不同。'],
  check: {
    kind: 'fn',
    fn: 'combineTwoTables',
    cases: [
      { args: [PERSON, ADDRESS], out: [['Allen', 'Wang', 'Leetcode', 'CA'], ['Bob', 'Alice', 'New York', 'NY']] },
      { args: [[['1', 'John', 'Doe']], []], out: [['John', 'Doe', 'NULL', 'NULL']] },
      { args: [[], [['1', 'City', 'ST']]], out: [] },
    ],
  },
}
