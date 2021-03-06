function loadRank() {
    Recyclabears.users.me().then(function (data) {
        var friends = data.friends.list;
        var requests_received = data.friends.reqReceived;
        var requests_sent = data.friends.reqSent;

        /*console.log("loadrank called!");
        console.log(data);
        console.log(data.friends);
        console.log(friends);
        console.log(requests_sent);
        console.log(requests_received);*/

        populateWithUsers(document.getElementById('rank-list'), friends);
        populateWithUsers(document.getElementById('req-received'), requests_received);
        populateWithUsers(document.getElementById('req-sent'), requests_sent);

        return 'done';
    });
}

function populateWithUsers(div, friends) {
    if (friends.length <= 0)
        return;

    console.log("populating with users");
    div.innerHTML = "";

    var isFriend = 0;
    if (div.id == 'rank-list') {
        div.innerHTML += "<span class='user-div-title'>Friends</span>";
    }
    else if (div.id == 'req-received') {
        div.innerHTML += "<span class='user-div-title'>Received Requests</span>";
        isFriend = 1;
    }
    else if (div.id == 'req-sent') {
        div.innerHTML += "<span class='user-div-title'>Sent Requests</span>";
        isFriend = 2
    }

    for (var i = 0; i < friends.length; i++) {
        Recyclabears.users.getUserByFbId(friends[i]).then(function (data) {
            console.log(data)
            data.isFriend = isFriend;
            var rankDiv = document.createElement("div");
            rankDiv.setAttribute("class", "rank");
            console.log("Recyclabears.users.getUserDpUrl(" + data.fbId);
            rankDiv.innerHTML = "<img src=\"" + Recyclabears.users.getUserDpUrl(data.fbId) + "\">";
            var nameSpan = document.createElement("span");
            nameSpan.setAttribute("class", "name");
            nameSpan.setAttribute("onclick", "openProfile(" + JSON.stringify(data) + ")");
            nameSpan.innerHTML = data.name;
            rankDiv.appendChild(nameSpan);
            rankDiv.innerHTML += "<span class=\"score\">" + data.wallet + "</span>";
            div.appendChild(rankDiv);
        });
    }

}

function openProfile(friend) {
    var overlay = document.getElementById("overlay");
    var popup = document.getElementById("pop-up");
    overlay.style.display = "block";
    popup.style.display = "block";
    popup.innerHTML = "";

    var profileDiv = document.createElement("div")
    profileDiv.setAttribute("class", "grid-container");
    profileDiv.id = 'profile';

    var friendActionButton = document.createElement("button");
    friendActionButton.setAttribute("id", "friend-action");
    friendActionButton.setAttribute("class", "right-orange-button");
    if (friend.isFriend == 0) {
        friendActionButton.setAttribute("onclick", "unfriend(" + JSON.stringify(friend) + ")");
        friendActionButton.innerHTML = 'Unfriend';
        profileDiv.appendChild(friendActionButton);
    }
    else if (friend.isFriend == 1) {
        friendActionButton.setAttribute("onclick", "deleteRequestReceived(" + friend.fbId + ")");
        friendActionButton.innerHTML = 'Decline';
        profileDiv.appendChild(friendActionButton);
    }
    else {
        friendActionButton.setAttribute("onclick", "cancelRequest(" + friend.fbId + ")");
        friendActionButton.innerHTML = 'Cancel Request';
        profileDiv.appendChild(friendActionButton);
    }

    var profileHTML = "<img id='profile-photo' src='" + "/assets/images/rank/user.png" + "'>";
    profileHTML += "<span class='name'>" + friend.name + "</span>";
    profileHTML += "<span class='score'>" + friend.wallet + "</span>";

    if (friend.isFriend == 0) {

        profileHTML += "<button id='visit-world' class='left-green-button' " +
            "onclick='displayWorld(" + friend.fbId + ",\"" + friend.name + "\")'>Visit World</button>";
    }
    else if (friend.isFriend == 1) {
        var functionName = "acceptRequest(" + friend.fbId + ")";
        profileHTML += "<button onclick=" + functionName + " class='left-green-button' onclick=''>Accept</button>";
    }

    profileHTML += "<button id='close' onclick='closeProfile()'>Close</button>";

    profileDiv.innerHTML += profileHTML;
    popup.appendChild(profileDiv);

}

function closeProfile() {
    var overlay = document.getElementById("overlay");
    var popup = document.getElementById("pop-up");
    overlay.style.display = "none";
    popup.style.display = "none";
}

function acceptRequest(id) {
    Recyclabears.users.acceptFriendRequest(id).then(function (data) {
        console.log(data);
        closeProfile();
        loadRank();
    });
}

function deleteRequestReceived(id) {
    Recyclabears.users.deleteFriendRequest(id).then(function (data) {
        console.log(data);
        closeProfile();
        loadRank();
    });
}

function cancelRequest(id) {
    Recyclabears.users.deleteSentFriendRequest(id).then(function (data) {
        console.log(data);
        closeProfile();
        loadRank();
    });
}

function unfriend(friend) {
    var popup = document.getElementById("pop-up");
    var profileHTML = "<div id='profile' class='grid-container'>";
    profileHTML += "<img id='profile-photo' src='" + "/assets/images/rank/user.png" + "'>";
    profileHTML += "<span class='name'>Are you sure you would like to delete " + friend.name + "?</span>";
    var functionName = "sendUnfriend(" + friend.fbId + ")";
    profileHTML += "<button class='left-green-button' onclick=" + functionName + ">Yes</button>";
    functionName = "closeProfile()";
    profileHTML += "<button class='right-orange-button' onclick=" + functionName + ">No</button>";
    profileHTML += "</div>";

    popup.innerHTML = profileHTML;
}

function sendUnfriend(id) {
    console.log(id);
    Recyclabears.users.unFriend(id).then(function (data) {
        closeProfile();
        loadRank();
    })
}

wbbInit(loadRank);

function showFriendsDialog() {
    FB.ui({
        method: 'apprequests',
        message: 'Add friends'
    }, friendsDialogCallback);
}


function friendsDialogCallback(res) {
    console.log(res);
    var promises = [];
    var errors = [];

    for (var i = 0; i < res.to.length; i++) {
        promises.push(Recyclabears.users.sendFriendRequest(res.to[i]).then(function(error_obj){
            if(error_obj.message != null){
                errors.push(error_obj);
            } else {
                loadRank();
            }
        }));
    }

    Promise.all(promises).then(function(){
        if(errors.length > 0){
            showAddFriendError(errors);
        }
    });

}

/* Show a popup message with the error(s) when trying to add friends */
function showAddFriendError(errors){

    toggleMessageWindow();
    var popup = document.getElementById("pop-up");
    popup.innerHTML = "";

    var header_HTML = "<div class='error_container'><h2>Error!</h2>";

    // HTML detailing the error(s) encountered when trying to send friend requests
    var errors_HTML = "";
    for(var i = 0; i < errors.length; i++){
        errors_HTML += "<p><b>" + errors[i].message + ":</b> " + errors[i].friend_name + "</p>";
    }

    // Close popup button
    var close_button_HTML = "<button onclick='toggleMessageWindow()'>Close</button>";

    // Final display of popup window
    popup.innerHTML += header_HTML + errors_HTML + close_button_HTML + "</div>";

}


/* Toggle the PopUp Window to show error messages */
function toggleMessageWindow() {
    var overlay = document.getElementById("overlay");
    var popup = document.getElementById("pop-up");

    // Toggle visibility of overlay and popup
    if (overlay.style.display === "none" || overlay.style.display === "") {
        overlay.style.display = "block";
        popup.style.display = "block";

    } else {
        overlay.style.display = "none";
        popup.style.display = "none";
        // document.getElementById("msg_insert").innerHTML = "";
    }
    loadRank();
}

function displayWorld(fbId, friendName) {

    const overlay = $('#overlay');
    const popup = $('#world-pop-up');
    overlay.show();
    popup.html('');
//    popup.show(); // Note: show popup after world obtained
    // (prevent showing users the "moving world popup" when repositioning

    var cont = $('<div/>', {id: 'world-container'});
    var img = $('<img/>', {
        id: 'world-img',
        src: '/assets/images/world/background.png'
    });

    // Get first part of name
    var name = friendName.split(" ")[0];
    var text = $("<h1 id='world-name'>" + name + "'s World</h1>");

    cont.append(img);
    cont.append(text);
    popup.append(cont);

    const realX = 1122, realY = 626;
    // execute image loading and world data loading in parallel
    Promise.all([new Promise(function (resolve) {
        img.on('load', resolve);
    }), Recyclabears.worlds.getWorld(fbId)]).then(function (res) {

        // Show popup here to prevent users seeing the popup "move"
        popup.show();

        var world = res[1];
        const mx = img.width() / realX, my = img.height() / realY;
        for (var i in world.items) {
            displayWorldItem(cont, mx, my, world.items[i]);
        }



        /* Reposition the popup so that it is in center of screen
           Repositioning done after the world has loaded to accurately obtain
           height and width of popup window */
        popup.css({
            'margin-top': -(popup.height()/2),
            'margin-left': -(popup.width()/2)
        });

    });
    overlay.click(closeWorld);

}

function displayWorldItem(cont, mx, my, item) {
    const size = (120 * mx) + 'px';
    var gObj = {
        div: $('<div/>', {
            'class': 'item-to-move'
        }),
        redraw: function () {
            gObj.div.css('left', (gObj.x * mx) + 'px');
            gObj.div.css('top', (gObj.y * my) + 'px');
        }
    };
    Object.assign(gObj, item); // copies and replace gObj with whats in obj
    var delImg = $('<img/>', {
        src: '/assets/images/world/delete2.png',
        'class': 'delete-img',
        width: size
    });
    delImg.css('visibility', 'hidden');
    var objImg = $('<img/>', {
        src: gObj.image,
        width: size
    });
    gObj.div.append(delImg, objImg);
    gObj.redraw();
    cont.append(gObj.div);
}

function closeWorld() {
    const overlay = $('#overlay');
    const popup = $('#world-pop-up');

    // Clear modified inline styles when popup is closed
    popup.attr('style', '');

    overlay.off('click');
 //   overlay.hide();
    popup.hide();

}