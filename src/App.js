import React, { useState, useEffect } from 'react'
import './App.css'
import md5 from 'md5'
import SearchIcon from './components/SearchIcon'
import Loader from './components/Loader'
import Pagination from './components/Pagination'

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
      setNextPage(false)
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
      setNextPage(true)
      fetchProducts(data.result)
    } else {
      console.error('Fetching filtered Id error:', data)
    }
  }

  useEffect(() => {
    adaptiveFetch()
  }, [currentPage])

  // const handlePrevPage = () => {
  //   setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)
  // }

  // const handleNextPage = () => {
  //   setCurrentPage(currentPage => currentPage + 1)
  // }

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
      if (currentPage === 1) {
        adaptiveFetch()
      } else {
        setCurrentPage(1)
      }
    }
  }

  function adaptiveFetch() {
    if (newFilter.value === "") {
      fetchIds()
    } else {
      fetchFilteredIds(newFilter)
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
            <SearchIcon size={24} />
          </button>
        </span>
      </div>
      <Loader show={loading} />
      {!loading && (
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
          <Pagination currentPage={currentPage} nextPage={nextPage} setCurrentPage={setCurrentPage}/>
        </>
        
      )}
    </div>
  )
}

export default App
