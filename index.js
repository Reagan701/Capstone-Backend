require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');

const app = express();
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const port = parseInt(process.env.PORT) || 3000;
const db = require('./config/dbconn');

app.use(router);

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
            const query = 'SELECT * FROM users WHERE id = ?';
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
router.get('/users/cart', (req,res)=>{
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

router.get('/users/:id/cart', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM users INNER JOIN cart ON users.cartID = cart.cartID WHERE userID = ?';
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

router.get('/users/billing', (req,res)=>{
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
router.get('/billing', (req,res)=>{
    try{
        db.getConnection((err,connection)=>{
            if(err) throw err;
            const query = 'SELECT * FROM billingInfo INNER JOIN billingInfo ON users.userID = billingInfo.billingID';
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
            const query = 'SELECT * FROM products WHERE id = ?';
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
                                        id: results[0].id,
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

// Delete a user
router.delete('/users/:id',(req,res)=>{
    try{
        const query = 'DELETE FROM users WHERE id = ?;ALTER TABLE products AUTO_INCREMENT = 1;';
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

// Delete a product
router.delete('/products/:id',(req,res)=>{
    try{
        const query = 'DELETE FROM products WHERE id = ?;ALTER TABLE products AUTO_INCREMENT = 1;';
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

router.patch('/products/:id', bodyparser.json(), (req,res)=>{
    try{
        const query = 'UPDATE products SET prodName = ?,  prodImg = ?, prodDescription, quantity = ?, price = ?';
        db.getConnection((err,connected)=>{
            if(err)throw err;
            connected.query(query,[req.body.prodName,req.body.prodImg, req.body.prodDescription,req.body.quantity, req.body.price], (err,results)=>{
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
        const query = 'INSERT INTO products(prodName,prodImg,prodDescription,category, quantity, price ) VALUES(?,?,?,?,?,?)';
        db.getConnection((err,connected)=>{
            if(err)throw err;
            connected.query(query, [req.body.prodName,req.body.prodDescription,req.body.category,req.body.quantity,req.body.price], (err,results)=>{
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