import EmberObject from '@ember/object';

import { module, test } from 'qunit';

module('Trasform Test');

test('Class constructor only gets called once with Ember Object', function(assert) {
  assert.expect(3);

  class Foo extends EmberObject {
    constructor() {
      super();
      assert.ok(true);
    }
  }

  class Bar extends Foo {
    constructor() {
      super();
      assert.ok(true);
    }
  }

  Foo.create();
  Bar.create();
});

test('Class constructor only gets called once with normal classes', function(assert) {
  assert.expect(3);

  class Foo {
    constructor() {
      assert.ok(true);
    }
  }

  class Bar extends Foo {
    constructor() {
      super();
      assert.ok(true);
    }
  }

  new Foo();
  new Bar();
});

test('Class fields work with Ember Object', function(assert) {
  assert.expect(4);

  class Foo extends EmberObject {
    prop = 1;
  }

  class Bar extends Foo {
    anotherProp = 2;
  }

  const foo = Foo.create({
    prop: 3,
    anotherProp: 4
  });

  const bar = Bar.create({
    prop: 5,
    anotherProp: 6
  });

  assert.equal(foo.get('prop'), 1);
  assert.equal(foo.get('anotherProp'), 4);

  assert.equal(bar.get('prop'), 1);
  assert.equal(bar.get('anotherProp'), 2);
});

test('Class fields work with standard class', function(assert) {
  assert.expect(4);

  class Foo {
    prop = 1;
  }

  class Bar extends Foo {
    anotherProp = 2;
  }

  const foo = new Foo();
  const bar = new Bar();

  assert.equal(foo.prop, 1);
  assert.equal(foo.anotherProp, undefined);

  assert.equal(bar.prop, 1);
  assert.equal(bar.anotherProp, 2);
});

test('Class fields work with Ember Object (with constructor)', function(assert) {
  assert.expect(7);

  class Foo extends EmberObject {
    prop = 1;

    constructor() {
      super();
      assert.ok(true);
    }
  }

  class Bar extends Foo {
    anotherProp = 2;

    constructor() {
      super();
      assert.ok(true);
    }
  }

  const foo = Foo.create({
    prop: 3,
    anotherProp: 4
  });

  const bar = Bar.create({
    prop: 5,
    anotherProp: 6
  });

  assert.equal(foo.get('prop'), 1);
  assert.equal(foo.get('anotherProp'), 4);

  assert.equal(bar.get('prop'), 1);
  assert.equal(bar.get('anotherProp'), 2);
});
