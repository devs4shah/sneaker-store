# ProSneaker — Production Deployment Guide

This guide covers deploying the **Spring Boot backend** and the **Next.js frontend** to production.

---

## Architecture

```
[ Browser ] ──> [ Next.js frontend ]  ──HTTPS──>  [ Spring Boot backend ]  ──>  [ PostgreSQL ]
                                                          │
                                                          ├─> Razorpay (payments)
                                                          └─> Brevo SMTP (email)
```

- Frontend talks to the backend via `NEXT_PUBLIC_API_URL`.
- Backend allows the frontend origin via `CORS_ALLOWED_ORIGINS`.
- All secrets are injected as environment variables — nothing sensitive is committed.

---

## 1. Backend (Spring Boot)

### 1.1 Prerequisites
- Java 21
- A managed PostgreSQL database
- Razorpay live keys
- Brevo SMTP credentials

### 1.2 Environment variables
Set `SPRING_PROFILES_ACTIVE=prod` plus every variable from [`backend/.env.example`](backend/.env.example). In the `prod` profile these have **no defaults**, so a missing secret stops the app from starting (fail-fast).

| Variable | Purpose |
|----------|---------|
| `SPRING_PROFILES_ACTIVE` | Must be `prod` |
| `DATABASE_URL` | `jdbc:postgresql://host:5432/sneaker_store` |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | DB credentials |
| `JWT_SECRET` | Random 256-bit+ secret (`openssl rand -base64 48`) |
| `JWT_EXPIRATION_MS` / `JWT_REFRESH_EXPIRATION_MS` | Token lifetimes (optional) |
| `RAZORPAY_KEY` / `RAZORPAY_SECRET` | Razorpay live credentials |
| `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_FROM` | Brevo SMTP + sender |
| `CORS_ALLOWED_ORIGINS` | Deployed frontend origin(s), comma-separated |
| `STORAGE_UPLOAD_DIR` | Persistent uploads path (mount a volume) |

### 1.3 Build
```bash
cd backend
./mvnw clean package -DskipTests      # produces target/sneaker-store-backend-0.0.1-SNAPSHOT.jar
```

### 1.4 Run
```bash
export SPRING_PROFILES_ACTIVE=prod
# ... export the rest of the env vars ...
java -jar target/sneaker-store-backend-0.0.1-SNAPSHOT.jar
```

### 1.5 Docker (optional)
```dockerfile
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/sneaker-store-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
```
Pass env vars with `--env-file backend/.env` and mount a volume for `STORAGE_UPLOAD_DIR`.

### 1.6 Health check
The platform probe / load balancer should hit:
```
GET /actuator/health      ->  {"status":"UP"}
```
This endpoint is public (no auth) and also exposes liveness/readiness probes at
`/actuator/health/liveness` and `/actuator/health/readiness`.

### 1.7 Logging
- `local` profile: readable console logs, app at `DEBUG`.
- `prod` profile: console + rolling file (`LOG_FILE`, default `/var/log/prosneaker/backend.log`), framework at `WARN/INFO`. See `backend/src/main/resources/logback-spring.xml`. Tune with `LOG_LEVEL_ROOT` / `LOG_LEVEL_APP`.

### 1.8 Database schema
`JPA_DDL_AUTO=update` lets Hibernate create/extend tables on first boot. For stricter control set it to `validate` and manage migrations separately.

---

## 2. Frontend (Next.js)

### 2.1 Prerequisites
- Node.js 20+

### 2.2 Environment variables
Set in your host (Vercel/Netlify/etc.) or `.env.local`. See [`frontend/.env.example`](frontend/.env.example).

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Deployed backend base URL, e.g. `https://api.your-domain.com` |
| `NEXT_PUBLIC_RAZORPAY_KEY` | Razorpay public key id (matches backend `RAZORPAY_KEY`) |

> `next.config.ts` derives the allowed remote image host from `NEXT_PUBLIC_API_URL`, so backend-served images load automatically.

### 2.3 Build & run
```bash
cd frontend
npm ci
npm run build
npm run start            # serves the production build on port 3000
```
On Vercel/Netlify the build command is `npm run build` and env vars are set in the dashboard.

---

## 3. Go-live checklist

- [ ] Backend running with `SPRING_PROFILES_ACTIVE=prod` and all secrets set.
- [ ] `GET /actuator/health` returns `UP`.
- [ ] `CORS_ALLOWED_ORIGINS` equals the exact frontend origin (scheme + host, no trailing slash).
- [ ] `NEXT_PUBLIC_API_URL` points at the backend over HTTPS.
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY` matches backend `RAZORPAY_KEY` (both live, or both test).
- [ ] Register/login works (JWT issued).
- [ ] Product catalog loads and images render.
- [ ] Checkout + Razorpay payment completes; order email is received.
- [ ] Admin dashboards (orders, inventory, coupons, analytics) load.
- [ ] Uploads directory is on persistent storage.

---

## 4. Secret rotation

1. Update the value in your secret store / hosting dashboard.
2. Restart the backend (and redeploy frontend if a `NEXT_PUBLIC_*` value changed — these are baked in at build time).
3. Rotating `JWT_SECRET` invalidates all existing tokens (users must log in again).
