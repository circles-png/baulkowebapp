var time_is_widget = new time_is_widget()
class time_is_widget {
    constructor() {
        var ca = 0, tD = 0, tout = 0, updint = 1000, tl = "", U = "undefined", i, j, rd
        var p = { n: ["Sunday.Monday.Tuesday.Wednesday.Thursday.Friday.Saturday.Sun.Mon.Tue.Wed.Thu.Fri.Sat.January.February.March.April.May.June.July.August.September.October.November.December"], w: "week ", W: "week .n", dy: " day" }
        for (i in p)
            p[i] = decodeURIComponent(p[i])
        p["n"] = p["n"].split(".")
        this.init = function (P) {
            if (tout != 0)
                clearInterval(time_is_widget.tout)
            var a, q = [], c = { dayname: "%l", dname: "%D", daynum: "%d", dnum: "%j", day_in_y: "%z", week: "%W", monthname: "%F", monthnum: "%m", mnum: "%n", yy: "%y", year: "%Y", "12hours": "%h", hours: "%H", minutes: "%i", seconds: "%s", AMPM: "%A" }, ct = "TIME", tF = "%H:%i:%s", dF = "%Y-%d-%m", sF = "%srH:%srm-%ssH:%ssm"
            for (i in P) {
                a = P[i]
                a["p"] = ""
                if (typeof a["id"] == U)
                    a["id"] = i
                if (typeof a["time_format"] != U)
                    tF = a["time_format"]
                if (typeof a["date_format"] != U)
                    dF = a["date_format"]
                if (typeof a["sun_format"] != U)
                    sF = a["sun_format"]
                for (j in c) {
                    dF = dF.replace(j, c[j])
                    tF = tF.replace(j, c[j])
                }
                if (typeof a["template"] != U)
                    ct = a["template"]
                tl = "https://time.is/" + i.substr(0, a["id"].indexOf("AA")).replace("__", ",_")
                tl = "<span onclick=\"location='" + tl.replace("'", "\\\'") + "'\" title=\"" + tl + '">'
                a["template"] = ct.replace("SUN", tl + sF + "</span>").replace("TIME", tF + "</span>").replace("DATE", dF + '</span>')
                if (typeof a["v"] == U) {
                    q.push(a["id"])
                    if (typeof a["coords"] != U)
                        q[q.length - 1] += "." + a["coords"].replace(",", "_")
                }
                P[i] = a
            }
            this.ca = P
            if (0 < q.length) {
                i = document.createElement("script")
                i.setAttribute("src", "//widget.time.is/?" + encodeURIComponent(q.join("..")) + "&t=" + new Date().getTime())
                j = document.getElementsByTagName("head").item(0)
                j.appendChild(i)
            } else
                this.tick()
        }
        this.cb = function (t, r, a) {
            var rpT = new Date(), n = 0
            time_is_widget.tD = rpT.getTime() - t - Math.round((rpT - r) / 2)
            for (i in this.ca) {
                this.ca[i]["v"] = a[n]
                n++
            }
            this.tick()
        }
        this.tick = function () {
            var tU = new Date(), t = new Date(), c, pw
            tU.setTime(tU.getTime() - this.tD)
            if (!rd && document.readyState === "complete") {
                if (document.getElementById)
                    i = document.getElementById("time_is_link")
                else
                    i = eval("time_is_link")
                if (null == i || i.href.indexOf("time.is/") === -1) {
                    console.log('Link back to Time.is missing!')
                    return ''
                } else {
                    if (!i.rel || i.innerHTML.length < 3 || i.offsetWidth < 10 || i.offsetHeight < 5) {
                        rd = "//widget.time.is/r/?" + i.rel + ".w" + i.offsetWidth + ".h" + i.offsetHeight + "." + encodeURIComponent(i.innerHTML)
                        i = document.createElement("script")
                        i.setAttribute("src", rd)
                        j = document.getElementsByTagName("head").item(0)
                        j.appendChild(i)
                    }
                }
            }
            for (i in this.ca) {
                c = this.ca[i]
                if (typeof c["v"][0] != U) {
                    if ((0 < c["v"][1]) && (c["v"][1] < tU.getTime())) {
                        c["v"][0] = c["v"][2]
                        c["v"][1] = 0
                    }
                    t.setTime(c["v"][0] * 60000 + tU.getTime())
                    var d, y = t.getUTCFullYear() + "", m = t.getUTCMonth() + 1, N = new Date(y, 0, 1), o = N.getDay() - 1
                    if (o == -1)
                        o = 6
                    var W = Math.floor((t - N + N.getTimezoneOffset() * 60000) / 604800000 + (o / 7)), dn = p["dy"] + " " + Math.floor((t - N + N.getTimezoneOffset() * 60000) / 86400000 + 1)
                    if (o < 4)
                        W++
                    if (W == 0) {
                        W = 52
                        if (new Date(y - 1, 0, 1).getDay() == 4 || new Date(y - 1, 11, 31).getDay() == 4)
                            W = 53
                    }
                    if (p["W"] == "hy") {
                        if (W == 1)
                            pw = "1-ին շաբաթ"
                        else
                            pw = W + "-րդ շաբաթ"
                    } else
                        pw = p["W"].replace(".n", W)
                    var g = { t: t.getUTCHours(), r: c["v"][3], s: c["v"][5] }, h = {}
                    for (j in g) {
                        h[j] = l0(g[j])
                        h[j + "H"] = h[j]
                        h[j + "M"] = "AM"
                        if (11 < h[j]) {
                            h[j + "M"] = "PM"
                            h[j] = l0(h[j] - 12)
                        }
                        if (h[j] == "00")
                            h[j] = 12
                    }
                    d = c["template"].replace("srhour", h["rH"]).replace("sr12hour", h["r"]).replace("srAMPM", h["rM"]).replace("srminute", l0(c["v"][4])).replace("sshour", h["sH"]).replace("ss12hour", h["s"]).replace("ssAMPM", h["sM"]).replace("ssminute", l0(c["v"][6])).replace("dlhours", c["v"][7]).replace("dlminutes", c["v"][8]).replace("%h", h["t"]).replace("%H", h["tH"]).replace("%i", l0(t.getUTCMinutes())).replace("%s", l0(t.getUTCSeconds())).replace("%A", h["tM"]).replace("%j", t.getUTCDate()).replace("%d", l0(t.getUTCDate())).replace("%W", pw).replace("%n", m).replace("%m", l0(m)).replace("%y", y.substr(2, 2)).replace("%Y", y).replace("%F", p["n"][13 + m]).replace("%l", p["n"][t.getUTCDay()]).replace("%D", p["n"][7 + t.getUTCDay()]).replace("%z", dn)
                    j = d.indexOf(">")
                    d = d.substr(0, j + 1) + d.substr(j + 1, 1).toUpperCase() + d.substr(j + 2, d.length - 1)
                    if (d != c["p"]) {
                        if (document.getElementById)
                            o = document.getElementById(i); else
                            o = eval()
                        if (null != o) { o.innerHTML = d; c["p"] = d }
                    }
                }
                if (typeof c["callback"] != U)
                    eval(c["callback"] + "(d)")
            }
            tout = setTimeout('time_is_widget.tick("")', updint - tU % updint)
        }
        function l0(n) { return n > 9 ? n : "0" + n }
    }
}