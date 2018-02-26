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

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle){
    let start = polarToCartesian(x, y, radius, endAngle);
    let end = polarToCartesian(x, y, radius, startAngle);

    let largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
}

function interpolateWithClip(value, min, max) {
    if (value >= 1.0) return max;
    if (value <= 0) return min;
    return (max - min) * value + min;
}