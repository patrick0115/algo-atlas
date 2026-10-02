// 把單檔建置結果改成好認的檔名,放在專案根目錄
import { copyFileSync, statSync } from 'node:fs'
const out = 'LeetCode演算法圖鑑.html'
copyFileSync('dist-offline/index.html', out)
console.log(`離線檔:${out}(${(statSync(out).size / 1024).toFixed(0)} KB)`)
