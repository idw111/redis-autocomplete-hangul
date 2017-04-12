# redis-autocomplete-hangul [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> 

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
	AutocompleteIndexer.index('가나', 1),
	AutocompleteIndexer.index('가나초콜렛', 2),
	AutocompleteIndexer.index('가부장적', 3),
	AutocompleteIndexer.index('가나다', 4)
]).then(() => {
	return AutocompleteIndexer.query('가나')
}).then(results => {
	console.log(results);
	// ['가나', '가나초콜렛', '가나다']
	return AutocompleteIndexer.delete(1);
}).then(() => {
	return AutocompleteIndexer.query('가나');
}).then(results => {
	console.log(results);
	// ['가나초콜렛', '가나다']
	return AutocompleteIndexer.delete(1);
});

```
## License

MIT © [Dongwon Lim]()


[npm-image]: https://badge.fury.io/js/redis-autocomplete-hangul.svg
[npm-url]: https://npmjs.org/package/redis-autocomplete-hangul
[travis-image]: https://travis-ci.org/idw111/redis-autocomplete-hangul.svg?branch=master
[travis-url]: https://travis-ci.org/idw111/redis-autocomplete-hangul
[daviddm-image]: https://david-dm.org/idw111/redis-autocomplete-hangul.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/idw111/redis-autocomplete-hangul
[coveralls-image]: https://coveralls.io/repos/idw111/redis-autocomplete-hangul/badge.svg
[coveralls-url]: https://coveralls.io/r/idw111/redis-autocomplete-hangul
