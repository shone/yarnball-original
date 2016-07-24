# yarnball

Yarnball is javascript/Node.JS library and [Polymer](https://www.polymer-project.org) toolkit for working with simplified graph-based data-structures.

## Demo
```bash
npm install
npm start -- --port=8080
```

For example:
```javascript
var Cookie = Node();
var Carrot = Node();
var Is     = Node();
var Food   = Node();

var link1 = Link(Cookie, Is, Food);
var link2 = Link(Carrot, Is, Food);

var web = Web();
web.setLinks([link1, link2], []);
```

```Node``` is a randomly-generated 16 byte array, forming a [Globally Unique Identifier](https://en.wikipedia.org/wiki/Globally_unique_identifier).

```Link``` defines a connection _from_ the first node, _via_ the second node, and _to_ the last node.

```Web``` is a set of links, which can be queried and manipulated.

## Queries

```javascript
var foodItems = web.query(null, Is, Food);
foodItems.forEach(function(foodItem) {
  console.log(Node.toHex(foodItem));
});
```