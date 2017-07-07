/*refund money to passengers for delayed flights*/
pragma solidity ^ 0.4 .4;

contract Flight {
    address public airline_owner;
    mapping(address => uint) public flightBookings;
    uint public capacity;
    uint public scheduledDepartTime;
    uint public actualDepartTime;

    address[] public passengers;

    uint public passengerCount;

    // Constructor
    function Flight() {
        airline_owner = msg.sender;
        capacity = 100;
        passengerCount = 0;
        scheduledDepartTime = 1600;
        passengers = new address[](100);
    }

    function departure(uint newtime) public {
        /* check whether message sender is owner or not and
        update actualDepartTime with newtime*/
        if (msg.sender != airline_owner) {
            return;
        }
        actualDepartTime = newtime;
    }

    function bookTicket() public payable returns(bool success) {

        /* capacity should not exceed,
        book flight ticket,
        increase passenger count,
        store passenger address in passengers array*/
        if (passengerCount >= capacity) {
            return false;
        }
        flightBookings[msg.sender] = msg.value;
        passengers[passengerCount] = msg.sender;
        //passengers.push(msg.sender);
        passengerCount++;
        return true;
    }


    function refundTicket(address recipient, uint amount) public {
        if (msg.sender != airline_owner) {
            return;
        }
        if (flightBookings[recipient] == amount) {
            address myAddress = this;
            if (myAddress.balance >= amount) {
                if (!recipient.send(amount)) throw;
                flightBookings[recipient] = 0;
                for (uint i = 0; i < passengerCount; i++) {
                    if (passengers[i] == recipient){
                        passengers[i] = address(0);
                        break;
                    }
                }
                passengerCount--;
            }
        }
    }



    function destroy() { // so funds not locked in contract forever
        if (msg.sender == airline_owner) {

            /* check whether actualDepartTime is greater than scheduledDepartTime 
            if yes, refund 50% amount to all passengers
            */
            if (actualDepartTime > scheduledDepartTime) {
                address myAddress = this;
                uint amount = (myAddress.balance / 2) / passengerCount;
                for (uint i = 0; i < passengerCount; i++) {
                    if(passengers[i] == address(0)) continue;
                    if (!passengers[i].send(amount)) throw;
                }
            }
            suicide(airline_owner); // send funds to airline_owner
        } //end of owner check
    } //end of destroy

} //end of Flight