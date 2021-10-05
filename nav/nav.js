window.onload = function () {
    $.get("../nav/nav.html", function (data) {
        if (document.location.pathname.match(/[^\/]+$/)) {
            var name = document.location.pathname.match(/[^\/]+$/)[0].slice(0, -5);
        }
        else {
            name = "index";
        }
        $("#nav").html(data);
        $("#navLinks").children().each(function (i, e) {
            if (
                !e.id.startsWith(name) && e.id.endsWith("Active")
                || e.id.startsWith(name) && e.id.endsWith("Link")
            ) {
                e.remove()
            }
        });
    });
}