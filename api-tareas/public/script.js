/* CARRITO DE COMPRAS */
// Elementos principales del DOM
const iconoCarrito = document.querySelector('.fa-bag-shopping').parentElement;
const contadorCarritoSpan = document.querySelector('.contadorCarrito');
const sidebar = document.getElementById('sidebarCarrito');
const fondoOscuro = document.getElementById('fondoOscuro');
const btnCerrar = document.getElementById('btnCerrarCarrito');
const contenedorItems = document.getElementById('itemsCarrito');
const precioTotalSpan = document.getElementById('precioTotal');
const cantidadTitulo = document.getElementById('cantidadCarrito');

// Array donde se guardan los productos del carrito
let carrito = [];


document.addEventListener('DOMContentLoaded', () => {
   
    cargarCarritoDeMemoria();
    actualizarVistaCarrito();

    // Botones para agregar productos
    const botonesAgregar = document.querySelectorAll('.btnAgregar');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.preventDefault();
            agregarProducto(boton);
            abrirCarrito();
        });
    });

    // Abre el carrito al hacer clic en el icono
    iconoCarrito.addEventListener('click', (e) => {
        e.preventDefault();
        abrirCarrito();
    });

    // Cierra el carrito
    if(btnCerrar) btnCerrar.addEventListener('click', cerrarCarrito);
    if(fondoOscuro) fondoOscuro.addEventListener('click', cerrarCarrito);

    // Elimina un producto del carrito
    contenedorItems.addEventListener('click', (e) => {
        if (e.target.classList.contains('btnEliminar')) {
            const id = parseInt(e.target.dataset.id);
            eliminarProducto(id);
        }
    });

    // Cambiar el tamaño del producto
    contenedorItems.addEventListener('change', (e) => {
        if (e.target.classList.contains('selectTamano')) {
            const id = parseInt(e.target.dataset.id);
            const valor = e.target.value;
            cambiarTamano(id, valor);
        }
    });
});

// Agregar un producto al carrito
const agregarProducto = (boton) => {
    const id = boton.getAttribute('data-id');
    const nombre = boton.getAttribute('data-nombre');
    const precioBase = parseFloat(boton.getAttribute('data-precio'));
    const imagen = boton.getAttribute('data-imagen');

    const nuevoProducto = {
        idUnico: Date.now(), 
        idProducto: id,
        nombre: nombre,
        precioBase: precioBase,
        precioFinal: precioBase,
        imagen: imagen,
        tamano: '50ml'
    };

    carrito.push(nuevoProducto);
    guardarCarritoEnMemoria();
    actualizarVistaCarrito();
};

// Elimina un producto por su ID 
const eliminarProducto = (idUnico) => {
    carrito = carrito.filter(producto => producto.idUnico !== idUnico);
    guardarCarritoEnMemoria();
    actualizarVistaCarrito();
};

// Cambia el tamaño y recalcula el precio
const cambiarTamano = (idUnico, nuevoTamano) => {
    const producto = carrito.find(p => p.idUnico === idUnico);

    if (producto) {
        producto.tamano = nuevoTamano;

        // Ajusta el precio según el tamaño
        if (nuevoTamano === '30ml') producto.precioFinal = producto.precioBase * 0.8;
        else if (nuevoTamano === '50ml') producto.precioFinal = producto.precioBase;
        else if (nuevoTamano === '100ml') producto.precioFinal = producto.precioBase * 1.4;

        guardarCarritoEnMemoria();
        actualizarVistaCarrito();
    }
};


const actualizarVistaCarrito = () => {
    contadorCarritoSpan.innerText = carrito.length;
    cantidadTitulo.innerText = carrito.length;
    contenedorItems.innerHTML = '';

    
    if (carrito.length === 0) {
        contenedorItems.innerHTML = '<p class="carritoVacio">Tu bolsa está vacía.</p>';
        precioTotalSpan.innerText = '$0.00';
        return;
    }

    let totalCalculado = 0;

   
    carrito.forEach(producto => {
        totalCalculado += producto.precioFinal;

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('itemCarrito');

        itemDiv.innerHTML = `
            <img src="${producto.imagen}" class="imgItemCarrito">
            <div class="infoItem">
                <h4>${producto.nombre}</h4>
                <div>$${producto.precioFinal.toFixed(2)}</div>

                <select class="selectTamano" data-id="${producto.idUnico}">
                    <option value="30ml" ${producto.tamano === '30ml' ? 'selected' : ''}>30 ML</option>
                    <option value="50ml" ${producto.tamano === '50ml' ? 'selected' : ''}>50 ML</option>
                    <option value="100ml" ${producto.tamano === '100ml' ? 'selected' : ''}>100 ML</option>
                </select>

                <button class="btnEliminar" data-id="${producto.idUnico}">Eliminar</button>
            </div>
        `;
        contenedorItems.appendChild(itemDiv);
    });

    precioTotalSpan.innerText = '$' + totalCalculado.toFixed(2);
};

// Abre el carrito
const abrirCarrito = () => {
    sidebar.classList.add('activo');
    fondoOscuro.classList.add('activo');
};

// Cierra el carrito
const cerrarCarrito = () => {
    sidebar.classList.remove('activo');
    fondoOscuro.classList.remove('activo');
};

// Guarda el carrito en localStorage
const guardarCarritoEnMemoria = () => {
    localStorage.setItem('carritoTomFord', JSON.stringify(carrito));
};

// Carga el carrito desde localStorage
const cargarCarritoDeMemoria = () => {
    const guardado = localStorage.getItem('carritoTomFord');
    if (guardado) carrito = JSON.parse(guardado);
};

/* WISHLIST */
// Elementos del wishlist
const inputRegalo = document.getElementById('inputRegalo');
const btnAgregarRegalo = document.getElementById('btnAgregarRegalo');
const listaRegalosUI = document.getElementById('listaRegalos');

// Clase Tarea
class Tarea {
    constructor(id, texto, completada = false) {
        this.id = id;
        this.texto = texto;
        this.completada = completada;
    }

    // Edita el texto de la tarea
    editarContenido(nuevoTexto) {
        this.texto = nuevoTexto;
    }
}

// Clase Gestor de Tareas
class GestorDeTareas {
    constructor() {
        this.tareas = [];
        this.cargarDeLocalStorage();
    }

    // Agrega una nueva tarea
    agregarTarea(texto) {
        if (texto.trim() === '') {
            alert("Please write something.");
            return;
        }

        this.tareas.push(new Tarea(Date.now(), texto));
        this.guardarEnLocalStorage();
        this.renderizar();
    }

    // Elimina una tarea
    eliminarTarea(id) {
        this.tareas = this.tareas.filter(t => t.id !== id);
        this.guardarEnLocalStorage();
        this.renderizar();
    }

    // Permite editar una tarea
    iniciarEdicion(id) {
        const li = document.getElementById(`regalo-${id}`);
        const spanTexto = li.querySelector('.textoRegalo');

        const inputTemp = document.createElement('input');
        inputTemp.value = spanTexto.innerText;

        li.replaceChild(inputTemp, spanTexto);
        inputTemp.focus();

        inputTemp.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.finalizarEdicion(id, inputTemp.value);
        });

        inputTemp.addEventListener('blur', () => {
            this.finalizarEdicion(id, inputTemp.value);
        });
    }

    // Guarda la edición
    finalizarEdicion(id, nuevoTexto) {
        if (nuevoTexto.trim() === "") return this.renderizar();

        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) tarea.editarContenido(nuevoTexto);

        this.guardarEnLocalStorage();
        this.renderizar();
    }

    // Muestra las tareas en pantalla
    renderizar() {
        listaRegalosUI.innerHTML = '';

        this.tareas.forEach(tarea => {
            const li = document.createElement('li');
            li.classList.add('itemRegalo');
            li.id = `regalo-${tarea.id}`;
            li.innerHTML = `
                <span class="textoRegalo">${tarea.texto}</span>
                <div class="accionesRegalo">
                    <i class="fa-solid fa-pen-to-square iconoEditar"></i>
                    <i class="fa-solid fa-trash-can iconoBorrar"></i>
                </div>
            `;

            li.querySelector('.iconoEditar').onclick = () => this.iniciarEdicion(tarea.id);
            li.querySelector('.iconoBorrar').onclick = () => this.eliminarTarea(tarea.id);

            listaRegalosUI.appendChild(li);
        });
    }

    // Guarda las tareas en localStorage
    guardarEnLocalStorage() {
        localStorage.setItem('wishlistPOO', JSON.stringify(this.tareas));
    }

    // Carga las tareas desde localStorage
    cargarDeLocalStorage() {
        const datos = localStorage.getItem('wishlistPOO');
        if (datos) this.tareas = JSON.parse(datos).map(d => new Tarea(d.id, d.texto));
        this.renderizar();
    }
}

// Inicializa el gestor
const miGestor = new GestorDeTareas();

btnAgregarRegalo.addEventListener('click', () => {
    miGestor.agregarTarea(inputRegalo.value);
    inputRegalo.value = '';
});

inputRegalo.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        miGestor.agregarTarea(inputRegalo.value);
        inputRegalo.value = '';
    }
});
