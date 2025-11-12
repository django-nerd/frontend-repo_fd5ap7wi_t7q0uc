import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { ThemeProvider, useTheme } from './ThemeProvider'
import './index.css'

const NAVY = 'rgb(10, 25, 47)'
const GOLD = '#d4af37'

const Container = ({ children }) => (
  <div className="min-h-screen bg-white text-slate-800 dark:bg-[rgb(10,25,47)] dark:text-slate-100 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
  </div>
)

function Navbar() {
  const { theme, toggle } = useTheme()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const onSearch = (e) => {
    e.preventDefault()
    navigate(`/shop?search=${encodeURIComponent(query)}`)
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur border-b border-slate-200/40 dark:border-slate-700/40 bg-white/70 dark:bg-[rgb(10,25,47,0.7)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <Link to="/" className="font-extrabold tracking-tight text-xl text-slate-900 dark:text-white">
          Salman Books
        </Link>
        <nav className="hidden md:flex items-center gap-6 ml-6">
          <Link to="/shop" className="hover:text-[${GOLD}]">Shop</Link>
          <Link to="/about" className="hover:text-[${GOLD}]">About</Link>
          <Link to="/contact" className="hover:text-[${GOLD}]">Contact</Link>
        </nav>
        <form onSubmit={onSearch} className="flex-1 flex items-center max-w-md ml-auto">
          <input
            type="text"
            placeholder="Search by title, author, or genre"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[${GOLD}]"
          />
          <button className="px-4 py-2 rounded-r-md bg-slate-900 text-white dark:bg-slate-700 hover:bg-slate-800">
            Search
          </button>
        </form>
        <div className="flex items-center gap-3 ml-3">
          <Link to="/cart" className="relative px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Cart</Link>
          <button onClick={toggle} className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </header>
  )
}

function Hero({ featured }) {
  const navigate = useNavigate()
  return (
    <section className="pt-16 pb-12 sm:pt-24 sm:pb-20">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Discover. Read. Grow.
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Curated books for curious minds by Salman Khan, BTech CSE (AI & ML) — blending tech and literature to inspire lifelong learning.
          </p>
          <div className="mt-6 flex gap-4">
            <button onClick={() => navigate('/shop')} className="px-6 py-3 rounded-md bg-[${GOLD}] text-slate-900 font-semibold hover:brightness-110">Shop Now</button>
            <a href="#featured" className="px-6 py-3 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Featured</a>
          </div>
        </div>
        <div className="relative">
          <div className="grid grid-cols-3 gap-3">
            {featured.slice(0,6).map((b) => (
              <img key={b.id} src={b.image} alt={b.title} className="rounded-lg h-32 w-full object-cover shadow"/>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function BookCard({ book, onAdd }) {
  return (
    <div className="group rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
      <img src={book.image} alt={book.title} className="h-48 w-full object-cover"/>
      <div className="p-4">
        <h3 className="font-semibold text-lg group-hover:text-[${GOLD}] transition-colors">{book.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{book.author}</p>
        <p className="mt-2 text-sm line-clamp-2 text-slate-600 dark:text-slate-300">{book.short_description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold">${'{'}book.price.toFixed(2){'}'}</span>
          <Link to={`/book/${book.id}`} className="text-sm underline">Details</Link>
        </div>
        <button onClick={() => onAdd(book)} className="mt-3 w-full py-2 rounded-md bg-slate-900 text-white dark:bg-slate-700 hover:bg-slate-800">Add to Cart</button>
      </div>
    </div>
  )
}

function useBooks(searchParams = {}) {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const url = new URL(baseUrl + '/api/books')
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
    })
    fetch(url.toString())
      .then((r) => r.json())
      .then(setBooks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [JSON.stringify(searchParams)])

  return { books, loading, error }
}

function Home() {
  const { books } = useBooks({ featured: true, limit: 6 })
  const [cart, setCart] = useCart()
  return (
    <Container>
      <Navbar />
      <Hero featured={books} />
      <section id="featured" className="pb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Books</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((b) => (
            <BookCard key={b.id} book={b} onAdd={(item)=>setCart(addToCart(cart, item))} />
          ))}
        </div>
      </section>
      <Footer />
    </Container>
  )
}

function Shop() {
  const location = useLocation()
  const params = useMemo(() => Object.fromEntries(new URLSearchParams(location.search)), [location.search])
  const { books, loading } = useBooks(params)
  const [cart, setCart] = useCart()

  return (
    <Container>
      <Navbar />
      <section className="py-10">
        <h2 className="text-2xl font-bold mb-6">Shop</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((b) => (
              <BookCard key={b.id} book={b} onAdd={(item)=>setCart(addToCart(cart, item))} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </Container>
  )
}

function BookDetails() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [book, setBook] = useState(null)
  const [cart, setCart] = useCart()
  const { pathname } = useLocation()
  const id = pathname.split('/').pop()

  useEffect(() => {
    fetch(`${baseUrl}/api/books/${id}`).then((r) => r.json()).then(setBook)
  }, [id])

  if (!book) return (
    <Container>
      <Navbar />
      <div className="py-12">Loading...</div>
      <Footer />
    </Container>
  )

  return (
    <Container>
      <Navbar />
      <section className="py-10 grid md:grid-cols-2 gap-8">
        <img src={book.image} alt={book.title} className="w-full h-80 object-cover rounded-xl"/>
        <div>
          <h1 className="text-3xl font-bold">{book.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">by {book.author}</p>
          <div className="mt-3 flex items-center gap-2 text-amber-400">{'★'.repeat(Math.round(book.rating))}</div>
          <p className="mt-4 text-slate-700 dark:text-slate-200">{book.description}</p>
          {book.author_bio && (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">About the author:</span> {book.author_bio}</p>
          )}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-2xl font-bold">${'{'}book.price.toFixed(2){'}'}</span>
            <button onClick={()=>setCart(addToCart(cart, book))} className="px-6 py-3 rounded-md bg-slate-900 text-white dark:bg-slate-700">Buy Now</button>
          </div>
        </div>
      </section>
      <Footer />
    </Container>
  )
}

function About() {
  return (
    <Container>
      <Navbar />
      <section className="py-16">
        <h1 className="text-3xl font-bold mb-4">About Salman Khan</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl">
          Salman Khan is a passionate reader and tech enthusiast pursuing BTech in CSE (AI & ML). His vision is simple yet powerful: “To make reading affordable and accessible to everyone.” This bookstore is a step towards that vision.
        </p>
      </section>
      <Footer />
    </Container>
  )
}

function Contact() {
  return (
    <Container>
      <Navbar />
      <section className="py-16 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Contact</h1>
        <form className="space-y-4">
          <input className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" placeholder="Your Name"/>
          <input className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" placeholder="Email"/>
          <textarea rows="5" className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" placeholder="Message"/>
          <button className="px-6 py-3 rounded-md bg-slate-900 text-white dark:bg-slate-700">Send</button>
        </form>
        <div className="mt-6 text-slate-600 dark:text-slate-300">
          <p>Follow: <a className="underline" href="#">Twitter</a> • <a className="underline" href="#">LinkedIn</a> • <a className="underline" href="#">GitHub</a></p>
        </div>
      </section>
      <Footer />
    </Container>
  )
}

function CartPage() {
  const [cart, setCart] = useCart()
  const subtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0)
  const tax = Math.round(subtotal * 0.07 * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100
  return (
    <Container>
      <Navbar />
      <section className="py-12">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded"/>
                  <div className="flex-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.author}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setCart(updateQty(cart, item.id, Math.max(1, item.quantity-1)))} className="px-2 py-1 border rounded">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={()=>setCart(updateQty(cart, item.id, item.quantity+1))} className="px-2 py-1 border rounded">+</button>
                  </div>
                  <div className="w-20 text-right">${'{'}(item.price*item.quantity).toFixed(2){'}'}</div>
                  <button onClick={()=>setCart(removeFromCart(cart, item.id))} className="text-red-600">Remove</button>
                </div>
              ))}
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 h-fit">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>${'{'}subtotal.toFixed(2){'}'}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>${'{'}tax.toFixed(2){'}'}</span></div>
                <div className="pt-2 border-t flex justify-between font-semibold"><span>Total</span><span>${'{'}total.toFixed(2){'}'}</span></div>
              </div>
              <Link to="/checkout" className="mt-4 block w-full text-center px-4 py-2 rounded-md bg-slate-900 text-white dark:bg-slate-700">Checkout</Link>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </Container>
  )
}

function CheckoutPage() {
  const [cart, setCart] = useCart()
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const subtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0)
  const tax = Math.round(subtotal * 0.07 * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100

  const placeOrder = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      items: cart.map((c) => ({ book_id: c.id, title: c.title, price: c.price, quantity: c.quantity })),
      customer: {
        name: form.get('name'),
        email: form.get('email'),
        address: form.get('address'),
      },
      subtotal,
      tax,
      total,
      status: 'paid',
    }
    setSubmitting(true)
    try {
      const res = await fetch(baseUrl + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (res.ok) {
        setCart([])
        navigate(`/order/${data.order_id}`)
      } else {
        alert(data.detail || 'Order failed')
      }
    } catch (e) {
      alert(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container>
      <Navbar />
      <section className="py-12 grid lg:grid-cols-2 gap-10">
        <div>
          <h1 className="text-3xl font-bold mb-4">Checkout</h1>
          <form onSubmit={placeOrder} className="space-y-4">
            <input name="name" required className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" placeholder="Full Name"/>
            <input name="email" required type="email" className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" placeholder="Email"/>
            <textarea name="address" required rows="4" className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" placeholder="Shipping Address"/>
            <button disabled={submitting} className="px-6 py-3 rounded-md bg-slate-900 text-white dark:bg-slate-700">{submitting ? 'Processing...' : 'Place Order'}</button>
          </form>
        </div>
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 h-fit">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          {cart.length === 0 ? <p>No items in cart.</p> : (
            <div className="space-y-3">
              {cart.map((it)=> (
                <div key={it.id} className="flex justify-between text-sm"><span>{it.title} x {it.quantity}</span><span>${'{'}(it.price*it.quantity).toFixed(2){'}'}</span></div>
              ))}
              <div className="pt-2 border-t space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>${'{'}subtotal.toFixed(2){'}'}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>${'{'}tax.toFixed(2){'}'}</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>${'{'}total.toFixed(2){'}'}</span></div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </Container>
  )
}

function OrderSuccess() {
  return (
    <Container>
      <Navbar />
      <section className="py-16 text-center max-w-lg">
        <h1 className="text-3xl font-bold mb-3">Thank you for your purchase!</h1>
        <p className="text-slate-600 dark:text-slate-300">Your order has been placed successfully. A confirmation has been sent to your email.</p>
        <Link to="/shop" className="inline-block mt-6 px-6 py-3 rounded-md bg-slate-900 text-white dark:bg-slate-700">Continue Shopping</Link>
      </section>
      <Footer />
    </Container>
  )
}

// ---- Cart State Helpers ----
function useCart() {
  const [cart, setCart] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]')
    } catch {
      return []
    }
  })
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])
  return [cart, setCart]
}

function addToCart(cart, item) {
  const existing = cart.find((c) => c.id === item.id)
  if (existing) {
    return cart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))
  }
  return [...cart, { ...item, quantity: 1 }]
}
function updateQty(cart, id, qty) {
  return cart.map((c) => (c.id === id ? { ...c, quantity: qty } : c))
}
function removeFromCart(cart, id) {
  return cart.filter((c) => c.id !== id)
}

function Footer() {
  return (
    <footer className="py-10 text-sm text-slate-500 dark:text-slate-400">
      <div className="border-t border-slate-200 dark:border-slate-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} Salman Khan · All rights reserved.</p>
        <p className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-[${GOLD}]"/>Built with passion for books and tech.</p>
      </div>
    </footer>
  )
}

function AppRoutes() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:id" element={<OrderSuccess />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default AppRoutes
