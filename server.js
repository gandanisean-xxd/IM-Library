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

oracledb.autoCommit = true;

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

app.post('/api/register/student', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: "system",
            password: "taglesean",
            connectString: "localhost:1521/xe"
        });

        const {
            student_id,
            student_lastname,
            student_firstname,
            student_program,
            student_campus,
            expected_graduateyear,
            status
        } = req.body;

        console.log('Received student data:', req.body);

        const result = await connection.execute(
            `INSERT INTO Student (
                STUDENT_ID,
                STUDENT_LASTNAME,
                STUDENT_FIRSTNAME,
                STUDENT_PROGRAM,
                STUDENT_CAMPUS,
                EXPECTED_GRADUATEYEAR,
                STATUS
            ) VALUES (:1, :2, :3, :4, :5, :6, :7)`,
            [
                student_id,
                student_lastname,
                student_firstname,
                student_program,
                student_campus,
                expected_graduateyear,
                status
            ]
        );

        console.log('Insert result:', result);

        // No need for explicit commit since autoCommit is true

        res.status(201).json({
            success: true,
            message: 'Student registered successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: err.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

app.post('/api/register/faculty', async (req, res) => {
    let connection;
    try {
        // Validate request body
        if (!req.body || !req.body.faculty_id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data'
            });
        }

        connection = await oracledb.getConnection({
            user: "system",
            password: "taglesean",
            connectString: "localhost:1521/xe"
        });

        const {
            faculty_id,
            faculty_lastname,
            faculty_firstname,
            college_department,
            status
        } = req.body;

        console.log('Received faculty data:', req.body);

        const result = await connection.execute(
            `INSERT INTO Faculty (
                FACULTY_ID,
                FACULTY_LASTNAME,
                FACULTY_FIRSTNAME,
                COLLEGE_DEPARTMENT,
                STATUS
            ) VALUES (:1, :2, :3, :4, :5)`,
            [
                faculty_id,
                faculty_lastname,
                faculty_firstname,
                college_department,
                status
            ],
            { autoCommit: true }
        );

        console.log('Insert result:', result);

        return res.status(201).json({
            success: true,
            message: 'Faculty registered successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: err.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});