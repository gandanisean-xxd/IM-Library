// GET: Fetch all borrow records for a given studentId
import express from 'express';
import oracledb from "oracledb";
import { dbConfig } from './server.js';
const router = express.Router();

export const borrowRoutes = router;

router.get('/api/borrows', async (req, res) => {
    let connection;
    try {
        const { studentId } = req.query;
        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Missing studentId.' });
        }
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT * FROM JORGI.BORROWS WHERE STUDENT_ID = :1 ORDER BY BORROW_DATE DESC`,
            [studentId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json({ success: true, borrows: result.rows });
    } catch (err) {
        console.error('Fetch borrows error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch borrows.', error: err.message });
    } finally {
        if (connection) try { await connection.close(); } catch (err) { console.error('Error closing connection:', err); }
    }
});

// GET: Fetch all borrow records (for librarian, optional status filter)
router.get('/api/librarian/borrows', async (req, res) => {
    let connection;
    try {
        const { status } = req.query;
        connection = await oracledb.getConnection(dbConfig);
        // Select only needed fields for categorization
        let query = `SELECT BORROW_ID, STUDENT_ID, BOOK_ID, BORROW_DATE, DUE_DATE, PICKUP_TIME, PICKUP_EXPIRY, STATUS FROM JORGI.BORROWS`;
        let params = [];
        if (status) {
            query += ' WHERE STATUS = :1 ORDER BY BORROW_DATE DESC';
            params = [status];
        } else {
            query += ' ORDER BY BORROW_DATE DESC';
        }
        const result = await connection.execute(query, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        // Format date fields as ISO strings for frontend compatibility
        const borrows = result.rows.map(b => ({
            ...b,
            BORROW_DATE: b.BORROW_DATE && b.BORROW_DATE.toISOString ? b.BORROW_DATE.toISOString() : b.BORROW_DATE,
            DUE_DATE: b.DUE_DATE && b.DUE_DATE.toISOString ? b.DUE_DATE.toISOString() : b.DUE_DATE,
            PICKUP_TIME: b.PICKUP_TIME && b.PICKUP_TIME.toISOString ? b.PICKUP_TIME.toISOString() : b.PICKUP_TIME,
            PICKUP_EXPIRY: b.PICKUP_EXPIRY && b.PICKUP_EXPIRY.toISOString ? b.PICKUP_EXPIRY.toISOString() : b.PICKUP_EXPIRY,
        }));
        res.json({ success: true, borrows });
    } catch (err) {
        console.error('Fetch all borrows error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch borrows.', error: err.message });
    } finally {
        if (connection) try { await connection.close(); } catch (err) { console.error('Error closing connection:', err); }
    }
});

// PUT: Approve or Deny a borrow request
router.put('/api/librarian/borrows/:borrowId/status', async (req, res) => {
    let connection;
    try {
        const { borrowId } = req.params;
        const { status } = req.body; // Should be 'APPROVED' or 'DENIED'
        if (!borrowId || !status || !['APPROVED', 'DENIED', 'BORROWED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Missing or invalid borrowId or status. Allowed: APPROVED, DENIED, BORROWED.' });
        }
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `UPDATE JORGI.BORROWS SET STATUS = :1 WHERE BORROW_ID = :2`,
            [status, borrowId]
        );
        await connection.commit();
        res.json({ success: true, message: `Borrow request ${status.toLowerCase()}.` });
    } catch (err) {
        console.error('Update borrow status error:', err);
        res.status(500).json({ success: false, message: 'Failed to update borrow status.', error: err.message });
    } finally {
        if (connection) try { await connection.close(); } catch (err) { console.error('Error closing connection:', err); }
    }
});