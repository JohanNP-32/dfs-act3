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
Instalar las librerías de Node.js (como Express, bcrypt, jwt). Abrir la terminal en la carpeta del proyecto (api-tareas) y ejecute:

```bash
npm install
```

```bash
npm install express body-parser jsonwebtoken bcryptjs
```

```bash
npm install cors
```

---

## Correr el servidor
```bash
node server.js
```

---

## Entrar a la pagina Login
Una vez abierta la pagina web del localhost3000, agregar un "/login.html", para poder acceder a la pagina correcta
