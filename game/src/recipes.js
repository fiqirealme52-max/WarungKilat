// Warung Kilat — ingredients and the five original recipes.
// Every ingredient is prepared exactly one way: chopped on the board,
// cooked on a burner, or taken ready from the crate. A recipe is a
// multiset of prepared ingredients; the plate matches a ticket when its
// contents equal the recipe, in any order.
export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', short: 'Nasi', color: '#f7f2e2', prep: 'cook', cookTime: 4.0, key: '1' },
  { id: 'ayam', name: 'Ayam', short: 'Ayam', color: '#e8a04c', prep: 'cook', cookTime: 5.0, key: '2' },
  { id: 'mie', name: 'Mie', short: 'Mie', color: '#f2c94c', prep: 'cook', cookTime: 3.5, key: '3' },
  { id: 'telur', name: 'Telur', short: 'Telur', color: '#fff3d6', prep: 'cook', cookTime: 3.0, key: '4' },
  { id: 'tahu', name: 'Tahu', short: 'Tahu', color: '#f7e8c8', prep: 'cook', cookTime: 3.5, key: '5' },
  { id: 'sayur', name: 'Sayur', short: 'Sayur', color: '#58b368', prep: 'chop', chopTime: 1.6, key: '6' },
  { id: 'cabai', name: 'Cabai', short: 'Cabai', color: '#e23b3b', prep: 'chop', chopTime: 1.6, key: '7' },
  { id: 'teh', name: 'Teh', short: 'Teh', color: '#c98a2e', prep: 'cook', cookTime: 3.0, key: '8' },
  { id: 'es', name: 'Es Batu', short: 'Es', color: '#9fd8ff', prep: 'none', cookTime: 0, key: '9' },
];

export const INGREDIENT_BY_ID = {};
for (const ing of INGREDIENTS) INGREDIENT_BY_ID[ing.id] = ing;

export const RECIPES = [
  { id: 'nasgor', name: 'Nasi Goreng', components: ['nasi', 'telur', 'cabai'], reward: 120, color: '#e07840' },
  { id: 'geprek', name: 'Ayam Geprek', components: ['ayam', 'cabai', 'nasi'], reward: 140, color: '#d94f3d' },
  { id: 'mieayam', name: 'Mie Ayam', components: ['mie', 'ayam', 'sayur'], reward: 130, color: '#e8a83c' },
  { id: 'gado', name: 'Gado-Gado', components: ['sayur', 'tahu', 'telur'], reward: 130, color: '#58b368' },
  { id: 'esteh', name: 'Es Teh', components: ['teh', 'es'], reward: 80, color: '#c98a2e' },
];

export const RECIPE_BY_ID = {};
for (const r of RECIPES) RECIPE_BY_ID[r.id] = r;

/** True when the plate's items are exactly the recipe's components. */
export function plateMatchesRecipe(plateItems, recipe) {
  if (plateItems.length !== recipe.components.length) return false;
  const have = [...plateItems].sort();
  const want = [...recipe.components].sort();
  for (let i = 0; i < want.length; i += 1) if (have[i] !== want[i]) return false;
  return true;
}
