function parseCSVByObject(external_data_def) {
  const new_headers = []
  const new_data = {}
  const match_col = !(external_data_def.id_column >= 0) ? `name_prop` : `unique_id_col_name`
  const external_cat = 99
  const external_header_options = {}
  const external_cat_options = []
  external_cat_options[0] = ``
  // var new_cats = [];
  Papa.parse(external_data_def.external_filename, {
    header: false,
    download: true,
    complete(results) {
      const	name_column = external_data_def.name_column
      const	id_column = external_data_def.id_column
      // console.log(id_column);
      const header_line = external_data_def.header_line
      const start_col = external_data_def.start_col
      const start_line = external_data_def.start_line
      const cat_line = external_data_def.cat_line
      const source_line = external_data_def.source_line
      const temporal_line = external_data_def.temporal_line
      const column_action_line = external_data_def.column_action_line
      const len = results.data.length

      // Initiate the new categories
      let curr_cat = cat_line >= 0 ? results.data[cat_line][start_col] : ui_strings[`external_cat`]
      // console.log(curr_cat);
      let curr_cat_id = external_cat - 1
      let source, temporal = ``
      // Create the new columns array.
      // external_header_options[curr_cat_id] = '';
      for (let z = start_col; z < results.data[header_line].length; z++) {
        const action = (!column_action_line || results.data[column_action_line][z] == 0) ? 4 : 0
        source = (source_line >= 0) ? results.data[source_line][z] : ``
        temporal = (temporal_line >= 0) ? results.data[temporal_line][z] : ``
        // Create new cat options and array.
        if (cat_line >= 0 && (!(curr_cat === results.data[cat_line][z]) || z == start_col)) {
          // console.log(results.data[cat_line][z]);
          curr_cat_id = curr_cat_id + 1
          curr_cat = results.data[cat_line][z]
          external_cat_options[0] += `<option data-cat_id=${curr_cat_id} value=${curr_cat_id}>${curr_cat}</option>`
          external_header_options[curr_cat_id] = ``
        }
        const cat_id = cat_line >= 0 ? curr_cat_id : external_cat
        // new_cats[z] = cat_id;
        new_headers[z] =
     {"action_col": action, "alias": results.data[header_line][z], cat_id, "col_type": `float`, "name": `z${z}`, source, temporal}
        external_header_options[cat_id] += `${`<option data-col_name="` + `z`}${z}" ` +
     `data-min-val="" data-max_val="" data-cat_id="${cat_id}" data-source_name="${source}">${results.data[header_line][z]}</option>`
      }
      external_cat_options[0] = !external_cat_options[0] ? `<option data-cat_id=${99} value=${99}>${curr_cat}</option>` : external_cat_options[0]
      // console.log(external_cat_options);
      // console.log(new_headers);
      // Create the new data array.
      for (let i = start_line; i < len; i++) {
        line = results.data[i]
        // console.log(line[0]);
        const id = !(id_column >= 0) ? line[name_column] : line[id_column]
        // console.log(id);
        if (id) {
          new_data[id] = line
        }
      }
      header_name_to_alias.extends(new_headers)
    }
  })
  //

  // TODO: Wait until content ready/ see better approach for return.
  return {"header_object": new_headers,
    "data_object": new_data,
    match_col,
    "header_options": external_header_options,
		 "start_col": external_data_def.start_col, /* "new_categories" : new_cats, */ external_cat_options}
}

const current_cols = []
const current_cols_headers = []
let computed = false

function changeDataCol(event, ui) {
  ui.item.option.selected = true
  console.log(lgb.getGeoLayer().getLayers().length)
  const featureGroup = lgb.getGeoLayer()
  const col_name = ui.item.option.attributes[`data-col_name`].value
  const new_col_name = `_${col_name}_`
  // col_name = ui.item.option.attributes['data-col_name'].value;
  const num = document.getElementsByClassName(`data_var`).length > 0 ? document.getElementsByClassName(`data_var`).length + 1 : 1
  const wrapper = document.getElementById(`data_col_alias0`)

  if (num == 1) {
    wrapper.innerHTML += `<span id='var_header' > <div class='varSystemName'>${ui_strings[`system_name`]}</div><div class='varName'>${ui_strings[`table_col_name`]}</div></span><br>`
  }
  console.log(wrapper)
  wrapper.innerHTML += `${`<span class='data_var'>` + // <div class='cancelVar'>X </div>
 `<div id='varSystemName`}${num}' class='user_action varSystemName' > ${new_col_name}</div><div class='varName' data-col_name='${new_col_name
  }' data-eval_str='layer.feature.properties[${new_col_name}]'>${ui.item.value}</div></span><br>`
  current_cols.push(col_name)
  current_cols_headers.push(ui.item.value)

  // Add event listeners to all sysVar divs.
  const sysNames = 	document.getElementsByClassName(`varSystemName`)
  for (let t = 0; t < sysNames.length; t++) {
    sysNames[t].addEventListener(`click`, clickVarName)
  }

  if (num == 1) {
    // Create the evaluate expression section.
    const input_eval_var = document.createElement(`input`)
    input_eval_var.id = `eval_data_expression`
    input_eval_var.classList.add(`data_expression`)
    // create the label.
    const input_label = document.createElement(`label`)
    input_label.innerHTML = ui_strings[`create_computed_data`]
    // Create the calculate button.
    const input_btn = document.createElement(`button`)
    input_btn.innerHTML = ui_strings[`compute_and_display`]
    input_btn.id = `calcNewVar`
    // Add new elements to the dom.
    wrapper.parentNode.insertBefore(input_btn, wrapper.nextSibling)
    wrapper.parentNode.insertBefore(input_eval_var, wrapper.nextSibling)
    wrapper.parentNode.insertBefore(input_label, wrapper.nextSibling)
    // Add event listeners.
    document.getElementById(`calcNewVar`).addEventListener(`click`, evaluateInputExpression)
    document.getElementById(`eval_data_expression`).addEventListener(`keyup`, event => {
      event.preventDefault()
      if (event.keyCode == 13) {
        document.getElementById(`calcNewVar`).click()
      }
    })
  }

  const data_col_select = document.getElementById(`data_col_select0`)
  data_col_select.remove(data_col_select.selectedIndex)
  buildDataProcTable()
}

function buildDataProcTable() {
  // var computed_th = '';
  // if (computed)
  const	computed_th = computed ? `<th><div class='th_div'>${ui_strings[`computed_alias`]}</div></th>` : ``
  let dpt = `<table id='data_proc_table'><thead><th><div class='th_div'>${ui_strings[`muni_name`]}</div></th>${computed_th}`

  for (let i = 0; i < current_cols_headers.length; i++) {
    const data_ballon_th = ` data-balloon='${current_cols_headers[i]}' data-balloon-pos='down' data-balloon-length='small' `
    dpt += `<th${data_ballon_th}><div class='th_div'>${current_cols_headers[i]}</div></th>`
  }
  dpt += `</thead><tbody>`
  // console.log(dpt);
  const featureGroup = lgb.getGeoLayer()
  featureGroup.eachLayer(layer => {
    dpt += `<tr class='user_action' data-id=${layer._leaflet_id}>`
    dpt += `<td><div class='td_div'>${layer.feature.properties[`muni_heb`]}</div></td>`
    dpt += computed ? `<td><div class='td_div'>${formatNumberToDisplay(eliminateStringsInNumbers(layer.feature.properties[`computed`]))}</div></td>` : ``
    for (let i = 0; i < current_cols.length; i++) {
      dpt += `<td><div class='td_div'>${formatNumberToDisplay(eliminateStringsInNumbers(layer.feature.properties[current_cols[i]]))}</div></td>`
    }
    dpt += `</tr>`
  })
  dpt += `</tbody></table>`
  // console.log(dpt);
  document.getElementById(`data_proc_table_wrapper`).innerHTML = dpt
  const table_elem = document.getElementById(`data_proc_table`)
  makeSortable(table_elem)
  table_elem.addEventListener(`click`, clickDataProcTable)
}

function clickDataProcTable(e) {
  lgb.dataTableClick(e, 2)
}

function clickVarName(e) {
  console.log(e.target.innerHTML)
  lgb.copyValToClipboard(e.target.innerHTML)
  const input_div = document.getElementById(`eval_data_expression`)
  input_div.value += e.target.innerHTML
  input_div.focus()
}

function evaluateInputExpression(e) {
  console.log(e.target.parentElement.querySelector(`input`))
  const input_expression = document.getElementById(`eval_data_expression`).value
  if (input_expression) {
    const cols_in_expr = {}
    let new_expression = input_expression
    // var data_vars = document.getElementsByClassName('varName');
    const data_vars = document.querySelectorAll(`span.data_var > .varName`)
    console.log(input_expression)
    for (let i = 0; i < data_vars.length; i++) {
      const col_name = data_vars[i].attributes[`data-col_name`].value
      // Replace escaping strings.
      const stripped_col_name = col_name.replace(/_/g, ``)
      const col_layer_ref = data_vars[i].attributes[`data-eval_str`].value

      const replace = col_name
      const re = new RegExp(replace, `g`)

      // Build new col reference, first ste - change to string refrence, than replace all occurences to eliminateStringsInNumbers(new reference);
      // Change the refrence.
      const new_col_ref = col_layer_ref.replace(`[${col_name}]`, `["${stripped_col_name}"]`)
      // console.log(new_col_ref);

      // Change the expression refrences.
      const temp_expression = new_expression
      new_expression = new_expression.replace(re, `eliminateStringsInNumbers(${new_col_ref})`)

      // Create a unique entry for all the columns in use in the expression.
      if (temp_expression != new_expression) { cols_in_expr[stripped_col_name] = stripped_col_name }

      // console.log(new_expression);
    }

    console.log(cols_in_expr)
    const featureGroup = lgb.getGeoLayer()
    featureGroup.eachLayer(layer => {
      let new_val = ``
      try {
        if (eliminateByArray(layer, cols_in_expr) != `**` || new_expression.indexOf(`/`) < 0) {
          // console.log(new_expression);
          new_val = eval(new_expression)
          // console.log(new_val);
        }
      } catch (e) {

      }
      layer.feature.properties[`computed`] = (parseFloat(new_val) && isFinite(new_val)) ? new_val : `-`
    })

    header_options_by_cat[999] = `${`<option data-col_name="computed" ` + `data-min-val="" data-max_val="" data-cat_id="`}${999}" >${
      ui_strings[`computed_alias`]}</option>`
    const new_cat = `<option id="external_cat" data-cat_id="999" value=999 >${ui_strings[`computed_cat`]}</option>`
    if (!document.getElementById(`external_cat`)) {
      // var cat_id = document.getElementById("cat_sel").value;
      document.getElementById(`cat_sel`).innerHTML += new_cat

      console.log(`change cat after exp`)
      header_name_to_alias.push({"action_col": 4, "alias": ui_strings[`computed_alias`], "cat_id": 999, "col_type": `float`, "name": `computed`})
    }
    lgb.changeCategory(999)
    computed = true
    buildDataProcTable()
  }
}

function eliminateByArray(layer, cols_in_expr) {
  let eliminateOK = 1
  for (col in cols_in_expr) {
    const eliminated = eliminateStringsIfNumbers(layer.feature.properties[col], 0)
    eliminateOK = (!eliminated || !(eliminateOK > 0)) ? `**` : eliminateStringsInNumbers(layer.feature.properties[col])
    if (eliminateOK === `**`) {
      // console.log("break on eliminateOK");
      break
    }
  }
  return eliminateOK
}

function sortTable(table, col, reverse, table2 = null) {
  let tb = table.tBodies[0], // use `<tbody>` to ignore `<thead>` and `<tfoot>` rows
    tr = Array.prototype.slice.call(tb.rows, 0), // put rows into array
    i
  if (table2) {
    var tb2 = table2.tBodies[0], // use `<tbody>` to ignore `<thead>` and `<tfoot>` rows
      tr2 = Array.prototype.slice.call(tb2.rows, 0), // put rows into array
      j
  }
  reverse = -((+reverse) || -1)
  tr = tr.sort((a, b) => // sort rows
    // var new_a = eliminateStringsInNumbers(a.cells[col].textContent.trim());
    // var new_b = eliminateStringsInNumbers(b.cells[col].textContent.trim());
		 reverse *
   (a.cells[col].textContent.trim().replace(/[,]/g, ``) // using `.textContent.trim()` for test
     .localeCompare(b.cells[col].textContent.trim().replace(/[,]/g, ``), undefined, { "numeric": true })
			   ))
  const second_table_rows = []
  for (i = 0; i < tr.length; ++i) {
    console.log(tr[i].getAttribute(`data-id`))
    console.log(tb2)
    console.log(tb2.querySelector(`[data-id='${tr[i].getAttribute(`data-id`)}']`))
    console.log(tr2[i].getAttribute(`data-id`))
    second_table_rows[i] = tb2.querySelector(`[data-id='${tr[i].getAttribute(`data-id`)}']`)
    tr2[i] = tb2.querySelector(`[data-id='${tr[i].getAttribute(`data-id`)}']`)

    tb2.appendChild(tr2[i])
    tb.appendChild(tr[i])
  } // append each row in order

  console.log(second_table_rows)
}

function sortSecondTable(sort_by_table, table, connect_id) {
  const sort_by_rows = sort_by_table.getElementsByTagName(`TR`)
  const rows = table.getElementsByTagName(`TR`)

  for (i = 1; i < (sort_by_rows.length); i++) {
    // console.log(i);
    const new_idx = sort_by_rows[i].getAttribute(`data-id`)
    // rows[new_idx] = rows.
    rows[i].getElementsByTagName(`TD`)[0].innerHTML = i
    // rows[i].style.cursor = "alias";
  }
}

function makeSortable(table, str_index = 0, first_col_sort = 0, table2 = null) {
  let th = table.tHead, i
  th && (th = th.rows[0]) && (th = th.cells)
  if (th) i = th.length
  else return // if no `<thead>` then do nothing
  while (--i >= 0) {
    (function(i) {
      let dir = (i === str_index) ? 1 : 0
      // console.log(i);
      if (i != 0 || first_col_sort == 0) {
        th[i].addEventListener(`click`, () => {
          sortTable(table, i, (dir = 1 - dir), table2)
          if (first_col_sort > 0) {
            changeIndexTds(table, 1)
            // console.log(first_col_sort);
          }
        })
      }
    }(i))
  }
}

function makeAllSortable(parent) {
  parent = parent || document.body
  let t = parent.getElementsByTagName(`table`), i = t.length
  while (--i >= 0) makeSortable(t[i])
}

function operatorSelector(num) {
  return `<select id='oper_select${num}' class='oper_select'>` +
  /* "<option >בחר</option>" + */
  `<option data-operator='>'>${ui_strings[`greater`]}</option>` +
  `<option data-operator='<'>${ui_strings[`smaller`]}</option>` +
  `<option data-operator='>='>${ui_strings[`greater_e`]}</option>` +
  `<option data-operator='<='>${ui_strings[`smaller_e`]}</option>` +
  `<option data-operator='=='>${ui_strings[`equals`]}</option>` +
  `</select>`
}

function arrayObjectIndexOf(myArray, searchTerm, property) {
  for (let i = 0, len = myArray.length; i < len; i++) {
    if (myArray[i][property] === searchTerm) return i
  }
  return -1
}

function formatNumberToDisplay(num, per = 2) {
  if (per == 0) {
    return num.toLocaleString(undefined, { maximumFractionDigits: 0, minimumFractionDigits: 0})
  } else if (num > 1000) {
    return num.toLocaleString(undefined, {maximumSignificantDigits: 6,
      minimumSignificantDigits: 1,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0})
  }
  /* else if (!num) {
		return "-";
	} */
  else {
    return num.toLocaleString(undefined, { maximumFractionDigits: per, minimumFractionDigits: 0})
  }
}

function formatNumberAsPercent(num) {
  return `${(num * 100).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0})}%`
}

Array.prototype.contains = function(obj) {
  let i = this.length
  while (i--) {
    if (this[i] == obj) {
      return i
    }
  }
  return false
}

Array.prototype.extends = function(other_array) {
  /* you should include a test to check whether other_array really is an array */
  other_array.forEach(function(v) {
    this.push(v)
  }
    , this)
}

function getUrlParam(name, url) {
  if (!url) url = location.href
  name = name.replace(/[\[]/, `\\\[`).replace(/[\]]/, `\\\]`)
  const regexS = `[\\?&]${name}=([^&#]*)`
  const regex = new RegExp(regexS)
  const results = regex.exec(url)
  return results == null ? null : results[1]
}
// getUrlParam('q', 'hxxp://example.com/?q=abc')

function openModal() {
  img = document.getElementById(`instructions-image`)
  img.style.background = ``
  const url_str = `url(instructions.gif?v=${new Date().valueOf()})`
  img.style.background = `${url_str} no-repeat center center`
  img.style.backgroundSize = `contain`
  fadeIn(document.getElementById(`info_modal`), `block`)
  document.getElementById(`info_modal`).style.visibility = `visible`
}

function closeModal() {
  fadeOut(document.getElementById(`info_modal`), `none`)
  document.getElementById(`info_modal`).style.visibility = `hidden`
  document.querySelector(`#columns_container > span > input`).focus()
}

window.onclick = function(event) {
  if (event.target == document.getElementById(`info_modal`)) {
    closeModal()
  }
}

// fade out

function fadeOut(el) {
  el.style.opacity = 1;

  (function fade() {
    if ((el.style.opacity -= 0.1) < 0) {
      el.style.display = `none`
    } else {
      requestAnimationFrame(fade)
    }
  })()
}

// fade in

function fadeIn(el, display) {
  el.style.opacity = 0
  el.style.display = display || `block`;

  (function fade() {
    let val = parseFloat(el.style.opacity)
    if (!((val += 0.1) > 1)) {
      el.style.opacity = val
      requestAnimationFrame(fade)
    }
  })()
}

function setDisplayCookie(attr, curr_leaf = ``) {
  Cookies.set(`last_attr${curr_leaf}`, attr, { expires: 7 })
}
function getDisplayCookie(curr_leaf = ``) {
  // console.log( Cookies.get('last_attr' + curr_leaf));
  return Cookies.get(`last_attr${curr_leaf}`)
}
function setNormalizeCookie(attr, curr_leaf) {
  Cookies.set(`normalize${curr_leaf}`, attr, { expires: 7 })
}
function getNormalizeCookie(curr_leaf = ``) {
  return Cookies.get(`normalize${curr_leaf}`)
}

function changeDisplayedDataCookie(attr, curr_leaf = ``) {
  setDisplayCookie(attr, curr_leaf)
  setNormalizeCookie(0, curr_leaf)
}

function changeIndexTds(table, first_col_sort) {
  const rows = table.getElementsByTagName(`TR`)
  // console.log(rows);
  if (first_col_sort > 0) {
    for (i = 1; i < (rows.length); i++) {
      // console.log(i);
      rows[i].getElementsByTagName(`TD`)[0].innerHTML = i
      // rows[i].style.cursor = "alias";
    }
  }
}

function eliminateStringsInNumbers(brew_num) {
  if (brew_num) {
    brew_num = brew_num.toString().replace(`(`, ``).replace(`)`, ``).replace(`...`, ``).replace(`..`, ``)
    brew_num = brew_num.replace(/,/g, ``)
    brew_num = (brew_num === `-` || brew_num === `.`) ? `` : brew_num
  }
  if (parseFloat(brew_num)) {
    return (parseFloat(brew_num))
  }
  // When the value is a string or null return 0.
  // console.log(brew_num);
  return 0
}

function eliminateStringsIfNumbers(brew_num, str_ind) {
  if (brew_num) {
    brew_num = brew_num.toString()
      .replace(`(`, ``).replace(`)`, ``)
      // .replace(",","")
      .replace(`...`, ``).replace(`..`, ``)
    // brew_num = brew_num.toString();
    brew_num = brew_num.replace(/,/g, ``)
    brew_num = (brew_num === `-` || brew_num === `.`) ? `` : brew_num
  }
  if (parseFloat(brew_num)) {
    return (parseFloat(brew_num))
  }
  // When the value is a string or null return null unless first column indiciation .
  if (str_ind == 1) { return	brew_num } else { return null }
}
// TODO: Change function location.
// Initiate column headers and first column to display.
function setColumnHeaders(header_options_by_cat) {
  let header_options = ``
  for (const header_option_cat in header_options_by_cat) {
    if 	(header_option_cat > 0) { header_options += header_options_by_cat[header_option_cat] }
  }
  header_options += header_options_by_cat[0]
  return header_options
}

function setColumnToDisplay(header_name_to_alias, curr_leaf, default_col) {
  let url_col_name = getUrlParam(`col_id`, null)
  const last_attr = getDisplayCookie(curr_leaf)
  const result = header_name_to_alias.filter(obj => obj.name === url_col_name)
  url_col_name = (result.length > 0) ? url_col_name : last_attr
  return url_col_name || default_col
} function leafletGeoBrew(filename, current_comn_name, default_color, name_prop, normalize_col
  , unique_id_col_name, first_visit, ui_name = null, type_muni = null, reg_muni_file = null
  , curr_leaf = null, papa = null, normalize_link = 0, csv_object = null, show_extra = null, rtl = 0) {
  const brew = new classyBrew()
  let brew_data_array = []
  const total_population = 0
  const filtered_population = 0
  let feature_group_length = 0
  const filter_array = []
  let legend_array = []
  let legend_values_array = []
  const active_filter_array = []
  let brew_bucket_ind = 0
  let selection_ind = 0
  let manual_selection_ind = 0
  let brew_max_num = 5
  let brew_curr_num = 5
  let classy_method = `jenks`
  let data_timer = ``
  const bubble_timer = ``
  let chartsContainer
  const charts = {}
  // var display_normalize_bubbles = 5;
  const no_data_color = `lightgrey`
  const disabled_options_array = []
  let external_data_array = {}
  const external_data_array_names = []
  let external_data_headers = []
  let extraFeatureGroup	= ``
  // var muni_name_options	= '<option val="none">' + ui_strings['select_muni'] + '</option>';
  let muni_name_options	= `<option></option>`
  let categories_select_all_options = categories_select_options	// Initiate local categories select options.
  let min_brew_select = 3, max_brew_select = 9
  const selected_style =
  {
    weight: 1,
    opacity: 1,
    color: `#333`,
    dashArray: ``,
    fillOpacity: 1
  }
  const default_style =
  {
    weight: 0.7,
    opacity: 1,
    color: `grey`,
    dashArray: `1`,
    fillOpacity: 0.7
  }
  const empty_style =
  {
    fillColor: `lightgrey`,
    weight: 0.7,
    opacity: 1,
    color: `grey`,
    dashArray: `1`,
    fillOpacity: 0.7
  }
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  let muni_selector = ``
  let muni_selectize = ``

  const balloon_hor_pos_edit = rtl > 0 ? `left` : `right`
  const balloon_hor_pos_control = rtl > 0 ? `right` : `left`
  const control_btns_pos = rtl > 0 ? `topright` : `topleft`
  const info_pos = rtl > 0 ? `topleft` : `topright`
  const legend_pos = rtl > 0 ? `bottomright` : `bottomleft`
  const gen_btns_pos = rtl > 0 ? `bottomleft` : `bottomright`
  // console.log(control_btns_pos);

  const all_profile_sorted = []
  const names_list = [`muni_heb`, `Muni_Eng`, `a1`, `LocalityCo`, `a2`, `name`, `d_name` ]
  // TODO: remove and pass as param
  if (!curr_leaf) {
    const url = window.location.pathname
    curr_leaf = url.substring(url.lastIndexOf(`/`) + 1)
  }
  // console.log(curr_leaf);

  // Check the current interface strings.
  const curr_ui_strings = (ui_name) ? eval(`ui_strings${ui_name}`) : ui_strings
  if (ui_name.length > 0) {
    var new_array = eval(`ui_strings${ui_name}`)
    for (ui_str in ui_strings) {
      if (!new_array[ui_str] && new_array[ui_str] != ``) {
        curr_ui_strings[ui_str] = ui_strings[ui_str]
      }
    }
    ui_strings = curr_ui_strings
    // ui_strings.extends(new_array);
  }

  const curr_titles = (ui_name) ? eval(`ui_objects_titles${ui_name}`) : ui_objects_titles
  if (ui_name.length > 0) {
    var new_array = eval(`ui_objects_titles${ui_name}`)
    for (ui_str in ui_objects_titles) {
      if (!new_array[ui_str] && new_array[ui_str] != ``) {
        curr_titles[ui_str] = ui_objects_titles[ui_str]
      }
    }
    ui_objects_titles = curr_titles
  }

  // Initiate base layers.
  let mbAttr = `Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ` +
   `<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ` +
   `Imagery © <a href="http://mapbox.com">Mapbox</a>`,
    mbUrl = `https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`

  let grayscale = L.tileLayer(mbUrl, {id: `mapbox.light`, attribution: mbAttr, opacity: 0.5}),
    streets = L.tileLayer(mbUrl, {id: `mapbox.streets`, attribution: mbAttr, opacity: 0.5})
  const googleSat = L.tileLayer(`http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}`, {
    maxZoom: 20,
    subdomains: [`mt0`, `mt1`, `mt2`, `mt3`],
    opacity: 0.5
  })
  const googleTerrain = L.tileLayer(`http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}`, {
    maxZoom: 20,
    subdomains: [`mt0`, `mt1`, `mt2`, `mt3`],
    opacity: 0.5
  })
  const googleHybrid = L.tileLayer(`http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}`, {
    maxZoom: 20,
    subdomains: [`mt0`, `mt1`, `mt2`, `mt3`],
    opacity: 0.5
  })
  const googleStreets = L.tileLayer(`http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`, {
    maxZoom: 20,
    subdomains: [`mt0`, `mt1`, `mt2`, `mt3`],
    opacity: 0.5
  })
  // TODO: Change to all headers.
  const profileHeaders = [`a14`, `a15`, `a230`, `a33`, `a34`, `a35`, `a89`]
  const profileHeadersAll = []

  const chartsConfig = {
    ages_chart: {
      a24: `0-4`,
      a25: `5-9`,
      a26: `10-14`,
      a27: `15-19`,
      a28: `20-29`,
      a29: `30-44`,
      a30: `45-59`,
      a31: `60-64`,
      a32: `65+`
    }
    /* religions_chart: {
			a16: 'יהודים',
			a18: 'מוסלמים',
			a19: 'נוצרים',
			a20: 'דרוזים'
		} */
  }

  const baseLayers = {
    "Streets": streets,
    "Grayscale": grayscale,
    "Google Satellite": googleSat,
    "Google Terrain": googleTerrain,
    "Google Hybrid": googleHybrid,
    "Google Streets": googleStreets
  }

  // Initiate leaflet controls.
  const legend = L.control({position: legend_pos})
  const info = L.control({position: info_pos})
  // var info2 = L.control();
  const info3 = L.control({position: info_pos})
  const circles = L.control({position: control_btns_pos})
  const refocus = L.control({position: control_btns_pos})
  const showTable = L.control({position: legend_pos})
  const attribution = L.control.attribution({position: `bottomleft`})
  const baseLayerControl = L.control.layers(baseLayers, null, {position: control_btns_pos})
  const colorControl = L.control({position: control_btns_pos})
  const nameDisplay = L.control({position: control_btns_pos})
  // var opacitySlider = new L.Control.opacitySlider({position: 'bottomright'});
  const higherOpacity = new L.Control.higherOpacity({position: gen_btns_pos})
  const lowerOpacity = new L.Control.lowerOpacity({position: gen_btns_pos})
  const share = new L.Control({position: gen_btns_pos})
  const searchControl = new L.Control.geocoder({position: gen_btns_pos, defaultMarkGeocode: false})
  const scaleControl = new L.control.scale({position: `bottomright`, imperial: false})
  const data_proc_control = new L.Control({position: gen_btns_pos})

  // Initiate the map.
  const map = L.map(`map`, {
    attributionControl: false,
    zoomControl: true
  })

  map.zoomControl.setPosition(control_btns_pos)
  // TODO: Add bouds save - optional?
  /* map.on('moveend', function() {
		console.log("finished zoom");
	}); */
  map.on(`baselayerchange`, e => {
    // console.log(e.layer);
    lowerOpacity.setOpacityLayer(e.layer)
    higherOpacity.setOpacityLayer(e.layer)
  })

  // Selecting a geocoded search result will focus the map on the new location.
  searchControl.on(`markgeocode`, e => {
    const bbox = e.geocode.bbox
    const poly = L.polygon([
			 bbox.getSouthEast(),
			 bbox.getNorthEast(),
			 bbox.getNorthWest(),
			 bbox.getSouthWest()
    ])
    map.fitBounds(poly.getBounds())
  })

  // Create the map's feature groupe (geojson base map, etc, layer in leaflet is a polygon.....)
  const geojsonLayer = new L.GeoJSON.AJAX(
    filename,
    {
      onEachFeature
    }
  )

  if (reg_muni_file) {
    // console.log('pf');
    extraFeatureGroup = new L.GeoJSON.AJAX(
      reg_muni_file,
      {
        onEachFeature
      }
    )
  }

  // Create the markers layer
  const markersLayer = L.layerGroup()
  // Add the feature groupe to the map.
  geojsonLayer.addTo(map)

  // After the loading of the feature group.
  geojsonLayer.on(`data:loaded`, () => {
    // console.log("data loaded");
    const layer_num = geojsonLayer.getLayers().length
    let new_layer_num = 0
    if (reg_muni_file) {
      extraFeatureGroup.addTo(map)
      // Wait until the extra layers are added to the map to proceed with map preparation.
      var new_interval = setInterval(() => {
        // console.log(extraFeatureGroup.getLayers().length);
        if (extraFeatureGroup.getLayers().length > 0) {
          // console.log(extraFeatureGroup.getLayers().length);
          extraFeatureGroup.eachLayer(layer => {
            geojsonLayer.addLayer(layer)
          })
          // Remove the featuregroup after being added to the main FeatureGroup.
          map.removeLayer(extraFeatureGroup)
          new_layer_num = geojsonLayer.getLayers().length
          // console.log("after muni loop");
          // console.log(new_layer_num);
          if (papa) {
            parseCSV()
          }
          clearInterval(new_interval)
          prepareMap()
        }
      }, 100)
    }
    // Add data from external CSV to the displayed polygons.
    function parseCSV() {
      // TODO: iterate on new categories
      for (header_option in csv_object.header_options) {
        // console.log(header_option);
        // console.log(csv_object.header_options[header_option]);
        header_options_by_cat[header_option] = csv_object.header_options[header_option]
        document.getElementById(`col_filter_select`).innerHTML += header_options_by_cat[header_option]
        document.getElementById(`data_col_select0`).innerHTML += header_options_by_cat[header_option]
      }
      // header_options_by_cat[99] = csv_object.header_options[0];
      external_data_array = csv_object.data_object
      external_data_headers = csv_object.header_object
      const key_col = csv_object.match_col
      var start_col = csv_object.start_col
      const new_categories_options = csv_object.external_cat_options[0]
      // var new_categories = csv_object.new_categories[0];
      var start_col = csv_object.start_col
      // console.log("Matched by " + key_col);
      // console.log("start by " + start_col);
      // console.log(external_data_headers);
      // Add the data to the displayed featureGroup.
      addExtrnalData(geojsonLayer, external_data_array, external_data_headers, key_col, start_col)
      // console.log("after new table");
      // Change the category selector options.
      // TODO: Move the functionality.
      categories_select_all_options += new_categories_options
      if (document.getElementById(`cat_sel`)) {
        const cat_id = document.getElementById(`cat_sel`).value
        document.getElementById(`cat_sel`).innerHTML = categories_select_all_options
        document.getElementById(`cat_sel`).value = cat_id
        // console.log('change cat');
      }
      // Add the new column to the select columns array.
    }
    // Classify and color the feature group layers by attribute.
    function prepareMap() {
      streets.addTo(map)
      map.removeLayer(geojsonLayer) // Re initiate the loaded layers.
      map.addLayer(geojsonLayer)

      // prepareExtremeValues();
      writeExtremeValues()
      const all_extreme_value = {}
      // Initiate the municipalities selector with a reference to the layer id.
      geojsonLayer.eachLayer(layer => {
        muni_name_options += `<option data-id='${layer._leaflet_id}' value='${layer._leaflet_id}'>${layer.feature.properties[name_prop]}</option>`
        // all_extreme_value[layer._leaflet_id] = layer.extremeValues;
        // console.log(layer.extremeValues);
      })
      // console.log(JSON.stringify(all_extreme_value));
      changeColorByAttr(geojsonLayer, current_comn_name/*, undefined, undefined */)
      // Initiate the total number of layer entities (cities).
      feature_group_length = geojsonLayer.getLayers().length
      // Info divs and base layer.
      addControlElements()
      displayNormalizeBubble()
      toggleShowTableContainer()
      zoomToLayer()
      // Toggle loading and map display.
      fadeOut(document.getElementById(`loading_div`), `none`)
      // Commented db registration for hackathon
      // if (!first_visit)
      fadeOut(document.getElementById(`info_modal`), `none`)
      /* else {
				registerVisit();
				if (!isMobile) {
					var next_data_e = document.getElementsByClassName('prev_data')[0];
					var first_legend_e = document.querySelector('.legendBtn.legendAction.user_action');
					next_data_e.setAttribute('data-balloon-visible', true);
					first_legend_e.setAttribute('data-balloon-visible', true);
					var bubble_inter = setInterval(function() {
						if (next_data_e.getAttribute('data-balloon-visible')) {
							//col_actions_element.classList.remove("bubble");
							next_data_e.removeAttribute('data-balloon-visible')
							first_legend_e.removeAttribute('data-balloon-visible')
							clearInterval(bubble_inter);
					   }
					}, 700);
				}
			} */
      // Create autocomplete inputs for column and filter selectors.
      updateAutoCompleteElements()
      // Prevent double click on leaflet elements.
      preventDoubleClick()
      createLegendEventListeners()
      // When normalized is set - change the data classification and display.
      if (((typeof (getNormalizeCookie()) !== `undefined` &&
    getNormalizeCookie(curr_leaf) == 1) || normalize_link == 1) &&
    document.getElementsByClassName(`action_sign`).length > 0) {
        normalizeData()
      }
    }

    // When there is no extra polygons file (read the csv) and prepare the map.
    if (!reg_muni_file) {
      if (papa) {
        parseCSV()
      }
      prepareMap()
    }
    this.update
  })

  function onEachFeature(feature, layer) {
    // Wrap all polygons in one earth projection.
    const bounds = layer.getBounds()
    if (Math.abs(bounds.getWest()) + Math.abs(bounds.getEast()) > 359) {
      const latlongs = layer.getLatLngs()
      latlongs.forEach(shape => {
        shape.forEach(cord => {
          cord.forEach(inner_cord => {
            // console.log(inner_cord);
            if (inner_cord.lng > 0) {
              inner_cord.lng -= 360
            }
          })
        })
      })
      layer.setLatLngs(latlongs)
    }
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: onFeatureClick,
      dblclick: selectFeature
    })
    // Add the internal layer attributes for all features (layer) elements.
    feature.style = 1
    feature.selected = 0
    feature.manual_selected = 0
    layer.filtered = 0
    // layer.feature.properties[unique_id_col_name] = layer.feature.properties[unique_id_col_name] > 0 ? layer.feature.properties[unique_id_col_name] : layer.feature.properties["a1"];
    layer.uniqueID = layer.feature.properties[unique_id_col_name] ? layer.feature.properties[unique_id_col_name] : layer.feature.properties[`a1`]
    layer.leaflet_id = layer.feature.properties[unique_id_col_name]
    // Initiate the filter properties array.
    filter_array[layer.feature.properties[unique_id_col_name]] = []
    layer.centroid = layer.getBounds().getCenter()
    layer.extremeValues = []
    const circle = L.circle(layer.centroid)
    markersLayer.addLayer(circle)
  }

  function getLayersCount() {
    return layersCount = geojsonLayer.getLayers().length
  }

  function addExtrnalData(featureGroup, data_array, headers_array, key_col, start_col) {
    // console.log(data_array);
    // console.log(headers_array.length);
    let z = 0
    const match_type = (eval(key_col) === unique_id_col_name) ? 0 : 1
    // console.log(match_type);
    // Iterate on the featureGroup and match by name/unique1d.
    featureGroup.eachLayer(layer => {
      // console.log(layer.feature.properties[name_prop]);
      if (match_type == 1) {
        // console.log(data_array[layer.feature.properties[name_prop]]);
        if (data_array[layer.feature.properties[name_prop]]) {
          for (var t = start_col; t < headers_array.length; t++) {
            // Add the new data to each layer.
            // console.log(headers_array[t].name);
            // console.log(layer.feature.properties[name_prop]);
            // console.log(layer.feature.properties);
            // console.log(data_array[layer.feature.properties[name_prop]][t]);
            const curr_name = layer.feature.properties[name_prop]
            layer.feature.properties[headers_array[t].name] = data_array[curr_name][t]
          }
          // console.log(layer.feature.properties);
          z++
        } else {
          console.log(layer.feature.properties[name_prop])
        }
      } else {
        if (data_array[layer.uniqueID]) {
          for (var t = start_col; t < headers_array.length; t++) {
            // Add the new data to each layer.
            layer.feature.properties[headers_array[t].name] = data_array[layer.uniqueID][t]
          }
          z++
        }
      }
    })
    // console.log(z + " csv matches");
  }

  // Create the info div's actions.
  info.onAdd = function(map) {
    this._div = L.DomUtil.create(`div`, `info topInfo`)
    this._div.id = `info`

    // Create the info header.
    const div_header = L.DomUtil.create(`span`)
    div_header.id = `info_header`
    div_header.title = ui_objects_titles[`column_select`]

    // Create the paging objects.
    const next_data = L.DomUtil.create(`div`, `next_data change_data`)
    // next_data.innerHTML = rtl > 0 ? '☚' :'☛';
    next_data.innerHTML = rtl > 0 ? `⋙` : `⋘`
    const prev_data = L.DomUtil.create(`div`, `prev_data change_data`)
    // prev_data.innerHTML = rtl > 0 ? '☛' :'☚';
    prev_data.innerHTML = rtl > 0 ? `⋙` : `⋙`
    prev_data.title = ui_objects_titles[`next_data`]

    // create the select column element.
    const category_col_select = L.DomUtil.create(`div`)
    category_col_select.id = `columns_container`

    // The displayed column header.
    // var header = L.DomUtil.create('h4', 'user_action');
    const header = L.DomUtil.create(`h4`, `action`)

    // Append the generated header elenents.
    div_header.appendChild(next_data)
    div_header.appendChild(header)
    div_header.appendChild(prev_data)

    // Create the category select element.
    const category_select = L.DomUtil.create(`div`)
    category_select.id = `category_select`
    category_select.title = ui_objects_titles[`category_select`]
    const select_element = L.DomUtil.create(`select`, `action`)
    select_element.id = `cat_sel`
    select_element.dir = rtl > 0 ? `ltr` : `rtl`
    select_element.innerHTML = categories_select_all_options
    // console.log(categories_select_all_options);
    category_select.appendChild(select_element)

    // Create the content div
    const div_content = L.DomUtil.create(`div`)
    div_content.id = `info_content`
    const div_footer = L.DomUtil.create(`div`, `minimized`)
    div_footer.id = `info_footer`
    div_footer.innerHTML = `<div id="muni_sel_container"><select id="muni_sel" class="muni_sel action">${muni_name_options}</select></div>`
    // div_footer.innerHTML += '<div id="muni_data"><div id="general_data"></div><div id="special_data"></div><div id="external_links_data"></div></div>'
    // div_footer.innerHTML += '<div id="muni_data"><div id="general_data"></div><div id="special_data"></div></div>';
    div_footer.innerHTML += `<div id="muni_data"><div id="general_data"></div></div>`
    // TODO: Change min/max values.
    div_content.innerHTML = `<div class="sub_info"></div><div id="year_slider"><input id="year_slider_input" type="range" min="2010" max="2015" value="2010" step="1" ` +
   `onchange="$('#year_value').text($('#year_slider_input').val());"><span id="year_value"></span></div>`

    // Initialize chart container
    google.charts.load(`current`, {'packages': [`corechart`]})
    google.charts.setOnLoadCallback(() => {
      chartsContainer = document.createElement(`div`)
      chartsContainer.className = `charts-container`
      for (const key in chartsConfig) {
        const element = document.createElement(`div`)
        // element.className = 'chart-' + key;
        element.className = `chart`
        element.id = `chart-${key}`
        charts[key] = new google.visualization.PieChart(element)
        chartsContainer.appendChild(element)
      }
    })

    // Add all the elements to the current div.
    this._div.appendChild(category_select)
    this._div.appendChild(category_col_select)
    this._div.appendChild(div_header)
    this._div.appendChild(div_content)
    this._div.appendChild(div_footer)

    return this._div
  }

  info3.onAdd = function(map) {
    this._div = L.DomUtil.create(`div`, `info3`)
    this._div.innerHTML = `<div>${ui_strings[`create_filters`]}</div><div id="filter_container"></div>`
    return this._div
  }

  refocus.onAdd = function(map) {
    this._div = L.DomUtil.create(`div`)
    this._div.id = `refocus_container;`
    this._div.innerHTML = `<div id="refocus" title="${ui_objects_titles[`refocus`]}" data-balloon="${ui_objects_titles[`refocus`]}" data-balloon-pos="${balloon_hor_pos_edit}" class="refocus"><b>&#10021</b></div>`
    return this._div
  }

  circles.onAdd = function(map) {
    this._div = L.DomUtil.create(`div`)
    this._div.id = `circles_toggle`
    this._div.innerHTML = `<div id="circles" ` + /* title="' + ui_objects_titles['refocus'] + */ `" class="refocus"><b>o</b></div>`
    return this._div
  }
  share.onAdd = function(map) {
    this._div = L.DomUtil.create(`div`)
    this._div.id = `share_container`
    this._div.innerHTML = `<div id="share" data-balloon="${ui_strings[`get_link`]}" data-balloon-pos="${balloon_hor_pos_control}" class="refocus"><b>☍</b></div>`
    return this._div
  }

  data_proc_control.onAdd = function(map) {
    this._div = L.DomUtil.create(`div`)
    this._div.id = `data_proc_control_container`
    this._div.innerHTML = `<div id="data_proc_control" data-balloon="${ui_strings[`data_proc_control`]}" data-balloon-pos="${balloon_hor_pos_control}" class="refocus"><b>&#9534</b></div>`
    return this._div
  }

  showTable.onAdd = function(map) {
    this._div = L.DomUtil.create(`div`, `showTable`)
    this._div.id = `showTableContainer`
    // this._div.innerHTML ='<div id="showTable" title="' + ui_objects_titles['showTable'] +'" class="refocus"><div id="showTableAnchor"><b>&#8868</b></div><div id="selected_table_header" class=""></div></div>';
    this._div.innerHTML = `<div id="showTable" title="${ui_objects_titles[`showTable`]}" class="refocus"><div id="showTableAnchor"><b>&#8868</b></div></div>`
    return this._div
  }

  nameDisplay.update = function(props) {
    document.querySelector(`.name_display`).innerHTML = props[name_prop]
  }
  // TODO: change div to static and update elements in the update function.
  info.update = function(props) {
    const display_name = getCurrentHeaderAlias()
    let extra_info = getCurrentHeaderArray().source ? `${getCurrentHeaderArray().source}<br>` : ``
    document.querySelector(`#info_header > h4`).innerHTML = display_name
    if (current_comn_name.replace(`z`, ``) > 0) {
      const cat_sel = document.getElementById(`cat_sel`)
      const cat_name = cat_sel.options[cat_sel.selectedIndex].text
      // console.log(cat_sel_v);
      if (ui_strings[`external_info_array`][cat_name]) {
        extra_info += `${ui_strings[`external_info_array`][cat_name]}<br>`
      } else { extra_info += `${ui_strings[`external_info`]}<br>` }
    }
    // var city_info =  update_city_info(props, extra_info);
    $(`#city_info`).empty()
    // $("#info_content").append(city_info);
    // $(".sub_info").append(extra_info);
    // $(".sub_info").append('<div class="sub_info"> ' + extra_info  + (isMobile ? ui_strings['empty_info_sub_title_mobile'] : ui_strings['empty_info_sub_title']) + '</div>');
    // document.querySelector('.sub_info').innerHTML =  extra_info  + (isMobile ? ui_strings['empty_info_sub_title_mobile'] : ui_strings['empty_info_sub_title']);
    document.querySelector(`.sub_info`).innerHTML = extra_info
    yearSliderControl()
  }

  // function toggleExpandedView(e) {
  function openMuniProfile(e) {
    const info_footer = document.getElementById(`info_footer`)
    // var info_footer_select = e.target;
    const info_footer_select = document.getElementById(`muni_sel`)

    if (info_footer.classList.contains(`minimized`)) {
      info_footer.classList.remove(`minimized`)
      info_footer.classList.add(`expanded`)
    }

    const data_id = !e ? $(`.selectize-input .item`)[0].getAttribute(`data-value`) : e
    // console.log(data_id);
    // console.log($(".selectize-input .item"));
    // var data_id = $(".selectize-input .item").data("id");
    // Close the profile div if no municipality is chosen.
    if (info_footer_select.selectedIndex == 0 && !parseInt(data_id)) {
      info_footer.classList.remove(`expanded`)
      info_footer.classList.add(`minimized`)
    } else {
      const curr_layer = geojsonLayer.getLayer(data_id)
      // nameDisplay.update(curr_layer.feature.properties);
      selectProfileFeature(curr_layer)
      highlightProfileMuni(curr_layer)
      // var data_id = info_footer_select[info_footer_select.selectedIndex].attributes['data-id'].value;
      changeMuniSelect(curr_layer)
    }
  }

  // Stubs for GoogleServe
  function changeMuniSelect(layer) {
    addGeneralData(layer)
    // addSpecialData(layer);
  }

  function addGeneralData(layer) {
    $(`#general_data`).empty()
    // const names = ["a14", "a15", "a230", "a33", "a34"];
    const names = [`a14`, `a230`]
    if (!names.includes(current_comn_name)) { names.unshift(current_comn_name) }
    const layersCount = getLayersCount()
    // console.log(extremeValues);
    // layer.extremeValues.forEach(function(extreme) {
    names.forEach(name => {
      // const headerArray = getCurrentHeaderArray(extreme.header);
      const headerArray = getCurrentHeaderArray(name)
      // console.log(layer.extremeValues);
      // const extreme = layer.extremeValues[name];
      const extreme = getCurrentExtremeArray(layer, name)
      // console.log(headerArray);
      // Add a pseudo bar chart for each column name in the current profile.
      if (names.includes(headerArray.name) && layer.feature.properties[extreme.header]) {
        $(`#general_data`).append(
          `<a href='#' id='datalink_${headerArray.name}' class='datalink_${headerArray.name}'>${headerArray.alias}</a>` +
     `<div id='percent_fill${headerArray.name}' class='percent_fill' data-rank_per='${extreme.rank + 1 / layersCount}' >${formatNumberToDisplay(layer.feature.properties[extreme.header])
     } (${extreme.rank + 1}/${layersCount})</div>`)
        // $(".datalink_" + headerArray.name).on('click',() => changeDisplayData(undefined, headerArray.name));
        document.getElementById(`datalink_${headerArray.name}`).addEventListener(`click`, () => { changeDisplayData(undefined, headerArray.name) })
        // TODO: Extract to ui funcions.
        const curr_per = Math.round(((extreme.rank + 1) / layersCount) * 100)
        const fill_per = 100 - curr_per
        // console.log(fill_per);

        $(`#percent_fill${headerArray.name}`).css({'background': `linear-gradient(to left, rgba(178, 185, 184, 0.5)  ${curr_per}% ,#ffffff ${curr_per}%)`})
        // linear-gradient(135deg, rgba(1, 70, 195, 0.28), rgba(151, 208, 186, 0.4))
      }

      // console.log($( window.getComputedStyle($("#percent_fill" + headerArray.name).get(0), null)));
    })
    if (document.getElementById(`data_proc`).style.display === `none`) { toggleDataProc(1) }

    if (!document.querySelector(`#data_proc #info_footer`)) { document.getElementById(`data_proc`).appendChild(document.getElementById(`info_footer`)) }

    if (!document.querySelector(`#info_footer #showTable`)) {
      document.getElementById(`info_footer`).appendChild(document.getElementById(`showTable`))
      /* var e = document.createElement('div');
			e.className = "new_table";
			e.id = "new_table";
			//e.innerHTML = createCleanDataTable();
			document.getElementById('info_footer').appendChild(e);			*/
    }
    // var e = document.getElementById("new_table");

    addCharts(layer)
  }

  function addSpecialData(layer) {
    $(`#special_data`).empty()

    const maxRankForLowValues = getLayersCount() * 0.1
    const minRankForHighValues = getLayersCount() * 0.9
    // TODO: Change to coherent function.
    const isExtreme = val => val < maxRankForLowValues || val > minRankForHighValues
    // const names = ['a14','a35','a89'];
    const names = profileHeadersAll
    // console.log(names);
    const layersCount = getLayersCount()

    // layer.extremeValues.forEach(function(extreme) {
    names.forEach(name => {
      // console.log(name);
      const headerArray = getCurrentHeaderArray(name)
      // console.log(layer.extremeValues);
      // const extreme = layer.extremeValues[name];
      const extreme = getCurrentExtremeArray(layer, name)
      // console.log(headerArray);
      // const headerArray = getCurrentHeaderArray(extreme.header);
      if (headerArray && names.includes(headerArray.name) && isExtreme(extreme.rank) && eliminateStringsInNumbers(layer.feature.properties[extreme.header])) {
        $(`#special_data`).append(
          // "<a href='#' class='datalink_" + headerArray.name + "'>" + headerArray.alias + "</a> : " +
          // formatNumberToDisplay(layer.feature.properties[extreme.header]) +
          // " (" + (extreme.rank + 1) + "/" + layersCount + ")<br/>"
          `<a href='#' id='datalink_${headerArray.name}' class='datalink_${headerArray.name}'>${headerArray.alias}</a>` +
     `<div id='s_percent_fill${headerArray.name}' class='percent_fill' data-rank_per='${extreme.rank + 1 / layersCount}' >${formatNumberToDisplay(layer.feature.properties[extreme.header])
     } (${extreme.rank + 1}/${layersCount})</div>`
        )
        // $(".datalink_" + headerArray.name).on('click',() => changeDisplayData(undefined, headerArray.name));
        document.getElementById(`datalink_${headerArray.name}`).addEventListener(`click`, () => { changeDisplayData(undefined, headerArray.name) })
        const curr_per = Math.round(((extreme.rank + 1) / layersCount) * 100)
        const fill_per = 100 - parseInt(curr_per)
        // console.log(fill_per);
        // console.log(curr_per);
        // $("#s_percent_fill" + headerArray.name).css({'background': 'linear-gradient(to right, rgba(51, 102, 204, 0.7) ' + fill_per + '% ,#ffffff ' + fill_per + '%)'});
        $(`#s_percent_fill${headerArray.name}`).css({'background': `linear-gradient(to left, rgba(51, 102, 204, 0.4) ${fill_per}% ,rgba(51, 102, 204, 0.9) ${fill_per}%)`})
        // $("#s_percent_fill" + headerArray.name).css({'background': 'linear-gradient(to left, rgba(51, 102, 204, 0.7) ' + fill_per + '%)'});
        // $("#s_percent_fill" + headerArray.name).css({'background': 'linear-gradient(to right, rgba(51, 51, 204, 0.7) ' + curr_per + '%)'});
      }
    })
  }

  function addCharts(layer) {
    $(`#general_data`).append(chartsContainer)

    for (const key in chartsConfig) {
      const values = [[`metric`, `value`]]
      for (header in chartsConfig[key]) {
        const value = eliminateStringsInNumbers(layer.feature.properties[header])
        if (value) {
          values.push([
            chartsConfig[key][header],
            value
          ])
        }
      };

      if (values.length > 1 && charts[key]) {
        const data = google.visualization.arrayToDataTable(values)
        charts[key].draw(data, {
          title: ui_strings[key],
          titleTextStyle: {
            "fontSize": 16
          },
          backgroundColor: `transparent`,
          // legend: 'none',
          legend: {
            "position": `right`,
            "maxLines": 9,
            "textStyle": {
              "fontSize": 12
            }
          },
          tooltip: {
            ignoreBounds: true
          },
          chartArea: {width: 298, height: 170},
          colors: brew.getColors(10, `Set3`)
          // colors: ['rgb(84,48,5)','rgb(140,81,10)','rgb(191,129,45)','rgb(223,194,125)','rgb(246,232,195)','rgb(199,234,229)','rgb(128,205,193)','rgb(53,151,143)','rgb(1,102,94)','rgb(0,60,48)']
          // colors: ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)']
          // colors: ['rgb(141,211,199)','rgb(255,255,179)','rgb(190,186,218)','rgb(251,128,114)','rgb(128,177,211)','rgb(253,180,98)','rgb(179,222,105)','rgb(252,205,229)','rgb(217,217,217)']
          // colors: ['#e0440e', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6']
        })
      }
      // console.log(brew.getColors(9));
      // document.querySelector("#general_data > div.charts-container > div > div > div:nth-child(1)").style.width = "100%";
    }
  }

  function createDataProfileSelect() {

  }

  function changeDataProfile(layer, prof_id) {

  }

  function toggleHeaderColSelect() {
    this.parentElement.style.display = `none`
    document.getElementById(`columns_container`).style.display = `block`
    document.querySelector(`#col_select_custom-combobox > input`).click()
  }

  function toggleHeaderInput() {
    if (document.querySelector(`#col_select_custom-combobox input`).value === ``) {
      document.querySelector(`#info_header`).style.display = ``
      document.querySelector(`#ui-id-1`).style.display = `none`
      document.querySelector(`#columns_container`).style.display = `none`
    }
  }

  function update_city_info(props, extra_info = null) {
    const normalized = document.getElementsByClassName(`legendAction normalizedLeg`).length
    // console.log(props);
    return (props ? `<div id="city_info"><b> ${ui_strings[`muni_name`]}: ${props[name_prop]}</b>${
      (type_muni) ? `<br>${props[type_muni]}` : ``
    }<div id="info_display">` +
   `<div id="column_data">${
     getCurrentHeaderAlias()} : ${parseFloat(props[current_comn_name])
     ? formatNumberToDisplay(eliminateStringsInNumbers(props[current_comn_name]))
     : (!props[current_comn_name] && props[current_comn_name] != 0 ? `-` : props[current_comn_name])
   }</div>${
     normalized > 0 ? `<div class="normalizedLeg">${formatNumberToDisplay(eliminateStringsInNumbers(props[current_comn_name]) / props[normalize_col], 2)} ${ui_strings[`normalize_title`]} </div>` : ` `
     //		+ data_string
   }${createInfoDiv(props)
   }${current_comn_name === normalize_col
     ? `<div class="sub_info"> ${ui_strings[`displayed_pop_str`]} ${
       formatNumberAsPercent(props[current_comn_name] / population)
     } ${ui_strings[`from_displayed_pop`]} `
     : `<div class="sub_info">${ui_strings[`population`]
     }: ${formatNumberToDisplay(props[normalize_col])
     } ${ui_strings[`thousand_pop`]} </div>`
   }</div></div>`
      : `<div class="sub_info"> ${extra_info}${isMobile ? ui_strings[`empty_info_sub_title_mobile`] : ui_strings[`empty_info_sub_title`]}</div>`) +
   (current_comn_name === normalize_col
     ? `<div id="info_foot"> ${ui_strings[`total_population_str`]} ${
       formatNumberToDisplay(population)} ${ui_strings[`pop_col_display`]}</div>`
     : ``)
  }

  // Create the legend div's actions.
  legend.onAdd = function(map) {
    // console.log("in legend add");
    this._div = L.DomUtil.create(`div`, `info legend`)
    this._div.id = `legend`
    this.update()
    return this._div
  }

  legend.update = function(map) {
    // console.log("in legend update");
    let div = L.DomUtil.create(`div`, `info legend`),
      grades = brew.getBreaks(),
      labels = [],
      from, to
    // console.log(brew.getBreaks());
    // TODO: Extract function createLegendContent
    const data_balloon = `data-balloon='${ui_strings[`legend_hint`]}' data-balloon-pos='${balloon_hor_pos_edit}' `
    const data_balloon_h = `data-balloon='${ui_strings[`legend_toggle`]}' data-balloon-pos='${balloon_hor_pos_control}' `
    if (brew_bucket_ind > 0) {
      labels.push(
        `<div class="legend-line" data-num=${-1}>` +
    `<div class="legend-entry" title="${brew_bucket_ind}/${feature_group_length}">` +
     `<i class="legendAction" data-action="selectLegendFeatures" style="background:${no_data_color}" ></i> ` +
     `-` +
    `</div>` +
    `<div class="legend-actions">` +
     `<span class="legendBtn legendNum legendAction user_action" ${data_balloon}data-action="selectLegendFeatures">[${brew_bucket_ind}]</span>` +
     `<div class="legendBtn legendAction hideAction user_action" ${data_balloon_h} data-action="toggleFeaturesDisplay"> Hide </div>` +
    `</div></div>`)
    }
    for (let i = 0; i < (grades.length - 1); i++) {
      from = grades[i]
      to = grades[i + 1]
      if (legend_array[i] > 0) {
        labels.push(
          `<div class="legend-line" data-num=${i}>` +
     `<div class="legend-entry" title="${legend_array[i]}/${feature_group_length}">` +
      `<i class="legendAction" data-action="selectLegendFeatures" style="background:${getColor(to)}" ></i> ${
        formatNumberToDisplay(to) - formatNumberToDisplay(from) != 1 ? `${formatNumberToDisplay(from)}&ndash;` : ``}${formatNumberToDisplay(to)
						 ? formatNumberToDisplay(to) : `+`
      }</div>` +
     `<div class="legend-actions">${
       (typeof (legend_values_array[i]) !== `undefined` && getCurrentHeaderArray().action_col < 3)
         ? `<span class="legendBtn legendStat legendAction user_action"  ${data_balloon} data-action="selectLegendFeatures">` + ` ∑${formatNumberToDisplay(legend_values_array[i], 0)}</span>`
         : `<span class="legendBtn legendNum legendAction user_action"  ${data_balloon} data-action="selectLegendFeatures">[${legend_array[i]}]</span>`
     }<div class="legendBtn legendAction hideAction user_action" ${data_balloon_h} data-action="toggleFeaturesDisplay"> Hide </div>` +
     `</div></div>`
        )
      }
    }
    const normalized_legend = (getCurrentHeaderArray().action_col > 0) ? `<span id="col_actions" >`
      : `<span id="col_actions" class="legendAction user_action" data-action="normalizeData" title="${ui_objects_titles[`normalize`]}">` +
   `<div class="action_sign"> &#8469 </div>`
    this._div.innerHTML = `${normalized_legend +
			 shortColumnTitle(getCurrentHeaderAlias())}</span>${labels.join(``)}`
  }

  // Create the legend div's actions.
  colorControl.onAdd = function(map) {
    this._div = L.DomUtil.create(`div`)
    this._div.id = `colorControlContainer`

    const extra_op = `<span id="color_num" ><select id="classy_sel" placeholder="${ui_strings[`choose_classify_num`]}">${buildBrewNumSelect()}</select>` +
   `<select id="brew_method_sel">${buildBrewMethodSelect()}</select></span>`
    const e = `<div id='colors' class='colors' style='display:none;'>${buildColorsSelectTable()}${extra_op}</div>`
    this._div.innerHTML = `<div id="colors_container" data-balloon="${ui_objects_titles[`colors_container`]}"data-balloon-pos="${balloon_hor_pos_edit}" class="colorControl" title="${
      ui_objects_titles[`colors_container`]}"><b>❀</b>${e}</div>`

    return this._div
  }

  nameDisplay.onAdd = function(map) {
    this._div = L.DomUtil.create(`div`)
    this._div.id = `name_display`
    this._div.innerHTML = `<div class="refocus name_display"></div>`

    return this._div
  }

  function changeBrewNum() {
    // console.log(this);
    brew_max_num = document.getElementById(`classy_sel`).value
    console.log(brew_max_num)
    changeColorByAttr(geojsonLayer, current_comn_name)
    updateControlElements()
    document.querySelector(`#brew_colors`).innerHTML = buildColorsSelectTable()
    createColorsListeners()
  }

  function changeBrewMethod() {
    // console.log(this);
    classy_method = document.getElementById(`brew_method_sel`).value
    changeColorByAttr(geojsonLayer, current_comn_name)
    updateControlElements()
    // normalizeData(1);
  }

  // Create the onEachFeature actions.
  function highlightFeature(e) {
    // console.log(e.target.centroid);
    // console.log(e);
    // console.log(typeof(e));
    if (e.target) { var layer = e.target } else { var layer = e }
    // console.log(layer);
    if (!document.getElementsByClassName(`normalizedLeg`).length) { layer.normalStyle = getNormalStyle(eliminateStringsInNumbers(layer.feature.properties[current_comn_name]), layer.feature.selected) }
    // styleFeatureByAttr(e.target.feature,current_comn_name,false);
    else {
      layer.normalStyle = styleFeatureByNormalizedAttr(layer.feature, current_comn_name, false, true)
    }
    if (layer.feature.selected == 0) {
      layer.setStyle({
        weight: 2,
        opacity: 0.7,
        color: `blue`,
        dashArray: ``
        /* fillOpacity: 0.7 */
      })
    } else {
      layer.setStyle({
        weight: 2,
        color: `blue`,
        dashArray: ``
      })
    }

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront()
    }
    // TODO: Add multi select info.
    info.update(layer.feature.properties)
    nameDisplay.update(layer.feature.properties)
    // info.update_city(layer.feature.properties);
  }

  function highlightProfileMuni(layer) {
    nameDisplay.update(layer.feature.properties)
  }

  function toggleShowTableContainer() {
    // TODO: Remove double creation.
    const dt = createDataTable()
    if (dt) {
      // console.log("show table control");
      document.getElementById(`showTable`).style.display = ``
      showSelectedData(dt)
    } else if (!dt) {
      selection_ind = 0
      manual_selection_ind = 0
      document.getElementById(`showTable`).style.display = `none`
      // console.log("hide table control");
    }
  }

  function resetHighlight(e) {
    if (e.target) {
      e.target._map.doubleClickZoom.enable()
      var layer = e.target
    } else {
      var layer = e
    }

    if (layer.feature.selected == 0) {
      layer.setStyle(layer.normalStyle)
    } else {
      layer.setStyle({
        weight: 1,
        color: `#333`
      })
    }
    info.update()
  }

  function onFeatureClick(e) {
    zoomToFeature(e)
    document.getElementById(`muni_sel`).value = e.target._leaflet_id
    // console.log(muni_selectize.items.indexOf('"' + e.target._leaflet_id + '"'));
    if (muni_selectize.items.indexOf(e.target._leaflet_id.toString()) == -1) { muni_selectize.addItem(e.target._leaflet_id) } else {
      const el = $(`.item[data-value="${e.target._leaflet_id}"]`)[0]
      setCurrentProfileItem(el)
    }
    openMuniProfile(e.target._leaflet_id)
    // $('#muni_sel').val(e.target._leaflet_id);
    // changeMuniSelect(e.target);
  }

  function zoomToFeature(e) {
    e.target._map.doubleClickZoom.disable()
    map.fitBounds(e.target.getBounds())
    if (isMobile) {
      selectFeature(e)
    }
  }

  function selectFeature(e) {
    destroyDataTable()
    const layer = e.target

    if (layer.feature.selected == 0 || layer.feature.manual_selected == 0) {
      layer.setStyle(selected_style)
      layer.feature.selected = 1
      layer.feature.manual_selected = 1
      selection_ind += 1
      manual_selection_ind += 1
    } else {
      layer.feature.selected = 0
      layer.feature.manual_selected = 0
      selection_ind = (selection_ind > 0) ? selection_ind - 1 : selection_ind
      manual_selection_ind = (manual_selection_ind > 0)
        ? manual_selection_ind - 1 : manual_selection_ind
      // manual_selection_ind -= 1;
      resetHighlight(e)
    }
    toggleShowTableContainer()

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront()
    }

    // TODO: Add updateMultipleSelection
    // info.update(layer.feature.properties);
  }

  function selectProfileFeature(layer) {
    layer._map.doubleClickZoom.disable()
    destroyDataTable()
    layer.setStyle(selected_style)
    if (layer.feature.selected == 0) { selection_ind += 1 }
    layer.feature.selected = 1
    layer.feature.manual_selected = 1
    toggleShowTableContainer()
  }

  function deSelectProfileFeature(layer) {
    destroyDataTable()
    selection_ind -= 1
    layer.feature.selected = 0
    layer.feature.manual_selected = 0
    resetHighlight(layer)
    toggleShowTableContainer()
  }
  // Change the displayed data series.
  // 1. Receives event - the change is from the paginating elements.
  // 2. Receives an empty event and a col_name - change the displayed data by col_name.
  function changeDisplayData(e, col_name = null) {
    // e.preventDefault();
    destroyDataTable()
    const cat_id = document.getElementById(`cat_sel`).value
    let curr_cat_id = cat_id
    if (!col_name) {
      if (e.target.getAttribute(`data-balloon`)) { e.target.removeAttribute(`data-balloon`) }
      const headers_l = header_name_to_alias.length
      for (let i = 0; i < headers_l; i++) {
        if (header_name_to_alias[i].name === current_comn_name) {
          let next_map_index = (this.classList.contains(`prev_data`)) ? (i + 1) : (i - 1)
          if (typeof (header_name_to_alias[next_map_index]) === `undefined`) {
            next_map_index = (this.classList.contains(`prev_data`)) ? (0) : (headers_l - 1)
            curr_cat_id = header_name_to_alias[next_map_index].cat_id
            current_comn_name = header_name_to_alias[next_map_index].name
          } else {
            curr_cat_id = header_name_to_alias[next_map_index].cat_id
            current_comn_name = header_name_to_alias[next_map_index].name
          }
          break
        }
      }
    } else {
      current_comn_name = col_name
      curr_cat_id = getCurrentHeaderArray().cat_id
    }
    if (cat_id != curr_cat_id)	{
      changeColSelectOptions(curr_cat_id)
    }
    changeColorByAttr(geojsonLayer, current_comn_name)
    updateControlElements()
    changeDisplayedDataCookie(current_comn_name, curr_leaf)
    toggleShowTableContainer()
    // document.getElementById('map').click();
    // e.target.removeAttribute("data-balloon-visible");
  }

  function changeColumn(event, ui, external_val) {
    // console.log(ui);
    const cat_sel_value = document.getElementById(`cat_sel`).value
    if (!external_val && cat_sel_value >= 0) { chosen_category = ui.item.option.attributes[`data-cat_id`].value } else {
      chosen_category = cat_sel_value
    }
    changeColSelectOptions(chosen_category)
    destroyDataTable()
    chosen_option = ui ? ui.item.option.attributes[`data-col_name`].value : external_val.attributes[`data-col_name`].value
    changeColorByAttr(geojsonLayer, chosen_option)
    updateControlElements()
    changeDisplayedDataCookie(chosen_option, curr_leaf)
    document.getElementById(`columns_container`).style.display = `none`
    document.querySelector(`#info_header`).style.display = ``
    toggleShowTableContainer()

    /* const appartment_price_per_year_names = ["z3","z4","z5","z6","z7","z8"];
		if (appartment_price_per_year_names.includes(current_comn_name)) {
			$("#year_slider").show();
		} else {
			$("#year_slider").hide();
		} */
  }

  function createFilter(event, ui) {
    destroyDataTable()
    const curr_option = ui.item.option
    curr_option.selected = true
    const chosen_option = curr_option.attributes[`data-col_name`].value
    // console.log(curr_option);
    const chosen_option_name = curr_option.value
    const min_val = parseFloat(curr_option.attributes[2].value)
      ? formatNumberToDisplay(parseFloat(curr_option.attributes[2].value))
      : curr_option.attributes[2].value
    const max_val = parseFloat(curr_option.attributes[3].value)
      ? formatNumberToDisplay(parseFloat(curr_option.attributes[3].value))
      : curr_option.attributes[3].value
    // Get the last filter div num or initiate the filter count.
    const num = document.getElementsByClassName(`filter`).length == 0 ? 0
      : parseInt(document.getElementById(`filter_container`).lastChild.getAttribute(`id`).replace(`filter`, ``)) + 1

    // TODO: Limit the number of filters (pref desktop 5 and mobile 2-3).
    // Create the filter div, add listeners and update filter column selector and control arrays.
    createFilterDiv(num, chosen_option_name, chosen_option, min_val, max_val)
    addFilterListeners(num)
    updateFilterArraysAndCombo(chosen_option_name, chosen_option, num, curr_option)
    Cookies.set(`last_filter${curr_leaf}`, chosen_option, { expires: 7 })
    toggleShowTableContainer()
  }

  function prepareExtremeValues() {
    const profileValues = {}
    // Create an array with all the column system names.
    for (ds in header_name_to_alias) {
      profileHeadersAll.push(header_name_to_alias[ds].name)
    }
    // console.log(profileHeadersAll);
    geojsonLayer.eachLayer(layer => {
      // profileHeaders.forEach(function (header) {
      profileHeadersAll.forEach(header => {
        profileValues[header] = profileValues[header] || []
        profileValues[header].push({
          id: layer._leaflet_id,
          // value: eliminateStringsIfNumbers(layer.feature.properties[header])
          value: layer.feature.properties[header]
        })
      })
    })

    const layersCount = geojsonLayer.getLayers().length
    // profileHeaders.forEach(function (header) {
    profileHeadersAll.forEach(header => {
      if (header) {
        profileValues[header].sort((a, b) =>

          // const c = eliminateStringsIfNumbers(a);
          // const d = eliminateStringsIfNumbers(b);
          // return a.value - b.value;
					 eliminateStringsIfNumbers(b.value) - eliminateStringsIfNumbers(a.value))
        all_profile_sorted[header] = profileValues[header]
        // console.log(header);
        // console.log(profileValues[header]);
        for (let i = 0; i < layersCount; i++) {
          const layer = geojsonLayer.getLayer(profileValues[header][i].id)
          layer.extremeValues = layer.extremeValues || []
          layer.extremeValues.push({
            header,
            rank: i
          })
        }
      }
    })
    // console.log(all_profile_sorted);
  }

  function writeExtremeValues() {
    for (ds in header_name_to_alias) {
      profileHeadersAll.push(header_name_to_alias[ds].name)
    }
    geojsonLayer.eachLayer(layer => {
      layer.extremeValues = e_ex_values[layer._leaflet_id]
    })
  }
  // TODO: REFACTOR!!! this function is a mess.
  function addControlElements() {
    // map.attributionControl.addAttribution(
    attribution_text =

  `${`<a href=http://www.cbs.gov.il/reader/?MIval=cw_usr_view_SHTML&ID=357 target="_blank">` +
  ` `}${ui_strings[`cbs_attribution`]} </a>` +
  `&copy; <a href="http://www.cbs.gov.il" target="_blank"> Israel Central Bureau of Statistics  </a>` +
  `| <a href="javascript:;" onclick="openModal();" class="about"> By Netta Beninson</a> |`

    attribution.addAttribution(attribution_text).addTo(map)
    showTable.addTo(map)
    legend.addTo(map)
    info.addTo(map)
    info.update()
    initMuniSelectize()
    // console.log(muni_selectize);
    // info2.addTo(map);
    info3.addTo(map)
    nameDisplay.addTo(map)
    refocus.addTo(map)
    colorControl.addTo(map)
    baseLayerControl.addTo(map)
    // circles.addTo(map);
    scaleControl.addTo(map)
    share.addTo(map)
    if (!show_extra) { data_proc_control.addTo(map) }

    map.addControl(lowerOpacity)
    map.addControl(higherOpacity)
    searchControl.addTo(map)
    lowerOpacity.setOpacityLayer(streets)
    higherOpacity.setOpacityLayer(streets)
    document.getElementById(`h_opacity0`).setAttribute(`data-balloon`, ui_strings[`increase_opacity`])
    document.getElementById(`h_opacity0`).setAttribute(`data-balloon-pos`, balloon_hor_pos_control)
    document.getElementById(`l_opacity0`).setAttribute(`data-balloon`, ui_strings[`decrease_opacity`])
    document.getElementById(`l_opacity0`).setAttribute(`data-balloon-pos`, balloon_hor_pos_control)
    const next_data_e = document.getElementsByClassName(`prev_data`)[0]
    const prev_data_e = document.getElementsByClassName(`next_data`)[0]
    next_data_e.setAttribute(`data-balloon`, ui_strings[`paging_bubble`])
    next_data_e.setAttribute(`data-balloon-pos`, balloon_hor_pos_control)
    prev_data_e.setAttribute(`data-balloon`, ui_strings[`paging_bubble`])
    prev_data_e.setAttribute(`data-balloon-pos`, `down`)
    prev_data_e.setAttribute(`data-balloon-length`, `smallX`)

    disableMapPanAndZoom(`refocus`)
    disableMapPanAndZoom(`legend`)
    disableMapPanAndZoom(`info`)
    disableMapPanAndZoom(`showTable`)
    disableMapPanAndZoom(`filter_container`)
    disableMapPanAndZoom(`columns_container`)
    disableMapPanAndZoom(`colors_container`)

    // TODO: Create mapButtonsListener function.
    document.getElementById(`refocus`).addEventListener(`click`, zoomToLayer)
    // document.getElementById("circles").addEventListener("click", toggleCircles);
    document.getElementById(`share`).addEventListener(`click`, createShareLink)
    if (!show_extra) { document.getElementById(`data_proc_control`).addEventListener(`click`, toggleDataProc) }
    document.getElementById(`colors_container`).addEventListener(`click`, changeBrewColor)
    document.getElementById(`showTableAnchor`).addEventListener(`click`, showSelectedData)
    document.getElementById(`cat_sel`).addEventListener(`change`, changeCategory)
    document.getElementById(`cat_sel`).addEventListener(`click`, categoryClick)
    document.querySelector(`.next_data.change_data`).addEventListener(`click`, changeDisplayData)
    document.querySelector(`.prev_data.change_data`).addEventListener(`click`, changeDisplayData)

    document.getElementById(`year_slider_input`).addEventListener(`change`, updateYear)

    const curr_cat_id = getCurrentHeaderArray().cat_id

    changeColSelectOptions(curr_cat_id)

    if (!isMobile) {
      /* document.querySelector('#info_header > h4').addEventListener('mouseenter', toggleHeaderColSelect);
			//document.querySelector('#ui-id-1').addEventListener('mouseout', toggleHeaderInput);
			document.querySelector('#columns_container').addEventListener('mouseout', toggleHeaderInput); */
      document.querySelector(`#info_header > h4`).addEventListener(`click`, toggleHeaderColSelect)
    } else {
      document.querySelector(`#info_header > h4`).addEventListener(`click`, toggleHeaderColSelect)
    }

    document.getElementById(`muni_sel`).addEventListener(`change`, openMuniProfile)
    // document.querySelector(".selectize-input.items.has-options.full.has-items").addEventListener("change", openMuniProfile);
  }

  // Initiate the municipalities selector.
  function initMuniSelectize() {
    muni_selector = $(`#muni_sel`).selectize({
      delimiter: `,`,
      persist: false,
      maxItems: 1000,
      sortField: {
        field: `text`,
        direction: `asc`
      },
      onItemAdd(e) {
        // Blur the select element after add.
        this.blur()
        // Set the current selectize muni div as the displayed profile item.
        const el = $(`.item[data-value="${e}"]`)[0]
        setCurrentProfileItem(el)
        // Add event listener to the selectize muni div.
        el.addEventListener(`click`,
          () => {
            setCurrentProfileItem(el)
            map.fitBounds(geojsonLayer.getLayer(e).getBounds())
            openMuniProfile(e)
          }
        )
        // Zoom on the added selected municiplaity.
        map.fitBounds(geojsonLayer.getLayer(e).getBounds())
      },
      onChange(value) {
        // If there are chosen municiplaities, open the profile of the last muni in the list.
        if (value) { openMuniProfile(value[value.length - 1]) } else {
          // Upon an empty selectize list, empty the profile and close the data proc div
          $(`#general_data`).empty()
          if (!document.getElementById(`table_container`)) { toggleDataProc() }
        }
      },
      onDelete(values) {
        // Deselect muni upon removal from selectize list.
        for (let i = 0; i < values.length; i++) {
          const curr_l = geojsonLayer.getLayer(values[i])
          deSelectProfileFeature(curr_l)
        }
      },
      placeholder: ui_strings[`select_muni`]
    })
    // This stores the selectize object to a variable (with name 'selectize').
    muni_selectize = muni_selector[0].selectize
  }

  function setCurrentProfileItem(el) {
    removeClassFromAll(`currentProfile`)
    el.classList.add(`currentProfile`)
  }

  function updateControlElements() {
    info.update()
    legend.update()
    createLegendEventListeners()
    displayNormalizeBubble()
    displayTableBubble()
  }

  function yearSliderControl() {
    if (getCurrentHeaderArray().temporal > 0) {
      $(`#year_slider`).show()
      document.getElementById(`year_slider_input`).value = getCurrentHeaderArray().temporal
      document.getElementById(`year_value`).innerHTML = getCurrentHeaderArray().temporal
    } else {
      $(`#year_slider`).hide()
    }
  }

  function displayNormalizeBubble() {
    const col_actions_element = document.getElementById(`col_actions`)
    if (document.getElementsByClassName(`action_sign`).length > 0) {
      col_actions_element.setAttribute(`data-balloon`, ui_strings[`user_normalize_action`])
      col_actions_element.setAttribute(`data-balloon-pos`, `down`)
      col_actions_element.setAttribute(`data-balloon-visible`, `data-balloon-visible`)
      var bubble_timer = setTimeout(() => {
			   if (col_actions_element.getAttribute(`data-balloon-visible`)) {
          // col_actions_element.classList.remove("bubble");
          col_actions_element.removeAttribute(`data-balloon-visible`)
          clearTimeout(bubble_timer)
			   }
      }, 700)
      // display_normalize_bubbles--;
    }
  }

  function displayTableBubble() {
    const table_button = document.getElementById(`showTable`)
    if (table_button && !document.getElementById(`dataTable`)) {
      table_button.setAttribute(`data-balloon`, ui_strings[`selected_data_bubble`])
      table_button.setAttribute(`data-balloon-pos`, balloon_hor_pos_edit)
      table_button.setAttribute(`data-balloon-length`, `medium`)
      table_button.setAttribute(`data-balloon-visible`, `data-balloon-visible`)
      data_timer = setTimeout(() => {
			   if (table_button.getAttribute(`data-balloon-visible`)) {
          // col_actions_element.classList.remove("bubble");
          table_button.removeAttribute(`data-balloon-visible`)
          clearTimeout(data_timer)
			   }
      }, 1500)
      // display_normalize_bubbles--;
    } else {
      table_button.setAttribute(`data-balloon-pos`, `none`)
    }
  }

  function updateAutoCompleteElements() {
    const column_container = document.getElementById(`columns_container`)
    const filter_container = document.getElementById(`filter_container`)

    // Move autocomplete select box to container.
    column_container.appendChild(document.getElementById(`col_select_custom-combobox`))
    filter_container.appendChild(document.getElementById(`col_filter_select_custom-combobox`))

    // Set place holders.
    document.querySelector(`#columns_container > span > input`).setAttribute(`placeholder`, ui_strings[`choose_display_col`])
    document.querySelector(`#filter_container > span > input`).setAttribute(`placeholder`, ui_strings[`choose_filter_col`])

    // Initial focus on column selector.
    document.querySelector(`#columns_container > span > input`).focus()
  }
  function normalizeData(cond = 0) {
    destroyDataTable()

    // console.log("in norm");
    if (!document.getElementsByClassName(`normalizedLeg`).length || (cond > 0 && document.getElementsByClassName(`normalizedLeg`).length > 0)) {
      changeColorByAttr(geojsonLayer, current_comn_name, undefined, normalize_col)
      updateControlElements()
      var legend_title = document.getElementById(`col_actions`)
      legend_title.innerHTML += ` (${ui_strings[`normalize_title`]}) `
      legend_title.classList.add(`normalizedLeg`)
      legend_title.setAttribute(`title`, ui_objects_titles[`unnormalize`])
      setNormalizeCookie(1, curr_leaf)
      var col_actions_element = document.getElementById(`col_actions`)
      col_actions_element.setAttribute(`data-balloon-pos`, `none`)
    } else {
      changeColorByAttr(geojsonLayer, current_comn_name)
      updateControlElements()
      var legend_title = document.getElementById(`col_actions`)
      setNormalizeCookie(0, curr_leaf)
      var col_actions_element = document.getElementById(`col_actions`)
      col_actions_element.setAttribute(`data-balloon-pos`, `down`)
    }
  }

  // Create natural jenks array by attr and color plate.
  function changeColorByAttr(featureGroup, attr, color = default_color, brew_factor = null) {
    // Create the brew data array and classes.
    brewByAttr(featureGroup, attr, color, brew_factor)

    // Pass the attr to global var.
    current_comn_name = attr

    // Empty the legend array on column change.
    legend_array = []
    legend_values_array = []
    // Change the style of the feature group by the new brew.
    if (!brew_factor) { featureGroup.setStyle(styleFeatureByAttr) } else {
      featureGroup.setStyle(styleFeatureByNormalizedAttr)
    }
  }

  function changeLayersBrewColor(e) {
    const table_row = e.target.parentElement
    const new_color = table_row.getAttribute(`data-color_code`)
    const colors_div = document.getElementById(`colors`)
    // console.log(table_row.getAttribute('data-color_code'));
    brew.setColorCode(new_color)
    default_color = new_color
    changeColorByAttr(geojsonLayer, current_comn_name, default_color)
    updateControlElements()
  }

  function brewByAttr(featureGroup, attr, color, brew_factor = null) {
    const distinct_array = []
    brew_data_array = []
    brew_bucket_ind = 0
    population = 0
    // Iterate over the features and create the new brew_data_array.
    featureGroup.eachLayer(layer => {
      let feat_attr = layer.feature.properties[attr]
      population = population + layer.feature.properties[normalize_col]
      if (eliminateStringsInNumbers(feat_attr)) {
        feat_attr = eliminateStringsInNumbers(feat_attr)

        if (!distinct_array.contains(feat_attr)) { distinct_array.push(feat_attr) }

        if (!brew_factor) { brew_data_array.push(feat_attr) } else { brew_data_array.push(feat_attr / layer.feature.properties[brew_factor]) }

        // console.log("has layer " + map.hasLayer(layer));
        if (!map.hasLayer(layer) && layer.feature.style == 0 && layer.filtered == 0) {
          // Add the feature to the map if it's not in the map and the feature's legend visibility was off.
          // console.log("in add layer");
          map.addLayer(layer)
        }
      } else {
        // console.log(layer.feature.style);
        // If the layer was hidden from the legend and the layer is in the filter array -> readd the layer.
        if (!map.hasLayer(layer) && layer.feature.style == 0 && layer.filtered == 0) {
          map.addLayer(layer)
        }
        brew_bucket_ind += 1
      }

      // console.log(str_out);
      // Changing the displayed column resets the style (legend visibility) attribute.
      layer.feature.style = 1
    })

    // Re-evaluate the number of classes, if there are less values than classes, change the classes to match.
    let brew_class_num = (brew_data_array.length <= brew_max_num) ? (brew_data_array.length - 1) : brew_max_num
    // console.log(brew_class_num);
    brew_class_num = (distinct_array.length > 0 && brew_max_num >= (distinct_array.length - 1)) ? distinct_array.length - 1 : brew_class_num

    brew_curr_num = brew_class_num
    brew.setSeries(brew_data_array)
    brew.setNumClasses(brew_class_num)
    brew.setColorCode(color)
    brew.classify(classy_method)
  }

  // Styling and color by functions.
  function styleFeatureByAttr(feature, attr = current_comn_name, is_change_color = true) {
    // Parse the colored property numeric value.
    const str = eliminateStringsInNumbers(feature.properties[attr])
    feature.curr_class = getCurrentBreak(str)
    // console.log(feature.curr_class);
    // Change the legend arrays if the displayed column changed.
    if (is_change_color) {
      legend_array[feature.curr_class] = legend_array[feature.curr_class] > 0
        ? legend_array[feature.curr_class] + 1
        : 1
      legend_values_array[feature.curr_class] = (typeof (legend_values_array[feature.curr_class]) !== `undefined`)
        ? legend_values_array[feature.curr_class] + parseFloat(str)
        : parseFloat(str)
    }
    // var selected = feature.manual_selected > 0 ? feature.manual_selected : feature.selected;
    const selected = feature.manual_selected > feature.selected ? feature.manual_selected : feature.selected
    return getNormalStyle(str, selected)
  }

  function styleFeatureByNormalizedAttr(feature, attr = current_comn_name, is_change_color = true, is_change_selected = false) {
    const str = eliminateStringsInNumbers(feature.properties[attr]) / feature.properties[normalize_col]
    feature.curr_class = getCurrentBreak(str)
    if (is_change_color) {
      legend_array[feature.curr_class] = legend_array[feature.curr_class] > 0
        ? legend_array[feature.curr_class] + 1
        : 1
    }
    let selected = feature.manual_selected > 0 ? feature.manual_selected : feature.selected
    selected = !is_change_selected ? selected : 0
    return getNormalStyle(str, selected)
    // TODO: Consider diffrent style for normalized data ==> dashArray: '3'.
  }

  function getColor(number) {
    return (!brew.getColorInRange(number) || (number == 0)) ? no_data_color : brew.getColorInRange(number)
  }

  function getCurrentBreak(num) {
    // console.log(num);
    if (!num) { return -1 }
    for (var i = 0; i < brew.getBreaks().length; i++) {
      if (num <= brew.getBreaks()[i]) { break }
    }
    if (i == 0) { return i }
    return (i - 1)
  }

  function toggleFeaturesDisplay() {
    const curr_state = (this).classList.contains(`hide`)
    const curr_class = (this).parentElement.parentElement.getAttribute(`data-num`)
    const selected_legends = (this).parentElement.parentElement
    geojsonLayer.eachLayer(layer => {
      if (layer.feature.curr_class == curr_class) {
        // console.log("City is %s curr_class is %s", layer.feature.properties.Muni_Heb, curr_class);
        // var display = layer.feature.style > 0 ? 0 : 1;
        const display = curr_state ? 1 : 0
        const filtered = layer.filtered > 0 ? 1 : 0
        if (display > 0 && filtered == 0) {
          map.addLayer(layer)
        } else {
          map.removeLayer(layer)
        }
        // console.log(layer.feature);
        layer.feature.style = display > 0 ? 1 : 0
      }
    })

    if (selected_legends.length > 0) { destroyDataTable() }
    // TODO: create toggle display string function.
    if ((this).classList.contains(`hide`)) {
      (this).classList.remove(`hide`)
      this.innerHTML = `Hide`
    } else {
      (this).classList.add(`hide`)
      this.innerHTML = `Show`
    }
    if (selected_legends.length > 0) { toggleShowTableContainer() }
  }

  function selectLegendFeatures() {
    destroyDataTable()
    const curr_legend_line = (this).parentElement.parentElement
    const curr_class = curr_legend_line.getAttribute(`data-num`)
    const legend_actions = curr_legend_line.querySelector(`div.legend-actions > span`)
    // console.log(curr_class);
    const curr_legend_display = legend_actions.classList.contains(`selectedLegend`) ? 1 : 0
    geojsonLayer.eachLayer(layer => {
      if (layer.feature.curr_class == curr_class) {
        // If the current legend items selection is active, disable the selection.
        layer.feature.selected = curr_legend_display > 0 ? 0 : 1
        // If the feature is manually selected, set the display by the manual selection.
        layer.feature.selected = (layer.feature.manual_selected > 0) ? 1 : layer.feature.selected
        // If the feature is manually selected or the legend row selection is active set the feature as selected.
        if (layer.feature.selected > 0) {
          layer.setStyle(selected_style)
          selection_ind = (layer.feature.manual_selected > 0) ? selection_ind : selection_ind + 1
          // selectProfileFeature(layer);
        } else {
          layer.setStyle(default_style)
          // selection_ind = (layer.feature.manual_selected  == 0) ? selection_ind : selection_ind + 1;
          selection_ind = (selection_ind > 0) ? selection_ind - 1 : selection_ind
          // deSelectProfileFeature(layer);
        }
      }
    })
    toggleShowTableContainer()

    if (curr_legend_display > 0) {
      legend_actions.classList.remove(`selectedLegend`)
      if (!document.getElementById(`selected_features_table1`)) { toggleDataProc() }
    } else {
      // (this).classList.add("selectedLegend");
      legend_actions.classList.add(`selectedLegend`)
      // Open the table in the side div.
      //

      //
      if (document.getElementById(`data_proc`).style.display === `none`) { toggleDataProc(1) }

      if (!document.querySelector(`#data_proc #info_footer`)) { document.getElementById(`data_proc`).appendChild(document.getElementById(`info_footer`)) }

      if (!document.querySelector(`#info_footer #showTable`)) {
        document.getElementById(`info_footer`).appendChild(document.getElementById(`showTable`))
      }
    }
  }

  function createLegendEventListeners() {
    const legendBtns = document.getElementsByClassName(`legendAction`)
    for (let i = 0; i < legendBtns.length; i++) {
      const action = legendBtns[i].getAttribute(`data-action`)
      // console.log(action + i);
      if (action) { legendBtns[i].addEventListener(`click`, eval(action)) }
    }
  }

  function createColorsListeners() {
    const colorsRows = document.getElementsByClassName(`color_pick`)
    for (let i = 0; i < colorsRows.length; i++) {
      const color_code = colorsRows[i].getAttribute(`data-color_code`)
      colorsRows[i].addEventListener(`click`, changeLayersBrewColor)
    }
  }

  function addFilterListeners(num) {
    document.getElementById(`oper_select${num}`).addEventListener(`change`, focusFilterInput)
    document.getElementById(`filter_value${num}`).addEventListener(`keyup`, changeFilterInput)
    document.getElementById(`close${num}`).addEventListener(`click`, removeFilter)
  }

  function preventDoubleClick() {
    const leafletItems = document.getElementsByClassName(`leaflet-control`)
    for (let i = 0; i < leafletItems.length; i++) {
      leafletItems[i].addEventListener(`dblclick`, emptyDoubleClick)
      leafletItems[i].addEventListener(`mousedown`, emptyDoubleClick)
      leafletItems[i].addEventListener(`mousewheel`, emptyDoubleClick)
    }
  }
  function emptyDoubleClick(e) {
    e.stopPropagation()
  }

  function changeColSelectOptions(cat_id) {
    let current_options = header_options
    // console.log(cat_id);
    if (cat_id >= 0) {
      current_options = header_options_by_cat[cat_id]
      // console.log("change cat to " + cat_id);
    }
    document.getElementById(`col_select`).innerHTML = `<option></option>${current_options}`
    document.getElementById(`cat_sel`).value = cat_id >= 0 ? cat_id : `All`
    // console.log(document.getElementById("cat_sel").value);
  }

  function doubleClickAsClick(e) {
    e.preventDefault()
    e.target.click()
  }

  function focusFilterInput(e) {
    const num = this.id.replace(`oper_select`, ``)
    document.getElementById(`filter_value${num}`).focus()
  }

  function createFilterDiv(num, chosen_option_name, chosen_option, min_val, max_val) {
    const e = document.createElement(`div`)
    e.className = `filter`
    e.id = `filter${num}`
    e.innerHTML = (`<span class='filter_header'><div id='close${num}' class='close filter_header'>X</div>` +
   `</span>` +
   ` <span class='column_prop'><div class='column_name'>${chosen_option_name}</div>` +
   `<div id='filter_res${num}' class='filter_header filter_res'></div></span>` +
    `<span class='range_span'>${ui_strings[`range`]
    } : <div id='max_val${num} 'class='filter_header' >${max_val} - </div>` +
     `<div id='min_val${num}' class='filter_header'>${min_val
     }</div></span>` +
   `<span class='filter_data'>${operatorSelector(num)
   }  <input id='filter_value${num}' class='filter_value' data-col_name='${
     chosen_option}'/></span>`)
    document.querySelector(`#filter_container`).appendChild(e)
    document.getElementById(`oper_select${num}`).focus()
  }

  function updateFilterArraysAndCombo(chosen_option_name, chosen_option, num, itemOption) {
    active_filter_array.push({"name": chosen_option_name, "prop_name": chosen_option})
    const filter_select = document.getElementById(`col_filter_select`)
    disabled_options_array[num] = itemOption
    filter_select.remove(filter_select.selectedIndex)
    document.querySelector(`#filter_container > span > input`).value = ``
  }

  function changeFilterInput(e) {
    destroyDataTable()
    const input_val = this.value
    const filter_num = this.id.replace(`filter_value`, ``)
    const alias_name = document.querySelector(`#filter${filter_num} .column_name`).innerHTML
    const col_name = this.attributes[`data-col_name`].value
    const oper_select = document.getElementById(`oper_select${filter_num}`)
    const operator_index = oper_select.selectedIndex
    const operator = oper_select.options[operator_index].attributes[`data-operator`].value
    // console.log(document.getElementById('oper_select').value);
    updateLayersByFilter(input_val, operator, col_name, filter_num)
  }

  function removeFilter(e) {
    destroyDataTable()
    const filter_num = this.id.replace(`close`, ``)
    const col_name = document.getElementById(`filter_value${filter_num}`).attributes[`data-col_name`].value
    updateLayersByFilter(``, ` `, col_name, filter_num)
    let filter_div = document.getElementById(`filter${filter_num}`)
    filter_div.parentNode.removeChild(filter_div)
    // Remove event listeners.
    filter_div = null
    // Remove from active filter array.
    const filter_index = arrayObjectIndexOf(active_filter_array, col_name, `prop_name`)
    active_filter_array.splice(filter_index, 1)
    // Add the filtered column to the select filter column list.
    const filter_select = document.getElementById(`col_filter_select`)
    filter_select.add(disabled_options_array[filter_num])
  }

  function updateLayersByFilter(input_val, operator, col_name, filter_num) {
    let z = 0
    geojsonLayer.eachLayer(layer => {
      // console.log("eval %s %s %s", layer.feature, parseFloat(layer.feature.properties[col_name]), input_val);
      // Set the default to no show in the filter array
      filter_array[layer.feature.properties[unique_id_col_name]][col_name] = 1
      if (input_val == `` || (parseFloat(layer.feature.properties[col_name]) &&
    eval(layer.feature.properties[col_name] + operator + input_val))) {
        // Mark the feature as filtered by the current col_name.
        filter_array[layer.feature.properties[unique_id_col_name]][col_name] = 0
      }
      // Check the feature's visibility based on all filters.
      let display = 0
      Object.keys(filter_array[layer.feature.properties[unique_id_col_name]]).forEach(function(key, index) {
        display = display + this[key]
      }, filter_array[layer.feature.properties[unique_id_col_name]])
      // console.log(display);
      if (display > 0) {
        layer.filtered = 1
        if (map.hasLayer(layer)) {
          map.removeLayer(layer)
        }
      } else {
        layer.filtered = 0

        // If the feature is not hidden from the legend and in the filtered results, add it to the map.
        if (layer.feature.style != 0) {
          if (!map.hasLayer(layer)) { map.addLayer(layer) }
        }
        z++
      }
    })
    updateFilterHeader(z, filter_num)
  }

  function updateFilterHeader(filtered_res, filter_ser) {
    const elems = document.querySelectorAll(`.filter_res`)
    for (let i = 0; i < elems.length; i++) {
      elems[i].innerHTML = `[${filtered_res}/${feature_group_length}]`
    }
  }

  function createInfoDiv(props) {
    const filter_array_temp = []
    // console.log(active_filter_array);
    let filter_info = ``
    for (let i = 0; i < active_filter_array.length; i++) {
      let displayed_value = parseFloat(props[active_filter_array[i].prop_name])
        ? formatNumberToDisplay(eliminateStringsInNumbers(props[active_filter_array[i].prop_name]))
        : props[active_filter_array[i].prop_name]
      displayed_value = !displayed_value && displayed_value != 0 ? `-` : displayed_value
      filter_info += `<span class='filter_info'><div class='col_header filter_header'>${
        active_filter_array[i].name}</div>` +
    `<div class='col_value filter_header'>: ${
      displayed_value
    }</div></span>`
    }
    // console.log(filter_info);
    return filter_info
  }

  // TODO: Fix geojsonLayer to mainLayer as a function variable. Create default bounds (mainLayer problem/no bounds)
  function zoomToLayer() {
    map.fitBounds(geojsonLayer.getBounds())
  }

  function updateYear(e) {
    const appartment_price_per_year_names = [`z3`, `z4`, `z5`, `z6`, `z7`, `z8`]
    const year_to_display_data = {2010: `z3`, 2011: `z4`, 2012: `z5`, 2013: `z6`, 2014: `z7`, 2015: `z8`}
    if (appartment_price_per_year_names.includes(current_comn_name)) {
      const year = $(`#year_slider_input`).val() * 1
      const new_display_data = year_to_display_data[year]
      changeDisplayData(undefined, new_display_data)
    }
  }

  function toggleCircles() {
    const show = this.classList.contains(`markers`) ? 1 : 0
    // console.log(markersLayer);
    if (show > 0) {
      map.removeLayer(markersLayer)
      this.classList.remove(`markers`)
    } else {
      markersLayer.addTo(map)
      this.classList.add(`markers`)
    }
  }

  function toggleDataProc(e) {
    const data_proc = document.getElementById(`data_proc`)
    const map_div = document.getElementById(`map`)
    // var e_target = event.target;
    if (data_proc.style.display != `none` && e != 1) {
      // alert(data_proc.style.display);
      data_proc.style.display = `none`
      if (!isMobile) {
        map_div.classList.add(`wide_map`)
        map.invalidateSize()
        document.getElementById(`info`).appendChild(
          document.getElementById(`info_footer`))
      } else {
        // map_div.style.display = '';
        // map_div.style.visibility = 'visible';
      }
    } else {
      data_proc.style.display = ``
      if (!isMobile) {
        map_div.classList.remove(`wide_map`)
        map.invalidateSize()
        var data_proc_control = document.getElementById(`data_proc_control`)
        if (!document.getElementById(`data_proc_control1`)) {
          var data_proc_control = document.getElementById(`data_proc_control`)
          // var data_proc_btn = document.createElement("div");
          var data_proc_btn = data_proc_control.cloneNode(true)
          data_proc_btn.id = `data_proc_control1`
          // data_proc_btn.innerHTML = "<b>&#9596;</b>";
          data_proc_btn.innerHTML = `<b>X</b>`
          data_proc.appendChild(data_proc_btn)
          data_proc.insertBefore(data_proc_btn, data_proc.childNodes[0])
          document.getElementById(`data_proc_control1`).addEventListener(`click`,
            () => {
              toggleDataProc()
            }
          )
        }
      } else {
        // map_div.style.display = 'none';
        // map_div.visibility = 'hidden';
        var data_proc_control = document.getElementById(`data_proc_control`)
        if (!document.getElementById(`data_proc_control1`)) {
          var data_proc_control = document.getElementById(`data_proc_control`)
          // var data_proc_btn = document.createElement("div");
          var data_proc_btn = data_proc_control.cloneNode(true)
          data_proc_btn.id = `data_proc_control1`
          // data_proc_btn.innerHTML = "<b>&#9596;</b>";
          data_proc_btn.innerHTML = `<b>X</b>`
          data_proc.appendChild(data_proc_btn)
          document.getElementById(`data_proc_control1`).addEventListener(`click`, toggleDataProc)
        }
      }
    }
  }

  function createShareLink(e) {
    const col_id = getDisplayCookie(curr_leaf)
    const normalize = getNormalizeCookie(curr_leaf) ? getNormalizeCookie(curr_leaf) : 0
    let index = ``
    if (curr_leaf.length == 0) { index = `index.php` }

    const share_url = `${window.location.origin + window.location.pathname + index}?col_id=${col_id}&normalize=${normalize}`
    console.log(share_url)
    copyValToClipboard(share_url)

    const link_btn = document.getElementById(`share`)
    link_btn.setAttribute(`data-balloon`, ui_strings[`link_copied`])
    link_btn.setAttribute(`data-balloon-pos`, balloon_hor_pos_control)
    var share_timer = setTimeout(() => {
      link_btn.setAttribute(`data-balloon`, ui_strings[`get_link`])
      clearTimeout(share_timer)
    }, 1500)
  }

  function copyValToClipboard(val) {
    const dummy = document.createElement(`input`)
    document.body.appendChild(dummy)
    dummy.setAttribute(`id`, `dummy_id`)
    document.getElementById(`dummy_id`).value = val
    dummy.select()
    document.execCommand(`copy`)
    document.body.removeChild(dummy)
  }

  function getCurrentHeaderAlias() {
    const result = header_name_to_alias.filter(obj => obj.name === current_comn_name)
    return display_name = (typeof (result[0]) !== `undefined`) ? result[0].alias : current_comn_name
  }

  function getCurrentHeaderArray(c_col = current_comn_name) {
    const result = header_name_to_alias.filter(obj => obj.name === c_col)
    return result[0]
  }

  function getCurrentExtremeArray(layer, col_name) {
    const result = layer.extremeValues.filter(obj => obj.header === col_name)
    return result[0]
    // return display_name = (typeof(result[0]) != "undefined") ? result[0].alias : current_comn_name;
  }

  function shortColumnTitle(title) {
    return title.substring(0, 150)
  }

  function changeBrewColor(ev) {
    // console.log(ev.target);
    const colors_container = document.getElementById(`colors_container`)
    const colors_div = document.getElementById(`colors`)

    if (colors_div.style.display == `` && ev.target.parentElement.id != `color_num`) {
      colors_div.style.display = `none`
      colors_container.setAttribute(`data-balloon-pos`, balloon_hor_pos_edit)
    }
    // If the button is clicked and the colors are hidden.
    else {
      // Add event listeners.
      createColorsListeners()
      document.getElementById(`classy_sel`).addEventListener(`change`, changeBrewNum)
      document.getElementById(`brew_method_sel`).addEventListener(`change`, changeBrewMethod)
      colors_div.style.display = ``
      colors_container.setAttribute(`data-balloon-pos`, `none`)
    }
  }

  function buildBrewNumSelect() {
    let brew_num_sel = `<option disabled selected value="initial" selected="selected">${ui_strings[`choose_classify_num`]}</option>`
    for (let i = min_brew_select; i <= max_brew_select; i++) {
      brew_num_sel += `<option value="${i}">${i}</option>`
    }
    return brew_num_sel
  }

  function buildBrewMethodSelect() {
    const options = `<option disabled selected>${ui_strings[`classybrew_methods`]}</option>` +
   `<option value="jenks">${ui_strings[`jenks_name`]}</option>` +
   `<option value="equal_interval">${ui_strings[`equal_interval`]}</option>` +
   `<option value="quantile">${ui_strings[`quantile`]}</option>`
    return options
  }

  function buildColorsSelectTable() {
    const cb = new classyBrew()
    const colors = cb.getColorCodes()
    cb.setSeries(brew_data_array)
    cb.setNumClasses(brew_max_num)
    cb.classify(classy_method)
    breaks = cb.getBreaks()
    // TODO: Extract createColorsTable function.
    let brew_color_div = `<table id="brew_colors">`
    for (let c = 0; c < colors.length; c++) {
      cb.setColorCode(colors[c])
      // if (cb.getColorInRange(breaks[brew_max_num])) {
      try {
        if (cb.getColorInRange(breaks[brew_max_num])) {
          brew_color_div += `<tr class='color_pick' data-color_code='${colors[c]}'>`
          for (let i = 1; i < breaks.length; i++) {
            brew_color_div += `<td style='background-color:${cb.getColorInRange(breaks[i])}'></td>`
          }
          brew_color_div += `</tr>`
        }
      } catch (e) {
      }
      // }
    }

    brew_color_div += `</table>`
    return brew_color_div
  }

  function showSelectedData(dt = null) {
    // var parent = document.getElementById('showTable');
    const parent = document.getElementById(`info_footer`)
    if (!document.getElementById(`dataTable`)) {
      e = document.createElement(`div`)
      e.id = `dataTable`
      e.innerHTML = dt || createDataTable()
      if (e.innerHTML.length > 0) {
        parent.appendChild(e)
        const empty_table = document.getElementById(`emptySelection`)
        if (empty_table) { empty_table.addEventListener(`click`, emptySelection) }
        // document.getElementById("table_container1").style.width = document.getElementById("data_proc").clientWidth*0.95;
        // console.log(table_body.clientHeight);
        $(`#selected_features_table1`).tablesorter({
          theme: `blue`,
          // widthFixed: true, // <- now automatically set by the scroller widget
          showProcessing: true,
          textExtraction(node) {
            return parseInt(eliminateStringsInNumbers($(node).text()))
          },
          // sortList: [[0,0]],
          widgets: [`zebra`, `scroller`],
          widgetOptions: {
            scroller_fixedColumns: 2,
            scroller_height: 300,
            // scroll tbody to top after sorting
            scroller_upAfterSort: true,
            // pop table header into view while scrolling up the page
            scroller_jumpToHeader: true
          }
        })
        document.getElementById(`selected_features_table1`).addEventListener(`click`, dataTableClick)
        document.querySelectorAll(`table.data-table1.ts-scroller-rtl.tablesorter.tablesorter-blue`)[1].addEventListener(`click`, dataTableClick)
      }
    } else {
      const table_div = document.getElementById(`dataTable`)
      // Remove dataTable from DOM.
      table_div.parentNode.removeChild(table_div)
      // document.getElementById("selected_table_header").style.display =  'none';
      // document.getElementById("showTable").style.bottom =  40 + 'px';
    }
    displayTableBubble()
  }

  // function createCleanDataTable() {
  function createDataTable() {
    const is_normalized = document.getElementsByClassName(`normalizedLeg`).length
    let table = ``
    let z = 1
    geojsonLayer.eachLayer(layer => {
      if (layer.feature.selected == 1 && layer.feature.style == 1 && layer.filtered == 0) {
        table += table.length > 0 ? `` : `<tbody >`
        // Create the table row and the name column.
        const props = layer.feature.properties
        const select_type = layer.feature.manual_selected > 0 ? `manual-select` : ``
        // Add the basic data to the table - name and index.
        table += `<tr class='${select_type}' data-id='${
          layer._leaflet_id}'` +
     ` title='${props[name_prop]}'` + `>`
        table += `<td class='index-col'>${z}</td>`
        table += `<td>${props[name_prop]}</td>`

        // Add display column value.
        var displayed_value = parseFloat(eliminateStringsInNumbers(props[current_comn_name]))
          ? formatNumberToDisplay(eliminateStringsInNumbers(props[current_comn_name]))
          : props[current_comn_name]

        displayed_value = !displayed_value && displayed_value != 0 ? `-` : displayed_value
        table += `<td>${displayed_value}</td>`
        // Add the normalized value when displayed.
        if (is_normalized > 0) {
          displayed_value = formatNumberToDisplay(eliminateStringsInNumbers(props[current_comn_name]) / props[normalize_col], 2)
            ? formatNumberToDisplay(eliminateStringsInNumbers(props[current_comn_name]) / props[normalize_col], 2) : `-`
          table += `<td>${displayed_value}</td>`
        }

        // Add the filter columns values.
        for (let i = 0; i < active_filter_array.length; i++) {
          var displayed_value = parseFloat(props[active_filter_array[i].prop_name])
            ? formatNumberToDisplay(props[active_filter_array[i].prop_name])
            : props[active_filter_array[i].prop_name]
          // displayed_value = displayed_value ? displayed_value : '-';
          displayed_value = !displayed_value && displayed_value != 0 ? `-` : displayed_value
          table += `<td>${displayed_value}</td>`
        }
        table += `</tr>`
        z++
      }
    })
    if (table.length > 0) {
      // Create the table headers
      let table_hdr = `<div id='emptySelection' title='${ui_objects_titles[`emptySelection`]}' class='emptySelection refocus'>&#9746</div>` +
    `<div id='selected_table_header' class=''>${z - 1} ${ui_strings[`selected_features_table_header`]}</div>` +
    `<div id='table_container1'><table id='selected_features_table1' class='data-table1 ts-scroller-rtl' style='direction: rtl;' >`
      // Add the basic headers and the header of the displayed column.
      table_hdr += `${`<thead><th class='index-col'><div class='loading-th'></div></th>` +
    `<th class='' data-num=0><div> `}${ui_strings[`muni_name`]} </div></th>` +
    `<th class='' data-num=1><div title='${getCurrentHeaderAlias()}' >${getCurrentHeaderAlias()}</div></th>`
      // Add the normalizd data (if displayed).
      if (is_normalized > 0) {
        table_hdr += `<th class='' data-num=2><div title='${getCurrentHeaderAlias()}' >${getCurrentHeaderAlias()} ${ui_strings[`normalize_title`]}</div></th>`
      }
      // Add the filtered columns headers.
      for (let i = 0; i < active_filter_array.length; i++) {
        table_hdr += `<th class='' data-num=${i + 2}><div title='${active_filter_array[i].name}'>${active_filter_array[i].name}</div></th>`
      }
      table += `</tbody></table>`
      return `${table_hdr}</thead>${table}</div>`
    } else { return null }
  }

  function dataTableClick(e, par = 1) {
    const data_id = (par == 1) ? e.target.parentElement.getAttribute(`data-id`) : e.target.parentElement.parentElement.getAttribute(`data-id`)
    console.log(data_id)
    if (geojsonLayer.getLayer(data_id)) {
      map.flyToBounds(
        geojsonLayer.getLayer(data_id).getBounds(),
        {duration: 0.6})
      // document.getElementById("muni_sel").value = data_id;
      muni_selectize.addItem(data_id)
      openMuniProfile(data_id)
      highlightProfileMuni(geojsonLayer.getLayer(data_id))
      // changeMuniSelect(geojsonLayer.getLayer(data_id));
    }
  }

  function destroyDataTable() {
    if (document.getElementById(`dataTable`)) { showSelectedData() }
    document.getElementById(`colors`).style.display = `none`
  }

  function changeCategory(new_cat = null) {
    // console.log(this.value);
    const chosen_category = (new_cat > 0) ? new_cat : this.value
    changeColSelectOptions(chosen_category)

    const option_to_choose = document.getElementById(`col_select`).getElementsByTagName(`option`)[1]
    // console.log(option_to_choose);
    // Select the first option in the newly populated select box widget.
    // TODO: Problem in category match
    $(`#col_select`).combobox(`select`, option_to_choose)
  }

  function categoryClick(e) {
    if (document.getElementById(`ui-id-1`).style.display != `none`) {
      document.getElementById(`info_header`).style.display = ``
      document.getElementById(`columns_container`).style.display = `none`
      document.getElementById(`ui-id-1`).style.display = `none`
    }
  }

  function registerVisit() {
    // console.log("ajax");
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log(`Visit registered`)
		   }
    }
    xhttp.open(`GET`, `register_visit.php`, true)
    xhttp.send()
  }

  function disableMapPanAndZoom(div_id) {
    // TODO: y like this?
    const div = L.DomUtil.get(div_id)
    L.DomEvent.disableClickPropagation(div)
    L.DomEvent.on(div, `mousewheel`, L.DomEvent.stopPropagation)
    L.DomEvent.on(div, `drag`, L.DomEvent.stopPropagation)
  }

  function removeClassFromAll(className) {
    const elements = document.getElementsByClassName(className)
    while (elements.length > 0) {
      elements[0].classList.remove(className)
    }
  }

  function emptySelection() {
    geojsonLayer.eachLayer(layer => {
      layer.feature.selected = 0
      layer.feature.manual_selected = 0
      selection_ind = 0
      manual_selection_ind = 0
    })

    normalize = document.getElementsByClassName(`normalizedLeg`).length > 0 ? normalize_col : undefined
    changeColorByAttr(geojsonLayer, current_comn_name, undefined, normalize)
    destroyDataTable()
    // toggleShowTableContainer();
    removeClassFromAll(`selectedLegend`)
    muni_selectize.setValue(``)
    if (!document.getElementById(`data_proc`).style.display) { toggleDataProc() }
  }

  function getNormalStyle(str, selected) {
    if (selected > 0) {
      return	{
        selected_style,
        fillColor: getColor(str)
      }
    } else {
      // console.log(getColor(str) + " " + getColor(str).length);
      // var line_color = getColor(str) != no_data_color  ? 'grey' : 'lightgrey';
      return {
        type: `Feature`,
        weight: 0.7,
        opacity: 1,
        color: `grey`,
        dashArray: `1`,
        fillOpacity: 0.7,
        // default_style,
        fillColor: getColor(str)
      }
    }
  }

  function getGeoLayer() {
    return geojsonLayer
  }

  function getMap() {
    return map
  }

  // Expose internal functions for external listeners.
  return {
    changeColumn,
    createFilter,
    getGeoLayer,
    dataTableClick,
    getMap,
    changeCategory,
    copyValToClipboard,
    changeBrewNum
  }
}

// Auto complete widget function and initiation.
$(() => {
  $.widget(`custom.combobox`, {
    _create() {
      this.wrapper = $(`<span>`)
        .addClass(`custom-combobox`)
        .attr(`id`, `${this.element.attr(`id`)}_custom-combobox`)
        .insertAfter(this.element)

      this.element.hide()
      this._createAutocomplete()
    },

    _createAutocomplete() {
      let selected = this.element.children(`:selected`),
        // value = selected.val() ? selected.text() : "";
        value = ``,
		  input = this.input

      this.input = $(`<input>`)
        .appendTo(this.wrapper)
        .val(``)
        .attr(`title`, ui_objects_titles[`col_sel_input_title`])
        .addClass(`custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left`)
        .autocomplete({
          delay: 0,
          minLength: 0,
          source: $.proxy(this, `_source`),
          select(event, ui) {
            ui.item.value = `` // it will clear field
            return false
          },
          keydown(event, ui) {
            console.log(`click`)
          }
          /* close: function (event, ui) {
				console.log(ui);
				this.value = '';
				//.input.value = "";  // it will clear field
               // return false;
            } */
        })
        /* .tooltip({
            classes: {
              "ui-tooltip": "ui-state-highlight"
            }
          }) */
		  .on(`click`, function() {
          this.value = ``
          // console.log('click');
          $(this).autocomplete(`search`, ``)
		  })

      this._on(this.input, {
        autocompleteselect: `_autocompleteselect`

        // autocompletechange: "_removeIfInvalid"
      })
    },

	  _autocompleteselect(event, ui, external_val) {
      if (this.element.attr(`id`) === `col_select`) {
        lgb.changeColumn(event, ui, external_val)
		    } else if (this.element.attr(`id`) === `col_filter_select`) {
        lgb.createFilter(event, ui)
      } else if (this.element.attr(`id`) === `data_col_select0`) {
        /* this._trigger( "select", event, {
				  item: ui.item.option
				}); */
        changeDataCol(event, ui)

        // console.log(this.input);
        // this.input.value = '';
      }

      // this.input.val("");
      if (ui && event) {
        ui.item.option.selected = true
        event.stopPropagation()
      } else {
        external_val.selected = true
      }
      // event.preventDefault();
    },

    _source(request, response) {
      /* var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        response( this.element.children( "option" ).map(function() {
		  //console.log(this)	;
          var text = $( this ).text();
		  var cat_id = $(this).attr('data-cat_id');
		  // Check if the input text is like a select value or matches a value's category header.
          if ( this.value && ( !request.term || matcher.test(text) || matcher.test(cat_headers[cat_id]))) {
			  // console.log("matched %s %s %s $s", request.term, this, text, cat_id);
            return {
              label: text,
              value: text,
              option: this
            };
		  }
        }) ); */
      // console.log("in source");
      const matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), `i`)
      const select_el = this.element.get(0) // get dom element

      const rep = new Array() // response array
      // simple loop for the options
      for (let i = 0; i < select_el.length; i++) {
        const cat_id = select_el.options[i].getAttribute(`data-cat_id`)
        // console.log(cat_id);
        const text = select_el.options[i].text
        if (select_el.options[i].value && (!request.term || matcher.test(text) || matcher.test(categories_table_array[cat_id])))
        // add element to result array
        {
          rep.push({
            label: text, // no more bold
            value: text,
            option: select_el.options[i]
          })
        }
      }
      // send response
      response(rep)
    },

    _destroy() {
      this.wrapper.remove()
      console.log(`destroy`)
      this.element.show()
    },
	  select(val) {
		 // console.log(val);
		  this._autocompleteselect(undefined, undefined, val)
	  }
  })
  // Initiate the display column selector combobox.
  $(`#col_select`).combobox()
  // Initiate the filter selector combobox.
  $(`#col_filter_select`).combobox()
  $(`#data_col_select0`).combobox(
    /* {_autocompleteselect: function(el) {
			console.log(el);
			el.target.value = '';
		}} */
  )
  $(`#data_col_select0_custom-combobox`).addClass(`data_col_select`)
  document.querySelector(`#data_col_select0_custom-combobox > input`).setAttribute(`placeholder`, ui_strings[`choose_data_proc_col`])
  // document.querySelector("#data_col_select0_custom-combobox input").addEventListener("change", chnageDataCol);
})

/*******************************************************************************************
 Interface strings.
********************************************************************************************/
var ui_objects_titles =
 {
   'emptySelection': `איפוס בחירה`,
   // 'colors_container' : 'שינוי צבע',
   'colors_container': `הגדרות`,
   'showTable': `רשויות נבחרות`,
   'refocus': `לחץ להתמקדות`,
   'normalize': `נרמול לפי אוכלוסיה`,
   'unnormalize': `חזרה לנתונים טבעיים`,
   // 'col_sel_input_title' : "לחץ לצפיה בסוגי הנתונים",
   'col_sel_input_title': `בחר נתון`,
   'next_data': `הנתון הבא`,
   'prev_data': `הנתון הקודם`,
   'category_select': `בחירת קטגוריה`,
   'column_select': `בחירת טור להצגה`
 }
var ui_strings =
 {
   "select_muni": `הצג פרופיל ישוב`,
   "classybrew_methods": `שיטת סיווג נתונים`,
   "quantile": `אחוזים`,
   "equal_interval": `מרווחים שווים`,
   "jenks_name": `חלוקה טבעית`,
   "choose_classify_num": `מספר קבוצות מקרא`,
   "data_proc_control": `עיבוד נתונים`,
   "data_proc_header": `<center class="data_proc_header">עיבוד נתונים</center>`,
   "choose_data_proc_col": `בחר נתון`,
   "system_name": `שם משתנה`,
   "table_col_name": `שם נתון`,
   "computed_cat": `נתונים מחושבים`,
   "computed_alias": `נתון מחושב`,
   "compute_and_display": `חשב והצג`,
   "create_computed_data": `יצירת נתון מחושב`,
   "legend_toggle": `הצג/הראה`,
   "legend_hint": `לחץ להצגה בטבלה`,
   "paging_bubble": `דפדוף בין הנתונים`,
   "link_copied": `הקישור הועתק בהצלחה`,
   "get_link": `לחץ להעתקת קישור למפה`,
   "about": `אודות`,
   "external_cat": `נתונים נוספים`,
   "normalize_title": `לאלף איש`,
   "population": `אוכלוסיה`,
   "thousand_pop": `אלף איש`,
   "displayed_pop_str": `אוכלוסיית היישוב היא`,
   "from_displayed_pop": `מהאוכלוסיה המוצגת`,
   "pop_col_display": `אלף איש מעודכן לסוף 2015`,
   "total_population_str": `סך האוכלוסיה ברשויות המוצגות`,
   "create_filters": `מסננים`,
   "range": `טווח`,
   "muni_name": `שם הרשות`,
   // "empty_info_sub_title" : 'התמקד בעיר להצגת נתונים, ניתן לבחור עיר ע"י קליק כפול',
   // "empty_info_sub_title" : 'התמקד בעיר להצגת נתונים<br> ניתן לבחור ערים להשוואה בקליק כפול <br> או לבחור קבוצת נתונים מהמקרא',
   "empty_info_sub_title": `ניתן לבחור ערים להשוואה בקליק כפול <br> או לבחור קבוצת נתונים מהמקרא`,
   "empty_info_sub_title_mobile": `ניתן לבחור ערים להשוואה בלחיצה<br> או לבחור קבוצת נתונים מהמקרא`,
   "choose_display_col": ` בחר נתון להצגה`,
   "choose_filter_col": `סנן נתונים לפי`,
   "greater": `גדול מ-`,
   "smaller": `קטן מ-`,
   "greater_e": `גדול שווה ל-`,
   "smaller_e": `קטן שווה ל-`,
   "equals": `שווה ל-`,
   "cbs_attribution": `קובץ הרשויות המקומיות 2015, נתוני בחירות 2015 ונתונים ממפקד 2008`,
   "selected_features_table_header": `רשויות מסומנות`,
   "selected_data_bubble": `קיימות רשויות מסומנות`,
   "user_normalize_action": `ניתן להציג נתון זה ביחס לגודל האוכלוסייה`,
   "increase_opacity": `שקיפות שכבת רקע`,
   "decrease_opacity": `שקיפות שכבת רקע`,
   "external_info": `<b>נתוני בריאות הציבור</b><br> הנתונים נאספו ע"י גיא זומר<br>`,
   "external_info_array": {"בריאות": `<b>נתוני בריאות הציבור</b><br> הנתונים נאספו ע"י גיא זומר<br>`,
     'בינוי': `<b>נתוני משרד הבינוי</b><br> הנתונים נאספו ע"י גיא זומר<br>`,
     'פשיעה': `<b>המפה מבוססת על כמות אירועים שנפתחו במשטרת ישראל בשנים 2012-2015, על בסיס בקשת מידע שנענתה, ביחס לכמות התושבים ברשות המקומית בהתאם לנתוני הלמ"ס </b><br> הנתונים נאספו ע"י גיא זומר<br>`},
   "ages_chart": `התפלגות גילאים`,
   "religions_chart": `התפלגות דת`
 }
const ui_strings_w_yarok =
 {
   "external_info": `<b>המפה מבוססת על כמות אירועים שנפתחו במשטרת ישראל בשנים 2012-2015, על בסיס בקשת מידע שנענתה, ביחס לכמות התושבים ברשות המקומית בהתאם לנתוני הלמ"ס </b><br> הנתונים נאספו ע"י גיא זומר<br>`
 }
const ui_objects_titles_w_yarok = {}
const ui_objects_titles_ta =
 {
   'showTable': `אזורים נבחרים`
 }
const ui_strings_ta =
 {
   "displayed_pop_str": `אוכלוסיית האזור הסטטיסטי היא`,
   "pop_col_display": ``,
   "total_population_str": `סך האוכלוסיה באזורים המוצגים `,
   "muni_name": `מספר האזור`,
   "cbs_attribution": `נתונים ממפקד 2008`,
   "selected_features_table_header": `אזורים מסומנים`,
   "selected_data_bubble": `קיימים אזורים מסומנים`
 }

const ui_objects_titles_us =
 {
   'emptySelection': `Clear selection`,
   'colors_container': `Change color`,
   'showTable': `Selected states`,
   // 'refocus' : 'לחץ להתמקדות',
   'refocus': `Default zoom`,
   'normalize': `Normalize by population`,
   'unnormalize': `Original data`,
   // 'col_sel_input_title' : "לחץ לצפיה בסוגי הנתונים",
   'col_sel_input_title': `Variable to display`,
   'next_data': `Next variable`,
   'prev_data': `Prev variable`,
   'category_select': `Category picker`,
   'column_select': `Variable to display`
 }
const ui_strings_us =
 {
   "legend_toggle": `Show/Hide`,
   "legend_hint": `Click for table display`,
   "paging_bubble": `Next/Previous variable`,
   "link_copied": `Link copied`,
   "get_link": `Click to get a direct link`,
   "about": `about`,
   // "external_cat"	: "נתונים נוספים",
   "normalize_title": `Per thousand`,
   "population": `Population`,
   "thousand_pop": `Thousand people`,
   "displayed_pop_str": `The stats's population is: `,
   "from_displayed_pop": `From the displayed population`,
   "pop_col_display": `Thousand people`,
   "total_population_str": `Total populaion in the displayed states`,
   "create_filters": `Filters`,
   "range": `range`,
   "muni_name": `State name`,
   // "empty_info_sub_title" : 'התמקד בעיר להצגת נתונים, ניתן לבחור עיר ע"י קליק כפול',
   "empty_info_sub_title": `Hover on a state for details<br> Select a state with double click <br> Or select a legend group from the legend `,
   "empty_info_sub_title_mobile": `Select a state with a mouse click<br> Or use the legend to select groups`,
   "choose_display_col": `Choose data to display`,
   "choose_filter_col": `Create a filter`,
   "greater": `Greater than`,
   "smaller": `Smaller than`,
   "greater_e": `Greater or Equal to`,
   "smaller_e": `Smaller or equal to`,
   "equals": `Equal to`,
   "cbs_attribution": `US 2010 Census data`,
   "selected_features_table_header": `Selected states`,
   "selected_data_bubble": `There is an active selection`,
   "user_normalize_action": `This variable can be normalized by population`,
   "increase_opacity": `Base layer opacity`,
   "decrease_opacity": `Base layer opacity`,
   "external_info": ``
 }
