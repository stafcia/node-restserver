///========================
//Puerto
//=========================
process.env.PORT = process.env.PORT || 3000;

///========================
//Entorno
//=========================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

///========================
//DB
//=========================
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb://cafe-user:123456a@ds151137.mlab.com:51137/cafe';
}

process.env.URLDB = urlDB;