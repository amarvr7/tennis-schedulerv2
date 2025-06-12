# First Steps After Cloning Boilerplate

This guide will help you set up your new project after cloning this boilerplate. **Delete this file after completing these steps.**

## 1. Reset Git Repository

Reset Git history to start fresh:

```bash
# Remove existing Git history
rm -rf .git

# Initialize new Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit from boilerplate"
```

## 2. Connect to Your Own Repository

```bash
# Add your new remote repository
git remote add origin <your-repository-url>

# Push to your repository
git push -u origin main
```

## 3. Update Project Information

- Edit `package.json`:
  - Update "name"
  - Update "version"
  - Update "description"
  - Update "author" (optional)

- Customize `README.md` with your project details

## 4. Install Dependencies

```bash
npm install
```

## 5. Setup Firebase

This boilerplate includes Firebase for authentication:

1. Create a new Firebase project at https://console.firebase.google.com/
2. Add a web app to your Firebase project
3. Create a `.env.local` file with your Firebase config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 6. Start Development Server

```bash
npm run dev
```

## 7. Delete This File

Once you've completed the setup process, delete this guide:

```bash
rm FIRST_STEPS.md
``` 