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
- Il catalogo vegetariano viene recuperato una sola volta e paginato localmente; ogni caricamento è limitato a 5 tentativi e mantiene i risultati parziali.
- I dati TheMealDB vengono normalizzati in un formato unico per l'interfaccia.
- La traduzione richiede connessione internet; in caso di errore viene mantenuto il testo originale.
- La build include una CSP restrittiva; per un deployment pubblico configura anche gli header HTTP HSTS, `X-Content-Type-Options` e `Permissions-Policy` sul web server/CDN.

## DevOps

### Ambienti

- **Development**: Vite locale su `npm run dev`, variabili da `.env`, nessuna chiave cliente obbligatoria.
- **Staging**: pull request validate da GitHub Actions e preview Netlify generata per la revisione.
- **Production**: push su `main` pubblicato automaticamente su Netlify all'indirizzo https://veggie-delight-samuele.netlify.app/.

### Architettura e strumenti

VeggieDelight è una SPA React/Vite senza backend applicativo proprio. Il browser usa TheMealDB e i servizi di traduzione; il piccolo servizio backend incluso nel ciclo Docker espone soltanto `/api/health` per il monitoraggio locale.

È stato scelto **GitHub Actions** perché il repository è su GitHub, consente lint/test/build container e può usare gli stessi secret per Netlify. Netlify resta la piattaforma di hosting già configurata per l'app.

### Docker locale

```powershell
Copy-Item .env.example .env
docker compose up --build
```

- Frontend: http://localhost:8080
- Health backend: http://localhost:8080/api/health
- Arresto: `docker compose down`

`Dockerfile` usa build multi-stage per produrre l'immagine nginx di Vite. `docker-compose.yml` avvia frontend e backend health separati.

### Secrets

GitHub Secrets richiesti per il deploy:

- `NETLIFY_AUTH_TOKEN`: token personale Netlify con permesso deploy.
- `NETLIFY_SITE_ID`: ID del sito Netlify esistente.
- `SENTRY_DSN`: DSN pubblico opzionale del progetto Browser Sentry.

Configurazione: **Repository → Settings → Secrets and variables → Actions**.

Il `.env` locale è ignorato da Git tramite `.gitignore`. I valori sono mascherati nei log; mai usare output `echo` o passaggi di debug per stampare secret.

### CI/CD

`.github/workflows/ci-cd.yml` viene eseguito su push `main`, pull request e manualmente. I passaggi sono:

1. `npm ci`
2. `npm run lint`
3. `npm test`
4. `npm run build`
5. build delle due immagini Docker
6. deploy produzione Netlify solo dopo la validazione

Run verde verificata: https://github.com/messinasamuele2/VeggieDelight--React-Samuele-Messina/actions/runs/44498449854

### Monitoraggio

`.github/workflows/uptime.yml` verifica l'URL pubblico ogni 15 minuti. Una run fallita indica sito irraggiungibile o HTML inatteso.

Uptime verificato: https://github.com/messinasamuele2/VeggieDelight--React-Samuele-Messina/actions/runs/44499549436

Sentry può essere abilitato configurando `SENTRY_DSN`. Il pulsante **Simula errore** presente in produzione invia un evento manualmente. Verificare nella dashboard Sentry lo stack trace, timestamp e URL dell'evento. Un controllo UptimeRobot esterno può essere configurato come ulteriore notifica email/Telegram.

## Stato della consegna

- Repository GitHub: https://github.com/messinasamuele2/VeggieDelight--React-Samuele-Messina
- App pubblica Netlify: https://veggie-delight-samuele.netlify.app/
- Lint, test, build e build delle due immagini container: verificati in locale e nella pipeline verde.
- Uptime schedulato: verificato con run GitHub Actions verde.
- `.env` e `.env.*`: esclusi da Git; `.env.example` è il template pubblico.
- Sentry: SDK React 11.14.0 configurato, secret `SENTRY_DSN` presente su GitHub e errore test verificato nel progetto `devops-task-board-frontend`: https://devops-task-board.sentry.io/issues/162399529/ (issue `DEVOPS-TASK-BOARD-FRONTEND-2`)
- Docker Compose locale: configurato, ma il test end-to-end è bloccato finché Virtual Machine Platform/virtualizzazione firmware viene attivata e Windows viene riavviato.
- Deploy Netlify reale verificato tramite CLI autenticato il 19/11/2026; URL unico di verifica: https://6afec8b2b28bafc74897d15d--veggie-delight-samuele.netlify.app/
- Secret GitHub Netlify: `NETLIFY_AUTH_TOKEN` e `NETLIFY_SITE_ID` sono configurati nel repository. La pipeline manuale è stata verificata con successo e il job `Deploy to Netlify` ha pubblicato il sito.
