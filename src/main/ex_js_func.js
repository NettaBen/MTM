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

function sortTable(table, col, reverse) {
  let tb = table.tBodies[0], // use `<tbody>` to ignore `<thead>` and `<tfoot>` rows
    tr = Array.prototype.slice.call(tb.rows, 0), // put rows into array
    i
  reverse = -((+reverse) || -1)
  tr = tr.sort((a, b) => { // sort rows
    const new_a = eliminateStringsInNumbers(a.cells[col].textContent.trim())
    const new_b = eliminateStringsInNumbers(b.cells[col].textContent.trim())
    return reverse *
   (a.cells[col].textContent.trim().replace(/[,]/g, ``) // using `.textContent.trim()` for test
     .localeCompare(b.cells[col].textContent.trim().replace(/[,]/g, ``), undefined, { "numeric": true })
			   )
  })
  for (i = 0; i < tr.length; ++i) tb.appendChild(tr[i]) // append each row in order
}

function makeSortable(table, str_index = 0, first_col_sort = 0) {
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
          sortTable(table, i, (dir = 1 - dir))
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
}
