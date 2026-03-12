import { Router, Request, Response } from "express";
import { abi, getContractAddress, publicClient, walletClient } from "./contract";
import { parseEther } from "viem";

const router = Router();



// ─── GET ALL CAMPAIGNS ─────────────────────────────────
router.get("/campaigns", async (req: Request, res: Response) => {
  console.log("Using contract:", getContractAddress());  // add this line
  try {
    const count = await publicClient.readContract({
      address: getContractAddress(),
      abi,
      functionName: "campaignCount",
    }) as bigint;

    const campaigns = [];

    for (let i = 0n; i < count; i++) {
      const campaign = await publicClient.readContract({
        address: getContractAddress(),
        abi,
        functionName: "getCampaign",
        args: [i],
      }) as any;

      campaigns.push({
        id: i.toString(),
        owner: campaign.owner,
        title: campaign.title,
        goal: campaign.goal.toString(),
        deadline: campaign.deadline.toString(),
        amountRaised: campaign.amountRaised.toString(),
        withdrawn: campaign.withdrawn,
      });
    }

    res.json({ success: true, campaigns });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// ─── GET ONE CAMPAIGN ──────────────────────────────────
router.get("/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    const campaign = await publicClient.readContract({
      address: getContractAddress(),
      abi,
      functionName: "getCampaign",
      args: [BigInt(id)],
    }) as any;

    res.json({
      success: true,
      campaign: {
        id,
        owner: campaign[0],
        title: campaign[1],
        goal: campaign[2].toString(),
        deadline: campaign[3].toString(),
        amountRaised: campaign[4].toString(),
        withdrawn: campaign[5],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── CREATE CAMPAIGN ───────────────────────────────────
router.post("/campaigns", async (req: Request, res: Response) => {
  try {
    const { title, goalInEth, durationInDays } = req.body;

    if (!title || !goalInEth || !durationInDays) {
      res.status(400).json({ success: false, error: "title, goalInEth and durationInDays are required" });
      return;
    }

    const hash = await walletClient.writeContract({
      address: getContractAddress(),
      abi,
      functionName: "createCampaign",
      args: [title, parseEther(goalInEth.toString()), BigInt(durationInDays)],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    res.json({
      success: true,
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── CONTRIBUTE TO CAMPAIGN ────────────────────────────
router.post("/campaigns/:id/contribute", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { amountInEth } = req.body;

    if (!amountInEth) {
      res.status(400).json({ success: false, error: "amountInEth is required" });
      return;
    }

    const hash = await walletClient.writeContract({
      address: getContractAddress(),
      abi,
      functionName: "contribute",
      args: [BigInt(id)],
      value: parseEther(amountInEth.toString()),
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    res.json({
      success: true,
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;