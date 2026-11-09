import { useState, useEffect } from "react";

function Card(props) {
  const [USDamount, setUSDAmount] = useState("");
  const [CADamount, setCADAmount] = useState("");

  // Edit mode state & input states pre-filled with current props
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(props.amount || "");
  const [additionalNotes, setAdditionalNotes] = useState(props.additionalNotes || "");

  function handleDelete() {
    props.onDelete(props.id);
  }

  function handleSave(e) {
    e.preventDefault();
    props.onEdit(props.id, {
      amount: amount.replace(/[$,]/g, ""),
      additionalNotes,
    });
    setIsEditing(false);
  }

  function handleCancel() {
    setAmount(props.amount || "");
    setAdditionalNotes(props.additionalNotes || "");
    setIsEditing(false);
  }

  const cleanAmount = props.amount.replace(/[$,]/g, "");

  useEffect(() => {
    async function runConversion() {
      const api = "https://api.frankfurter.dev";
      try {
        if (props.currency === "USD") {
          setUSDAmount(cleanAmount);
          const response = await fetch(`${api}/v2/rate/usd/cad`);
          const data = await response.json();
          const converted = (parseFloat(cleanAmount) * data.rate).toFixed(2);
          setCADAmount(converted);
        } else {
          setCADAmount(cleanAmount);
          const response = await fetch(`${api}/v2/rate/cad/usd`);
          const data = await response.json();
          const converted = (parseFloat(cleanAmount) * data.rate).toFixed(2);
          setUSDAmount(converted);
        }
      } catch (error) {
        console.error("Failed to convert currency:", error);
      }
    }

    runConversion();
  }, [props.currency, props.amount, cleanAmount]);

  if (isEditing) {
    return (
      <form className="modify-card" onSubmit={handleSave}>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
        <textarea
          type="textarea"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Notes"
        />
        <button type="submit">Save</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
      </form>
    );
  }

  return (
    <div className="card">
      <h2>{props.bucket}</h2>
      <p>{props.name}</p>
      <p>USD: {USDamount}</p>
      <p>CAD: {CADamount}</p>
      <p>Notes: {props.additionalNotes}</p>
      <button onClick={() => setIsEditing(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
        </svg>
      </button>
      <button onClick={handleDelete}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
        </svg>
      </button>
    </div>
  );
}

export default Card;