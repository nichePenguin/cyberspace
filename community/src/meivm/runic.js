const runicDictionary = [
  "ᚺ", // 0x0
  "ᚾ", // 0x1
  "ᛁ", // 0x2
  "ᛃ", // 0x3
  "ᛈ", // 0x4
  "ᛇ", // 0x5
  "ᛉ", // 0x6
  "ᛊ", // 0x7
  "ᛏ", // 0x8
  "ᛒ", // 0x9
  "ᛖ", // 0xA
  "ᛗ", // 0xB
  "ᛚ", // 0xC
  "ᛜ", // 0xD
  "ᛞ", // 0xE
  "ᛟ", // 0xF
];

const opRunes = [
  "ᚢ", // forward skip
  "ᚨ", // word skip
  "×", // right align
  "ᚲ", // left align
  "ᚠ", // zero write
  "ᚱ", // repeat write
]

// no padding needed actually
function toHexString(number, pad) {
  return number.toString(16).padStart(pad, '0');
}

function toRunic(string) {
  const res = []
  console.log(string)
  for (const character of string) {
    if (runicDictionary.includes(character) || opRunes.includes(character)) {
      res.push(character);
    } else {
      res.push(runicDictionary[parseInt(character, 16)])
    }
  }
  return res.join('')
}

function toRunicString(number, pad) {
  return toRunic(toHexString(number, pad));
}

function getArgument(number, runic) {
  let argument = toHexString(number, 0);
  if (runic) {
    argument = toRunic(argument);
  }
  return argument;
}

function hasOpRunes(input) {
  for(let i = 0; i < opRunes.length; i++) {
    if (input.includes(opRunes[i])) {
      return true;
    }
  }
  return false;
}

function derune(input) {
  for ([index, rune] in runicDictionary.entries()) {
    input = input.replace(new RegExp(rune, 'g'), index.toString(16));
  }
  return input;
}


// left-right align
// -> repeat check
//    -> if two repeats omit argument
//    -> skip zerowrite but push rune, resetting repeat count
//      -> if word after that is still the same, continue repeat rune
//      -> if there's only one repeat after a zero skip (word repeater still initialized but count is reset, count tells where to start omitting words (?))
//    -> if word after is the same continue with repeat rune
//    -> if word changes check whether repeat was >= 2

// TODO remove padding
// if
//

function compressRepeats(input, runic) {
  let repeat = null;
  let firstRepeatIndex = -1;

  function enrune(count) {
    if (count <= 1) return;
    input[firstRepeatIndex + 1] =  writeLastWritten(count - 1, runic);
    if (count > 2) {
      input.splice(firstRepeatIndex + 2, count - 2);
    }
  }

  for (let i = 0; i < input.length; i++) {
    const word = input[i];
    const count = i - firstRepeatIndex;
    console.log(`${repeat} first found at ${firstRepeatIndex}, now we're at ${word} on ${i}`);
    if (repeat != word) {
      if (!word.includes('ᚠ')) {
        repeat = word;
      }
      enrune(count);
      if (count > 1 )
        i -= count - 2;
      firstRepeatIndex = i;
    }
  }

  console.log(input.length, firstRepeatIndex)
  if (input.length - firstRepeatIndex - 1 > 0) {
    enrune(input.length - firstRepeatIndex);
  }
}

function compressWords(input, runic) {
  let firstZeroIndex = -1;
  function enrune(count) {
    input[firstZeroIndex] =  writeZeroWord(count, runic);
    if (count > 1) {
      input.splice(firstZeroIndex + 1, count - 1);
    }
  }
  for (let i = 0; i < input.length; i++){
    const word = input[i];
    if (word == "0000") {
      if (firstZeroIndex == -1) {
        firstZeroIndex = i;
      }
      continue;
    }
    if (firstZeroIndex != -1) {
      const count = i - firstZeroIndex;
      enrune(count);
      i -= count - 1;
      firstZeroIndex = -1;
    }
    if (word.endsWith('000')) input[i] = rightAlign(word[0], runic)
    else if (word.endsWith('00')) input[i] = rightAlign(word.slice(0, 2), runic)
    else if (word.startsWith('000')) input[i] = leftAlign(word[3], runic)
    else if (word.startsWith('00')) input[i] = leftAlign(word.slice(0, 2), runic)
    
  }
  if (firstZeroIndex != -1) {
    enrune(input.length - firstZeroIndex);
  }
}

function runify(words) {
  for (let i = 0; i < words.length; i++){
    words[i] = toRunic(words[i]);  
  }
}

function compress(input, runic) {
  if (hasOpRunes(input)) {
    return "Compression with additional commands in input not supported";
  }
  if (input.includes('code') || input.includes('write') || input.includes('!')) {
    return "Compression with keywords not yet supported, paste raw data";
  }
  let words = []
  input= input.replace(/\s/g, '');
  for (let i = 0; i < input.length; i+= 4) {
    words.push(derune(input.substring(i, i+4)));
  }
  compressWords(words, runic);
  compressRepeats(words, runic);
  if (runic) runify(words);
  return words.join(''); // remove space?
}

function rightAlign(value, runic) {
  if (runic) value = toRunic(value);
  return `${value}×`;
}

function leftAlign(value, runic) {
  if (runic) value = toRunic(value);
  return `${value}ᚲ`;
}

function writeZeroWord(count, runic) {
  if (count == 1) return "ᚠ";
  return `${getArgument(count, runic)}ᚠ`;
}

function writeLastWritten(count, runic) {
  if (count == 1) return "ᚱ";
  return `${getArgument(count, runic)}ᚱ`;
}

function addressSkip(number, runic) {
  return `${getArgument(number, runic)}ᚢ`;
}

function wordSkip() {
  return 'ᚨ';
}

export { compress }
