import express from 'express';
import oracledb from "oracledb";
import cors from 'cors';

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Enable Thick mode by pointing to your Instant Client folder
oracledb.initOracleClient({ libDir: "C:\\oracle\\instantclient_23_7" });

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function fun() {
    let con;

    try {
        con = await oracledb.getConnection({
            user: "system",
            password: "taglesean",
            connectString: "localhost:1521/xe",
        });

        console.log('Connected to the database!');
    } catch (err) {
        console.error(err);
    }
}

fun();

