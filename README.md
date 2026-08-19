# MrExpenser

MrExpenser is a progressive web application (PWA) designed to make tracking daily personal expenses extremely fast and easy for Persian-speaking users. It allows users to manually submit expenses, use AI-powered voice commands to record expenses, and provides simple monthly reporting to track spending.

## 1. Technologies Used
* **Frontend:** React (v19), TypeScript, Vite, Tailwind CSS (v4), shadcn/ui
* **Backend:** Express, Node.js (for AI/Admin operations)
* **Database & Auth:** Firebase (Authentication, Firestore)
* **AI:** Google GenAI SDK (Gemini 2.5 Flash)

## 2. Project Structure
- `src/`: Frontend React application
  - `components/ui/`: shadcn UI components
  - `components/expenses/`, `components/reports/`, `components/layout/`: Feature components
  - `contexts/`: React context (e.g., AuthContext)
  - `lib/`: Utility functions (dates, numbers, firestore wrappers)
  - `pages/`: Route pages (Add Expense, Monthly Report, Login, Admin)
  - `types/`: Zod schemas and TS types
- `server/`: Express backend for secure API endpoints (Voice parsing, Admin tools)
- `public/`: Static assets and PWA icons

## 3. Installation
Ensure you have Node.js (v22+) installed.
```bash
npm install
```

## 4. Configure Firebase
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Register a Web App and copy the configuration snippet.

## 5. Enable Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**.
2. Enable **Email/Password** provider.

## 6. Configure Firestore
1. In Firebase Console, go to **Firestore Database** and click **Create database**.
2. Start in production mode (we will configure rules later).
3. Set the region close to your user base.

## 7. Deploy Security Rules
MrExpenser provides a `firestore.rules` file to restrict data access.
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Init and select your project: `firebase init firestore`
4. Deploy the rules:
```bash
firebase deploy --only firestore:rules
```

## 8. Create Indexes
To efficiently load monthly expenses, a Firestore index is required.
Deploy the indexes using the provided `firestore.indexes.json`:
```bash
firebase deploy --only firestore:indexes
```

## 9. API Keys & Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in all variables:
- `VITE_FIREBASE_*`: Your Firebase client config
- `GEMINI_API_KEY`: Get one from [Google AI Studio](https://aistudio.google.com/)
- `FIREBASE_SERVICE_ACCOUNT_KEY`: In Firebase Console, go to **Project settings** > **Service accounts** > **Generate new private key**. Minify/Stringify the JSON file and paste it here. Example: `{"type":"service_account","project_id":"..."}`

## 10. Admin Configuration
To promote an account to an Admin (allowing them to edit global categories):
1. Sign up a user normally via the app UI.
2. Go to Firebase Console > Authentication, find the user's `UID`.
3. Use a Firebase admin script or Cloud Function to set `customClaims: { admin: true }` for that `UID`.

## 11. Run Locally
The dev command uses `concurrently` to run both Vite (frontend) and Express (backend).
```bash
npm run dev
```
Open `http://localhost:5173`.

## 12. Build for Production
```bash
npm run build
```
This bundles the frontend into the `dist/` folder and generates the PWA service workers.

## 13. Test PWA Installation
1. Run a local static server over the build output, or use `npm run preview`.
2. Open it in Chrome or Safari (on mobile/desktop).
3. You should see an "Install App" or "Add to Home Screen" option in the browser menu.

## 14. Deploy
You can deploy the `dist/` folder to Firebase Hosting:
```bash
firebase deploy --only hosting
```
Deploy the `server/` app to Google Cloud Run, Render, or any Node.js hosting. Remember to update the frontend `proxy` or API URLs to point to your deployed backend URL.

## 15. Troubleshooting
- **AI Voice Fails:** Check if `GEMINI_API_KEY` is valid and your Express server is running.
- **Firebase Permission Denied:** Ensure your `firestore.rules` are deployed and the user is logged in.
- **No Categories Showing:** Categories are fetched from Firestore (`categories` collection). An admin needs to create them first via the admin panel (or you can seed them manually in Firebase Console).