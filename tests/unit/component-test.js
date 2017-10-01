import Component from '@ember/component';
import RSVP from 'rsvp';
import { action } from 'ember-decorators/object';

import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent } from 'ember-qunit';
import { test } from 'qunit';
import { click, findAll } from 'ember-native-dom-helpers';

moduleForComponent('Component Test', { integration: true });

test('Constructor only gets called once with components', function(assert) {
  assert.expect(3);

  class FooComponent extends Component {
    constructor() {
      super();
      assert.ok(true)
    }
  }

  class BarComponent extends FooComponent {
    constructor() {
      super();
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

test('Constructor only gets called once with components', function(assert) {
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
