import db from '../config/db.js';

class ParticipantModel {
    // Get all participants
    static async getAll() {
        const [rows] = await db.query(`
            SELECT p.*, c.career_name, c.role 
            FROM participants p 
            JOIN career_categories c ON p.career_id = c.career_id 
            ORDER BY p.created_at DESC
        `);
        return rows;
    }

    // Get participants with filtering
    static async getWithFilters(filters = {}) {
        let query = `
            SELECT p.*, c.career_name, c.role 
            FROM participants p 
            JOIN career_categories c ON p.career_id = c.career_id 
            WHERE 1=1
        `;
        const values = [];

        if (filters.status) {
            query += ' AND p.status = ?';
            values.push(filters.status);
        }

        if (filters.career_id) {
            query += ' AND p.career_id = ?';
            values.push(filters.career_id);
        }

        if (filters.search) {
            query += ' AND (p.first_name LIKE ? OR p.last_name LIKE ? OR p.id_number LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            values.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY p.created_at DESC';
        
        const [rows] = await db.query(query, values);
        return rows;
    }

    // Get a single participant by ID
    static async getById(participantId) {
        const [rows] = await db.query(`
            SELECT p.*, c.career_name, c.role 
            FROM participants p 
            JOIN career_categories c ON p.career_id = c.career_id 
            WHERE p.participant_id = ?
        `, [participantId]);
        return rows[0];
    }

    // Get participant with all related data (contracts, WIL letters)
    static async getWithDocuments(participantId) {
        const participant = await this.getById(participantId);
        if (!participant) return null;

        const [contracts] = await db.query(
            'SELECT * FROM contracts WHERE participant_id = ? ORDER BY generated_date DESC',
            [participantId]
        );

        const [wilLetters] = await db.query(
            'SELECT * FROM wil_letters WHERE participant_id = ? ORDER BY generated_date DESC',
            [participantId]
        );

        return {
            ...participant,
            contracts: contracts,
            wilLetters: wilLetters
        };
    }

    // Get participant by ID number
    static async getByIdNumber(idNumber) {
        const [rows] = await db.query(
            'SELECT * FROM participants WHERE id_number = ?',
            [idNumber]
        );
        return rows[0];
    }

    // Create a new participant
    static async create(data) {
        const {
            first_name,
            last_name,
            id_number,
            commencement_date,
            termination_date,
            career_id,
            participant_role,
            responsibilities,
            exposure_areas,
            signed_at,
            participant_signature,
            status = 'Active'
        } = data;

        const [result] = await db.query(`
            INSERT INTO participants (
                first_name, 
                last_name, 
                id_number, 
                commencement_date, 
                termination_date, 
                career_id, 
                participant_role, 
                responsibilities,
                exposure_areas,
                signed_at,
                participant_signature,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            first_name,
            last_name,
            id_number,
            commencement_date,
            termination_date,
            career_id,
            participant_role,
            responsibilities,
            exposure_areas,
            signed_at,
            participant_signature,
            status
        ]);

        return result.insertId;
    }

    // Update a participant
    static async update(participantId, data) {
        const {
            first_name,
            last_name,
            id_number,
            commencement_date,
            termination_date,
            career_id,
            participant_role,
            responsibilities,
            exposure_areas,
            signed_at,
            participant_signature,
            status
        } = data;

        const [result] = await db.query(`
            UPDATE participants 
            SET 
                first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                id_number = COALESCE(?, id_number),
                commencement_date = COALESCE(?, commencement_date),
                termination_date = COALESCE(?, termination_date),
                career_id = COALESCE(?, career_id),
                participant_role = COALESCE(?, participant_role),
                responsibilities = COALESCE(?, responsibilities),
                exposure_areas = COALESCE(?, exposure_areas),
                signed_at = COALESCE(?, signed_at),
                participant_signature = COALESCE(?, participant_signature),
                status = COALESCE(?, status)
            WHERE participant_id = ?
        `, [
            first_name,
            last_name,
            id_number,
            commencement_date,
            termination_date,
            career_id,
            participant_role,
            responsibilities,
            exposure_areas,
            signed_at,
            participant_signature,
            status,
            participantId
        ]);

        return result.affectedRows > 0;
    }

    // Update participant status only
    static async updateStatus(participantId, status) {
        const [result] = await db.query(
            'UPDATE participants SET status = ? WHERE participant_id = ?',
            [status, participantId]
        );
        return result.affectedRows > 0;
    }

    // Delete a participant (cascades to contracts and WIL letters)
    static async delete(participantId) {
        const [result] = await db.query(
            'DELETE FROM participants WHERE participant_id = ?',
            [participantId]
        );
        return result.affectedRows > 0;
    }

    // Get participants by date range
    static async getByDateRange(startDate, endDate) {
        const [rows] = await db.query(`
            SELECT p.*, c.career_name 
            FROM participants p 
            JOIN career_categories c ON p.career_id = c.career_id 
            WHERE commencement_date >= ? AND termination_date <= ?
            ORDER BY commencement_date
        `, [startDate, endDate]);
        return rows;
    }

    // Get active participants
    static async getActive() {
        const [rows] = await db.query(`
            SELECT p.*, c.career_name, c.role 
            FROM participants p 
            JOIN career_categories c ON p.career_id = c.career_id 
            WHERE p.status = 'Active'
            ORDER BY p.created_at DESC
        `);
        return rows;
    }

    // Get statistics
    static async getStats() {
        const [total] = await db.query('SELECT COUNT(*) as total FROM participants');
        const [active] = await db.query("SELECT COUNT(*) as active FROM participants WHERE status = 'Active'");
        const [completed] = await db.query("SELECT COUNT(*) as completed FROM participants WHERE status = 'Completed'");
        const [terminated] = await db.query("SELECT COUNT(*) as terminated FROM participants WHERE status = 'Terminated'");
        const [byCareer] = await db.query(`
            SELECT c.career_name, COUNT(*) as count 
            FROM participants p 
            JOIN career_categories c ON p.career_id = c.career_id 
            GROUP BY p.career_id
        `);

        return {
            total: total[0].total,
            active: active[0].active,
            completed: completed[0].completed,
            terminated: terminated[0].terminated,
            byCareer: byCareer
        };
    }
}

export default ParticipantModel;