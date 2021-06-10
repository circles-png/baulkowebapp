var newday = new Date();
var day = newday.getDay();
var currentsec = newday.getHours() * 3600 + newday.getMinutes() * 60 + newday.getSeconds();
var daydata;
var numberofperiods;
var table = "<table class='table my-5 fs-5'><caption>Code by: Matthew Wu :3</caption>";
var periodtimename = [];
var theme = 0;
var weekend = 1;

document.getElementsByClassName("tablenojs")[0].style.opacity = 0;
document.getElementsByClassName("tablenojs")[0].style.display = "none";

getdatafortoday();
displaystartandfinishtime();
writetotable();
updateprogress();

var updatetime = setInterval(update, 1000);

function update() {
    var oldday = day;
    getdatafortoday();
    if (oldday == day) {
        updateprogress();
    }
    else {
        document.getElementsByTagName("body")[0].innerHTML = "";
        displaystartandfinishtime();
        writetotable();
        updateprogress();
    }
}
function getdatafortoday() {
    newday = new Date();
    day = newday.getDay();
    currentsec = newday.getHours() * 3600 + newday.getMinutes() * 60 + newday.getSeconds();
    //get data for today's day
    if (day == 1) {
        daydata = belltimes.Monday;
        weekend = 0;
    }
    else if (day == 2) {
        daydata = belltimes.Tuesday;
        weekend = 0;
    }
    else if (day == 3) {
        daydata = belltimes.Wednesday;
        weekend = 0;
    }
    else if (day == 4) {
        daydata = belltimes.Thursday;
        weekend = 0;
    }
    else if (day == 5) {
        daydata = belltimes.Friday;
        weekend = 0;
    }
    else {
        daydata = belltimes.Monday;
        weekend = 1;
    }
    numberofperiods = daydata.period.length;
}

function displaystartandfinishtime() {
    if (weekend == 0) {
        for (var a = 0; a < numberofperiods - 2; a++) {
            //get period start and finish as a string to show user
            var periodstarthour = Math.floor(daydata.times[a * 2] / 60).toString();
            var periodstartmin = (daydata.times[a * 2] % 60).toString();
            var periodendhour = Math.floor(daydata.times[a * 2 + 1] / 60).toString()
            var periodendmin = (daydata.times[a * 2 + 1] % 60).toString();
            //pad 0 if single digit minute
            if (periodstartmin.length == 1) {
                periodstartmin = "0" + periodstartmin;
            }
            if (periodendmin.length == 1) {
                periodendmin = "0" + periodendmin;
            }
            periodtimename[a + 1] = periodstarthour + ":" + periodstartmin + " - " + periodendhour + ":" + periodendmin;
        }


        // display first and last period times
        var periodfirsthour = Math.floor(daydata.times[0] / 60).toString();
        var periodfirstmin = (daydata.times[0] % 60).toString();
        var periodlasthour = Math.floor(daydata.times[numberofperiods * 2 - 5] / 60).toString();
        var periodlastmin = (daydata.times[numberofperiods * 2 - 5] % 60).toString();
        if (periodfirstmin.length == 1) {
            periodfirstmin = "0" + periodfirstmin;
        }
        if (periodlastmin.length == 1) {
            periodlastmin = "0" + periodlastmin;
        }
        periodtimename[0] = periodfirsthour + ":" + periodfirstmin;
        periodtimename[numberofperiods - 1] = periodlasthour + ":" + periodlastmin;
    }
    else {
        weekend = 1
    }
}


function writetotable() {
    if (weekend == 0) {
        //first row
        table = table + "<tr><td>" + daydata.period[0] + "</td><td>" + periodtimename[0] + "</td><td><div class='progressblock'><div class='progress' style='height: 30px;'><div class='progress-bar'><div class='textbar'><p class='progresstext m-2 fs-5'></p></div></div></div></div></td></tr>";
        //all rows
        for (a = 1; a < numberofperiods - 1; a++) {
            table = table + "<tr><td>" + daydata.period[a] + "</td><td>" + periodtimename[a] + "</td><td><div class='progressblock'><div class='progress' style='height: 30px;'><div class='progress-bar'><div class='textbar'><p class='progresstext m-2 fs-5'></p></div></div></div></div></td></tr>";
        }
        //last row
        table = table + "<tr><td>" + daydata.period[numberofperiods - 1] + "</td><td>" + periodtimename[numberofperiods - 1] + "</td><td><div class='progressblock'><div class='progress' style='height: 30px;'><div class='progress-bar'><div class='textbar'><p class='progresstext m-2 fs-5'></p></div></div></div></div></td></tr>";
        table += "</table>";
        document.getElementById("tableclass").innerHTML = table;
    }
    else {
        document.getElementsByClassName("tableclass")[0].innerHTML = "it is a weekend my dudes";
    }
}

function updateprogress() {
    if (weekend == 0) {
        //Start
        //If class start
        if (currentsec >= daydata.times[0] * 60 && currentsec <= daydata.times[daydata.times.length - 1] * 60) {
            document.getElementsByClassName("progress-bar")[0].style.width = "100%";
            document.getElementsByClassName("progress-bar")[daydata.period.length - 1].style.width = "0";
            for (a = 0; a < numberofperiods - 2; a++) {
                //useless?
                if (currentsec < daydata.times[2 * a] * 60) {
                    document.getElementsByClassName("progress-bar")[a + 1].style.width = "0%";
                }
                else if (currentsec >= daydata.times[2 * a + 1] * 60) {
                    document.getElementsByClassName("progress-bar")[a + 1].style.width = "100%";
                }
                else {
                    document.getElementsByClassName("progress-bar")[a + 1].style.width = ((((currentsec / 60) - daydata.times[2 * a]) / (daydata.times[2 * a + 1] - daydata.times[2 * a])) * 100).toString() + "%";
                }
            }
        }
        //if day finish
        else if (currentsec >= daydata.times[daydata.times.length - 1] * 60) {
            for (a = 0; a < daydata.period.length; a++) {
                document.getElementsByClassName("progress-bar")[a].style.width = "100%";
            }
        }
        else {
            for (a = 0; a < daydata.period.length; a++) {
                document.getElementsByClassName("progress-bar")[a].style.width = "0%";
            }
        }
        for (a = 0; a < daydata.period.length - 2; a++) {
            if (currentsec > (daydata.times[2 * a + 1] * 60)) {
                document.getElementsByClassName("progresstext")[a + 1].innerHTML = "period finished!"
            }
            else if (currentsec < (daydata.times[2 * a] * 60)) {
                document.getElementsByClassName("progresstext")[a + 1].innerHTML = "";
            }
            else if ((currentsec > (daydata.times[2 * a] * 60)) && (currentsec < (daydata.times[2 * a + 1] * 60))) {
                document.getElementsByClassName("progresstext")[a + 1].innerHTML = Math.floor((daydata.times[2 * a + 1] * 60 - currentsec) / 60).toString() + "m " + Math.floor(((daydata.times[2 * a + 1] * 60 - currentsec) % 60)).toString() + "s";
            }
        }
        //time till school start
        if (currentsec < (daydata.times[0] * 60)) {
            //if over an hour till school start
            if ((daydata.times[0] * 60 - currentsec) > 3600) {
                document.getElementsByClassName("progresstext")[0].innerHTML = "In " + Math.floor((daydata.times[0] * 60 - currentsec) / 3600).toString() + "h " + Math.floor(((daydata.times[0] * 60 - currentsec) % 3600) / 60).toString() + "m";
            }
            //if under an hour till school start
            else {
                document.getElementsByClassName("progresstext")[0].innerHTML = "In " + Math.floor((daydata.times[0] * 60 - currentsec) / 60).toString() + "m " + Math.floor(((daydata.times[0] * 60 - currentsec) % 60)).toString() + "s";
            }
        }
        else {
            document.getElementsByClassName("progresstext")[0].innerHTML = "not even school yet";
        }
        if (currentsec > (daydata.times[daydata.period.length - 1] * 60)) {
            document.getElementsByClassName("progresstext")[daydata.period.length - 1].innerHTML = "school ended";
        }
        else {
            document.getElementsByClassName("progresstext")[daydata.period.length - 1].innerHTML = "";
        }
    }
    else {
        weekend = 1;
    }
}

function button_light() {
    document.getElementsByTagName("body")[0].classList.add("theme_light");
    document.getElementsByTagName("body")[0].classList.remove("theme_dark");
}

function button_dark() {
    document.getElementsByTagName("body")[0].classList.add("theme_dark");
    document.getElementsByTagName("body")[0].classList.remove("theme_light");
}
