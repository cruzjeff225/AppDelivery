import './CategoryFilter.css';

export default function CategoryFilter({ categories, activeCatId, onChange }) {
  return (
    <nav className="cat-filter" aria-label="Filtrar por categoría">
      <button
        className={`cat-filter__btn${activeCatId === null ? ' cat-filter__btn--active' : ''}`}
        onClick={() => onChange(null)}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`cat-filter__btn${activeCatId === cat.id ? ' cat-filter__btn--active' : ''}`}
          onClick={() => onChange(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </nav>
  );
}
