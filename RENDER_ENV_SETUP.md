# Render Environment Variables Setup Guide

## ⚠️ CRITICAL: Step-by-Step Instructions

### Step 1: Access Your Service
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Log in to your account
3. Find and **click** on your `clinic-os-backend` service (or whatever you named it)

### Step 2: Navigate to Environment Tab
1. In the left sidebar, look for **"Environment"** or **"Environment Variables"**
2. **Click** on it
3. You should see a list of existing environment variables (if any)

### Step 3: Add SMTP_EMAIL Variable
1. Click the **"Add Environment Variable"** or **"Add Variable"** button
2. In the **KEY** field, type **exactly**: `SMTP_EMAIL`
   - Must be all uppercase
   - Must have underscore (_), not hyphen (-)
   - No spaces before or after
3. In the **VALUE** field, enter your Gmail address:
   - Example: `yourname@gmail.com`
   - No quotes needed
   - No spaces
4. Click **"Save"** or **"Add"**
5. Wait for the confirmation message

### Step 4: Add SMTP_APP_PASSWORD Variable
1. Click **"Add Environment Variable"** again
2. In the **KEY** field, type **exactly**: `SMTP_APP_PASSWORD`
   - Must be all uppercase
   - Must have underscores (_)
   - No spaces
3. In the **VALUE** field, enter your 16-character Gmail App Password:
   - Should look like: `abcd efgh ijkl mnop` (but enter WITHOUT spaces)
   - Should be exactly 16 characters
   - No quotes, no spaces
   - Example: `abcdefghijklmnop`
4. Click **"Save"** or **"Add"**
5. Wait for the confirmation message

### Step 5: Verify Both Variables Are Listed
You should now see in the Environment Variables list:
- ✅ `SMTP_EMAIL` = `yourname@gmail.com`
- ✅ `SMTP_APP_PASSWORD` = `(hidden or shown)`
- `PORT` = `10000` (or auto-set)
- `NODE_ENV` = `production` (or auto-set)

**IMPORTANT:** If you don't see both `SMTP_EMAIL` and `SMTP_APP_PASSWORD` in the list, they weren't saved. Try again.

### Step 6: Manually Trigger Redeploy
**Render does NOT automatically redeploy when you add environment variables!**

1. Still in your service dashboard
2. Look for one of these options:
   - **"Manual Deploy"** tab at the top
   - **"Events"** tab at the top
   - **"Deploy"** button in the top right
3. Click **"Deploy latest commit"** or **"Manual Deploy"**
4. Wait for deployment to complete (5-10 minutes)

### Step 7: Check Deployment Logs
1. After deployment starts, go to **"Logs"** tab
2. Look for the section that says:
   ```
   🔍 Environment check:
     SMTP_EMAIL: ✅ your-email@gmail.com
     SMTP_APP_PASSWORD: ✅ SET (***hidden***)
   ```
3. If you see `❌ NOT SET`, the variables are still not configured correctly

## Common Mistakes to Avoid

❌ **Wrong variable names:**
- `smtp_email` (should be `SMTP_EMAIL`)
- `SMTP_Email` (should be `SMTP_EMAIL`)
- `SMTPEMAIL` (should be `SMTP_EMAIL`)
- `SMTP_APP_PASS` (should be `SMTP_APP_PASSWORD`)

❌ **Adding quotes or spaces:**
- Value: `"yourname@gmail.com"` (don't include quotes)
- Value: ` yourname@gmail.com ` (no leading/trailing spaces)

❌ **Not redeploying:**
- Adding variables without manually triggering redeploy

❌ **Setting in wrong place:**
- Setting variables in the build settings instead of Environment tab
- Setting variables for the wrong service

## Verification Checklist

Before asking for help, verify:
- [ ] You're logged into the correct Render account
- [ ] You're looking at the correct service (the one that's failing)
- [ ] Both `SMTP_EMAIL` and `SMTP_APP_PASSWORD` appear in the Environment Variables list
- [ ] Variable names are exactly `SMTP_EMAIL` and `SMTP_APP_PASSWORD` (case-sensitive)
- [ ] Values don't have quotes or extra spaces
- [ ] You clicked Save/Add after entering each variable
- [ ] You manually triggered a redeploy after adding variables
- [ ] You waited for the deployment to complete
- [ ] You checked the logs to verify variables are being read

## Still Not Working?

If you've verified all the above and it's still not working:

1. **Try deleting and re-adding the variables:**
   - Delete `SMTP_EMAIL` (click the trash icon)
   - Delete `SMTP_APP_PASSWORD`
   - Add them again following the exact steps above
   - Redeploy

2. **Check if variables are in a different service:**
   - Make sure you're editing the service that's actually being deployed
   - Check if you have multiple services with similar names

3. **Contact Render Support:**
   - Sometimes there can be caching issues
   - Render support can verify if variables are actually set in their system

