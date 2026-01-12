"use strict";
"require view";
"require form";
"require uci";
"require rpc";
"require ui";
"require fs";

document.querySelector("head").appendChild(
  E("script", {
    type: "text/javascript",
    src: L.resource("view/aurora/color.global.js"),
  })
);

const createSectionTitle = (title) => `<h5>${_(title)}</h5>`;

// Declare RPC methods
var callUploadIcon = rpc.declare({
  object: "luci.aurora",
  method: "upload_icon",
  params: ["filename"],
});

var callListIcons = rpc.declare({
  object: "luci.aurora",
  method: "list_icons",
});

var callRemoveIcon = rpc.declare({
  object: "luci.aurora",
  method: "remove_icon",
  params: ["filename"],
});

const addColorInputs = (ss, tab, colorVars, prefix) => {
  for (const item of colorVars) {
    const key = item[0];
    const defaultValue = item[1];
    const label = item[2];
    const so = ss.taboption(tab, form.Value, key, label);
    so.default = defaultValue;
    so.placeholder = defaultValue;
    so.rmempty = false;
    so.render = function (option_index, section_id, in_table) {
      var el = form.Value.prototype.render.apply(this, [
        option_index,
        section_id,
        in_table,
      ]);
      return Promise.resolve(el).then(function (element) {
        var input = element.querySelector('input[type="text"]');
        if (input) {
          var color = new Color(input.value);
          if (color.alpha < 1) {
            color.alpha = 1;
          }
          var colorInput = E("input", {
            type: "color",
            value: color.toString({ format: "hex" }),
            style:
              "margin-left: 8px; height: 2em; width: 3em; vertical-align: middle; cursor: pointer;",
            title: _("Color Picker Helper"),
            change: function (ev) {
              input.value = this.value;
            },
          });
          input.parentNode.appendChild(colorInput);
        }
        return element;
      });
    };
  }
};

return view.extend({
  load: () => uci.load("aurora"),

  render() {
    let m, s, o, ss, so;

    const gradientColorVars = [
      [
        "light_background_start",
        "oklch(0.984 0.003 247.858)",
        _("Background Start Color"),
      ],
      [
        "light_background_mid",
        "oklch(0.968 0.007 247.896)",
        _("Background Mid Color"),
      ],
      [
        "light_background_end",
        "oklch(0.929 0.013 255.508)",
        _("Background End Color"),
      ],
      [
        "light_progress_start",
        "oklch(0.68 0.11 233)",
        _("Progress Start Color"),
      ],
      [
        "light_progress_end",
        "oklch(0.7535 0.1034 198.37)",
        _("Progress End Color"),
      ],
    ];

    const darkGradientColorVars = [
      [
        "dark_background_start",
        "oklch(0.2077 0.0398 265.75)",
        _("Background Start Color"),
      ],
      [
        "dark_background_mid",
        "oklch(0.3861 0.059 188.42)",
        _("Background Mid Color"),
      ],
      [
        "dark_background_end",
        "oklch(0.4318 0.0865 166.91)",
        _("Background End Color"),
      ],
      [
        "dark_progress_start",
        "oklch(0.4318 0.0865 166.91)",
        _("Progress Start Color"),
      ],
      [
        "dark_progress_end",
        "oklch(62.1% 0.145 189.632)",
        _("Progress End Color"),
      ],
    ];

    const semanticColorVars = [
      ["light_primary", "oklch(0.68 0.11 233)", _("Primary Color")],
      [
        "light_primary_text",
        "oklch(0.6656 0.1055 234.61)",
        _("Primary Text Color"),
      ],
      ["light_muted", "oklch(0.97 0 0)", _("Muted Color")],
      ["light_muted_text", "oklch(0.35 0 0)", _("Muted Text Color")],
      ["light_accent", "oklch(0.62 0.22 25)", _("Accent Color")],
      ["light_accent_text", "oklch(0.97 0.02 25)", _("Accent Text Color")],
      ["light_destructive", "oklch(0.94 0.05 25)", _("Destructive Color")],
      [
        "light_destructive_text",
        "oklch(0.35 0.12 25)",
        _("Destructive Text Color"),
      ],
    ];

    const darkSemanticColorVars = [
      ["dark_primary", "oklch(0.48 0.118 190.485)", _("Primary Color")],
      [
        "dark_primary_text",
        "oklch(0.73 0.168 188.745)",
        _("Primary Text Color"),
      ],
      ["dark_muted", "oklch(0.373 0.026 259.733)", _("Muted Color")],
      ["dark_muted_text", "oklch(0.82 0.035 259.733)", _("Muted Text Color")],
      ["dark_accent", "oklch(0.35 0.12 25)", _("Accent Color")],
      ["dark_accent_text", "oklch(0.88 0.14 25)", _("Accent Text Color")],
      ["dark_destructive", "oklch(0.258 0.092 26.042)", _("Destructive Color")],
      [
        "dark_destructive_text",
        "oklch(0.88 0.14 26.042)",
        _("Destructive Text Color"),
      ],
    ];

    const statusColorVars = [
      ["light_success", "oklch(0.94 0.05 160)", _("Success Color")],
      ["light_success_text", "oklch(0.32 0.09 165)", _("Success Text Color")],
      ["light_info", "oklch(0.94 0.05 230)", _("Info Color")],
      ["light_info_text", "oklch(0.35 0.08 240)", _("Info Text Color")],
      ["light_warning", "oklch(0.95 0.05 90)", _("Warning Color")],
      ["light_warning_text", "oklch(0.35 0.08 60)", _("Warning Text Color")],
      ["light_error", "oklch(0.94 0.05 25)", _("Error Color")],
      ["light_error_text", "oklch(0.35 0.12 25)", _("Error Text Color")],
      ["light_default", "oklch(0.97 0 0)", _("Default Color")],
      ["light_default_text", "oklch(0.205 0 0)", _("Default Text Color")],
    ];

    const darkStatusColorVars = [
      ["dark_success", "oklch(0.378 0.077 168.94/0.5)", _("Success Color")],
      ["dark_success_text", "oklch(0.92 0.09 160)", _("Success Text Color")],
      ["dark_info", "oklch(0.391 0.09 240.876/0.5)", _("Info Color")],
      ["dark_info_text", "oklch(0.88 0.06 230)", _("Info Text Color")],
      ["dark_warning", "oklch(0.414 0.112 45.904/0.5)", _("Warning Color")],
      ["dark_warning_text", "oklch(0.924 0.12 95.746)", _("Warning Text Color")],
      ["dark_error", "oklch(0.41 0.159 10.272/0.5)", _("Error Color")],
      ["dark_error_text", "oklch(0.88 0.14 25)", _("Error Text Color")],
      ["dark_default", "oklch(0.274 0.006 286.033/0.5)", _("Default Color")],
      ["dark_default_text", "oklch(0.985 0.01 285.805)", _("Default Text Color")],
    ];

    const structureVars = [
      ["struct_font_sans", '"Lato", ui-sans-serif, system-ui, sans-serif'],
      [
        "struct_font_mono",
        'ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace',
      ],
      ["struct_spacing", "0.25rem"],
    ];

    m = new form.Map("aurora", _("Aurora Configuration"));

    s = m.section(form.NamedSection, "theme", "aurora");

    s.tab("colors", _("Color"));
    s.tab("structure", _("Structure"));
    s.tab("toolbar", _("Floating Toolbar"));

    o = s.taboption(
      "colors",
      form.SectionValue,
      "_colors",
      form.NamedSection,
      "theme",
      "aurora"
    );
    ss = o.subsection;

    ss.tab("light", _("Light Mode"));
    ss.tab("dark", _("Dark Mode"));

    const lightGradientTitle = ss.taboption("light", form.DummyValue, "", "");
    lightGradientTitle.rawhtml = true;
    lightGradientTitle.default = createSectionTitle(_("Gradient Colors"));
    lightGradientTitle.description = _("Configure gradient colors used for backgrounds and progress bars. Progress bars use these gradients to create visual depth and indicate completion status.");

    addColorInputs(ss, "light", gradientColorVars, "light");

    const lightSemanticTitle = ss.taboption("light", form.DummyValue, "", "");
    lightSemanticTitle.rawhtml = true;
    lightSemanticTitle.default = createSectionTitle(_("Semantic Colors"));
    lightSemanticTitle.description = _("Configure semantic colors used for buttons and badge components. The primary color is the most widely used color in the theme, affecting form components (input, button, select, dropdown) focus and hover states.");

    addColorInputs(ss, "light", semanticColorVars, "light");

    const lightStatusTitle = ss.taboption("light", form.DummyValue, "", "");
    lightStatusTitle.rawhtml = true;
    lightStatusTitle.default = createSectionTitle(_("Status Colors"));
    lightStatusTitle.description = _("Configure status colors used for tooltips, alert messages, labels, and legend components. Each status (success, info, warning, error) has distinct colors to convey different states.");

    addColorInputs(ss, "light", statusColorVars, "light");

    const darkGradientTitle = ss.taboption("dark", form.DummyValue, "", "");
    darkGradientTitle.rawhtml = true;
    darkGradientTitle.default = createSectionTitle(_("Gradient Colors"));
    darkGradientTitle.description = _("Configure gradient colors used for backgrounds and progress bars. Progress bars use these gradients to create visual depth and indicate completion status.");

    addColorInputs(ss, "dark", darkGradientColorVars, "dark");

    const darkSemanticTitle = ss.taboption("dark", form.DummyValue, "", "");
    darkSemanticTitle.rawhtml = true;
    darkSemanticTitle.default = createSectionTitle(_("Semantic Colors"));
    darkSemanticTitle.description = _("Configure semantic colors used for buttons and badge components. The primary color is the most widely used color in the theme, affecting form components (input, button, select, dropdown) focus and hover states.");

    addColorInputs(ss, "dark", darkSemanticColorVars, "dark");

    const darkStatusTitle = ss.taboption("dark", form.DummyValue, "", "");
    darkStatusTitle.rawhtml = true;
    darkStatusTitle.default = createSectionTitle(_("Status Colors"));
    darkStatusTitle.description = _("Configure status colors used for tooltips, alert messages, labels, and legend components. Each status (success, info, warning, error) has distinct colors to convey different states.");

    addColorInputs(ss, "dark", darkStatusColorVars, "dark");

    o = s.taboption(
      "structure",
      form.SectionValue,
      "_structure",
      form.NamedSection,
      "theme",
      "aurora"
    );
    ss = o.subsection;

    const layoutTitle = ss.option(form.DummyValue, "", "");
    layoutTitle.rawhtml = true;
    layoutTitle.default = createSectionTitle(_("Layout"));

    so = ss.option(
      form.ListValue,
      "nav_submenu_type",
      _("Navigation Submenu Type")
    );
    so.value("mega-menu", _("Mega Menu"));
    so.value("boxed-dropdown", _("Boxed Dropdown"));
    so.default = "mega-menu";
    so.rmempty = false;

    so = ss.option(form.Value, "struct_spacing", _("Spacing"));
    so.default = structureVars[2][1];
    so.placeholder = structureVars[2][1];
    so.rmempty = false;
    so.render = function (option_index, section_id, in_table) {
      var self = this;
      var el = form.Value.prototype.render.apply(this, [
        option_index,
        section_id,
        in_table,
      ]);
      return Promise.resolve(el).then(function (element) {
        var input = element.querySelector("input");
        if (input) {
          input.type = "hidden";
          var value = input.value || self.default;
          var numValue = parseFloat(value) || 0.25;
          var valueDisplay = E(
            "span",
            {
              style:
                "margin-left: 10px; min-width: 60px; display: inline-block;",
            },
            numValue.toFixed(2) + "rem"
          );
          var rangeInput = E("input", {
            type: "range",
            min: "-0.1",
            max: "0.5",
            step: "0.05",
            value: numValue,
            style: "width: 200px; vertical-align: middle;",
            input: function (ev) {
              var val = parseFloat(this.value).toFixed(2) + "rem";
              input.value = val;
              valueDisplay.textContent = val;
            },
          });
          input.parentNode.appendChild(rangeInput);
          input.parentNode.appendChild(valueDisplay);
        }
        return element;
      });
    };

    // Icon Management Section
    o = s.taboption(
      "toolbar",
      form.SectionValue,
      "_icon_management",
      form.NamedSection,
      "theme",
      "aurora",
      _("Icon Management"),
      _(
        "Upload and manage custom icons for toolbar items. Icons are stored in <code>/www/luci-static/aurora/images/</code>."
      )
    );
    ss = o.subsection;

    // Upload button
    so = ss.option(
      form.Button,
      "_upload_icon",
      _("Upload Icon")
    );
    so.inputstyle = "add";
    so.inputtitle = _("Upload Icon...");
    so.onclick = ui.createHandlerFn(this, function(ev) {
      var path = "/tmp/aurora_icon.tmp";
      return ui.uploadFile(path, ev.target).then(function(res) {
        console.log('Upload completed, res:', res);
        if (!res || !res.name) {
          throw new Error(_('No file selected or upload failed'));
        }

        // Extract basename to preserve original filename
        var filename = res.name.split('/').pop().split('\\').pop();

        return L.resolveDefault(callUploadIcon(filename), {}).then(function(ret) {
          if (ret && ret.result === 0) {
            ui.addNotification(null, E('p', _('Icon uploaded successfully: %s').format(filename)));
            setTimeout(function() {
              window.location.reload();
            }, 1000);
          } else {
            var errorMsg = ret ? (ret.error || 'Unknown error') : 'No response from server';
            ui.addNotification(null, E('p', _('Failed to upload icon: %s').format(errorMsg)));
            return L.resolveDefault(fs.remove(path), {});
          }
        }).catch(function(rpcError) {
          console.error('RPC call error:', rpcError);
          ui.addNotification(null, E('p', _('RPC call failed: %s').format(rpcError.message || rpcError)));
          return L.resolveDefault(fs.remove(path), {});
        });
      }).catch(function(e) {
        console.error('Upload error:', e);
        ui.addNotification(null, E('p', _('Upload error: %s').format(e.message)));
        return L.resolveDefault(fs.remove(path), {});
      });
    });

    // Show list of icons
    so = ss.option(form.DummyValue, "_icon_list", _("Uploaded Icons"));
    so.rawhtml = true;
    so.cfgvalue = function () {
      return L.resolveDefault(callListIcons(), { icons: [] }).then(
        function (response) {
          var icons = (response && response.icons) || [];

          if (icons.length === 0) {
            return '<em>' + _("No icons uploaded yet.") + "</em>";
          }

          var html =
            '<ul style="list-style: none; padding: 0; margin: 10px 0;">';
          icons.forEach(function (icon) {
            html +=
              '<li style="padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center;">';
            html += '<span style="font-family: monospace;">' + icon + "</span>";
            html +=
              '<button class="cbi-button cbi-button-remove" data-icon="' +
              icon +
              '" style="margin-left: 10px;">' +
              _("Delete") +
              "</button>";
            html += "</li>";
          });
          html += "</ul>";

          // Add event delegation for delete buttons
          setTimeout(function () {
            var container = document.querySelector(
              '[data-name="_icon_list"] .cbi-value-field'
            );
            if (container) {
              container.addEventListener("click", function (e) {
                if (
                  e.target.classList.contains("cbi-button-remove") &&
                  e.target.dataset.icon
                ) {
                  var icon = e.target.dataset.icon;
                  if (confirm(_("Delete icon '%s'?").format(icon))) {
                    L.resolveDefault(callRemoveIcon(icon), {}).then(
                      function (ret) {
                        if (ret.result === 0) {
                          ui.addNotification(
                            null,
                            E("p", _("Icon deleted: %s").format(icon))
                          );
                          window.location.reload();
                        } else {
                          ui.addNotification(
                            null,
                            E("p", _("Failed to delete icon: %s").format(icon))
                          );
                        }
                      }
                    );
                  }
                }
              });
            }
          }, 100);

          return html;
        }
      );
    };

    // Toolbar Items Section
    o = s.taboption(
      "toolbar",
      form.SectionValue,
      "_toolbar",
      form.GridSection,
      "toolbar_item",
      _("Toolbar Items"),
      _(
        "Configure the floating button group items. You can add, remove, and reorder items by dragging."
      )
    );
    ss = o.subsection;

    ss.addremove = true;
    ss.sortable = true;
    ss.anonymous = true;
    ss.nodescriptions = true;

    so = ss.option(form.Flag, "enabled", _("Enabled"));
    so.default = "1";
    so.rmempty = false;
    so.editable = true;

    so = ss.option(form.Value, "title", _("Title"));
    so.rmempty = false;
    so.placeholder = _("Button Title");
    so.validate = function (section_id, value) {
      if (!value || value.trim() === "") {
        return _("Title is required");
      }
      return true;
    };

    so = ss.option(form.Value, "url", _("URL"));
    so.rmempty = false;
    so.placeholder = "/cgi-bin/luci/...";
    so.validate = function (section_id, value) {
      if (!value || value.trim() === "") {
        return _("URL is required");
      }
      return true;
    };

    // Icon field as ListValue (dropdown)
    so = ss.option(form.ListValue, "icon", _("Icon"));
    so.rmempty = false;
    so.load = function (section_id) {
      return L.resolveDefault(callListIcons(), { icons: [] }).then(
        L.bind(function (response) {
          var icons = (response && response.icons) || [];

          // Clear existing values
          this.keylist = [];
          this.vallist = [];

          // Add icons as options
          if (icons.length > 0) {
            icons.forEach(
              L.bind(function (icon) {
                this.value(icon, icon);
              }, this)
            );
          } else {
            this.value("", _("(No icons uploaded)"));
          }

          return form.ListValue.prototype.load.apply(this, [section_id]);
        }, this)
      );
    };
    so.validate = function (section_id, value) {
      if (!value || value.trim() === "") {
        return _("Icon is required");
      }
      return true;
    };

    return m.render();
  },
});
