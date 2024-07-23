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
globalThis.dmp = dmp
