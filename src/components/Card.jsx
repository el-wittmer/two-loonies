import { useState, useEffect } from "react";

function Card(props) {
  const [USDamount, setUSDAmount] = useState("");
  const [CADamount, setCADAmount] = useState("");

  function handleClick() {
    props.onDelete(props.id);
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

  return (
    <div className="card">
      <h2>{props.bucket}</h2>
      <p>{props.name}</p>
      <p>USD: {USDamount}</p>
      <p>CAD: {CADamount}</p>
      <button onClick={handleClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
        </svg>
      </button>
    </div>
  );
}

export default Card;