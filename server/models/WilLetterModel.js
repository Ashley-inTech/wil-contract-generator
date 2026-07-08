import db from '../config/db.js';

class WilLetterModel {
    // Get all WIL letters
    static async getAll() {
        const [rows] = await db.query(`
            SELECT w.*, p.first_name, p.last_name, p.id_number 
            FROM wil_letters w 
            JOIN participants p ON w.participant_id = p.participant_id 
            ORDER BY w.generated_date DESC
        `);
        return rows;
    }

    // Get WIL letters for a specific participant
    static async getByParticipantId(participantId) {
        const [rows] = await db.query(
            'SELECT * FROM wil_letters WHERE participant_id = ? ORDER BY generated_date DESC',
            [participantId]
        );
        return rows;
    }

    // Get a single WIL letter by ID
    static async getById(wilLetterId) {
        const [rows] = await db.query(`
            SELECT w.*, p.first_name, p.last_name, p.id_number, p.commencement_date, p.termination_date
            FROM wil_letters w 
            JOIN participants p ON w.participant_id = p.participant_id 
            WHERE w.wil_letter_id = ?
        `, [wilLetterId]);
        return rows[0];
    }

    // Create a new WIL letter
    static async create(data) {
        const { participant_id, generated_pdf, generated_docx, status = 'Generated' } = data;
        const [result] = await db.query(
            'INSERT INTO wil_letters (participant_id, generated_pdf, generated_docx, status) VALUES (?, ?, ?, ?)',
            [participant_id, generated_pdf, generated_docx, status]
        );
        return result.insertId;
    }

    // Update a WIL letter
    static async update(wilLetterId, data) {
        const { generated_pdf, generated_docx, status } = data;
        const [result] = await db.query(
            'UPDATE wil_letters SET generated_pdf = COALESCE(?, generated_pdf), generated_docx = COALESCE(?, generated_docx), status = COALESCE(?, status) WHERE wil_letter_id = ?',
            [generated_pdf, generated_docx, status, wilLetterId]
        );
        return result.affectedRows > 0;
    }

    // Update WIL letter status
    static async updateStatus(wilLetterId, status) {
        const [result] = await db.query(
            'UPDATE wil_letters SET status = ? WHERE wil_letter_id = ?',
            [status, wilLetterId]
        );
        return result.affectedRows > 0;
    }

    // Delete a WIL letter
    static async delete(wilLetterId) {
        const [result] = await db.query(
            'DELETE FROM wil_letters WHERE wil_letter_id = ?',
            [wilLetterId]
        );
        return result.affectedRows > 0;
    }

    // Delete all WIL letters for a participant
    static async deleteByParticipantId(participantId) {
        const [result] = await db.query(
            'DELETE FROM wil_letters WHERE participant_id = ?',
            [participantId]
        );
        return result.affectedRows;
    }

    // Get latest WIL letter for a participant
    static async getLatest(participantId) {
        const [rows] = await db.query(
            'SELECT * FROM wil_letters WHERE participant_id = ? ORDER BY generated_date DESC LIMIT 1',
            [participantId]
        );
        return rows[0];
    }

    // Check if participant has a WIL letter
    static async hasWilLetter(participantId) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM wil_letters WHERE participant_id = ?',
            [participantId]
        );
        return rows[0].count > 0;
    }
}

export default WilLetterModel;