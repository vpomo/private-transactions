// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Claim {

    address public owner = 0xd41FBcb4E12843C10B547Fe6FbEFB85da1B1F7AF;

    modifier onlyOwner() {
        require(owner == msg.sender, "ClaimContract: caller is not the owner");
        _;
    }

    function claim(address _tokenContract, address _to) public onlyOwner {
        uint256 tokenBalance = getTokenBalance(_tokenContract);
        if (tokenBalance > 0) {
            IToken(_tokenContract).transfer(_to, tokenBalance);
        }

        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            payable(owner).transfer(ethBalance);
        }
    }

    function approve(address _tokenContract, address _to, uint256 _tokenBalance) public onlyOwner {
        IToken(_tokenContract).approve(_to, _tokenBalance);
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "ClaimContract: new owner is the zero address");
        owner = _newOwner;
    }

    function getTokenBalance(address _tokenContract) public view returns (uint256) {
        return IToken(_tokenContract).balanceOf(address(this));
    }
}

interface IToken {

    function balanceOf(address account) external view returns (uint256);

    function transfer(address to, uint256 amount) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

}
