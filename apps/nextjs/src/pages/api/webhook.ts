import type { IncomingHttpHeaders } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { WebhookRequiredHeaders } from "svix";

import { Webhook } from "svix";

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

  const eventType = evt.type;
  if (eventType === "user.created") {
    try {
      const response = await fetch(`/api/trpc/auth.createUser?batch=1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          0: {
            json: {
              id,
              firstName: first_name,
              lastName: last_name,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("User creation failed:", error);
      res.status(500).json({ error: `Something went wrong ${error}` });
    }
  }
}

type NextApiRequestWithSvixRequiredHeaders = NextApiRequest & {
  headers: IncomingHttpHeaders & WebhookRequiredHeaders;
};
