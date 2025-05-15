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
export const dbConfig = {
    user: "jorgi",            
    password: "12345",        
    connectString: "localhost:1521/XE"  // Changed to default Oracle XE service name
};

// Enable Thick mode by pointing to your Instant Client folder
oracledb.initOracleClient({ libDir: "C:\\oraclexe\\instantclient_23_7" });

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

oracledb.autoCommit = true;

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
             WHERE owner = :1 AND table_name = 'STUDENT'`,
            ['JORGI'],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log('Available tables:', result.rows);
        
        if (result.rows && result.rows.length > 0) {
            const students = await connection.execute(
                `SELECT COUNT(*) as count FROM JORGI.STUDENT`,
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

    console.log('Login attempt - Full request:', {
        role,
        body: { ...req.body, password: '[HIDDEN]' }
    });

    try {
        connection = await oracledb.getConnection(dbConfig);
        let query;
        let params;
        let mappedRole = role;

        // Special handling for staff role
        if (role === 'staff') {
            const staffIdToCheck = staff_id || admin_id || librarian_id; // Try all possible ID fields
            
            if (!staffIdToCheck) {
                return res.status(400).json({
                    success: false,
                    message: 'Staff ID is required'
                });
            }

            // First try admin table
            const adminResult = await connection.execute(
                `SELECT *, 'admin' as SOURCE_TABLE FROM JORGI.ADMIN WHERE ADMIN_ID = :1`,
                [staffIdToCheck],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            // If not found in admin, try librarian table
            if (adminResult.rows.length === 0) {
                const librarianResult = await connection.execute(
                    `SELECT *, 'librarian' as SOURCE_TABLE FROM JORGI.LIBRARIAN WHERE LIBRARIAN_ID = :1`,
                    [staffIdToCheck],
                    { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );

                if (librarianResult.rows.length > 0) {
                    const user = librarianResult.rows[0];
                    mappedRole = 'librarian';
                    
                    // Verify password
                    const isValidPassword = await bcrypt.compare(password, user.PASSWORD);
                    if (!isValidPassword) {
                        return res.status(401).json({
                            success: false,
                            message: 'Invalid credentials'
                        });
                    }

                    // Remove password from response
                    delete user.PASSWORD;
                    user.role = 'staff';

                    const token = Buffer.from(`${user.EMAIL || user.LIBRARIAN_ID}:${Date.now()}`).toString('base64');

                    return res.status(200).json({
                        success: true,
                        message: 'Login successful',
                        user: user,
                        token: token,
                        role: 'staff'
                    });
                }
            } else {
                const user = adminResult.rows[0];
                mappedRole = 'admin';
                
                // Verify password
                const isValidPassword = await bcrypt.compare(password, user.ADMIN_PASSWORD);
                if (!isValidPassword) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid credentials'
                    });
                }

                // Remove password and map fields
                delete user.ADMIN_PASSWORD;
                user.EMAIL = user.ADMIN_EMAIL;
                user.LIBRARIAN_FIRSTNAME = user.ADMIN_USERNAME;
                user.LIBRARIAN_LASTNAME = '';
                user.role = 'staff';

                const token = Buffer.from(`${user.EMAIL || user.ADMIN_ID}:${Date.now()}`).toString('base64');

                return res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    user: user,
                    token: token,
                    role: 'staff'
                });
            }

            // If we get here, no user was found
            return res.status(401).json({
                success: false,
                message: 'Invalid Staff ID or password'
            });
        }

        // Handle other roles as before
        switch (role) {
            case 'student':
                query = `SELECT * FROM JORGI.STUDENT WHERE STUDENT_ID = :1`;
                params = [student_id];
                break;
            case 'faculty':
                query = `SELECT * FROM JORGI.FACULTY WHERE FACULTY_ID = :1`;
                params = [faculty_id];
                break;
            case 'librarian':
                query = `SELECT * FROM JORGI.LIBRARIAN WHERE LIBRARIAN_ID = :1`;
                params = [librarian_id];
                break;
            case 'admin':
                query = `SELECT * FROM JORGI.ADMIN WHERE ADMIN_ID = :1`;
                params = [admin_id];
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role'
                });
        }

        console.log('Executing query:', { query, params, mappedRole });

        const result = await connection.execute(
            query,
            params,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        console.log('Query result:', result.rows);

        if (result.rows && result.rows.length > 0) {
            const user = result.rows[0];
            console.log('Found user:', { 
                ...user,
                PASSWORD_START: user.PASSWORD ? user.PASSWORD.substring(0, 10) : 'null',
                PASSWORD_LENGTH: user.PASSWORD ? user.PASSWORD.length : 0,
                IS_PASSWORD_HASHED: user.PASSWORD ? user.PASSWORD.startsWith('$2') : false
            });

            try {
                // Log the raw password from database for debugging
                console.log('Password from database format check:', {
                    length: user.PASSWORD ? user.PASSWORD.length : 0,
                    startsWithBcrypt: user.PASSWORD ? user.PASSWORD.startsWith('$2') : false,
                    first10Chars: user.PASSWORD ? user.PASSWORD.substring(0, 10) : 'null'
                });

                // If password is not hashed, hash it and update in database
                if (user.PASSWORD && !user.PASSWORD.startsWith('$2')) {
                    console.log('Password is not hashed, updating with hash...');
                    const hashedPassword = await hashPassword(user.PASSWORD);
                    
                    // Update the password in database
                    await connection.execute(
                        `UPDATE ${mappedRole.toUpperCase()} SET PASSWORD = :1 WHERE ${mappedRole.toUpperCase()}_ID = :2`,
                        [hashedPassword, user[`${mappedRole.toUpperCase()}_ID`]]
                    );
                    
                    // Use the original password for this login attempt
                    if (password === user.PASSWORD) {
                        user.PASSWORD = hashedPassword; // Update for next steps
                        console.log('Plain password matched, proceeding with login');
                    } else {
                        console.log('Plain password did not match');
                        return res.status(401).json({
                            success: false,
                            message: 'Invalid credentials'
                        });
                    }
                } else {
                    // Normal bcrypt comparison
                    const isValidPassword = await bcrypt.compare(
                        password, 
                        mappedRole === 'admin' ? user.ADMIN_PASSWORD : user.PASSWORD
                    );
                    
                    console.log('Bcrypt password validation result:', isValidPassword);

                    if (!isValidPassword) {
                        console.log('Password validation failed');
                        return res.status(401).json({
                            success: false,
                            message: mappedRole === 'student' ? 'Invalid Student ID or password' : 
                                    mappedRole === 'faculty' ? 'Invalid Faculty ID or password' :
                                    mappedRole === 'librarian' ? 'Invalid Librarian ID or password' :
                                    'Invalid Admin ID or password'
                        });
                    }
                }
            } catch (bcryptError) {
                console.error('Error during password validation:', bcryptError);
                return res.status(500).json({
                    success: false,
                    message: 'Error validating password'
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

            const token = Buffer.from(`${user.EMAIL || user[`${mappedRole.toUpperCase()}_ID`]}:${Date.now()}`).toString('base64');

            console.log('Login successful, returning user:', { ...user, token });

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: user,
                token: token,
                role: responseRole
            });
        } else {
            console.log('No user found with provided ID');
            return res.status(401).json({
                success: false,
                message: mappedRole === 'student' ? 'Invalid Student ID or password' : 
                        mappedRole === 'faculty' ? 'Invalid Faculty ID or password' :
                        mappedRole === 'librarian' ? 'Invalid Librarian ID or password' :
                        'Invalid Admin ID or password'
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
                `SELECT COUNT(*) as count FROM JORGI.Student 
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
                `UPDATE JORGI.Student 
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
                `SELECT * FROM JORGI.Student WHERE STUDENT_ID = :1`,
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
                `SELECT COUNT(*) as count FROM JORGI.Faculty 
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
                `UPDATE JORGI.Faculty 
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
                `SELECT * FROM JORGI.Faculty WHERE FACULTY_ID = :1`,
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
            `UPDATE JORGI.LIBRARIAN SET PASSWORD = :1 WHERE LIBRARIAN_ID = :2`,
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

// Register borrow endpoints
import { borrowRoutes } from './borrowFecthing.js';
app.use(borrowRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});