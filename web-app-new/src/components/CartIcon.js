import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { MdShoppingCart } from 'react-icons/md';

const CartIcon = () => {
  const { cartCount } = useCart();

  return (
    <Link to="/cart" className="relative p-2">
      <MdShoppingCart className="text-2xl" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {cartCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon; 