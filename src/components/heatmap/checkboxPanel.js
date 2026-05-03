// checkboxPanel.js

/**
 * Grouped tooltip field definitions.
 * Each entry: { key, label }
 * key  → matches a property on the partStats object
 * label → human-readable display string
 */
export const FIELD_GROUPS = [
  {
    group: "Radome & Nose",
    fields: [
      { key: "STR_RAD",      label: "Radome struck"      },
      { key: "DAM_RAD",      label: "Radome damaged"     },
      { key: "STR_NOSE",     label: "Nose struck"        },
      { key: "DAM_NOSE",     label: "Nose damaged"       },
      { key: "STR_WINDSHLD", label: "Windshield struck"  },
      { key: "DAM_WINDSHLD", label: "Windshield damaged" },
    ],
  },
  {
    group: "Engines",
    fields: [
      { key: "STR_ENG1",       label: "Engine 1 struck"   },
      { key: "DAM_ENG1",       label: "Engine 1 damaged"  },
      { key: "ING_ENG1",       label: "Engine 1 ingested" },
      { key: "STR_ENG2",       label: "Engine 2 struck"   },
      { key: "DAM_ENG2",       label: "Engine 2 damaged"  },
      { key: "ING_ENG2",       label: "Engine 2 ingested" },
      { key: "STR_ENG3",       label: "Engine 3 struck"   },
      { key: "DAM_ENG3",       label: "Engine 3 damaged"  },
      { key: "ING_ENG3",       label: "Engine 3 ingested" },
      { key: "STR_ENG4",       label: "Engine 4 struck"   },
      { key: "DAM_ENG4",       label: "Engine 4 damaged"  },
      { key: "ING_ENG4",       label: "Engine 4 ingested" },
      { key: "INGESTED_OTHER", label: "Other ingested"    },
    ],
  },
  {
    group: "Airframe",
    fields: [
      { key: "STR_WING_ROT", label: "Wing / rotor struck"  },
      { key: "DAM_WING_ROT", label: "Wing / rotor damaged" },
      { key: "STR_FUSE",     label: "Fuselage struck"      },
      { key: "DAM_FUSE",     label: "Fuselage damaged"     },
      { key: "STR_TAIL",     label: "Tail struck"          },
      { key: "DAM_TAIL",     label: "Tail damaged"         },
      { key: "STR_LG",       label: "Landing gear struck"  },
      { key: "DAM_LG",       label: "Landing gear damaged" },
    ],
  },
  {
    group: "Other",
    fields: [
      { key: "STR_PROP",  label: "Propeller struck"  },
      { key: "DAM_PROP",  label: "Propeller damaged" },
      { key: "STR_LGHTS", label: "Lights struck"     },
      { key: "DAM_LGHTS", label: "Lights damaged"    },
      { key: "STR_OTHER", label: "Other struck"      },
      { key: "DAM_OTHER", label: "Other damaged"     },
    ],
  },
];

/**
 * Builds the checkbox control panel and appends it to `parentEl`.
 * Returns a function getActiveKeys() → Set<string> of currently checked keys.
 *
 * @param {HTMLElement} parentEl  - the container to append the panel into
 * @param {Function}    onChange  - called whenever any checkbox changes
 */
export function buildCheckboxPanel(parentEl, onChange) {
  const panel = document.createElement("div");
  panel.className = "heatmap-controls";

  const heading = document.createElement("h3");
  heading.textContent = "Show in tooltip";
  panel.appendChild(heading);

  // track checkbox elements for getActiveKeys()
  const allCheckboxEls = [];

  FIELD_GROUPS.forEach(({ group, fields }) => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "checkbox-group";

    // ── group header row (label + toggle button) ──────────────────────
    const headerRow = document.createElement("div");
    headerRow.className = "checkbox-group-header";

    const groupLabel = document.createElement("div");
    groupLabel.className = "checkbox-group-label";
    groupLabel.textContent = group;

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "checkbox-group-toggle";
    toggleBtn.textContent = "deselect all";

    headerRow.appendChild(groupLabel);
    headerRow.appendChild(toggleBtn);
    groupDiv.appendChild(headerRow);

    // ── checkboxes for this group ─────────────────────────────────────
    const groupCheckboxEls = [];   // only this group's checkboxes

    fields.forEach(({ key, label }) => {
      const uid = `cb-${key}-${Math.random().toString(36).slice(2, 7)}`;

      const row = document.createElement("div");
      row.className = "checkbox-row";

      const container = document.createElement("div");
      container.className = "checkbox-container";

      const wrapper = document.createElement("div");
      wrapper.className = "checkbox-wrapper";

      const input = document.createElement("input");
      input.className = "checkbox";
      input.id = uid;
      input.type = "checkbox";
      input.dataset.key = key;
      input.checked = true;
      input.addEventListener("change", () => {
        // sync button label whenever a checkbox changes manually
        const allChecked = groupCheckboxEls.every(cb => cb.checked);
        toggleBtn.textContent = allChecked ? "deselect all" : "select all";
        onChange();
      });

      allCheckboxEls.push(input);
      groupCheckboxEls.push(input);

      const labelEl = document.createElement("label");
      labelEl.className = "checkbox-label";
      labelEl.htmlFor = uid;
      labelEl.innerHTML = `
        <div class="checkbox-flip">
          <div class="checkbox-front">
            <svg fill="white" height="16" width="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13H12V19H11V13H5V12H11V6H12V12H19V13Z" class="icon-path"></path>
            </svg>
          </div>
          <div class="checkbox-back">
            <svg fill="white" height="16" width="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 19l-7-7 1.41-1.41L9 16.17l11.29-11.3L22 6l-13 13z" class="icon-path"></path>
            </svg>
          </div>
        </div>`;

      wrapper.appendChild(input);
      wrapper.appendChild(labelEl);
      container.appendChild(wrapper);

      const labelText = document.createElement("span");
      labelText.textContent = label;

      row.appendChild(container);
      row.appendChild(labelText);
      groupDiv.appendChild(row);
    });

    // ── toggle button logic ───────────────────────────────────────────
    toggleBtn.addEventListener("click", () => {
      const allChecked = groupCheckboxEls.every(cb => cb.checked);
      const newState = !allChecked;           // flip: if all on → all off, else → all on

      groupCheckboxEls.forEach(cb => { cb.checked = newState; });
      toggleBtn.textContent = newState ? "deselect all" : "select all";
      onChange();
    });

    panel.appendChild(groupDiv);
  });

  parentEl.appendChild(panel);

  /** Returns the Set of field keys whose checkbox is currently checked */
  function getActiveKeys() {
    return new Set(
      allCheckboxEls.filter(cb => cb.checked).map(cb => cb.dataset.key)
    );
  }

  return getActiveKeys;
}