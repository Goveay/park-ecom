const fetch = require('node-fetch');

const query = `
  query {
    products {
      items {
        name
        variants {
          id
        }
      }
    }
  }
`;

fetch('http://localhost:3000/shop-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query,
  }),
})
  .then(res => res.json())
  .then(result => {
    const products = result.data.products.items;
    products.forEach(p => {
      console.log(`${p.name}: ${p.variants.length} variants`);
    });
  })
  .catch(err => console.error(err));
