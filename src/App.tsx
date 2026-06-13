

function App() {
  const apiKey = import.meta.env.VITE_TMDB_ACCESS_TOKEN
  console.log('API Key:', apiKey)

  return (
   <>
      <h1>Movie Search App</h1>
   </>
  )
}

export default App
