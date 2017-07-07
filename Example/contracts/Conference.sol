/*Solidity contract for a Conference where registrants can buy tickets,
and the organizer can set a maximum quota of attendees as well as provide refunds*/
pragma solidity ^ 0.4 .4;

contract Conference {
  address public organizer;
  address public speaker;
  mapping(address => uint) public registrantsPaid;
  uint public quota;

  uint public numRegistrants;

  // Constructor
  function Conference(address add) {
    speaker = add;
    organizer = msg.sender;
    quota = 500;
    numRegistrants = 0;
  }

  function changeQuota(uint newquota) public {
    if (msg.sender != organizer) {
      return;
    }
    quota = newquota;
  }

  function buyTicket() public payable returns(bool success) {
    if (numRegistrants >= quota) {
      return false;
    }
    registrantsPaid[msg.sender] = msg.value;
    numRegistrants++;
    return true;
  }

  function buyMultiple(uint num) public payable returns(bool success) {
    if (numRegistrants + num >= quota) {
      return false;
    }
    registrantsPaid[msg.sender] = msg.value;
    numRegistrants += num;
    return true;
  }

  function refundTicket(address recipient, uint amount) public {
    if (msg.sender != organizer) {
      return;
    }
    if (registrantsPaid[recipient] == amount) {
      address myAddress = this;
      if (myAddress.balance >= amount) {
        if (!recipient.send(amount)) throw;
        registrantsPaid[recipient] = 0;
        numRegistrants--;
      }
    }
  }

  function destroy() { // so funds not locked in contract forever
    if (msg.sender == organizer) {
      address myAddress = this;
      uint amount = (myAddress.balance * 80) / 100;
      if (!speaker.send(amount)) throw;
      suicide(organizer); // send funds to organizer
    }
  }
}