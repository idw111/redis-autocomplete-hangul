'use strict';

const redis = require('redis');
const Hangul = require('hangul-disassemble');

const createAutocompleteIndexer = options => {
  options = Object.assign({
    hashKey: 'ac',
    maxCacheLength: 15
  }, options || {});
  if (!options.redis) {
    return console.error('redis connection information is required');
  }

  const client = redis.createClient(options.redis);

  const AutocompleteIndexer = {
    index(word) {
      if (typeof word !== 'string') {
        return;
      }
      if (!word || word.length < 2) {
        return;
      }
      const disassembled = Hangul.toString(word.toLowerCase());
      return new Promise((resolve, reject) => {
        client.hset(options.hashKey, disassembled, word, (err, res) => err ? reject(err) : resolve(res));
      }).then(() => {
        return AutocompleteIndexer._index(word);
      });
    },

    _index(word) {
      const disassembled = Hangul.toString(word.toLowerCase());
      const cacheLength = options.maxCacheLength === 0 ? disassembled.length - 1 : Math.min(disassembled.length - 1, options.maxCacheLength);
      return new Promise((resolve, reject) => {
        const tokens = new Array(cacheLength).fill().map((_, i) => disassembled.substr(0, i + 1));
        client.zadd([
          `${options.hashKey}:tokens:${disassembled.substr(0, 1)}`,
          ...tokens.reduce((tokens, token) => tokens.concat([0, token]), []),
          ...[0, `${disassembled}*`]
        ], (err, res) => err ? reject(err) : resolve(res));
      });
    },

    remove(word) {
      const disassembled = Hangul.toString(word.toLowerCase());
      return new Promise((resolve, reject) => {
        client.zrem(`${options.hashKey}:tokens:${disassembled.substr(0, 1)}`, `${disassembled}*`, (err, res) => err ? reject(err) : resolve(res));
      }).then(() => {
        return new Promise((resolve, reject) => {
          client.hdel(options.hashKey, disassembled, (err, res) => err ? reject(err) : resolve(res));
        }).catch(err => {
          console.log(err.message);
          return Promise.resolve();
        });
      });
    },

    query(word) {
      const disassembled = Hangul.toString(word.toLowerCase());
      return new Promise((resolve, reject) => {
        client.zrank(`${options.hashKey}:tokens:${disassembled.substr(0, 1)}`, disassembled, (err, res) => err ? reject(err) : resolve(res));
      }).then(index => {
        if (isNaN(index)) {
          return Promise.resolve([]);
        }
        return new Promise((resolve, reject) => {
          client.zrange(`${options.hashKey}:tokens:${disassembled.substr(0, 1)}`, index, -1, (err, res) => err ? reject(err) : resolve(res));
        }).then(list => {
          if (!list || !list.length) {
            return Promise.resolve([]);
          }
          const keys = list.filter(key => key.endsWith('*') && key.startsWith(disassembled)).map(key => key.substr(0, key.length - 1));
          return new Promise((resolve, reject) => {
            client.hmget(options.hashKey, keys, (err, res) => err ? reject(err) : resolve(res));
          });
        });
      });
    }
  };

  return AutocompleteIndexer;
};

module.exports = createAutocompleteIndexer;
