'use strict';

const shortid = require('shortid');
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
    index(word, wordId) {
      if (typeof word !== 'string') {
        return;
      }
      if (!word || word.length < 2) {
        return;
      }
      return AutocompleteIndexer._getWordById(wordId).then(_word => {
        if (_word) {
          return Promise.resolve([]);
        }
        wordId = wordId || shortid.generate();
        return new Promise((resolve, reject) => {
          client.hset(options.hashKey, wordId, word, (err, res) => err ? reject(err) : resolve(res));
        }).then(() => {
          return AutocompleteIndexer._index(word, wordId);
        });
      });
    },

    _index(word, wordId) {
      word = Hangul.toString(word);
      const cacheLength = options.maxCacheLength === 0 ? word.length - 1 : Math.min(word.length - 1, options.maxCacheLength);
      return Promise.all(new Array(cacheLength).fill().map((_, i) => word.substr(0, i + 2)).map(token => {
        return new Promise((resolve, reject) => {
          client.zadd(`${options.hashKey}:${token}`, 0, wordId, (err, res) => err ? reject(err) : resolve(res));
        });
      }));
    },

    _getWordById(wordId) {
      return new Promise((resolve, reject) => {
        if (!wordId) {
          return resolve(null);
        }
        client.hget(options.hashKey, wordId, (err, res) => err ? reject(err) : resolve(res));
      });
    },

    delete(wordId) {
      return new Promise((resolve, reject) => {
        client.hget(options.hashKey, wordId, (err, res) => err ? reject(err) : resolve(res));
      }).then(word => {
        return new Promise((resolve, reject) => {
          client.hdel(options.hashKey, wordId, (err, res) => err ? reject(err) : resolve(res));
        }).then(() => {
          return AutocompleteIndexer._delete(word, wordId);
        });
      });
    },

    _delete(word, wordId) {
      word = Hangul.toString(word);
      const cacheLength = options.maxCacheLength === 0 ? word.length - 1 : Math.min(word.length - 1, options.maxCacheLength);
      return Promise.all(new Array(cacheLength).fill().map((_, i) => word.substr(0, i + 2)).map(token => {
        return new Promise((resolve, reject) => {
          client.zrem(`${options.hashKey}:${token}`, wordId, (err, res) => err ? reject(err) : resolve(res));
        });
      }));
    },

    query(word) {
      return new Promise((resolve, reject) => {
        client.zrange(`${options.hashKey}:${Hangul.toString(word)}`, 0, -1, (err, res) => err ? reject(err) : resolve(res));
      }).then(list => {
        if (!list || !list.length) {
          return Promise.resolve([]);
        }
        console.log(list);
        return new Promise((resolve, reject) => {
          client.hmget(options.hashKey, list, (err, res) => err ? reject(err) : resolve(res));
        });
      });
    }
  };

  return AutocompleteIndexer;
};

module.exports = createAutocompleteIndexer;
