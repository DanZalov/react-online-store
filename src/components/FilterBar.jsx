import SearchIcon from './SearchIcon'

export default function FilterBar({ newFilter, setNewFilter, handleSearch }) {
  function handleFieldChange(e) {
    setNewFilter({ value: '', field: e.target.value })
  }

  function handleInputChange(e) {
    let { value } = e.target
    const name = newFilter.field
    if (name === 'price') {
      value = Number(value)
      if (value === 0) {
        value = ''
      }
    }
    setNewFilter({
      ...newFilter,
      value,
    })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="filters">
      <select value={newFilter.field} onChange={handleFieldChange}>
        <option value="product">Фильтр по названию</option>
        <option value="price">Фильтр по цене</option>
        <option value="brand">Фильтр по бренду</option>
      </select>
      <span>
        <input
          type="text"
          value={newFilter.value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Введите значение"
        />
        <button onClick={handleSearch}>
          <SearchIcon size={24} />
        </button>
      </span>
    </div>
  )
}
