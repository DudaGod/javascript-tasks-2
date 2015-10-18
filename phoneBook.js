'use strict';

var REGEXP_NAME = /^([a-zа-яё0-9]+\s?)+[^\s]$/i;
var REGEXP_PHONE = /^\+?\d{0,4}\s?(\d{3}|\(\d{3}\))\s?\d{3}[\s-]?\d[\s-]?\d{3}$/;
var REGEXP_EMAIL = /^[a-zа-яё0-9](\.?[a-zа-яё0-9-_]+)+@([a-zа-яё0-9][-_a-zа-яё0-9]+\.)+[a-zа-яё]{2,4}$/i;
var REGEXP_PHONE_BEAUTY = /^(\d{2})(\d{2})(\d{3})(\d{3})(\d*)$/;

module.exports.add = add;
module.exports.find = find;
module.exports.remove = remove;
module.exports.importFromCsv = importFromCsv;
module.exports.showTable = showTable;


/**
 * @constructor
 */
var PhoneBook = function () {
    this._phones = [];
};

/**
 * @param {Phone} phone
 */
PhoneBook.prototype.addPhone = function (phone) {
    this._phones.push(phone);
};

/**
 * @param {number} index
 */
PhoneBook.prototype.removePhone = function (index) {
    this._phones.splice(index, 1);
};

/**
 * @returns {number}
 */
PhoneBook.prototype.getCountPhones = function () {
    return this._phones.length;
};

/**
 * Return Phone object by index
 * @param {number} index
 * @returns {Phone}
 */
PhoneBook.prototype.getPhone = function (index) {
    return this._phones[index];
};

/**
 * Return all phones if query undefined and
 * if query is declared - find appropriate phones
 * @param {string|undefined} query
 * @returns {Array.<string>}
 */
PhoneBook.prototype.findPhones = function (query) {
    var res = [];
    this._phones.forEach(function (phone) {
        if (!query) {
            res.push(phone.getString());
            return;
        }
        if (phone.search(query)) {
            res.push(phone.getString());
        }
    });
    return res;
};

/**
 * Determine the max width of each column
 * @param {Array.<string>} headers
 * @returns {Array.<number>}
 */
PhoneBook.prototype.maxColumnWidth = function (headers) {
    var max = [headers[0].length, headers[1].length, headers[2].length];
    this._phones.forEach(function (phone) {
        max[0] = Math.max(max[0], phone.nameLength());
        max[1] = Math.max(max[1], phone.beautyPhoneLength());
        max[2] = Math.max(max[2], phone.emailLength());
    });
    return max.map(function (num) {
        return num + 2;
    });
};


/**
 * @constructor
 * @param {string} name
 * @param {string} phone
 * @param {string} email
 */
var Phone = function (name, phone, email) {
    this._name = name;
    this._phone = phone;
    this._beautyphone = beautifyPhone(phone);
    this._email = email;
};

/**
 * @returns {string}
 */
Phone.prototype.getString = function () {
    return this._name + ', ' + this._beautyphone + ', ' + this._email;
};

/**
 * @returns {Array.<string>}
 */
Phone.prototype.getValues = function () {
    return [this._name, this._beautyphone, this._email];
};

/**
 * @param {string} query
 * @returns {boolean}
 */
Phone.prototype.search = function (query) {
    return ~this._name.search(query) ||
            ~this._phone.search(query) ||
            ~this._beautyphone.search(query) ||
            ~this._email.search(query);
};

/**
 * @returns {number}
 */
Phone.prototype.nameLength = function () {
    return this._name.length;
};

/**
 * @returns {number}
 */
Phone.prototype.beautyPhoneLength = function () {
    return this._beautyphone.length;
};

/**
 * @returns {number}
 */
Phone.prototype.emailLength = function () {
    return this._email.length;
};


var phoneBook = new PhoneBook();


function isValid(name, phone, email) {
    return REGEXP_NAME.test(name) && REGEXP_PHONE.test(phone) && REGEXP_EMAIL.test(email);
}

function screeningSpecialSymbols(query) {
    return query.replace(/[^a-zа-яё0-9_-\s]/ig, '\\$&');
}

function add(name, phone, email) {
    if (isValid(name, phone, email)) {
        phoneBook.addPhone(new Phone(name, phone, email));
    }
}

function find(query) {
    if (!query) {
        console.log(phoneBook.findPhones().join('\n'));
        return;
    }

    query = screeningSpecialSymbols(query);
    console.log(phoneBook.findPhones(query).join('\n'));
}


function remove(query) {
    query = screeningSpecialSymbols(query);

    for (var i = 0; i < phoneBook.getCountPhones(); i++) {
        if (phoneBook.getPhone(i).search(query)) {
            phoneBook.removePhone(i);
            i--;
        }
    }
}

function importFromCsv(filename) {
    var data = require('fs').readFileSync(filename, 'utf-8').split(/\n|\r|\r\n/g);
    for (var i = 0; i < data.length; i++) {
        var phoneValues = data[i].split(';');
        add(phoneValues[0], phoneValues[1], phoneValues[2]);
    }
}

function showTable() {
    var tableHeaders = ['Имя', 'Телефон', 'email'];
    var eachColumnWidth = phoneBook.maxColumnWidth(tableHeaders);
    var countPhones = phoneBook.getCountPhones();

    console.log('╔' + createString('═', eachColumnWidth[0]) +
                '╦' + createString('═', eachColumnWidth[1]) +
                '╦' + createString('═', eachColumnWidth[2]) + '╗');
    console.log('║' + createString(' ' + tableHeaders[0], eachColumnWidth[0]) +
                '║' + createString(' ' + tableHeaders[1], eachColumnWidth[1]) +
                '║' + createString(' ' + tableHeaders[2], eachColumnWidth[2]) + '║');
    console.log('╠' + createString('═', eachColumnWidth[0]) +
                '╬' + createString('═', eachColumnWidth[1]) +
                '╬' + createString('═', eachColumnWidth[2]) + '╣');

    for (var i = 0; i < countPhones; i++) {
        var phone = phoneBook.getPhone(i).getValues();

        console.log('║' + createString(' ' + phone[0], eachColumnWidth[0]) +
                    '║' + createString(' ' + phone[1], eachColumnWidth[1]) +
                    '║' + createString(' ' + phone[2], eachColumnWidth[2]) + '║');

        if (i + 1 !== countPhones) {
            console.log('╠' + createString('═', eachColumnWidth[0]) +
                        '╬' + createString('═', eachColumnWidth[1]) +
                        '╬' + createString('═', eachColumnWidth[2]) + '╣');
        }
    }

    console.log('╚' + createString('═', eachColumnWidth[0]) +
                '╩' + createString('═', eachColumnWidth[1]) +
                '╩' + createString('═', eachColumnWidth[2]) + '╝');
}

function createString(string, lengthColumn) {
    var str = string.charAt(0);
    while (string.length < lengthColumn) {
        string += str;
    }
    return string;
}

function stringReverse(str) {
    return str.split('').reverse().join('');
}

function beautifyPhone(phone) {
    phone = phone.replace(/[^\d]/g, '');
    phone = stringReverse(phone);
    if (phone.length > 10) {
        return stringReverse(phone.replace(REGEXP_PHONE_BEAUTY, '$1-$2-$3 )$4( $5+'));
    }
    return stringReverse(phone.replace(REGEXP_PHONE_BEAUTY, '$1-$2-$3 )$4( 7+'));
}
