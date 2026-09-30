# VeggieDelight

Applicazione React/Vite per cercare e consultare ricette vegetariane.

## Avvio locale

1. Installa le dipendenze con `npm install`.
2. Avvia l'app con `npm run dev` e apri l'indirizzo mostrato da Vite.

L'app usa TheMealDB senza chiavi segrete, così nessun token viene incluso nel bundle del browser.

## Comandi

- `npm run dev` avvia il server di sviluppo.
- `npm run build` crea la build di produzione.
- `npm run check` esegue lint e build in un unico passaggio.
- `npm run preview` serve localmente la build prodotta.
- `npm run lint` esegue Oxlint.

## Struttura principale

- `src/components/`: componenti riutilizzabili dell'interfaccia.
- `src/pages/`: pagine Home e dettaglio ricetta.
- `src/context/`: contratto del Context e Provider dello stato.
- `src/services/`: accesso alle API e traduzione.
- `src/i18n.js`: dizionario centralizzato italiano/inglese.
- `public/`: favicon e immagini di sfondo statiche.

## Note di manutenzione

- Non committare `.env`: contiene configurazione locale e viene escluso da Git.
- Le chiamate API sono cancellabili per evitare che risposte vecchie sovrascrivano risultati nuovi.
- I dati TheMealDB vengono normalizzati in un formato unico per l'interfaccia.
- La traduzione richiede connessione internet; in caso di errore viene mantenuto il testo originale.
- La build include una CSP restrittiva; per un deployment pubblico configura anche gli header HTTP HSTS, `X-Content-Type-Options` e `Permissions-Policy` sul web server/CDN.
