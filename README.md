# redis-autocomplete-hangul 

> Redis autocomplete with support for Hangul

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url] 


## Installation

```sh
$ npm install --save redis-autocomplete-hangul
```


## Usage Example

```js
const createAutocompleteIndexer = require('redis-autocomplete-hangul');
const AutocompleteIndexer = createAutocompleteIndexer({
  redis: {
    host: 'localhost',
    port: 6379
  }
});

Promise.all([
  AutocompleteIndexer.index('가내수공업'),
  AutocompleteIndexer.index('가나'),
  AutocompleteIndexer.index('가나초콜렛'),
  AutocompleteIndexer.index('가부장적')
]).then(() => {
  return AutocompleteIndexer.query('가ㄴ')
}).then(results => {
  console.log(results);
  // ['가나', '가나초콜렛', '가내수공업']
  return AutocompleteIndexer.remove('가내수공업');
}).then(() => {
  return AutocompleteIndexer.query('가ㄴ');
}).then(results => {
  console.log(results);
  // ['가나', '가나초콜렛']
});

```


## API

### createAutocompleteIndexer(options)
This return AutocompleteIndexer. You should provide redis connection information in options. Additional options are hashKey and maxCacheLength.

#### Options
- hashKey: defaults 'ac'. This option changes redis namespace.
- maxCacheLength: defaults 15. First maxCacheLength characters in indexed word are cached in redis for autocomplete suggestion.

### AutocompleteIndexer.index(word)
This indexes word. Indexed words can be queried using AutocompleteIndexer.query method.

### AutocompleteIndexer.query(characters)
This queries characters on indexed words. Indexed words starting with the characters will be retrieved from the redis. It returns promise object with array of strings.

### AutocompleteIndexer.remove(word)
This removes the indexed word. Removed words cannot be queried using AutocompleteIndexer.query method.


## Acknowledgement

[Antirez](http://oldblog.antirez.com/post/autocomplete-with-redis.html)


## License

MIT © [Dongwon Lim](idw111@gmail.com)


[npm-image]: https://badge.fury.io/js/redis-autocomplete-hangul.svg
[npm-url]: https://npmjs.org/package/redis-autocomplete-hangul
[travis-image]: https://travis-ci.org/idw111/redis-autocomplete-hangul.svg?branch=master
[travis-url]: https://travis-ci.org/idw111/redis-autocomplete-hangul
[daviddm-image]: https://david-dm.org/idw111/redis-autocomplete-hangul.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/idw111/redis-autocomplete-hangul
[coveralls-image]: https://coveralls.io/repos/idw111/redis-autocomplete-hangul/badge.svg
[coveralls-url]: https://coveralls.io/r/idw111/redis-autocomplete-hangul
