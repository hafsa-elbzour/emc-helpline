import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const API_URL = 'http://127.0.0.1:8000'

const TEXTES = {
  fr: {
    dir: 'ltr',
    voix: 'fr-FR',
    autreLangue: 'العربية',
    sousTitre: "Assistant d'écoute · 24h/24",
    urgence: 'Besoin de parler à un écoutant ?',
    appeler: 'Appeler le 2511',
    sortie: 'Sortie rapide',
    sortieAide: 'Astuce : appuyez deux fois sur Échap',
    accueil:
      "Bonjour, je suis l'assistant de l'EMC Helpline. Vous êtes dans un espace d'écoute bienveillant. Comment puis-je vous aider ?",
    erreur: 'Désolé, impossible de contacter le serveur.',
    indisponible:
      "Je suis momentanément indisponible. Si vous avez besoin d'aide maintenant, vous pouvez appeler le **2511**.",
    reessayer: 'Réessayer',
    placeholder: 'Écrivez votre message...',
    envoyer: 'Envoyer',
    copier: 'Copier',
    copie: 'Copié ✓',
    nouvelle: 'Nouvelle conversation',
    theme: 'Changer de thème',
    taille: 'Taille du texte',
    micro: 'Dicter un message',
    avertissement: 'Cet assistant ne remplace pas un écoutant humain.',
    sujetsTitre: 'Choisissez un sujet ou écrivez votre question',
    ressourcesBouton: 'Ressources',
    ressourcesTitre: 'Ressources utiles',
    ressourcesIntro: "Vous pouvez aussi vous adresser directement à l'équipe de l'EMC :",
    ligneEcoute: "Ligne d'écoute",
    fermer: 'Fermer',
    sujets: [
      { icone: '😔', titre: 'Cyberharcèlement', question: "Qu'est-ce que le cyberharcèlement ?" },
      { icone: '📸', titre: 'Photos diffusées', question: 'Que faire si on diffuse mes photos sans mon accord ?' },
      { icone: '🚩', titre: 'Signaler un compte', question: 'Comment signaler un compte qui me harcèle ?' },
      { icone: '🤝', titre: "Être écouté(e)", question: "J'ai besoin de parler à quelqu'un, je ne sais pas quoi faire." },
    ],
  },
  ar: {
    dir: 'rtl',
    voix: 'ar-MA',
    autreLangue: 'FR',
    sousTitre: 'مساعد الإصغاء · على مدار الساعة',
    urgence: 'هل تحتاج إلى التحدث مع مستمع؟',
    appeler: 'اتصل بالرقم 2511',
    sortie: 'خروج سريع',
    sortieAide: 'نصيحة: اضغط مرتين على Esc',
    accueil:
      'مرحباً، أنا مساعد EMC Helpline. أنت في فضاء آمن للإصغاء والدعم. كيف يمكنني مساعدتك؟',
    erreur: 'عذراً، تعذّر الاتصال بالخادم.',
    indisponible:
      'أنا غير متاح مؤقتاً. إذا كنت بحاجة إلى مساعدة الآن، يمكنك الاتصال بالرقم **2511**.',
    reessayer: 'إعادة المحاولة',
    placeholder: 'اكتب رسالتك...',
    envoyer: 'إرسال',
    copier: 'نسخ',
    copie: 'تم النسخ ✓',
    nouvelle: 'محادثة جديدة',
    theme: 'تغيير المظهر',
    taille: 'حجم النص',
    micro: 'إملاء رسالة',
    avertissement: 'هذا المساعد لا يغني عن التحدث مع مستمع بشري.',
    sujetsTitre: 'اختر موضوعاً أو اكتب سؤالك',
    ressourcesBouton: 'مصادر',
    ressourcesTitre: 'مصادر مفيدة',
    ressourcesIntro: 'يمكنك أيضاً التواصل مباشرة مع فريق EMC:',
    ligneEcoute: 'خط الإصغاء',
    fermer: 'إغلاق',
    sujets: [
      { icone: '😔', titre: 'التحرش الإلكتروني', question: 'ما هو التحرش الإلكتروني؟' },
      { icone: '📸', titre: 'نشر الصور', question: 'ماذا أفعل إذا تم نشر صوري دون موافقتي؟' },
      { icone: '🚩', titre: 'الإبلاغ عن حساب', question: 'كيف أبلغ عن حساب يضايقني؟' },
      { icone: '🤝', titre: 'أحتاج إلى من يسمعني', question: 'أحتاج إلى التحدث مع شخص، ولا أعرف ماذا أفعل.' },
    ],
  },
}

function heureActuelle() {
  return new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function messageAccueil() {
  return { auteur: 'bot', accueil: true, heure: heureActuelle() }
}

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null
function Bouclier({ taille = 22 }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l8 3v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function App() {
  const [lang, setLang] = useState('fr')
  const [texte, setTexte] = useState('')
  const [chargement, setChargement] = useState(false)
  const [sombre, setSombre] = useState(false)
  const [grand, setGrand] = useState(false)
  const [ecoute, setEcoute] = useState(false)
  const [copie, setCopie] = useState(null)
  const [avis, setAvis] = useState({})
  const [ressources, setRessources] = useState(false)
  const [messages, setMessages] = useState([messageAccueil()])

  const finRef = useRef(null)
  const saisieRef = useRef(null)
  const reconnaissanceRef = useRef(null)
  const dernierEchapRef = useRef(0)

  const t = TEXTES[lang]

  // Défilement automatique vers le dernier message
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chargement])

  // Thème sombre et grande taille de texte
  useEffect(() => {
    document.body.classList.toggle('sombre', sombre)
  }, [sombre])

  useEffect(() => {
    document.body.classList.toggle('grand', grand)
  }, [grand])

  // Langue et sens de lecture de la page
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = t.dir
  }, [lang, t.dir])

  // Le champ de saisie grandit avec le texte (maximum 120 px)
  useEffect(() => {
    const el = saisieRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [texte])

  // Sortie rapide au clavier : deux appuis sur Échap en moins de 0,8 s
  useEffect(() => {
    function surTouche(e) {
      if (e.key !== 'Escape') return
      const maintenant = Date.now()
      if (maintenant - dernierEchapRef.current < 800) sortieRapide()
      dernierEchapRef.current = maintenant
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [])

  async function envoyer(question, relance = false) {
    if (question.trim() === '' || chargement) return

    setMessages((anciens) => {
      const base = anciens.filter((m) => !m.erreur && !m.indisponible)
      if (relance) return base
      return [...base, { auteur: 'utilisateur', texte: question, heure: heureActuelle() }]
    })
    setTexte('')
    setChargement(true)

    try {
      const reponse = await fetch(
        `${API_URL}/chat?message=${encodeURIComponent(question)}`,
        { method: 'POST' }
      )
      if (!reponse.ok) throw new Error('Erreur serveur')
      const data = await reponse.json()
      const brut = data.reponse || ''

      if (brut.startsWith('Erreur technique')) {
        // Le backend a renvoyé une erreur (quota Gemini, par exemple)
        setMessages((anciens) => [
          ...anciens,
          { auteur: 'bot', indisponible: true, question, heure: heureActuelle() },
        ])
      } else {
        setMessages((anciens) => [
          ...anciens,
          { auteur: 'bot', texte: brut, heure: heureActuelle() },
        ])
      }
    } catch (erreur) {
      setMessages((anciens) => [
        ...anciens,
        { auteur: 'bot', erreur: true, question, heure: heureActuelle() },
      ])
    } finally {
      setChargement(false)
    }
  }

  function nouvelleConversation() {
    reconnaissanceRef.current?.stop()
    setMessages([messageAccueil()])
    setAvis({})
    setTexte('')
  }

  function sortieRapide() {
    setMessages([messageAccueil()])
    setTexte('')
    window.location.replace('https://www.google.com')
  }

  async function copier(contenu, index) {
    try {
      await navigator.clipboard.writeText(contenu)
      setCopie(index)
      setTimeout(() => setCopie(null), 1500)
    } catch (e) {
      // la copie n'est pas disponible : on ne fait rien
    }
  }

  function donnerAvis(index, valeur) {
    setAvis((a) => ({ ...a, [index]: a[index] === valeur ? null : valeur }))
  }

  function dicter() {
    if (!SpeechRecognition) return
    if (ecoute) {
      reconnaissanceRef.current?.stop()
      return
    }
    const r = new SpeechRecognition()
    r.lang = t.voix
    r.interimResults = true
    r.onresult = (e) => {
      const transcription = Array.from(e.results)
        .map((res) => res[0].transcript)
        .join('')
      setTexte(transcription)
    }
    r.onend = () => setEcoute(false)
    r.onerror = () => setEcoute(false)
    reconnaissanceRef.current = r
    r.start()
    setEcoute(true)
  }

  const accueilSeul = messages.length === 1 && !chargement

  return (
    <div className="app">
      <header className="entete">
        <div className="logo">🛡️</div>
        <div className="entete-texte">
          <h1>EMC Helpline</h1>
          <p>
            <span className="point-en-ligne"></span>
            {t.sousTitre}
          </p>
        </div>
        <div className="entete-actions">
          <button className="btn-langue" onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}>
            {t.autreLangue}
          </button>
          <button onClick={() => setRessources(true)} title={t.ressourcesBouton} aria-label={t.ressourcesBouton}>
            📚
          </button>
          <button className="btn-taille" onClick={() => setGrand(!grand)} title={t.taille} aria-label={t.taille}>
            {grand ? 'A−' : 'A+'}
          </button>
          <button onClick={nouvelleConversation} title={t.nouvelle} aria-label={t.nouvelle}>
            ↺
          </button>
          <button onClick={() => setSombre(!sombre)} title={t.theme} aria-label={t.theme}>
            {sombre ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="bandeau-urgence">
        <span>🚨 {t.urgence}</span>
        <div className="urgence-actions">
          <a href="tel:2511">{t.appeler}</a>
          <button className="btn-sortie" onClick={sortieRapide} title={t.sortieAide}>
            ✕ {t.sortie}
          </button>
        </div>
      </div>

      <div className="messages">
        {messages.map((m, index) => {
          const contenu = m.accueil
            ? t.accueil
            : m.erreur
              ? t.erreur
              : m.indisponible
                ? t.indisponible
                : m.texte
          const reponseBot = m.auteur === 'bot' && !m.accueil && !m.erreur && !m.indisponible

          return (
            <div key={index} className={`ligne ${m.auteur}`}>
              {m.auteur === 'bot' && <div className="avatar">🛡️</div>}
              <div className={`bulle bulle-${m.auteur}`} dir="auto">
                <ReactMarkdown>{contenu}</ReactMarkdown>

                {(m.erreur || m.indisponible) && (
                  <button className="reessayer" onClick={() => envoyer(m.question, true)}>
                    ↻ {t.reessayer}
                  </button>
                )}

                <div className="pied">
                  <span className="heure">{m.heure}</span>
                  {reponseBot && (
                    <span className="actions">
                      <button onClick={() => copier(m.texte, index)}>
                        {copie === index ? t.copie : `📋 ${t.copier}`}
                      </button>
                      <button
                        className={avis[index] === 'up' ? 'actif' : ''}
                        onClick={() => donnerAvis(index, 'up')}
                        aria-label="Utile"
                      >
                        👍
                      </button>
                      <button
                        className={avis[index] === 'down' ? 'actif' : ''}
                        onClick={() => donnerAvis(index, 'down')}
                        aria-label="Pas utile"
                      >
                        👎
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {accueilSeul && (
          <div className="sujets-bloc">
            <p className="sujets-titre">{t.sujetsTitre}</p>
            <div className="sujets">
              {t.sujets.map((s) => (
                <button key={s.titre} className="carte-sujet" onClick={() => envoyer(s.question)}>
                  <span className="carte-icone">{s.icone}</span>
                  <span>{s.titre}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {chargement && (
          <div className="ligne bot">
            <div className="avatar">🛡️</div>
            <div className="bulle bulle-bot points">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={finRef} />
      </div>

      <div className="zone-saisie">
        {SpeechRecognition && (
          <button
            className={`micro ${ecoute ? 'actif' : ''}`}
            onClick={dicter}
            title={t.micro}
            aria-label={t.micro}
          >
            🎤
          </button>
        )}
        <textarea
          ref={saisieRef}
          rows={1}
          dir="auto"
          placeholder={t.placeholder}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              envoyer(texte)
            }
          }}
        />
        <button className="envoyer" onClick={() => envoyer(texte)} disabled={chargement}>
          {t.envoyer}
        </button>
      </div>
      <p className="avertissement">{t.avertissement}</p>

      {ressources && (
        <div className="voile" onClick={() => setRessources(false)}>
          <div className="fenetre" onClick={(e) => e.stopPropagation()}>
            <h2>📚 {t.ressourcesTitre}</h2>
            <p>{t.ressourcesIntro}</p>
            <ul>
              <li>
                <span>📞 {t.ligneEcoute}</span>
                <a href="tel:2511">2511</a>
              </li>
              <li>
                <span>🌐 E-Vigilance</span>
                <a href="https://evigilance.ma/fr" target="_blank" rel="noopener noreferrer">
                  evigilance.ma
                </a>
              </li>
              <li>
                <span>🌐 Espace Maroc Cyberconfiance</span>
                <a href="https://www.cyberconfiance.ma" target="_blank" rel="noopener noreferrer">
                  cyberconfiance.ma
                </a>
              </li>
            </ul>
            <button className="fermer" onClick={() => setRessources(false)}>
              {t.fermer}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App