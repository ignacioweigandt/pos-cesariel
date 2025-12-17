# Nginx Configuration

Esta carpeta contiene la configuración de Nginx como reverse proxy para el sistema POS Cesariel.

## Estructura

```
nginx/
├── nginx.conf          # Configuración principal de Nginx
├── ssl/               # Certificados SSL (NO subir a git)
│   ├── certificate.crt
│   └── private.key
└── README.md          # Este archivo
```

## Configuración SSL/TLS

### Opción 1: Let's Encrypt (Recomendado para producción)

```bash
# Instalar certbot
sudo apt-get install certbot

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com -d www.tu-dominio.com

# Los certificados se generarán en:
# /etc/letsencrypt/live/tu-dominio.com/fullchain.pem
# /etc/letsencrypt/live/tu-dominio.com/privkey.pem

# Copiar a la carpeta ssl/
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ./ssl/certificate.crt
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ./ssl/private.key

# Configurar renovación automática
sudo certbot renew --dry-run
```

### Opción 2: Certificado Auto-firmado (Solo para desarrollo)

```bash
# Generar certificado auto-firmado
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./ssl/private.key \
  -out ./ssl/certificate.crt \
  -subj "/C=UY/ST=Montevideo/L=Montevideo/O=POS Cesariel/CN=localhost"
```

**⚠️ Advertencia**: Los certificados auto-firmados NO deben usarse en producción. Los navegadores mostrarán advertencias de seguridad.

### Opción 3: Certificado de Proveedor

Si tienes certificados de un proveedor (GoDaddy, Namecheap, etc.):

1. Descarga el certificado y la clave privada
2. Copia los archivos a:
   - `ssl/certificate.crt` (certificado + cadena de certificados)
   - `ssl/private.key` (clave privada)

## Activar HTTPS

Una vez que tengas los certificados:

1. Edita `nginx.conf`
2. Descomenta la sección del servidor HTTPS (líneas marcadas con comentarios)
3. Actualiza `server_name` con tu dominio
4. Redeploy: `make deploy-prod`

## Configuración de Dominios

### Desarrollo Local

Por defecto, la configuración acepta cualquier dominio (`server_name _`).

### Producción

Actualiza `nginx.conf` con tu dominio real:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;

    # ... resto de la configuración ...
}
```

## Estructura de URLs

La configuración actual mapea:

- `/` → E-commerce Frontend (puerto 3001)
- `/admin/` → POS Admin Frontend (puerto 3000)
- `/api/` → Backend API (puerto 8000)
- `/ws/` → WebSocket del Backend
- `/health` → Health check endpoint

## Testing

### Verificar Configuración

```bash
# Verificar sintaxis
docker compose -f docker-compose.production.yml exec nginx nginx -t

# Recargar configuración
docker compose -f docker-compose.production.yml exec nginx nginx -s reload
```

### Test SSL

```bash
# Test de SSL (si está configurado)
openssl s_client -connect tu-dominio.com:443 -servername tu-dominio.com

# Test con curl
curl -I https://tu-dominio.com
```

## Seguridad

### Headers de Seguridad Recomendados

Considera agregar estos headers en `nginx.conf`:

```nginx
# Headers de seguridad
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### SSL Best Practices

```nginx
# Protocolos SSL modernos
ssl_protocols TLSv1.2 TLSv1.3;

# Ciphers seguros
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers on;

# HSTS (HTTP Strict Transport Security)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
```

## Logs

Los logs de Nginx están disponibles en:

```bash
# Ver logs de acceso
docker compose -f docker-compose.production.yml logs nginx | grep access

# Ver logs de error
docker compose -f docker-compose.production.yml logs nginx | grep error
```

## Troubleshooting

### 502 Bad Gateway

Indica que Nginx no puede conectarse al backend.

```bash
# Verificar que el backend esté corriendo
docker compose -f docker-compose.production.yml ps backend

# Ver logs del backend
docker compose -f docker-compose.production.yml logs backend
```

### 404 Not Found

Verifica las rutas en `nginx.conf` y que los servicios estén respondiendo.

### Certificado SSL Inválido

```bash
# Verificar certificado
openssl x509 -in ssl/certificate.crt -text -noout

# Verificar clave privada
openssl rsa -in ssl/private.key -check
```

## Referencias

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
