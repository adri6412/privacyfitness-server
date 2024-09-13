const mongoose = require('mongoose');

// Schema per i dati degli utenti
const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    gender: { type: String, required: true },
    isMonitoringStarted: { type: Boolean, default: false }
});

// Schema per i dati delle attività
const DataSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    timestamp: { type: Date, required: true, index: true },
    workout: { type: String, required: true },
    workoutStartTime: Date,
    workoutEndTime: Date
});

// Indice composto per ottimizzare le query
DataSchema.index({ userId: 1, timestamp: -1 });

const User = mongoose.model('User', UserSchema);
const Data = mongoose.model('Data', DataSchema);

module.exports = { User, Data };
