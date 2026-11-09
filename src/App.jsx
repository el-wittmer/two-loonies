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

  const [cards, setCards] = useState([]);

  useEffect(() => {
    if (!claims) return;

    async function fetchCards() {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading cards:', error.message);
      } else {
        setCards(data);
      }
    }

    fetchCards();
  }, [claims]);

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

  async function addCard(newCard) {
    const { data, error } = await supabase
      .from('cards')
      .insert([
        {
          bucket: newCard.bucket,
          amount: newCard.amount,
          name: newCard.name,
          currency: newCard.currency,
          additional_notes: newCard.additionalNotes,
        },
      ])
      .select();

    if (error) {
      alert('Failed to save card: ' + error.message);
    } else if (data && data.length > 0) {
      setCards((prevCards) => [...prevCards, data[0]]);
    }
  }

  async function editCard(id, updatedCard) {
    const { data, error } = await supabase
      .from('cards')
      .update({
        bucket: updatedCard.bucket,
        amount: updatedCard.amount,
        name: updatedCard.name,
        currency: updatedCard.currency,
        additional_notes: updatedCard.additionalNotes,
      })
      .eq('id', id)
      .select();

    if (error) {
      alert('Failed to update card: ' + error.message);
    } else if (data && data.length > 0) {
      setCards((prevCards) =>
        prevCards.map((card) => (card.id === id ? data[0] : card))
      );
    }
  }

  async function deleteCard(id) {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Failed to delete card: ' + error.message);
    } else {
      setCards((prevCards) => prevCards.filter((card) => card.id !== id));
    }
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
        {cards.map((card) => {
          return (
            <Card
              key={card.id}
              id={card.id}
              bucket={card.bucket}
              amount={String(card.amount ?? '')}
              name={card.name}
              currency={card.currency}
              additionalNotes={card.additional_notes}
              onDelete={deleteCard}
              onEdit={editCard}
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
