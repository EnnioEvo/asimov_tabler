//Vendor

import "./src/autosize"
import "./src/input-mask"
import "./src/dropdown"
import "./src/tooltip"
import "./src/popover"
import "./src/switch-icon"
import "./src/tab"
import "./src/toast"
import * as bootstrap from "bootstrap"
import * as tabler from "./src/tabler"
import DiffMatchPatch from 'diff-match-patch';
const dmp = new DiffMatchPatch();

globalThis.bootstrap = bootstrap
globalThis.tabler = tabler
globalThis.dmp = dmp

// dmp.prototype.diff_wordsToChars_ = function(text1, text2){
function diff_wordsToChars_(text1, text2) {
    var wordArray = []; // e.g. wordArray[4] == 'Hello'
    var wordHash = {}; // e.g. wordHash['Hello'] == 4
    wordArray[0] = '';

    function diff_wordsToCharsMunge_(text) {
        var chars = [];
        var words = text.match(/\S+|\s+/g);
        var wordArrayLength = wordArray.length;

        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            if (word in wordHash) {
                chars.push(wordHash[word]);
            } else {
                if (wordArrayLength === 65535) {
                    // Bail out at 65535 because
                    // String.fromCharCode(65536) == String.fromCharCode(0)
                    return chars;
                }
                wordHash[word] = wordArrayLength;
                wordArray[wordArrayLength] = word;
                chars.push(wordArrayLength);
                wordArrayLength++;
            }
        }

        return String.fromCharCode.apply(null, chars);
    }

    // Allocate 2/3rds of the space for text1, the rest for text2.
    var maxWords = 40000;
    var chars1 = diff_wordsToCharsMunge_(text1);
    maxWords = 65535;
    var chars2 = diff_wordsToCharsMunge_(text2);

    return {chars1: chars1, chars2: chars2, wordArray: wordArray};
}

globalThis.diff_wordsToChars_ = diff_wordsToChars_;

function difflibAddRmWords(text1, text2) {
    // Mark punctuation with special character
    text1 = text1.replace(/([^\w\s]+)/g, '\f@$1@\f');
    text2 = text2.replace(/([^\w\s]+)/g, '\f@$1@\f');

    // Compute the differences
    // let dmp = globalThis.dmp;
    let wordsToChars = globalThis.diff_wordsToChars_(text1, text2);
    let diffs = dmp.diff_main(wordsToChars.chars1, wordsToChars.chars2, false);

    // Convert the diff back to words
    dmp.diff_charsToLines_(diffs, wordsToChars.wordArray);

    dmp.diff_cleanupSemantic(diffs);

    // Process the differences
    let result = [];
    for (let [operation, data] of diffs) {
        if (operation === 0 || data.search(/\w/)<0) {
            result.push(data);
        } else if (operation === -1) {
            result.push(`<rm>${data}</rm>`);
        } else if (operation === 1) {
            result.push(`<add>${data}</add>`);
        }
    }

    // Join the result into a single string and remove the special character
    let diff = result.join('')
    diff = diff.replace(/[@\f]/g, '');
    diff = diff.replace(/(<(add|rm)>)(\W+)/g, '$3$1');
    diff = diff.replace(/(\W+)(<\/(add|rm)>)/g, '$2$1');
    diff = diff.replace(
        /([\w\.]+)<rm>([^<>]*?)<\/rm>([^\w<>]*)<add>([^<>]*?)<\/add>/g, 
        '<rm>$1$2</rm>$3<add>$1$4</add>');
    diff = diff.replace(
        /<rm>([^<>]*?)<\/rm>([^\w<>]*)<add>([^<>]*?)<\/add>(\w+)/g, 
        '<rm>$1$4</rm>$2<add>$3$4</add>');
    diff = diff.replace(/\n/g, '<br>');
    return diff;
}

dmp.difflibAddRmWords = difflibAddRmWords;