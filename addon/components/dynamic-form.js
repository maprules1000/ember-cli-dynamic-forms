import Ember from 'ember';

const { getOwner, set, get } = Ember;

const TYPE_MAP = {
  validator: {
    namespace:    'dynamic-forms.validations',
    functionName: 'validate'
  },
  change: {
    namespace:    'dynamic-forms.formatters',
    functionName: 'format'
  }
};

const DynamicForm = Ember.Component.extend({

  renderSchema: Ember.K,
  formRenderer: null,

  init() {
    this._super(...arguments);
    let container = getOwner(this);
    let config = container.resolveRegistration('config:environment');
    if (config.dynamicForms && config.dynamicForms.renderer) {
      set(this, 'formRenderer', container.lookup(`${config.dynamicForms.renderer}:renderers`));
    } else {
      set(this, 'formRenderer', container.lookup('alpaca:renderers'));
    }
  },

  _render() {
    let renderer = get(this, 'formRenderer');
    renderer.render(get(this, 'renderSchema'), this.$());
  },

  didInsertElement() {
    this._super(...arguments);
    this._render();
  },

  didReceiveAttrs() {
    this._super(...arguments);
    let schemaObj = this._initSchema(get(this, 'schema'));
    let schemaWithData = this._processData(schemaObj);
    let schemaWithPostRender = this._buildPostRender(schemaWithData);
    let schemaWithActions = this._addActions(schemaWithPostRender);
    let filteredSchema = this._processFilters(schemaWithActions);
    let mappedSchema = this._replaceKeywordsWithFunctions(filteredSchema);
    set(this, 'renderSchema', mappedSchema);
  },

  didUpdateAttrs() {
    this._render();
  },

  _buildPostRender(schemaObj) {
    let postRenderFns = [];
    if (get(this, 'changeAction')) {
      let fields = Object.keys(schemaObj.schema.properties);
      let changeAction = get(this, 'changeAction');
      let changeFn = function (control) {
        fields.forEach((field) => {
          control.childrenByPropertyId[field].on('keyup', function (e) {
            changeAction(e, field);
          });
          control.childrenByPropertyId[field].on('click', function (e) {
            changeAction(e, field);
          });
        });
      };
      postRenderFns.push(changeFn);
    }
    if (get(this, 'postRender')) {
      postRenderFns.push(get(this, 'postRender'));
    }

    if (postRenderFns.length > 0) {
      if (schemaObj.postRender) {
        postRenderFns.push(schemaObj.postRender);
      }
      schemaObj.postRender = function () {
        let args = arguments;
        postRenderFns.forEach((fn) => fn(args[0]));
      };
    }
    return schemaObj;
  },

  _addActions(schemaObj) {
    return _.reduce(get(this, 'formActions'), (result, value, key) => {
      if ((((((result || {}).options || {}).form || {}).buttons || {})[key])) {
        result.options.form.buttons[key].click = value;
      }
      return result;
    }, schemaObj);
  },

  _processFilters(schemaObj) {
    if (!(schemaObj && schemaObj.options && schemaObj.options.fields)) {
      return schemaObj;
    }
    let optionFields = schemaObj.options.fields;
    let newSchema = _.reduce(optionFields, (result, val, key) => {
      if(val['filter-rules']) {
        val['filter-rules'].forEach((element) => {
          let filterRule = getOwner(this).lookup(`${element}:dynamic-forms.filter-rules`);
          filterRule.filter(key, result);
        });
      }
      return result;
    }, _.clone(schemaObj, true));
    return newSchema;
  },

  _processData(schemaObj) {
    if (get(this, 'data') && Ember.typeOf(get(this, 'data')) === 'object') {
      schemaObj.data = this.get('data');
    } else if (get(this, 'data') && Ember.typeOf(get(this, 'data')) === 'instance') {
      let keys = Object.keys(schemaObj.schema.properties);
      let dataObj = _.reduce(keys, (data, key) => {
        data[key] = get(this, 'data').get(key);
        return data;
      }, {});
      schemaObj.data = dataObj;
    }
    return schemaObj;
  },

  _initSchema(schema) {
    let schemaObj;
    if (typeof schema === 'string') {
      schemaObj = JSON.parse(schema);
    } else {
      schemaObj = _.clone(schema, true);
    }

    return schemaObj;
  },

  _replaceKeywordsWithFunctions(schemaObj) {
    let container = getOwner(this);
    let replaceWithFunction = function (object, value, key) {
      if (TYPE_MAP.hasOwnProperty(key) && typeof value === 'string') {
        let type = TYPE_MAP[key];
        let typeObj = container.lookup(`${value}:${type.namespace}`);
        if (typeObj) {
          object[key] = typeObj[type.functionName];
        } // else fail with a message that the given type couldn't be found
      } else if (value === null) {
        object[key] = '';
      } else if (typeof value === 'object') {
        object[key] = _.transform(value, replaceWithFunction);
      } else {
        object[key] = value;
      }
    };
    return  _.transform(schemaObj, replaceWithFunction);
  }
});

export default DynamicForm;
