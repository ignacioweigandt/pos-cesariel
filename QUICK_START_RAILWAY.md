# 🚀 Quick Start - Railway Deploy

## ⚡ TL;DR - 5 Pasos Rápidos

```bash
# 1. Generar secrets
python3 generate_secrets.py --all

# 2. Configurar en Railway Dashboard
# Backend → Variables → Copiar JWT_SECRET_KEY, CLOUDINARY_*

# 3. Esperar auto-deploy de Railway
# (Railway detecta el push a main automáticamente)

# 4. Aplicar migraciones
railway run -s backend alembic upgrade head

# 5. Verificar
curl https://tu-backend.up.railway.app/health
```

---

## 📋 Variables Críticas a Configurar

### Backend Service
```
JWT_SECRET_KEY=<generar>
CLOUDINARY_API_SECRET=<regenerar>
```

### Frontend Services
```
NEXT_PUBLIC_API_URL=https://tu-backend-url.up.railway.app
```

---

## ✅ Verificación Rápida

```bash
# Rate limiting funciona?
for i in {1..6}; do curl -X POST https://tu-api/auth/login -d "username=x&password=x"; done
# Debe dar 429 en el intento 6

# Migraciones aplicadas?
railway run -s backend alembic current
# Debe mostrar: e23e20872fc1 (head)

# Todo funcionando?
# ✅ Frontend carga
# ✅ Login funciona
# ✅ Ventas se crean
```

---

## 📚 Documentación Completa

- **Deploy detallado:** `RAILWAY_DEPLOY.md`
- **Checklist completo:** `DEPLOY_CHECKLIST.md`
- **Migraciones:** `backend/MIGRATIONS.md`
- **Secrets:** `SECRETS_MANAGEMENT.md`
- **Rate Limiting:** `backend/RATE_LIMITING.md`

---

## 🆘 Ayuda Rápida

**Backend no inicia?**
```bash
railway logs -s backend
# Buscar: "ModuleNotFoundError", "alembic"
```

**Frontend no conecta a API?**
```bash
# Verificar variable en Railway:
railway variables -s frontend
# NEXT_PUBLIC_API_URL debe apuntar al backend
```

**Rollback?**
```bash
railway rollback -s backend
```

---

**Railway Dashboard:** https://railway.app/dashboard  
**Repo GitHub:** https://github.com/ignacioweigandt/pos-cesariel
