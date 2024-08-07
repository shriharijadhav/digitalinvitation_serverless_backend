// const connectToDatabase = require('../dbConnect');
// const Todo = require('../models/Todo'); // Adjust the path as per your model location

export default function handler(req, res)  {
//   await connectToDatabase();

  const { id } = req.query;

  try {
    // await Todo.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Todo deleted successfully'+id });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete todo' });
  }
};
