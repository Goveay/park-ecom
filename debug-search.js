const fetch = require('node-fetch');

const query = `
  query SearchProducts($input: SearchInput!) {
    search(input: $input) {
      totalItems
      items {
        productName
        slug
      }
    }
  }
`;

const variables = {
  input: {
    term: "pika",
    groupByProduct: true
  }
};

fetch('http://localhost:3000/shop-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables,
  }),
})
  .then(res => res.json())
  .then(result => console.log(JSON.stringify(result, null, 2)))
  .catch(err => console.error(err));
