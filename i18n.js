/* ============================================
   I18N — lightweight EN/IT switcher
   English lives in the HTML (source of truth).
   This file provides the Italian overrides keyed
   by data-i18n / data-i18n-ph, plus dynamic strings
   (DYN) used by quote.js.
   ============================================ */
(function () {
  const STORAGE_KEY = 'siteLang';
  const SUPPORTED   = ['en', 'it'];

  // ── Italian overrides for static markup ──────────────────────────────────
  const IT = {
    // meta titles
    'meta.title':  'Filippo Gerbino — Compositore e Orchestratore',
    'meta.title2': 'Inizia un Progetto — Filippo Gerbino',

    // nav (shared)
    'nav.about':     'Chi sono',
    'nav.work':      'Lavori',
    'nav.projects':  'Progetti',
    'nav.cta':       'Inizia un progetto',
    'nav.available': 'Disponibile',

    // hero
    'hero.eyebrow': 'Compositore Orchestrale · Game Audio',
    'hero.title':   "Un solo compositore.<br/><em>Un'orchestra intera.</em>",
    'hero.sub':     'Composizione. Orchestrazione. Produzione. Mix. Master.<br/>Tutto quello che serve al tuo gioco — da una sola mano.',
    'hero.listen':  'Ascolta',
    'hero.start':   'Inizia un progetto',
    'hero.scroll':  'scorri',

    // marquee
    'mq.scoring':  'Scoring Orchestrale',
    'mq.live':     'Registrazioni dal Vivo',
    'mq.pipeline': 'Pipeline Completa',
    'mq.written':  'Orchestrazioni Scritte',
    'mq.gfs':      'Giochi · Film · Serie',

    // about
    'about.eyebrow': '// Chi',
    'about.title':   'Formazione classica.<br/><em>Disinvoltura digitale.</em>',
    'about.stat1':   'Diplomi in pianoforte<br/>Conservatorio',
    'about.stat2':   'Studio.<br/>Pipeline completa.',
    'about.stat3':   'Turnisti<br/>a disposizione',
    'about.single':  'Scrivo, orchestro, registro, mixo e masterizzo — da solo. Quando il progetto chiede musicisti veri, li porto in studio.',
    'about.tagSession': 'Turnisti',
    'about.tagStems':   'Consegna stems',
    'about.portraitCap': 'Dal vivo al pianoforte · Conservatorio',

    // pipeline
    'pipe.comp':      'Composizione',
    'pipe.compDesc':  'Temi, motivi, leitmotiv — cuciti sul tuo mondo.',
    'pipe.orch':      'Orchestrazione',
    'pipe.orchDesc':  'Partiture complete. Pronte per musicisti veri o sample.',
    'pipe.prod':      'Produzione',
    'pipe.prodDesc':  'Session virtuali e dal vivo. Strumenti veri quando conta.',
    'pipe.mixDesc':   'Stereo o stems. Ottimizzati per engine o streaming.',

    // sound / references
    'sound.eyebrow': '// Suono',
    'sound.title':   'Come potrebbe<br/><em>suonare il tuo mondo.</em>',
    'ref1.title': 'High Fantasy',
    'ref1.desc':  'Orchestrazioni epiche, leitmotiv tematici, world-building immersivo. Musica che fa esistere il mondo ancora prima che il giocatore ci arrivi.',
    'ref2.title': 'Oscuro e Antico',
    'ref2.desc':  "Ottoni potenti, cori inquietanti, archi intimi. Per terre desolate, dèi dimenticati e mondi sull'orlo del baratro.",
    'ref3.title': 'Dramma Cinematico',
    'ref3.desc':  'Scrittura guidata dalla narrazione, costruita su personaggi ed emozioni. Temi che evolvono, ricordano e ripagano.',
    'ref4.title': 'Azione e Tensione',
    'ref4.desc':  "Ritmi serrati, ottoni aggressivi, urgenza percussiva. Musica di combattimento che spinge il giocatore in avanti senza spezzare l'immersione.",

    // intro video
    'intro.title': 'Prima di<br/><em>premere play.</em>',

    // work / portfolio
    'work.eyebrow': '// Lavori',
    'work.title':   'Premi play.',
    'g1': 'Boss Finale · Battaglia',
    'g2': 'Scontro col Boss',
    'g3': 'Game Over · Jingle',
    'g4': 'Cupo · Atmosferico · Ambient',
    'g5': 'Trailer Epico',
    'g6': 'Ambient · Calmo · Open World',
    'g7': 'Rescoring · Mashup Orchestrale',
    'g8': 'Tema Principale · Avventura',

    // rescore
    'rescore.label': '// Scoring Cinematico',
    'rescore.title': 'Stessa immagine.<br/><em>Anima diversa.</em>',
    'rescore.sub':   'Un rescore integrale di <em>Book of the Dead</em> di Unity (2018) — atonale e inquietante, scritto e prodotto per seguire ogni stacco, respiro e ombra sullo schermo. La prova che la musica giusta può reggere da sola una cinematica.',
    'rescore.watch': 'Guarda su YouTube <span aria-hidden="true">↗</span>',

    // implementation / adaptive audio
    'impl.eyebrow': '// Implementazione',
    'impl.title':   'Musica che<br/><em>reagisce.</em>',
    'impl.sub':     'Non consegno solo le tracce — le costruisco in sistemi adattivi in FMOD, così la musica segue il giocatore in tempo reale. Ecco come funziona.',
    'impl.hTag':    '// Horizontal re-sequencing',
    'impl.hDesc':   'La musica passa tra sezioni musicali complete — esplorazione, combattimento, morte — con transizioni a tempo quando cambia lo stato del gioco.',

    // projects
    'projects.eyebrow': '// Progetti',
    'projects.title':   'Giochi pubblicati.<br/><em>Colonne sonore consegnate.</em>',
    'proj1.type': 'Game Jam · RPG Tattico',
    'proj1.desc': "Survival sci-fi a turni — affronta un'orda infinita di entità demoniache. OST completa: composta, prodotta e masterizzata da solo.",
    'proj2.type': 'Game Jam · Avventura Nautica',
    'proj2.desc': 'Avventura piratesca — quanto a lungo riuscirai a far durare la tua leggenda? Realizzata per la Godot Wild Game Jam 2026 con Nemo, Afonso Silva e BluNotes. Colonna sonora interamente composta, prodotta e masterizzata.',
    'train.eyebrow': '// Formazione',
    'train.l1': 'Scoring per Film',
    'train.l2': 'Composizione Classica',
    'train.l3': 'Pianoforte · 2 Diplomi',

    // testimonials
    'testi.eyebrow': '// Testimonianze',
    'testi.title':   'Parola<br/><em>agli sviluppatori.</em>',
    'testi.q1': 'La musica era incredibile — talento vero. Non lasciare che ti dicano il contrario.',
    'testi.r1': 'Sviluppatore · Astra in Ruina',
    'testi.q2': 'Grazie per la musica straordinaria. Ha fatto la differenza.',
    'testi.r2': 'Content Creator · YouTube',
    'testi.q3': 'Senza dubbio la miglior jam che abbia mai consegnato in tempo. Tutti hanno dato il massimo — e la colonna sonora ha superato ogni aspettativa.',
    'testi.r3': 'Sviluppatore · Plundered',

    // services
    'services.eyebrow': '// Servizi',
    'services.title':   'Cosa consegno.',
    'svc1.title': 'OST Completa',
    'svc1.desc':  'Temi, biomi, musica dei boss, sting di UI, titoli di coda. Pronta per FMOD.',
    'svc2.title': 'Registrazioni in Studio',
    'svc2.desc':  'Musicisti veri, la mia rete. Archi, ottoni, legni, voci — turnisti registrati e prodotti uno per uno.',
    'svc3.title': 'Partitura e Parti',
    'svc3.desc':  "Partitura per direttore + parti staccate. Dallo schizzo alla notazione pronta per l'orchestra.",
    'svc4.desc':  'Stereo o stems. Game engine, trailer o streaming — scegli tu.',

    // contact / cta
    'contact.eyebrow': '// Contatti',
    'cta.title': 'Hai un mondo<br/><em>da musicare?</em>',
    'cta.sub':   'Raccontami cosa stai costruendo.',
    'form.success': 'Messaggio inviato. Ti rispondo presto.',
    'form.name':    '// Nome',
    'form.proj':    '// Progetto',
    'form.send':    'Invia',
    'form.sending': 'Invio…',
    'form.alt':     'oppure scrivimi direttamente — <a href="mailto:filippo.gerbino.mail@gmail.com">filippo.gerbino.mail@gmail.com</a>',

    // footer
    'footer.copy': '© <span id="footerYear">2026</span> Filippo Gerbino — Compositore e Orchestratore',

    // ── quote page ──────────────────────────────────────────────────────────
    'quote.eyebrow':  '// Inizia un Progetto',
    'quote.title':    'Costruiamo<br/><em>la tua colonna sonora.</em>',
    'quote.subtitle': 'Qualche domanda veloce — ti rispondo con un preventivo vero, non un copia-incolla.',

    's1.title': 'Cosa ti serve?',
    's1.hint':  'Seleziona tutto quello che ti serve.',
    'n1.t': 'Tema Principale',      'n1.d': "Il cuore dell'identità del tuo gioco",
    'n2.t': 'Loop In-Game',         'n2.d': 'Bioma, esplorazione, atmosfere',
    'n3.t': 'Combattimento / Boss', 'n3.d': 'Tracce di battaglia e scontri coi boss',
    'n4.t': 'Cinematiche / Cutscene','n4.d': 'Musica sincronizzata alle immagini, momenti narrativi',
    'n5.t': 'Musica per Trailer',   'n5.d': 'Annuncio, lancio o teaser',
    'n6.t': 'UI / Sting',           'n6.d': 'Musica dei menu, sound branding, jingle',
    'n7.t': 'OST Completa',         'n7.d': "Tutto, dalla prima all'ultima nota",
    'n8.t': "Qualcos'altro",        'n8.d': 'Me lo dici alla fine',

    's2.title': 'Quanti minuti di musica?',
    's2.hint':  'Una stima va benissimo — la mettiamo a fuoco insieme.',
    's2.unit':  'minuti',

    's3.title': 'Che atmosfera cerchi?',
    's3.hint':  'Scegli quella più vicina — o combinale e raccontami di più dopo.',
    'v1.t': 'Orchestra Completa',   'v1.d': "Archi, ottoni, legni, coro — c'è tutto",
    'v2.t': 'Intimo e Acustico',    'v2.d': 'Piccolo ensemble, strumenti solisti, elementi folk',
    'v3.t': 'Orchestrale Ibrido',   'v3.d': "L'orchestra incontra i synth, texture elettroniche",
    'v4.t': 'Oscuro e Atmosferico', 'v4.d': 'Ottoni potenti, coro inquietante, texture desolate',
    'v5.t': 'Epico e Cinematico',   'v5.d': 'Grande, drammatico, fatto apposta per trailer e boss fight',
    'v6.t': 'Non so ancora',        'v6.d': 'Lo scopriamo insieme',

    's4.title': "Ti serve l'implementazione?",
    's4.hint':  "Come vuoi ricevere l'audio?",
    'i1.t': 'Solo le tracce',       'i1.d': 'Master stereo — al resto penso io',
    'i2.t': 'Solo stems',           'i2.d': 'Livelli separati per il tuo audio engine',
    'i3.t': 'Implementazione FMOD', 'i3.d': 'Musica adattiva, trigger, integrazione completa',
    'i4.t': 'Non so ancora',        'i4.d': 'Possiamo deciderlo insieme',

    's5.title': 'Qual è il tuo budget?',
    's5.hint':  'Mi aiuta a calibrare la proposta.',
    'b1.t': 'Sotto i 500$',         'b1.d': 'Game jam, promo brevi',
    'b2.d': 'Titoli indie, vertical slice',
    'b3.d': 'Release indie complete',
    'b4.d': 'Produzioni più grandi, OST completa + dal vivo',
    'b5.t': 'Parliamone',           'b5.d': 'Preferisco parlarne con calma',
    'b.warn': 'Questo budget non copre la mole di lavoro.',

    'q.details': '// I tuoi dati',
    'q.lblName':  '// Nome',
    'q.lblExtra': '// Altro?',
    'q.back':   '← Indietro',
    'q.next':   'Avanti →',
    'q.submit': 'Ricevi il preventivo',

    'q.successTitle': 'Richiesta inviata.',
    'q.successBody':  'Leggo il tuo brief e ti rispondo entro 48 ore con una proposta su misura.',
    'q.backPortfolio': '← Torna al portfolio',

    // privacy page
    'meta.title3':     'Privacy — Filippo Gerbino',
    'privacy.eyebrow': '// Privacy',
    'privacy.title':   'Privacy',
    'privacy.updated': 'Ultimo aggiornamento — giugno 2026',
    'privacy.intro':   'Questo sito è gestito da Filippo Gerbino. Ecco esattamente cosa succede ai tuoi dati — in breve e in modo onesto.',
    'privacy.h1':      'Form di contatto e preventivo',
    'privacy.p1':      'Quando usi il form di contatto o il configuratore di preventivo, i dati che inserisci (nome, email, messaggio) mi arrivano tramite Formspree solo per poterti rispondere. Non vengono mai venduti, condivisi o usati per marketing.',
    'privacy.h2':      'Video incorporati',
    'privacy.p2':      'Le pagine con video di YouTube caricano contenuti da YouTube, che può impostare cookie quando premi play. Dove possibile i video usano la modalità privacy di YouTube (senza cookie).',
    'privacy.h3':      'Statistiche',
    'privacy.p3':      'Uso uno strumento di statistiche rispettoso della privacy che conta le visite in forma anonima, senza cookie e senza tracciarti su altri siti. Non viene raccolto alcun dato personale.',
    'privacy.h4':      'I tuoi diritti',
    'privacy.p4':      'Puoi chiedermi in qualsiasi momento di vedere o cancellare i dati che mi hai inviato — scrivi a <a href="mailto:filippo.gerbino.mail@gmail.com">filippo.gerbino.mail@gmail.com</a>.',
    'footer.privacy':  'Privacy',
  };

  // ── Placeholder overrides ────────────────────────────────────────────────
  const IT_PH = {
    'ph.name':    'Il tuo nome',
    'ph.message': "Parlami del tuo gioco, dell'atmosfera che cerchi, delle tempistiche...",
    'ph.extra':   'Concept del gioco, brani di riferimento, scadenza, qualunque cosa possa aiutare...',
  };

  // ── Dynamic strings used by quote.js (both languages) ────────────────────
  const DYN = {
    en: {
      'q.step':      'Step {n} of {total}',
      'q.slider.1':  'A jingle or short sting — perfect.',
      'q.slider.2':  'A handful of tracks — ideal for a game jam.',
      'q.slider.3':  'A solid indie vertical slice.',
      'q.slider.4':  'Full small-to-mid indie game OST.',
      'q.slider.5':  'Substantial OST — a real release.',
      'q.slider.6':  "Full-scale production. Let's talk details.",
      'q.budgetWarn':"For ~{mins} min of music my rate starts at ${cost}. This range isn't a fit right now — but feel free to reach out directly if you'd like to discuss.",
      'q.sending':   'Sending…',
      'q.submit':    'Get My Custom Quote',
      'q.error':     'Something went wrong — please email filippo.gerbino.mail@gmail.com directly.',
    },
    it: {
      'q.step':      'Passo {n} di {total}',
      'q.slider.1':  'Un jingle o un breve sting — perfetto.',
      'q.slider.2':  'Qualche traccia — perfetto per una game jam.',
      'q.slider.3':  'Una solida vertical slice indie.',
      'q.slider.4':  'OST completa per un indie piccolo o medio.',
      'q.slider.5':  'Una OST corposa — una vera release.',
      'q.slider.6':  'Produzione su larga scala. Parliamone nel dettaglio.',
      'q.budgetWarn':'Per ~{mins} min di musica la mia tariffa parte da {cost}$. Per ora questa fascia non è in linea — ma scrivimi pure direttamente se vuoi parlarne.',
      'q.sending':   'Invio…',
      'q.submit':    'Ricevi il preventivo',
      'q.error':     'Qualcosa è andato storto — scrivimi direttamente a filippo.gerbino.mail@gmail.com.',
    },
  };

  // ── Engine ───────────────────────────────────────────────────────────────
  const origHTML = new Map();
  const origPH   = new Map();
  let current;

  function detect() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    return 'en'; // default English
  }

  function capture() {
    document.querySelectorAll('[data-i18n]').forEach(el => origHTML.set(el, el.innerHTML));
    document.querySelectorAll('[data-i18n-ph]').forEach(el => origPH.set(el, el.getAttribute('placeholder') || ''));
  }

  function apply(lang) {
    current = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (lang === 'it' && IT[key] != null) el.innerHTML = IT[key];
      else if (origHTML.has(el))            el.innerHTML = origHTML.get(el);
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (lang === 'it' && IT_PH[key] != null) el.setAttribute('placeholder', IT_PH[key]);
      else if (origPH.has(el))                 el.setAttribute('placeholder', origPH.get(el));
    });

    // keep copyright year dynamic even after innerHTML swaps
    const fy = document.getElementById('footerYear');
    if (fy) fy.textContent = new Date().getFullYear();

    document.querySelectorAll('.lang-opt').forEach(b => {
      const on = b.dataset.lang === lang;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  // public API (used by quote.js)
  window.i18n = {
    get lang() { return current; },
    set(lang) { if (SUPPORTED.includes(lang)) apply(lang); },
    t(key, vars) {
      const table = DYN[current] || DYN.en;
      let s = (table[key] != null) ? table[key] : (DYN.en[key] != null ? DYN.en[key] : key);
      if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
      return s;
    },
  };

  function init() {
    capture();
    document.querySelectorAll('.lang-opt').forEach(b => {
      b.addEventListener('click', () => apply(b.dataset.lang));
    });
    apply(detect());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
