const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//// ***********************ESQUEMA DE EMPLEADOS**********************
/*
const empleadosSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true
        },

        telefono: {
            type: String,
            required: true,
            trim: true
        },

        puesto: {
            type: String,
            required: true,
            trim: true
        },

        turno: {
            type: String,
            required: true,
            trim: true
        },

        usuario: {
            type: String,
            required: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            trim: true
        },

        salario: {
            type: Number,
            required: true,
            min: 1
        },

        fecha_ingreso: {
            type: Date,
            required: true
        },

        activo: {
            type: Boolean,
            required: true,
            default: true
        }
    },
    {
        timestamps: true
    }
);


// MODELO
const Empleados = mongoose.model(
    "Empleados",
    empleadosSchema,
    "empleados"
);
*/
// OBTENER TODOS LOS EMPLEADOS
/* 
app.get("/empleados", async (req, res) => {
    try {

        const empleados = await Empleados.find();

        res.json(empleados);

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al obtener los empleados",
            error: error.message
        });

    }
});

// OBTENER EMPLEADO POR ID
app.get("/empleados/:id", async (req, res) => {
    try {

        const empleado = await Empleados.findById(req.params.id);

        if (!empleado) {
            return res.status(404).json({
                mensaje: "Empleado no encontrado"
            });
        }

        res.json(empleado);

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al obtener el empleado",
            error: error.message
        });

    }
});

// REGISTRAR EMPLEADO
app.post("/empleados", async (req, res) => {
    try {

        const {
            nombre,
            email,
            telefono,
            puesto,
            turno,
            usuario,
            password,
            salario,
            fecha_ingreso,
            activo
        } = req.body;


        // Validar datos obligatorios

        if (
            !nombre ||
            !email ||
            !telefono ||
            !puesto ||
            !turno ||
            !usuario ||
            !password ||
            salario === undefined ||
            !fecha_ingreso ||
            activo === undefined
        ) {

            return res.status(400).json({
                mensaje: "Faltan datos del empleado"
            });

        }


        // Crear empleado

        const nuevoEmpleado = new Empleados({

            nombre,
            email,
            telefono,
            puesto,
            turno,
            usuario,
            password,
            salario,
            fecha_ingreso,
            activo

        });


        // Guardar empleado

        const empleadoGuardado = await nuevoEmpleado.save();


        res.status(201).json({

            mensaje: "Empleado registrado correctamente",

            empleado: empleadoGuardado

        });


    } catch (error) {

        res.status(500).json({

            mensaje: "Error al guardar el empleado",

            error: error.message

        });

    }
});

// ACTUALIZAR EMPLEADO
app.put("/empleados/:id", async (req, res) => {
    try {

        const {
            nombre,
            email,
            telefono,
            puesto,
            turno,
            usuario,
            password,
            salario,
            fecha_ingreso,
            activo
        } = req.body;


        if (
            !nombre ||
            !email ||
            !telefono ||
            !puesto ||
            !turno ||
            !usuario ||
            !password ||
            salario === undefined ||
            !fecha_ingreso ||
            activo === undefined
        ) {

            return res.status(400).json({
                mensaje: "Faltan datos del empleado"
            });

        }


        const empleadoActualizado =
            await Empleados.findByIdAndUpdate(

                req.params.id,

                {
                    nombre,
                    email,
                    telefono,
                    puesto,
                    turno,
                    usuario,
                    password,
                    salario,
                    fecha_ingreso,
                    activo
                },

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!empleadoActualizado) {

            return res.status(404).json({
                mensaje: "Empleado no encontrado"
            });

        }


        res.json({

            mensaje: "Empleado actualizado correctamente",

            empleado: empleadoActualizado

        });


    } catch (error) {

        res.status(500).json({

            mensaje: "Error al actualizar el empleado",

            error: error.message

        });

    }
});

// ELIMINAR EMPLEADO
app.delete("/empleados/:id", async (req, res) => {
    try {

        const empleadoEliminado =
            await Empleados.findByIdAndDelete(req.params.id);


        if (!empleadoEliminado) {

            return res.status(404).json({
                mensaje: "Empleado no encontrado"
            });

        }


        res.json({

            mensaje: "Empleado eliminado correctamente",

            empleado: empleadoEliminado

        });


    } catch (error) {

        res.status(500).json({

            mensaje: "Error al eliminar el empleado",

            error: error.message

        });

    }
});


////***********************ESQUEMA DE  CLIENTES***********************

const clienteSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: true
    },

    telefono: {
        type: String,
        required: true
    },

    correo: {
        type: String,
        required: true
    },

    direccion: {
        type: String,
        required: true
    },

    fechaRegistro: {
        type: Date,
        default: Date.now
    }

});

const Cliente = mongoose.model("Cliente", clienteSchema);


//*********************** RUTAS DE CLIENTES ***********************


// CONSULTAR TODOS LOS CLIENTES
app.get("/clientes", async (req, res) => {

    try {

        const clientes = await Cliente.find();

        res.json(clientes);

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al obtener los clientes",
            error: error.message
        });

    }

});

// CONSULTAR UN CLIENTE POR ID
app.get("/clientes/:id", async (req, res) => {

    try {

        const cliente = await Cliente.findById(req.params.id);

        if (!cliente) {

            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });

        }

        res.json(cliente);

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al obtener el cliente",
            error: error.message
        });

    }

});

// AGREGAR CLIENTE
app.post("/clientes", async (req, res) => {

    try {

        const nuevoCliente = new Cliente({

            nombre: req.body.nombre,
            telefono: req.body.telefono,
            correo: req.body.correo,
            direccion: req.body.direccion,
            fechaRegistro: req.body.fechaRegistro

        });

        const clienteGuardado = await nuevoCliente.save();

        res.status(201).json({
            mensaje: "Cliente agregado correctamente",
            cliente: clienteGuardado
        });

    } catch (error) {

        res.status(400).json({
            mensaje: "Error al agregar el cliente",
            error: error.message
        });

    }

});

// ACTUALIZAR CLIENTE
app.put("/clientes/:id", async (req, res) => {

    try {

        const clienteActualizado = await Cliente.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!clienteActualizado) {

            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });

        }

        res.json({
            mensaje: "Cliente actualizado correctamente",
            cliente: clienteActualizado
        });

    } catch (error) {

        res.status(400).json({
            mensaje: "Error al actualizar el cliente",
            error: error.message
        });

    }

});

// ELIMINAR CLIENTE
app.delete("/clientes/:id", async (req, res) => {

    try {

        const clienteEliminado = await Cliente.findByIdAndDelete(req.params.id);

        if (!clienteEliminado) {

            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });

        }

        res.json({
            mensaje: "Cliente eliminado correctamente",
            cliente: clienteEliminado
        });

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al eliminar el cliente",
            error: error.message
        });

    }

});

////***********************ESQUEMA DE PROVEEDORES**********************

const proveedorSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true
    },

    telefono: {
        type: String,
        required: true,
        trim: true
    },

    direccion: {
        type: String,
        required: true,
        trim: true
    },

    activo: {
        type: Boolean,
        required: true,
        default: true
    }

}, {
    timestamps: true
});

// MODELO
const Proveedor = mongoose.model(
    "Proveedor",
    proveedorSchema,
    "proveedores"
);

// CONSULTAR TODOS LOS PROVEEDORES
app.get("/proveedores", async (req, res) => {

    try {

        const proveedores = await Proveedor.find();

        res.json(proveedores);

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al obtener los proveedores",
            error: error.message
        });

    }

});

// CONSULTAR UN PROVEEDOR POR ID
app.get("/proveedores/:id", async (req, res) => {

    try {

        const proveedor = await Proveedor.findById(req.params.id);

        if (!proveedor) {

            return res.status(404).json({
                mensaje: "Proveedor no encontrado"
            });

        }

        res.json(proveedor);

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al obtener el proveedor",
            error: error.message
        });

    }

});

// AGREGAR PROVEEDOR
app.post("/proveedores", async (req, res) => {

    try {

        const {
            nombre,
            email,
            telefono,
            direccion,
            activo
        } = req.body;

        if (
            !nombre ||
            !email ||
            !telefono ||
            !direccion
        ) {

            return res.status(400).json({
                mensaje: "Faltan datos del proveedor"
            });

        }

        const nuevoProveedor = new Proveedor({
            nombre,
            email,
            telefono,
            direccion,
            activo
        });

        const proveedorGuardado = await nuevoProveedor.save();

        res.status(201).json({
            mensaje: "Proveedor agregado correctamente",
            proveedor: proveedorGuardado
        });

    } catch (error) {

        res.status(400).json({
            mensaje: "Error al agregar el proveedor",
            error: error.message
        });

    }

});

// ACTUALIZAR PROVEEDOR
app.put("/proveedores/:id", async (req, res) => {

    try {

        const {
            nombre,
            email,
            telefono,
            direccion,
            activo
        } = req.body;

        if (
            !nombre ||
            !email ||
            !telefono ||
            !direccion
        ) {

            return res.status(400).json({
                mensaje: "Faltan datos del proveedor"
            });

        }

        const proveedorActualizado = await Proveedor.findByIdAndUpdate(
            req.params.id,
            {
                nombre,
                email,
                telefono,
                direccion,
                activo
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!proveedorActualizado) {

            return res.status(404).json({
                mensaje: "Proveedor no encontrado"
            });

        }

        res.json({
            mensaje: "Proveedor actualizado correctamente",
            proveedor: proveedorActualizado
        });

    } catch (error) {

        res.status(400).json({
            mensaje: "Error al actualizar el proveedor",
            error: error.message
        });

    }

});

// ELIMINAR PROVEEDOR
app.delete("/proveedores/:id", async (req, res) => {

    try {

        const proveedorEliminado = await Proveedor.findByIdAndDelete(req.params.id);

        if (!proveedorEliminado) {

            return res.status(404).json({
                mensaje: "Proveedor no encontrado"
            });

        }

        res.json({
            mensaje: "Proveedor eliminado correctamente",
            proveedor: proveedorEliminado
        });

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al eliminar el proveedor",
            error: error.message
        });

    }

});


///***********************ESQUEMA DE PRODUCTOS************************
     const productosSchema = new mongoose.Schema({
        codigo_barras:{type:String,required:false,trim:true,maxlength:30},
        nombre:{type:String,required:true,trim:true,maxlength:100},
        descripcion:{type:String,required:false,trim:true,maxlength:500},
        categoria:{type:String,required:true,trim:true},
        precio_compra:{type:Number,required:true,min:0},
        precio_venta:{type:Number,required:true,min:0},
        stock:{type:Number,required:true,min:0,default:0},
        fecha_caducidad:{type:Date,required:false},
        proveedor_id:{type:mongoose.Schema.Types.ObjectId,ref:'Proveedores',required:true}
    },{
        timestamps: true
    });
    // Modelo
    const Producto=mongoose.model("Producto",productosSchema,"productos");
    //RUTAS 
    // Obtener todos los productos
app.get("/productos", async (req, res) => {
    try {
        const productos = await Producto.find().populate("proveedor_id");// traer informacion dl otro esquema
        res.json(productos);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener los productos",
            error: error.message
        });
    }
});

// Obtener un producto por ID
app.get("/productos/:id", async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id).populate("proveedor_id");

        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.json(producto);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener el producto",
            error: error.message
        });
    }
});

// Registrar un producto
app.post("/productos", async (req, res) => {
    try {
        const {
            codigo_barras,
            nombre,
            descripcion,
            categoria,
            precio_compra,
            precio_venta,
            stock,
            fecha_caducidad,
            proveedor_id
        } = req.body;

        if (
            !nombre ||
            !categoria ||
            precio_compra === undefined ||
            precio_venta === undefined ||
            stock === undefined ||
            !proveedor_id
        ) {
            return res.status(400).json({
                mensaje: "Faltan datos obligatorios del producto"
            });
        }

        const nuevoProducto = new Producto({
            codigo_barras,
            nombre,
            descripcion,
            categoria,
            precio_compra,
            precio_venta,
            stock,
            fecha_caducidad,
            proveedor_id
        });

        const productoGuardado = await nuevoProducto.save();

        res.status(201).json({
            mensaje: "Producto registrado correctamente",
            producto: productoGuardado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al guardar el producto",
            error: error.message
        });
    }
});

// Actualizar un producto
app.put("/productos/:id", async (req, res) => {
    try {
        const {
            codigo_barras,
            nombre,
            descripcion,
            categoria,
            precio_compra,
            precio_venta,
            stock,
            fecha_caducidad,
            proveedor_id
        } = req.body;

        if (
            !nombre ||
            !categoria ||
            precio_compra === undefined ||
            precio_venta === undefined ||
            stock === undefined ||
            !proveedor_id
        ) {
            return res.status(400).json({
                mensaje: "Faltan datos obligatorios del producto"
            });
        }

        const productoActualizado = await Producto.findByIdAndUpdate(
            req.params.id,
            {
                codigo_barras,
                nombre,
                descripcion,
                categoria,
                precio_compra,
                precio_venta,
                stock,
                fecha_caducidad,
                proveedor_id
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!productoActualizado) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.json({
            mensaje: "Producto actualizado correctamente",
            producto: productoActualizado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al actualizar el producto",
            error: error.message
        });
    }
});

// Eliminar un producto
app.delete("/productos/:id", async (req, res) => {
    try {
        const productoEliminado = await Producto.findByIdAndDelete(req.params.id);

        if (!productoEliminado) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.json({
            mensaje: "Producto eliminado correctamente",
            producto: productoEliminado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al eliminar el producto",
            error: error.message
        });
    }
});

///***********************ESQUEMA DE  VENTAS*************************

//Esquema de items 
const itemSchema = new mongoose.Schema(
    {
        producto_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Producto",           
            required: true
        },
        nombre: {                      
            type: String,
            required: true,
            trim: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        precio: {                      
            type: Number,
            required: true,
            min: 0
        },
        subtotal: {             
            type: Number,
            required: true,
            min: 0
        }
    },
    //Para que no le ponga ID al subdocumento
    { _id: false }
);

// Esquema principal de la venta.
const ventaSchema = new mongoose.Schema(
    {
        folio: {                       
            type: String,
            required: true,
            unique: true,              
            trim: true
        },
        fecha: {
            type: Date,
            required: true,
            default: Date.now
        },

        empleado_id: {                 
            type: mongoose.Schema.Types.ObjectId,
            ref: "Empleados",         
            required: true
        },
        cliente_id: {                  
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cliente",           
            required: true
        },
        cliente_nombre: {              
            type: String,
            required: true,
            trim: true
        },
        items: {                       
            type: [itemSchema],
            required: true
        },
        total: {                       
            type: Number,
            required: true,
            min: 0
        },
        metodo_pago: {
            type: String,
            required: true,
            enum: ["efectivo", "tarjeta", "transferencia"]  
        },
        estatus: {
            type: String,
            required: true,
            enum: ["completada", "cancelada"],
            default: "completada"
        }
    },
    {
        timestamps: true 
    }
);

// MODELO
const Venta = mongoose.model("Venta", ventaSchema, "ventas");


*/
    app.get("/", (req, res) => {
    res.send("API del Proyecto NoSQL");
    });

async function iniciarServidor() {
       try {
           await mongoose.connect(
               "mongodb+srv://root:root@servidorprueba.6wjsj0y.mongodb.net/TiendaDB",
               {
                   serverSelectionTimeoutMS: 10000
               }
           );
   
           console.log("Conectado correctamente a MongoDB");
   
           app.listen(PORT, () => {
               console.log(
                   "Servidor iniciado en http://localhost:" + PORT
               );
           });
       } catch (error) {
           console.error("No se pudo conectar con MongoDB con la base de Datos TiendaDB");
           console.error(error.message);
       }
   }
   
   iniciarServidor();
