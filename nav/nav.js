window.onload = function () {
    // $.get("../nav/nav.html", function (data) {
    url = (window.location != window.parent.location)
        ? document.referrer
        : document.location.href;
    if (url.match(/[^\/]+$/)) {
        var name = url.match(/[^\/]+$/)[0].slice(0, -5);
    }
    else {
        name = "index";
    }
    $("#navLinks").children().each(function (i, e) {
        if (
            !e.id.startsWith(name) && e.id.endsWith("Active")
            || e.id.startsWith(name) && e.id.endsWith("Link")
        ) {
            e.remove()
        }
    });
    // });
}