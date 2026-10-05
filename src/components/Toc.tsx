import { useEffect, useState } from 'react'

/** 頁內段落導覽:黏在頂端,捲到哪一段就亮哪一個 */
export function Toc({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0].id)
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e)
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActive(vis[0].target.id)
      },
      { rootMargin: '-60px 0px -60% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [sections])
  return (
    <div className="toc" role="navigation" aria-label="本頁段落">
      {sections.map((s) => (
        <button
          key={s.id}
          className={active === s.id ? 'on' : ''}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
