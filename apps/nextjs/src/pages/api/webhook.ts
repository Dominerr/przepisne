import type { IncomingHttpHeaders } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { WebhookRequiredHeaders } from "svix";

import { Webhook } from "svix";

import { createContext } from "@acme/api/src/context";

const webhookSecret: string = process.env.WEBHOOK_SECRET ?? "";

export default async function handler(
  req: NextApiRequestWithSvixRequiredHeaders,
  res: NextApiResponse,
) {
  const payload = JSON.stringify(req.body);
  const headers = req.headers;
  // Create a new Webhook instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: any;
  try {
    // Verify the webhook payload and headers
    evt = wh.verify(payload, headers) as any;
  } catch (_) {
    // If the verification fails, return a 400 error
    return res.status(400).json({});
  }
  const { id, first_name, last_name } = evt.data;
  console.log("Received event:", evt);

  const trpc = await createContext({ req, res });
  console.log("trpc:", trpc);

  const eventType = evt.type;
  if (eventType === "user.created") {
    try {
      await trpc.prisma.user.create({
        data: {
          id: id,
          firstName: first_name,
          lastName: last_name,
        },
      });
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("User creation failed:", error);
      res.status(500).json({ error: `Something went wrong ${error}` });
    }
  }

  if (eventType === "user.deleted") {
    try {
      await trpc.prisma.user.delete({
        where: {
          id: id,
        },
      });
      res.status(204).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("User deletion failed:", error);
      res.status(500).json({ error: `Something went wrong ${error}` });
    }
  }
}

type NextApiRequestWithSvixRequiredHeaders = NextApiRequest & {
  headers: IncomingHttpHeaders & WebhookRequiredHeaders;
};
