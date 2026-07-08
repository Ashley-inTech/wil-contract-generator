import db from '../config/db.js';

class ContractModel {
    // Get all contracts
    static async getAll() {
        const [rows] = await db.query(`
            SELECT c.*, p.first_name, p.last_name, p.id_number 
            FROM contracts c 
            JOIN participants p ON c.participant_id = p.participant_id 
            ORDER BY c.generated_date DESC
        `);
        return rows;
    }

    // Get contracts for a specific participant
    static async getByParticipantId(participantId) {
        const [rows] = await db.query(
            'SELECT * FROM contracts WHERE participant_id = ? ORDER BY generated_date DESC',
            [participantId]
        );
        return rows;
    }

    // Get a single contract by ID
    static async getById(contractId) {
        const [rows] = await db.query(`
            SELECT c.*, p.first_name, p.last_name, p.id_number, p.commencement_date, p.termination_date
            FROM contracts c 
            JOIN participants p ON c.participant_id = p.participant_id 
            WHERE c.contract_id = ?
        `, [contractId]);
        return rows[0];
    }

    // Create a new contract
    static async create(data) {
        const { participant_id, generated_pdf, generated_docx, status = 'Generated' } = data;
        const [result] = await db.query(
            'INSERT INTO contracts (participant_id, generated_pdf, generated_docx, status) VALUES (?, ?, ?, ?)',
            [participant_id, generated_pdf, generated_docx, status]
        );
        return result.insertId;
    }

    // Update a contract
    static async update(contractId, data) {
        const { generated_pdf, generated_docx, status } = data;
        const [result] = await db.query(
            'UPDATE contracts SET generated_pdf = COALESCE(?, generated_pdf), generated_docx = COALESCE(?, generated_docx), status = COALESCE(?, status) WHERE contract_id = ?',
            [generated_pdf, generated_docx, status, contractId]
        );
        return result.affectedRows > 0;
    }

    // Update contract status
    static async updateStatus(contractId, status) {
        const [result] = await db.query(
            'UPDATE contracts SET status = ? WHERE contract_id = ?',
            [status, contractId]
        );
        return result.affectedRows > 0;
    }

    // Delete a contract
    static async delete(contractId) {
        const [result] = await db.query(
            'DELETE FROM contracts WHERE contract_id = ?',
            [contractId]
        );
        return result.affectedRows > 0;
    }

    // Delete all contracts for a participant
    static async deleteByParticipantId(participantId) {
        const [result] = await db.query(
            'DELETE FROM contracts WHERE participant_id = ?',
            [participantId]
        );
        return result.affectedRows;
    }

    // Get latest contract for a participant
    static async getLatest(participantId) {
        const [rows] = await db.query(
            'SELECT * FROM contracts WHERE participant_id = ? ORDER BY generated_date DESC LIMIT 1',
            [participantId]
        );
        return rows[0];
    }

    // Check if participant has a contract
    static async hasContract(participantId) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM contracts WHERE participant_id = ?',
            [participantId]
        );
        return rows[0].count > 0;
    }
}

export default ContractModel;