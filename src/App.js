import React, { useState, useEffect } from 'react'
import './App.css'
import Loader from './components/Loader'
import Pagination from './components/Pagination'
import ProductList from './components/ProductList'
import { generateAuthHeader, uniqueProductArray } from './utilities'
import FilterBar from './components/FilterBar'

function App() {
  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const defaultNewFilter = {
    field: 'product',
    value: '',
  }
  const [newFilter, setNewFilter] = useState(defaultNewFilter)
  const [loading, setLoading] = useState(false)
  const [nextPage, setNextPage] = useState(false)
  const [showPagination, setShowPagination] = useState(false)

  async function fetchData(body) {
    setLoading(true)
    const response = await fetch(`https://api.valantis.store:41000/`, {
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
      if (products.length < 50) {
        setNextPage(false)
      }
      setProducts(uniqueProductArray(products))
    } else {
      console.error('Fetching products error:', data)
    }
  }

  async function fetchFilteredIds(newFilter) {
    const data = await fetchData({
      action: 'filter',
      params: {
        [newFilter.field]: newFilter.value,
      },
    })
    if (data.result) {
      setShowPagination(false)
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
      setShowPagination(true)
      fetchProducts(data.result)
    } else {
      console.error('Fetching filtered Id error:', data)
    }
  }

  useEffect(() => {
    adaptiveFetch()
  }, [currentPage])

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
    if (newFilter.value === '') {
      fetchIds()
    } else {
      fetchFilteredIds(newFilter)
    }
  }

  return (
    <div className="App">
      <h1>Каталог товаров</h1>
      <FilterBar
        newFilter={newFilter}
        setNewFilter={setNewFilter}
        handleSearch={handleSearch}
      />
      <Loader show={loading} />
      {!loading &&
        (products.length > 1 ? (
          <>
            <ProductList products={products} />
            <Pagination
              currentPage={currentPage}
              nextPage={nextPage}
              setCurrentPage={setCurrentPage}
              show={showPagination}
            />
          </>
        ) : (
          <h3>К сожалению, ничего не найдено.. :(</h3>
        ))}
    </div>
  )
}

export default App
