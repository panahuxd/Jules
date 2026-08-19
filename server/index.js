import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

// Initialize Firebase Admin
if (!admin.apps || !admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    if (Object.keys(serviceAccount).length > 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.warn('Firebase Admin SDK not initialized. No service account found.');
    }
  } catch (err) {
    console.warn('Firebase Admin SDK not initialized correctly. Ensure FIREBASE_SERVICE_ACCOUNT_KEY is set in .env');
  }
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying auth token', error);
    res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};

app.post('/api/ai/extract-expense', verifyToken, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { categories } = req.body;
    let categoriesList = [];
    try {
      categoriesList = JSON.parse(categories || '[]');
    } catch (e) {
      console.warn('Could not parse categories list');
    }

    const categoryContext = categoriesList.map(c => `- ${c.nameFa} (ID: ${c.id})`).join('\n');

    const prompt = `You are a Persian-language personal expense tracking assistant.
Listen to the audio recording and extract the expense information based on the user's speech.

Rules:
1. Input language is primarily Persian. Understand Persian spoken numbers and currencies (e.g. تومان, تومن).
2. Convert the final amount into an integer number of Tomans. (If user says 100 hezartoman, convert to 100000).
3. Try to match the expense to one of the following active categories:
${categoryContext}
If no suitable category matches, or it's completely ambiguous, fallback to "سایر" if available, or return null for categoryId.
4. If title is unclear, create a short reasonable title (e.g. "تاکسی").
5. Return strictly valid JSON using the provided schema. Do not add markdown blocks or backticks.
6. Never fabricate missing financial values. If amount is unclear, return null for amountToman.`;

    // We can use the File API of GenAI SDK to upload the file
    const uploadResult = await ai.files.upload({
      file: req.file.path,
      mimeType: req.file.mimetype || 'audio/webm',
    });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { role: 'user', parts: [{ text: prompt }, { fileData: { fileUri: uploadResult.uri, mimeType: uploadResult.mimeType } }] }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', nullable: true },
            amountToman: { type: 'INTEGER', nullable: true },
            categoryId: { type: 'STRING', nullable: true },
            description: { type: 'STRING', nullable: true },
            uncertainFields: { type: 'ARRAY', items: { type: 'STRING' } },
            interpretationNote: { type: 'STRING', nullable: true }
          }
        }
      }
    });

    // Delete the file from Google AI Studio to save space & respect privacy
    try {
       await ai.files.delete({ name: uploadResult.name });
    } catch(err) {
       console.error('Failed to clean up audio file from Google API', err);
    }

    // Clean up local temp file
    const fs = await import('fs');
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete temp file:', err);
    });

    const resultText = response.text();
    const resultObj = JSON.parse(resultText);

    res.json(resultObj);
  } catch (error) {
    console.error('Error extracting expense:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

// Admin Bootstrap (Check if user should be an admin)
app.post('/api/auth/bootstrap-admin', verifyToken, async (req, res) => {
  try {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const userEmail = req.user.email?.toLowerCase();

    if (adminEmails.includes(userEmail)) {
      await admin.auth().setCustomUserClaims(req.user.uid, { admin: true });
      return res.json({ message: 'Admin claims granted. Please sign in again.' });
    }

    res.json({ message: 'Not an admin.' });
  } catch (error) {
    console.error('Error bootstrapping admin:', error);
    res.status(500).json({ error: 'Failed to process admin bootstrap' });
  }
});

// Admin endpoints
const verifyAdmin = async (req, res, next) => {
  if (!req.user || !req.user.admin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

app.get('/api/admin/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers(100);
    res.json({ users: listUsersResult.users });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

app.get('/api/admin/categories', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('categories').orderBy('sortOrder', 'asc').get();
    const categories = [];
    snapshot.forEach(doc => categories.push({ id: doc.id, ...doc.data() }));
    res.json(categories);
  } catch (error) {
    console.error('Error listing categories:', error);
    res.status(500).json({ error: 'Failed to list categories' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
