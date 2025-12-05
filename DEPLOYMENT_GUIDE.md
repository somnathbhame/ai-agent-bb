# 🚀 Deployment Guide - Bingo AI Agents Platform

## Overview
This guide will help you deploy your website to live URLs that you can share in any portal.

---

## 📦 **PART 1: Deploy Backend to Render (5 minutes)**

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended) or email
3. Free tier is sufficient

### Step 2: Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository or select **"Public Git repository"**
3. If using public Git, enter: `https://github.com/YOUR_USERNAME/sticker-book` (or upload code)
4. Configure:
   - **Name**: `bingo-ai-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

### Step 3: Add Environment Variables
1. In Render dashboard, go to your service → **Environment**
2. Add these variables:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (from your .env file)
3. Click **Save**

### Step 4: Get Backend URL
1. Wait for deployment to finish (2-3 minutes)
2. Copy the URL (looks like: `https://bingo-ai-backend.onrender.com`)
3. **Save this URL** - you'll need it for frontend!

---

## 📦 **PART 2: Deploy Frontend to Vercel (3 minutes)**

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)
3. Free tier is sufficient

### Step 2: Deploy Frontend
1. Click **"Add New..."** → **"Project"**
2. Import your repository or upload code
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variable
1. Before deploying, click **"Environment Variables"**
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: Your Render backend URL (from Part 1, Step 4)
   - Example: `https://bingo-ai-backend.onrender.com`
3. Click **"Deploy"**

### Step 4: Get Your Live URL
1. Wait for deployment (1-2 minutes)
2. Your website is live! URL looks like: `https://your-project.vercel.app`
3. Click the URL to visit your live website

---

## 🎯 **YOUR LIVE WEBSITE IS READY!**

### ✅ What You Have:
- **Frontend URL**: `https://your-project.vercel.app`
- **Backend URL**: `https://bingo-ai-backend.onrender.com`
- **Public Access**: Anyone can visit your frontend URL

### 🔗 Share Your Website:
Copy your Vercel URL and add it to any portal, presentation, or share it directly!

---

## 🔧 **Alternative: Netlify (Instead of Vercel)**

If you prefer Netlify:

1. Go to https://netlify.com
2. Click **"Add new site"** → **"Deploy manually"**
3. Drag and drop your `/frontend/dist` folder
4. In **Site settings** → **Environment variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL
5. Trigger redeploy

---

## 📱 **Quick Deploy Summary**

```bash
# Backend (Render):
✅ Upload backend folder
✅ Add OPENAI_API_KEY
✅ Copy backend URL

# Frontend (Vercel):
✅ Upload frontend folder
✅ Add VITE_API_URL with backend URL
✅ Copy frontend URL

# Done! Share your frontend URL
```

---

## 🐛 **Troubleshooting**

### Issue: CORS errors
- Make sure backend is deployed first
- Verify frontend has correct `VITE_API_URL`
- Check backend CORS settings allow your frontend domain

### Issue: AI Guide not working
- Check backend environment has `OPENAI_API_KEY`
- Verify API key is valid
- Check backend logs in Render dashboard

### Issue: Game data not loading
- Verify backend URL is accessible
- Check Network tab in browser dev tools
- Ensure backend is not sleeping (Render free tier sleeps after inactivity)

---

## 🔄 **Updating Your Website**

### Update Frontend:
1. Make changes locally
2. Run `npm run build` in frontend folder
3. In Vercel: Push to GitHub (auto-deploys) or redeploy manually

### Update Backend:
1. Make changes to backend files
2. Push to GitHub (Render auto-deploys) or upload files to Render

---

## 💰 **Cost Breakdown**

- **Render (Backend)**: $0/month (Free tier - sleeps after inactivity)
- **Vercel (Frontend)**: $0/month (Free tier - 100GB bandwidth)
- **Total**: **FREE** ✨

### Optional Upgrades:
- Render Starter ($7/month) - Never sleeps, faster
- Vercel Pro ($20/month) - More bandwidth, analytics
- Custom domain ($10-15/year) - Use your own domain name

---

## 🎉 **Success Checklist**

✅ Backend deployed to Render  
✅ Frontend deployed to Vercel  
✅ Environment variables configured  
✅ Website loads without errors  
✅ AI agents work  
✅ Games dashboard loads  
✅ AI voice guide responds  

**Your website is production-ready! 🚀**
