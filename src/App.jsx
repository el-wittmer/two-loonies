import './index.css'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Header from "./components/Header";
import Footer from "./components/Footer";
import Card from "./components/Card";
import CreateArea from "./components/CreateArea";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default function App() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [claims, setClaims] = useState(null)

  useEffect(() => {
    // Check for existing session using getClaims
    supabase.auth.getClaims().then(({ data: { claims } }) => {
      setClaims(claims)
    })

    // Listen for auth changes (triggers automatically on password login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getClaims().then(({ data: { claims } }) => {
        setClaims(claims)
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      alert(error.error_description || error.message)
    } else {
      setPassword('')
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setClaims(null)
  }

  const [cards, setCards] = useState([]);

  function addCard(newCard) {
    setCards(prevCards => {
      return [...prevCards, newCard];
    });
  }

  function deleteCard(id) {
    setCards(prevCards => {
      return prevCards.filter((card, index) => {
        return index !== id;
      });
    });
  }

  // If user is logged in, show welcome screen
  if (claims) {
    return (
      <div>
        <Header />
        <div className="welcome-message">
          <p>You are logged in as: {claims.email}</p>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
        <CreateArea onAdd={addCard} />
        {cards.map((card, index) => {
          return (
            <Card
              key={index}
              id={index}
              bucket={card.bucket}
              amount={card.amount}
              name={card.name}
              currency={card.currency}
              additionalNotes={card.additionalNotes}
              onDelete={deleteCard}
            />
          );
        })}
        <Footer />
      </div>
    );
  }

  // Show login form
  return (
    <div>
      <Header /> 
      <div className="welcome-message">
        <p className="welcome-element">Sign in with your email and password below</p>
        <form onSubmit={handleLogin}>
          <input
            className="welcome-element"
            type="email"
            placeholder="Your email"
            value={email}
            required={true}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="welcome-element"
            type="password"
            placeholder="Your password"
            value={password}
            required={true}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button disabled={loading} className="welcome-element">
            {loading ? <span>Loading</span> : <span>Sign In</span>}
          </button>
        </form>
      </div>
    </div>
  )
}
