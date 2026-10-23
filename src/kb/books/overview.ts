// 原 SemiDrill 講義(git 歷史裡的 public/semi/ 原檔)搬進百科的資料;內容是原講義的 HTML 片段,改這裡就是改講義。
import type { Book } from '../types'

export const book: Book = {
  "id": "overview",
  "file": "overview.html",
  "title": "一顆晶片的一生：元件 → 前段 → 後段",
  "lead": "晶片是先想好「電晶體要長什麼樣」（元件），再在晶圓上一層一層把它做出來（前段製程），最後切開、封起來、測過才出貨（後段）。",
  "note": "<p class=\"muted small\">三章各對應 <code>data/taxonomy.md</code> 的 A／B／D 大類。每段內容都標了難度：<span class=\"lv\">L1</span>是什麼　<span class=\"lv l2\">L2</span>為什麼　<span class=\"lv l3\">L3</span>出問題怎麼辦。</p>",
  "front": [
    {
      "id": "",
      "title": "主軸",
      "blocks": [
        {
          "t": "html",
          "html": "<figure>\n      <svg class=\"fig\" viewBox=\"0 0 920 150\" role=\"img\" aria-label=\"元件、前段、後段三階段的流程\">\n        <defs>\n          <marker id=\"ah\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker>\n        </defs>\n        <rect class=\"bx\" x=\"10\" y=\"20\" width=\"260\" height=\"110\" rx=\"6\"></rect>\n        <text x=\"28\" y=\"48\" class=\"t-muted\">A　元件與物理</text>\n        <text x=\"28\" y=\"76\" class=\"t-strong\">設計圖：電晶體長怎樣</text>\n        <text x=\"28\" y=\"100\" class=\"t-muted\">半導體物理、PN、MOSFET</text>\n        <text x=\"28\" y=\"118\" class=\"t-muted\">微縮、FinFET／GAA</text>\n\n        <rect class=\"bx-accent\" x=\"330\" y=\"20\" width=\"260\" height=\"110\" rx=\"6\"></rect>\n        <text x=\"348\" y=\"48\" class=\"t-accent\">B　前段製程（晶圓廠）</text>\n        <text x=\"348\" y=\"76\" class=\"t-strong\">在晶圓上把它做出來</text>\n        <text x=\"348\" y=\"100\" class=\"t-muted\">沉積 → 微影 → 蝕刻 → 佈植</text>\n        <text x=\"348\" y=\"118\" class=\"t-muted\">→ CMP，重複幾十輪</text>\n\n        <rect class=\"bx\" x=\"650\" y=\"20\" width=\"260\" height=\"110\" rx=\"6\"></rect>\n        <text x=\"668\" y=\"48\" class=\"t-muted\">D　封裝與測試（後段）</text>\n        <text x=\"668\" y=\"76\" class=\"t-strong\">切開、封起來、測過</text>\n        <text x=\"668\" y=\"100\" class=\"t-muted\">CP → 切割 → 封裝 → FT</text>\n        <text x=\"668\" y=\"118\" class=\"t-muted\">可靠度與失效分析</text>\n\n        <line class=\"ln\" x1=\"272\" y1=\"75\" x2=\"326\" y2=\"75\" marker-end=\"url(#ah)\"></line>\n        <line class=\"ln\" x1=\"592\" y1=\"75\" x2=\"646\" y2=\"75\" marker-end=\"url(#ah)\"></line>\n      </svg>\n      <figcaption>A 決定「要做出什麼」，B 決定「怎麼做出來」，D 決定「怎麼交到客戶手上」。</figcaption>\n    </figure>"
        }
      ]
    },
    {
      "id": "",
      "title": "三章",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"chain\">\n      <div class=\"node ready\">\n        <span class=\"tag\">A</span><span class=\"state\">可閱讀</span>\n        <h3><a href=\"A-device.html\">元件與物理</a></h3>\n        <p class=\"small muted\">以一顆做好的 MOSFET 剖面為中心，點部位講物理。</p>\n        <ol>\n          <li><a href=\"A-device.html#a01\">A01 半導體基礎物理</a></li>\n          <li><a href=\"A-device.html#a02\">A02 PN 接面與二極體</a></li>\n          <li><a href=\"A-device.html#a03\">A03 MOSFET 結構與特性</a></li>\n          <li><a href=\"A-device.html#a04\">A04 微縮與製程變異</a></li>\n          <li><a href=\"A-device.html#a05\">A05 先進元件結構</a></li>\n        </ol>\n      </div>\n      <div class=\"node ready\">\n        <span class=\"tag\">B</span><span class=\"state\">可閱讀</span>\n        <h3><a href=\"B-process.html\">前段製程</a></h3>\n        <p class=\"small muted\">一步一步看晶圓剖面怎麼變，再分站查重點。</p>\n        <ol>\n          <li><a href=\"B-process.html#b01\">B01 晶圓製備與製程分段</a></li>\n          <li><a href=\"B-process.html#b02\">B02 微影</a></li>\n          <li><a href=\"B-process.html#b03\">B03 蝕刻</a></li>\n          <li><a href=\"B-process.html#b04\">B04 薄膜沉積</a></li>\n          <li><a href=\"B-process.html#b05\">B05 摻雜與熱製程</a></li>\n          <li><a href=\"B-process.html#b06\">B06 CMP 與金屬互連</a></li>\n        </ol>\n      </div>\n      <div class=\"node ready\">\n        <span class=\"tag\">D</span><span class=\"state\">可閱讀</span>\n        <h3><a href=\"D-package.html\">封裝與測試</a></h3>\n        <p class=\"small muted\">從晶圓測試到出貨，10 步逐步看。</p>\n        <ol>\n          <li><a href=\"D-package.html#d01\">D01 封裝型態</a></li>\n          <li><a href=\"D-package.html#d02\">D02 接合技術</a></li>\n          <li><a href=\"D-package.html#d03\">D03 先進封裝</a></li>\n          <li><a href=\"D-package.html#d04\">D04 測試與良率</a></li>\n          <li><a href=\"D-package.html#d05\">D05 可靠度與失效分析</a></li>\n        </ol>\n      </div>\n    </div>"
        }
      ]
    },
    {
      "id": "",
      "title": "三章怎麼接起來",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\">\n    <table>\n      <tbody><tr><th>A 講的東西</th><th>在 B 哪一步做出來</th><th>到 D 會怎樣被檢查</th></tr>\n      <tr><td><a href=\"A-device.html#a03\">通道、臨界電壓 Vt</a></td><td><a href=\"B-process.html#b05\">B05</a> 離子佈植調摻雜濃度</td><td><a href=\"D-package.html#d04\">D04</a> CP 量 Vt、漏電，超出規格就 bin 掉</td></tr>\n      <tr><td><a href=\"A-device.html#a04\">閘極長度（通道長度）</a></td><td><a href=\"B-process.html#b02\">B02</a> 微影決定線寬、<a href=\"B-process.html#b03\">B03</a> 蝕刻把它刻出來</td><td><a href=\"D-package.html#d04\">D04</a> 速度分 bin；線寬變異讓同一片晶圓的速度不一</td></tr>\n      <tr><td><a href=\"A-device.html#a04\">閘極氧化層</a></td><td><a href=\"B-process.html#b04\">B04</a> 沉積（先進製程用 ALD 長 high-k）</td><td><a href=\"D-package.html#d05\">D05</a> TDDB 測氧化層多久會崩潰</td></tr>\n      <tr><td><a href=\"A-device.html#a02\">源極／汲極（PN 接面）</a></td><td><a href=\"B-process.html#b05\">B05</a> 佈植＋退火</td><td><a href=\"D-package.html#d05\">D05</a> 漏電、latch-up</td></tr>\n      <tr><td>金屬導線</td><td><a href=\"B-process.html#b06\">B06</a> 銅 damascene＋CMP</td><td><a href=\"D-package.html#d05\">D05</a> 電遷移（EM）壽命</td></tr>\n      <tr><td>PMOS／NMOS 的老化</td><td>—</td><td><a href=\"D-package.html#d05\">D05</a> NBTI（PMOS）、HCI（NMOS）讓 Vt 隨時間漂移</td></tr>\n    </tbody></table>\n    </div>"
        }
      ]
    }
  ],
  "entries": [],
  "back": []
}
