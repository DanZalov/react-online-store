export default function ProductList({ products }) {
  return (
    <div className="product-list">
      {products.map((product) => (
        <div key={product.id} className="product">
          <p>
            <strong>ID:</strong> {product.id}
          </p>
          <p>
            <strong>Название:</strong> {product.product}
          </p>
          <p>
            <strong>Цена:</strong> {product.price}
          </p>
          <p>
            <strong>Бренд:</strong> {product.brand}
          </p>
        </div>
      ))}
    </div>
  )
}
