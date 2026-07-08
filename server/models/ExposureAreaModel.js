import db from '../config/db.js';

class ExposureAreaModel {
    // Get all exposure areas for a career
    static async getByCareerId(careerId) {
        const [rows] = await db.query(
            'SELECT * FROM exposure_areas WHERE career_id = ? ORDER BY exposure_name',
            [careerId]
        );
        return rows;
    }

    // Get all exposure areas
    static async getAll() {
        const [rows] = await db.query(
            'SELECT e.*, c.career_name FROM exposure_areas e JOIN career_categories c ON e.career_id = c.career_id ORDER BY c.career_name, e.exposure_name'
        );
        return rows;
    }

    // Get a single exposure area by ID
    static async getById(exposureId) {
        const [rows] = await db.query(
            'SELECT * FROM exposure_areas WHERE exposure_id = ?',
            [exposureId]
        );
        return rows[0];
    }

    // Create a new exposure area
    static async create(data) {
        const { career_id, exposure_name } = data;
        const [result] = await db.query(
            'INSERT INTO exposure_areas (career_id, exposure_name) VALUES (?, ?)',
            [career_id, exposure_name]
        );
        return result.insertId;
    }

    // Create multiple exposure areas at once
    static async createMany(careerId, exposureNames) {
        if (!exposureNames || exposureNames.length === 0) return [];
        
        const values = exposureNames.map(name => [careerId, name.trim()]);
        const [result] = await db.query(
            'INSERT INTO exposure_areas (career_id, exposure_name) VALUES ?',
            [values]
        );
        return result.insertId;
    }

    // Update an exposure area
    static async update(exposureId, data) {
        const { exposure_name } = data;
        const [result] = await db.query(
            'UPDATE exposure_areas SET exposure_name = ? WHERE exposure_id = ?',
            [exposure_name, exposureId]
        );
        return result.affectedRows > 0;
    }

    // Delete an exposure area
    static async delete(exposureId) {
        const [result] = await db.query(
            'DELETE FROM exposure_areas WHERE exposure_id = ?',
            [exposureId]
        );
        return result.affectedRows > 0;
    }

    // Delete all exposure areas for a career
    static async deleteByCareerId(careerId) {
        const [result] = await db.query(
            'DELETE FROM exposure_areas WHERE career_id = ?',
            [careerId]
        );
        return result.affectedRows;
    }
}

export default ExposureAreaModel;