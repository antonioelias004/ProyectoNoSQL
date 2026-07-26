const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
//CONEXION A LA BASE DE DATOS 
mongoose.connect(
        "mongodb+srv://root:root@servidorprueba.6wjsj0y.mongodb.net/"
    )
    .then(() => {
        console.log("Conectado correctamente a MongoDB");
    })
    .catch((error) => {
        console.error("Error al conectar con MongoDB:", error);
});
//// ***********************ESQUEMA DE EMPLEADOS**********************
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

// OBTENER TODOS LOS EMPLEADOS
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



////***********************ESQUEMA DE PROVEEDORES**********************



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
        proveedor_id:{type:mongoose.Schema.Types.ObjectId,ref:'Proveedor',required:true}
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














    app.get("/", (req, res) => {
    res.send("API del Proyecto NoSQL");
    });


    app.listen(PORT, () => {
    console.log(
        "Servidor iniciado en http://localhost:" + PORT
    );
});
