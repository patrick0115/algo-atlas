// 原 SemiDrill 講義(git 歷史裡的 public/semi/ 原檔)搬進百科的資料;內容是原講義的 HTML 片段,改這裡就是改講義。
import type { Book } from '../types'

export const book: Book = {
  "id": "C",
  "file": "C-design.html",
  "title": "設計與驗證：從一行 RTL 到一張光罩",
  "lead": "晶片設計是一連串「<b>翻譯＋檢查</b>」：RTL 翻成邏輯閘、邏輯閘翻成擺放好的佈局、佈局翻成光罩圖形；每翻一次就要用另一種工具確認<b>沒翻錯（LVS／LEC）、做得出來（DRC）、跑得夠快又不出錯（STA）、電源撐得住（IR／EM）、出廠測得出來（DFT）</b>。類比電路不走這條自動化流水線，靠人手設計、靠匹配與補償撐住精度。",
  "note": "<p class=\"muted small\">對應 taxonomy C01～C05。難度標籤：<span class=\"lv\">L1</span>是什麼　<span class=\"lv l2\">L2</span>為什麼　<span class=\"lv l3\">L3</span>出問題怎麼辦。</p>",
  "front": [
    {
      "id": "flow",
      "title": "主圖一：數位設計流程，一步一步看",
      "blocks": [
        {
          "t": "html",
          "html": "<p class=\"muted small\">點步驟或用「上一步／下一步」。每一步看三件事：吃進什麼、吐出什麼、這一步會抓到哪種錯。實際流程會反覆迭代（時序不過就回頭改），這裡畫成單向方便看主幹。</p>"
        },
        {
          "t": "widget",
          "id": "C.flow",
          "html": "<ul class=\"steps\" id=\"steps\"></ul>\n<div class=\"stage\">\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" id=\"flowSvg\" viewBox=\"0 0 900 226\" role=\"img\" aria-label=\"數位設計流程\" style=\"min-width:640px\"></svg>\n      </div>\n      <div class=\"controls\" style=\"margin:12px 0 0\">\n        <button class=\"btn\" id=\"prev\">← 上一步</button>\n        <button class=\"btn primary\" id=\"next\">下一步 →</button>\n        <span class=\"muted small\" id=\"phase\"></span>\n      </div>\n      <div class=\"stage-info\">\n        <h3 id=\"stTitle\"></h3>\n        <p id=\"stWhat\"></p>\n        <p class=\"muted small\" id=\"stWhy\"></p>\n      </div>\n    </div>"
        }
      ]
    },
    {
      "id": "timing",
      "title": "主圖二：拉拉看 setup／hold slack",
      "blocks": [
        {
          "t": "html",
          "html": "<p class=\"muted small\">一條路徑：發射端正反器（launch FF）在時脈邊緣送出資料，經過組合邏輯，到接收端正反器（capture FF）。Dmax／Dmin 是組合邏輯最長／最短路徑延遲。固定 Tcq＝0.4 ns、Tsetup＝0.3 ns、Thold＝0.2 ns。skew 為正代表接收端時脈比較晚到。</p>"
        },
        {
          "t": "widget",
          "id": "C.timing",
          "html": "<div class=\"controls\">\n      <div class=\"seg\" id=\"preset\">\n        <button data-k=\"ok\" class=\"on\">正常</button>\n        <button data-k=\"setup\">setup 違規</button>\n        <button data-k=\"hold\">hold 違規</button>\n      </div>\n    </div>\n<div class=\"stage\">\n      <div class=\"sliders\">\n        <label class=\"inline\">週期 T <input type=\"range\" id=\"rT\" min=\"2\" max=\"8\" step=\"0.1\"><output id=\"oT\"></output></label>\n        <label class=\"inline\">Dmax <input type=\"range\" id=\"rMax\" min=\"0.5\" max=\"8\" step=\"0.1\"><output id=\"oMax\"></output></label>\n        <label class=\"inline\">Dmin <input type=\"range\" id=\"rMin\" min=\"0\" max=\"3\" step=\"0.1\"><output id=\"oMin\"></output></label>\n        <label class=\"inline\">skew <input type=\"range\" id=\"rS\" min=\"-1\" max=\"1.5\" step=\"0.1\"><output id=\"oS\"></output></label>\n      </div>\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" id=\"tSvg\" viewBox=\"0 0 900 250\" role=\"img\" aria-label=\"setup 與 hold 時序圖\" style=\"min-width:640px\"></svg>\n      </div>\n      <div class=\"stage-info\">\n        <p class=\"slack\" id=\"sSetup\"></p>\n        <p class=\"slack\" id=\"sHold\"></p>\n        <p class=\"muted small\" id=\"sNote\"></p>\n      </div>\n    </div>"
        }
      ]
    },
    {
      "id": "compare",
      "title": "五個考點一張表",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th></th><th>在問什麼</th><th>主要工具／產出</th><th>沒做好的下場</th></tr>\n      <tr><td>C01 流程</td><td>RTL 怎麼一路變成 GDS</td><td>合成、P&amp;R、萃取、DRC／LVS、LEC</td><td>光罩做錯、電路跟設計不一樣</td></tr>\n      <tr><td>C02 類比</td><td>電壓電流的精度與穩定</td><td>手畫電路＋SPICE 模擬、匹配佈局</td><td>offset、震盪、雜訊、溫漂</td></tr>\n      <tr><td>C03 時序功耗</td><td>夠不夠快、會不會太燙、電源撐不撐得住</td><td>STA、功耗分析、IR／EM 分析</td><td>頻率上不去、偶發錯、壽命縮短</td></tr>\n      <tr><td>C04 DFT</td><td>出廠時怎麼知道每顆都是好的</td><td>scan、ATPG、BIST、coverage 報告</td><td>壞片流到客戶（DPPM 高）</td></tr>\n      <tr><td>C05 IP／PDK</td><td>拿什麼積木、照什麼規則蓋</td><td>標準元件庫、PDK、IP 授權</td><td>做不出來、IP 不相容、授權糾紛</td></tr>\n    </tbody></table></div>"
        }
      ]
    }
  ],
  "entries": [
    {
      "id": "C01",
      "anchor": "c01",
      "tag": "C01",
      "name": "數位設計流程",
      "sub": "RTL→GDS、簽核",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>前端把「功能」寫成 RTL 並翻成邏輯閘（netlist）；後端把邏輯閘擺好、接好線，做成佈局（layout）；最後用<b>萃取＋STA</b>確認時序、用 <b>DRC／LVS</b> 確認做得出來又沒接錯，才輸出 GDS 交給晶圓廠。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>RTL</td><td>Register Transfer Level，用 Verilog／VHDL／SystemVerilog 描述「每個時脈暫存器之間怎麼搬資料」。寫法像程式，但描述的是硬體</td></tr>\n        <tr><td>功能驗證</td><td>用模擬（testbench、UVM）、lint（語法與風格檢查）、CDC（跨時脈域檢查）確認 RTL 行為對。通常是整個專案最花人力的部分</td></tr>\n        <tr><td>邏輯合成（synthesis）</td><td>工具把 RTL 翻成用標準元件（AND、FF…）組成的 gate-level netlist，依據時序限制（SDC）與元件庫（.lib）做最佳化</td></tr>\n        <tr><td>SDC</td><td>Synopsys Design Constraints：時脈頻率、輸入輸出延遲、false path、multicycle path 等時序限制。寫錯，後面所有時序結果都不可信</td></tr>\n        <tr><td>LEC（等價性檢查）</td><td>Logic Equivalence Check，用形式化方法證明合成前後、ECO 前後的電路功能一模一樣，不必跑模擬</td></tr>\n        <tr><td>Floorplan</td><td>決定晶片大小、大區塊（memory、類比 IP）位置、I/O pad 位置、電源網（power plan）</td></tr>\n        <tr><td>Placement／CTS／Routing</td><td>擺放標準元件 → 建時脈樹（Clock Tree Synthesis，讓時脈同時到每個 FF） → 繞金屬線。三步合稱 P&amp;R（Place and Route）</td></tr>\n        <tr><td>寄生萃取（extraction）</td><td>從佈局算出每條線的電阻、電容（含線與線之間的耦合電容），輸出 SPEF 檔給 STA 用</td></tr>\n        <tr><td>STA</td><td>Static Timing Analysis，不跑向量、窮舉所有路徑算延遲，檢查 setup／hold（詳見 C03）</td></tr>\n        <tr><td>DRC</td><td>Design Rule Check：佈局有沒有違反晶圓廠的幾何規則（最小線寬、間距、包覆、密度、antenna）</td></tr>\n        <tr><td>LVS</td><td>Layout Versus Schematic：從佈局「萃取」出電路，跟 netlist 比對，找短路、斷路、元件或參數不符</td></tr>\n        <tr><td>ERC</td><td>Electrical Rule Check：浮接的閘極、沒接的 well、電源接錯等電氣上的錯</td></tr>\n        <tr><td>GDSII／OASIS</td><td>佈局的檔案格式，交給晶圓廠做光罩。交出去這件事叫 tape-out</td></tr>\n        <tr><td>ECO</td><td>Engineering Change Order，後段小修改。tape-out 後的 metal-only ECO 只改金屬層光罩，用預先撒好的 spare cell 改邏輯</td></tr>\n      </tbody></table></div>",
          "anchor": "c01-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>DRC 過了，為什麼還要跑 LVS？</b>DRC 只管「做得出來」，不管「對不對」：兩條線不小心碰在一起，幾何上完全合法，DRC 不會報，但電路已經短路。LVS 從佈局反推電路再跟 netlist 比，才抓得到。</li>\n        <li><b>合成時時序過了，為什麼佈局後又不過？</b>合成時還沒有真的線，只能用估計的線負載；擺完、繞完才知道線多長、跟誰相鄰。真正的 RC 和耦合電容出來後延遲變大，所以要以「萃取後的 STA」為準。現代流程用 physically-aware 合成，提早把擺放資訊放進來縮小落差。</li>\n        <li><b>為什麼要 LEC，模擬不就好了？</b>模擬只能證明「跑過的向量是對的」；LEC 用數學證明「所有輸入下都一樣」，而且比全晶片 gate-level 模擬快得多。合成、插 scan、ECO 之後都要跑。</li>\n        <li><b>為什麼 tape-out 後偏好 metal-only ECO？</b>全套光罩很貴，只改上面幾層金屬就能少換很多張光罩、也能用還沒做完金屬層的晶圓（wafer 先停在前段等）。代價是只能用事先撒的 spare cell，改不了大功能。</li>\n        <li><b>antenna 規則在防什麼？</b>製程中金屬線還沒接到擴散區之前，電漿蝕刻會在長金屬線上累積電荷，透過它接著的閘極放電，打傷薄閘氧化層。規則限制「金屬面積／閘極面積」比例，違規時換到上層金屬跳線或加保護二極體。</li>\n      </ul>",
          "anchor": "c01-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>LVS 報 short，兩個電源網被認成同一個</td><td>電源線繞錯碰在一起、或 pin／label 打錯名稱</td><td>用工具的 short 定位功能找出最短的短路路徑，修佈局或修 label；VDD／VSS 的 short 要最優先修，它會掩蓋其他錯</td></tr>\n        <tr><td>繞線後滿滿的 DRC 與繞不完（congestion）</td><td>元件擺太密（utilization 太高）、巨集擺放擋住繞線通道、腳位集中在一角</td><td>降低 utilization、調整 floorplan 讓出通道、在擁擠區加 placement blockage</td></tr>\n        <tr><td>佈局後 setup 大量違規，合成時明明是正的</td><td>線負載估太樂觀、SDC 沒考慮真實 I/O 延遲</td><td>改 physically-aware 合成、回頭重寫 SDC、對關鍵路徑做 upsizing 或改架構（加 pipeline）</td></tr>\n        <tr><td>ECO 後 LEC 不過</td><td>手改 netlist 改錯、或改到 scan／clock gating 讓結構不同</td><td>看 LEC 的 non-equivalent 點回推，設好 scan 模式的 constraint 再比</td></tr>\n        <tr><td>tape-out 後才發現小 bug</td><td>驗證漏網</td><td>評估能否用 spare cell 做 metal-only ECO；不行才全光罩改版。事前在佈局撒 spare cell 就是為了這一天</td></tr>\n        <tr><td>DRC 只剩金屬密度（density）違規</td><td>大片空白區金屬太少，CMP 會磨出凹陷</td><td>跑 metal fill（dummy 金屬）；填完要重新萃取，因為 dummy 會增加耦合電容</td></tr>\n      </tbody></table></div>",
          "anchor": "c01-l3"
        }
      ]
    },
    {
      "id": "C02",
      "anchor": "c02",
      "tag": "C02",
      "name": "類比與混訊",
      "sub": "運放、ADC、LDO",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>數位只要分得出 0 和 1，類比要的是<b>精確的電壓電流</b>：運放負責放大與驅動、ADC／DAC 負責數位類比互轉、LDO 負責乾淨穩定的電源、band-gap 負責一個不隨溫度變的基準電壓。精度靠<b>回授、匹配、補償</b>撐住。</p>\n<figure>\n      <div class=\"table-wrap\">\n      <svg class=\"fig\" viewBox=\"0 0 900 180\" role=\"img\" aria-label=\"Source driver 一個通道的類比路徑\" style=\"min-width:640px\">\n        <defs><marker id=\"ahS\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n        <text x=\"0\" y=\"16\" class=\"t-strong\">實務連結：source driver 一個通道就是一條混訊路徑</text>\n        <rect class=\"bx\" x=\"0\" y=\"80\" width=\"150\" height=\"58\" rx=\"6\"></rect><text x=\"12\" y=\"104\">Latch</text><text x=\"12\" y=\"126\" class=\"t-small\">存這一行的灰階碼</text>\n        <rect class=\"bx\" x=\"182\" y=\"80\" width=\"150\" height=\"58\" rx=\"6\"></rect><text x=\"194\" y=\"104\">Level shifter</text><text x=\"194\" y=\"126\" class=\"t-small\">低壓邏輯轉高壓</text>\n        <rect class=\"bx-accent\" x=\"364\" y=\"80\" width=\"150\" height=\"58\" rx=\"6\"></rect><text x=\"376\" y=\"104\">Gamma DAC</text><text x=\"376\" y=\"126\" class=\"t-small\">電阻串選一階電壓</text>\n        <rect class=\"bx-accent\" x=\"546\" y=\"80\" width=\"150\" height=\"58\" rx=\"6\"></rect><text x=\"558\" y=\"104\">輸出 buffer</text><text x=\"558\" y=\"126\" class=\"t-small\">運放單位增益</text>\n        <rect class=\"bx\" x=\"728\" y=\"80\" width=\"150\" height=\"58\" rx=\"6\"></rect><text x=\"740\" y=\"104\">面板資料線</text><text x=\"740\" y=\"126\" class=\"t-small\">大 RC 負載</text>\n        <rect class=\"bx\" x=\"364\" y=\"30\" width=\"150\" height=\"34\" rx=\"6\"></rect><text x=\"376\" y=\"52\" class=\"t-small\">gamma 參考電壓</text>\n        <line class=\"ln\" x1=\"439\" y1=\"64\" x2=\"439\" y2=\"78\" marker-end=\"url(#ahS)\"></line>\n        <line class=\"ln\" x1=\"150\" y1=\"109\" x2=\"180\" y2=\"109\" marker-end=\"url(#ahS)\"></line>\n        <line class=\"ln\" x1=\"332\" y1=\"109\" x2=\"362\" y2=\"109\" marker-end=\"url(#ahS)\"></line>\n        <line class=\"ln\" x1=\"514\" y1=\"109\" x2=\"544\" y2=\"109\" marker-end=\"url(#ahS)\"></line>\n        <line class=\"ln\" x1=\"696\" y1=\"109\" x2=\"726\" y2=\"109\" marker-end=\"url(#ahS)\"></line>\n        <text x=\"0\" y=\"168\" class=\"t-small\">DAC 的 INL／DNL 決定灰階準不準；buffer 的 offset 在通道之間不一致，就是面板上的直線條紋。</text>\n      </svg>\n      </div>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>運放（op amp）</td><td>高增益差動放大器，幾乎都接負回授使用。關鍵規格：開迴路增益、GBW（增益頻寬積）、相位裕度、slew rate（輸出最快變化速度）、輸入 offset、CMRR、PSRR、輸出擺幅（rail-to-rail）</td></tr>\n        <tr><td>單位增益 buffer</td><td>輸出直接接回反相輸入，增益 1。用途是「電壓不變、推力變大」，source driver 的輸出級就是它</td></tr>\n        <tr><td>相位裕度（phase margin）</td><td>迴路增益降到 1 時，相位離 −180° 還差幾度。太小會振鈴甚至震盪；dominant-pole 補償約可給到 45°，實務常再留更多</td></tr>\n        <tr><td>解析度與 LSB</td><td>N bit 的轉換器把滿刻度切成 2<sup>N</sup> 階，1 LSB＝滿刻度 ÷ 2<sup>N</sup>。例：10 bit、1 V 滿刻度，1 LSB 約 0.98 mV</td></tr>\n        <tr><td>DNL</td><td>相鄰兩階的實際間距跟理想 1 LSB 差多少。DNL＝−1 LSB 代表某一碼寬度為 0，也就是 missing code</td></tr>\n        <tr><td>INL</td><td>整條轉換曲線偏離理想直線最多多少 LSB，可以看成 DNL 一路累加</td></tr>\n        <tr><td>單調性（monotonic）</td><td>輸入變大，輸出絕不變小。DNL 優於 1 LSB 時可保證無 missing code、單調</td></tr>\n        <tr><td>取樣定理</td><td>取樣頻率要大於訊號頻寬的 2 倍（fs &gt; 2B）；高於 fs/2 的成分會折回來變成假的低頻（aliasing），所以 ADC 前面要放抗混疊低通濾波器</td></tr>\n        <tr><td>ADC 架構</td><td>SAR（逐次逼近，中速中精度、省電，MCU 最常見）、Flash（最快、比較器數隨解析度指數增加）、Pipeline（高速）、Σ-Δ（過取樣＋雜訊整形，高精度低速，音訊與量測）</td></tr>\n        <tr><td>DAC 架構</td><td>電阻串（R-string，天生單調，顯示驅動 IC 的 gamma DAC 常用）、R-2R、電流舵（current steering，高速）</td></tr>\n        <tr><td>LDO</td><td>低壓差線性穩壓器：用一顆 pass 電晶體當可變電阻，誤差放大器比較輸出與基準，調整壓降。效率約 V<sub>OUT</sub>／V<sub>IN</sub></td></tr>\n        <tr><td>Dropout voltage</td><td>還能維持穩壓的最小 V<sub>IN</sub>－V<sub>OUT</sub>。輸入再低，輸出就跟著輸入掉</td></tr>\n        <tr><td>PSRR／Iq</td><td>PSRR：輸入電源上的漣波被擋掉多少（dB），例：1 MHz 時 55 dB，1 mV 漣波只剩約 1.8 µV。Iq：LDO 自己吃掉的靜態電流</td></tr>\n        <tr><td>Band-gap reference</td><td>把「隨溫度下降」的 V<sub>BE</sub>（約 −2 mV/K，CTAT）和「隨溫度上升」的 PTAT 電壓按比例相加，抵消一次溫度係數，得到約 1.2 V 的基準。一般 25～50 ppm/°C，好的設計可到 1～2 ppm/°C</td></tr>\n      </tbody></table></div>",
          "anchor": "c02-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>gamma DAC 後面為什麼一定要接 buffer？</b>電阻串的輸出阻抗高、推不動面板資料線那麼大的 RC 負載，直接接上去電壓會被拉垮、充電很慢。運放 buffer 把電壓「照抄」並提供大電流，在一條 line time 內把資料線充到位。</li>\n        <li><b>為什麼 buffer 的 offset 會變成直條紋？</b>每個通道一顆 buffer，製程上的元件不匹配讓每顆的 offset 都不同；同一個灰階，相鄰通道輸出差幾 mV，在面板上就是一條條亮暗不同的直線。對策是匹配佈局、加大輸入對管面積，或用 chopper／offset cancellation 讓 offset 在時間上平均掉（極性輪替）。</li>\n        <li><b>電阻串 DAC 為什麼天生單調？</b>每一階都是電阻串上的一個節點，碼越大節點越高，物理上不可能倒退；代價是 bit 數多時電阻與開關數量暴增，所以高 bit 數會改分段架構。</li>\n        <li><b>運放推大電容負載為什麼容易震盪？</b>負載電容在輸出端多加一個極點，吃掉相位裕度。對策：加大補償電容（Miller 補償，代價是頻寬與 slew rate 下降）、輸出串一顆小電阻隔離負載、或把輸出級設計成以負載電容當主極點。</li>\n        <li><b>為什麼大壓差、大電流不適合用 LDO？</b>LDO 是靠 pass 電晶體「吃掉」多出來的電壓，損耗功率＝(V<sub>IN</sub>－V<sub>OUT</sub>) × 負載電流，全部變成熱。壓差小或電流小時無所謂；壓差大又要大電流，效率低、晶片發燙，這時改用開關式 DC-DC（效率高但有切換漣波），需要乾淨電源時再在後面接一顆 LDO。</li>\n        <li><b>LDO 的 PSRR 為什麼高頻變差？</b>PSRR 靠迴路增益把輸入漣波壓下去；頻率一高，誤差放大器的增益掉了，漣波就漏過去。更高頻段再靠輸出電容旁路。所以看規格書要看「在你在意的頻率」的 PSRR，不能只看 DC 值。</li>\n        <li><b>LDO 為什麼挑輸出電容？</b>PMOS／PNP pass 元件的 LDO 輸出端是高阻抗，主極點落在輸出電容上，穩定性跟電容值與 ESR 綁在一起；有些老設計要靠 ESR 產生零點補相位，換成極低 ESR 的陶瓷電容反而震盪。規格書會給「穩定的電容值與 ESR 範圍」。</li>\n        <li><b>band-gap 為什麼需要啟動電路？</b>它的回授結構有兩個穩態，其中一個是「所有電流都是 0」。上電時如果停在零電流狀態就永遠不會起來，所以要加 start-up 電路在上電時推一把，起來後自動退出。</li>\n        <li><b>類比為什麼不跟著製程微縮變便宜？</b>精度靠元件面積（越大匹配越好）與電壓擺幅，先進製程電壓更低、雜訊與匹配更難，類比面積縮不下去。這也是顯示驅動 IC 多用成熟製程、高壓製程的原因之一。</li>\n      </ul>",
          "anchor": "c02-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>面板出現固定位置的細直條紋（vertical line mura）</td><td>source driver 通道之間 buffer offset 不一致，或 gamma 電阻串某段不匹配</td><td>量各通道輸出電壓找出離群通道；設計端用 chopper／offset cancellation、匹配佈局（common-centroid、dummy 元件）</td></tr>\n        <tr><td>輸出 buffer 在某些負載下振鈴、甚至震盪</td><td>負載電容（面板＋COF 走線）超出設計假設，相位裕度不足</td><td>模擬時把實際負載 RC 模型放進去，留足相位裕度；輸出串隔離電阻、調補償</td></tr>\n        <tr><td>ADC 讀值某幾個碼永遠不出現</td><td>DNL 差到 −1 LSB，出現 missing code</td><td>確認規格書是否保證 no missing codes；量測用直方圖法（慢斜波或正弦輸入統計每碼出現次數）找出問題碼</td></tr>\n        <tr><td>量到的頻率怪怪的，比實際訊號低很多</td><td>訊號含高於 fs/2 的成分，aliasing 折回來</td><td>前端加抗混疊濾波器，或提高取樣率；Σ-Δ ADC 靠過取樣放寬濾波器要求</td></tr>\n        <tr><td>LDO 換了陶瓷電容後輸出震盪</td><td>電容 ESR 太低，不在規格書的穩定範圍內</td><td>改用規格書指定範圍的電容，或串小電阻補 ESR；新設計選「ceramic stable」的 LDO</td></tr>\n        <tr><td>電池快沒電時系統亂 reset</td><td>V<sub>IN</sub> 低於 V<sub>OUT</sub>＋dropout，LDO 失去穩壓、輸出跟著掉</td><td>依最低輸入電壓與滿載 dropout 選料；加 UVLO 或低電壓偵測提早關機</td></tr>\n        <tr><td>band-gap 電壓偶爾上電不起來</td><td>start-up 電路在某些上電斜率或溫度下沒成功推動</td><td>在各種 VDD 上升速度與溫度角落模擬上電；量產測試檢查上電後基準電壓</td></tr>\n      </tbody></table></div>",
          "anchor": "c02-l3"
        }
      ]
    },
    {
      "id": "C03",
      "anchor": "c03",
      "tag": "C03",
      "name": "時序與功耗",
      "sub": "setup／hold、IR、EM",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>時序看<b>資料趕不趕得上（setup）、會不會太早把舊資料蓋掉（hold）</b>；功耗看<b>切換時的充放電（動態）與漏電（靜態）</b>；電源網則要擔心<b>壓降（IR drop）讓元件變慢、大電流長期沖斷導線（EM）、熱讓漏電與老化更嚴重</b>。</p>\n<figure>\n      <div class=\"table-wrap\">\n      <svg class=\"fig\" viewBox=\"0 0 900 190\" role=\"img\" aria-label=\"電源網壓降示意\" style=\"min-width:640px\">\n        <text x=\"0\" y=\"16\" class=\"t-strong\">IR drop：離供電點越遠，電壓越低</text>\n        <rect class=\"bx\" x=\"60\" y=\"34\" width=\"780\" height=\"40\" rx=\"4\"></rect>\n        <rect class=\"fill-fg\" x=\"60\" y=\"34\" width=\"14\" height=\"40\"></rect>\n        <rect class=\"fill-fg\" x=\"826\" y=\"34\" width=\"14\" height=\"40\"></rect>\n        <text x=\"82\" y=\"59\" class=\"t-small\">電源 pad</text>\n        <text x=\"400\" y=\"59\" class=\"t-small\">晶片核心（電源網）</text>\n        <text x=\"764\" y=\"59\" class=\"t-small\">電源 pad</text>\n        <line class=\"ln dash\" x1=\"60\" y1=\"100\" x2=\"840\" y2=\"100\"></line>\n        <text x=\"0\" y=\"104\" class=\"t-small\">VDD</text>\n        <path class=\"ln-accent\" d=\"M60,100 Q450,190 840,100\"></path>\n        <text x=\"372\" y=\"134\" class=\"t-small\">中央電壓最低</text>\n        <text x=\"0\" y=\"176\" class=\"t-small\">壓降＝電流 × 電源網電阻。電壓低 → cell 變慢 → setup 失敗；對策：加 pad／bump、加寬電源網、加 decap、錯開切換。</text>\n      </svg>\n      </div>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>Setup／Hold time</td><td>FF 取樣邊緣<b>之前</b>資料要穩定多久（setup）、<b>之後</b>還要維持多久（hold）</td></tr>\n        <tr><td>Slack</td><td>要求時間－實際到達時間。正＝有餘裕，負＝違規。報告常看 WNS（最差那條的 slack）與 TNS（所有負 slack 加總）</td></tr>\n        <tr><td>Setup 檢查</td><td><code>T + skew − (Tcq + Dmax) − Tsetup ≥ 0</code>：最慢的資料要在下一個邊緣前趕到</td></tr>\n        <tr><td>Hold 檢查</td><td><code>(Tcq + Dmin) − (skew + Thold) ≥ 0</code>：最快的資料不能在同一個邊緣就衝進接收端。式子裡<b>沒有 T</b></td></tr>\n        <tr><td>Clock skew／jitter</td><td>skew：同一個時脈邊緣到不同 FF 的時間差（空間上）；jitter：時脈邊緣每一週期的時間抖動（時間上）</td></tr>\n        <tr><td>CTS</td><td>Clock Tree Synthesis：用 buffer 樹把時脈平衡地送到成千上萬個 FF，壓低 skew</td></tr>\n        <tr><td>PVT corner</td><td>製程（快／慢）、電壓、溫度的極端組合。setup 通常看慢角落（慢製程＋低電壓，傳統上配高溫；先進製程低電壓時低溫可能更慢，見 C05 溫度反轉），hold 看快角落（快製程＋高電壓），全部角落都要過（sign-off corners）</td></tr>\n        <tr><td>OCV</td><td>On-Chip Variation：同一顆晶片上不同位置的元件也有快慢差，STA 會對路徑加減一個比例（derate）保守估計</td></tr>\n        <tr><td>False path／Multicycle path</td><td>false path：功能上永遠不會發生的路徑，不檢查；multicycle：允許花好幾個週期的路徑。都在 SDC 裡宣告</td></tr>\n        <tr><td>動態功耗</td><td><code>P = α · C · V² · f</code>：α 切換率、C 負載電容、V 電壓、f 頻率。另有短路功耗（切換瞬間上下管同時導通）</td></tr>\n        <tr><td>靜態功耗（漏電）</td><td>電晶體關著也有的電流：次臨界漏電、閘極漏電、接面漏電。溫度越高、製程越先進、Vt 越低，漏電越大</td></tr>\n        <tr><td>Clock gating</td><td>模組閒置時把它的時脈關掉，讓 α 歸零。標準作法是 ICG cell（latch＋AND），避免關的瞬間產生毛刺</td></tr>\n        <tr><td>Power gating／Multi-Vt／DVFS</td><td>Power gating：整塊斷電省漏電；Multi-Vt：關鍵路徑用低 Vt（快但漏）、其他用高 Vt（慢但省）；DVFS：負載輕時同時降頻降壓</td></tr>\n        <tr><td>IR drop</td><td>電源網電阻上的壓降。Static：用平均電流算；Dynamic：大量元件同時切換時的瞬間電壓塌陷，現在先進設計以 dynamic 為主要風險</td></tr>\n        <tr><td>Electromigration（EM）</td><td>大電流密度長期推動金屬原子移動，造成空洞（斷線）或小丘（短路）。壽命用 Black 方程式估：<code>MTTF = A · J<sup>−n</sup> · exp(Ea／kT)</code>，n 常取 2</td></tr>\n        <tr><td>熱效應</td><td>功耗變成熱，接面溫度 Tj 上升 → 漏電上升 → 更熱；EM 壽命對溫度呈指數敏感。先進製程還有 FinFET 自熱（self-heating）</td></tr>\n      </tbody></table></div>",
          "anchor": "c03-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼 hold 違規降頻也救不了？</b>hold 比的是「同一個時脈邊緣」下，新資料會不會太快到；式子裡根本沒有週期 T。所以 hold 違規的晶片在任何頻率都會錯，只能在設計時修（拉長短路徑：插 buffer／delay cell）。setup 違規則可以靠降頻「勉強能用」。可以到主圖二把 T 拉大試試。</li>\n        <li><b>skew 是好是壞？</b>接收端時脈晚到（正 skew）等於多給資料時間，對 setup 有利、對 hold 不利；反之亦然。CTS 的目標是把 skew 壓小，進階作法（useful skew）則刻意調整 skew 去借時間給緊的路徑。</li>\n        <li><b>為什麼降電壓最省電？</b>動態功耗跟 V² 成正比，電壓降 10% 動態功耗約降 19%；但電壓低元件變慢，所以要配合降頻，這就是 DVFS。</li>\n        <li><b>為什麼 clock gating 效果大？</b>時脈網路每個週期都在切換（α＝1），而且掛滿了 FF 和 buffer，常是動態功耗的大宗。關掉閒置模組的時脈，那一整片的時脈切換和 FF 內部功耗都省掉。</li>\n        <li><b>IR drop 為什麼會變成時序問題？</b>元件延遲隨供電電壓下降而變大。如果 STA 只用標稱電壓算，壓降大的區域實際比報告慢，晶片就在某些圖樣下偶發錯。所以 sign-off 要做 IR-aware 的時序分析，或在電壓 corner 裡預留壓降。</li>\n        <li><b>EM 為什麼電源線比訊號線危險？</b>EM 主要怕單向直流電流；電源線電流永遠同一方向，訊號線的電流來回（AC）有部分自我修復。所以電源網、大電流輸出級（例如 source driver 輸出 buffer 的電源）要加寬線、多打 via。</li>\n        <li><b>為什麼熱會惡性循環？</b>漏電隨溫度上升而增加，漏電又產生更多熱；散熱不足時可能失控（thermal runaway）。COF 上的驅動 IC 散熱路徑有限，功耗與溫升是要一起算的規格。</li>\n      </ul>",
          "anchor": "c03-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>STA 報 setup 違規</td><td>關鍵路徑邏輯太深、線太長、元件驅動力不夠</td><td>upsizing、換低 Vt cell、重新擺放縮短線、插 pipeline 暫存器、改架構；最後手段是降頻</td></tr>\n        <tr><td>實測只在低電壓（加高溫或低溫）時功能錯，提高電壓或降頻就好</td><td>落在慢角落，關鍵路徑 setup 不夠（電壓低元件變慢）；不是 hold，因為 hold 違規降頻也不會好</td><td>確認 STA 有簽到該電壓／溫度角落（含溫度反轉）；修關鍵路徑或提高規格最低電壓；量測時掃電壓與頻率畫 shmoo 圖找邊界</td></tr>\n        <tr><td>STA 報 hold 違規（快角落）</td><td>路徑太短，或 skew 太大</td><td>在短路徑插 delay buffer；修 hold 時要同時看慢角落 setup，不要修過頭</td></tr>\n        <tr><td>晶片在特定圖樣或高負載時偶發錯，降頻就好</td><td>dynamic IR drop 讓局部電壓塌陷、元件變慢</td><td>跑向量驅動的 dynamic IR 分析；加 decap、加強電源網、錯開大量同時切換（例如 clock gating 分時開啟）</td></tr>\n        <tr><td>EM 檢查報電源線電流密度超標</td><td>線太窄、via 太少，電流集中</td><td>加寬線或加層、via 打雙顆以上（redundant via）、把大電流負載分散到多條電源路徑</td></tr>\n        <tr><td>待機功耗比預估高很多，而且越熱越高</td><td>漏電主導：用了太多低 Vt cell、沒做 power gating</td><td>非關鍵路徑換高 Vt、閒置區塊 power gating；量測要在高溫角落驗證</td></tr>\n        <tr><td>驅動 IC 在高溫或大畫面切換時異常</td><td>總功耗（多通道 buffer 靜態電流＋充放電）讓 Tj 過高</td><td>估算最壞畫面（如高頻交替圖樣）的功耗與溫升；降低 buffer 偏壓電流、改善散熱（COF 散熱片）</td></tr>\n      </tbody></table></div>",
          "anchor": "c03-l3"
        }
      ]
    },
    {
      "id": "C04",
      "anchor": "c04",
      "tag": "C04",
      "name": "DFT 與可測試性",
      "sub": "scan、BIST、ATPG",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>出廠時不可能把晶片所有功能都跑一遍，所以設計時就先<b>埋好測試用的後門</b>：把所有 FF 串成一條移位暫存器（scan chain），讓測試機可以直接灌入狀態、讀出結果；記憶體則內建自我測試（BIST）。</p>"
        },
        {
          "t": "widget",
          "id": "C.c04",
          "html": "<figure>\n      <div class=\"table-wrap\">\n      <svg class=\"fig\" viewBox=\"0 0 900 175\" role=\"img\" aria-label=\"Scan chain 結構\" style=\"min-width:640px\">\n        <text x=\"0\" y=\"16\" class=\"t-strong\">Scan FF：在一般 FF 前加一顆 MUX</text>\n        <g id=\"scanG\"></g>\n        <text x=\"0\" y=\"168\" class=\"t-small\">SE＝1：所有 FF 串成移位暫存器（shift，灌入／讀出）；SE＝0：正常功能，打一個時脈抓下組合邏輯的結果（capture）。</text>\n      </svg>\n      </div>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>Scan chain</td><td>把設計裡的 FF 換成 scan FF 並串起來。測試流程：shift 灌入 → capture 一拍 → shift 讀出（同時灌下一組）</td></tr>\n        <tr><td>ATPG</td><td>Automatic Test Pattern Generation：工具依故障模型自動算出測試向量。有了 full scan，只要解組合邏輯問題</td></tr>\n        <tr><td>Stuck-at fault</td><td>假設某條線永遠卡在 0 或 1。最基本的故障模型，抓開路、短路到電源這類缺陷</td></tr>\n        <tr><td>Transition fault／at-speed</td><td>假設某個節點翻轉太慢，要用接近實際頻率的兩個時脈（launch、capture）測，抓延遲類缺陷。stuck-at 100% 不代表品質夠</td></tr>\n        <tr><td>Bridging fault</td><td>兩條相鄰訊號線短在一起</td></tr>\n        <tr><td>Fault coverage／Test coverage</td><td>Fault coverage：抓到的故障 ÷ 全部故障；Test coverage：分母扣掉「結構上不可能測」的故障，所以數字通常比較高。看報告要先確認是哪一個</td></tr>\n        <tr><td>BIST</td><td>Built-In Self-Test：晶片自己產生測試圖樣、自己比對。MBIST 測記憶體（March 演算法依序讀寫各位址）；LBIST 測邏輯（LFSR 產生虛擬隨機圖樣、MISR 壓縮結果成 signature）</td></tr>\n        <tr><td>Scan compression</td><td>晶片內放解壓縮／壓縮邏輯，少數腳位驅動大量短 chain，縮短測試時間與測試機記憶體</td></tr>\n        <tr><td>Boundary scan（JTAG）</td><td>IEEE 1149.1：在每支 I/O 旁放 scan cell，用 TCK／TMS／TDI／TDO 測板上焊接與晶片間連線</td></tr>\n        <tr><td>IDDQ</td><td>量靜態電源電流，CMOS 正常時幾乎沒有，異常偏大代表有短路類缺陷</td></tr>\n        <tr><td>DPPM</td><td>每百萬顆出貨中的不良數。coverage 越高、逃脫（test escape）越少，DPPM 越低</td></tr>\n      </tbody></table></div>",
          "anchor": "c04-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼一定要 scan？</b>沒有 scan，想把內部某個 FF 設成特定值，可能要從外面跑好幾千個週期；想看結果也要等它傳到腳位。scan 讓每個 FF 都「可控、可觀察」，ATPG 就只要解組合邏輯，向量數和運算時間都大幅下降。</li>\n        <li><b>為什麼 stuck-at 夠高還要 at-speed？</b>先進製程的缺陷很多是「變慢」而不是「卡死」（電阻性 via、細線），慢速 stuck-at 測試抓不到。transition 測試在實際頻率下 launch→capture，才看得到延遲。</li>\n        <li><b>記憶體為什麼用 BIST 不用 scan？</b>記憶體是密集陣列，不是 FF，不能串 scan；它的故障（相鄰格互相干擾、位址解碼錯）有專門的演算法。內建 MBIST 控制器跑 March 演算法，測試機只要下指令、讀 pass／fail，必要時還能配合備用行列做修補（repair）。</li>\n        <li><b>scan 測試為什麼比正常工作更耗電？</b>shift 時所有 FF 一起移位，切換率遠高於正常功能（正常時很多模組被 clock gating 關掉），容易造成 IR drop 和過熱，把好片測成壞片。</li>\n        <li><b>DFT 有什麼代價？</b>scan FF 多了 MUX（面積、延遲），多了測試腳位與測試模式邏輯；clock gating、非同步 reset 都要能在測試模式被控制。DFT 規則要從 RTL 階段就照著寫，後補很痛。</li>\n      </ul>",
          "anchor": "c04-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>ATPG coverage 卡在偏低</td><td>有不可控的時脈或 reset（內部產生的時脈、非同步 reset）、黑盒子（類比 IP、memory 沒模型）、X 源</td><td>跑 DFT rule check（DRC for test）找出違規；加 test point、測試模式下旁路內部時脈與 reset、給黑盒子加 wrapper</td></tr>\n        <tr><td>Scan shift 在測試機上失敗，降低 shift 頻率就過</td><td>shift 時全晶片同時切換造成 IR drop，或 scan 路徑本身有 hold 問題</td><td>降低 shift 頻率、分段（分群）shift、ATPG 用 low-power fill 降低切換率</td></tr>\n        <tr><td>跨時脈域的 scan chain 移位錯一位</td><td>兩個時脈域之間 skew 大，造成 hold 違規</td><td>chain 跨域處插 lockup latch；或依時脈域分開串 chain</td></tr>\n        <tr><td>at-speed 測試把一堆好片判壞（overkill）</td><td>capture 時大量切換造成 IR drop，測試條件比實際應用嚴苛；或測到功能上不會走的 false path</td><td>限制 capture 切換率、在 ATPG 套用與 STA 一致的 false path／multicycle 例外</td></tr>\n        <tr><td>客退品出廠測試全過</td><td>test escape：故障模型沒涵蓋（延遲、bridging）、類比區塊沒測到</td><td>補 transition／bridging 圖樣、加類比 BIST 或參數測試，用客退品做 failure analysis 回饋測試程式</td></tr>\n      </tbody></table></div>",
          "anchor": "c04-l3"
        }
      ]
    },
    {
      "id": "C05",
      "anchor": "c05",
      "tag": "C05",
      "name": "IP 與 PDK",
      "sub": "元件庫與規則",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>晶圓廠給 <b>PDK</b>（這個製程的模型、規則與工具設定），標準元件庫給<b>積木</b>（AND、FF 的時序、功耗與佈局），IP 廠給<b>大積木</b>（CPU、介面 PHY、記憶體）；設計公司在這些上面蓋自己的晶片，並付授權費。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>PDK</td><td>Process Design Kit：SPICE 元件模型、PCell（參數化佈局）、技術檔（層定義）、DRC／LVS／萃取規則檔（rule deck）、設計規則手冊</td></tr>\n        <tr><td>Design rule</td><td>晶圓廠的幾何規則：最小線寬、間距、包覆（enclosure）、via 規則、金屬密度、antenna 比例。寫在 DRM（Design Rule Manual），工具版是 DRC deck</td></tr>\n        <tr><td>標準元件庫</td><td>預先設計好、同高度可拼接的邏輯閘。每顆有多種驅動力（X1、X2、X4）與多種 Vt 版本</td></tr>\n        <tr><td>Liberty（.lib）</td><td>元件庫的時序與功耗表（依輸入轉換時間與負載查表），每個 PVT corner 一份</td></tr>\n        <tr><td>LEF</td><td>元件或巨集的抽象佈局：外框、腳位位置、擋線區，給 P&amp;R 工具用（不含內部細節）</td></tr>\n        <tr><td>Soft IP／Hard IP</td><td>Soft：RTL 原始碼，可合成到任何製程、可改；Hard：已做好的 GDS 佈局，綁特定製程，時序面積可預期但不能改。類比與 PHY 幾乎都是 hard IP</td></tr>\n        <tr><td>IP 授權模式</td><td>常見是一次性授權費（license fee）＋每顆出貨的權利金（royalty）。大型 IP 廠如 Arm、Synopsys、Cadence</td></tr>\n        <tr><td>Silicon-proven</td><td>這顆 IP 已在該製程實際下線量測過。沒有的話等於拿自己的晶片當它的測試片</td></tr>\n        <tr><td>MPW（shuttle）</td><td>多個客戶共用一套光罩做小量試產，攤平光罩費，常用來驗證新 IP 或新電路</td></tr>\n        <tr><td>開源 PDK</td><td>例：Google 與 SkyWater 的 SKY130（130 nm，Apache 2.0 授權），讓學界與個人也能做晶片</td></tr>\n      </tbody></table></div>",
          "anchor": "c05-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼設計公司離不開 PDK？</b>晶圓廠製程參數是機密，設計端只能透過 PDK 的模型與規則「間接」知道電晶體多快、線能多細。PDK 版本一更新，模型或規則改了，模擬與簽核結果就要重跑。</li>\n        <li><b>為什麼標準元件都同高度？</b>同高才能像磚塊一樣排成一列列（row），上下共用電源軌（VDD／VSS rail），自動擺放工具才能大量處理。</li>\n        <li><b>買 soft IP 還是 hard IP？</b>soft IP 彈性大、可換製程，但時序要自己收斂、驗證責任在自己；hard IP 已經在那個製程收斂好，但換製程就要重買或重做。高速 PHY、類比、記憶體幾乎只能用 hard IP。</li>\n        <li><b>為什麼 IP 授權費常是「授權金＋權利金」？</b>授權金回收 IP 開發成本，權利金讓 IP 廠分享出貨量。對量大、單價低的產品（如顯示驅動 IC），權利金對毛利影響大，談判時要算清楚。</li>\n        <li><b>為什麼同一份設計換晶圓廠不容易？</b>元件庫、hard IP、design rule、PDK 模型都綁晶圓廠，換廠等於後端重做、類比電路重新設計與驗證。</li>\n      </ul>",
          "anchor": "c05-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>專案中途晶圓廠發布新版 PDK／DRC deck</td><td>模型或規則修正</td><td>評估差異（release note）；專案開始時鎖定版本，tape-out 前用最新 deck 再跑一次簽核，確認新規則沒有新違規</td></tr>\n        <tr><td>外購 IP 整合後 DRC／LVS 報錯</td><td>IP 用的 PDK 版本或金屬層數跟你的設計不同，或交付的抽象檔（LEF）與實際 GDS 不一致</td><td>要求 IP 廠提供與你相同 PDK 版本、金屬堆疊的交付檔與簽核報告</td></tr>\n        <tr><td>選了一顆便宜 IP，但它在這個製程沒量產紀錄</td><td>不是 silicon-proven</td><td>要求量測報告；先上 MPW 驗證，或改選已驗證的 IP</td></tr>\n        <tr><td>低電壓、低溫時晶片比預期慢</td><td>先進製程的溫度反轉（temperature inversion）：低電壓下冷反而慢，只簽了「高溫＝最慢」角落</td><td>sign-off 角落補上低溫慢角落；確認元件庫有提供對應 corner 的 .lib</td></tr>\n        <tr><td>antenna DRC 違規很多</td><td>長金屬線直接接閘極</td><td>讓 P&amp;R 工具自動插入保護二極體，或跳到上層金屬（jumper）分段</td></tr>\n      </tbody></table></div>",
          "anchor": "c05-l3"
        }
      ]
    }
  ],
  "back": [
    {
      "id": "confuse",
      "title": "容易混淆",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>這兩個</th><th>差在哪</th></tr>\n      <tr><td>DRC vs LVS</td><td>做得出來嗎（幾何規則）vs 做的是你要的電路嗎（佈局與 netlist 比對）（C01）</td></tr>\n      <tr><td>LVS vs LEC</td><td>佈局 vs netlist（實體對邏輯）；netlist vs netlist／RTL（邏輯對邏輯）（C01）</td></tr>\n      <tr><td>Setup vs Hold</td><td>資料太慢（看最長路徑、可降頻救）vs 資料太快（看最短路徑、降頻救不了）（C03）</td></tr>\n      <tr><td>Skew vs Jitter</td><td>同一個邊緣到不同 FF 的差（空間）vs 同一個 FF 每週期邊緣的抖動（時間）（C03）</td></tr>\n      <tr><td>Static vs Dynamic IR drop</td><td>平均電流造成的穩態壓降 vs 大量同時切換的瞬間塌陷（C03）</td></tr>\n      <tr><td>Clock gating vs Power gating</td><td>關時脈、省動態功耗、狀態保留 vs 斷電源、省漏電、狀態不見要另外保存（C03）</td></tr>\n      <tr><td>INL vs DNL</td><td>整條曲線離直線多遠 vs 相鄰兩階間距跟 1 LSB 差多少；DNL 一路累加約等於 INL（C02）</td></tr>\n      <tr><td>解析度 vs 精度</td><td>切幾階（bit 數）vs 每一階準不準（INL、offset、gain error）。12 bit 的 ADC 不一定有 12 bit 的精度（看 ENOB）（C02）</td></tr>\n      <tr><td>PSRR vs Line regulation</td><td>輸入上交流漣波被擋多少（看頻率）vs 輸入直流電壓變化時輸出變多少（C02）</td></tr>\n      <tr><td>Fault coverage vs Test coverage</td><td>分母是全部故障 vs 分母扣掉不可測故障（C04）</td></tr>\n      <tr><td>MBIST vs LBIST</td><td>測記憶體（March 演算法）vs 測邏輯（LFSR＋MISR）（C04）</td></tr>\n      <tr><td>Soft IP vs Hard IP</td><td>RTL、可改可換製程 vs GDS、綁製程不能改（C05）</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "terms",
      "title": "英文術語",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>英文</th><th>中文</th><th>常見用法</th></tr>\n      <tr><td>Synthesis</td><td>邏輯合成</td><td>Synthesis maps the RTL onto the standard cell library.</td></tr>\n      <tr><td>Place and route</td><td>擺放與繞線</td><td>Congestion blocked place and route at 80% utilization.</td></tr>\n      <tr><td>Parasitic extraction</td><td>寄生萃取</td><td>Rerun parasitic extraction after metal fill.</td></tr>\n      <tr><td>Sign-off</td><td>簽核</td><td>All corners must pass timing sign-off before tape-out.</td></tr>\n      <tr><td>Tape-out</td><td>下線</td><td>We taped out the GDS to the foundry last week.</td></tr>\n      <tr><td>Slack</td><td>時序餘裕</td><td>The worst setup slack is −35 ps.</td></tr>\n      <tr><td>Clock skew</td><td>時脈偏移</td><td>Useful skew borrows time from the next stage.</td></tr>\n      <tr><td>Phase margin</td><td>相位裕度</td><td>The buffer has only 30° phase margin with the panel load.</td></tr>\n      <tr><td>Offset voltage</td><td>偏移電壓</td><td>Channel-to-channel offset causes vertical lines.</td></tr>\n      <tr><td>Missing code</td><td>遺失碼</td><td>The ADC is guaranteed to have no missing codes.</td></tr>\n      <tr><td>Dropout voltage</td><td>壓差</td><td>The LDO has 200 mV dropout at full load.</td></tr>\n      <tr><td>Electromigration</td><td>電遷移</td><td>Widen the power strap to fix the EM violation.</td></tr>\n      <tr><td>Clock gating</td><td>時脈閘控</td><td>Clock gating cut dynamic power in idle mode.</td></tr>\n      <tr><td>Scan chain</td><td>掃描鏈</td><td>Insert lockup latches between clock domains in the scan chain.</td></tr>\n      <tr><td>Test coverage</td><td>測試涵蓋率</td><td>Stuck-at test coverage is above target.</td></tr>\n      <tr><td>Silicon-proven</td><td>已矽驗證</td><td>Is this PHY silicon-proven in this node?</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "sources",
      "title": "出處",
      "blocks": [
        {
          "t": "html",
          "html": "<ol class=\"sources\">\n      <li><b>C01</b>　https://en.wikipedia.org/wiki/Layout_Versus_Schematic ；https://en.wikipedia.org/wiki/Static_timing_analysis ；https://en.wikipedia.org/wiki/Process_design_kit</li>\n      <li><b>C02</b>　https://en.wikipedia.org/wiki/Differential_nonlinearity ；https://www.analog.com/en/resources/technical-articles/inldnl-measurements-for-types-of-highspeed-adcs.html ；https://en.wikipedia.org/wiki/Nyquist%E2%80%93Shannon_sampling_theorem ；https://en.wikipedia.org/wiki/Low-dropout_regulator ；https://en.wikipedia.org/wiki/Bandgap_voltage_reference ；https://en.wikipedia.org/wiki/Frequency_compensation ；TI 應用筆記《ESR Stability and the LDO Regulator》《LDO Regulator Stability Using Ceramic Output Capacitors》（僅見搜尋摘要）</li>\n      <li><b>C03</b>　https://en.wikipedia.org/wiki/Clock_skew ；https://covail.cs.umbc.edu/robucci/applets/timing_violations/ ；https://www.cs.washington.edu/education/courses/cse467/11wi/lectures/RegisterTiming.pdf ；https://en.wikipedia.org/wiki/Processor_power_dissipation ；https://en.wikipedia.org/wiki/Clock_gating ；https://en.wikipedia.org/wiki/Electromigration ；https://semiengineering.com/knowledge_centers/low-power/ir-drop/</li>\n      <li><b>C04</b>　https://en.wikipedia.org/wiki/Scan_chain ；https://en.wikipedia.org/wiki/Automatic_test_pattern_generation ；https://en.wikipedia.org/wiki/Built-in_self-test</li>\n      <li><b>C05</b>　https://en.wikipedia.org/wiki/Process_design_kit ；https://en.wikipedia.org/wiki/Semiconductor_intellectual_property_core ；https://github.com/google/skywater-pdk</li>\n      <li class=\"muted\">查證日 2026-10-02。未找到一手出處、故不寫死數字的：IR drop 容許預算（%VDD）、coverage 目標值、顯示驅動 IC 的 gamma DAC bit 數與 buffer offset 規格、temperature inversion 的發生節點、lockup latch 與 low-power fill 的工具細節（依業界常識撰寫）。</li>\n    </ol>"
        }
      ]
    }
  ],
  "css": ".kb-C .sliders { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 8px 20px; margin: 0 0 12px; }\n.kb-C .sliders label.inline { justify-content: space-between; white-space: nowrap; }\n.kb-C .sliders input[type=\"range\"] { flex: 1; min-width: 90px; }\n.kb-C .sliders output { font-family: var(--mono); font-size: 13px; color: var(--fg); min-width: 52px; text-align: right; }\n.kb-C .slack { font-family: var(--mono); font-size: 13px; }\n.kb-C .slack b { font-family: var(--sans); }\n"
}
