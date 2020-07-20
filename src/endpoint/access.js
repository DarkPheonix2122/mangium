/*
 *     Copyright (C) 2020   Floffah
 *     All rights reserved
 *
 *     See GNU GPL v3 license
 *
 *     See file copyright for individual contributors information
 *
 *     @author Floffah
 *     @link https://github.com/floffah/
 */

const Endpoint = require('../api/Endpoint');
const async = require('async');
const crypto = require('crypto');

let q = {
    user: require('../db/queries/sqlite/user'),
}

class Access extends Endpoint {
    constructor(props) {
        super(props, {
            path: '/access',
            types: ['post'],
            description: 'Get an access code from a usernarme and password.',
            errors: ["incoInfo", "incoReq", "notFound"],
            posts: [{
                username: "string",
                password: "string"
            }],
            returns: [{
                "access_code": "30 character string"
            }, {
                error: "error"
            }]
        });
    }

    run(reqinfo, info) {
        if(reqinfo.type === "post") {
            if(!info.username || !info.password) {
                return {
                    error: "incoInfo"
                };
            }
            let fetched = this.manager.getDbManager().getDbs().userDb.run(q.user.getUser()).get(info.username, info.password);
            if(fetched === undefined) {
                return {
                    error: "notFound"
                }
            }
            let exists = this.manager.getDbManager().getDbs().userDb.run(q.user.findAccess()).get(fetched.userid);
            if(exists && exists.token) {
                if(new Date(Date.parse(exists.expires)) < new Date()) {
                    this.manager.getDbManager().getDbs().userDb.run(q.user.deleteAccess()).run(exists.token);
                    let ac = crypto.randomBytes(256);
                    let achex = ac.toString("hex");
                    let expires = new Date();
                    expires.setDate(expires.getDate() + 1);
                    this.manager.getDbManager().getDbs().userDb.run(q.user.accessToken()).run(achex, fetched.userid, expires.toUTCString());
                    return {
                        "access_code": achex
                    }
                } else {
                    return {
                        "access_code": exists.token
                    }
                }
            } else {
                let ac = crypto.randomBytes(256);
                let achex = ac.toString("hex");
                let expires = new Date();
                expires.setDate(expires.getDate() + 1);
                this.manager.getDbManager().getDbs().userDb.run(q.user.accessToken()).run(achex, fetched.userid, expires.toUTCString());
                return {
                    "access_code": achex
                }
            }
        } else {
            return {
                error: "incoReq"
            }
        }
    }
}

module.exports = Access;
