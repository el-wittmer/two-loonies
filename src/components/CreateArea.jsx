import { useState } from "react";

function CreateArea(props) {
  const [note, setNote] = useState({
    bucket: "",
    name: "",
    amount: "",
    currency: "USD"
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setNote(prevNote => {
      return {
        ...prevNote,
        [name]: value
      };
    });
  }

  function submitNote(event) {
    props.onAdd(note);
    setNote({
      bucket: "",
      amount: "",
      name: "",
      currency: "USD"
    });
    event.preventDefault();

  }

  return (
    <div>
      <form className="create-card">
        <input
          name="bucket" id="bucket"
          onChange={handleChange}
          placeholder="Bucket Name"
          value={note.bucket}
        />
        <input
          name="name" id="name"
          onChange={handleChange}
          placeholder="Your Name"
          value={note.name}
        />
        <input
          name="amount" id="amount"
          onChange={handleChange}
          value={note.amount}
          placeholder="Amount"
        />
        <select name="currency" id="currency" onChange={handleChange} value={note.currency}>
          <option value="USD">USD</option>
          <option value="CAD">CAD</option>
        </select>
        <button onClick={submitNote}>Add</button>
      </form>
    </div>
  );
}

export default CreateArea;