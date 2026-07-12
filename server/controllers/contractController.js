import ContractModel from'../models/ContractModel.js';
import ParticipantModel from '../models/ParticipantModel.js';

import PDFService from "../services/pdfService.js";
import DOCXService from "../services/docxService.js";
import DocumentService from "../services/documentService.js";

class ContractController {

    // Get all contracts
    static async getAllContracts(req, res){
        try {
            const contracts = await ContractModel.getAll();
            res.status(200).json({
                success: true,
                data: contracts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching contracts',
                error: error.message
            });
        }
    }

    // Get contracts for a participant
    static async getParticipantContracts(req, res) {
        try {
            const { participantId } = req.params;
            const contracts = await ContractModel.getByParticipantId(participantId);
            res.status(200).json({
                success: true,
                data: contracts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching participant contracts',
                error: error.message
            });
        }
    }

    // Get a single contract
    static async getContract(req, res) {
        try {
            const { id } = req.params;
            const contract = await ContractModel.getById(id); 
            
            if (!contract) {
                return res.status(404).json({
                    success: false,
                    message: 'Contract not found'
                });
            }
            
            res.status(200).json({
                success: true,
                data: contract
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching contract',
                error: error.message
            });
        }
    }

    // Generate a new contract
    static async generateContract(req, res) {
        try {
            const { participantId } = req.params;
            
            // Check if participant exists
            const participant = await ParticipantModel.getById(participantId);
            if (!participant) {
                return res.status(404).json({
                    success: false,
                    message: 'Participant not found'
                });
            }
            
            // Check if contract already exists
            const hasContract = await ContractModel.hasContract(participantId);
            if (hasContract) {
                return res.status(400).json({
                    success: false,
                    message: 'This participant already has a contract. Use update instead.'
                });
            }
            
            // In a real app, this would generate PDF/DOCX files
            // For now, we'll just store placeholder filenames
            const pdfFilename =
                await PDFService.createPDF(
                    "contract",
                    participant
                );

            const docxFilename =
                await DOCXService.createDOCX(
                    "contract",
                    participant
                );

            const contractData = {

                participant_id: participantId,

                generated_pdf: pdfFilename,

                generated_docx: docxFilename,

                status: "Generated"

            };
            
            const contractId = await ContractModel.create(contractData);
            const newContract = await ContractModel.getById(contractId);
            
            res.status(201).json({
                success: true,
                message: 'Contract generated successfully',
                data: newContract
            });
        } catch (error) {
             console.error(error);

            res.status(500).json({
                success: false,
                message: "Error generating contract",
                error: error.message,
                stack: error.stack
            });
        }
    }

    // Update a contract
    static async updateContract(req, res) {
        try {
            const { id } = req.params;
            const contractData = req.body;
            
            const updated = await ContractModel.update(id, contractData);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Contract not found or no changes made'
                });
            }
            
            const updatedContract = await ContractModel.getById(id);
            res.status(200).json({
                success: true,
                message: 'Contract updated successfully',
                data: updatedContract
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating contract',
                error: error.message
            });
        }
    }

    // Update contract status
    static async updateContractStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!['Draft', 'Generated', 'Signed'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be Draft, Generated, or Signed'
                });
            }
            
            const updated = await ContractModel.updateStatus(id, status);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Contract not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Contract status updated successfully',
                data: { contract_id: id, status }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating contract status',
                error: error.message
            });
        }
    }

    // Delete a contract
    static async deleteContract(req, res) {
        try {
            const { id } = req.params;
            const deleted = await ContractModel.delete(id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Contract not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Contract deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting contract',
                error: error.message
            });
        }
    }

    //download pdf contract
    static async downloadContractPdf(req, res) {

        try {

            const { participantId } = req.params;

            const contract =
                await ContractModel.getLatest(participantId);

            if (!contract) {

                return res.status(404).json({
                    success: false,
                    message: "Contract not found."
                });

            }

            const filePath =
                await DocumentService.getFilePath(
                    "contract",
                    "pdf",
                    contract.generated_pdf
                );

            if (!DocumentService.fileExists(filePath)) {

                return res.status(404).json({

                    success: false,

                    message: "PDF file does not exist."

                });

            }

            return res.download(filePath);

        }
        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }

    //download docx contract
    static async downloadContractDOCX(req,res){

        try{

            const { participantId } = req.params;

            const docxBuffer =
                await ContractService.generateDocx(participantId);

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            );

            res.setHeader(
                "Content-Disposition",
                `attachment; filename=Contract-${participantId}.docx`
            );

            res.send(docxBuffer);

        }
        catch(err){

            console.error(err);

            res.status(500).json({

                success:false,
                message:"Unable to generate DOCX."

            });

        }

    }

}

export default ContractController;

