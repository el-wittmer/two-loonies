import { useState } from 'react'
import Header from "./components/Header";
import Footer from "./components/Footer";
import Card from "./components/Card";
import CreateArea from "./components/CreateArea";

function App() {
  const [notes, setNotes] = useState([]);

  function addNote(newNote) {
    setNotes(prevNotes => {
      return [...prevNotes, newNote];
    });
  }

  function deleteNote(id) {
    setNotes(prevNotes => {
      return prevNotes.filter((noteItem, index) => {
        return index !== id;
      });
    });
  }

  return (
    <div>
      <Header />
      <CreateArea onAdd={addNote} />
      {notes.map((noteItem, index) => {
        return (
          <Card
            key={index}
            id={index}
            bucket={noteItem.bucket}
            amount={noteItem.amount}
            name={noteItem.name}
            currency={noteItem.currency}
            onDelete={deleteNote}
          />
        );
      })}
      <Footer />
    </div>
  );
}

export default App;
