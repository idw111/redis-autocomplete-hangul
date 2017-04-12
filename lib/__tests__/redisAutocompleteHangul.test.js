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
      Indexer.index('asdf'),
      Indexer.index('abc'),
      Indexer.index('가부장적'),
      Indexer.index('가나다'),
      Indexer.index('가내수공업')
    ]).then(() => {
      return Indexer.query('a');
    }).then(results => {
      console.log(results);
      expect(results.length).toBe(2);
      return Indexer.query('가ㄴ');
    }).then(results => {
      console.log(results);
      expect(results.length).toBe(2);
    });
  });

  test('remove key', () => {
    return Indexer.remove('가내수공업').then(() => {
      return Indexer.query('가');
    }).then(results => {
      console.log(results);
      expect(results.length).toBe(2);
    });
  });

  test('index again', () => {
    return Indexer.index('가내수공업').then(() => {
      return Indexer.query('가');
    }).then(results => {
      console.log(results);
      expect(results.length).toBe(3);
      return Indexer.query('가ㄴ');
    }).then(results => {
      console.log(results);
      expect(results.length).toBe(2);
    });
  });

  test('remove non-existing key', () => {
    return Indexer.remove('없는키').catch(err => {
      expect(err).toBeFalsy();
    });
  });
});
