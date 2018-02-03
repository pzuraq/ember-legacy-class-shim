[![Build Status](https://travis-ci.org/pzuraq/ember-legacy-class-transform.svg?branch=master)](https://travis-ci.org/pzuraq/ember-legacy-class-transform)

# Deprecation Notice

This transform has been deprecated in favor of the [ember-legacy-class-shim](https://github.com/pzuraq/ember-legacy-class-shim),
which is overall a better solution to legacy class support in Ember.

# ember-legacy-class-transform

This addon adds a transform for using ES Classes with legacy versions of Ember (< 2.13.0).
It transforms the class's `constructor` function into `init`, which allows both the
`constructor` and class fields to work.

## Why is this needed?

The reason legacy versions of Ember need this transform lies, at its core, in the
[double extend](https://github.com/emberjs/rfcs/blob/master/text/0150-factory-for.md)
which was used for the longest time to inject services and other things. This double
extend ends up creating a new class altogether which, due to the way classes are handled
internally in Ember, _never_ calls `super`.

This means that when we define a class using `class` it's constructor never gets run.
A side-effect of this is that class fields, which are assigned _in_ the constructor, do
not get assigned. This substantially reduces the usefulness of class syntax and decorators
since they rely substantially on class fields working as expected.

## So what does this do?

When combined with the class fields transform, this takes classes defined like so:

```js
class Foo {
  bar = 'baz';

  constructor() {
    // do something
  }
}
```

And transforms them into this:

```js
class Foo {
  constructor() {
    if (!this.__didInit) {
      this.init();
    }
  }

  init() {
    // do something
    this.bar = 'baz';
    this.__didInit = true;
  }
}
```

### Wait, why does the constructor still exist and call init if it doesn't work?

It actually _does_ work when you make objects/classes outside of the standard Ember
container lifecycle, so just doing `Foo.create()` for instance. The logic in place
ensures that `init` only gets called once in all cases.

### Ok, any other caveats?

`init` is very similar to `constructor`, it gets called in the same context at
_almost_ the same time. The key difference is that when using classes normally,
the subclass's constructor gets called first` meaning it gets to do any setup it
wants before calling `super`. `init`, on the other hand, only gets called after
most of the setup has been done (if extending from `Ember.Object`).

Ultimately, the code flow _before_ calling `super` in `constructor` will differ
between legacy versions and modern versions of Ember. To avoid this, simply call
`super` as the very first thing in any classes which extend `Ember.Object`.

```js
class Foo extends Ember.Object {
  constructor(...args) {
    super(...args);

    // do some things
  }
}
```

## Installation

* `git clone <repository-url>` this repository
* `cd ember-legacy-class-transform`
* `npm install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
