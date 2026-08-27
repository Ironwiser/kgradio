import { useEffect, useMemo, useState } from "react"
import { ExternalLink, Play } from "lucide-react"
import { SoundCloudSurface, useSoundCloud, type SoundCloudItem } from "@/context/soundcloud-context"

type Artist = { id:number; profile_url:string; name:string; artwork_url?:string|null; description?:string|null; items:SoundCloudItem[] }
type Catalog = { profile:{ lowradio_profile_url?:string; lowradio_profile_name?:string; lowradio_artwork_url?:string }|null; lowradio:SoundCloudItem[]; artists:Artist[] }

export function Listeler() {
  const [catalog, setCatalog] = useState<Catalog|null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const player = useSoundCloud()
  useEffect(() => { fetch("/api/soundcloud/catalog").then(async r => { if(!r.ok) throw new Error("SoundCloud kataloğu yüklenemedi."); return r.json() }).then(setCatalog).catch(e => setError(e.message)).finally(() => setLoading(false)) }, [])
  const total = useMemo(() => (catalog?.lowradio.length||0)+(catalog?.artists.reduce((n,a)=>n+a.items.length,0)||0), [catalog])

  return <section className="editorial-page soundcloud-editorial-page"><div className="soundcloud-editorial-shell">
    <header className="soundcloud-editorial-top">
      <div className="editorial-page-index"><span /> SELECTED / 02</div>
      <div><h1>Çalma Listeleri</h1></div>
      <span>{String(total).padStart(2,"0")} KAYIT</span>
    </header>

    <main className="soundcloud-editorial-main">
      {loading?<p className="soundcloud-editorial-state">Yükleniyor…</p>:error?<p className="soundcloud-editorial-state soundcloud-error">{error}</p>:<div className="soundcloud-editorial-columns">
        <section className="soundcloud-editorial-list soundcloud-editorial-own">
          <header><h2>LOWRadio</h2>{catalog?.profile?.lowradio_profile_url&&<a href={catalog.profile.lowradio_profile_url} target="_blank" rel="noreferrer">SOUNDCLOUD <ExternalLink/></a>}</header>
          {!catalog?.lowradio.length?<p className="soundcloud-list-empty">Henüz kayıt eklenmedi.</p>:<ol>{catalog.lowradio.map((item,index)=><li key={item.id} className={player.current?.id===item.id?"soundcloud-track-active":""}><button type="button" onClick={()=>player.play(item)}><span>{String(index+1).padStart(2,"0")}</span>{item.artworkUrl?<img src={item.artworkUrl} alt=""/>:<i className="soundcloud-row-art">LR</i>}<div><strong>{item.title}</strong><small>{item.authorName||"LOWRadio"}</small></div><Play/></button>{player.current?.id===item.id&&<SoundCloudSurface className="soundcloud-inline-player"/>}</li>)}</ol>}
        </section>

        <section className="soundcloud-editorial-list soundcloud-editorial-picks">
          <header><h2>Seçtiklerimiz</h2><span>{String(catalog?.artists.reduce((n,a)=>n+a.items.length,0)||0).padStart(2,"0")} KAYIT</span></header>
          {!catalog?.artists.some(artist=>artist.items.length)?<p className="soundcloud-list-empty">Henüz öneri eklenmedi.</p>:<ol>{catalog?.artists.flatMap(artist=>artist.items.map(item=>({item,artist}))).map(({item,artist},index)=><li key={item.id} className={player.current?.id===item.id?"soundcloud-track-active":""}><button type="button" onClick={()=>player.play(item)}><span>{String(index+1).padStart(2,"0")}</span>{(item.artworkUrl||artist.artwork_url)?<img src={item.artworkUrl||artist.artwork_url||""} alt=""/>:<i className="soundcloud-row-art">SC</i>}<div><strong>{item.title}</strong><small>{item.authorName||artist.name}</small></div><Play/></button>{player.current?.id===item.id&&<SoundCloudSurface className="soundcloud-inline-player"/>}</li>)}</ol>}
        </section>
      </div>}
    </main>
  </div></section>
}
