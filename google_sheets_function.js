// uses API and python module from https://github.com/lucwastiaux/python-pinyin-jyutping-sentence


function flatten_array(entry) {
  return entry[0];
}

function wrap_array(entry) {
  return [entry];
}

function call_api(input_array, format, tone_numbers, spaces) {
  var url = 'http://api.prod.mandarincantonese.com/batch';  
  
  var data = {
    'conversion': format,
    'tone_numbers': tone_numbers,
    'spaces': spaces,
    'entries': input_array
  };
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data)
  };
  
  var response = UrlFetchApp.fetch(url, options);  
  var result_data = JSON.parse(response);
  
  var result_entries = result_data['result'];  
  return result_entries;
}

function chinese_convert_batch(input, format, tone_numbers, spaces) {
  var input_array = input.map(flatten_array);
  
  // skip rows at the bottom which don't have a value
  var lastNonEmpty = 0;
  for(var i = 0; i < input_array.length; i++)
  {
    var entry = input_array[i];
    if (entry.length > 0) {
      lastNonEmpty = i;
    }
  }
  
  var input_array = input_array.slice(0, lastNonEmpty+1);
  
  var apiStep = 'mandarincantonese_api_convert_batch';
  console.time(apiStep);
  var result_entries = call_api(input_array, format, tone_numbers, spaces);
  console.timeEnd(apiStep);  
  
  return result_entries.map(wrap_array);
}

function chinese_convert_single(input, format, tone_numbers, spaces) {
  var input_array = [input];
  
  var apiStep = 'mandarincantonese_api_convert_single';
  console.time(apiStep);
  var result_entries = call_api(input_array, format, tone_numbers, spaces);
  console.timeEnd(apiStep);  
  

  return result_entries[0];
}


function convert(input, format, tone_numbers, spaces) {
  tone_numbers = tone_numbers || false;
  spaces = spaces || false;
  if( input.map ) {
    return chinese_convert_batch(input, format, tone_numbers, spaces);
  } else {
    return chinese_convert_single(input, format, tone_numbers, spaces);
  }  
}

/**
 * Convert Traditional Chinese text to Jyutping
 *
 * @param {string} input - the value or cell containing Traditional Chinese text. Single cell (A1) or range (A:A) accepted.
 * @param {boolean} tone_numbers - specify TRUE to use tone numbers instead of diacritics (FALSE otherwise).
 * @param {boolean} spaces - specify TRUE to use a space between each syllable (FALSE otherwise).
 * @return Jyutping text
 * @customfunction
 */
function jyutping(input, tone_numbers, spaces) {
  return convert(input, "jyutping", tone_numbers, spaces);
}

/**
 * Convert Simplified Chinese text to Pinyin
 *
 * @param {string} input - the value or cell containing Simplified Chinese text. Single cell (A1) or range (A:A) accepted.
 * @param {boolean} tone_numbers - specify TRUE to use tone numbers instead of diacritics (FALSE otherwise).
 * @param {boolean} spaces - specify TRUE to use a space between each syllable (FALSE otherwise).
 * @return Pinyin text
 * @customfunction
 */
function pinyin(input, tone_numbers, spaces) {
  return convert(input, "pinyin", tone_numbers, spaces);
}