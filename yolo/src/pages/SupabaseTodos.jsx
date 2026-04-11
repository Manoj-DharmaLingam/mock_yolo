import { useEffect, useState } from 'react'

const MOCK_TODOS = [
  { id: 1, name: 'Wire static product data' },
  { id: 2, name: 'Run checkout in mock mode' },
  { id: 3, name: 'Verify profile and orders screens' },
]

export default function SupabaseTodos() {
  const [todos, setTodos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setTodos(MOCK_TODOS)
      setIsLoading(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <p style={{ padding: '2rem' }}>Loading todos...</p>
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Mock Todos</h1>
      {todos.length === 0 ? (
        <p>No todos found.</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.name}</li>
          ))}
        </ul>
      )}
    </main>
  )
}
