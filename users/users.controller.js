﻿const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const db = require('_helpers/db');
const User = db.User;

// routes
router.post('/authenticate', authenticate);
router.post('/updateUserData', updateUserData);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Email or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    // console.log(req);
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    console.log("here calling update function");
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

async function updateUserDataStuff(userData) {
    console.log(userData);
    const email = userData.email;
    const hash = userData.hash;
    console.log(hash);
    try {
        const updatedUser = await User.updateOne({"email": email}, { $set: { "hash" : hash }});
    } catch (err) {
        console.log(err);
    }
};


function updateUserData(req, res, next) {
    console.log("here calling updateUserData function");
    const body = req.body;
    console.log(body);
    updateUserDataStuff(body);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}