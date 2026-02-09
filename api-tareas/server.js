const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises; 
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET_KEY = "mi_secreto_super_seguro"; 

// Rutas de archivos
const TAREAS_FILE = path.join(__dirname, 'data', 'tareas.json');
const USUARIOS_FILE = path.join(__dirname, 'data', 'usuarios.json');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

const readFile = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeFile = async (filePath, data) => {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};


// Middleware de Autenticación
const verificarToken = (req, res, next) => {
    const headerAuth = req.headers['authorization']; 
    
    if (!headerAuth) {
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    const token = headerAuth.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Formato de token inválido' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }
        req.user = decoded;
        next();
    });
};


app.post('/register', async (req, res, next) => {
    try {
        const { username, password, nombre, role } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Faltan datos' });
        }

        const usuarios = await readFile(USUARIOS_FILE);

        if (usuarios.find(u => u.username === username)) {
            return res.status(409).json({ message: 'El usuario ya existe' });
        }

        // Encriptar contraseña con bcryptjs
        const hashedPassword = await bcrypt.hash(password, 10);

        const nuevoUsuario = {
            username,
            password: hashedPassword, 
            nombre: nombre || username,
            role: role || 'employee' 
        };

        usuarios.push(nuevoUsuario);
        await writeFile(USUARIOS_FILE, usuarios);

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        next(error); 
    }
});


app.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const usuarios = await readFile(USUARIOS_FILE);
        
        const user = usuarios.find(u => u.username === username);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Contraseña encriptada
        const passwordValida = await bcrypt.compare(password, user.password);

        if (!passwordValida) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Generar Token
        const token = jwt.sign(
            { username: user.username, role: user.role, nombre: user.nombre }, 
            SECRET_KEY, 
            { expiresIn: '2h' }
        );

        res.json({ message: 'Login exitoso', token, role: user.role, nombre: user.nombre });
    } catch (error) {
        next(error);
    }
});


// Ruta con verificarToken
app.get('/tareas', verificarToken, async (req, res, next) => {
    try {
        const tareas = await readFile(TAREAS_FILE);
        res.json(tareas);
    } catch (error) {
        next(error);
    }
});

app.post('/tareas', verificarToken, async (req, res, next) => {
    try {
        const { titulo, descripcion, asignado } = req.body;
        const tareas = await readFile(TAREAS_FILE);
        
        const nuevaTarea = {
            id: Date.now(),
            titulo,
            descripcion,
            estado: 'pendiente',
            creador: req.user.nombre,
            asignado: asignado || 'Sin asignar',
            fechaCreacion: new Date().toLocaleString(),
            fechaRealizacion: 'Pendiente'
        };

        tareas.push(nuevaTarea);
        await writeFile(TAREAS_FILE, tareas);
        res.status(201).json(nuevaTarea);
    } catch (error) {
        next(error);
    }
});

app.put('/tareas/:id', verificarToken, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { titulo, descripcion, estado, asignado } = req.body;
        let tareas = await readFile(TAREAS_FILE);
        
        const index = tareas.findIndex(t => t.id === id);

        if (index !== -1) {
            if(titulo) tareas[index].titulo = titulo;
            if(descripcion) tareas[index].descripcion = descripcion;
            if(estado) {
                tareas[index].estado = estado;
                if (estado === 'completada') tareas[index].fechaRealizacion = new Date().toLocaleString();
            }
            if(asignado) tareas[index].asignado = asignado;

            await writeFile(TAREAS_FILE, tareas);
            res.json(tareas[index]);
        } else {
            // 404
            res.status(404).json({ message: 'Tarea no encontrada' });
        }
    } catch (error) {
        next(error);
    }
});

app.delete('/tareas/:id', verificarToken, async (req, res, next) => {
    try {
        // Solo admin puede eliminar ordenes
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Requiere privilegios de administrador' });
        }

        const id = parseInt(req.params.id);
        let tareas = await readFile(TAREAS_FILE);
        const nuevasTareas = tareas.filter(t => t.id !== id);
        
        if (tareas.length === nuevasTareas.length) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        await writeFile(TAREAS_FILE, nuevasTareas);
        res.json({ message: 'Eliminado correctamente' });
    } catch (error) {
        next(error);
    }
});

app.get('/usuarios', verificarToken, async (req, res, next) => {
    try {
        const usuarios = await readFile(USUARIOS_FILE);
        const lista = usuarios.map(u => ({ username: u.username, nombre: u.nombre }));
        res.json(lista);
    } catch (error) {
        next(error);
    }
});

// --- MIDDLEWARE MANEJO DE ERRORES GLOBAL ---
app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).json({ 
        message: 'Ocurrió un error interno en el servidor',
        error: err.message 
    });
});

// --- 404  ---
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    // Instrucción para debugging
    console.log('Para depurar, ejecuta: node --inspect server.js');
});