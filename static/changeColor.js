export function changeColor(checkboxElem, divId) {
    console.log("Do i come to the changeColor.js?")

    var checkboxDiv = document.getElementById(divId);
    if (checkboxElem.checked) {
        checkboxDiv.style.backgroundColor = "#60A5FA"; //Change the color to what you want when checked.
    } else {
        checkboxDiv.style.backgroundColor = "#93C5FD"; //Change it back to the original color when unchecked.
    }
}
