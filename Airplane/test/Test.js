var Flight = artifacts.require("./Flight.sol");

contract('Flight', function (accounts) {

    // 1st testcase
    it("Initial Flight settings should match", function (done) {
        var flight = Flight.at(Flight.address);
        Flight.new({
            from: accounts[0]
        }).then(
            function (flight) {
                flight.capacity.call().then(
                    function (capacity) {
                        assert.equal(capacity, 100, "capacity doesn't match!");
                    }).then(function () {
                    return flight.passengerCount.call();
                }).then(function (num) {
                    assert.equal(num, 0, "passengerCount should be zero!");
                    return flight.airline_owner.call();
                }).then(function (airline_owner) {
                    assert.equal(airline_owner, accounts[0], "airline_owner doesn't match!");
                    done(); // to stop these tests earlier, move this up
                }).catch(done);
            }).catch(done);
    });

    // 2nd testcase
    it("Should update Flight Time", function (done) {
        Flight.new({
            from: accounts[0]
        }).then(
            function (flight) {
                flight.scheduledDepartTime.call().then(
                    function (scheduledDepartTime) {
                        assert.equal(scheduledDepartTime, 1600, "scheduledDepartTime doesn't match!");
                    }).then(
                    function () {
                        return flight.departure(1800);
                    }).then(
                    function (result) {
                        // console.log(result); 
                        // printed will be a long hex, the transaction hash
                        return flight.actualDepartTime.call();
                    }).then(
                    function (actualDepartTime) {
                        assert.equal(actualDepartTime, 1800, "actualDepartTime is not changed!");
                        done();
                    }).catch(done);
            }).catch(done);
    });

    //  3rd testcase
    it("Should let you buy a ticket", function (done) {
        var acc8initialBalance = web3.eth.getBalance(accounts[8]).toNumber();

        Flight.new({
            from: accounts[0]
        }).then(
            function (flight) {
                var ticketPrice = web3.toWei(1, 'ether');
                var initialBalance = web3.eth.getBalance(flight.address).toNumber();
                flight.bookTicket({
                        from: accounts[8],
                        value: ticketPrice
                    })
                    .then(
                        function () {
                            var acc8newBalance = web3.eth.getBalance(accounts[8]).toNumber();
                            var newBalance = web3.eth.getBalance(flight.address).toNumber();
                            var difference = newBalance - initialBalance;
                            // console.log("acc8initialBalance" + acc8initialBalance);
                            // console.log("acc8newBalance" + acc8newBalance);
                            // console.log("difference" + difference);
                            assert.equal(difference, ticketPrice, "Difference should be what was sent");
                            return flight.passengerCount.call();
                        }).then(
                        function (num) {
                            assert.equal(num, 1, "there should be 1 registrant");
                            return flight.flightBookings.call(accounts[8]);
                        }).then(function (amount) {
                        assert.equal(amount.toNumber(), ticketPrice, "Sender's paid but is not listed");
                        done();
                    }).catch(done);
            }).catch(done);
    });

    // 4th testcase
    it("Should issue a refund by owner only", function (done) {
        Flight.new({
            from: accounts[0]
        }).then(
            function (flight) {
                var ticketPrice = web3.toWei(.05, 'ether');
                var initialBalance = web3.eth.getBalance(flight.address).toNumber();
                flight.bookTicket({
                    from: accounts[1],
                    value: ticketPrice
                }).then(
                    function () {
                        var newBalance = web3.eth.getBalance(flight.address).toNumber();
                        var difference = newBalance - initialBalance;
                        assert.equal(difference, ticketPrice, "Difference should be what was sent");
                        // Now try to issue refund as second user - should fail
                        return flight.refundTicket(accounts[1], ticketPrice, {
                            from: accounts[1]
                        });
                    }).then(function () {
                    var balance = web3.eth.getBalance(flight.address).toNumber();
                    assert.equal(web3.toBigNumber(balance), ticketPrice, "Balance should be unchanged");
                    // Now try to issue refund as owner - should work
                    return flight.refundTicket(accounts[1], ticketPrice, {
                        from: accounts[0]
                    });
                }).then(function () {
                    var postRefundBalance = web3.eth.getBalance(flight.address).toNumber();
                    assert.equal(postRefundBalance, initialBalance, "Balance should be initial balance");
                    done();
                }).catch(done);
            }).catch(done);
    }); //end of 4th testcase


    //  5th testcase
    it("Destroy Contract & Check Balance", function (done) {
        var acc1initialBalance = web3.eth.getBalance(accounts[1]).toNumber();
        var acc2initialBalance = web3.eth.getBalance(accounts[2]).toNumber();
        console.log("acc1initialBalance-" + acc1initialBalance);
        console.log("acc2initialBalance-" + acc2initialBalance);

        Flight.new({
            from: accounts[0]
        }).then(
            function (flight) {
                var ticketPrice = web3.toWei(1, 'ether');
                var initialBalance = web3.eth.getBalance(flight.address).toNumber();
                flight.bookTicket({
                        from: accounts[1],
                        value: ticketPrice
                    })
                    .then(
                        function () {
                            var newBalance = web3.eth.getBalance(flight.address).toNumber();
                            var difference = newBalance - initialBalance;
                            console.log("booking 1st ticket");
                            var acc1newBalance = web3.eth.getBalance(accounts[1]).toNumber();
                            //console.log("acc1newBalance-"+acc1initialBalance);
                            console.log("contract initialBalance" + initialBalance);
                            console.log("contract newBalance" + newBalance);
                            console.log("difference" + difference);
                            assert.equal(difference, ticketPrice, "Difference should be what was sent");
                            flight.bookTicket({
                                    from: accounts[2],
                                    value: ticketPrice
                                })
                                .then(
                                    function () {
                                        var newBalance = web3.eth.getBalance(flight.address).toNumber();
                                        var difference = newBalance - initialBalance;
                                        console.log("booking 2nd ticket");
                                        var acc2newBalance = web3.eth.getBalance(accounts[2]).toNumber();
                                        console.log("acc2newBalance-"+acc2initialBalance);
                                        console.log("contract newBalance" + newBalance);
                                        console.log("difference" + difference);
                                        assert.equal(difference, 2 * ticketPrice, "Difference should be what was sent");
                                        flight.departure(1800).then(
                                            function () {
                                                //console.log(passingers);
                                                return flight.actualDepartTime.call();

                                            }).then(function (actualDepartTime) {
                                            console.log("actualDepartTime-" + actualDepartTime);
                                            assert.equal(actualDepartTime, 1800, "actualDepartTime is not changed!");

                                            flight.destroy({
                                                    from: accounts[0]
                                                })
                                                .then(
                                                    function () {
                                                        console.log("after destroy called");
                                                        var acc1newBalance = web3.eth.getBalance(accounts[1]).toNumber();
                                                        var acc2newBalance = web3.eth.getBalance(accounts[2]).toNumber();
                                                        console.log("acc1newBalance-" + acc1newBalance);
                                                        console.log("acc2newBalance-" + acc2newBalance);
                                                        done();
                                                    });

                                        }).catch(done);
                                    }).catch(done); // end of 2nd ticket buy
                        }).catch(done); // end of 1st ticket buy
            }).catch(done); //end of Flight.new result function 
    }); // end of testcase


});