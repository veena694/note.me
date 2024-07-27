const Notes = require("../models/notesModel");
const User = require("../models/userModel");

async function createNote(req, res) {
  const { text } = req.body;
  // console.log(req.userId);
  try {
    if (!req.userId)
      res
        .status(403)
        .json({ success: 403, message: `You are not authorized  ${error}` });

    // console.log(req.userId);
    const user = await User.findById(req.userId);
    // console.log(user);
    if (!user)
      res
        .status(404)
        .json({ success: 403, message: `User not found ${error}` });

    const newNote = new Notes({
      text,
      userId: user._id,
    });
    await newNote
      .save()
      .then(() => {
        console.log("Saved");
      })
      .catch((err) => {
        console.log("Not save", err);
      });
    res.status(201).json({ success: 200, data: newNote });
  } catch (error) {
    res
      .status(500)
      .json({ success: 500, message: `Error creating note ${error}` });
  }
}

async function getNote(req, res) {
  try {
    const note = await Notes.findOne(req.params.id);
    if (!note) {
      res.status(500).json({ message: "Note not present" });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: `Error fetching notes ${err}` });
  }
}

async function getAllNotes(req, res) {
   try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notes", error });
    }

async function updateNote(req, res) {
  try {
        const { id } = req.params;
        const { text } = req.body;
        const updatedNote = await Notes.findByIdAndUpdate(
            id,
            { text },
            { new: true }
        );
        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: "Error updating note", error });
    }
}

async function deleteNote(req, res) {
  try {
        const { id } = req.params;
        const deletedNote = await Notes.findByIdAndDelete(id);
        if (!deletedNote) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.json({ message: "Note deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting note", error });
    }
}

module.exports = {
  createNote,
  getNote,
  getAllNotes,
  updateNote,
  deleteNote,
};
