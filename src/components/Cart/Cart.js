import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import { BASE_PATH, STORAGE_PRODUCTS_CART } from "../../utils/constants";
import { ReactComponent as CartEmpty } from "../../assets/svg/cart-empty.svg";
import { ReactComponent as Close } from "../../assets/svg/close.svg";
import { ReactComponent as Garbage } from "../../assets/svg/garbage.svg";
import {
  removeArrayDuplicates,
  countDuplicatesItemArray,
  removeItemArray
} from "../../utils/arrayFunc";

import "./Cart.scss";

export default function Cart(props) {
  const { products, productsCart, getProductsCart } = props;
  const [cartOpen, setCartOpen] = useState(true);
  const widthCartContent = cartOpen ? 400 : 0;
  const [singelProductsCart, setSingelProductsCart] = useState([]);
  const [cartTotalPrice, setCartTotalPrice] = useState(0);

  useEffect(() => {
    const allProductsId = removeArrayDuplicates(productsCart);
    setSingelProductsCart(allProductsId);
  }, [productsCart]);

  useEffect(() => {
    const productData = [];
    let totalPrice = 0;

    const allProductsId = removeArrayDuplicates(productsCart);
    allProductsId.forEach(productId => {
      const quantity = countDuplicatesItemArray(productId, productsCart);
      const productValue = {
        id: productId,
        quantity: quantity
      };
      productData.push(productValue);
    });

    if (!products.loading && products.result) {
      products.result.forEach(product => {
        productData.forEach(item => {
          if (product.id == item.id) {
            const totalValue = product.price * item.quantity;
            totalPrice = totalPrice + totalValue;
          }
        });
      });
    }
    setCartTotalPrice(totalPrice);
  }, [productsCart, products]);

  const openMenu = () => {
    setCartOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeMenu = () => {
    setCartOpen(false);
    document.body.style.overflow = "scroll";
  };

  const increaseQuantity = id => {
    const arrayItemsCart = productsCart;
    arrayItemsCart.push(id);
    localStorage.setItem(STORAGE_PRODUCTS_CART, arrayItemsCart);
    getProductsCart();
  };

  const decreaseQuantity = id => {
    const arrayItemsCart = productsCart;
    const result = removeItemArray(arrayItemsCart, id.toString());
    localStorage.setItem(STORAGE_PRODUCTS_CART, result);
    getProductsCart();
  };

  const emptyCart = () => {
    localStorage.removeItem(STORAGE_PRODUCTS_CART);
    getProductsCart();
  };

  return (
    <>
      <Button variant="link" className="cart">
        <CartEmpty onClick={openMenu} />
      </Button>

      <div className="cart-content" style={{ width: widthCartContent }}>
        <CartContentHeader closeMenu={closeMenu} emptyCart={emptyCart} />
        <div className="cart-content__products">
          {singelProductsCart.map((idProductCart, index) => (
            <CartContentProducts
              key={index}
              products={products}
              idsProductsCart={productsCart}
              idProductCart={idProductCart}
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
            />
          ))}
        </div>
        <CartContentFooter cartTotalPrice={cartTotalPrice} />
      </div>
    </>
  );
}

function CartContentHeader(props) {
  const { closeMenu, emptyCart } = props;

  return (
    <div className="cart-content__header">
      <div>
        <Close onClick={closeMenu} />
        <h2>Carrito</h2>
      </div>

      <Button variant="link" onClick={emptyCart}>
        Vaciar
        <Garbage />
      </Button>
    </div>
  );
}

function CartContentProducts(props) {
  const {
    products: { loading, result },
    idsProductsCart,
    idProductCart,
    increaseQuantity,
    decreaseQuantity
  } = props;

  if (!loading && result) {
    return result.map((product, index) => {
      if (idProductCart == product.id) {
        const quantity = countDuplicatesItemArray(product.id, idsProductsCart);
        return (
          <RenderProduct
            key={index}
            product={product}
            quantity={quantity}
            increaseQuantity={increaseQuantity}
            decreaseQuantity={decreaseQuantity}
          />
        );
      }
    });
  }
  return null;
}

function RenderProduct(props) {
  const { product, quantity, increaseQuantity, decreaseQuantity } = props;

  return (
    <div className="cart-content__product">
      <img src={`${BASE_PATH}/${product.image}`} alt="Producto" />
      <div className="cart-content__product-info">
        <div>
          <h3>{product.name.substr(0, 25)}...</h3>
          <p>{product.price.toFixed(2)} € / ud.</p>
        </div>
        <div>
          <p>En carro: {quantity} ud.</p>
          <div>
            <button onClick={() => increaseQuantity(product.id)}>+</button>
            <button onClick={() => decreaseQuantity(product.id)}>-</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartContentFooter(props) {
  const { cartTotalPrice } = props;

  return (
    <div className="cart-content__footer">
      <div>
        <p>Total aproximado:</p>
        <p>{cartTotalPrice.toFixed(2)} €</p>
      </div>
      <Button>Tramitar pedido</Button>
    </div>
  );
}
