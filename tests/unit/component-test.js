import Component from '@ember/component';
import Service from '@ember/service';
import RSVP from 'rsvp';
import { action } from 'ember-decorators/object';
import { service } from 'ember-decorators/service';
import { addObserver } from '@ember/object/observers';

import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent } from 'ember-qunit';
import { test } from 'qunit';
import { click, findAll } from 'ember-native-dom-helpers';

moduleForComponent('Component Test', { integration: true });

test('Constructor only gets called once with components', function(assert) {
  assert.expect(3);

  class FooComponent extends Component {
    constructor() {
      super(...arguments);
      assert.ok(true)
    }
  }

  class BarComponent extends FooComponent {
    constructor() {
      super(...arguments);
      assert.ok(true)
    }
  }

  this.register('component:foo-component', FooComponent);
  this.register('component:bar-component', BarComponent);

  this.render(hbs`
    {{foo-component}}
    {{bar-component}}
  `);
});

test('Can extend from .extend', function(assert) {
  assert.expect(3);

  const FooComponent = Component.extend({
    init() {
      this._super(...arguments);
      assert.ok(true)
    }
  });

  class BarComponent extends FooComponent {
    constructor() {
      super(...arguments);
      assert.ok(true)
    }
  }

  this.register('component:foo-component', FooComponent);
  this.register('component:bar-component', BarComponent);

  this.render(hbs`
    {{foo-component}}
    {{bar-component}}
  `);
});

test('Bindings still work correctly', function(assert) {
  assert.expect(1);

  let calls = [];

  class FooComponent extends Component {
    // This emulates @ember-decorators/argument, which will be the most feasible
    // way to set values that are bound until changes in CoreObject
    get foo() {
      return this._foo;
    }

    set foo(value) {
      if (value !== undefined) {
        this._foo = value
      }
    }

    didInsertElement() {
      addObserver(this, 'foo', () => {
        calls.push(this.get('foo'));
      });
    }
  }

  this.register('component:foo-component', FooComponent);

  this.render(hbs`{{foo-component foo=bar}}`);

  this.set('bar', false);
  this.set('bar', true);
  this.set('bar', false);
  this.set('bar', false);
  this.set('bar', true);
  this.set('bar', 123);
  this.set('bar', 123);

  assert.deepEqual(calls, [false, true, false, true, 123], 'binding updated correctly');
});


test('Class properties are assigned properly and overriden properly', function(assert) {
  assert.expect(4);

  class FooComponent extends Component {
    prop = 1;

    @action
    foo() {
      assert.equal(this.get('prop'), 1);
      assert.equal(this.get('anotherProp'), 4);
    }
  }

  class BarComponent extends FooComponent {
    anotherProp = 2;

    @action
    bar() {
      assert.equal(this.get('prop'), 1);
      assert.equal(this.get('anotherProp'), 2);
    }
  }

  this.register('component:foo-component', FooComponent);
  this.register('component:bar-component', BarComponent);

  this.register('template:components/foo-component', hbs`<button {{action 'foo'}}>Click Me!</button>`);
  this.register('template:components/bar-component', hbs`<button {{action 'bar'}}>Click Me!</button>`);

  this.render(hbs`
    {{foo-component prop=3 anotherProp=4}}
    {{bar-component prop=5 anotherProp=6}}
  `);

  return RSVP.all(findAll('button').map(click));
});

test('Declarative injections still work', function(assert) {
  assert.expect(2);

  const TestService = Service.extend({
    prop: 123
  });

  class FooComponent extends Component {
    @service test;

    @action
    foo() {
      assert.equal(this.get('test.prop'), 123);
    }
  }

  class BarComponent extends FooComponent {
    @action
    bar() {
      assert.equal(this.get('test.prop'), 123);
    }
  }

  this.register('service:test', TestService);
  this.register('component:foo-component', FooComponent);
  this.register('component:bar-component', BarComponent);

  this.register('template:components/foo-component', hbs`<button {{action 'foo'}}>Click Me!</button>`);
  this.register('template:components/bar-component', hbs`<button {{action 'bar'}}>Click Me!</button>`);

  this.render(hbs`
    {{foo-component prop=3 anotherProp=4}}
    {{bar-component prop=5 anotherProp=6}}
  `);

  return RSVP.all(findAll('button').map(click));
});

test('Imperative injections still work', function(assert) {
  assert.expect(2);

  const TestService = Service.extend({
    prop: 123
  });

  class FooComponent extends Component {
    @action
    foo() {
      assert.equal(this.get('test.prop'), 123);
    }
  }

  class BarComponent extends FooComponent {
    @action
    bar() {
      assert.equal(this.get('test.prop'), 123);
    }
  }

  this.register('service:test', TestService);
  this.register('component:foo-component', FooComponent);
  this.register('component:bar-component', BarComponent);

  this.registry.injection('component', 'test', 'service:test');

  this.register('template:components/foo-component', hbs`<button {{action 'foo'}}>Click Me!</button>`);
  this.register('template:components/bar-component', hbs`<button {{action 'bar'}}>Click Me!</button>`);

  this.render(hbs`
    {{foo-component prop=3 anotherProp=4}}
    {{bar-component prop=5 anotherProp=6}}
  `);

  return RSVP.all(findAll('button').map(click));
});
