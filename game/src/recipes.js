// Warung Kilat — data: topping, resep pesanan, dan pelanggan.
// Semua nama + hidangan orisinal, hasil pikiran sendiri untuk gerobak ini.
(function () {
  'use strict';

  // Enam topping, masing-masing satu warna + satu kunci keyboard.
  var TOPPINGS = [
    { id: 'cokelat', name: 'Cokelat', key: '3', color: '#5a3018', dot: '#7a4a28', price: 4000 },
    { id: 'keju', name: 'Keju', key: '4', color: '#ffcf3d', dot: '#f2b705', price: 5000 },
    { id: 'kacang', name: 'Kacang', key: '5', color: '#c98f4e', dot: '#a06a2c', price: 4000 },
    { id: 'pisang', name: 'Pisang', key: '6', color: '#f7ead0', dot: '#d9b96a', price: 4000 },
    { id: 'susu', name: 'Susu', key: '7', color: '#fff8ea', dot: '#e8dcc0', price: 3000 },
    { id: 'wijen', name: 'Wijen', key: '8', color: '#e8dcc0', dot: '#b8a888', price: 3000 },
  ];

  // Satu martabak = dua topping. Harga dasar 12000 + harga topping.
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
    for (var i = 0; i < TOPPINGS.length; i++) if (TOPPINGS[i].id === id) return TOPPINGS[i];
    return null;
  }

  function recipePrice(recipe) {
    var p = 12000;
    for (var i = 0; i < recipe.toppings.length; i++) p += toppingById(recipe.toppings[i]).price;
    return p;
  }

  // Pelanggan: wajah digambar dari parameter ini (kulit, rambut, baju, aksesori).
  var CUSTOMERS = [
    { name: 'Bu Ratna', skin: '#e8b98a', hair: '#3a2a1a', hairStyle: 'bun', shirt: '#2e7d6b', item: 'anting' },
    { name: 'Pak Dedi', skin: '#c98d5f', hair: '#1a1a1a', hairStyle: 'peci', shirt: '#8a2f23', item: 'peci' },
    { name: 'Mbak Sari', skin: '#f0c39a', hair: '#241608', hairStyle: 'ponytail', shirt: '#c96a1e', item: 'pita' },
    { name: 'Mas Budi', skin: '#d9a06a', hair: '#0e0e0e', hairStyle: 'flat', shirt: '#3d5a80', item: 'topi' },
    { name: 'Nek Minah', skin: '#e0aa7a', hair: '#cfcfcf', hairStyle: 'sanggul', shirt: '#7a4a8a', item: 'kerudung' },
    { name: 'Dek Rian', skin: '#eec39a', hair: '#2a1a0c', hairStyle: 'spiky', shirt: '#2a9d3f', item: 'headset' },
  ];

  window.WK_DATA = {
    TOPPINGS: TOPPINGS, RECIPES: RECIPES, CUSTOMERS: CUSTOMERS,
    toppingById: toppingById, recipePrice: recipePrice,
  };
})();
