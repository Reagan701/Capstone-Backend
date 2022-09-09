require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');

const app = express();
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const port = parseInt(process.env.PORT) || 3000;
const db = require('./config/dbconn');
const cors = require('cors');
const { errorHandeling } = require('./middleware/errorHandling');

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PATCH,PUT,DELETE');
    next();
})

app.use(router, cors(), express.json(), express.urlencoded({
    extended:true
}));

app.listen(port, ()=>{
    console.log('Server is Running at Port: '+port)
})

router.get('/', (req,res)=>{
    try{
        res.sendFile('./views/index.html', {root: __dirname})
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.get('/users', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM users';
            connection.query(query, (err,results)=>{
                if(err) throw err;
                res.json({
                    results: results
                });
            })
            connection.release();
            
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})
router.get('/users/:id', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM users WHERE userID = ?';
            connection.query(query, req.params.id, (err,results)=>{
                if(err) throw err;
                if(results.length>0){
                    res.json({
                        results: results
                    });
                }else{
                    res.json({
                        result: 'There is no user with that id'
                    })
                }
            })
            connection.release();
            
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})
router.get('/usercart', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM users INNER JOIN cart ON users.cartID=cart.cartID';
            connection.query(query, (err,results)=>{
                if(err) throw err;
                res.json({
                    results: results
                });
            })
            connection.release();
            
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})
router.get('/usercart/:id', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM users INNER JOIN cart ON users.cartID=cart.cartID WHERE users.cartID = ?';
            connection.query(query, req.params.id, (err,results)=>{
                if(err) throw err;
                res.json({
                    results: results
                });
            })
            connection.release();
            
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.get('/cart/:id', (req,res)=>{
    try{
        db.getConnection((err,connected)=>{
            if(err)throw err;
            const query = 'SELECT * FROM cart WHERE cartID = ?';
            connected.query(query, req.params.id, (err,results)=>{
                if(err)throw err;
                res.json({
                    results:results
                });
            })
            connected.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})
router.get('/cart/:id/cartItems', (req,res)=>{
    try{
        db.getConnection((err,connected)=>{
            if(err)throw err;
            const query = 'SELECT * FROM cart WHERE cartID = ?';
            connected.query(query, req.params.id, (err,results)=>{
                if(err)throw err;
                res.json({
                    results:JSON.parse(results[0].cartItems)
                });
            })
            connected.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})
router.get('/cart/:id/cartItems/:cartID', (req,res)=>{
    try{
        db.getConnection((err,connected)=>{
            if(err)throw err;
            const query = 'SELECT * FROM cart WHERE cartID = ?';
            connected.query(query, req.params.id, (err,results)=>{
                if(err)throw err;
                const item = JSON.parse(results[0].cartItems).filter((x)=> {return x.prodId == req.params.cartID})
                res.json({
                    results:item
                });
            })
            connected.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.delete('/cart/:id/cartItems/:cartID', (req,res)=>{
    try{
        db.getConnection((err,connected)=>{
            if(err)throw err;
            const query = 'SELECT * FROM cart WHERE cartID = ?';
            connected.query(query, req.params.id, (err,results)=>{
                if(err)throw err;
                const newCart = JSON.parse(results[0].cartItems).filter((x)=> {return x.prodId != req.params.cartID})
                for(let i = 0; i< newCart.length; i++){
                    newCart[i].prodId = i+1
                }
                const update = 'UPDATE cart SET cartItems = ? WHERE cartID = ?'

                connected.query(update, [JSON.stringify(newCart), req.params.id], (err,result)=>{
                    if(err)throw err;
                    res.json({
                        status:200,
                        results: result 
                    })
                })
            })
            connected.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.post('/cart/:id', bodyparser.json(), (req,res)=>{
    try{
        db.getConnection((err,connected)=>{
            if(err)throw err;
            const query = 'SELECT * FROM cart WHERE cartID = ?'
            connected.query(query,req.params.id, (err,result)=>{
                if(err)throw err;
                let cart = [];
                if(result[0].cartItems != null){
                    cart = JSON.parse(result[0].cartItems);
                }
                const item = {
                    prodId: cart.length+1,
                    prodName: req.body.prodName,
                    prodImg: req.body.prodImg,
                    prodDescription: req.body.prodDescription,
                    category: req.body.category,
                    price: req.body.price
                };
                cart.push(item);
                const cartQuery = 'UPDATE cart SET cartItems = ? WHERE cartID = ? '
                connected.query(cartQuery,[JSON.stringify(cart),req.params.id],(err,results)=>{
                    if(err)throw err;
                    res.json({
                        results:results
                    })
                });
            })
            connected.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.delete('/cart/:id', (req,res)=>{
    try{
        db.getConnection((err,connected)=>{
            if(err)throw err;
            const query = 'UPDATE cart SET cartItems = null WHERE cartID = ?';
            connected.query(query,req.params.id,(err,results)=>{
                if(err)throw err;
                res.json({
                    results:results
                });
            })
            connected.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.get('/userbilling', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM users INNER JOIN billingInfo ON users.userID = billingInfo.billingID';
            connection.query(query, (err,results)=>{
                if(err) throw err;
                res.json({
                    results: results
                });
            })
            connection.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.get('/users/:id/billing', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM users INNER JOIN billingInfo ON users.userID = billingInfo.billingID';
            connection.query(query, (err,results)=>{
                if(err) throw err;
                res.json({
                    results: results
                });
            })
            connection.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.get('/billing/:id', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM billingInfo WHERE billingID = ?';
            connection.query(query, req.params.id, (err,results)=>{
                if(err) throw err;
                res.json({
                    results: results
                });
            })
            connection.release();
            
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.put('/billing/:id',bodyparser.json(), (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err)throw err;
            const query = 'UPDATE billingInfo SET country = ?, billAddress = ?, city=?,postalCode = ? WHERE billingID = ?';
            connection.query(query, [req.body.country,req.body.billAddress,req.body.city,req.body.postalCode,req.params.id], (err,results)=>{
                if(err)throw err;
                res.json({
                    results:results
                })
            })
            connection.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.delete('/billing/:id',(req,res)=>{
    try{
        const query = 'UPDATE billingInfo SET country = null, billAddress = null, city=null,postalCode = null WHERE billingID = ?';
        db.getConnection((err,connected)=>{
            if(err)throw err;
            connected.query(query, req.params.id, (err,results)=>{
                if(err)throw err;
                res.json({
                    status:200,
                    results:results
                });
            })
            connected.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.get('/billing', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM billingInfo';
            connection.query(query, (err,results)=>{
                if(err) throw err;
                res.json({
                    results: results
                });
            })
            connection.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})
router.get('/cart', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM cart';
            connection.query(query, (err,results)=>{
                if(err) throw err;
                res.json({
                    results: results
                });
            })
            connection.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.get('/products', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM products';
            connection.query(query, (err,results)=>{
                if(err) throw err;
                res.json({
                    results: results
                });
            })
            connection.release();

        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.get('/products/:id', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM products WHERE prodId = ?';
            connection.query(query, req.params.id, (err,results)=>{
                if(err) throw err;
                if(results.length>0){
                    res.json({
                        results: results
                    });
                }else{
                    res.json({
                        result: 'There is no product with that id'
                    })
                }
            })
            connection.release();
            
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})
router.get('/productCategory/:category', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM products WHERE category = ?';
            connection.query(query, req.params.category, (err,results)=>{
                if(err) throw err;
                if(results.length>0){
                    res.json({
                        results: results
                    });
                }else{
                    res.json({
                        result: 'There are no products with that category'
                    })
                }
            })
            connection.release();
            
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

// Register a user

router.post('/users', bodyparser.json(), async (req,res)=>{
    try{
        db.getConnection((err,connected)=>{
            if(err)throw err;
            const check = 'SELECT userEmail FROM users WHERE userEmail = ?';
            connected.query(check, req.body.userEmail, async (err,results)=>{
                if(err)throw err;
                if(results.length > 0){
                    res.json({
                        status:400,
                        message: 'There is already a user with that email'
                    });
                }else{
                    try{
                        const salt = await bcrypt.genSalt();
                        req.body.userPassword = await bcrypt.hash(req.body.userPassword, salt);
                        try{
                            const query = 'INSERT INTO cart(cartItems) VALUES(null);INSERT INTO users(userID,firstName,lastName,userPassword,userEmail,phoneNumber,cartID) VALUES(LAST_INSERT_ID(),?,?,?,?,?,LAST_INSERT_ID());INSERT INTO billingInfo(billingID,userID) VALUES(LAST_INSERT_ID(), LAST_INSERT_ID());'
                            connected.query(query, [req.body.firstName,req.body.lastName,req.body.userPassword,req.body.userEmail,req.body.phoneNumber], (err,result)=>{
                                if(err) throw err;
                                res.json({
                                    result: result
                                })
                            });
                        }catch(e){
                            connected.release();
                            res.status(400).send(e.message)
                        }
                    }catch(e){
                        connected.release();
                        res.status(400).send(e.message)
                    }
                }
            })
            connected.release();
        })
    }catch(e){
        res.status(400).send(e.message)
    }
})

// Logins user
router.patch('/users', bodyparser.json(), (req,res)=>{
    try{
        const check = 'SELECT * FROM users WHERE userEmail = ?';
        try{
            db.getConnection((err,connected)=>{
                if(err) throw err;
                connected.query(check, req.body.userEmail, async(err,results)=>{
                    if(err)throw err;
                    if(results.length>0){
                        bcrypt.compare(req.body.userPassword,results[0].userPassword, (err,auth)=>{
                            if(auth){
                                const payload = {
                                    user:{
                                        userID: results[0].userID,
                                        firstName: results[0].firstName,
                                        lastName: results[0].lastName,
                                        userPassword: results[0].userPassword,
                                        userEmail: results[0].userEmail,
                                        address: results[0].address,
                                        phoneNumber: results[0].phoneNumber,
                                        cart: results[0].cart,
                                        userRole: results[0].userRole
                                    }
                                };
                                jwt.sign(payload,process.env.secret, (err,token)=>{
                                    if(err)throw err;
                                    res.json({
                                        status:200,
                                        token: token
                                    })
                                })
                            }else{
                                res.json({
                                    status:400,
                                    message: 'The entered password is incorrect'
                                })
                            }
                        })
                    }else{
                        res.json({
                            status:400,
                            message: 'There is no user with that email'
                        })
                    }
                })
                connected.release();
            })
        }catch(e){
            res.status(400).send(e.message);
        }
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.put('/users/:id', bodyparser.json(), async (req,res)=>{
    try{
        db.getConnection(async (err,connected)=>{
            if(err)throw err;
            const salt = await bcrypt.genSalt();
            req.body.userPassword = await bcrypt.hash(req.body.userPassword, salt);
            const check = 'UPDATE users SET firstName = ?, lastName = ?, userPassword = ?, userEmail = ?, phoneNumber = ? WHERE userID = ?';
            
            connected.query(check,[req.body.firstName, req.body.lastName, req.body.userPassword, req.body.userEmail, req.body.phoneNumber,req.params.id],(err,result)=>{
                if(err)throw err;
                res.json({
                    results:result
                })
            })
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

// Delete a user
router.delete('/users/:id',(req,res)=>{
    try{
        const query = 'DELETE FROM users WHERE userID = ?;DELETE FROM cart WHERE cartID = ?; ALTER TABLE cart AUTO_INCREMENT = 1; ALTER TABLE cart AUTO_INCREMENT = 1; ALTER TABLE users AUTO_INCREMENT = 1;';
        db.getConnection((err,connected)=>{
            if(err)throw err;
            connected.query(query, [req.params.id,req.params.id], (err,results)=>{
                if(err)throw err;
                res.json({
                    status:200,
                    results:results
                });
            })
            connected.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

// Delete a product
router.delete('/products/:id',(req,res)=>{
    try{
        const query = 'DELETE FROM products WHERE prodId = ?;ALTER TABLE products AUTO_INCREMENT = 1;';
        db.getConnection((err,connected)=>{
            if(err)throw err;
            connected.query(query, req.params.id, (err,results)=>{
                if(err)throw err;
                res.json({
                    status:200,
                    results:results
                });
            })
            connected.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.put('/products/:id', bodyparser.json(), (req,res)=>{
    try{
        const query = 'UPDATE products SET prodName = ?,  prodImg = ?, prodDescription = ?, category = ?, quantity = ?, price = ? WHERE prodId = ?';
        db.getConnection((err,connected)=>{
            if(err)throw err;
            connected.query(query,[req.body.prodName,req.body.prodImg, req.body.prodDescription,req.body.category,req.body.quantity, req.body.price, req.params.id], (err,results)=>{
                if(err)throw err;
                res.json({
                    results:results
                });
            })
            connected.release();
        })
    }catch(e){
        res.status(400).send(e.message)
    }
})

router.post('/products', bodyparser.json(), (req,res)=>{
    try{
        const query = 'INSERT INTO products(prodName,prodImg,prodDescription,category, quantity, price) VALUES(?,?,?,?,?,?)';
        db.getConnection((err,connected)=>{
            if(err)throw err;
            connected.query(query, [req.body.prodName,req.body.prodDescription,req.body.prodImg,req.body.category,req.body.quantity,req.body.price], (err,results)=>{
                if(err)throw err;
                res.json({
                    status:200,
                    results:results
                });
            })
            connected.release();
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.get('/verify', (req,res)=>{
    const token = req.header('x-auth-token');

    if(!token){
        res.json({
            status:400,
            message: 'There is no user logged in'
        });
    }else{
        jwt.verify(token,process.env.secret, (err,decodedToken)=>{
            if(err)throw err;
            res.json({
                decodedUser: decodedToken
            })
        })
    }
})

app.use(errorHandeling)