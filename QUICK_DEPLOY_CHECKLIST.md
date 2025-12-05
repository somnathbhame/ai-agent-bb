# ⚡ Quick Deploy Checklist

## 🎯 Goal: Get your website live in ~10 minutes

---

## ☑️ **STEP 1: Deploy Backend (5 min)**

### Go to Render.com
- [ ] Create account at https://render.com (use GitHub)
- [ ] Click "New +" → "Web Service"

### Configure Service
- [ ] **Name**: `bingo-ai-backend`
- [ ] **Root Directory**: `backend`
- [ ] **Build Command**: `pip install -r requirements.txt`
- [ ] **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] **Free tier** selected

### Add Environment Variable
- [ ] Go to Environment tab
- [ ] Add: `OPENAI_API_KEY` = `[paste your OpenAI key]`
- [ ] Click Deploy

### Save Backend URL
- [ ] Wait for deploy to finish
- [ ] Copy URL: `https://__________.onrender.com`
- [ ] Write it down → You need it for Step 2!

---

## ☑️ **STEP 2: Deploy Frontend (5 min)**

### Go to Vercel.com
- [ ] Create account at https://vercel.com (use GitHub)
- [ ] Click "Add New..." → "Project"

### Configure Project
- [ ] **Root Directory**: `frontend`
- [ ] **Framework**: Vite
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `dist`

### Add Environment Variable
- [ ] Click "Environment Variables"
- [ ] Add: `VITE_API_URL` = `[paste backend URL from Step 1]`
- [ ] Click "Deploy"

### Get Your Live URL
- [ ] Wait for deploy (1-2 min)
- [ ] Copy URL: `https://__________.vercel.app`
- [ ] **This is your website URL! 🎉**

---

## ☑️ **STEP 3: Test & Share**

### Test Your Website
- [ ] Visit your Vercel URL
- [ ] Check home page loads
- [ ] Click "AI agents" → Select an agent
- [ ] Check final insights tabs work
- [ ] Click "Games" → Select a game
- [ ] Test AI voice guide (click 🎤 Ask AI Guide)

### Share Your URL
- [ ] Copy your Vercel URL
- [ ] Add to your portal/presentation
- [ ] Share with team/clients

---

## 📋 **IMPORTANT URLS**

```
Backend:  https://__________.onrender.com
Frontend: https://__________.vercel.app

↑ Fill these in as you deploy!
```

---

## ❗ **Troubleshooting**

### Website not loading?
1. Check backend deployed successfully in Render
2. Verify `VITE_API_URL` in Vercel matches backend URL
3. Check browser console for errors

### AI Guide not working?
1. Verify `OPENAI_API_KEY` is set in Render
2. Check backend logs in Render dashboard
3. Ensure API key is valid

### Backend slow on first load?
- Render free tier sleeps after 15 min
- First request wakes it up (takes 30-60 seconds)
- Consider upgrading to Starter ($7/mo) for always-on

---

## 🎉 **DONE!**

Your website is live and ready to present!

**Next Steps:**
- [ ] Add custom domain (optional)
- [ ] Share URL in portal
- [ ] Monitor usage in Vercel/Render dashboards

**Cost: $0/month** ✨
