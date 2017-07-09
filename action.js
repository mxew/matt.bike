var mattdotbike = {
  version: "00.01",
  uid: false,
  totaldist: 0,
  totalmins: 0,
  totalrides: 0
};

mattdotbike.init = function() {

  var config = {
    apiKey: " AIzaSyA5UKvJ6LyW5is2SsL9XUnBHjJVcdxozu4",
    authDomain: "thompsnbike.firebaseapp.com",
    databaseURL: "https://thompsnbike.firebaseio.com"
  };
  firebase.initializeApp(config);
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      mattdotbike.uid = user.uid;
      console.log("user signed in!");
      $("#topbar").append("<a onclick=\"mattdotbike.logout()\" id=\"logout\">sign out</a>")
      var loggingnow = $("#login").is(":visible");
      if (loggingnow) {
        $("#login").css("display", "none");
        $("#logaride").css("display", "block");
        $("#entries").css("display", "none");
      }
    } else {
      mattdotbike.uid = false;
      $("#logout").remove();
    }
  });

  //click events init
  $("#logplease").bind("click.logplease", mattdotbike.logplease);
  $("#logbutton").bind("click.lognow", mattdotbike.logaridenow);
  $("#loginpass").bind("keyup", function() {
    if (event.which == 13) {
      var email = $("#loginemail").val();
      var pass = $("#loginpass").val();
      mattdotbike.logIn(email, pass);
    }
  });

  var ref = firebase.database().ref("rides");
  ref.on('child_added', function(childSnapshot, prevChildKey) {
    var entry = childSnapshot.val();
    var hrs = Math.floor(entry.mins / 60);
    var mns = Math.round(entry.mins % 60);
    mattdotbike.totalrides++;
    mattdotbike.totaldist += entry.miles;
    mattdotbike.totalmins += entry.mins;
    var avg = mattdotbike.totaldist / (mattdotbike.totalmins / 60);
    console.log(avg);
    var score = ((((entry.miles / (entry.mins / 60)) - avg) / avg) * 100);

    var timeread = hrs + "h " + mns + "m";
    console.log(score);
    var leftbar = 0;
    var rightbar = 0;
    if (score < 0) {
      leftbar = Math.abs(score)
    } else if (score > 0) {
      rightbar = Math.abs(score);
    }
    var descrip = "";
    if (entry.description != "") {
      descrip = "<div class=\"ridedescrip\">" + entry.description + "</div>";
    }
    $("#entries").prepend("<div class=\"entry\"><div class=\"ridedate\">" + mattdotbike.utils.format_date(entry.date) + "</div>" + descrip + "<div class=\"bars\"><div class=\"leftbarr ridebar\"><div style=\"width:" + leftbar + "%; background-color:red;\"class=\"timebar\"></div></div><div class=\"rightbarr ridebar\"><div style=\"width:" + rightbar + "%; background-color:green;\"class=\"timebar\"></div></div><div class=\"clear\"></div></div><div class=\"ridedist\">" + entry.miles + "mi</div><div class=\"rideduration\">" + timeread + "</div><div class=\"clear\"></div></div>")

    mattdotbike.updateTotals();
  });
};
mattdotbike.logout = function() {
  firebase.auth().signOut();
};
mattdotbike.updateTotals = function() {
  $("#totaldist").text(mattdotbike.totaldist);
  var hours = Math.round(mattdotbike.totalmins / 60);
  $("#totaltime").text(hours);
  $("#ridecount").text(mattdotbike.totalrides);
};
mattdotbike.utils = {
  format_date: function(d) {

    var date = new Date(d);

    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();

    var formatted_date = month + "-" + day + "-" + year;
    return formatted_date;
  },
  format_time: function(d) {

    var date = new Date(d);

    var hours1 = date.getHours();
    var ampm = "am";
    var hours = hours1;
    if (hours1 > 12) {
      ampm = "pm";
      hours = hours1 - 12;
    }
    if (hours == 0) hours = 12;
    var minutes = date.getMinutes();
    var min = "";
    if (minutes > 9) {
      min += minutes;
    } else {
      min += "0" + minutes;
    }
    return hours + ":" + min + "" + ampm;
  }
};
mattdotbike.logaridenow = function() {
  var miles = parseInt($("#milesbiked").val());
  var hours = parseInt($("#hoursbiked").val());
  var min = parseInt($("#minsbiked").val());
  var description = $("#descripbox").val();
  if (miles !== "" && hours !== "" && min !== "") {
    var totalmins = Math.round(hours * 60) + min;
    var data = {
      mins: totalmins,
      date: firebase.database.ServerValue.TIMESTAMP,
      miles: miles,
      description: description
    };
    var qref = firebase.database().ref("rides");
    qref.push(data);
    $("#milesbiked").val("");
    $("#hoursbiked").val("");
    $("#minsbiked").val("");
    $("#descripbox").val("");
    mattdotbike.logplease();
  }
};
mattdotbike.logIn = function(email, password) {
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    if (errorCode === 'auth/wrong-password') {
      alert('Wrong password.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
  });
};
mattdotbike.logplease = function() {
  //decide which page to show the thing to
  var mainloghidden = $("#entries").is(":hidden");
  if (mainloghidden) {
    $("#logplease").text("log a ride");
    $("#login").css("display", "none");
    $("#logaride").css("display", "none");
    $("#entries").css("display", "block");
  } else {
    $("#logplease").text("go back");
    if (mattdotbike.uid) {
      $("#login").css("display", "none");
      $("#logaride").css("display", "block");
      $("#entries").css("display", "none");
    } else {
      $("#login").css("display", "block");
      $("#logaride").css("display", "none");
      $("#entries").css("display", "none");
    }
  }
};

mattdotbike.init();
