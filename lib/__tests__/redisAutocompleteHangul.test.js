const redis = require('redis');
const createAutocompleteIndexer = require('../index.js');
const options = {
  redis: {
    host: 'localhost',
    port: 6379
  }
};
const Indexer = createAutocompleteIndexer(options);

describe('unit test', () => {
  // Redis should be up and running on localhost:6379 before running tests

  beforeAll(done => {
    const client = redis.createClient(options.redis);
    client.flushall(err => done(err));
  });

  test('index and query', () => {
    return Promise.all([
      Indexer.index('가나', 1),
      Indexer.index('가나초콜렛', 2),
      Indexer.index('가부장적', 3),
      Indexer.index('가나다', 4)
    ]).then(() => {
      return Indexer.query('가');
    }).then(results => {
      console.log(results);
      expect(results.length).toBe(4);
      return Indexer.query('가나');
    }).then(results => {
      console.log(results);
      expect(results.length).toBe(3);
    });
  });

  test('delete index and query', () => {
    return Indexer.delete(1).then(() => {
      return Indexer.query('가');
    }).then(results => {
      console.log(results);
      expect(results.length).toBe(3);
    });
  });

  test('index the same wordId', () => {
    return Indexer.index('가로등', 1).then(() => {
      return Indexer.query('가');
    }).then(results => {
      console.log(results);
      expect(results.length).toBe(4);
      return Indexer.query('가나');
    }).then(results => {
      console.log(results);
      expect(results.length).toBe(2);
    });
  });
});
