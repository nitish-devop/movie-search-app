// src/pages/Home.tsx
import { useState } from "react";
import GenereList from "../components/GenereList";
import MovieSection from "../components/MovieSection";

type Genre = {
  id: number;
  name: string;
}

interface HomeProps {
  genres: Genre[];
}

function Home({ genres }: HomeProps) {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);

  return (
    <div className="animate-fadeIn">
      <GenereList
        genres={genres}
        selectedGenreId={selectedGenre?.id ?? null}
        onSelectGenre={setSelectedGenre}
        onClearGenre={() => setSelectedGenre(null)}
      />

      {selectedGenre ? (
        <MovieSection title={`${selectedGenre.name} Movies`} slug="genre" genreId={selectedGenre.id} />
      ) : (
        <>
          <MovieSection title="Popular" slug="popular" />
          <MovieSection title="Top Rated" slug="top_rated" />
          <MovieSection title="Upcoming" slug="upcoming" />
        </>
      )}
    </div>
  );
}

export default Home;
