export default function Pagination({ currentPage, setCurrentPage, nextPage }) {
  function handlePrevPage() {
    setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)
  }

  function handleNextPage() {
    setCurrentPage((currentPage) => currentPage + 1)
  }

  return (
    <div className="pagination">
      <button onClick={handlePrevPage} disabled={currentPage === 1}>
        Пред
      </button>
      <span>Стр {currentPage}</span>
      <button onClick={handleNextPage} disabled={!nextPage}>
        След
      </button>
    </div>
  )
}
