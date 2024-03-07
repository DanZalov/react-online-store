import md5 from 'md5'

export function generateAuthHeader() {
  const password = 'Valantis'
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const authString = `${password}_${timestamp}`
  return md5(authString)
}

export function uniqueProductArray(products) {
  const uniqueObj = {}
  products.forEach((product) => {
    if (!uniqueObj[product.id]) {
      uniqueObj[product.id] = product
    }
  })
  return Object.values(uniqueObj)
}
