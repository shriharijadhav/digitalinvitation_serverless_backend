const todoModel = require('../model/todoModel');
const dbConnect = require('../config/dbConnect')
export default async function handler(req, res) {
    try {
        
    await dbConnect()
    
    
    const allTodos = await todoModel.find();
    return res.status(200).json({
        allTodos
    })
    } catch (error) {
        return res.json({ error: error});
    }
}