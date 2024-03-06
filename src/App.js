import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import md5 from 'md5'

function App() {
  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [filterTimeout, setFilterTimeout] = useState(null)
  const [filter, setFilter] = useState({
    name: '',
    price: '',
    brand: '',
  })
  const [loading, setLoading] = useState(false)

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

  async function fetchFilteredIds(filter) {
    const data = await fetchData({
      action: 'filter',
      params: {
        ...filter,
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
  }, [currentPage])

  const handlePrevPage = () => {
    setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)
  }

  const handleNextPage = () => {
    setCurrentPage(currentPage => currentPage + 1)
  }

  function handleFilterChange(e) {
    let { name, value } = e.target
    if (name === 'price') {
      value = Number(value)
      if (value === 0) {
        value = ""
      }
    }
    setFilter({
      [name]: value,
    })

    clearTimeout(filterTimeout)
    setFilterTimeout(setTimeout(() => {
      if (value === "") {
        fetchIds()
      } else {
        fetchFilteredIds({
          [name]: value,
        })
      }
    }, 1000))
  }

  return (
    <div className="App">
      <h1>Product List</h1>
      <div className="filters">
        <input
          type="text"
          name="product"
          value={filter.name}
          onChange={handleFilterChange}
          placeholder="Filter by name"
        />
        <input
          type="number"
          name="price"
          value={filter.price}
          onChange={handleFilterChange}
          placeholder="Filter by price"
        />
        <input
          type="text"
          name="brand"
          value={filter.brand}
          onChange={handleFilterChange}
          placeholder="Filter by brand"
        />
      </div>
      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="product-list">
          {products.map((product) => (
            <div key={product.id} className="product">
              <p>ID: {product.id}</p>
              <p>Name: {product.product}</p>
              <p>Price: {product.price}</p>
              <p>Brand: {product.brand}</p>
            </div>
          ))}
        </div>
      )}
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Prev
        </button>
        <span>Page {currentPage}</span>
        <button onClick={handleNextPage}>
          Next
        </button>
      </div>
    </div>
  )
}

export default App
