// Warung Kilat — data: 6 topping, 8 resep pesanan, 3 pelanggan berfoto.
// Semua wajah pelanggan adalah foto asli (img/face-*.jpg), bukan gambar.
(function () {
  'use strict';

  // Enam topping, masing-masing satu warna dot + satu tombol keyboard.
  var TOPPINGS = [
    { id: 'cokelat', name: 'Cokelat', key: '3', color: '#5a3018', dot: '#7a4a28', price: 4000, img: 'img/topping-cokelat.jpg' },
    { id: 'keju', name: 'Keju', key: '4', color: '#ffcf3d', dot: '#f2b705', price: 5000, img: 'img/topping-keju.jpg' },
    { id: 'kacang', name: 'Kacang', key: '5', color: '#c98f4e', dot: '#a06a2c', price: 4000, img: 'img/topping-kacang.jpg' },
    { id: 'pisang', name: 'Pisang', key: '6', color: '#f7ead0', dot: '#d9b96a', price: 4000, img: 'img/topping-pisang.jpg' },
    { id: 'susu', name: 'Susu', key: '7', color: '#fff8ea', dot: '#e8dcc0', price: 3000, img: 'img/topping-susu.jpg' },
    { id: 'wijen', name: 'Wijen', key: '8', color: '#e8dcc0', dot: '#b8a888', price: 3000, img: 'img/topping-wijen.jpg' },
  ];

  // Satu martabak = dua topping. Harga dasar 12000 + harga kedua topping.
  var RECIPES = [
    { name: 'Cokelat Keju', toppings: ['cokelat', 'keju'] },
    { name: 'Pisang Susu', toppings: ['pisang', 'susu'] },
    { name: 'Kacang Wijen', toppings: ['kacang', 'wijen'] },
    { name: 'Cokelat Pisang', toppings: ['cokelat', 'pisang'] },
    { name: 'Keju Susu', toppings: ['keju', 'susu'] },
    { name: 'Cokelat Kacang', toppings: ['cokelat', 'kacang'] },
    { name: 'Keju Wijen', toppings: ['keju', 'wijen'] },
    { name: 'Pisang Kacang', toppings: ['pisang', 'kacang'] },
  ];

  function toppingById(id) {
    for (var i = 0; i < TOPPINGS.length; i++) {
      if (TOPPINGS[i].id === id) return TOPPINGS[i];
    }
    return null;
  }

  function recipePrice(recipe) {
    var p = 12000;
    for (var i = 0; i < recipe.toppings.length; i++) p += toppingById(recipe.toppings[i]).price;
    return p;
  }

  // Pelanggan pasar malam: nenek batik, gadis pita merah, bapak bertopi.
  var CUSTOMERS = [
    { name: 'Bu Ratna', photo: 'img/face-bu-ratna.jpg' },
    { name: 'Mbak Sari', photo: 'img/face-mbak-sari.jpg' },
    { name: 'Pak Dedi', photo: 'img/face-pak-dedi.jpg' },
  ];

  window.WK_DATA = {
    TOPPINGS: TOPPINGS,
    RECIPES: RECIPES,
    CUSTOMERS: CUSTOMERS,
    toppingById: toppingById,
    recipePrice: recipePrice,
  };
})();
