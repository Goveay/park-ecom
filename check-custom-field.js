const fetch = require('node-fetch');

const query = `
  query GetProductDetail($slug: String!) {
    product(slug: $slug) {
      id
      name
      description
      customFields
    }
  }
`;

const variables = {
  slug: "pika-3"
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
