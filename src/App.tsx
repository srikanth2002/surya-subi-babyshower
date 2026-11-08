import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowRight, CalendarDays, Camera, Check, ChevronRight, Clock3, Copy, Flower2, Gift, Heart, Leaf, MapPin, Menu, MessageCircleHeart, Music2, Navigation, Pause, PartyPopper, Play, Send, Share2, Sparkles, X } from 'lucide-react'

type Language = 'en' | 'ta'
type SaveState = { kind: 'idle' | 'loading' | 'success' | 'demo' | 'error'; message: string }
type RSVP = { name: string; attending: 'yes' | 'no'; guests: number; createdAt: string }
type Wish = { name: string; message: string; createdAt: string }
type PublicWish = Wish & { row: number }
type PublicWishPage = { ok: boolean; wishes: PublicWish[]; nextCursor: number | null }
type Report = { rsvps: RSVP[]; wishes: Wish[] }

const date = new Date('2026-12-13T10:00:00+05:30')
const invitePath = '/surya-subi-babyshower'
const mapUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Lions Hall, Near Sai Baba Temple, Gokul Nagar, Hosur 635109') + '&travelmode=driving'
const ready: SaveState = { kind: 'idle', message: '' }
const srinumaNumber = (import.meta.env.VITE_SRINUMA_WHATSAPP_NUMBER || '').replace(/\D/g, '')
const srinumaMessage = encodeURIComponent('Hi SRINUMA Digital Solutions! I saw the Surya & Subi baby shower digital invitation. I would like to enquire about a digital invitation.')
const srinumaWhatsAppUrl = srinumaNumber ? `https://wa.me/${srinumaNumber}?text=${srinumaMessage}` : `https://api.whatsapp.com/send?text=${srinumaMessage}`

const content = {
  en: {
    invitation: 'Invitation', details: 'The Celebration', rsvp: 'RSVP', wishes: 'Wishes',
    introKicker: 'A little miracle is on the way', introTitle: 'A Shower of Love', introSub: "Join us as we celebrate Subi's beautiful journey into motherhood.", open: 'Open Envelope',
    withLove: 'With immense love & blessings', occasion: 'Baby Shower', of: 'of', subtitle: 'A new chapter. A tiny heartbeat. A whole lot of love.',
    scroll: 'Scroll to discover', specialDay: 'A DATE TO CHERISH', together: 'Together, we celebrate', specialDaySub: "We can't wait to welcome our little bundle of joy — and we'd love for you to be there.",
    date: 'Sunday, 13 December 2026', time: '10:00 AM onwards', venue: 'Lions Hall', address: 'Near Sai Baba Temple, Gokul Nagar, Hosur – 635109',
    directions: 'Get Directions', countdown: 'Counting down to the celebration', days: 'Days', hours: 'Hours', mins: 'Mins', secs: 'Secs', begun: 'A day filled with blessings and beautiful memories!',
    attendanceEyebrow: 'YOUR PRESENCE MEANS THE WORLD', attendanceTitle: 'Will you join us?', attendanceSub: 'A little yes from you means a lot to us.',
    yourName: 'Your name', placeholderName: 'Enter your name', attending: 'Can you make it?', yes: "Joyfully accepting", no: 'Sending love from afar', guestCount: 'Number of guests (including you)', submitRSVP: 'Send RSVP',
    wishEyebrow: 'A NOTE FROM THE HEART', wishTitle: 'Leave a blessing', wishSub: 'A few heartfelt words for the mommy-to-be and the little one.',
    wishLabel: 'Your wishes', wishPlaceholder: 'Write your blessings here…', sendWish: 'Send wishes',
    wishPublicNotice: 'Your name and wish will be visible to everyone who opens this invitation.',
    closing: "Let's shower the mom-to-be with love, laughter and blessings.", closingSub: 'Your presence will make our day even more special.',
    share: 'Share invite', copy: 'Copy link', copied: 'Link copied!', footer: 'Made with love', demo: 'Preview mode: saved on this device only. Connect the database for live RSVPs and wishes.',
    navInvite: 'Invite', navVenue: 'Venue', navRSVP: 'RSVP', navWishes: 'Wishes', reportTitle: 'Guest responses', reportCaption: 'Private read-only report', noReports: 'No responses yet.', home: 'View invitation', reportError: 'This report link is invalid or not configured.',
  },
  ta: {
    invitation: 'அழைப்பிதழ்', details: 'விழா விவரங்கள்', rsvp: 'வருகை பதிவு', wishes: 'வாழ்த்துகள்',
    introKicker: 'ஒரு குட்டி மகிழ்ச்சி வரவிருக்கிறது', introTitle: 'அன்பின் கொண்டாட்டம்', introSub: 'சுபியின் தாய்மை பயணத்தை அன்புடன் கொண்டாட உங்களை அழைக்கிறோம்.', open: 'உறையைத் திறக்க',
    withLove: 'அன்பும் ஆசீர்வாதங்களும் நிறைந்து', occasion: 'வளைகாப்பு விழா', of: '', subtitle: 'புதிய அத்தியாயம். குட்டி இதயத் துடிப்பு. எல்லையில்லா அன்பு.',
    scroll: 'கீழே பாருங்கள்', specialDay: 'மறக்க முடியாத நாள்', together: 'ஒன்றாகக் கொண்டாடுவோம்', specialDaySub: 'எங்கள் குட்டி மகிழ்ச்சியை வரவேற்கும் விழாவில் நீங்கள் கலந்து கொள்ள வேண்டும்.',
    date: 'ஞாயிற்றுக்கிழமை, 13 டிசம்பர் 2026', time: 'காலை 10 மணி முதல்', venue: 'லயன்ஸ் ஹால்', address: 'சாய் பாபா கோவில் அருகில், கோகுல் நகர், ஓசூர் – 635109',
    directions: 'செல்லும் வழி', countdown: 'விழாவிற்கான கவுண்ட்டவுன்', days: 'நாட்கள்', hours: 'மணி', mins: 'நிமிடம்', secs: 'வினாடி', begun: 'அன்பும் ஆசிகளும் நிறைந்த இனிய நாள்!',
    attendanceEyebrow: 'உங்கள் வருகை எங்களுக்கு மகிழ்ச்சி', attendanceTitle: 'நீங்கள் வருகிறீர்களா?', attendanceSub: 'உங்கள் பதிலை அன்புடன் எதிர்பார்க்கிறோம்.',
    yourName: 'உங்கள் பெயர்', placeholderName: 'பெயரை உள்ளிடுங்கள்', attending: 'கலந்து கொள்ள முடியுமா?', yes: 'நிச்சயம் வருகிறேன்', no: 'தொலைவிலிருந்தே வாழ்த்துகிறேன்', guestCount: 'உங்களையும் சேர்த்து வருபவர்கள்', submitRSVP: 'வருகையைப் பதிவு செய்க',
    wishEyebrow: 'மனமார்ந்த வாழ்த்துகள்', wishTitle: 'ஆசீர்வாதம் வழங்குங்கள்', wishSub: 'வரவிருக்கும் குட்டிக்கும் அம்மாவுக்கும் உங்கள் வாழ்த்துகளை எழுதுங்கள்.',
    wishLabel: 'உங்கள் வாழ்த்துகள்', wishPlaceholder: 'உங்கள் அன்பான வாழ்த்துகள்…', sendWish: 'வாழ்த்துகளை அனுப்புக',
    wishPublicNotice: 'உங்கள் பெயரும் வாழ்த்தும் இந்த அழைப்பிதழைத் திறக்கும் அனைவருக்கும் தெரியும்.',
    closing: 'அன்பாலும் மகிழ்ச்சியாலும் அம்மாவை வாழ்த்துவோம்.', closingSub: 'உங்கள் வருகை இந்நாளை மேலும் சிறப்பாக்கும்.',
    share: 'பகிருங்கள்', copy: 'இணைப்பை நகலெடு', copied: 'இணைப்பு நகலெடுக்கப்பட்டது!', footer: 'அன்புடன் உருவாக்கியது', demo: 'டெமோ: இந்தச் சாதனத்தில் மட்டும் சேமிக்கப்படும். நேரடி பதிவுகளுக்கு database இணைக்கவும்.',
    navInvite: 'அழைப்பு', navVenue: 'இடம்', navRSVP: 'வருகை', navWishes: 'வாழ்த்து', reportTitle: 'வருகை மற்றும் வாழ்த்துகள்', reportCaption: 'பார்க்க மட்டும் அனுமதி உள்ள அறிக்கை', noReports: 'இன்னும் பதிவுகள் இல்லை.', home: 'அழைப்பிதழைப் பார்க்க', reportError: 'இந்த அறிக்கை இணைப்பு செல்லுபடியாகவில்லை.',
  },
} as const


const extras = {
  en: {
    schedule: 'Event Schedule', scheduleEyebrow: 'A DAY OF SWEET MOMENTS',
    scheduleDesc: 'Only 10:00 AM is confirmed. Other programme times will be shared by the host.',
    scheduleItems: [
      { time: '10:00 AM', title: 'Celebration begins', desc: 'We look forward to welcoming you' },
      { time: 'Time TBC', title: 'Blessings & ceremony', desc: 'Suggested programme · to be confirmed' },
      { time: 'Time TBC', title: 'Family moments', desc: 'Suggested photo time · to be confirmed' },
      { time: 'Time TBC', title: 'Refreshments', desc: 'Details to be confirmed by the host' },
    ],
    dressTitle: 'Dress Code', dressLead: 'Pastel & festive inspiration', dressText: 'Blush, peach, sage or lavender — just a colour palette suggestion, not a required dress code.',
    noteTitle: 'A Little Note', noteText: 'Your presence will make this special day even brighter. Come with your love, smiles and blessings!',
    navEvent: 'Event',
    dressCaption: 'OPTIONAL COLOUR INSPIRATION', rsvpHint: 'Kindly RSVP to let us know if you can join us.',
  },
  ta: {
    schedule: 'நிகழ்ச்சி அட்டவணை', scheduleEyebrow: 'இனிய தருணங்கள்',
    scheduleDesc: 'காலை 10:00 மணி மட்டுமே உறுதி செய்யப்பட்டுள்ளது. மற்ற நிகழ்ச்சி நேரங்கள் பின்னர் அறிவிக்கப்படும்.',
    scheduleItems: [
      { time: 'காலை 10:00', title: 'விழா தொடக்கம்', desc: 'உங்கள் வருகையை அன்புடன் வரவேற்கிறோம்' },
      { time: 'நேரம் உறுதியாகவில்லை', title: 'ஆசீர்வாதம் மற்றும் விழா', desc: 'மாதிரி நிகழ்ச்சி · உறுதி செய்யப்பட வேண்டும்' },
      { time: 'நேரம் உறுதியாகவில்லை', title: 'குடும்பப் புகைப்படங்கள்', desc: 'மாதிரி நேரம் · உறுதி செய்யப்பட வேண்டும்' },
      { time: 'நேரம் உறுதியாகவில்லை', title: 'சிற்றுண்டி', desc: 'விவரங்களை நிகழ்ச்சி ஏற்பாட்டாளரிடம் உறுதி செய்யவும்' },
    ],
    dressTitle: 'ஆடை நிறங்கள்', dressLead: 'மென்மையான விழா நிறங்கள்', dressText: 'இளஞ்சிவப்பு, பீச், சேஜ், லாவெண்டர் — இது நிறப் பரிந்துரை மட்டுமே; கட்டாய ஆடை விதி இல்லை.',
    noteTitle: 'அன்பான குறிப்பு', noteText: 'உங்கள் வருகையும் ஆசிகளும் இந்நாளை மேலும் இனிமையாக்கும். மகிழ்ச்சியுடன் வாருங்கள்!',
    navEvent: 'விழா',
    dressCaption: 'விருப்பமான நிறப் பரிந்துரை', rsvpHint: 'தயவுசெய்து உங்கள் வருகையைப் பதிவு செய்யுங்கள்.',
  }
} as const

function timeLeft() {
  const remaining = Math.max(0, date.getTime() - Date.now())
  return { days: Math.floor(remaining / 86400000), hours: Math.floor((remaining / 3600000) % 24), mins: Math.floor((remaining / 60000) % 60), secs: Math.floor((remaining / 1000) % 60), passed: remaining === 0 }
}

function Lotus({ small = false }: { small?: boolean }) {
  return <svg className={small ? 'lotus lotus-small' : 'lotus'} viewBox="0 0 270 150" role="img" aria-label="Decorative lotus flower">
    <g fill="none" stroke="currentColor" strokeWidth="2" opacity=".8">
      <path d="M135 119C113 80 116 45 135 17c19 28 22 63 0 102Z" fill="#e5b48d" />
      <path d="M133 121C91 101 76 66 79 39c33 15 53 40 54 82Z" fill="#dc968e" />
      <path d="M137 121c42-20 57-55 54-82-33 15-53 40-54 82Z" fill="#dc968e" />
      <path d="M130 124C91 121 61 104 51 75c40 1 68 17 79 49Z" fill="#f0c6ac" />
      <path d="M140 124c39-3 69-20 79-49-40 1-68 17-79 49Z" fill="#f0c6ac" />
      <path d="M136 131C92 145 51 132 19 108c45-17 88-9 117 23Z" fill="#c78478" />
      <path d="M134 131c44 14 85 1 117-23-45-17-88-9-117 23Z" fill="#c78478" />
      <path d="M21 139c72 13 156 13 228 0" stroke="#d7b475" strokeWidth="3" />
    </g>
  </svg>
}

function Ornament({ label }: { label?: string }) {
  return <div className="ornament" aria-hidden="true"><span className="orn-line"/><Leaf size={15}/>{label && <span>{label}</span>}<Leaf className="flip" size={15}/><span className="orn-line"/></div>
}

async function sendForm(endpoint: 'rsvp' | 'wishes', data: object): Promise<SaveState> {
  try {
    const response = await fetch(`/api/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (!response.headers.get('content-type')?.includes('application/json')) {
      return { kind: 'error', message: 'The form service is unavailable. Your response has not been saved.' }
    }
    const body = await response.json() as { error?: string; ok?: boolean }
    if (!response.ok || !body.ok) {
      return { kind: 'error', message: body.error || 'Unable to save. Please try again later.' }
    }
    return { kind: 'success', message: endpoint === 'rsvp' ? 'Thank you! Your RSVP was saved. 💚' : 'Your wishes were saved. 💚' }
  } catch {
    return { kind: 'error', message: 'Connection unavailable. Your response was not saved. Please retry.' }
  }
}


/**
 * Public Wishes Wall. Fetches only guest name, wish text and submitted date.
 * RSVP responses and Sheet submission IDs are NEVER returned publicly.
 * Data is sourced from Google Sheets via the server-only /api/public-wishes gateway.
 */
function WishesWall({ lang, active, refreshKey }: { lang: Language; active: boolean; refreshKey: number }) {
  const [wishes, setWishes] = useState<PublicWish[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [paginationStarted, setPaginationStarted] = useState(false)
  const [refreshRequest, setRefreshRequest] = useState(0)
  const text = lang === 'ta' ? {
    eyebrow: 'அன்புடன் பகிர்ந்த வாழ்த்துகள்', title: 'வாழ்த்துகளின் சுவர்',
    subtitle: 'முன்பு பகிரப்பட்ட ஆசீர்வாதங்களை அனைவரும் இங்கே காணலாம்.',
    empty: 'முதல் வாழ்த்தை நீங்களே பகிருங்கள்! 💚',
    loading: 'வாழ்த்துகளை ஏற்றுகிறது…', error: 'வாழ்த்துகளை இப்போது காட்ட முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    older: 'பழைய வாழ்த்துகளையும் பார்க்க', retry: 'மீண்டும் முயற்சிக்க',
    refresh: 'புதுப்பிக்க', more: 'இன்னும் ஏற்றுகிறது…'
  } : {
    eyebrow: 'HEARTFELT BLESSINGS', title: 'Wishes from Loved Ones',
    subtitle: 'Every blessing stays here for friends and family to read.',
    empty: 'Be the first to leave a beautiful wish! 💚',
    loading: 'Loading blessings…', error: 'Wishes are temporarily unavailable. Please try again.',
    older: 'Load earlier wishes', retry: 'Try again',
    refresh: 'Refresh', more: 'Loading more…'
  }

  useEffect(() => {
    if (!active) return
    let canceled = false
    const load = async () => {
      try {
        const response = await fetch('/api/public-wishes?limit=40', { cache: 'no-store' })
        if (!response.ok) throw new Error('Wishes unavailable')
        const data = await response.json() as PublicWishPage
        if (!data.ok || !Array.isArray(data.wishes)) throw new Error('Invalid response')
        if (canceled) return
        setWishes((previous) => {
          const freshIds = new Set(data.wishes.map((item) => item.row))
          return [...data.wishes, ...previous.filter((item) => !freshIds.has(item.row))]
        })
        if (!paginationStarted) setNextCursor(data.nextCursor)
        setPhase('ready')
      } catch {
        if (!canceled) setPhase((existing) => existing === 'ready' ? 'ready' : 'error')
      }
    }
    void load()
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load()
    }, 45000)
    return () => { canceled = true; window.clearInterval(interval) }
  }, [active, refreshKey, refreshRequest, paginationStarted])

  const loadOlder = async () => {
    if (nextCursor === null || loadingOlder) return
    setPaginationStarted(true)
    setLoadingOlder(true)
    try {
      const response = await fetch(`/api/public-wishes?limit=40&cursor=${nextCursor}`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Could not load earlier wishes')
      const data = await response.json() as PublicWishPage
      if (!data.ok || !Array.isArray(data.wishes)) throw new Error('Invalid response')
      setWishes((previous) => {
        const existing = new Set(previous.map((w) => w.row))
        return [...previous, ...data.wishes.filter((w) => !existing.has(w.row))]
      })
      setNextCursor(data.nextCursor)
    } catch {
      // Retain already-loaded wishes; the visitor can try the button again.
    } finally {
      setLoadingOlder(false)
    }
  }
  const latest = wishes.slice(0, 8)
  return <section className="wishes-wall" aria-label={text.title}>
    <div className="wishes-wall-container">
      <div className="wishes-wall-heading">
        <span className="section-kicker">{text.eyebrow}</span>
        <h2><Heart size={29} aria-hidden="true"/> {text.title}</h2>
        <p>{text.subtitle}</p>
      </div>
      {phase === 'loading' ? <p className="wishes-wall-info" role="status">{text.loading}</p> :
        phase === 'error' ? <div className="wishes-wall-info" role="status"><p>{text.error}</p><button type="button" onClick={() => setRefreshRequest((x) => x + 1)}>{text.retry}</button></div> :
        wishes.length === 0 ? <p className="wishes-wall-info">{text.empty}</p> : <>
          <div className="wishes-marquee-viewport" aria-label="Recently shared wishes">
            <div className={`wishes-marquee-track ${latest.length > 1 ? 'is-animated' : ''}`}>
              {(latest.length > 1 ? [0, 1] : [0]).map((copy) => <div className="wishes-marquee-group" aria-hidden={copy === 1} key={copy}>
                {latest.map((w) => <div className="wishes-marquee-card" key={`${copy}-${w.row}`}>
                  <span aria-hidden="true" className="wishes-marquee-heart">♡</span>
                  <p>{w.message}</p><strong>— {w.name}</strong>
                </div>)}
              </div>)}
            </div>
          </div>
          <div className="wishes-wall-archive" aria-label="Previous wishes">
            {wishes.map((w) => <article className="wishes-archive-card" key={w.row}>
              <span className="wishes-avatar" aria-hidden="true">♡</span>
              <div><strong>{w.name}</strong><p>{w.message}</p><small>{w.createdAt.slice(0, 10)}</small></div>
            </article>)}
          </div>
          {nextCursor !== null && <button type="button" className="wishes-more-btn" onClick={() => void loadOlder()} disabled={loadingOlder}>{loadingOlder ? text.more : text.older}</button>}
        </>}
      <button type="button" className="wishes-refresh-btn" onClick={() => setRefreshRequest((x) => x + 1)}>{text.refresh}</button>
    </div>
  </section>
}

function ReportView({ share, lang, setLang }: { share: string; lang: Language; setLang: (lang: Language) => void }) {
  const [result, setResult] = useState<Report | null>(null)
  const [error, setError] = useState(false)
  const t = content[lang]
  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/report?share=${encodeURIComponent(share)}`, { signal: controller.signal })
      .then((res) => { if (!res.ok) throw Error('Unauthorized'); return res.json() as Promise<Report> })
      .then(setResult)
      .catch((err: unknown) => { if (!(err instanceof DOMException && err.name === 'AbortError')) setError(true) })
    return () => controller.abort()
  }, [share])
  const yes = result?.rsvps.filter((r) => r.attending === 'yes') || []
  return <div className="report-page"><div className="report-card">
    <Lotus small/><div className="report-top"><span>SUBI'S BABY SHOWER</span><button onClick={() => setLang(lang === 'en' ? 'ta' : 'en')} className="lang-switch">{lang === 'en' ? 'தமிழ்' : 'EN'}</button></div>
    <h1>{t.reportTitle}</h1><p>{t.reportCaption}</p><a href={invitePath} className="link-button">{t.home} <ArrowRight size={17}/></a>
    {error ? <p className="notice error">{t.reportError}</p> : !result ? <p className="notice">Loading…</p> : <>
      <div className="stats"><div><strong>{result.rsvps.length}</strong><span>RSVPs</span></div><div><strong>{yes.length}</strong><span>Attending</span></div><div><strong>{yes.reduce((sum, r) => sum + r.guests, 0)}</strong><span>Total guests</span></div><div><strong>{result.wishes.length}</strong><span>Wishes</span></div></div>
      <h2>RSVP responses</h2>{result.rsvps.length ? result.rsvps.map((r, i) => <div className="report-row" key={i}><strong>{r.name}</strong><span>{r.attending === 'yes' ? `Attending · ${r.guests} guest(s)` : 'Cannot attend'}</span></div>) : <p className="notice">{t.noReports}</p>}
      <h2>Wishes</h2>{result.wishes.length ? result.wishes.map((w, i) => <div className="report-row" key={i}><strong>{w.name}</strong><p>{w.message}</p></div>) : <p className="notice">{t.noReports}</p>}
    </>}
  </div></div>
}

export default function App() {
  const [lang, setLang] = useState<Language>('en')
  const [opened, setOpened] = useState(false)
  const [opening, setOpening] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicError, setMusicError] = useState(false)
  const [timer, setTimer] = useState(timeLeft)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [rsvp, setRSVP] = useState({ name: '', attending: 'yes' as 'yes' | 'no', guests: '1', honeypot: '' })
  const [wish, setWish] = useState({ name: '', message: '', honeypot: '' })
  const [rsvpState, setRSVPState] = useState<SaveState>(ready)
  const [wishState, setWishState] = useState<SaveState>(ready)
  const [wishRefreshKey, setWishRefreshKey] = useState(0)
  const t = content[lang]
  const x = extras[lang]
  const shareToken = new URLSearchParams(window.location.search).get('report')

  useEffect(() => { const interval = window.setInterval(() => setTimer(timeLeft()), 1000); return () => window.clearInterval(interval) }, [])

  if (shareToken) return <ReportView share={shareToken} lang={lang} setLang={setLang}/>

  const startMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.75
    void audio.play().then(() => setMusicError(false)).catch(() => setMusicError(true))
  }
  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) startMusic()
    else audio.pause()
  }
  const openInvite = () => {
    if (opening) return
    // This runs inside the tap/click gesture, to permit audio playback on mobile.
    startMusic()
    setOpening(true)
    window.setTimeout(() => { setOpened(true); setOpening(false) }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 2650)
  }
  const navigate = (id: string) => { setMenuOpen(false); if (!opened) { setOpened(true) }; window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0) }
  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.origin + invitePath); setCopySuccess(true); window.setTimeout(() => setCopySuccess(false), 2500) }
    catch { window.prompt('Copy invitation link', window.location.origin + invitePath) }
  }
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: "Subi's Baby Shower", text: 'Join us on 13 December 2026, 10 AM at Lions Hall, Hosur.', url: window.location.origin + invitePath }) } catch { /* canceled */ } }
    else await copy()
  }
  const submitRSVP = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (rsvpState.kind === 'loading') return
    setRSVPState({ kind: 'loading', message: '' })
    const response = await sendForm('rsvp', { ...rsvp, guests: rsvp.attending === 'yes' ? Number(rsvp.guests) : 0 })
    setRSVPState(response)
    if (response.kind === 'success' || response.kind === 'demo') setRSVP({ name: '', attending: 'yes', guests: '1', honeypot: '' })
  }
  const submitWish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (wishState.kind === 'loading') return
    setWishState({ kind: 'loading', message: '' })
    const response = await sendForm('wishes', wish)
    setWishState(response)
    if (response.kind === 'success' || response.kind === 'demo') {
      setWish({ name: '', message: '', honeypot: '' })
      setWishRefreshKey((v) => v + 1)
    }
  }

  return <div className={`site ${lang === 'ta' ? 'tamil' : ''}`}>
    <audio ref={audioRef} src="/music/surya-subi-babyshower-song.mp3" preload="metadata" loop onPlay={() => setMusicPlaying(true)} onPause={() => setMusicPlaying(false)} aria-label="Baby shower background song"/>
    <button className={`music-control ${musicPlaying ? 'is-playing' : ''}`} onClick={toggleMusic} aria-label={musicPlaying ? 'Pause background music' : 'Play background music'} aria-pressed={musicPlaying} title={musicError ? 'Tap to play the song' : musicPlaying ? 'Pause music' : 'Play song'}>
      <span className="music-control-icon">{musicPlaying ? <Pause size={17} fill="currentColor"/> : <Play size={17} fill="currentColor"/>}</span>
      <span className="music-control-label">{musicPlaying ? (lang === 'en' ? 'Pause song' : 'பாடல் நிறுத்து') : (lang === 'en' ? 'Play song' : 'பாடலை இயக்கு')}</span>
      <Music2 size={15} className="music-spark"/>
    </button>
    {!opened && <div className={`royal-reveal-screen ${opening ? 'is-opening' : ''}`}>
      <div className="royal-opening-layout">
        <span className="royal-opening-eyebrow"><Flower2 size={14}/> A LITTLE MIRACLE IS ON THE WAY <Flower2 size={14}/></span>
        <h1 className="royal-opening-title">Surya <span>&</span> Subi</h1>
        <p className="royal-opening-sub">A baby shower invitation made with love</p>
        <div className="royal-scene" aria-label="Ivory embossed invitation doors with satin ribbon bow, opening to reveal Subi's baby shower" aria-busy={opening}>
          <div className="royal-invitation-card" aria-hidden="true">
            <div className="royal-card-border">
              <span className="royal-card-ornament">✿ &nbsp; ♡ &nbsp; ✿</span>
              <span className="royal-card-small">WITH LOVE & BLESSINGS</span>
              <span className="royal-card-heading">Baby Shower</span>
              <span className="royal-card-of">of</span>
              <strong className="royal-card-name">Subi ♡</strong>
              <span className="royal-card-line"/>
              <span className="royal-card-date">SUNDAY · 13 DECEMBER 2026</span>
              <span className="royal-card-time">10:00 AM</span>
              <span className="royal-card-place">LIONS HALL · HOSUR</span>
              <span className="royal-card-ornament bottom">✧ &nbsp; ✿ &nbsp; ✧</span>
            </div>
          </div>
          <div className="royal-door royal-door-left" aria-hidden="true"><span className="royal-emboss royal-emboss-top"/><span className="royal-emboss royal-emboss-bottom"/><span className="royal-edge-line"/></div>
          <div className="royal-door royal-door-right" aria-hidden="true"><span className="royal-emboss royal-emboss-top"/><span className="royal-emboss royal-emboss-bottom"/><span className="royal-edge-line"/></div>
          <div className="royal-satin-ribbon" aria-hidden="true"><div className="royal-ribbon-band"/>
            <svg className="royal-bow" viewBox="0 0 300 154" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <linearGradient id="bowSilk" x1="0" x2=".9" y1="0" y2="1"><stop offset="0" stopColor="#fffefb"/><stop offset=".35" stopColor="#eee8df"/><stop offset=".58" stopColor="#fff"/><stop offset=".82" stopColor="#ded3c8"/><stop offset="1" stopColor="#f8f3ec"/></linearGradient>
                <linearGradient id="bowShine" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#fff"/><stop offset="1" stopColor="#cfc2b6"/></linearGradient>
              </defs>
              <path d="M144 75 Q82 8 19 38 Q-3 66 20 89 Q81 122 144 82Z" fill="url(#bowSilk)" stroke="#d0c4b6" strokeWidth="2"/>
              <path d="M154 75 Q208 9 283 33 Q303 69 280 91 Q219 124 155 83Z" fill="url(#bowSilk)" stroke="#d0c4b6" strokeWidth="2"/>
              <path d="M143 76 Q105 119 73 148 L136 118 Q149 103 155 82Z" fill="url(#bowShine)" stroke="#d2c5b9" strokeWidth="2"/>
              <path d="M157 81 Q193 115 239 147 L207 108 Q181 79 163 74Z" fill="url(#bowSilk)" stroke="#d2c5b9" strokeWidth="2"/>
              <path d="M41 52 Q86 51 135 76 M258 50 Q216 51 164 75" stroke="#ffffff" strokeOpacity=".9" strokeWidth="5" fill="none"/>
              <path d="M133 65 Q150 57 168 66 L171 91 Q149 100 133 90Z" fill="url(#bowShine)" stroke="#d5c6b4" strokeWidth="2"/>
              <path d="M138 70 Q150 67 163 71" stroke="#ffffff" strokeWidth="4" fill="none"/>
            </svg>
          </div>
          {!opening && <button type="button" className="royal-tap-zone" onClick={openInvite} aria-label="Open Surya and Subi's baby shower invitation"/>}
        </div>
        <button type="button" className="royal-open-cta" onClick={openInvite} disabled={opening}>
          {opening ? 'Opening your invitation…' : 'Touch to open invitation'} <ChevronRight size={19}/>
        </button>
        <div className="royal-opening-under">♡ &nbsp; Handcrafted with love &nbsp; ♡</div>
      </div>
    </div>}
    <div className="page-wrap" aria-hidden={!opened}>
      <header className="site-header"><div className="logo-mark" onClick={() => navigate('home')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('home')}><span>✺</span><span>SUBI <small>13.12.26</small></span></div><div className="header-actions"><nav className="desktop-nav"><button onClick={() => navigate('home')}>{t.invitation}</button><button onClick={() => navigate('schedule')}>{x.navEvent}</button><button onClick={() => navigate('details')}>{lang === 'en' ? 'Venue' : 'இடம்'}</button><button onClick={() => navigate('rsvp')}>{t.rsvp}</button><button onClick={() => navigate('wishes')}>{t.wishes}</button></nav><button className="lang-switch" onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}>{lang === 'en' ? 'தமிழ்' : 'English'}</button><button className="menu-btn" onClick={() => setMenuOpen((open) => !open)} aria-label="Menu">{menuOpen ? <X/> : <Menu/>}</button></div></header>
      {menuOpen && <div className="mobile-drop"><button onClick={() => navigate('home')}>{t.invitation}</button><button onClick={() => navigate('schedule')}>{x.navEvent}</button><button onClick={() => navigate('details')}>{lang === 'en' ? 'Venue' : 'இடம்'}</button><button onClick={() => navigate('rsvp')}>{t.rsvp}</button><button onClick={() => navigate('wishes')}>{t.wishes}</button></div>}
      <main>
        <section id="home" className="hero"><div className="hero-glow"/><div className="hero-top-ornament"><span>✧</span><span>✦</span><span>✧</span></div><div className="hero-grid">
          <div className="hero-copy"><div className="hero-eyebrow"><span className="eyebrow-rule"/>{t.withLove}<span className="eyebrow-rule"/></div><span className="hero-small">{t.occasion}</span><h1 className="hero-name">{lang === 'en' && <span className="of">{t.of}</span>}<em>Subi</em><span className="hero-heart">♡</span></h1><Ornament/><p className="hero-subtitle">{t.subtitle}</p><div className="hero-date"><span>13</span><div><strong>DECEMBER</strong><small>2026 • SUNDAY</small></div><b></b><div><strong>10:00</strong><small>AM · HOSUR</small></div></div><div className="hero-actions"><button className="primary-cta" onClick={() => navigate('details')}>{t.details} <ArrowDown size={17}/></button></div></div>
          <div className="hero-visual"><div className="visual-arch"><div className="visual-inner"><div className="visual-stars">✷ &nbsp; ✦ &nbsp; ✷</div><img src="/images/surya-subi-photo-fit-v19.webp" alt="Surya and Subi smiling together" loading="eager" decoding="async" className="couple-art"/></div></div><span className="visual-caption">A little love is blooming</span><div className="floral-art floral-top" aria-hidden="true">✿</div><div className="floral-art floral-bottom" aria-hidden="true">✿</div><div className="visual-seal"><Heart size={16} fill="currentColor"/><span>BLISS<br/>BEGINS</span></div></div>
        </div><div className="hero-bottom"><span>✦</span><span>{t.scroll}</span><span>✦</span></div></section>
        <section id="details" className="details-section"><div className="section-heading"><span className="section-kicker">{t.specialDay}</span><h2>{t.together}</h2><Ornament/><p>{t.specialDaySub}</p></div>
          <div className="details-grid"><div className="details-tile"><div className="detail-icon"><CalendarDays size={29}/></div><span className="detail-label">THE DAY</span><h3>{t.date}</h3><p>{lang === 'en' ? 'A day of love & laughter' : 'அன்பும் மகிழ்ச்சியும் நிறைந்த நாள்'}</p></div><div className="details-tile"><div className="detail-icon"><Clock3 size={29}/></div><span className="detail-label">THE TIME</span><h3>{t.time}</h3><p>{lang === 'en' ? 'Let the celebrations begin' : 'மகிழ்ச்சியுடன் தொடங்குவோம்'}</p></div><div className="details-tile venue-tile"><div className="detail-icon"><MapPin size={29}/></div><span className="detail-label">THE VENUE</span><h3>{t.venue}</h3><p>{t.address}</p><a href={mapUrl} target="_blank" rel="noopener noreferrer" className="directions-btn directions-venue"><Navigation size={18}/>{t.directions}<ArrowRight size={16}/></a></div></div>
          <div className="countdown-panel"><div className="countdown-content"><Sparkles size={23}/><span>{t.countdown}</span><div className="count-items">{timer.passed ? <p className="count-passed">{t.begun}</p> : <>{([{value:timer.days,label:t.days},{value:timer.hours,label:t.hours},{value:timer.mins,label:t.mins},{value:timer.secs,label:t.secs}]).map((item) => <div className="count-item" key={item.label}><strong>{String(item.value).padStart(2,'0')}</strong><small>{item.label}</small></div>)}</>}</div></div><span className="countdown-illustration">✺</span></div>
        </section>
        <section id="schedule" className="schedule-section">
          <div className="section-heading"><span className="section-kicker">{x.scheduleEyebrow}</span><h2>{x.schedule}</h2><Ornament/><p>{x.scheduleDesc}</p></div>
          <div className="schedule-paper"><div className="schedule-flower">✿</div>
            <div className="schedule-timeline">{x.scheduleItems.map((item, i) => <div className="schedule-stop" key={i}>
              <span className="schedule-icon">{i === 0 ? <Gift size={21}/> : i === 1 ? <Flower2 size={21}/> : i === 2 ? <Camera size={21}/> : <Heart size={21}/>}</span>
              <div className="schedule-copy"><span className="schedule-time">{item.time}</span><h3>{item.title}</h3><p>{item.desc}</p></div>
            </div>)}</div>
            <div className="dress-and-note"><div className="extra-note dress-card"><h3>{x.dressTitle}</h3><strong>{x.dressLead}</strong><div className="palette-dots" aria-label={x.dressCaption}><i className="pink"/><i className="peach"/><i className="sage"/><i className="lavender"/></div><p>{x.dressText}</p><small>{x.dressCaption}</small></div><div className="extra-note note-card"><h3>{x.noteTitle} ♡</h3><p>{x.noteText}</p><span className="note-sprig">✿ ── ✿</span></div></div>
          </div>
        </section>
        <div className="forms-wrap">
          <section id="rsvp" className="form-section rsvp-section"><div className="form-heading"><span className="section-kicker">{t.attendanceEyebrow}</span><h2>{t.attendanceTitle}</h2><p>{t.attendanceSub}</p><span className="rsvp-hint">{x.rsvpHint}</span></div><form onSubmit={submitRSVP} className="event-form"><label>{t.yourName}<input autoComplete="name" minLength={2} maxLength={70} required value={rsvp.name} placeholder={t.placeholderName} onChange={(e) => setRSVP({ ...rsvp, name: e.target.value })}/></label><span className="field-label">{t.attending}</span><div className="choice-row"><label className={`choice ${rsvp.attending==='yes'?'selected':''}`}><input type="radio" name="attending" checked={rsvp.attending === 'yes'} onChange={() => setRSVP({ ...rsvp, attending: 'yes' })}/><Check size={17}/>{t.yes}</label><label className={`choice ${rsvp.attending==='no'?'selected':''}`}><input type="radio" name="attending" checked={rsvp.attending === 'no'} onChange={() => setRSVP({ ...rsvp, attending: 'no' })}/><Heart size={17}/>{t.no}</label></div>{rsvp.attending === 'yes' && <label>{t.guestCount}<select value={rsvp.guests} onChange={(e) => setRSVP({ ...rsvp, guests: e.target.value })}>{Array.from({length:10},(_,i) => <option value={i+1} key={i+1}>{i+1}</option>)}</select></label>}<div className="honeypot"><label>Leave blank<input tabIndex={-1} autoComplete="off" value={rsvp.honeypot} onChange={(e) => setRSVP({ ...rsvp, honeypot: e.target.value })}/></label></div><button type="submit" className="form-submit" disabled={rsvpState.kind==='loading'}>{rsvpState.kind==='loading'?'Sending…':t.submitRSVP}<Send size={16}/></button>{rsvpState.kind!=='idle' && <p role="status" className={`form-status ${rsvpState.kind}`}>{rsvpState.message}</p>}</form></section>
          <section id="wishes" className="form-section wishes-section"><div className="form-heading"><span className="section-kicker">{t.wishEyebrow}</span><h2>{t.wishTitle}</h2><p>{t.wishSub}</p></div><form onSubmit={submitWish} className="event-form"><label>{t.yourName}<input autoComplete="name" minLength={2} maxLength={70} required value={wish.name} placeholder={t.placeholderName} onChange={(e) => setWish({ ...wish, name: e.target.value })}/></label><label>{t.wishLabel}<textarea maxLength={600} minLength={3} required rows={4} placeholder={t.wishPlaceholder} value={wish.message} onChange={(e) => setWish({ ...wish, message: e.target.value })}/></label><div className="honeypot"><label>Leave blank<input tabIndex={-1} autoComplete="off" value={wish.honeypot} onChange={(e) => setWish({ ...wish, honeypot: e.target.value })}/></label></div><p className="wishes-public-notice">{t.wishPublicNotice}</p><button type="submit" className="form-submit" disabled={wishState.kind==='loading'}>{wishState.kind==='loading'?'Sending…':t.sendWish}<MessageCircleHeart size={17}/></button>{wishState.kind!=='idle' && <p role="status" className={`form-status ${wishState.kind}`}>{wishState.message}</p>}</form></section>
        </div>
        <WishesWall lang={lang} active={opened} refreshKey={wishRefreshKey}/>
        <section className="closing-section"><Lotus/><h2>With love, blessings<br/>& a little magic…</h2><p>{t.closingSub}</p><div className="closing-actions"><button className="share-btn" onClick={share}><Share2 size={17}/>{t.share}</button><button className="share-btn outline" onClick={copy}>{copySuccess?<Check size={17}/>:<Copy size={17}/>} {copySuccess?t.copied:t.copy}</button></div><div className="closing-info"><span><CalendarDays size={15}/>13 DEC 2026</span><span>Surya ♡ Subi</span></div></section>
      </main>
      <footer className="footer srinuma-footer">
        <div className="srinuma-credit-card">
          <span className="srinuma-made-with-love">{t.footer} <span aria-hidden="true">♡</span></span>
          <img className="srinuma-brand-logo" src="/images/srinuma-sm-icon-transparent.png" alt="SRINUMA original blue SM icon with transparent background" loading="lazy" />
          <div className="srinuma-wordmark" aria-label="SRINUMA Digital Solutions">
            <strong className="srinuma-wordmark-title">SRINUMA</strong>
            <span className="srinuma-wordmark-subtitle">DIGITAL SOLUTIONS</span>
          </div>
          <a className="srinuma-brand-chat" href={srinumaWhatsAppUrl} target="_blank" rel="noopener noreferrer" aria-label="Contact SRINUMA Digital Solutions on WhatsApp" title={srinumaNumber ? 'Chat with SRINUMA on WhatsApp' : 'Opens WhatsApp composer — official business number not yet configured'}>
            <MessageCircleHeart size={19}/><span>{lang === 'en' ? 'Chat on WhatsApp' : 'WhatsApp-ல் தொடர்பு கொள்ள'}</span><ArrowRight size={16}/>
          </a>
          {!srinumaNumber && <span className="srinuma-chat-note">Business number not linked yet · WhatsApp share opens</span>}
        </div>
        <div className="srinuma-footer-event">Celebrating Subi · 13 December 2026</div>
      </footer>
      <nav className="bottom-nav" aria-label="Invitation navigation"><button onClick={() => navigate('home')}><Gift size={19}/><small>{t.navInvite}</small></button><button onClick={() => navigate('schedule')}><CalendarDays size={19}/><small>{x.navEvent}</small></button><button onClick={() => navigate('details')} aria-label={lang === 'en' ? 'View venue' : 'நிகழ்ச்சி இடத்தைப் பார்க்க'}><MapPin size={19}/><small>{lang === 'en' ? 'Venue' : 'இடம்'}</small></button><button onClick={() => navigate('rsvp')}><PartyPopper size={19}/><small>{t.navRSVP}</small></button><button onClick={() => navigate('wishes')}><MessageCircleHeart size={19}/><small>{t.navWishes}</small></button></nav>
    </div>
  </div>
}
