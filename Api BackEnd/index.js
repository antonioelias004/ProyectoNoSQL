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



////***********************ESQUEMA DE  CLIENTES***********************



////***********************ESQUEMA DE PROVEEDORES**********************



///***********************ESQUEMA DE PRODUCTOS************************



///***********************ESQUEMA DE  VENTAS*************************














    app.get("/", (req, res) => {
    res.send("API del Proyecto NoSQL");
    });


    app.listen(PORT, () => {
    console.log(
        "Servidor iniciado en http://localhost:" + PORT
    );
});