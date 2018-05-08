import {friends as friends, getUser as getUser} from '../model/friends';
import * as express from 'express';

export function fetchFriends(req: express.Request, res: express.Response) {
    res.render('rank', {friends: friends});
};

export function fetchFriendsByScore(req: express.Request, res: express.Response) {
    res.render('rank', {friends: friends.sort(compareScore)});
};

export function fetchFriend(req: express.Request, res: express.Response) {
    const userId = req.params.id;
    res.render('rank/profile', {user: getUser(userId), userId: userId});
};

function compareScore(a,b) {
    if (a.score < b.score)
        return 1;
    if (a.score > b.score)
        return -1;
    return 0;
}
