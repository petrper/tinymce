define(
  'ephox.alloy.spec.DropdownListSpec',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.dropdown.Dropdown',
    'ephox.alloy.dropdown.DropdownBehaviour',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.alloy.spec.DropdownMenuSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Width',
    'global!Error'
  ],

  function (Behaviour, DomModification, Dropdown, DropdownBehaviour, MenuMarkers, DropdownMenuSpec, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Fun, Option, Width, Error) {

    var factories = {
      '<alloy.dropdown.display>': function (comp, detail) {
        var fromUser = Objects.readOptFrom(detail.dependents, '<alloy.dropdown.display>');
        return Merger.deepMerge(comp.extra, {
          uiType: 'container',
          uid: detail.uid + '-dropdown.display',
          dom: {
            attributes: {
              'data-goal': 'true'
            },
            // FIX: Getting clobbered.
            classes: [ 'from-spec' ]
          }
        }, fromUser);
      }
    };

    var make = function (spec) {
      var detail = SpecSchema.asRawOrDie('dropdown.list', [
        FieldSchema.strict('fetchItems'),
        FieldSchema.defaulted('onOpen', Fun.noop),
        FieldSchema.defaulted('onExecute', Option.none),
        FieldSchema.defaulted('toggleClass', 'alloy-selected-button'),
        FieldSchema.strict('dom'),
        FieldSchema.option('sink'),
        FieldSchema.defaulted('dependents', { }),

        FieldSchema.field(
          'members',
          'members',
          FieldPresence.strict(),
          ValueSchema.objOf([
            FieldSchema.strict('menu'),
            FieldSchema.strict('item')
          ])
        ),

        FieldSchema.field(
          'markers',
          'markers',
          FieldPresence.strict(),
          MenuMarkers.itemSchema()
        )
      ], spec, factories);

      var components = UiSubstitutes.substituteAll(detail, detail.components, factories, { });
    
      return SpecSchema.extend(Dropdown.make, spec, {
        fetch: function () {
          return detail.fetchItems().map(function (items) {
            var primary = 'main-dropdown';
            var expansions = {};
            var menus = Objects.wrap(primary, {
              name: primary,
              textkey: 'DOGS',
              items: items
            });

            return {
              primary: primary,
              expansions: expansions,
              menus: menus
            };
          });
        },
        sink: detail.sink.getOr(undefined),
        onOpen: function (button, sandbox, menu) {
          var buttonWidth = Width.get(button.element());
          Width.set(menu.element(), buttonWidth);
          detail.onOpen(button, sandbox, menu);
        },
        onExecute: detail.onExecute,
        components: components,
        behaviours: [
          DropdownBehaviour(detail)
        ],
        view: {
          style: 'layered',
          members: spec.members,
          markers: spec.markers
        }
      }, factories);
    };

    return {
      make: make
    };
  }
);