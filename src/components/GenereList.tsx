type Genre = {
    id: number;
    name: string;
}

type GenereListProps = {
    genres: Genre[];
    selectedGenreId: number | null;
    onSelectGenre: (genre: Genre) => void;
    onClearGenre: () => void;
}

function GenereList({ genres, selectedGenreId, onSelectGenre, onClearGenre }: GenereListProps) {
    return (
        <div className="w-full bg-neutral-950 py-3 px-4 border-y border-neutral-800">
            <div className="flex flex-nowrap overflow-x-auto gap-3 scrollbar-none snap-x snap-mandatory">
                <button
                    type="button"
                    onClick={onClearGenre}
                    className={`py-2 px-5 rounded-xl font-medium text-sm flex-shrink-0 snap-start transition-transform active:scale-95 cursor-pointer ${
                        selectedGenreId === null ? "bg-white text-black" : "bg-neutral-800 text-white"
                    }`}
                >
                    All
                </button>

                {genres.map((genre) => (
                    <button 
                        type="button"
                        onClick={() => onSelectGenre(genre)}
                        className={`py-2 px-5 rounded-xl font-medium text-sm flex-shrink-0 snap-start transition-transform active:scale-95 cursor-pointer ${
                            selectedGenreId === genre.id ? "bg-white text-black" : "bg-neutral-800 text-white"
                        }`}
                        key={genre.id}
                    >
                        {genre.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default GenereList;
