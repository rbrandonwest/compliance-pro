# 🚀 Deployment Guide: ComplianceFlow

Follow these steps to deploy your application to Vercel so your partner can access it.

## 1. Database Setup (Cloud)
Since your local database (`localhost`) won't work on the cloud, you need a cloud Postgres database. **Vercel Postgres** is the easiest option.

### Option A: Create during Vercel Import (Recommended)
You can create the database directly when you import the project in Vercel (Step 3).

### Option B: Use Neon / Supabase / Railway
If you prefer another provider, create a Postgres database there and get the `DATABASE_URL` (Transaction) and optionally `DIRECT_URL` (Session).

---

## 2. Push to GitHub
1.  Create a new repository on [GitHub](https://github.com/new) named `compliance-flow`.
2.  Push your code:
    ```bash
    git init
    git add .
    git commit -m "Initial deploy"
    git branch -M main
    git remote add origin https://github.com/<YOUR_USERNAME>/compliance-flow.git
    git push -u origin main
    ```

---

## 3. Deploy to Vercel
1.  Log in to [Vercel](https://vercel.com).
2.  Click **"Add New..."** -> **"Project"**.
3.  **Import** your `compliance-flow` repository.
4.  **Configure Project**:
    *   **Framework Preset**: Next.js (Default)
    *   **Root Directory**: `./` (Default)
5.  **Environment Variables**:
    Copy and paste these values into the "Environment Variables" section. 
    *(Use your real cloud DB URL and Stripe keys)*

    | Key | Value | Description |
    | :--- | :--- | :--- |
    | `NEXTAUTH_URL` | `https://<YOUR-PROJECT>.vercel.app` | **Update this after deploy** (or use the Vercel URL provided). |
    | `NEXTAUTH_SECRET` | `(Generate a random string)` | Run `openssl rand -base64 32` to generate. |
    | `NEXT_PUBLIC_APP_URL` | `https://<YOUR-PROJECT>.vercel.app` | Same as above. |
    | `STRIPE_SECRET_KEY` | `sk_test_...` | Your Stripe Secret Key. |
    | `STRIPE_WEBHOOK_SECRET` | `whsec_...` | **Important**: You need a NEW key for production/preview. (See Step 4). |
    | `STRIPE_ACCOUNT_ID` | `(Optional if using Test Key)` | Only needed if using Org keys. |

6.  **Database Connection**:
    *   If using **Vercel Postgres**, click "Storage" on the sidebar after deploy and "Connect". It will auto-populate `POSTGRES_URL`, etc.
    *   If using external, add `DATABASE_URL`.

7.  Click **"Deploy"**.

---

## 4. Post-Deployment Setup
1.  **Database Migration**:
    *   Vercel might not run migrations automatically. You can add a build command or use the Vercel Console.
    *   **Best way**: Connect your local machine to the **Cloud DB** temporarily and run:
        ```bash
        # Update .env locally to the CLOUD DATABASE_URL
        npx prisma migrate deploy
        npx prisma db seed # If you want the default Admin/User
        ```
2.  **Stripe Webhooks**:
    *   Go to Stripe Dashboard -> **Developers** -> **Webhooks**.
    *   Add Endpoint: `https://<YOUR-VERCEL-DOMAIN>.vercel.app/api/webhooks/stripe`
    *   Events: `checkout.session.completed`
    *   Update `STRIPE_WEBHOOK_SECRET` in Vercel Settings with the new secret (starts with `whsec_`).
    *   **Redeploy** (Go to Deployments -> Redeploy) to apply changes.

## 5. Share
Send the link `https://compliance-flow.vercel.app` to your partner!
