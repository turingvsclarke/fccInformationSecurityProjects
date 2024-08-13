const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server.js');
var expect=chai.expect;

chai.use(chaiHttp);

suite('Functional Tests', () => {
    /// Test #1
    test('#singleStockGETRequest',function(done){
        chai.request(server).get('/api/stock-prices?stock=GOOG').end(
            // Check that res.body has stockData as a key
            // Check that that stockData has stock as a string, price as a number, and that likes =1
            (err,res)=>{
                expect(res.body).to.have.all.keys('stockData');
                let stockData=res.body.stockData;
                expect(res.body.stockData).to.have.all.keys('stock','price','likes');
                expect(stockData.stock).to.be.a('string')
                expect(stockData.price).to.be.a('number')
                expect(stockData.likes).to.be.a('number')
                assert.deepEqual(stockData.likes,0,'Looked up single stock')
            }
        );
        done();
    })

    // Test #2
    test('#singleStocksingleLikeGETRequest',function(done){
        chai.request(server).get('/api/stock-prices?stock=GOOG&like=true').end(
            (err,res)=>{
                expect(res.body).to.have.all.keys('stockData');
                let stockData=res.body.stockData;
                expect(res.body.stockData).to.have.all.keys('stock','price','likes');
                expect(stockData.stock).to.be.a('string')
                expect(stockData.price).to.be.a('number')
                expect(stockData.likes).to.be.a('number')
                assert.deepEqual(stockData.likes,1,'Looked up single stock w// single like')
            }
        );
        done();
    })

    // Test #3
    test('#doubleLikingStock',function(done){
        chai.request(server).get('/api/stock-prices?stock=GOOG&like=true').end(
            (err,res)=>{
                expect(res.body).to.have.all.keys('stockData');
                let stockData=res.body.stockData;
                expect(res.body.stockData).to.have.all.keys('stock','price','likes');
                expect(stockData.stock).to.be.a('string')
                expect(stockData.price).to.be.a('number')
                expect(stockData.likes).to.be.a('number')
                assert.deepEqual(stockData.likes,1,'Re-liked same stock')
            }
        );
        done();
    })

    // Test #4
    test('#twoStockGETRequest',function(done){
        chai.request(server).get('/api/stock-prices?stock=GOOG&stock=MSFT').end(
            (err,res)=>{
                expect(res.body).to.have.all.keys('stockData');
                let stockData=res.body.stockData;
                expect(stockData).to.be.a('array');
                expect(res.body.stockData[0]).to.have.all.keys('stock','price','rel_likes');
                expect(res.body.stockData[1]).to.have.all.keys('stock','price','rel_likes');
                expect(stockData[0].stock).to.be.a('string')
                expect(stockData[0].price).to.be.a('number')
                expect(stockData[0].rel_likes).to.be.a('number')
                expect(stockData[1].stock).to.be.a('string')
                expect(stockData[1].price).to.be.a('number')
                expect(stockData[1].rel_likes).to.be.a('number')

                assert.deepEqual(stockData[0].rel_likes,0,'Looked up two stocks')
                assert.deepEqual(stockData[1].rel_likes,0,'Looked up two stocks')             
            }
        );
        done();
    })

    // Test #5
    test('#doubleStockLikeGETRequest',function(done){
        chai.request(server).get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true').end(
            (err,res)=>{
                expect(res.body).to.have.all.keys('stockData');
                let stockData=res.body.stockData;
                expect(stockData).to.be.a('array');
                expect(res.body.stockData[0]).to.have.all.keys('stock','price','rel_likes');
                expect(res.body.stockData[1]).to.have.all.keys('stock','price','rel_likes');
                expect(stockData[0].stock).to.be.a('string')
                expect(stockData[0].price).to.be.a('number')
                expect(stockData[0].rel_likes).to.be.a('number')
                expect(stockData[1].stock).to.be.a('string')
                expect(stockData[1].price).to.be.a('number')
                expect(stockData[1].rel_likes).to.be.a('number')

                assert.deepEqual(stockData[0].rel_likes,1,'Looked up two stocks')
                assert.deepEqual(stockData[1].rel_likes,-1,'Looked up two stocks')             
            }
        );
        done();
    })  

});
