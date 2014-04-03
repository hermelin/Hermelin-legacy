// widget.autocomplete.js - user name autocomplete

if (typeof (widget) == 'undefined') widget = {};

function WidgetAutoComplete(obj, matchPattern, getResults) {
  var self = this;
  self.me = obj;
  self.matchPattern = matchPattern;
  self.getResults = getResults;
  self.suggestions = []; //all suggestions for the last time the text matched
  self.currentSuggestion = 0; //currently chosen suggestion
  self.suggesting = false; //state: currently suggesting or not
  self.suggestionList = document.createElement('ul');
  self.suggestionList.classList.add('autocomplete');
  self.me.parentNode.appendChild(self.suggestionList);
  self.cancelled = false; //says if the current suggestion was cancelled (needed for event-mess)

  self.keydown = function (event) {
    if (self.suggesting) {
      switch (event.keyCode) {

      case 9:
      case 13:
      case 32:
        //tab, enter or space
        self.completeSuggestion();
        self.cancelled = true;
        event.preventDefault();
        break;

      case 38:
        //up
        if (self.currentSuggestion !== 0) {
          self.currentSuggestion -= 1;
          self.updateSuggestionList(true);
          event.preventDefault();
        }
        break;

      case 39:
        var charCodeAfter = self.me.value.charCodeAt(self.me.selectionStart);
        if (!charCodeAfter || charCodeAfter === 32 || charCodeAfter === 20) {
          //pressed right and immediately after the cursor position is either nothing, space(32) or enter(20)
          //cancel suggestion and do the default 'right'-action
          self.suggesting = false;
          self.updateSuggestionList(true);
          self.cancelled = true;
        }
        break;

      case 40:
        //down
        if (self.currentSuggestion !== (self.suggestions.length - 1)) {
          self.currentSuggestion += 1;
          self.updateSuggestionList(true);
          event.preventDefault();
        }
      }
    } else {
      self.cancelled = false;
    }
  };

  self.keyup = function (event) {
    if (!self.cancelled) {
      //makes sure the suggestion was not just cancelled by the right key
      self.tryCompletion();
      self.cancelled = false;
    }
  };

  self.mouseup = function (event) {
    if (self.me.selectionStart === self.me.selectionEnd) {
      self.tryCompletion();
      self.cancelled = false;
    }
  };

  self.me.addEventListener('keydown', self.keydown);
  self.me.addEventListener('keyup', self.keyup);
  self.me.addEventListener('mouseup', self.mouseup);

  self.tryCompletion = function () {
    var old = self.suggesting;
    var word = self.checkForMatch();
    if (word) {
      self.getResults(word, function (resultList) {
        if (resultList.length > 0 && !(resultList.length === 1 && resultList[0].toLowerCase() === word.toLowerCase())) {
          //now we now the word matches, there are available suggestions and the word
          //isn't already the only match. so the actual suggestion will start
          self.suggestions = resultList;
          self.suggesting = true;
          self.updateSuggestionList(old);
          return;
        } else {
          //turn suggestion off
          self.suggesting = false;
          self.updateSuggestionList(old);
        }
      });
    } else {
      //turn suggestion off
      self.suggesting = false;
      self.updateSuggestionList(old);
    }
  };

  self.checkForMatch = function () {
    //get current position of the caret
    var caretPos = self.me.selectionStart;
    var textBefore = self.me.value.substring(0, caretPos);
    var spaceBefore = textBefore.lastIndexOf(' ');
    var newlineBefore = textBefore.lastIndexOf('\n');
    var whitespaceBefore = newlineBefore>=spaceBefore?newlineBefore:spaceBefore;

    //get the last word before caretPosition (space separates words)
    var word = textBefore.substring((whitespaceBefore + 1), caretPos);

    //if the pattern matches, return the word
    return word.match(self.matchPattern) ? word : false;
  };

  self.updateSuggestionList = function (before) {
    //before is the state self.suggesting had before now, so it is clear if
    //it has changed and if it is needed to hide/show the suggestions.
    //(less redundancy)
    if (self.suggesting) {

      if (!before) {
        //wasn't suggesting before but is now
        self.currentSuggestion = 0;
        self.showSuggestionList();
      }

      //delete all suggestions
      while (self.suggestionList.firstChild) {
        self.suggestionList.removeChild(self.suggestionList.firstChild);
      }

      //onclick event for all suggestions
      var clickedSuggestion = function clickedSuggestion() {
        var selected = this.parentNode.getElementsByClassName('selected');
        while (selected.length > 0) {
          selected[selected.length - 1].classList.remove('selected');
        }
        this.classList.add('selected');
        self.completeSuggestion(this.innerHTML);
      }

      //list all new suggestions
      for (var i = 0; i < self.suggestions.length; i++) {
        self.suggestionList.insertAdjacentHTML('beforeend', '<li>' + self.suggestions[i] + '</li>');
        self.suggestionList.lastChild.onclick = clickedSuggestion;
      }

      //add selected class to the current selection
      selected = self.suggestionList.childNodes[self.currentSuggestion];
      selected.classList.add('selected');
      selected.scrollIntoView(false);
    } else {
      if (before) {
        //was suggesting before but is not anymore
        self.hideSuggestionList();
      }
    }
  };

  self.showSuggestionList = function () {
    self.suggestionList.classList.add('shown');
  }

  self.hideSuggestionList = function () {
    self.suggestionList.classList.remove('shown');
  }

  self.completeSuggestion = function (sugg) {
    var text = self.me.value;
    var caretPos = self.me.selectionStart;
    var textBefore = text.substring(0, caretPos);
    var textAfter = text.substring(caretPos);
    var spaceBefore = textBefore.lastIndexOf(' ');
    var newlineBefore = textBefore.lastIndexOf('\n');
    var whitespaceBefore = newlineBefore>=spaceBefore?newlineBefore:spaceBefore;
    textBefore = textBefore.substring(0, (whitespaceBefore + 1));
    //now textbefore is everything before the word we have our cursor in and
    //text after everything after it.
    var suggestion = sugg || self.suggestions[self.currentSuggestion];
    text = textBefore + suggestion + textAfter;
    self.me.value = text;
    //now we need to put the cursor after the completed word.
    caretPos = textBefore.length + suggestion.length;
    self.me.selectionStart = caretPos;
    self.me.selectionEnd = caretPos;
    self.suggesting = false;
    self.updateSuggestionList(true);
  }

  self.stopSuggesting = function () {
    self.suggesting = false;
    self.updateSuggestionList(true);
  }
  
  self.unbind = function () {
    self.me.removeEventListener('keydown', self.keydown);
    self.me.removeEventListener('keyup', self.keyup);
    self.me.removeEventListener('mouseup', self.mouseup);
  }
}

widget.autocomplete = WidgetAutoComplete;
widget.autocomplete.connect = function bind(obj, matchPattern, getResults) {
  return new widget.autocomplete(obj, matchPattern, getResults);
}