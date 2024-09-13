const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { User, Data } = require('./shared/models');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');

const app = express();
const port = 3000;

// Middleware per logging delle richieste
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} request to ${req.url}`);
  next();
});

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Middleware per logging del body delle richieste
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  next();
});

// Connessione a MongoDB
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost/wearos_data';
mongoose.connect(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connesso a MongoDB'))
  .catch(err => console.error('Errore di connessione a MongoDB:', err));

// Funzione per generare un hash dell'userId
function hashUserId(userId) {
  return crypto.createHash('sha256').update(userId).digest('hex');
}

// Funzione di validazione personalizzata per il timestamp
const isValidTimestamp = (value) => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};

// Route per la registrazione degli utenti
app.post('/api/register', async (req, res) => {
    try {
        if (!req.body.userId) {
            return res.status(400).json({ error: 'userId non fornito nella richiesta' });
        }

        const hashedUserId = hashUserId(req.body.userId);

        // Verifica se l'utente esiste già
        const existingUser = await User.findOne({ userId: hashedUserId });
        if (existingUser) {
            return res.status(409).json({ error: 'Utente già registrato con questo userId' });
        }

        const user = new User({
            userId: hashedUserId,
            name: req.body.name,
            weight: req.body.weight,
            height: req.body.height,
            gender: req.body.gender
        });
        await user.save();
        res.status(201).json({ message: 'Utente registrato con successo', userId: hashedUserId });
    } catch (error) {
        console.error('Errore nella registrazione dell\'utente:', error);
        res.status(500).json({ error: 'Errore nella registrazione dell\'utente', details: error.message });
    }
});

// Middleware di validazione per bulk-data
const validateBulkData = [
  body().isArray().withMessage('I dati devono essere un array'),
  body('*.userId').notEmpty().withMessage('userId è richiesto'),
  body('*.type').isString().withMessage('Tipo di dato non valido'),
  body('*.timestamp').custom(isValidTimestamp).withMessage('Timestamp non valido'),
  body('*.workout').optional().isString().withMessage('Workout deve essere una stringa')
];

// Route per ricevere i dati delle attività in bulk
app.post('/api/bulk-data', validateBulkData, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const bulkData = req.body;

        const hashedUserId = hashUserId(bulkData[0].userId);
        const user = await User.findOne({ userId: hashedUserId });
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        const dataToInsert = bulkData.map(item => {
            // Sanitizzazione e validazione aggiuntiva
            const sanitizedItem = {
                userId: hashedUserId,
                type: item.type.toLowerCase(),
                value: item.value,
                timestamp: new Date(item.timestamp),
                workout: item.workout ? item.workout.trim() : undefined
            };

            // Controlli specifici per tipo
            switch (sanitizedItem.type) {
                case 'steps':
                case 'heart_rate':
                case 'calories':
                case 'distance':
                    if (typeof sanitizedItem.value === 'number' && !isNaN(sanitizedItem.value)) {
                        sanitizedItem.value = parseFloat(sanitizedItem.value.toFixed(2));
                    } else {
                        throw new Error(`Valore non valido per ${sanitizedItem.type}: ${sanitizedItem.value}`);
                    }
                    break;
                case 'gps':
                    // Gestione specifica per i dati GPS
                    if (typeof sanitizedItem.value === 'string') {
                        const [latStr, lonStr] = sanitizedItem.value.split(', ');
                        const lat = parseFloat(latStr.split(': ')[1]);
                        const lon = parseFloat(lonStr.split(': ')[1]);
                        if (!isNaN(lat) && !isNaN(lon)) {
                            sanitizedItem.value = { lat, lon };
                        } else {
                            throw new Error(`Valore GPS non valido: ${sanitizedItem.value}`);
                        }
                    }
                    break;
                case 'start':
                case 'stop':
                case 'timer':
                case 'altitude':
                    // Questi tipi non richiedono una conversione specifica
                    break;
                default:
                    console.warn(`Tipo di dato non riconosciuto: ${sanitizedItem.type}`);
            }

            return sanitizedItem;
        });

        // Verifica la consistenza temporale
        const sortedData = dataToInsert.sort((a, b) => a.timestamp - b.timestamp);
        const now = new Date();
        if (sortedData[sortedData.length - 1].timestamp > now) {
            throw new Error('Timestamp futuro non valido');
        }

        // Salva i dati nel database
        const savedData = await Data.insertMany(dataToInsert);

        console.log(`Salvati ${savedData.length} dati in bulk`);
        res.status(200).json({ message: `${savedData.length} dati ricevuti e salvati con successo` });
    } catch (error) {
        console.error('Errore nel salvataggio dei dati in bulk:', error);
        res.status(500).json({ error: error.message || 'Errore nel salvataggio dei dati in bulk' });
    }
});

// Route per ottenere i dati delle attività di un utente
app.get('/api/data/:userId', async (req, res) => {
    try {
        if (!req.params.userId) {
            return res.status(400).json({ error: 'userId richiesto' });
        }
        const hashedUserId = hashUserId(req.params.userId);
        const data = await Data.find({ userId: hashedUserId }).sort('-timestamp').limit(100);
        res.json(data);
    } catch (error) {
        console.error('Errore nel recupero dei dati:', error);
        res.status(500).json({ error: 'Errore nel recupero dei dati' });
    }
});

// Gestione degli errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Qualcosa è andato storto!');
});

app.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});
