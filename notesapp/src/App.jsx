import { useState, useEffect } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { getUrl } from "aws-amplify/storage";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import "98.css"; // Import 98.css

Amplify.configure(outputs);
const client = generateClient({
  authMode: "userPool",
});

export default function App() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const { data: notes } = await client.models.Note.list();
    await Promise.all(
      notes.map(async (note) => {
        if (note.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) => `media/${identityId}/${note.image}`,
          });
          note.image = linkToStorageFile.url;
        }
        return note;
      })
    );
    setNotes(notes);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const { data: newNote } = await client.models.Note.create({
      name: form.get("name"),
      description: form.get("description"),
      image: form.get("image").name,
    });

    if (newNote.image) {
      await uploadData({
        path: ({ identityId }) => `media/${identityId}/${newNote.image}`,
        data: form.get("image"),
      }).result;
    }

    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id }) {
    const toBeDeletedNote = { id: id };
    await client.models.Note.delete(toBeDeletedNote);
    fetchNotes();
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        <div className="authenticator-window">
          <div className="title-bar">
            <div className="title-bar-text">Noted</div>
            <div className="title-bar-controls">
              <button aria-label="Minimize"></button>
              <button aria-label="Maximize"></button>
              <button aria-label="Close"></button>
            </div>
          </div>

          <div className="window-body">
            <div className="field-row-stacked">
              <form onSubmit={createNote}>
                <fieldset>
                  <legend>Create New Note</legend>
                  <div className="field-row-stacked">
                    <label htmlFor="name">Note Name:</label>
                    <input id="name" name="name" type="text" required />
                  </div>
                  <div className="field-row-stacked">
                    <label htmlFor="description">Note Description:</label>
                    <textarea id="description" name="description" rows="4" required></textarea>
                  </div>
                  <div className="field-row-stacked">
                    <label htmlFor="image">Image:</label>
                    <input id="image" name="image" type="file" accept="image/png, image/jpeg" />
                  </div>
                  <div className="field-row" style={{ justifyContent: "flex-end", marginTop: "16px" }}>
                    <button type="submit">Create Note</button>
                  </div>
                </fieldset>
              </form>
            </div>

            <div style={{ marginTop: "24px", padding: "16px" }}>
              <h2>Current Notes</h2>
              {notes.length === 0 ? (
                <p>No notes found</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="window">
                    <div className="title-bar">
                      <div className="title-bar-text">{note.name}</div>
                    </div>
                    <div className="window-body">
                      <p>{note.description}</p>
                      {note.image && <img src={note.image} alt={`visual aid for ${note.name}`} />}
                      <div style={{ textAlign: "right", marginTop: "8px" }}>
                        <button onClick={() => deleteNote(note)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="status-bar" style={{ marginTop: "24px" }}>
              <button onClick={signOut}>Sign Out</button>
              <div>Total Notes: {notes.length}</div>
            </div>
          </div>
        </div>
      )}
    </Authenticator>
  );
}
