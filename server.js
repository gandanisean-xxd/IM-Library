import express from 'express';
import oracledb from "oracledb";
import cors from 'cors';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const app = express();
const port = 5000;
import dotenv from 'dotenv';
dotenv.config();

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

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  
  // Store OTP with email
  otpStore.set(email, otp);
  
  // Configure nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tagle.seanandrei@gmail.com', // Your Gmail
      pass: 'opan dfks kuaw rszj'         // Your App Password
    }
  });
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP',
      text: `Your OTP for email verification is: ${otp}`
    });
    
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const storedOTP = otpStore.get(email);
  
  if (storedOTP && storedOTP === otp) {
    otpStore.delete(email); // Clear OTP after successful verification
    res.json({ message: 'Email verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

// Modify the /api/register/student endpoint:

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

        // Check if student_id already exists
        const checkExisting = await connection.execute(
            `SELECT COUNT(*) as count FROM Student WHERE STUDENT_ID = :1`,
            [req.body.student_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (checkExisting.rows[0].COUNT > 0) {
            return res.status(400).json({
                success: false,
                message: 'Student ID already exists'
            });
        }

        // Check if email already exists
        const checkEmail = await connection.execute(
            `SELECT COUNT(*) as count FROM Student WHERE EMAIL = :1`,
            [req.body.email],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (checkEmail.rows[0].COUNT > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

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

        const hashedPassword = await hashPassword(password);

        console.log('Received student data:', {
            ...req.body,
            password: '[HIDDEN]'
        });

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
                hashedPassword
            ]
        );

        console.log('Insert result:', result);

        res.status(201).json({
            success: true,
            message: 'Student registered successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        let errorMessage = 'Registration failed';
        
        // Handle specific database errors
        if (err.errorNum === 1) {
            errorMessage = 'This Student ID or Email is already registered';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
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

        const hashedPassword = await hashPassword(password);

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
                hashedPassword
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

// ...existing imports and setup...

app.post('/api/login/:role', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let { role } = req.params;
    const { email, password } = req.body;
    let connection;

    console.log('Login attempt:', { role, email });

    try {
        // Map 'staff' to 'admin' for authentication
        let mappedRole = role === 'staff' ? 'admin' : role;

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
        let query;
        let params = [email, password];

        switch (mappedRole) {
    case 'student':
    case 'faculty':
    case 'librarian':
        query = `SELECT * FROM ${mappedRole.toUpperCase()} WHERE UPPER(EMAIL) = UPPER(:1)`;
        params = [email];
        break;
    case 'admin':
        query = `SELECT * FROM ADMIN WHERE UPPER(ADMIN_EMAIL) = UPPER(:1)`;
        params = [email];
        break;
    default:
        return res.status(400).json({
            success: false,
            message: 'Invalid role'
        });
}

        console.log('Executing query:', { email, tableName, mappedRole });

        const result = await connection.execute(
            query,
            params,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows && result.rows.length > 0) {
            const user = result.rows[0];

            const isValidPassword = await bcrypt.compare(
                password, 
                mappedRole === 'admin' ? user.ADMIN_PASSWORD : user.PASSWORD
            );

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
            
            // Remove password from response
            if (mappedRole === 'admin') {
                delete user.ADMIN_PASSWORD;
                // Map admin fields to match the expected format
                user.EMAIL = user.ADMIN_EMAIL;
                user.LIBRARIAN_FIRSTNAME = user.ADMIN_USERNAME;
                user.LIBRARIAN_LASTNAME = '';
            } else {
                delete user.PASSWORD;
            }

            // Set the role based on the mapped value
            const responseRole = role === 'staff' ? 'staff' : mappedRole;
            user.role = responseRole;

            const token = Buffer.from(`${user.EMAIL}:${Date.now()}`).toString('base64');

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: user,
                token: token,
                role: responseRole
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

app.post('/api/register/librarian', async (req, res) => {
    let connection;
    try {
        if (!req.body || !req.body.email) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data'
            });
        }

        const {
            librarian_id,
            librarian_lastname,
            librarian_firstname,
            email,
            password
        } = req.body;

        const hashedPassword = await hashPassword(password);

        connection = await oracledb.getConnection({
            user: "system",
            password: "taglesean",
            connectString: "localhost:1521/xe"
        });

        const result = await connection.execute(
            `INSERT INTO LIBRARIAN (
                LIBRARIAN_ID,
                LIBRARIAN_LASTNAME,
                LIBRARIAN_FIRSTNAME,
                EMAIL,
                PASSWORD
            ) VALUES (:1, :2, :3, :4, :5)`,
            [
                librarian_id,
                librarian_lastname,
                librarian_firstname,
                email,
                hashedPassword
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Librarian registered successfully'
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});