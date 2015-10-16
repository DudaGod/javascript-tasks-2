'use strict';

var REGEXP_NAME = /^([a-zа-яё0-9]+\s?)+[^\s]$/i;
var REGEXP_PHONE = /^\+?\d{0,4}\s?(?:\d{3}|\(\d{3}\))\s?\d{3}[\s-]?\d[\s-]?\d{3}$/;
var REGEXP_EMAIL = /^[a-zа-яё0-9](?:\.?[a-zа-яё0-9-_]+)+@(?:[a-zа-яё0-9][-_a-zа-яё0-9]+\.)+[a-zа-яё]{2,4}$/i;

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
 * @returns {string}
 */
PhoneBook.prototype.findPhones = function (query) {
    var str = '';
    this._phones.forEach(function (phone) {
        if (!query) {
            str += phone.getString() + '\n';
            return;
        }
        str += phone.search(query) ? phone.getString() + '\n' : '';
    });
    return str;
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

function add(name, phone, email) {
    if (isValid(name, phone, email)) {
        phoneBook.addPhone(new Phone(name, phone, email));
    }
}

function find(query) {
    if (!query) {
        console.log(phoneBook.findPhones());
        return;
    }

    query = query.replace(/[^a-zа-яё0-9_-\s]/ig, "\\$&");
    console.log(phoneBook.findPhones(query));
}


function remove(query) {
    query = query.replace(/[^a-zа-яё0-9_-\s]/ig, "\\$&");

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

function createString(str, lengthColumn) {
    var ch = str.charAt(0);
    while (str.length < lengthColumn) {
        str += ch;
    }
    return str;
}

function beautifyPhone(phone) {
    phone = phone.replace(/[()+-\s]/g, '');
    var length = phone.length;
    var beauty = [];

    for (var i = 2, j = 2; Math.ceil(i / j) < 5; i += j) {
        beauty.unshift(phone.substr(length - i, j));
        if (i % j && Math.floor(i / j) < 3) {
            beauty.unshift(') ');
        }
        if (!(i % j)) {
            beauty.unshift('-');
            j += i > j ? 1 : 0;
        }

    }
    beauty.unshift(' (');
    if (phone.length > 10) {
        beauty.unshift(phone.slice(0, -10));
    }

    var begin = phone.length > 10 ? '+' : '+7';
    return  begin + beauty.toString().replace(/,/g, '');
}
