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
    } finally {
        if (con) {
            try {
                await con.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

fun();

app.post('/api/register/student', async (req, res) => {
    let connection;
    try {
        if (!req.body || !req.body.student_id) {
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
            student_id,
            student_lastname,
            student_firstname,
            student_program,
            student_campus,
            expected_graduateyear,
            status,
            email,
            password
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
                STATUS,
                EMAIL,
                PASSWORD
            ) VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9)`,
            [
                student_id,
                student_lastname,
                student_firstname,
                student_program,
                student_campus,
                expected_graduateyear,
                status || 'active',
                email,
                password
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
            status,
            email,
            password
        } = req.body;

        console.log('Received faculty data:', req.body);

        const result = await connection.execute(
            `INSERT INTO Faculty (
                FACULTY_ID,
                FACULTY_LASTNAME,
                FACULTY_FIRSTNAME,
                COLLEGE_DEPARTMENT,
                STATUS,
                EMAIL,
                PASSWORD
            ) VALUES (:1, :2, :3, :4, :5, :6, :7)`,
            [
                faculty_id,
                faculty_lastname,
                faculty_firstname,
                college_department,
                status || 'active',
                email,
                password
            ]
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

app.post('/api/login/:role', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let { role } = req.params; // Get the role from the URL
    const { email, password } = req.body;
    let connection;

    console.log('Login attempt:', { role, email }); // Debug log

    try {
        // Map 'staff' to 'librarian' in the backend
        let mappedRole = role;
        if (role === 'staff') {
            mappedRole = 'librarian';
        }

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        connection = await oracledb.getConnection({
            user: "system",
            password: "taglesean",
            connectString: "localhost:1521/xe"
        });

        let tableName;
        switch (mappedRole) {
            case 'student':
                tableName = 'STUDENT';
                break;
            case 'faculty':
                tableName = 'FACULTY';
                break;
            case 'librarian':
                tableName = 'LIBRARIAN';
                break;
            case 'admin':
                tableName = 'ADMIN';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role'
                });
        }

        console.log('Executing query for:', { email, tableName }); // Debug log

        const result = await connection.execute(
            `SELECT * FROM ${tableName} WHERE UPPER(EMAIL) = UPPER(:1) AND PASSWORD = :2 AND STATUS = 'active'`,
            [email, password],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows && result.rows.length > 0) {
            const user = result.rows[0];
            delete user.PASSWORD;

            // Use the mapped role
            user.role = mappedRole;

            const token = Buffer.from(`${user.EMAIL}:${Date.now()}`).toString('base64');

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: user,
                token: token,
                role: mappedRole // Explicitly include the role in response
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Login failed',
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