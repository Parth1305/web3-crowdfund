import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

describe("Crowdfund", function () {

  async function deployCrowdfund() {
    const { viem, networkHelpers } = await network.connect();
    const [owner, contributor1, contributor2] = await viem.getWalletClients();
    const crowdfund = await viem.deployContract("Crowdfund");
    return { crowdfund, viem, networkHelpers, owner, contributor1, contributor2 };
  }

  // ─── CREATE CAMPAIGN ───────────────────────────────────

  describe("createCampaign", function () {

    it("should create a campaign with correct details", async function () {
      const { crowdfund } = await deployCrowdfund();

      await crowdfund.write.createCampaign(["Save the dogs", 5n * 10n ** 18n, 30n]);
      const campaign = await crowdfund.read.getCampaign([0n]);

      assert.equal(campaign.title, "Save the dogs");
      assert.equal(campaign.goal, 5n * 10n ** 18n);
      assert.equal(campaign.amountRaised, 0n);
      assert.equal(campaign.withdrawn, false);
    });

    it("should fail if goal is 0", async function () {
      const { crowdfund } = await deployCrowdfund();

      await assert.rejects(
        crowdfund.write.createCampaign(["Bad campaign", 0n, 30n])
      );
    });

    it("should fail if duration is 0", async function () {
      const { crowdfund } = await deployCrowdfund();

      await assert.rejects(
        crowdfund.write.createCampaign(["Bad campaign", 1n * 10n ** 18n, 0n])
      );
    });

  });

  // ─── CONTRIBUTE ────────────────────────────────────────

  describe("contribute", function () {

    it("should accept contributions and update amountRaised", async function () {
      const { crowdfund, contributor1 } = await deployCrowdfund();

      await crowdfund.write.createCampaign(["Save the dogs", 5n * 10n ** 18n, 30n]);

      await crowdfund.write.contribute([0n], {
        account: contributor1.account,
        value: 1n * 10n ** 18n
      });

      const campaign = await crowdfund.read.getCampaign([0n]);
      assert.equal(campaign.amountRaised, 1n * 10n ** 18n);
    });

    it("should fail if campaign has ended", async function () {
      const { crowdfund, networkHelpers, contributor1 } = await deployCrowdfund();

      await crowdfund.write.createCampaign(["Save the dogs", 5n * 10n ** 18n, 30n]);

      await networkHelpers.time.increase(31 * 24 * 60 * 60);

      await assert.rejects(
        crowdfund.write.contribute([0n], {
          account: contributor1.account,
          value: 1n * 10n ** 18n
        })
      );
    });

  });

  // ─── WITHDRAW ──────────────────────────────────────────

  describe("withdraw", function () {

    it("should allow owner to withdraw if goal is met", async function () {
      const { crowdfund, networkHelpers, contributor1, contributor2 } = await deployCrowdfund();

      await crowdfund.write.createCampaign(["Save the dogs", 2n * 10n ** 18n, 30n]);

      await crowdfund.write.contribute([0n], {
        account: contributor1.account,
        value: 1n * 10n ** 18n
      });
      await crowdfund.write.contribute([0n], {
        account: contributor2.account,
        value: 1n * 10n ** 18n
      });

      await networkHelpers.time.increase(31 * 24 * 60 * 60);

      await crowdfund.write.withdraw([0n]);

      const campaign = await crowdfund.read.getCampaign([0n]);
      assert.equal(campaign.withdrawn, true);
    });

    it("should fail if goal is not met", async function () {
      const { crowdfund, networkHelpers, contributor1 } = await deployCrowdfund();

      await crowdfund.write.createCampaign(["Save the dogs", 5n * 10n ** 18n, 30n]);

      await crowdfund.write.contribute([0n], {
        account: contributor1.account,
        value: 1n * 10n ** 18n
      });

      await networkHelpers.time.increase(31 * 24 * 60 * 60);

      await assert.rejects(
        crowdfund.write.withdraw([0n])
      );
    });

  });

  // ─── REFUND ────────────────────────────────────────────

  describe("refund", function () {

    it("should refund contributor if goal not met", async function () {
      const { crowdfund, networkHelpers, contributor1 } = await deployCrowdfund();

      await crowdfund.write.createCampaign(["Save the dogs", 5n * 10n ** 18n, 30n]);

      await crowdfund.write.contribute([0n], {
        account: contributor1.account,
        value: 1n * 10n ** 18n
      });

      await networkHelpers.time.increase(31 * 24 * 60 * 60);

      await crowdfund.write.refund([0n], {
        account: contributor1.account
      });

      const contribution = await crowdfund.read.contributions([0n, contributor1.account.address]);
      assert.equal(contribution, 0n);
    });

    it("should fail if goal was reached", async function () {
      const { crowdfund, networkHelpers, contributor1 } = await deployCrowdfund();

      await crowdfund.write.createCampaign(["Save the dogs", 1n * 10n ** 18n, 30n]);

      await crowdfund.write.contribute([0n], {
        account: contributor1.account,
        value: 1n * 10n ** 18n
      });

      await networkHelpers.time.increase(31 * 24 * 60 * 60);

      await assert.rejects(
        crowdfund.write.refund([0n], { account: contributor1.account })
      );
    });

  });

});