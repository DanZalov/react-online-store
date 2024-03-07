import React, { useState, useEffect } from 'react'
import './App.css'
import md5 from 'md5'

function App() {
  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const defaultNewFilter = {
    field: 'product', 
    value: ''
  }
  const [newFilter, setNewFilter] = useState(defaultNewFilter)
  const [loading, setLoading] = useState(false)
  const [nextPage, setNextPage] = useState(false)

  function generateAuthHeader() {
    const password = 'Valantis'
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const authString = `${password}_${timestamp}`
    return md5(authString)
  }
  
  async function fetchData(body) {
    setLoading(true)
    const response = await fetch(`http://api.valantis.store:40000/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth': generateAuthHeader(),
      },
      body: JSON.stringify(body),
    })
    if (response.ok) {
      return await response.json()
    } else {
      return fetchData(body)
    }
  }

  async function fetchProducts(productIdArr) {
    const data = await fetchData({
      action: 'get_items',
      params: {
        ids: productIdArr,
      },
    })
    setLoading(false)
    if (data.result) {
      const products = data.result
      const uniqueProducts = {}
      if (products.length < 50) {
        setNextPage(false)
      } else {
        setNextPage(true)
      }
      products.forEach(product => {
        if (!uniqueProducts[product.id]) {
          uniqueProducts[product.id] = product
        }
      })
      setProducts(Object.values(uniqueProducts))
    } else {
      console.error('Fetching products error:', data)
    }
  }

  async function fetchFilteredIds(newFilter) {
    const data = await fetchData({
      action: 'filter',
      params: {
        [newFilter.field]: newFilter.value
      },
    })
    if (data.result) {
      fetchProducts(data.result)
    } else {
      console.error('Fetching filtered Id error:', data)
    }
  }

  async function fetchIds() {
    const data = await fetchData({
      action: 'get_ids',
      params: {
        offset: (currentPage - 1) * 50,
        limit: 50,
      },
    })
    if (data.result) {
      fetchProducts(data.result)
    } else {
      console.error('Fetching filtered Id error:', data)
    }
  }

  useEffect(() => {
    fetchIds()
    setNewFilter(defaultNewFilter) //There is no such a functionality at the next page.. :(
  }, [currentPage])

  const handlePrevPage = () => {
    setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)
  }

  const handleNextPage = () => {
    setCurrentPage(currentPage => currentPage + 1)
  }

  const handleFieldChange = (e) => {
    setNewFilter({ value: "", field: e.target.value });
  }

  const handleInputChange = (e) => {
    let { value } = e.target
    const name = newFilter.field
    if (name === 'price') {
      value = Number(value)
      if (value === 0) {
        value = ""
      }
    }
    setNewFilter({
      ...newFilter,
      value
    })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  function handleSearch() {
    if (!loading) {
      if (newFilter.value === "") {
        fetchIds()
      } else {
        fetchFilteredIds(newFilter)
      }
    }
  }

  return (
    <div className="App">
      <h1>Каталог товаров</h1>
      <div className="filters">
        <select value={newFilter.field} onChange={handleFieldChange}>
          <option value="product">Фильтр по названию</option>
          <option value="price">Фильтр по цене</option>
          <option value="brand">Фильтр по бренду</option>
        </select>
        <span>
          <input type="text" value={newFilter.value} onChange={handleInputChange} onKeyDown={handleKeyDown}
          placeholder="Введите значение" />
          <button onClick={handleSearch}>
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 50 50">
              <path d="M 21 3 C 11.601563 3 4 10.601563 4 20 C 4 29.398438 11.601563 37 21 37 C 24.355469 37 27.460938 36.015625 30.09375 34.34375 L 42.375 46.625 L 46.625 42.375 L 34.5 30.28125 C 36.679688 27.421875 38 23.878906 38 20 C 38 10.601563 30.398438 3 21 3 Z M 21 7 C 28.199219 7 34 12.800781 34 20 C 34 27.199219 28.199219 33 21 33 C 13.800781 33 8 27.199219 8 20 C 8 12.800781 13.800781 7 21 7 Z"></path>
            </svg>
          </button>
        </span>
      </div>
      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          <div className="product-list">
            {products.map((product) => (
              <div key={product.id} className="product">
                <p><strong>ID:</strong> {product.id}</p>
                <p><strong>Название:</strong> {product.product}</p>
                <p><strong>Цена:</strong> {product.price}</p>
                <p><strong>Бренд:</strong> {product.brand}</p>
              </div>
            ))}
          </div>
          <div className="pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              Prev
            </button>
            <span>Page {currentPage}</span>
            <button onClick={handleNextPage} disabled={!nextPage}>
              Next
            </button>
          </div>
        </>
        
      )}
    </div>
  )
}

export default App
