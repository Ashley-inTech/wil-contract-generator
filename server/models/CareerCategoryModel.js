import db from '../config/db.js';

class CareerCategoryModel {
    // Get all career categories
    static async getAll() {
        try {
            console.log('🔍 Attempting to fetch careers from database...');
            const [rows] = await db.query(
                'SELECT * FROM career_categories ORDER BY career_name'
            );
            console.log(`✅ Found ${rows.length} careers`);
            return rows;
        } catch (error) {
            console.error('❌ Database error in CareerCategory.getAll():', error);
            throw error;
        }
    }

    // Get a single career category by ID
    static async getById(careerId) {
        const [rows] = await db.query(
            'SELECT * FROM career_categories WHERE career_id = ?',
            [careerId]
        );
        return rows[0];
    }

    // Create a new career category
    static async create(data) {
        const { career_name, role, responsibilities } = data;
        const [result] = await db.query(
            'INSERT INTO career_categories (career_name, role, responsibilities) VALUES (?, ?, ?)',
            [career_name, role, responsibilities]
        );
        return result.insertId;
    }

    // Update a career category
    static async update(careerId, data) {
        const { career_name, role, responsibilities } = data;
        const [result] = await db.query(
            'UPDATE career_categories SET career_name = ?, role = ?, responsibilities = ? WHERE career_id = ?',
            [career_name, role, responsibilities, careerId]
        );
        return result.affectedRows > 0;
    }

    // Delete a career category
    static async delete(careerId) {
        const [result] = await db.query(
            'DELETE FROM career_categories WHERE career_id = ?',
            [careerId]
        );
        return result.affectedRows > 0;
    }

    // Get career with its exposure areas
    static async getWithExposures(careerId) {
        const [career] = await db.query(
            'SELECT * FROM career_categories WHERE career_id = ?',
            [careerId]
        );
        
        if (!career[0]) return null;

        const [exposures] = await db.query(
            'SELECT * FROM exposure_areas WHERE career_id = ? ORDER BY exposure_name',
            [careerId]
        );

        return {
            ...career[0],
            exposures: exposures
        };
    }
}

export default CareerCategoryModel;