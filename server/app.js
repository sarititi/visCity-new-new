import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
dotenv.config();

import authRoutes      from './routes/authRoutes.js';
import placeRoutes     from './routes/placeRoute.js';
import userRoutes      from './routes/userRoutes.js';
import itineraryRoutes from './routes/itineraryRoute.js';
import { initSocket } from './services/socketManager.js';
import { ROUTE_NOT_FOUND, INTERNAL_SERVER_ERROR, STALE_SESSION } from './const/errorConst.js';


//אני מייבאת מהראוט את המודל לשים לב אם זה צריך לעבור דרך הסרוויס
//ליצור אודיו ולבדוק את המדיה
//בנבבר למחוק את האופציה של אדמין 1 - להגדיר ישירות בDB את האדמין עם רול אדמין
//סינונים
//מפות חיות

const app = express();
const httpServer = createServer(app);

initSocket(httpServer);

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
 
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/auth',      authRoutes);
app.use('/places',    placeRoutes);
app.use('/user',      userRoutes); 
app.use('/itinerary', itineraryRoutes);

app.use((req, res) => {
    res.status(ROUTE_NOT_FOUND.status).json({ error: ROUTE_NOT_FOUND.message });
});

app.use((err, req, res, next) => {
    console.error(err.stack);

    // שגיאות "מוכרות" שנזרקות בכוונה מהשירותים/הקונטרולרים מגיעות עם status
    // ועם הודעה בטוחה להצגה למשתמש.
    if (err.status) {
        return res.status(err.status).json({ error: err.message });
    }

    // הפרת מפתח זר — לרוב כשה-user_id שב-JWT לא קיים יותר בטבלת users
    // (לדוגמה אחרי איפוס/יצירה מחדש של ה-DB עם session ישן בדפדפן).
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
        return res.status(STALE_SESSION.status).json({ error: STALE_SESSION.message });
    }

    // כל שגיאה אחרת היא לא צפויה — לא חושפים פרטי DB/פנימיים ללקוח.
    res.status(INTERNAL_SERVER_ERROR.status).json({
        error: INTERNAL_SERVER_ERROR.message
    });
});



const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
