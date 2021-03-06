import * as mongo from 'mongodb'

export interface User {
    _id: mongo.ObjectID;
    fbId: string;
    friends: UserFriends;
    name: string;
    email: string;
    wallet: number;
    inventory: UserItem[];
}

interface UserFriends {
    list: string[];
    reqSent: string[];
    reqReceived: string[];
}

interface UserItem {
    name: string;
    quantity: number;
    image: string;  // path to image
    type: string;   // for classification
    bin_type: string;   // type of bin (if item is a bin)
}