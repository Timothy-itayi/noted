import { useState, useEffect } from "react";
import {
  Authenticator,
  Button as AmplifyButton,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Image,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { getUrl } from "aws-amplify/storage";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import "98.css"; // Import 98.css

/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */

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
          console.log(linkToStorageFile.url);
          note.image = linkToStorageFile.url;
        }
        return note;
      })
    );
    console.log(notes);
    setNotes(notes);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    console.log(form.get("image").name);

    const { data: newNote } = await client.models.Note.create({
      name: form.get("name"),
      description: form.get("description"),
      image: form.get("image").name,
    });

    console.log(newNote);
    if (newNote.image)
      if (newNote.image)
        await uploadData({
          path: ({ identityId }) => `media/${identityId}/${newNote.image}`,
          data: form.get("image"),
        }).result;

    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id }) {
    const toBeDeletedNote = {
      id: id,
    };

    const { data: deletedNote } = await client.models.Note.delete(
      toBeDeletedNote
    );
    console.log(deletedNote);

    fetchNotes();
  }

  // Custom styles to override Amplify UI with Windows 98 aesthetics
  const win98Styles = {
    container: {
      backgroundColor: "#c0c0c0",
      padding: "16px",
      width: "100%",
      maxWidth: "1000px",
      margin: "20px auto",
      fontFamily: "'Pixelated MS Sans Serif', Arial",
    },
    window: {
      margin: "16px 0",
      border: "none",
      boxShadow: "none",
    },
    formField: {
      margin: "8px 0",
    },
    fileInput: {
      backgroundColor: "white",
      padding: "4px",
      border: "2px inset #a9a9a9",
    },
    noteCard: {
      backgroundColor: "#c0c0c0",
      boxShadow: "inset 1px 1px 0px 1px rgba(255,255,255,0.6), inset -1px -1px 0px 1px rgba(0,0,0,0.6)",
      padding: "8px",
      margin: "8px",
      maxWidth: "400px",
    },
    title: {
      backgroundColor: "#000080",
      color: "white",
      padding: "2px 4px",
      fontWeight: "bold",
      marginBottom: "8px",
      textAlign: "center",
    }
  };

  return (
    <Authenticator>
      {({ signOut }) => (
        <div className="window" style={win98Styles.container}>
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
                  
                  <div className="field-row-stacked" style={win98Styles.formField}>
                    <label htmlFor="name">Note Name:</label>
                    <input id="name" name="name" type="text" required />
                  </div>
                  
                  <div className="field-row-stacked" style={win98Styles.formField}>
                    <label htmlFor="description">Note Description:</label>
                    <textarea id="description" name="description" rows="4" required></textarea>
                  </div>
                  
                  <div className="field-row-stacked" style={win98Styles.formField}>
                    <label htmlFor="image">Image:</label>
                    <input 
                      id="image" 
                      name="image" 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      style={win98Styles.fileInput}
                    />
                  </div>
                  
                  <div className="field-row" style={{ justifyContent: "flex-end", marginTop: "16px" }}>
                    <button type="submit">Create Note</button>
                  </div>
                </fieldset>
              </form>
            </div>

            <div className="sunken-panel" style={{ marginTop: "24px", padding: "16px" }}>
              <h2 style={{ marginTop: 0 }}>Current Notes</h2>
              
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                {notes.length === 0 ? (
                  <div className="status-bar">
                    <p className="status-bar-field">No notes found</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id || note.name} className="window" style={win98Styles.noteCard}>
                      <div className="title-bar">
                        <div className="title-bar-text">{note.name}</div>
                      </div>
                      <div className="window-body">
                        <p>{note.description}</p>
                        {note.image && (
                          <div style={{ textAlign: "center", marginTop: "8px" }}>
                            <img
                              src={note.image}
                              alt={`visual aid for ${note.name}`}
                              style={{ maxWidth: "100%", border: "2px inset #a9a9a9" }}
                            />
                          </div>
                        )}
                        <div style={{ textAlign: "right", marginTop: "8px" }}>
                          <button onClick={() => deleteNote(note)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="status-bar" style={{ marginTop: "24px" }}>
              <div className="status-bar-field">
                <button onClick={signOut}>Sign Out</button>
              </div>
              <div className="status-bar-field">Total Notes: {notes.length}</div>
            </div>
          </div>
        </div>
      )}
    </Authenticator>
  );
}