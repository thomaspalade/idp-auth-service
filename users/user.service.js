const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;
const axios = require('axios')

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update
};

async function authenticate({ email, password }) {
    const user = await User.findOne({ email });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
        return {
            ...user.toJSON(),
            token
        };
    }
}

async function getAll() {
    return await User.find();
}

async function getById(id) {
    // console.log(id);
    return await User.findById(id);
}

async function create(userParam) {
    // validate
    if (await User.findOne({ email: userParam.email })) {
        throw 'email "' + userParam.email + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    const hashedPassword = bcrypt.hashSync(userParam.password, 10)
    if (userParam.password) {
        console.log(userParam.password); 
        user.hash = hashedPassword;
    }

    // save user
    try {
        await user.save();
        try {
            // insert profile for freshly created user
            axios.post('http://localhost:9998/profiles', {
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                hash: hashedPassword
            }).then(res => {
                console.log(`statusCode: ${res.statusCode}`);
                // console.log(res);
            }).catch(error => {
                console.error(error);
            });
        } catch (err) {
            console.log("Error: The profile for user couldn't be saved.")
        }
    } catch (err) {
        console.log(err);
        console.log("Error: The user account couldn't be saved.")
    }
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.email !== userParam.email && await User.findOne({ email: userParam.email })) {
        throw 'email "' + userParam.email + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);
    const updatedUser = await user.save();
}