# Actividad 3

## 📋 Características Principales

* **API RESTful:** Endpoints para crear, leer, actualizar y eliminar (CRUD) órdenes.
* **Seguridad:**
    * Encriptación de contraseñas con `bcryptjs`.
    * Autenticación mediante Tokens `JWT`.
    * Middleware de protección de rutas.
* **Persistencia:** Uso de `fs.promises` para guardar datos en archivos JSON locales.
* **Roles:** Diferenciación entre **Admin** (acceso total) y **Empleado** (acceso restringido).

---

## 🚀 Guía de Instalación y Ejecución

### 1. Instalar dependencias
El proyecto necesita instalar las librerías de Node.js (como Express, bcrypt, jwt). Abra la terminal en la carpeta del proyecto y ejecute:

```bash
npm install
```

```bash
npm install express body-parser jsonwebtoken bcryptjs.
```
