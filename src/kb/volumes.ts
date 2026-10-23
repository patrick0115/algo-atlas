// 百科的七卷:卷一、卷二、卷三是原本的演算法圖鑑,卷四到卷六是原 SemiDrill 講義。

export interface BookMeta {
  id: string
  name: string
  /** 涵蓋的考點範圍,例:L01～L04 */
  range: string
  desc: string
}

export interface Volume {
  id: string
  name: string
  desc: string
  /** 這一卷收的講義書(卷一、卷二另外還有基礎篇單元與演算法分類) */
  books: BookMeta[]
}

const B = (id: string, name: string, range: string, desc: string): BookMeta => ({ id, name, range, desc })

export const VOLUMES: Volume[] = [
  {
    id: 'base',
    name: '卷一 程式基礎',
    desc: '開始刷題、複雜度、程式語言、資料結構、解題思維,以及線上程式測驗的失分點。',
    books: [
      B('H', '程式語言與演算法', 'H01～H12', 'Big-O 拉桿比較與二分搜尋逐步動畫,C／C++、C#／.NET、Python、OOP 與資料結構;H07～H12 是 C、C++、Python、C# 的語言細節與通用程式觀念,附「這段印出什麼」範例。'),
      B('Q', '程式測驗常考觀念', 'Q01～Q03', 'HackerRank 這類線上測驗的失分點:SQL 執行順序、JOIN 與 NULL、window function,正規表示式的貪婪與錨點,溢位、空輸入、重複元素與差一錯誤。'),
    ],
  },
  {
    id: 'algo',
    name: '卷二 演算法',
    desc: '每個演算法一個詞條:白話、動畫、判斷、專業、題目;每一類附總結。',
    books: [
      B('P', 'LeetCode 解題套路', 'P01～P14', '滑動視窗與單調堆疊逐步動畫、「看到什麼想到什麼」對照表,雙指標、二分、hash、鏈結串列、樹、圖、回溯、DP、貪婪、heap、位元與從 n 範圍反推複雜度。'),
    ],
  },
  {
    id: 'sol',
    name: '卷三 題解',
    desc: '每題用自己的話重述題意、從限制反推複雜度、多種解法的逐步圖示與五種語言程式碼。',
    books: [],
  },
  {
    id: 'semi',
    name: '卷四 半導體',
    desc: '一顆晶片的一生:元件 → 前段製程 → 設計 → 封裝測試,加上顯示驅動、產業鏈與量產品質。',
    books: [
      B('A', '元件與物理', 'A01～A05', '可點部位、可拉電壓的 NMOS 剖面,加上平面 → FinFET → GAA 演進與五個考點的 L1／L2／L3。'),
      B('B', '前段製程', 'B01～B06', '14 步剖面逐步看,加上六站的 L1／L2／L3 重點與異常對策表。'),
      B('C', '設計與驗證', 'C01～C05', 'RTL 到 GDS 的 10 步流程、可拉桿的 setup／hold slack,加上類比混訊、功耗、DFT 與 PDK。'),
      B('D', '封裝與測試', 'D01～D05', '從 CP 到 burn-in 的 10 步流程,COG／COF、2.5D／3D、良率模型與 FA 手法。'),
      B('E', '顯示驅動與面板', 'E01～E06', '從輸入介面、T-CON、Source／Gate Driver 到面板與背光的整條訊號鏈,加上液晶光閥、TN／VA／IPS、色域、PMIC、Gamma、VCOM。'),
      B('F', '產業鏈與市場', 'F01～F05', '可切換 IDM／Fabless／Fab-lite 的價值鏈互動圖,主要廠商、設備材料、節點藍圖與出口管制。'),
      B('G', '品質與量產', 'G01～G03', '可拉桿的 Cp／Cpk 與不良率、逐點管制圖,wafer map 型態、NPI／8D 與規格書判讀。'),
    ],
  },
  {
    id: 'sys',
    name: '卷五 系統與嵌入式',
    desc: '作業系統、韌體、通訊介面與數位邏輯:軟體怎麼一路碰到硬體。',
    books: [
      B('I', '作業系統與系統程式', 'I01～I07', 'race condition 與 deadlock 逐步動畫,虛擬記憶體、cache、Linux、網路與資料庫。'),
      B('K', '韌體與嵌入式', 'K01～K05', '可切換正常、斷電、回退情境的 MCU 開機流程,register 操作、中斷、週邊控制與驅動分層。'),
      B('L', '通訊介面與總線', 'L01～L04', '可切換 I²C／SPI／UART／CAN 仲裁的逐段波形,四種介面對照表,USB 列舉、PCIe 世代與 SI,以及透過介面燒錄韌體的 ISP。'),
      B('M', '數位邏輯與 FPGA 驗證', 'M01～M05', 'CDC 亞穩態與同步器逐步波形、Moore／Mealy FSM,Verilog 寫法、時序約束與驗證。'),
    ],
  },
  {
    id: 'swe',
    name: '卷六 軟體工程與 AI',
    desc: '版本控制、測試與除錯,機器學習基礎,以及用 AI 寫程式的方法與風險。',
    books: [
      B('J', '軟體工程與工具鏈', 'J01～J07', '可切換 merge／rebase／cherry-pick 的 Git 分支圖、CI／CD pipeline,架構、測試與除錯。'),
      B('N', 'AI 與機器學習', 'N01～N05', '拉桿調門檻看混淆矩陣與 precision／recall、調模型複雜度看過擬合,影像處理與部署。'),
      B('O', 'AI 輔助開發', 'O01～O06', 'AI coding agent 工作迴圈逐步看,好做法與常見地雷對照,context、工具、RAG、review 與風險。'),
    ],
  },
]

export const BOOK_META: Record<string, BookMeta & { vol: string }> = Object.fromEntries(
  VOLUMES.flatMap((v) => v.books.map((b) => [b.id, { ...b, vol: v.id }])),
)
