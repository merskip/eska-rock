$.fn.addClassForAnimation = function (className, onComplete) {
    $(this).addClass(className).animationEnd(() => {
        $(this).removeClass(className);

        if (onComplete !== undefined) {
            onComplete();
        }
    });
};

$.fn.animationEnd = function (callback) {
    $(this).one("webkitAnimationEnd oanimationend msAnimationEnd animationend", callback);
};

$.fn.disableUserInteraction = function () {
    $(this).css("pointer-events", "none");
};

$.fn.enableUserInteraction = function () {
    $(this).css("pointer-events", "");
};

$.clearTextSelection = function () {
    if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
        }
        else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
        }
    }
    else if (document.selection) {  // IE?
        document.selection.empty();
    }
};

String.prototype.findSubstringRange = function (prefix, suffix, offset) {
    let prefixIndex = this.indexOf(prefix, offset);
    if (prefixIndex >= 0) {
        let substringFromPrefix = this.substr(prefixIndex + prefix.length);
        let suffixIndex = substringFromPrefix.indexOf(suffix);
        if (suffixIndex === -1) { // Suffix not found, so range is stretched to end string
            suffixIndex = substringFromPrefix.length;
        }

        return {
            start: prefixIndex + prefix.length,
            length: suffixIndex
        };
    }
    return null;
};

String.prototype.replaceRange = function (range, substitute) {
    return this.substring(0, range.start) + substitute + this.substring(range.start + range.length);
};

String.prototype.substringRange = function (range) {
    return this.substring(range.start, range.start + range.length);
};
