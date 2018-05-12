/* should be last script in head */

var firstTime = true;

var appId;

function getAppId(save) {
    var request = new XMLHttpRequest();
    request.open('GET', '/config/fbAppId', false);
    request.send(null);
    if (request.status === 200) {
        if (save) {
            sessionStorage.setItem('fbAppId', request.responseText);
        }
        return request.responseText;
    }
    alert('Error reading config.');
}

if (typeof(Storage) !== "undefined") {
    appId = sessionStorage.getItem('fbAppId');
    if (appId == null) {
        appId = getAppId(true);
    }
} else {
    appId = getAppId(false);
}

window.fbAsyncInit = function () {
    FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v3.0'
    });
    FB.AppEvents.logPageView();
    // FB.getLoginStatus(statusChangeCallback);
    // mock facebook callback
    getLoginStatus(statusChangeCallback);
};

function getLoginStatus(callback) {
    if (typeof(Storage) !== "undefined") {
        var sess_auth = sessionStorage.getItem('fbAuth');
        if (sess_auth != null) {
            sess_auth = JSON.parse(sess_auth);
            if (new Date() < new Date(sess_auth.expiresAt)) {
                console.log('HIT');
                callback(sess_auth);
                return;
            } else {
                console.log('STALE');
            }
        }
        FB.getLoginStatus(function (response) {
            if (response.status == 'connected') {
                response.expiresAt = new Date(new Date().getTime() + response.authResponse.expiresIn * 500);
                sessionStorage.setItem('fbAuth', JSON.stringify(response));
            }
            callback(response);
        });
    } else {
        // do it the old hard way
        FB.getLoginStatus(callback);
    }
}

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_AU/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function statusChangeCallback(response) {
    // console.log(response);
    if (response.status != 'connected') {
        window.location = '/login/';
    }
    Recyclabears.__fbAuth = response;
    if (firstTime) {
        firstTime = false;
        if (wbbInit != null && wbbInit != undefined) {
            wbbInit();
        }
    }
}

function wbbInit() {

    // Code in header.js -- updates the strings that should show the user's waller amount
    updatePrice();
    if (document.title == "Recylabears | Rank") {
        loadRank();
    }

    // Code in new_play.js -- allow user to start playing once initialising is complete
    // - Prevent authAccess undefined problem
    try {
        enablePlayPage();
    } catch (err) {
        console.log("Not on Play Page");
    }

}

var Recyclabears = {
    __fbAuth: null,
    __apiCall: function (method, url, data) {
        var config = {
            dataType: 'json',
            type: method,
            url: url,
            headers: {
                Authorization: 'Facebook ' + Recyclabears.__fbAuth.authResponse.accessToken
            }
        };
        if (data != null) {
            config.data = data;
        }
        return $.ajax(config);
    },
    questions: {
        getRandomQuestion: function (howMany) {
            req = {
                n: howMany || 1
            };
            return Recyclabears.__apiCall('GET', '/api/questions/random', req);
        },
        answerQuestion: function (qid, answer) {
            req = {
                qid: qid,
                ans: answer
            };
            // TODO add API endpoint to update list of answered questions and user score


        },
        addQuestion: function (data) {
            return Recyclabears.__apiCall('POST', '/api/questions', data);
        },


        /* Coz I accidently modified a bunch of questions and had to remove them ;( ....  */
        deleteQuestion: function (qid) {
            return Recyclabears.__apiCall('DELETE', '/api/questions/' + qid);
        },
        getQuestion: function (qid) {
            return Recyclabears.__apiCall('GET', '/api/questions/testQuery');
        }


    },
    users: {
        me: function () {
            return Recyclabears.__apiCall('GET', '/api/users/me');
        },
        getUserByFbId: function (fbId) {
            return Recyclabears.__apiCall('GET', '/api/users/' + fbId);
        },
        getFriendRequests: function () {
            return Recyclabears.__apiCall('GET', '/api/users/me/requests');
        },
        acceptFriendRequest: function (fbId) {
            return Recyclabears.__apiCall('PUT', '/api/users/me/requests/' + fbId, {
                action: 'accept'
            });
        },
        sendFriendRequest: function (fbId) {
            return Recyclabears.__apiCall('POST', '/api/users/' + fbId + '/request');
        },
        deleteSentFriendRequest: function (fbId) {
            return Recyclabears.__apiCall('DELETE', '/api/users/me/sent-requests/' + fbId);
        },
        deleteFriendRequest: function (fbId) {
            return Recyclabears.__apiCall('DELETE', '/api/users/me/requests/' + fbId);
        },
        unFriend: function (fbId) {
            return Recyclabears.__apiCall('DELETE', '/api/users/me/friends/' + fbId);
        },


        /* New calls below */
        updateWallet: function (action, value) {
            return Recyclabears.__apiCall('PUT', '/api/users/me/wallet', {
                action: action,
                value: value
            });
        }
    }
}