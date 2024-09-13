const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const path = require('path');
const { User, Data } = require('./shared/models');
const crypto = require('crypto');

const app = express();
const port = 3005;

const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost/wearos_data';
mongoose.connect(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Dashboard connessa a MongoDB'))
  .catch(err => console.error('Errore di connessione a MongoDB per la dashboard:', err));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Funzione per generare un hash dell'userId
function hashUserId(userId) {
  return crypto.createHash('sha256').update(userId).digest('hex');
}

app.get('/', (req, res) => {
  res.render('index', { title: 'Dashboard WearOS' });
});

app.post('/visualize', async (req, res) => {
    const userId = req.body.userId;
    // Nota: L'userId può ora provenire sia dall'input di testo che dalla scansione del QR code
    const hashedUserId = hashUserId(userId);
    try {
        const user = await User.findOne({ userId: hashedUserId });
        if (!user) {
            return res.render('error', { message: 'Utente non trovato' });
        }

        const data = await Data.find({ userId: hashedUserId }).sort('timestamp');

        console.log('Dati grezzi dal database:', data);

        const organizedData = {
            heartRate: [],
            steps: [],
            calories: [],
            altitude: [],
            workouts: [],
            gpsData: []
        };

        let currentWorkout = null;
        let lastStepCount = 0;
        let lastCalories = 0;

        data.forEach(entry => {
            const timestamp = moment(entry.timestamp).format('YYYY-MM-DD HH:mm:ss');
            
            if (entry.type === 'start') {
                currentWorkout = { start: timestamp, type: entry.value };
            } else if (entry.type === 'stop' && currentWorkout) {
                currentWorkout.end = timestamp;
                const start = moment(currentWorkout.start);
                const end = moment(timestamp);
                const duration = moment.duration(end.diff(start)).asMinutes();
                organizedData.workouts.push({
                    ...currentWorkout,
                    duration: duration.toFixed(2)
                });
                currentWorkout = null;
            } else {
                switch(entry.type) {
                    case 'heart_rate':
                        organizedData.heartRate.push({ x: timestamp, y: entry.value });
                        break;
                    case 'step_count':
                        const stepDiff = entry.value - lastStepCount;
                        if (stepDiff >= 0) {
                            organizedData.steps.push({ x: timestamp, y: stepDiff });
                            lastStepCount = entry.value;
                        }
                        break;
                    case 'calories':
                        const caloriesDiff = entry.value - lastCalories;
                        if (caloriesDiff >= 0) {
                            organizedData.calories.push({ x: timestamp, y: caloriesDiff });
                            lastCalories = entry.value;
                        }
                        break;
                    case 'altitude':
                        organizedData.altitude.push({ x: timestamp, y: entry.value });
                        break;
                    case 'gps':
                        if (typeof entry.value === 'object' && entry.value.lat && entry.value.lon) {
                            const lat = entry.value.lat;
                            const lon = entry.value.lon;
                            organizedData.gpsData.push({ lat, lng: lon, timestamp });
                        }
                        break;
                }
            }
        });

        console.log('Dati organizzati:', organizedData);
        console.log('Dati GPS ricevuti:', organizedData.gpsData);
        console.log('Dati passati al template:', { user, data: organizedData });

        res.render('dashboard', { user, data: organizedData });
    } catch (error) {
        console.error('Errore nel recupero dei dati:', error);
        res.render('error', { message: 'Errore nel recupero dei dati' });
    }
});

app.listen(port, () => {
    console.log(`Dashboard in ascolto sulla porta ${port}`);
});