# Privacy Fitness Server

Questo repository contiene il codice lato server per il progetto Privacy Fitness. Il sistema è composto da due componenti principali: un API server che riceve e registra i dati dall'app Android Wear, e un server dashboard che fornisce un'interfaccia utente per visualizzare i dati personali.

## Componenti del Sistema

1. **API Server**: Un server Node.js che riceve i dati dall'app Android Wear e li registra nel database.
2. **Dashboard Server**: Un server separato che ospita l'interfaccia utente per la visualizzazione dei dati personali.
3. **Database**: (Presumibilmente MongoDB) per la memorizzazione dei dati ricevuti.

## Struttura del Progetto

```
privacy-fitness-server/
├── docker-compose.yml
├── api-server/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── dashboard-server/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── views/
│       ├── index.ejs
│       ├── dashboard.js
│       ├── dashboard.ejs
│       └── error.ejs
└── shared/
    └── models.js
```

## Requisiti di Sistema

- Docker
- Docker Compose
- Git

## Installazione

Per installare e avviare il server Privacy Fitness, seguire questi passaggi:

1. Clonare il repository:
   ```
   git clone https://github.com/adri6412/privacy-fitness-server.git
   cd privacy-fitness-server
   ```

2. Avviare i servizi utilizzando Docker Compose:
   ```
   docker-compose up --build -d
   ```

Questo comando costruirà e avvierà tutti i servizi necessari (API server, Dashboard server e Database).

## Configurazione

La configurazione dei servizi può essere modificata nel file `docker-compose.yml`. Qui è possibile regolare le porte, le variabili d'ambiente e altre impostazioni per ciascun servizio.

## Utilizzo

Una volta avviati i servizi:

- L'API server sarà accessibile su `http://localhost:<porta_api>`
- Il Dashboard utente sarà accessibile su `http://localhost:<porta_dashboard>`

Sostituire `<porta_api>` e `<porta_dashboard>` con le porte effettive configurate nel `docker-compose.yml`.

## Sviluppo

Per lavorare sul codice:

1. Modificare i file necessari nell'api-server/ o dashboard-server/
2. Ricostruire e riavviare i servizi: `docker-compose up --build`

### File principali:

- `api-server/server.js`: Contiene la logica principale dell'API server per ricevere e registrare i dati.
- `dashboard-server/server.js`: Gestisce la logica del server per la dashboard utente.
- `dashboard-server/views/`: Contiene i file EJS e JS per l'interfaccia utente della dashboard.
- `shared/models.js`: Definisce i modelli dati condivisi utilizzati nel progetto.

## API Server

L'API server è responsabile di:
- Ricevere i dati inviati dall'app Android Wear
- Validare e processare i dati ricevuti
- Registrare i dati nel database

## Dashboard Server

Il Dashboard server è responsabile di:
- Fornire un'interfaccia utente web per la visualizzazione dei dati personali
- Recuperare i dati dal database e presentarli in modo comprensibile
- Gestire l'autenticazione e l'autorizzazione degli utenti (se implementate)

## Contribuire

Siamo aperti a contributi!

## Licenza

Licenza
Questo progetto è rilasciato sotto la licenza GNU General Public License v2.0 (GPL-2.0).
La GPL-2.0 è una licenza copyleft che garantisce agli utenti la libertà di utilizzare, studiare, condividere (copiare) e modificare il software. Se si distribuisce versioni modificate del software, è necessario rendere disponibile il codice sorgente sotto la stessa licenza GPL-2.0.
Per i dettagli completi, si prega di consultare il file LICENSE incluso in questo repository o visitare:
https://www.gnu.org/licenses/old-licenses/gpl-2.0.html

