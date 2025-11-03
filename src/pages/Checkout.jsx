import React, { useState } from 'react';
import './Checkout.css';


export default function CheckoutPage() {
const [cart, setCart] = useState([
{ id: 1, name: 'Sản phẩm A', price: 120000, quantity: 1 },
{ id: 2, name: 'Sản phẩm B', price: 80000, quantity: 2 },
]);


const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);


const handleQuantityChange = (id, newQuantity) => {
setCart(cart.map(item =>
item.id === id ? { ...item, quantity: newQuantity } : item
));
};


return (
<div className="checkout-container">
<h1>Trang Thanh Toán</h1>


<div className="cart-section">
{cart.map(item => (
<div key={item.id} className="cart-item">
<div>
<h3>{item.name}</h3>
<p>{item.price.toLocaleString()}₫</p>
</div>
<div className="quantity-control">
<input
type="number"
min="1"
value={item.quantity}
onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
/>
</div>
</div>
))}
</div>


<div className="summary-section">
<h2>Tổng cộng: {total.toLocaleString()}₫</h2>
<button className="checkout-btn">Thanh Toán</button>
</div>
</div>
);
}