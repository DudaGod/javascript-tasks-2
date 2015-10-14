'use strict';

var phoneBook = [];

function isPhoneBookEmpty() {
    if (!phoneBook.length) {
        console.log('Sorry, phone book is empty.');
        return true;
    }
    return false;
}

function getQueryRegExp(query) {
    var queryRegExp = query.replace(/[^A-zА-я0-9_-\s]/g, "\\$&");
    return queryRegExp;
}

/**
 * @constructor
 * @param {String} name
 * @param {String} phone
 * @param {String} email
 */
var Phone = function(name, phone, email) {
    this._name = name;
    this._phone = phone;
    this._email = email;
};

Phone.prototype.show = function () {
    console.log(this._name + ', ' + this._phone + ', ' + this._email);
};

Phone.prototype.search = function (query) {
    return ~this._name.search(query) || ~this._phone.search(query) || ~this._email.search(query);
};

Phone.prototype.remove = function () {
    delete this._name;
    delete this._phone;
    delete this._email;
};

Phone.prototype.maxLength = function () {
    return Math.max(Math.max(this._name.length, this._phone.length), this._email.length);
};

Phone.prototype.getValues = function () {
    var arr = [];
    arr.push(this._name);
    arr.push(this._phone);
    arr.push(this._email);
    return arr;
};

function isNameValid(name) {
    var namePattern = /(?:[A-zА-я0-9]+\s?)+/;
    return namePattern.test(name);
}

function isPhoneValid(phone) {
    var phonePattern = /^\+?\d{0,4}\s?(?:\d{3}|\(\d{3}\))\s?\d{3}[\s-]?\d[\s-]?\d{3}$/;
    return phonePattern.test(phone);
}

function isEmailValid(email) {
    var emailPattern = /^[a-zа-я0-9](?:\.?[a-zа-я0-9-_]+)+@(?:[a-zа-я0-9][-_a-zа-я0-9]+\.)+[a-zа-я]{2,4}$/;
    return emailPattern.test(email);
}


module.exports.add = function add(name, phone, email) {
    if (isNameValid(name) && isPhoneValid(phone) && isEmailValid(email)) {
        phoneBook.push(new Phone(name, phone, email));
    }
};

module.exports.find = function find(query) {
    if (isPhoneBookEmpty()) {
        return;
    } else if (!arguments.length) {
        phoneBook.forEach(function (item) {
            item.show();
        });
        return;
    }

    var queryRegExp = getQueryRegExp(query);
    var isFindEntry = false;

    phoneBook.forEach(function (item) {
        if (item.search(queryRegExp)) {
            isFindEntry = true;
            item.show();
        }
    });
    if (!isFindEntry) {
        console.log('Sorry, this query - ' + query + ' doesn\'t exist in phone book');
    }
};

module.exports.remove = function remove(query) {
    if (!arguments.length) {
        return;
    }

    var queryRegExp = getQueryRegExp(query);
    console.log('List of removed entries, which contains query - ' + query + ':');
    phoneBook.forEach(function (item, i) {
        if (item.search(queryRegExp)) {
            item.show();
            item.remove();
            phoneBook.splice(i, 1);
        }
    });
};

module.exports.importFromCsv = function importFromCsv(filename) {
    var data = require('fs').readFileSync(filename, 'utf-8');

    var dataStrings = data.split('\n');
    for (var i = 0; i < dataStrings.length; i++) {
        if (!dataStrings[i].length) {
            dataStrings.splice(i, 1);
            break;
        }
        var dataElement = dataStrings[i].split(';');
        if (dataElement.length === 3) {
            module.exports.add(dataElement[0], dataElement[1], dataElement[2]);
        }
    }
};

module.exports.showTable = function showTable() {
    if (isPhoneBookEmpty()) {
        return;
    }

    var heightTable = phoneBook.length * 2 + 7;
    var lengthCell = 0;

    phoneBook.forEach(function (item) {
        lengthCell = Math.max(lengthCell, item.maxLength());
    });

    lengthCell += 4;
    var lengthLine = lengthCell + 2;
    var currentHeight = 0;
    var defaultArr = ['Имя', 'Телефон', 'email'];
    var indexPhoneBook = 0;

    while (currentHeight++ < heightTable) {
        if (currentHeight === 1 || currentHeight === 5 || currentHeight === heightTable) {
            outputSolidLine(lengthLine);
        } else if (currentHeight === 3) {
            outputLineWithValues(lengthCell, defaultArr);
        } else if (currentHeight % 2) {
            outputLineWithValues(lengthCell, phoneBook[indexPhoneBook++].getValues());
        } else {
            outputEmptyLine(lengthCell);
        }
    }
};

function outputSolidLine(length) {
    var count = 0;
    while (count++ < 3) {
        for (var i = 0; i < length; i++) {
            process.stdout.write('=');
        }
    }
    process.stdout.write('\n');
}

function outputEmptyLine(length) {
    process.stdout.write('|');
    var count = 0;
    while (count++ < 3) {
        for (var i = 0; i < length; i++) {
            process.stdout.write(' ');
        }
        process.stdout.write('|');
    }
    process.stdout.write('\n');
}

function outputLineWithValues(length, array) {
    var count = 0;
    var currentLength;
    while (count < 3) {
        currentLength = 0;
        process.stdout.write('|  ');
        process.stdout.write(array[count]);
        currentLength = array[count].length + 2;

        for (var i = currentLength; i < length; i++) {
            process.stdout.write(' ');
        }
        count++;
    }
    process.stdout.write('|\n');
}
