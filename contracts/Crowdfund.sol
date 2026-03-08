// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Crowdfund {

        // ─── DATA STRUCTURES ───────────────────────────────────

    struct Campaign {
        address owner;
        string title;
        uint256 goal;
        uint256 deadline;
        uint256 amountRaised;
        bool withdrawn;
    }
        // ─── STATE VARIABLES ───────────────────────────────────

        uint256 public campaignCount;
        mapping(uint256 => Campaign) public campaigns;
        mapping(uint256 => mapping(address => uint256)) public contributions;
  
        // ─── EVENTS ────────────────────────────────────────────

        event CampaignCreated(uint256 id, address owner, string title, uint256 goal, uint256 deadline);
        event Contributed(uint256 id, address contributer, uint256 amount);
        event Withdrawn(uint256 id, address owner, uint256 amount);
        event Refunded(uint256 id, address contributer, uint256 amount);

            // ─── FUNCTIONS ─────────────────────────────────────────

        function createCampaign(
            string memory title,
            uint256 goal,
            uint256 durationInDays
        )external{
            require(goal > 0, "Goal must be greater than 0");
            require(durationInDays > 0, "Duration must be greater than 0");

            uint256 deadline = block.timestamp + (durationInDays * 1 days);

            campaigns[campaignCount] = Campaign({
                owner: msg.sender,
                title: title,
                goal: goal,
                deadline: deadline,
                amountRaised: 0,
                withdrawn: false
            });
            emit CampaignCreated(campaignCount, msg.sender, title, goal, deadline);
            campaignCount++;
        }

        function contribute(uint256 campaignId) external payable{
            Campaign storage campaign = campaigns[campaignId];

            require(block.timestamp < campaign.deadline, "Campaign has ended");
            require(msg.value > 0, "Contribution must be greater than 0");

            campaign.amountRaised += msg.value;
            contributions[campaignId][msg.sender] += msg.value;

            emit Contributed(campaignId, msg.sender, msg.value);

        }

        function withdraw(uint256 campaignId) external{
            Campaign storage campaign = campaigns[campaignId];

            require(msg.sender == campaign.owner, "Only owner can withdraw");
            require(block.timestamp >= campaign.deadline, "campaign still active");
            require(campaign.amountRaised >= campaign.goal, "Goal not reached");
            require(!campaign.withdrawn, "Already withdrawn");

            campaign.withdrawn = true;
            uint256 amount = campaign.amountRaised;
            payable(campaign.owner).transfer(amount);

            emit Withdrawn(campaignId, campaign.owner, amount);
        }

        function refund(uint256 campaignId) external{
            Campaign storage campaign = campaigns[campaignId];

            require(block.timestamp >= campaign.deadline, "Campiagn still active");
            require(campaign.amountRaised < campaign.goal, "Goal was reached, no refund");
            
            uint256 contributed = contributions[campaignId][msg.sender];
            require(contributed > 0, "Nothing to refund");

            contributions[campaignId][msg.sender] = 0;
            payable(msg.sender).transfer(contributed);

            emit Refunded(campaignId, msg.sender, contributed);
        }


        function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
            return campaigns[campaignId];
        }
}