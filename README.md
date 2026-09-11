# VeggieDelight

Applicazione React/Vite per cercare e consultare ricette vegetariane.

## Avvio locale

1. Installa le dipendenze con `npm install`.
2. Copia `.env.example` in `.env`.
3. Inserisci, se disponibile, una chiave Spoonacular in `VITE_SPOONACULAR_API_KEY`.
4. Avvia l'app con `npm run dev` e apri l'indirizzo mostrato da Vite.

La chiave Spoonacular è opzionale: quando l'API non è disponibile o la quota è esaurita, l'app usa automaticamente TheMealDB come fallback gratuito.

## Comandi

- `npm run dev` avvia il server di sviluppo.
- `npm run build` crea la build di produzione.
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
- I dati TheMealDB vengono normalizzati nello stesso formato usato da Spoonacular.
- La traduzione richiede connessione internet; in caso di errore viene mantenuto il testo originale.
- Per un'applicazione pubblica, la chiave Spoonacular dovrebbe essere usata tramite un backend o una funzione serverless, non direttamente dal browser.
