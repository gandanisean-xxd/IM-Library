import express from 'express';
import oracledb from "oracledb";
import cors from 'cors';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 5000;
import dotenv from 'dotenv';
dotenv.config();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Database configuration
<<<<<<< HEAD
export const dbConfig = {
    user: "jorgi",            
    password: "12345",        
=======
const dbConfig = {
    user: "system",            
    password: "taglesean",        
>>>>>>> 0ef76e0ee4fd50d8aa40f7941e3383128544db64
    connectString: "localhost:1521/XE"  // Changed to default Oracle XE service name
};

// Enable Thick mode by pointing to your Instant Client folder
oracledb.initOracleClient({ libDir: "C:\\oracle\\instantclient_23_7" });

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

oracledb.autoCommit = true;

// Add admin-specific error handling
const validateAdminCredentials = async (admin_id, password, connection) => {
    try {
        // Convert admin_id to uppercase to match database convention
        const normalized_admin_id = admin_id.toUpperCase();
        const result = await connection.execute(
            `SELECT * FROM ADMIN WHERE ADMIN_ID = :1`,
            [normalized_admin_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (!result.rows || result.rows.length === 0) {
            return { success: false, message: 'Invalid Admin ID or password' };
        }

        const user = result.rows[0];
        const adminPasswordField = user.ADMIN_PASSWORD || user.PASSWORD;

        if (!adminPasswordField) {
            return { success: false, message: 'Admin account not properly configured' };
        }

        // Handle both hashed and plain text passwords
        let isValidPassword = false;
        if (adminPasswordField.startsWith('$2')) {
            isValidPassword = await bcrypt.compare(password, adminPasswordField);
        } else {
            isValidPassword = password === adminPasswordField;
            if (isValidPassword) {
                // Update to hashed password
                const hashedPassword = await hashPassword(password);
                await connection.execute(
                    `UPDATE ADMIN SET ADMIN_PASSWORD = :1 WHERE ADMIN_ID = :2`,
                    [hashedPassword, admin_id],
                    { autoCommit: true }
                );
            }
        }

        if (!isValidPassword) {
            return { success: false, message: 'Invalid Admin ID or password' };
        }

        // Clean user object for response
        delete user.ADMIN_PASSWORD;
        delete user.PASSWORD;
        user.EMAIL = user.ADMIN_EMAIL;
        user.role = 'admin';

        return { 
            success: true, 
            user,
            token: Buffer.from(`${user.ADMIN_ID}:${Date.now()}`).toString('base64')
        };
    } catch (error) {
        console.error('Admin validation error:', error);
        return { success: false, message: 'Error validating admin credentials' };
    }
};

// Add this before the login endpoint
const handleAdminLogin = async (admin_id, password, connection) => {
    try {
        console.log('handleAdminLogin called with admin_id:', admin_id);
        // Convert admin_id to uppercase to match database convention
        const normalized_admin_id = admin_id.toUpperCase();
        const result = await connection.execute(
            `SELECT * FROM ADMIN WHERE ADMIN_ID = :1`,
            [normalized_admin_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log('Database query result:', result.rows ? 'Found rows' : 'No rows found');

        if (!result.rows || result.rows.length === 0) {
            return { success: false, message: 'Invalid Admin ID or password' };
        }

        const user = result.rows[0];
        console.log('Found admin user:', { 
            id: user.ADMIN_ID,
            hasPassword: !!user.PASSWORD,
            hasAdminPassword: !!user.ADMIN_PASSWORD
        });

        const passwordField = user.ADMIN_PASSWORD || user.PASSWORD;
        if (!passwordField) {
            console.log('No password field found in admin record');
            return { success: false, message: 'Admin account not properly configured' };
        }

        // Compare passwords
        console.log('Comparing passwords - stored password type:', passwordField.startsWith('$2') ? 'hashed' : 'plain');
        let isValid = false;
        
        if (passwordField.startsWith('$2')) {
            isValid = await bcrypt.compare(password, passwordField);
            console.log('Bcrypt comparison result:', isValid);
        } else {
            isValid = password === passwordField;
            console.log('Plain text comparison result:', isValid);
            
            if (isValid) {                console.log('Upgrading plain text password to hashed version');
                const hashedPassword = await hashPassword(password);
                await connection.execute(
                    `UPDATE ADMIN SET ADMIN_PASSWORD = :1 WHERE ADMIN_ID = :2`,
                    [hashedPassword, normalized_admin_id],
                    { autoCommit: true }
                );
            }
        }
        
        if (!isValid) {
            return { success: false, message: 'Invalid Admin ID or password' };
        }

        // Clean up user object for response
        delete user.ADMIN_PASSWORD;
        delete user.PASSWORD;
        user.EMAIL = user.ADMIN_EMAIL;
        user.role = 'admin';

        const token = Buffer.from(`${user.ADMIN_ID}:${Date.now()}`).toString('base64');
        console.log('Login successful, generated token');

        return {
            success: true,
            user,
            token,
            role: 'admin'
        };
    } catch (error) {
        console.error('Admin authentication error:', error);
        return { success: false, message: 'Error during authentication' };
    }
};

// Test endpoint to check server status
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Test the connection with the correct schema
async function testConnection() {
    let connection;
    try {
        console.log('Attempting to connect to the database...');
        connection = await oracledb.getConnection(dbConfig);
        console.log('Successfully connected to the database!');
        
        // Test query to check table access
        const result = await connection.execute(
            `SELECT table_name 
             FROM all_tables 
             WHERE owner = 'SYSTEM' AND table_name = 'STUDENT'`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log('Available tables:', result.rows);
        
        if (result.rows && result.rows.length > 0) {
            const students = await connection.execute(
                `SELECT COUNT(*) as count FROM STUDENT`,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            console.log('Number of students:', students.rows[0].COUNT);
        }
    } catch (err) {
        console.error('Database connection error:', err);
        if (err.errorNum === 12514) {
            console.error('\nPossible solutions:');
            console.error('1. Make sure Oracle XE service is running');
            console.error('2. Verify the service name in tnsnames.ora');
            console.error('3. Check if the listener is running using "lsnrctl status"');
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

testConnection();

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

        connection = await oracledb.getConnection(dbConfig);

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
                PROGRAM,
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

        connection = await oracledb.getConnection(dbConfig);

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

// Add a test endpoint to check database connectivity and data
app.get('/api/test-db', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        console.log('Database connected successfully');

        // Check if STUDENT table exists
        const tables = await connection.execute(
            `SELECT table_name 
             FROM all_tables 
             WHERE owner = :1 AND table_name = 'STUDENT'`,
            ['SYSTEM'],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log('Table check result:', tables.rows);

        if (tables.rows && tables.rows.length > 0) {
            // Check student records
            const students = await connection.execute(
                `SELECT * FROM STUDENT`,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            console.log('Found students:', students.rows ? students.rows.length : 0);

            res.json({
                success: true,
                tableExists: true,
                studentCount: students.rows ? students.rows.length : 0,
                sampleStudents: students.rows ? students.rows.map(s => ({
                    STUDENT_ID: s.STUDENT_ID,
                    STUDENT_FIRSTNAME: s.STUDENT_FIRSTNAME,
                    STUDENT_LASTNAME: s.STUDENT_LASTNAME
                })) : []
            });
        } else {
            res.json({
                success: true,
                tableExists: false,
                message: 'STUDENT table not found'
            });
        }
    } catch (err) {
        console.error('Database test error:', err);
        res.status(500).json({
            success: false,
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

// Modify the login endpoint to use explicit schema
app.post('/api/login/:role', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let { role } = req.params;
    const { student_id, faculty_id, librarian_id, admin_id, staff_id, password } = req.body;
    let connection;
    
    console.log('Login attempt:', { role, ...req.body, password: '[HIDDEN]' });

    try {
        connection = await oracledb.getConnection(dbConfig);        // Special handling for admin login
        if (role === 'admin') {
            console.log('Attempting admin login with ID:', admin_id);
            const validationResult = await handleAdminLogin(admin_id, password, connection);
            
            if (!validationResult.success) {
                console.log('Admin login failed:', validationResult.message);
                return res.status(401).json({
                    success: false,
                    message: validationResult.message
                });
            }

            console.log('Admin login successful');
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: validationResult.user,
                token: validationResult.token,
                role: validationResult.role
            });

            if (!adminResult.rows || adminResult.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Admin ID or password'
                });
            }

            const admin = adminResult.rows[0];
            const storedPassword = admin.ADMIN_PASSWORD || admin.PASSWORD;

            if (!storedPassword) {
                return res.status(500).json({
                    success: false,
                    message: 'Admin account not properly configured'
                });
            }

            // Check if password is still in plain text
            if (storedPassword === password) {
                // Hash the password for future use
                const hashedPassword = await hashPassword(password);
                await connection.execute(
                    `UPDATE ADMIN SET ADMIN_PASSWORD = :1 WHERE ADMIN_ID = :2`,
                    [hashedPassword, admin_id],
                    { autoCommit: true }
                );
            } else {
                // Verify hashed password
                const isValid = await bcrypt.compare(password, storedPassword);
                if (!isValid) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid Admin ID or password'
                    });
                }
            }

            // Clean up admin object for response
            delete admin.ADMIN_PASSWORD;
            delete admin.PASSWORD;
            admin.EMAIL = admin.ADMIN_EMAIL;
            admin.role = 'admin';

            const token = Buffer.from(`${admin.ADMIN_ID}:${Date.now()}`).toString('base64');

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: admin,
                token: token,
                role: 'admin'
            });
        }        // Handle student login
        if (role === 'student') {
            console.log('Attempting student login with ID:', student_id);
            const result = await connection.execute(
                `SELECT * FROM Student WHERE STUDENT_ID = :1`,
                [student_id],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (!result.rows || result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Student ID or password'
                });
            }

            const student = result.rows[0];
            const isValid = await bcrypt.compare(password, student.PASSWORD);

            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Student ID or password'
                });
            }

            delete student.PASSWORD;
            student.role = 'student';
            const token = Buffer.from(`${student.STUDENT_ID}:${Date.now()}`).toString('base64');

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: student,
                token: token,
                role: 'student'
            });
        }

        // Handle faculty login
        if (role === 'faculty') {
            console.log('Attempting faculty login with ID:', faculty_id);
            const result = await connection.execute(
                `SELECT * FROM Faculty WHERE FACULTY_ID = :1`,
                [faculty_id],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (!result.rows || result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Faculty ID or password'
                });
            }

            const faculty = result.rows[0];
            const isValid = await bcrypt.compare(password, faculty.PASSWORD);

            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Faculty ID or password'
                });
            }

            delete faculty.PASSWORD;
            faculty.role = 'faculty';
            const token = Buffer.from(`${faculty.FACULTY_ID}:${Date.now()}`).toString('base64');

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: faculty,
                token: token,
                role: 'faculty'
            });
        }

        // Handle librarian login
        if (role === 'librarian') {
            console.log('Attempting librarian login with ID:', librarian_id);
            const result = await connection.execute(
                `SELECT * FROM Librarian WHERE LIBRARIAN_ID = :1`,
                [librarian_id],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (!result.rows || result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Librarian ID or password'
                });
            }

            const librarian = result.rows[0];
            const isValid = await bcrypt.compare(password, librarian.PASSWORD);

            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Librarian ID or password'
                });
            }

            delete librarian.PASSWORD;
            librarian.role = 'librarian';
            const token = Buffer.from(`${librarian.LIBRARIAN_ID}:${Date.now()}`).toString('base64');

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: librarian,
                token: token,
                role: 'librarian'
            });
        }

        // If no valid role was specified
        return res.status(400).json({
            success: false,
            message: 'Invalid role specified'
        });

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

        connection = await oracledb.getConnection(dbConfig);

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

// Student profile update endpoint
app.put('/api/student/update', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let connection;
    
    try {
        const {
            student_id,
            student_firstname,
            student_lastname,
            email,
            student_campus,
            status
        } = req.body;

        console.log('Received update request:', req.body);

        if (!student_id) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required'
            });
        }

        try {
            connection = await oracledb.getConnection(dbConfig);
        } catch (dbError) {
            console.error('Database connection error:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Database connection failed',
                error: dbError.message
            });
        }

        try {
            // Check if email already exists for other students
            const checkEmail = await connection.execute(
                `SELECT COUNT(*) as count FROM Student 
                 WHERE EMAIL = :1 AND STUDENT_ID != :2`,
                [email, student_id],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (checkEmail.rows[0].COUNT > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            // Update student information
            const result = await connection.execute(
                `UPDATE Student 
                 SET STUDENT_FIRSTNAME = :1,
                     STUDENT_LASTNAME = :2,
                     EMAIL = :3,
                     STUDENT_CAMPUS = :4,
                     STATUS = :5
                 WHERE STUDENT_ID = :6`,
                [
                    student_firstname,
                    student_lastname,
                    email,
                    student_campus,
                    status,
                    student_id
                ],
                { autoCommit: true }
            );

            if (result.rowsAffected === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            // Get updated student data
            const updatedStudent = await connection.execute(
                `SELECT * FROM Student WHERE STUDENT_ID = :1`,
                [student_id],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (updatedStudent.rows.length > 0) {
                const student = updatedStudent.rows[0];
                delete student.PASSWORD; // Remove password from response

                return res.status(200).json({
                    success: true,
                    message: 'Profile updated successfully',
                    user: student
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Failed to retrieve updated profile'
                });
            }
        } catch (dbError) {
            console.error('Database operation error:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Database operation failed',
                error: dbError.message
            });
        }
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error occurred',
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

// Faculty profile update endpoint
app.put('/api/faculty/update', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let connection;
    
    try {
        const {
            faculty_id,
            faculty_firstname,
            faculty_lastname,
            email
        } = req.body;

        console.log('Received faculty update request:', req.body);

        if (!faculty_id) {
            return res.status(400).json({
                success: false,
                message: 'Faculty ID is required'
            });
        }

        try {
            connection = await oracledb.getConnection(dbConfig);
        } catch (dbError) {
            console.error('Database connection error:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Database connection failed',
                error: dbError.message
            });
        }

        try {
            // Check if email already exists for other faculty members
            const checkEmail = await connection.execute(
                `SELECT COUNT(*) as count FROM Faculty 
                 WHERE EMAIL = :1 AND FACULTY_ID != :2`,
                [email, faculty_id],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (checkEmail.rows[0].COUNT > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            // Update faculty information
            const result = await connection.execute(
                `UPDATE Faculty 
                 SET FACULTY_FIRSTNAME = :1,
                     FACULTY_LASTNAME = :2,
                     EMAIL = :3
                 WHERE FACULTY_ID = :4`,
                [
                    faculty_firstname,
                    faculty_lastname,
                    email,
                    faculty_id
                ],
                { autoCommit: true }
            );

            if (result.rowsAffected === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Faculty member not found'
                });
            }

            // Get updated faculty data
            const updatedFaculty = await connection.execute(
                `SELECT * FROM Faculty WHERE FACULTY_ID = :1`,
                [faculty_id],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (updatedFaculty.rows.length > 0) {
                const faculty = updatedFaculty.rows[0];
                delete faculty.PASSWORD; // Remove password from response

                return res.status(200).json({
                    success: true,
                    message: 'Profile updated successfully',
                    user: faculty
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Failed to retrieve updated profile'
                });
            }
        } catch (dbError) {
            console.error('Database operation error:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Database operation failed',
                error: dbError.message
            });
        }
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error occurred',
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

// Librarian profile update endpoint
app.put('/api/librarian/update', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let connection;
    
    try {
        const {
            librarian_id,
            librarian_firstname,
            librarian_lastname,
            email
        } = req.body;

        console.log('Received librarian update request:', req.body);

        if (!librarian_id) {
            return res.status(400).json({
                success: false,
                message: 'Librarian ID is required'
            });
        }

        connection = await oracledb.getConnection(dbConfig);

        // Check if email already exists for other librarians
        const checkEmail = await connection.execute(
            `SELECT COUNT(*) as count FROM Librarian 
             WHERE EMAIL = :1 AND LIBRARIAN_ID != :2`,
            [email, librarian_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (checkEmail.rows[0].COUNT > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Update librarian information
        const result = await connection.execute(
            `UPDATE Librarian 
             SET LIBRARIAN_FIRSTNAME = :1,
                 LIBRARIAN_LASTNAME = :2,
                 EMAIL = :3
             WHERE LIBRARIAN_ID = :4`,
            [
                librarian_firstname,
                librarian_lastname,
                email,
                librarian_id
            ],
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                success: false,
                message: 'Librarian not found'
            });
        }

        // Get updated librarian data
        const updatedLibrarian = await connection.execute(
            `SELECT * FROM Librarian WHERE LIBRARIAN_ID = :1`,
            [librarian_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (updatedLibrarian.rows.length > 0) {
            const librarian = updatedLibrarian.rows[0];
            delete librarian.PASSWORD;

            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                user: librarian
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Failed to retrieve updated profile'
            });
        }
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error occurred',
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

// Password change endpoint
app.put('/api/auth/change-password', async (req, res) => {
    let connection;
    try {
        const { userId, currentPassword, newPassword, role } = req.body;

        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        connection = await oracledb.getConnection(dbConfig);

        // Get user's current password
        const table = role === 'student' ? 'Student' : 'Faculty';
        const idField = role === 'student' ? 'STUDENT_ID' : 'FACULTY_ID';
        
        const user = await connection.execute(
            `SELECT PASSWORD FROM ${table} WHERE ${idField} = :1`,
            [userId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].PASSWORD);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        const result = await connection.execute(
            `UPDATE ${table} SET PASSWORD = :1 WHERE ${idField} = :2`,
            [hashedPassword, userId]
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                success: false,
                message: 'Failed to update password'
            });
        }

        // Commit the transaction
        await connection.commit();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update password',
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

// Books catalog endpoint
app.get('/api/books', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT BOOK_ID, BOOK_NAME, BOOK_AUTHOR, BOOK_CATEGORY, BOOK_QUANTITY, CAMPUS_AVAILABILITY FROM JORGI.BOOKS`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json({ success: true, books: result.rows });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch books', error: err.message });
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

// Reset librarian password endpoint
app.post('/api/librarian/reset-password', async (req, res) => {
    let connection;
    try {
        const { librarian_id, new_password } = req.body;

        if (!librarian_id || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Librarian ID and new password are required'
            });
        }

        const hashedPassword = await hashPassword(new_password);
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `UPDATE LIBRARIAN SET PASSWORD = :1 WHERE LIBRARIAN_ID = :2`,
            [hashedPassword, librarian_id]
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                success: false,
                message: 'Librarian not found'
            });
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
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

<<<<<<< HEAD
// Borrow book endpoint
app.post('/api/borrow', async (req, res) => {
    let connection;
    try {
        const {
            studentId,
            bookId,
            borrowDate,
            returnDate,
            pickupTime,
            pickupExpiry
        } = req.body;

        if (!studentId || !bookId || !borrowDate || !returnDate || !pickupTime || !pickupExpiry) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields.'
            });
        }

        connection = await oracledb.getConnection(dbConfig);

        // Check for duplicate borrow (same student, same book, not yet returned or overdue)
        const duplicateCheck = await connection.execute(
            `SELECT * FROM JORGI.BORROWS WHERE STUDENT_ID = :1 AND BOOK_ID = :2 AND STATUS IN ('pending', 'borrowed', 'overdue')`,
            [studentId, bookId]
        );
        if (duplicateCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'You have already borrowed this book and not yet returned it.'
            });
        }

        // Generate UUID for BORROW_ID
        const borrowId = uuidv4();
        // Set initial status to 'PENDING' (uppercase, as required by updated constraint)
        const status = 'PENDING';

        // Insert into new BORROWS table with pickup fields
        await connection.execute(
            `INSERT INTO JORGI.BORROWS (BORROW_ID, STUDENT_ID, BOOK_ID, BORROW_DATE, DUE_DATE, PICKUP_TIME, PICKUP_EXPIRY, STATUS) VALUES (:1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'), TO_DATE(:5, 'YYYY-MM-DD'), TO_TIMESTAMP(:6, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'), TO_TIMESTAMP(:7, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'), :8)`,
            [borrowId, studentId, bookId, borrowDate, returnDate, pickupTime, pickupExpiry, status]
        );

        // Update book quantity
        const updateBook = await connection.execute(
            `UPDATE JORGI.BOOKS SET BOOK_QUANTITY = BOOK_QUANTITY - 1 WHERE BOOK_ID = :1 AND BOOK_QUANTITY > 0`,
            [bookId]
        );
        if (updateBook.rowsAffected === 0) {
            // Rollback borrow record if book is unavailable
            await connection.execute(
                `DELETE FROM JORGI.BORROWS WHERE BORROW_ID = :1`,
                [borrowId]
            );
            return res.status(400).json({
                success: false,
                message: 'Book is not available.'
            });
        }

        await connection.commit();

        // Notification logic removed (notifications tables dropped)
        res.status(201).json({
            success: true,
            message: 'Book borrowed successfully.'
        });
    } catch (err) {
        console.error('Borrow error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to borrow book.',
=======
// Add this middleware to get student ID from token
const getStudentFromToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header missing or invalid format'
    });
  }

  try {
    // Remove 'Bearer ' prefix and get the token
    const token = authHeader.split(' ')[1];
    console.log('Received token:', token);

    const decoded = Buffer.from(token, 'base64').toString().split(':')[0];
    console.log('Decoded token data:', decoded);
      // Validate student ID format (xx-xxxx)
    if (!/^\d{2}-\d{4}$/.test(decoded)) {
      console.log('Invalid student ID format:', decoded);
      return res.status(401).json({
        success: false,
        message: 'Invalid student ID format. Expected format: xx-xxxx'
      });
    }

    req.studentId = decoded;
    next();
  } catch (err) {
    console.error('Token decode error:', err);
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token'
    });
  }
};

app.get('/api/reservations', getStudentFromToken, async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT * FROM ROOM_RESERVATIONS 
       WHERE STUDENT_ID = :1 
       ORDER BY RESERVATION_DATE DESC, TIME_SLOT DESC`,
      [req.studentId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      success: true,
      reservations: result.rows
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations',
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

// Update the reservations endpoint to use the middleware
app.post('/api/reservations', getStudentFromToken, async (req, res) => {
  let connection;
  try {
    const {
      program,
      date,
      timeSlot,
      memberCount,
      memberNames,
      purpose
    } = req.body;    // Validate required fields
    if (!program || !date || !timeSlot || !memberCount || !memberNames || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate member count
    const memberCountNum = parseInt(memberCount);
    if (isNaN(memberCountNum) || memberCountNum < 5 || memberCountNum > 10) {
      return res.status(400).json({
        success: false,
        message: 'Member count must be between 5 and 10'
      });
    }

    // Convert member names array to string and validate length
    const memberNamesString = Array.isArray(memberNames) ? memberNames.join(', ') : memberNames;
    if (!memberNamesString || memberNamesString.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Member names are required'
      });
    }
    if (memberNamesString.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Member names exceed maximum length of 500 characters'
      });
    }

    connection = await oracledb.getConnection(dbConfig);
    
    // First verify that the student exists
    const studentCheck = await connection.execute(
      `SELECT COUNT(*) as count FROM STUDENT WHERE STUDENT_ID = :1`,
      [req.studentId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (studentCheck.rows[0].COUNT === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student ID not found. Please make sure you are logged in with a valid student account.'
      });
    }
      // Validate and parse the date
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Format date in YYYY-MM-DD format for consistency
    const formattedDate = dateObj.toISOString().split('T')[0];

    // Validate time slot format (e.g., "9:00 AM - 10:00 AM")
    const timeSlotPattern = /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM) - (1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/;
    if (!timeSlotPattern.test(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time slot format. Expected format: "HH:MM AM/PM - HH:MM AM/PM"'
      });
    }

    // Check if time slot is available
    const checkSlot = await connection.execute(
      `SELECT COUNT(*) as count 
       FROM ROOM_RESERVATIONS 
       WHERE RESERVATION_DATE = TO_DATE(:1, 'YYYY-MM-DD')
       AND TIME_SLOT = :2
       AND STATUS = 'approved'`,
      [formattedDate, timeSlot],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (checkSlot.rows[0].COUNT > 0) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
      // Set initial status to pending
    const status = 'pending';
    
    console.log('Debug - Student ID from token:', req.studentId);
    console.log('Debug - Request data:', {
      studentId: req.studentId,
      program,
      date: formattedDate,
      timeSlot,
      memberCount: memberCountNum
    });    // Insert the reservation using the student ID from the token
    await connection.execute(
      `INSERT INTO ROOM_RESERVATIONS (
        STUDENT_ID,
        PROGRAM,
        RESERVATION_DATE,
        TIME_SLOT,
        MEMBER_COUNT,
        MEMBER_NAMES,
        PURPOSE,
        STATUS
      ) VALUES (
        :1,
        :2,
        TO_DATE(:3, 'YYYY-MM-DD'),
        :4,
        :5,
        :6,
        :7,
        :8
      )`,
      [
        req.studentId,     // VARCHAR2(10)
        program,          // VARCHAR2(100)
        formattedDate,    // DATE
        timeSlot,         // VARCHAR2(50)
        memberCountNum,   // NUMBER
        memberNamesString.substring(0, 4000), // CLOB
        purpose,          // CLOB
        status           // VARCHAR2(20)
      ],
      { autoCommit: true }
    );

    res.status(201).json({
      success: true,
      message: 'Reservation submitted successfully'
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit reservation',
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

app.delete('/api/reservations/:reservationId', getStudentFromToken, async (req, res) => {
  let connection;
  try {
    const { reservationId } = req.params;
    
    connection = await oracledb.getConnection(dbConfig);

    // Verify the reservation belongs to this student
    const checkOwnership = await connection.execute(
      `SELECT COUNT(*) as count 
       FROM ROOM_RESERVATIONS 
       WHERE RESERVATION_ID = :1 
       AND STUDENT_ID = :2`,
      [reservationId, req.studentId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (checkOwnership.rows[0].COUNT === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this reservation'
      });
    }

    // Cancel the reservation
    const result = await connection.execute(
      `UPDATE ROOM_RESERVATIONS 
       SET STATUS = 'cancelled' 
       WHERE RESERVATION_ID = :1`,
      [reservationId],
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel reservation',
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

// Room reservation endpoints
app.post('/api/room-reservations', async (req, res) => {
  let connection;
  try {
    const { 
      student_id, 
      program, 
      reservation_date, 
      time_slot, 
      member_count, 
      member_names, 
      purpose 
    } = req.body;

    // Validate required fields
    if (!student_id || !program || !reservation_date || !time_slot || !member_count || !member_names || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate member count (5-10 members)
    const memberCountNum = parseInt(member_count);
    if (isNaN(memberCountNum) || memberCountNum < 5 || memberCountNum > 10) {
      return res.status(400).json({
        success: false,
        message: 'Member count must be between 5 and 10'
      });
    }

    // Convert member names array to string if needed and validate length
    const memberNamesString = Array.isArray(member_names) ? member_names.join(', ') : member_names;
    if (memberNamesString.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Member names exceed maximum length of 500 characters'
      });
    }

    // Initial status is always 'pending'
    const status = 'pending';

    connection = await oracledb.getConnection(dbConfig);

    // Check if student exists
    const studentCheck = await connection.execute(
      `SELECT COUNT(*) as count FROM STUDENT WHERE STUDENT_ID = :1`,
      [student_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (studentCheck.rows[0].COUNT === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student ID not found'
      });
    }

    // Check if the time slot is already booked
    const timeSlotCheck = await connection.execute(
      `SELECT COUNT(*) as count 
       FROM ROOM_RESERVATIONS 
       WHERE RESERVATION_DATE = TO_DATE(:1, 'YYYY-MM-DD')
       AND TIME_SLOT = :2
       AND STATUS = 'approved'`,
      [reservation_date, time_slot],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (timeSlotCheck.rows[0].COUNT > 0) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for the selected date'
      });
    }

    // Create the reservation
    const result = await connection.execute(
      `INSERT INTO ROOM_RESERVATIONS (
        STUDENT_ID,
        PROGRAM,
        RESERVATION_DATE,
        TIME_SLOT,
        MEMBER_COUNT,
        MEMBER_NAMES,
        PURPOSE,
        STATUS
      ) VALUES (
        :student_id,
        :program,
        TO_DATE(:reservation_date, 'YYYY-MM-DD'),
        :time_slot,
        :member_count,
        :member_names,
        :purpose,
        :status
      ) RETURNING RESERVATION_ID INTO :reservation_id`,
      {
        student_id,
        program,
        reservation_date,
        time_slot,
        member_count,
        member_names,
        purpose,
        status,
        reservation_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Room reservation created successfully',
      reservation_id: result.outBinds.reservation_id[0]
    });

  } catch (err) {
    console.error('Error creating room reservation:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create room reservation',
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

// Get all room reservations (for librarian)
app.get('/api/librarian/room-reservations', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(      `SELECT 
        r.RESERVATION_ID,
        r.STUDENT_ID,
        s.STUDENT_FIRSTNAME,
        s.STUDENT_LASTNAME,
        s.STUDENT_PROGRAM,
        r.PROGRAM,
        TO_CHAR(r.RESERVATION_DATE, 'YYYY-MM-DD') as RESERVATION_DATE,
        r.TIME_SLOT,
        r.MEMBER_COUNT,
        r.MEMBER_NAMES,
        r.PURPOSE,
        r.STATUS,
        TO_CHAR(r.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') as CREATED_AT
      FROM ROOM_RESERVATIONS r
      JOIN STUDENT s ON r.STUDENT_ID = s.STUDENT_ID
      ORDER BY r.CREATED_AT DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      success: true,
      reservations: result.rows
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations',
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

// Update reservation status (for librarian)
app.put('/api/librarian/room-reservations/:reservationId', async (req, res) => {
  let connection;
  try {
    const { reservationId } = req.params;
    const { status } = req.body;

    if (!['approved', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `UPDATE ROOM_RESERVATIONS 
       SET STATUS = :1,
           UPDATED_AT = SYSTIMESTAMP
       WHERE RESERVATION_ID = :2`,
      [status, reservationId]
    );

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: `Reservation ${status} successfully`
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update reservation status',
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

app.post('/api/room-reservations', async (req, res) => {
  let connection;
  try {
    const { 
      student_id, 
      program, 
      reservation_date, 
      time_slot, 
      member_count, 
      member_names, 
      purpose 
    } = req.body;

    // Validate member count (5-10 members)
    if (member_count < 5 || member_count > 10) {
      return res.status(400).json({
        success: false,
        message: 'Member count must be between 5 and 10'
      });
    }

    // Initial status is always 'pending'
    const status = 'pending';

    connection = await oracledb.getConnection(dbConfig);

    // Use RETURNING clause to get the new reservation ID
    const result = await connection.execute(
      `INSERT INTO ROOM_RESERVATIONS (
        STUDENT_ID,
        PROGRAM,
        RESERVATION_DATE,
        TIME_SLOT,
        MEMBER_COUNT,
        MEMBER_NAMES,
        PURPOSE,
        STATUS
      ) VALUES (
        :student_id,
        :program,
        TO_DATE(:reservation_date, 'YYYY-MM-DD'),
        :time_slot,
        :member_count,
        :member_names,
        :purpose,
        :status
      ) RETURNING RESERVATION_ID INTO :reservation_id`,
      {
        student_id,
        program,
        reservation_date,
        time_slot,
        member_count,
        member_names,
        purpose,
        status,
        reservation_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Room reservation created successfully',
      reservation_id: result.outBinds.reservation_id[0]
    });

  } catch (err) {
    console.error('Error creating room reservation:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create room reservation',
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

app.put('/api/librarian/room-reservations/:id/status', async (req, res) => {
  let connection;
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Validate status values
    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    connection = await oracledb.getConnection(dbConfig);

    // Check if the reservation exists and get its current status
    const checkReservation = await connection.execute(
      `SELECT STATUS FROM ROOM_RESERVATIONS WHERE RESERVATION_ID = :1`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (checkReservation.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Don't allow changing status of cancelled reservations
    if (checkReservation.rows[0].STATUS === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a cancelled reservation'
      });
    }

    // Update the reservation status
    const result = await connection.execute(
      `UPDATE ROOM_RESERVATIONS 
       SET STATUS = :1,
           UPDATED_AT = SYSTIMESTAMP
       WHERE RESERVATION_ID = :2`,
      [status, id]
    );

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: `Reservation ${status} successfully`
    });

  } catch (err) {
    console.error('Error updating reservation status:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update reservation status',
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

// Add a diagnostic endpoint to check admin table
app.get('/api/check-admin-table', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        
        // Check table structure
        const schema = await connection.execute(
            `SELECT COLUMN_NAME, DATA_TYPE, NULLABLE 
             FROM ALL_TAB_COLUMNS 
             WHERE TABLE_NAME = 'ADMIN' 
             AND OWNER = 'SYSTEM'`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        // Check for any admin records
        const records = await connection.execute(
            `SELECT ADMIN_ID, ADMIN_EMAIL 
             FROM ADMIN`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({
            success: true,
            schema: schema.rows,
            recordCount: records.rows ? records.rows.length : 0,
            sampleRecord: records.rows && records.rows.length > 0 ? 
                {
                    id: records.rows[0].ADMIN_ID,
                    hasEmail: !!records.rows[0].ADMIN_EMAIL
                } : null
        });
    } catch (err) {
        console.error('Error checking admin table:', err);
        res.status(500).json({
            success: false,
            message: 'Error checking admin table',
>>>>>>> 0ef76e0ee4fd50d8aa40f7941e3383128544db64
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

<<<<<<< HEAD
// Register borrow endpoints
import { borrowRoutes } from './borrowFecthing.js';
app.use(borrowRoutes);
=======
// Delete endpoints for admin operations
app.delete('/api/admin/delete-student/:id', async (req, res) => {
    let connection;
    try {
        const studentId = req.params.id;
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `DELETE FROM Student WHERE STUDENT_ID = :1`,
            [studentId],
            { autoCommit: true }
        );

        if (result.rowsAffected > 0) {
            res.json({
                success: true,
                message: 'Student deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
    } catch (err) {
        console.error('Delete student error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to delete student',
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

app.delete('/api/admin/delete-faculty/:id', async (req, res) => {
    let connection;
    try {
        const facultyId = req.params.id;
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `DELETE FROM Faculty WHERE FACULTY_ID = :1`,
            [facultyId],
            { autoCommit: true }
        );

        if (result.rowsAffected > 0) {
            res.json({
                success: true,
                message: 'Faculty member deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Faculty member not found'
            });
        }
    } catch (err) {
        console.error('Delete faculty error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to delete faculty member',
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

app.delete('/api/admin/delete-librarian/:id', async (req, res) => {
    let connection;
    try {
        const librarianId = req.params.id;
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `DELETE FROM Librarian WHERE LIBRARIAN_ID = :1`,
            [librarianId],
            { autoCommit: true }
        );

        if (result.rowsAffected > 0) {
            res.json({
                success: true,
                message: 'Librarian deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Librarian not found'
            });
        }
    } catch (err) {
        console.error('Delete librarian error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to delete librarian',
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

// Get all students
app.get('/api/students', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT * FROM Student`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({
            success: true,
            students: result.rows
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch students',
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

// Get all faculty members
app.get('/api/faculty', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT * FROM Faculty`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({
            success: true,
            faculty: result.rows
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch faculty members',
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

// Get all librarians
app.get('/api/librarians', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT * FROM Librarian`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Remove sensitive information
        const librarians = result.rows.map(librarian => {
            const { PASSWORD, ...librarianWithoutPassword } = librarian;
            return librarianWithoutPassword;
        });

        res.json({
            success: true,
            librarians: librarians
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch librarians',
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
>>>>>>> 0ef76e0ee4fd50d8aa40f7941e3383128544db64

// Start the server
app.listen(port, () => {
    console.clear();
    console.log('\x1b[32m%s\x1b[0m', '🚀 Server started successfully!');
    console.log('\x1b[36m%s\x1b[0m', `📡 Server is running on http://localhost:${port}`);
    console.log('\x1b[33m%s\x1b[0m', '💡 Press Ctrl+C to stop the server');
    console.log('----------------------------------------');
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\x1b[31m%s\x1b[0m', '🛑 Shutting down server...');
    process.exit();
});

// Keep the process running
process.stdin.resume();