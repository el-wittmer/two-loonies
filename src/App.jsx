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
  const [claims, setClaims] = useState(null)

  // Check URL params on initial render
  const params = new URLSearchParams(window.location.search)
  const hasTokenHash = params.get('token_hash')

  const [verifying, setVerifying] = useState(!!hasTokenHash)
  const [authError, setAuthError] = useState(null)
  const [authSuccess, setAuthSuccess] = useState(false)

  useEffect(() => {
    // Check if we have token_hash in URL (magic link callback)
    const params = new URLSearchParams(window.location.search)
    const token_hash = params.get('token_hash')
    const type = params.get('type')

    if (token_hash) {
      // Verify the OTP token
      supabase.auth
        .verifyOtp({
          token_hash,
          type: type || 'email',
        })
        .then(({ error }) => {
          if (error) {
            setAuthError(error.message)
          } else {
            setAuthSuccess(true)
            // Clear URL params
            window.history.replaceState({}, document.title, '/')
          }
          setVerifying(false)
        })
    }

    // Check for existing session using getClaims
    supabase.auth.getClaims().then(({ data: { claims } }) => {
      setClaims(claims)
    })

    // Listen for auth changes
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
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: false,
      },
    })
    if (error) {
      alert(error.error_description || error.message)
    } else {
      alert('Check your email for the login link!')
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

  // Show verification state
  if (verifying) {
    return (
      <div>
        <h1>Authentication</h1>
        <p>Confirming your magic link...</p>
        <p>Loading...</p>
      </div>
    )
  }

  // Show auth error
  if (authError) {
    return (
      <div>
        <h1>Authentication</h1>
        <p>✗ Authentication failed</p>
        <p>{authError}</p>
        <button
          onClick={() => {
            setAuthError(null)
            window.history.replaceState({}, document.title, '/')
          }}
        >
          Return to login
        </button>
      </div>
    )
  }

  // Show auth success (briefly before claims load)
  if (authSuccess && !claims) {
    return (
      <div>
        <h1>Authentication</h1>
        <p>✓ Authentication successful!</p>
        <p>Loading your account...</p>
      </div>
    )
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
        <p className="welcome-element">Sign in via magic link with your email below</p>
        <form onSubmit={handleLogin}>
          <input
            className="welcome-element"
            type="email"
            placeholder="Your email"
            value={email}
            required={true}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button disabled={loading} className="welcome-element">
            {loading ? <span>Loading</span> : <span>Send magic link</span>}
          </button>
        </form>
      </div>
    </div>
  )
}


