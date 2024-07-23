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
    var lineArray = [];  // e.g. lineArray[4] == 'Hello\n'
    var lineHash = {};   // e.g. lineHash['Hello\n'] == 4
  
    // '\x00' is a valid character, but various debuggers don't like it.
    // So we'll insert a junk entry to avoid generating a null character.
    lineArray[0] = '';
  
    /**
     * Split a text into an array of strings.  Reduce the texts to a string of
     * hashes where each Unicode character represents one line.
     * Modifies linearray and linehash through being a closure.
     * @param {string} text String to encode.
     * @return {string} Encoded string.
     * @private
     */
    function diff_wordsToCharsMunge_(text) {
      var chars = '';
      // Walk the text, pulling out a substring for each line.
      // text.split('\n') would would temporarily double our memory footprint.
      // Modifying text would create many large strings to garbage collect.
      var lineStart = 0;
      var lineEnd = -1;
      // Keeping our own length variable is faster than looking it up.
      var lineArrayLength = lineArray.length;
      while (lineEnd < text.length - 1) {
        lineEnd = text.search('\n', lineStart);
        if (lineEnd == -1) {
          lineEnd = text.length - 1;
        }
        var line = text.substring(lineStart, lineEnd + 1);
  
        if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) :
            (lineHash[line] !== undefined)) {
          chars += String.fromCharCode(lineHash[line]);
        } else {
          if (lineArrayLength == maxLines) {
            // Bail out at 65535 because
            // String.fromCharCode(65536) == String.fromCharCode(0)
            line = text.substring(lineStart);
            lineEnd = text.length;
          }
          chars += String.fromCharCode(lineArrayLength);
          lineHash[line] = lineArrayLength;
          lineArray[lineArrayLength++] = line;
        }
        lineStart = lineEnd + 1;
      }
      return chars;
    }
    // Allocate 2/3rds of the space for text1, the rest for text2.
    var maxLines = 40000;
    var chars1 = diff_wordsToCharsMunge_(text1);
    maxLines = 65535;
    var chars2 = diff_wordsToCharsMunge_(text2);
    return {chars1: chars1, chars2: chars2, lineArray: lineArray};
  };

dmp.diff_wordsToChars_ = diff_wordsToChars_;
globalThis.dmp = dmp
